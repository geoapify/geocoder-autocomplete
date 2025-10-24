import { CalculationHelper } from "./helpers/calculation.helper";
import { DomHelper } from "./helpers/dom.helper";
import {
    BY_CIRCLE,
    BY_COUNTRYCODE,
    BY_GEOMETRY,
    BY_PLACE,
    BY_PROXIMITY,
    BY_RECT
} from "./helpers/constants";
import { Callbacks } from "./helpers/callbacks";
import { CategoryManager } from "./helpers/category.helper";
import { PlacesApiHelper } from './helpers/places-api.helper';
import { PlacesListManager, PlacesListCallbacks } from "./helpers/places-list.helper";
import { Category, GeocoderEventType } from "./types/external";

export class GeocoderAutocomplete {

    private inputElement: HTMLInputElement;
    private inputWrapper: HTMLElement;
    private componentWrapper: HTMLElement;
    private inputClearButton: HTMLElement;
    private autocompleteItemsElement: HTMLElement = null;

    /* Places list manager */
    private placesListManager: PlacesListManager;

    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    private focusedItemIndex: number;

    /* Current autocomplete items data (GeoJSON.Feature) */
    private currentItems: any;

    /* Current categories displayed in dropdown */
    private currentCategories: Category[] = [];

    /* Active request promise reject function. To be able to cancel the promise when a new request comes */
    private currentPromiseReject: any;

    /* Active place details request promise reject function */
    private currentPlaceDetailsPromiseReject: any;

    /* We set timeout before sending a request to avoid unnecessary calls */
    private currentTimeout: number;

    private callbacks = new Callbacks();

    private preprocessHook?: (value: string) => string;
    private postprocessHook?: (feature: any) => string;
    private suggestionsFilter?: (suggetions: any[]) => any[];

    private sendGeocoderRequestAlt?: (value: string, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>;
    private sendPlaceDetailsRequestAlt?: (feature: any, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>;
    private sendPlacesRequestAlt?: (category: string[], offset: number, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>;

    private geocoderUrl = "https://api.geoapify.com/v1/geocode/autocomplete";
    private placeDetailsUrl = "https://api.geoapify.com/v2/place-details";
    private placesApiUrl = "https://api.geoapify.com/v2/places";
    private ipGeolocationUrl = "https://api.geoapify.com/v1/ipinfo";

    private readonly categoryManager: CategoryManager;
    private currentPlacesPromiseReject?: any;
    private lastEscKeyTime?: number;
    private readonly DOUBLE_ESC_THRESHOLD = 500; // 500ms window for double-Esc

    private options: GeocoderAutocompleteOptions = {
        limit: 5,
        placesLimit: 20,
        debounceDelay: 100
    };

    constructor(container: HTMLElement, private apiKey: string, options?: GeocoderAutocompleteOptions) {
        this.constructOptions(options);

        this.componentWrapper = document.createElement("div");
        this.componentWrapper.classList.add("geoapify-geocoder-autocomplete-container");
        container.appendChild(this.componentWrapper);

        const cs = getComputedStyle(container);
        const parentMaxH = cs.maxHeight; // 'none' | '400px' | ...
        const parentH = cs.height;       // 'auto' | '123px' | ...

        // Priority:
        // 1. If parent has a max-height → inherit it
        // 2. Else if parent has a fixed height → use 100%
        // 3. Else → fallback to 400px
        if (parentMaxH && parentMaxH !== 'none') {
            this.componentWrapper.style.maxHeight = 'inherit';
        } else if (parentH && parentH !== 'auto' && parentH !== '0px') {
            this.componentWrapper.style.maxHeight = '100%';
        } else {
            this.componentWrapper.style.maxHeight = '400px';
        }

        this.inputElement = document.createElement("input");
        this.inputWrapper = DomHelper.createInputElement(this.inputElement, this.options, this.componentWrapper);
        this.addClearButton();

        this.addEventListeners();

        this.categoryManager = new CategoryManager();

        // Initialize places list manager with callbacks
        const placesCallbacks: PlacesListCallbacks = {
            onLoadMore: () => {
                return this.resendPlacesRequestForMore(true /* append */);
            },
            onPlacesUpdate: (places: GeoJSON.Feature[]) => {
                this.callbacks.notifyPlaces(places);
            },
            onPlaceSelect: (place: GeoJSON.Feature, index: number) => {
                this.callbacks.notifyPlaceSelect(place, index);

                // Auto-hide places list if option is enabled
                if (this.options.hidePlacesListAfterSelect) {
                    this.placesListManager.clearPlacesList();

                    if (place && place.properties && place.properties.formatted) {
                        this.clearCategory();
                        this.setValue(place.properties.formatted);
                    }
                }
            }
        };
        this.placesListManager = new PlacesListManager(this.componentWrapper, this.options, placesCallbacks);
    }

    public setType(type: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity' | null) {
        this.options.type = type;
    }

    public setLang(lang: SupportedLanguage | null) {
        this.options.lang = lang;
    }

    public setAddDetails(addDetails: boolean) {
        this.options.addDetails = addDetails;
    }

    public setSkipIcons(skipIcons: boolean) {
        this.options.skipIcons = skipIcons;
    }

    public setAllowNonVerifiedHouseNumber(allowNonVerifiedHouseNumber: boolean) {
        this.options.allowNonVerifiedHouseNumber = allowNonVerifiedHouseNumber;
    }

    public setAllowNonVerifiedStreet(allowNonVerifiedStreet: boolean) {
        this.options.allowNonVerifiedStreet = allowNonVerifiedStreet;
    }

    public setCountryCodes(codes: CountyCode[]) {
        console.warn("WARNING! Obsolete function called. Function setCountryCodes() has been deprecated, please use the new addFilterByCountry() function instead!");
        this.options.countryCodes = codes;
    }

    public setPosition(position: GeoPosition) {
        console.warn("WARNING! Obsolete function called. Function setPosition() has been deprecated, please use the new addBiasByProximity() function instead!");
        this.options.position = position;
    }

    public setLimit(limit: number) {
        this.options.limit = limit;
    }

    public setPlacesLimit(limit: number) {
        this.options.placesLimit = limit;
    }

    public setValue(value: string) {
        if (!value) {
            this.inputClearButton.classList.remove("visible");
        } else {
            this.inputClearButton.classList.add("visible");
        }

        this.inputElement.value = value;
    }

    public getValue() {
        return this.inputElement.value;
    }

    public addFilterByCountry(codes: ByCountryCodeOptions) {
        this.options.filter[BY_COUNTRYCODE] = codes;
    }

    public addFilterByCircle(filterByCircle: ByCircleOptions) {
        this.options.filter[BY_CIRCLE] = filterByCircle;
    }

    public addFilterByRect(filterByRect: ByRectOptions) {
        this.options.filter[BY_RECT] = filterByRect;
    }

    public addFilterByPlace(filterByPlace: string) {
        this.options.filter[BY_PLACE] = filterByPlace;
    }

    public clearFilters() {
        this.options.filter = {};
    }

    public addBiasByCountry(codes: ByCountryCodeOptions) {
        this.options.bias[BY_COUNTRYCODE] = codes;
    }

    public addBiasByCircle(biasByCircle: ByCircleOptions) {
        this.options.bias[BY_CIRCLE] = biasByCircle;
    }

    public addBiasByRect(biasByRect: ByRectOptions) {
        this.options.bias[BY_RECT] = biasByRect;
    }

    public addBiasByProximity(biasByProximity: ByProximityOptions) {
        this.options.bias[BY_PROXIMITY] = biasByProximity;
    }

    public clearBias() {
        this.options.bias = {};
    }

    public setPlacesFilterByCircle(filterByCircle: ByCircleOptions) {
        this.options.placesFilter[BY_CIRCLE] = filterByCircle;
        this.placesListManager.setCurrentOffset(0);
    }

    public setPlacesFilterByRect(filterByRect: ByRectOptions) {
        this.options.placesFilter[BY_RECT] = filterByRect;
        this.placesListManager.setCurrentOffset(0);
    }

    public setPlacesFilterByPlace(filterByPlace: string) {
        this.options.placesFilter[BY_PLACE] = filterByPlace;
        this.placesListManager.setCurrentOffset(0);
    }

    public setPlacesFilterByGeometry(filterByGeometry: string) {
        this.options.placesFilter[BY_GEOMETRY] = filterByGeometry;
        this.placesListManager.setCurrentOffset(0);
    }

    public clearPlacesFilters() {
        this.options.placesFilter = {};
        this.placesListManager.setCurrentOffset(0);
    }

    public setPlacesBiasByCircle(biasByCircle: ByCircleOptions) {
        this.options.placesBias[BY_CIRCLE] = biasByCircle;
        this.placesListManager.setCurrentOffset(0);
    }

    public setPlacesBiasByRect(biasByRect: ByRectOptions) {
        this.options.placesBias[BY_RECT] = biasByRect;
        this.placesListManager.setCurrentOffset(0);
    }

    public setPlacesBiasByProximity(biasByProximity: ByProximityOptions) {
        this.options.placesBias[BY_PROXIMITY] = biasByProximity;
        this.placesListManager.setCurrentOffset(0);
    }

    public clearPlacesBias() {
        this.options.placesBias = {};
        this.placesListManager.setCurrentOffset(0);
    }

    public on(operation: GeocoderEventType, callback: (param: any) => void) {
        this.callbacks.addCallback(operation, callback);
    }

    public off(operation: GeocoderEventType, callback?: (param: any) => any) {
        this.callbacks.removeCallback(operation, callback);
    }

    public once(operation: GeocoderEventType, callback: (param: any) => any) {
        this.on(operation, callback);

        const current = this;
        const currentListener = () => {
            current.off(operation, callback);
            current.off(operation, currentListener);
        }

        this.on(operation, currentListener);
    }

    public setSuggestionsFilter(suggestionsFilterFunc?: ((suggestions: any[]) => any[]) | null) {
        this.suggestionsFilter = CalculationHelper.returnIfFunction(suggestionsFilterFunc);
    }

    public setPreprocessHook(preprocessHookFunc?: ((value: string) => string) | null) {
        this.preprocessHook = CalculationHelper.returnIfFunction(preprocessHookFunc);
    }

    public setPostprocessHook(postprocessHookFunc?: ((value: string) => string) | null) {
        this.postprocessHook = CalculationHelper.returnIfFunction(postprocessHookFunc);
    }

    public setSendGeocoderRequestFunc(sendGeocoderRequestFunc?: ((value: string, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) | null) {
        this.sendGeocoderRequestAlt = CalculationHelper.returnIfFunction(sendGeocoderRequestFunc);
    }

    public setSendPlaceDetailsRequestFunc(sendPlaceDetailsRequestFunc?: ((feature: any, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) | null) {
        this.sendPlaceDetailsRequestAlt = CalculationHelper.returnIfFunction(sendPlaceDetailsRequestFunc);
    }

    public setSendPlacesRequestFunc(
        sendPlacesRequestFunc?: ((category: string[], offset: number, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any> ) | null
    ): void {
        if (!this.isCategoryModeEnabled()) {
            console.warn('Category search is disabled. Enable with addCategorySearch: true');
            return;
        }

        this.sendPlacesRequestAlt = CalculationHelper.returnIfFunction(sendPlacesRequestFunc);
    }

    public isOpen(): boolean {
        return !!this.autocompleteItemsElement;
    }

    public close() {
        this.closeDropDownList();
    }

    public open() {
        if (!this.isOpen()) {
            this.openDropdownAgain();
        }
    }

    private sendGeocoderRequestOrAlt(currentValue: string): Promise<any> {
        if (this.sendGeocoderRequestAlt) {
            return this.sendGeocoderRequestAlt(currentValue, this);
        } else {
            return this.sendGeocoderRequest(currentValue);
        }

    }

    public sendGeocoderRequest(value: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.currentPromiseReject = reject;

            let url = CalculationHelper.generateUrl(value, this.geocoderUrl, this.apiKey, this.options);

            fetch(url)
                .then((response) => {
                    if (response.ok) {
                        response.json().then(data => resolve(data));
                    } else {
                        response.json().then(data => reject(data));
                    }
                });
        });
    }

    public sendPlaceDetailsRequest(feature: any): Promise<any> {
        return new Promise((resolve, reject) => {

            if (CalculationHelper.isNotOpenStreetMapData(feature)) {
                // only OSM data has detailed information; return the original object if the source is different from OSM
                resolve(feature);
                return;
            }

            this.currentPlaceDetailsPromiseReject = reject;
            let url = CalculationHelper.generatePlacesUrl(this.placeDetailsUrl, feature.properties.place_id, this.apiKey, this.options);

            fetch(url)
                .then((response) => {
                    if (response.ok) {
                        response.json().then(data => {
                            if (!data.features.length) {
                                resolve(feature);
                            }

                            resolve(data.features[0]);
                        });
                    } else {
                        response.json().then(data => reject(data));
                    }
                });
        });
    }

    public async selectCategory(category: Category | string | string[] | null): Promise<void> {
        if (category) {
            this.categoryManager.setCategory(category);
            const categoryObj = this.categoryManager.getCategory();

            if (!categoryObj) {
                return;
            }

            this.inputElement.value = categoryObj.label;
            this.showClearButton();

            // Close the dropdown when a category is selected
            this.closeDropDownList();

            this.placesListManager.setCategory(categoryObj.keys, categoryObj.label);
            this.placesListManager.setCurrentOffset(0);

            await this.sendPlacesRequest();
        } else {
            this.clearCategoryAndNotify();
        }
    }

    public async clearCategory() {
        this.clearCategoryAndNotify();
    }

    public async resendPlacesRequestForMore(
        appendPlaces?: boolean
    ): Promise<void> {
        const categoryObj = this.categoryManager.getCategory();

        if (!categoryObj) {
            console.warn('Cannot resend places request: no category is set');
            return;
        }

        this.callbacks.notifyPlacesRequestStart(categoryObj);

        if (!appendPlaces) {
            this.placesListManager.setCurrentOffset(0);   
        }

        try {
            const bias = Object.keys(this.options.placesBias).length ? this.options.placesBias : PlacesApiHelper.convertGeocoderBiasToPlacesApiBias(this.options.bias);
            const filter = Object.keys(this.options.placesFilter).length ? this.options.placesFilter : PlacesApiHelper.convertGeocoderFilterToPlacesApiFilter(this.options.filter);

            const data = await this.sendPlacesRequestOrAlt(categoryObj.keys,
                bias,
                filter,
                this.placesListManager.getCurrentOffset(), this.options.placesLimit);
            
            const places = data.features || [];

            this.placesListManager.setPlaces(places, appendPlaces);
            this.placesListManager.setCurrentOffset(this.placesListManager.getCurrentOffset() + this.options.placesLimit);
            this.callbacks.notifyPlacesRequestEnd(true, data);
        } catch (error) {
            this.callbacks.notifyPlacesRequestEnd(false, null, error);
            console.error('Places API request failed:', error);
        }
    }

    public getCategory(): Category | null {
        if (!this.isCategoryModeEnabled()) {
            return null;
        }

        return this.categoryManager.getCategory();
    }

    public selectPlace(index: number | null): void {
        // Only works with built-in places list
        if (!this.options.showPlacesList) {
            return;
        }

        // If index is null or negative, clear selection
        if (index === null || index < 0) {
            this.placesListManager.clearSelection();
            return;
        }

        // Select the place (no validation - let the user manage that)
        this.placesListManager.selectPlace(index);
    }

    public async sendPlacesRequest(): Promise<void> {

        const categoryObj = this.categoryManager.getCategory();

        if (!this.isCategoryModeEnabled()) {
            return Promise.reject(new Error('Category search is disabled'));
        }

        if (!categoryObj) {
            console.warn('Cannot resend places request: no category is set');
            return;
        }

        this.callbacks.notifyPlacesRequestStart(categoryObj);
        let data;

        try {

            const bias = Object.keys(this.options.placesBias).length ? this.options.placesBias : PlacesApiHelper.convertGeocoderBiasToPlacesApiBias(this.options.bias);
            const filter = Object.keys(this.options.placesFilter).length ? this.options.placesFilter : PlacesApiHelper.convertGeocoderFilterToPlacesApiFilter(this.options.filter);


            data = await this.sendPlacesRequestOrAlt(this.categoryManager.getCategory().keys,
                bias,
                filter,
                0,
                this.options.placesLimit);

            const places = data.features;

            this.placesListManager.setPlaces(places);
            this.placesListManager.setCurrentOffset(this.placesListManager.getCurrentOffset() + this.options.placesLimit);
            this.callbacks.notifyPlacesRequestEnd(true, data);
        } catch (error) {
            this.callbacks.notifyPlacesRequestEnd(false, null, error);
            console.error('Places API request failed:', error);
        }
    }

    /* Execute a function when someone writes in the text field: */
    onUserInput(event: Event) {
        let currentValue = this.inputElement.value;
        let userEnteredValue = this.inputElement.value;

        this.callbacks.notifyInputChange(currentValue);

        /* Reset category mode and clear places list when user types */
        this.clearCategoryAndNotify();

        /* Close any already open dropdown list */
        this.closeDropDownList();

        this.focusedItemIndex = -1;

        this.cancelPreviousRequest();

        this.cancelPreviousTimeout();

        if (!currentValue) {
            this.removeClearButton();
            return false;
        }

        this.showClearButton();

        this.currentTimeout = window.setTimeout(() => {
            /* Create a new promise and send geocoding request */
            if (CalculationHelper.returnIfFunction(this.preprocessHook)) {
                currentValue = this.preprocessHook(currentValue);
            }

            this.callbacks.notifyRequestStart(currentValue);

            let promise = this.sendGeocoderRequestOrAlt(currentValue);

            promise.then((data: any) => {
                this.callbacks.notifyRequestEnd(true, data);
                this.onDropdownDataLoad(data, userEnteredValue, event);
            }, (err) => {
                this.callbacks.notifyRequestEnd(false, null, err);
                if (!err.canceled) {
                    console.log(err);
                }
            });
        }, this.options.debounceDelay);
    }

    private onDropdownDataLoad(data: any, userEnteredValue: string, event: Event) {
        if (CalculationHelper.needToCalculateExtendByNonVerifiedValues(data, this.options)) {
            CalculationHelper.extendByNonVerifiedValues(this.options, data.features, data?.query?.parsed);
        }

        this.currentItems = data.features;

        if (CalculationHelper.needToFilterDataBySuggestionsFilter(this.currentItems, this.suggestionsFilter)) {
            this.currentItems = this.suggestionsFilter(this.currentItems);
        }

        this.callbacks.notifySuggestions(this.currentItems);

        this.currentCategories = [];
        if (this.isCategoryModeEnabled() && data.query?.categories) {
            this.currentCategories = this.categoryManager.extractCategoriesFromResponse(data);
        }

        if (!this.currentItems.length && !this.currentCategories.length) {
            return;
        }

        this.createDropdown();

        this.currentCategories.forEach((category: Category) => {
            this.populateCategoryDropdownItem(category, event);
        });

        this.currentItems.forEach((feature: any, index: number) => {
            this.populateDropdownItem(feature, userEnteredValue, event, index + this.currentCategories.length);
        });
    }

    private populateCategoryDropdownItem(category: Category, event: Event) {
        const itemElement = DomHelper.createDropdownItem();
        itemElement.classList.add('geoapify-category-item');

        // Add search icon
        const iconElement = document.createElement("span");
        iconElement.classList.add('icon');
        DomHelper.addIcon(iconElement, 'search');
        itemElement.appendChild(iconElement);

        const textElement = DomHelper.createDropdownItemText();
        textElement.innerHTML = `<span class="main-part">${category.label}</span>`;
        itemElement.appendChild(textElement);

        itemElement.addEventListener("click", (e) => {
            event.stopPropagation();
            this.selectCategory(category);
        });

        this.autocompleteItemsElement?.appendChild(itemElement);
    }

    private populateDropdownItem(feature: any, userEnteredValue: string, event: Event, index: number) {
        /* Create a DIV element for each element: */
        const itemElement = DomHelper.createDropdownItem();

        if (!this.options.skipIcons) {
            DomHelper.addDropdownIcon(feature, itemElement);
        }

        const textElement = DomHelper.createDropdownItemText();

        if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
            const value = this.postprocessHook(feature);
            textElement.innerHTML = DomHelper.getStyledAddressSingleValue(value, userEnteredValue);
        } else {
            textElement.innerHTML = DomHelper.getStyledAddress(feature.properties, userEnteredValue);
        }

        itemElement.appendChild(textElement);
        this.addEventListenerOnDropdownClick(itemElement, event, index);
        this.autocompleteItemsElement.appendChild(itemElement);
    }

    private addEventListenerOnDropdownClick(itemElement: HTMLDivElement, event: Event, index: number) {
        itemElement.addEventListener("click", (e) => {
            event.stopPropagation();

            let featureIndex = index;
            if (this.isCategoryModeEnabled()) {
                const categoryCount = this.autocompleteItemsElement?.querySelectorAll('.geoapify-category-item').length || 0;
                featureIndex = index - categoryCount;
            }

            if (this.currentItems?.[featureIndex]) {
                this.setValueAndNotify(this.currentItems[featureIndex]);
            }
        });
    }

    private createDropdown() {
        /*create a DIV element that will contain the items (values):*/
        this.autocompleteItemsElement = document.createElement("div");
        this.autocompleteItemsElement.setAttribute("class", "geoapify-autocomplete-items");

        this.callbacks.notifyOpened();

        /* Append the DIV element as a child of the input wrapper:*/
        this.componentWrapper.appendChild(this.autocompleteItemsElement);
    }

    private cancelPreviousTimeout() {
        if (this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }

    private cancelPreviousRequest() {
        if (this.currentPromiseReject) {
            this.currentPromiseReject({
                canceled: true
            });
            this.currentPromiseReject = null;
        }
    }

    private addEventListeners() {
        this.inputElement.addEventListener('input', this.onUserInput.bind(this), false);
        this.inputElement.addEventListener('keydown', this.onUserKeyPress.bind(this), false);

        document.addEventListener("click", (event) => {
            if (event.target !== this.inputElement) {
                this.closeDropDownList();
            } else if (!this.autocompleteItemsElement) {
                // open dropdown list again
                this.openDropdownAgain();
            }
        });
    }

    private showClearButton() {
        this.inputClearButton.classList.add("visible");
    }

    private removeClearButton() {
        this.inputClearButton.classList.remove("visible");
    }

    private onUserKeyPress(event: KeyboardEvent) {
        if (this.autocompleteItemsElement) {
            const itemElements: HTMLCollectionOf<HTMLDivElement> = this.autocompleteItemsElement.getElementsByTagName("div");
            if (event.code === 'ArrowDown') {
                this.handleArrowDownEvent(event, itemElements);
            } else if (event.code === 'ArrowUp') {
                this.handleArrowUpEvent(event, itemElements);
            } else if (event.code === "Enter") {
                this.handleEnterEvent(event);
            } else if (event.code === "Escape") {
                /* If the ESC key is pressed, close the list */
                this.handleEscapeKey();
            }
        } else {
            if (event.code == 'ArrowDown') {
                /* Open dropdown list again */
                this.openDropdownAgain();
            } else if (event.code === "Escape") {
                /* Handle Esc when dropdown is closed (for double-Esc category clearing) */
                this.handleEscapeKey();
            }
        }
    }

    private handleEscapeKey(): void {
        const now = Date.now();

        if (this.autocompleteItemsElement) {
            // First Esc: Close dropdown
            this.closeDropDownList();
            this.lastEscKeyTime = now;
        } else if (this.shouldClearCategoryOnDoubleEscape(now)) {
            // Second Esc within threshold: Clear category and reset input
            this.inputElement.value = '';
            this.removeClearButton();
            this.clearCategory();
            this.lastEscKeyTime = undefined;
        } else {
            // Single Esc when dropdown is already closed
            this.lastEscKeyTime = now;
        }
    }

    private shouldClearCategoryOnDoubleEscape(currentTime: number): boolean {
        return this.isCategoryModeEnabled() &&
            this.categoryManager.isCategoryModeActive() &&
            this.lastEscKeyTime !== undefined &&
            (currentTime - this.lastEscKeyTime) < this.DOUBLE_ESC_THRESHOLD;
    }

    private handleEnterEvent(event: KeyboardEvent) {
        /* If the ENTER key is pressed and value as selected, close the list*/
        event.preventDefault();
        if (this.focusedItemIndex > -1) {
            const categoryCount = this.currentCategories.length;

            // Check if the focused item is a category
            if (this.focusedItemIndex < categoryCount) {
                // It's a category - trigger setCategory
                const category = this.currentCategories[this.focusedItemIndex];
                this.selectCategory(category);
            } else {
                // It's a regular geocoder item
                const itemIndex = this.focusedItemIndex - categoryCount;
                if (this.options.skipSelectionOnArrowKey) {
                    // select the location if it wasn't selected by navigation
                    this.setValueAndNotify(this.currentItems[itemIndex]);
                } else {
                    this.closeDropDownList();
                }
            }
        }
    }

    private handleArrowUpEvent(event: KeyboardEvent, itemElements: HTMLCollectionOf<HTMLDivElement>) {
        event.preventDefault();

        /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
        this.focusedItemIndex--;
        if (this.focusedItemIndex < 0) this.focusedItemIndex = (itemElements.length - 1);
        /*and and make the current item more visible:*/
        this.setActive(itemElements, this.focusedItemIndex);
    }

    private handleArrowDownEvent(event: KeyboardEvent, itemElements: HTMLCollectionOf<HTMLDivElement>) {
        event.preventDefault();

        /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
        this.focusedItemIndex++;
        if (this.focusedItemIndex >= itemElements.length) this.focusedItemIndex = 0;
        /*and and make the current item more visible:*/
        this.setActive(itemElements, this.focusedItemIndex);
    }

    private setActive(items: HTMLCollectionOf<HTMLDivElement>, index: number) {
        if (!items || !items.length) return false;
        DomHelper.addActiveClassToDropdownItem(items, index);

        if (!this.options.skipSelectionOnArrowKey) {
            const categoryCount = this.currentCategories.length;

            // Check if the focused item is a category
            if (index < categoryCount) {
                // It's a category item
                const category = this.currentCategories[index];
                this.inputElement.value = category.label;
            } else {
                // It's a regular geocoder item
                const itemIndex = index - categoryCount;
                if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
                    this.inputElement.value = this.postprocessHook(this.currentItems[itemIndex]);
                } else {
                    this.inputElement.value = this.currentItems[itemIndex].properties.formatted;
                }
                this.notifyValueSelected(this.currentItems[itemIndex]);
            }
        }
    }

    private setValueAndNotify(feature: any) {
        if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
            this.inputElement.value = this.postprocessHook(feature);
        } else {
            this.inputElement.value = feature.properties.formatted;
        }

        // Clear category when selecting a regular place from main dropdown
        this.clearCategoryAndNotify();

        this.notifyValueSelected(feature);

        /* Close the list of autocompleted values: */
        this.closeDropDownList();
    }

    private clearFieldAndNotify(event: MouseEvent) {
        event.stopPropagation();
        this.inputElement.value = '';
        this.removeClearButton();

        this.cancelPreviousRequest();

        this.cancelPreviousTimeout();
        this.cancelCurrentPlacesRequest();
        this.closeDropDownList();

        if (this.isCategoryModeEnabled() && this.categoryManager.isCategoryModeActive()) {
            this.clearCategoryAndNotify();
        } else {
            this.callbacks.notifyClear('address');
        }

        this.notifyValueSelected(null);
    }

    private closeDropDownList() {
        if (this.autocompleteItemsElement) {
            this.componentWrapper.removeChild(this.autocompleteItemsElement);
            this.autocompleteItemsElement = null;
            this.callbacks.notifyClosed();
        }
    }

    private notifyValueSelected(feature: any) {
        this.cancelPreviousPlaceDetailsRequest();

        if (this.noNeedToRequestPlaceDetails(feature)) {
            this.callbacks.notifyChange(feature);
        } else {
            this.callbacks.notifyPlaceDetailsRequestStart(feature);

            let promise = this.sendPlaceDetailsRequestOrAlt(feature);

            promise.then((detailesFeature: any) => {
                this.callbacks.notifyPlaceDetailsRequestEnd(true, detailesFeature);
                this.callbacks.notifyChange(detailesFeature);
                this.currentPlaceDetailsPromiseReject = null;
            }, (err) => {
                if (!err.canceled) {
                    console.log(err);
                    this.callbacks.notifyPlaceDetailsRequestEnd(false, null, err);
                    this.callbacks.notifyChange(feature);
                    this.currentPlaceDetailsPromiseReject = null;
                }
            });
        }
    }

    private sendPlaceDetailsRequestOrAlt(feature: any) {
        if (this.sendPlaceDetailsRequestAlt) {
            return this.sendPlaceDetailsRequestAlt(feature, this)
        } else {
            return this.sendPlaceDetailsRequest(feature);
        }
    }

    private noNeedToRequestPlaceDetails(feature: any) {
        return !this.options.addDetails || !feature || feature.properties.nonVerifiedParts?.length;
    }

    private cancelPreviousPlaceDetailsRequest() {
        if (this.currentPlaceDetailsPromiseReject) {
            this.currentPlaceDetailsPromiseReject({
                canceled: true
            });
            this.currentPlaceDetailsPromiseReject = null;
        }
    }

    private cancelCurrentPlacesRequest() {
        if (this.currentPlacesPromiseReject) {
            this.currentPlacesPromiseReject({ canceled: true });
            this.currentPlacesPromiseReject = null;
        }
    }

    private openDropdownAgain() {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        this.inputElement.dispatchEvent(event);
    }

    private constructOptions(options: GeocoderAutocompleteOptions) {
        this.options = options ? { ...this.options, ...options } : this.options;
        this.options.filter = this.options.filter || {};
        this.options.bias = this.options.bias || {};

        this.options.placesFilter = this.options.placesFilter || {};
        this.options.placesBias = this.options.placesBias || {};

        if (this.options.countryCodes) {
            this.addFilterByCountry(this.options.countryCodes);
        }

        if (this.options.position) {
            this.addBiasByProximity(this.options.position);
        }
    }

    private addClearButton() {
        this.inputClearButton = document.createElement("div");
        this.inputClearButton.classList.add("geoapify-close-button");
        DomHelper.addIcon(this.inputClearButton, 'close');
        this.inputClearButton.addEventListener("click", this.clearFieldAndNotify.bind(this), false);
        this.inputWrapper.appendChild(this.inputClearButton);
    }

    private isCategoryModeEnabled(): boolean {
        return !!this.options.addCategorySearch;
    }

    private clearCategoryAndNotify(): void {
        if (!this.isCategoryModeEnabled()) return;

        const wasCategoryActive = this.categoryManager.isCategoryModeActive();
        this.categoryManager.clearCategory();
        this.placesListManager.resetCategory();

        if (wasCategoryActive) {
            this.callbacks.notifyClear('category');
        }
    }

    private async sendPlacesRequestOrAlt(
        categoryKeys: string[],
        bias?: { [key: string]: ByProximityOptions | ByCircleOptions | ByRectOptions },
        filter?: { [key: string]: ByCircleOptions | ByRectOptions | string },
        offset?: number,
        limit?: number
    ): Promise<any> {
        if (this.sendPlacesRequestAlt) {
            return this.sendPlacesRequestAlt(categoryKeys, offset, this);
        }

        let url;
        if (Object.keys(bias || {}).length === 0 && Object.keys(filter || {}).length === 0) {
            const location = await PlacesApiHelper.getLocationForBias(this.apiKey, this.options, this.ipGeolocationUrl);
            url = PlacesApiHelper.generatePlacesUrl(
                categoryKeys,
                this.apiKey,
                this.options,
                this.placesApiUrl,
                offset,
                limit,
                location ? { [BY_PROXIMITY]: location } : undefined
            );
        } else {
            url = PlacesApiHelper.generatePlacesUrl(
                categoryKeys,
                this.apiKey,
                this.options,
                this.placesApiUrl,
                offset,
                limit,
                bias,
                filter
            );
        }

        return PlacesApiHelper.sendPlacesRequest(url);
    }

}

export interface GeocoderAutocompleteOptions {
    type?: LocationType;
    lang?: SupportedLanguage;
    limit?: number;
    placeholder?: string;
    debounceDelay?: number;

    filter?: { [key: string]: ByCircleOptions | ByCountryCodeOptions | ByRectOptions | string },
    bias?: { [key: string]: ByCircleOptions | ByCountryCodeOptions | ByRectOptions | ByProximityOptions },

    skipIcons?: boolean;

    /**
     * @deprecated The property should not be used; it is true by default. Use the addDetails property to add details.
     */
    skipDetails?: boolean;

    addDetails?: boolean;

    skipSelectionOnArrowKey?: boolean;

    // to remove in the next version
    position?: GeoPosition;
    countryCodes?: CountyCode[];

    // extend results with non verified values if needed
    allowNonVerifiedHouseNumber?: boolean;
    allowNonVerifiedStreet?: boolean;

    // places related options
    addCategorySearch?: boolean;
    showPlacesList?: boolean;
    hidePlacesListAfterSelect?: boolean;
    enablePlacesLazyLoading?: boolean;
    placesLimit?: number;

    placesFilter?: { [key: string]: ByCircleOptions | ByRectOptions | string },
    placesBias?: { [key: string]: ByCircleOptions | ByRectOptions | ByProximityOptions },
}

export interface GeoPosition {
    lat: number;
    lon: number;
}

export type ByCountryCodeOptions = CountyCode[];

export interface ByProximityOptions {
    lon: number;
    lat: number;
}

export interface ByCircleOptions {
    lon: number;
    lat: number;
    radiusMeters: number;
}

export interface ByRectOptions {
    lon1: number;
    lat1: number;
    lon2: number;
    lat2: number;
}

export type LocationType = 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity';
export type SupportedLanguage = "ab" | "aa" | "af" | "ak" | "sq" | "am" | "ar" | "an" | "hy" | "as" | "av" | "ae" | "ay" | "az" | "bm" | "ba" | "eu" | "be" | "bn" | "bh" | "bi" | "bs" | "br" | "bg" | "my" | "ca" | "ch" | "ce" | "ny" | "zh" | "cv" | "kw" | "co" | "cr" | "hr" | "cs" | "da" | "dv" | "nl" | "en" | "eo" | "et" | "ee" | "fo" | "fj" | "fi" | "fr" | "ff" | "gl" | "ka" | "de" | "el" | "gn" | "gu" | "ht" | "ha" | "he" | "hz" | "hi" | "ho" | "hu" | "ia" | "id" | "ie" | "ga" | "ig" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "kl" | "kn" | "kr" | "ks" | "kk" | "km" | "ki" | "rw" | "ky" | "kv" | "kg" | "ko" | "ku" | "kj" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "gv" | "mk" | "mg" | "ms" | "ml" | "mt" | "mi" | "mr" | "mh" | "mn" | "na" | "nv" | "nb" | "nd" | "ne" | "ng" | "nn" | "no" | "ii" | "nr" | "oc" | "oj" | "cu" | "om" | "or" | "os" | "pa" | "pi" | "fa" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "sa" | "sc" | "sd" | "se" | "sm" | "sg" | "sr" | "gd" | "sn" | "si" | "sk" | "sl" | "so" | "st" | "es" | "su" | "sw" | "ss" | "sv" | "ta" | "te" | "tg" | "th" | "ti" | "bo" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "cy" | "wo" | "fy" | "xh" | "yi" | "yo" | "za";
export type CountyCode = "none" | "auto" | "ad" | "ae" | "af" | "ag" | "ai" | "al" | "am" | "an" | "ao" | "ap" | "aq" | "ar" | "as" | "at" | "au" | "aw" | "az" | "ba" | "bb" | "bd" | "be" | "bf" | "bg" | "bh" | "bi" | "bj" | "bm" | "bn" | "bo" | "br" | "bs" | "bt" | "bv" | "bw" | "by" | "bz" | "ca" | "cc" | "cd" | "cf" | "cg" | "ch" | "ci" | "ck" | "cl" | "cm" | "cn" | "co" | "cr" | "cu" | "cv" | "cx" | "cy" | "cz" | "de" | "dj" | "dk" | "dm" | "do" | "dz" | "ec" | "ee" | "eg" | "eh" | "er" | "es" | "et" | "eu" | "fi" | "fj" | "fk" | "fm" | "fo" | "fr" | "ga" | "gb" | "gd" | "ge" | "gf" | "gh" | "gi" | "gl" | "gm" | "gn" | "gp" | "gq" | "gr" | "gs" | "gt" | "gu" | "gw" | "gy" | "hk" | "hm" | "hn" | "hr" | "ht" | "hu" | "id" | "ie" | "il" | "in" | "io" | "iq" | "ir" | "is" | "it" | "jm" | "jo" | "jp" | "ke" | "kg" | "kh" | "ki" | "km" | "kn" | "kp" | "kr" | "kw" | "ky" | "kz" | "la" | "lb" | "lc" | "li" | "lk" | "lr" | "ls" | "lt" | "lu" | "lv" | "ly" | "ma" | "mc" | "md" | "me" | "mg" | "mh" | "mk" | "ml" | "mm" | "mn" | "mo" | "mp" | "mq" | "mr" | "ms" | "mt" | "mu" | "mv" | "mw" | "mx" | "my" | "mz" | "na" | "nc" | "ne" | "nf" | "ng" | "ni" | "nl" | "no" | "np" | "nr" | "nu" | "nz" | "om" | "pa" | "pe" | "pf" | "pg" | "ph" | "pk" | "pl" | "pm" | "pr" | "ps" | "pt" | "pw" | "py" | "qa" | "re" | "ro" | "rs" | "ru" | "rw" | "sa" | "sb" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sj" | "sk" | "sl" | "sm" | "sn" | "so" | "sr" | "st" | "sv" | "sy" | "sz" | "tc" | "td" | "tf" | "tg" | "th" | "tj" | "tk" | "tm" | "tn" | "to" | "tr" | "tt" | "tv" | "tw" | "tz" | "ua" | "ug" | "um" | "us" | "uy" | "uz" | "va" | "vc" | "ve" | "vg" | "vi" | "vn" | "vu" | "wf" | "ws" | "ye" | "yt" | "za" | "zm" | "zw";
