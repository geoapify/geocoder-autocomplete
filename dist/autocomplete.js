import { CalculationHelper } from "./helpers/calculation.helper";
import { DomHelper } from "./helpers/dom.helper";
import { BY_CIRCLE, BY_COUNTRYCODE, BY_GEOMETRY, BY_PLACE, BY_PROXIMITY, BY_RECT } from "./helpers/constants";
import { Callbacks } from "./helpers/callbacks";
import { CategoryManager } from "./helpers/category.helper";
import { PlacesApiHelper } from './helpers/places-api.helper';
import { PlacesListManager } from "./helpers/places-list.helper";
export class GeocoderAutocomplete {
    apiKey;
    inputElement;
    inputWrapper;
    componentWrapper;
    inputClearButton;
    autocompleteItemsElement = null;
    /* Places list manager */
    placesListManager;
    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    focusedItemIndex;
    /* Current autocomplete items data (GeoJSON.Feature) */
    currentItems;
    /* Current categories displayed in dropdown */
    currentCategories = [];
    /* Active request promise reject function. To be able to cancel the promise when a new request comes */
    currentPromiseReject;
    /* Active place details request promise reject function */
    currentPlaceDetailsPromiseReject;
    /* We set timeout before sending a request to avoid unnecessary calls */
    currentTimeout;
    callbacks = new Callbacks();
    preprocessHook;
    postprocessHook;
    suggestionsFilter;
    sendGeocoderRequestAlt;
    sendPlaceDetailsRequestAlt;
    sendPlacesRequestAlt;
    geocoderUrl = "https://api.geoapify.com/v1/geocode/autocomplete";
    placeDetailsUrl = "https://api.geoapify.com/v2/place-details";
    placesApiUrl = "https://api.geoapify.com/v2/places";
    ipGeolocationUrl = "https://api.geoapify.com/v1/ipinfo";
    categoryManager;
    currentPlacesPromiseReject;
    lastEscKeyTime;
    DOUBLE_ESC_THRESHOLD = 500; // 500ms window for double-Esc
    options = {
        limit: 5,
        placesLimit: 20,
        debounceDelay: 100
    };
    constructor(container, apiKey, options) {
        this.apiKey = apiKey;
        this.constructOptions(options);
        this.componentWrapper = document.createElement("div");
        this.componentWrapper.classList.add("geoapify-geocoder-autocomplete-container");
        container.appendChild(this.componentWrapper);
        const cs = getComputedStyle(container);
        const parentMaxH = cs.maxHeight; // 'none' | '400px' | ...
        const parentH = cs.height; // 'auto' | '123px' | ...
        // Priority:
        // 1. If parent has a max-height → inherit it
        // 2. Else if parent has a fixed height → use 100%
        // 3. Else → fallback to 400px
        if (parentMaxH && parentMaxH !== 'none') {
            this.componentWrapper.style.maxHeight = 'inherit';
        }
        else if (parentH && parentH !== 'auto' && parentH !== '0px') {
            this.componentWrapper.style.maxHeight = '100%';
        }
        else {
            this.componentWrapper.style.maxHeight = '400px';
        }
        this.inputElement = document.createElement("input");
        this.inputWrapper = DomHelper.createInputElement(this.inputElement, this.options, this.componentWrapper);
        this.addClearButton();
        this.addEventListeners();
        this.categoryManager = new CategoryManager();
        // Initialize places list manager with callbacks
        const placesCallbacks = {
            onLoadMore: () => {
                return this.resendPlacesRequestForMore(true /* append */);
            },
            onPlacesUpdate: (places) => {
                this.callbacks.notifyPlaces(places);
            },
            onPlaceSelect: (place, index) => {
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
    setType(type) {
        this.options.type = type;
    }
    setLang(lang) {
        this.options.lang = lang;
    }
    setAddDetails(addDetails) {
        this.options.addDetails = addDetails;
    }
    setSkipIcons(skipIcons) {
        this.options.skipIcons = skipIcons;
    }
    setAllowNonVerifiedHouseNumber(allowNonVerifiedHouseNumber) {
        this.options.allowNonVerifiedHouseNumber = allowNonVerifiedHouseNumber;
    }
    setAllowNonVerifiedStreet(allowNonVerifiedStreet) {
        this.options.allowNonVerifiedStreet = allowNonVerifiedStreet;
    }
    setCountryCodes(codes) {
        console.warn("WARNING! Obsolete function called. Function setCountryCodes() has been deprecated, please use the new addFilterByCountry() function instead!");
        this.options.countryCodes = codes;
    }
    setPosition(position) {
        console.warn("WARNING! Obsolete function called. Function setPosition() has been deprecated, please use the new addBiasByProximity() function instead!");
        this.options.position = position;
    }
    setLimit(limit) {
        this.options.limit = limit;
    }
    setPlacesLimit(limit) {
        this.options.placesLimit = limit;
    }
    setValue(value) {
        if (!value) {
            this.inputClearButton.classList.remove("visible");
        }
        else {
            this.inputClearButton.classList.add("visible");
        }
        this.inputElement.value = value;
    }
    getValue() {
        return this.inputElement.value;
    }
    addFilterByCountry(codes) {
        this.options.filter[BY_COUNTRYCODE] = codes;
    }
    addFilterByCircle(filterByCircle) {
        this.options.filter[BY_CIRCLE] = filterByCircle;
    }
    addFilterByRect(filterByRect) {
        this.options.filter[BY_RECT] = filterByRect;
    }
    addFilterByPlace(filterByPlace) {
        this.options.filter[BY_PLACE] = filterByPlace;
    }
    clearFilters() {
        this.options.filter = {};
    }
    addBiasByCountry(codes) {
        this.options.bias[BY_COUNTRYCODE] = codes;
    }
    addBiasByCircle(biasByCircle) {
        this.options.bias[BY_CIRCLE] = biasByCircle;
    }
    addBiasByRect(biasByRect) {
        this.options.bias[BY_RECT] = biasByRect;
    }
    addBiasByProximity(biasByProximity) {
        this.options.bias[BY_PROXIMITY] = biasByProximity;
    }
    clearBias() {
        this.options.bias = {};
    }
    setPlacesFilterByCircle(filterByCircle) {
        this.options.placesFilter[BY_CIRCLE] = filterByCircle;
        this.placesListManager.setCurrentOffset(0);
    }
    setPlacesFilterByRect(filterByRect) {
        this.options.placesFilter[BY_RECT] = filterByRect;
        this.placesListManager.setCurrentOffset(0);
    }
    setPlacesFilterByPlace(filterByPlace) {
        this.options.placesFilter[BY_PLACE] = filterByPlace;
        this.placesListManager.setCurrentOffset(0);
    }
    setPlacesFilterByGeometry(filterByGeometry) {
        this.options.placesFilter[BY_GEOMETRY] = filterByGeometry;
        this.placesListManager.setCurrentOffset(0);
    }
    clearPlacesFilters() {
        this.options.placesFilter = {};
        this.placesListManager.setCurrentOffset(0);
    }
    setPlacesBiasByCircle(biasByCircle) {
        this.options.placesBias[BY_CIRCLE] = biasByCircle;
        this.placesListManager.setCurrentOffset(0);
    }
    setPlacesBiasByRect(biasByRect) {
        this.options.placesBias[BY_RECT] = biasByRect;
        this.placesListManager.setCurrentOffset(0);
    }
    setPlacesBiasByProximity(biasByProximity) {
        this.options.placesBias[BY_PROXIMITY] = biasByProximity;
        this.placesListManager.setCurrentOffset(0);
    }
    clearPlacesBias() {
        this.options.placesBias = {};
        this.placesListManager.setCurrentOffset(0);
    }
    on(operation, callback) {
        this.callbacks.addCallback(operation, callback);
    }
    off(operation, callback) {
        this.callbacks.removeCallback(operation, callback);
    }
    once(operation, callback) {
        this.on(operation, callback);
        const current = this;
        const currentListener = () => {
            current.off(operation, callback);
            current.off(operation, currentListener);
        };
        this.on(operation, currentListener);
    }
    setSuggestionsFilter(suggestionsFilterFunc) {
        this.suggestionsFilter = CalculationHelper.returnIfFunction(suggestionsFilterFunc);
    }
    setPreprocessHook(preprocessHookFunc) {
        this.preprocessHook = CalculationHelper.returnIfFunction(preprocessHookFunc);
    }
    setPostprocessHook(postprocessHookFunc) {
        this.postprocessHook = CalculationHelper.returnIfFunction(postprocessHookFunc);
    }
    setSendGeocoderRequestFunc(sendGeocoderRequestFunc) {
        this.sendGeocoderRequestAlt = CalculationHelper.returnIfFunction(sendGeocoderRequestFunc);
    }
    setSendPlaceDetailsRequestFunc(sendPlaceDetailsRequestFunc) {
        this.sendPlaceDetailsRequestAlt = CalculationHelper.returnIfFunction(sendPlaceDetailsRequestFunc);
    }
    setSendPlacesRequestFunc(sendPlacesRequestFunc) {
        if (!this.isCategoryModeEnabled()) {
            console.warn('Category search is disabled. Enable with addCategorySearch: true');
            return;
        }
        this.sendPlacesRequestAlt = CalculationHelper.returnIfFunction(sendPlacesRequestFunc);
    }
    isOpen() {
        return !!this.autocompleteItemsElement;
    }
    close() {
        this.closeDropDownList();
    }
    open() {
        if (!this.isOpen()) {
            this.openDropdownAgain();
        }
    }
    sendGeocoderRequestOrAlt(currentValue) {
        if (this.sendGeocoderRequestAlt) {
            return this.sendGeocoderRequestAlt(currentValue, this);
        }
        else {
            return this.sendGeocoderRequest(currentValue);
        }
    }
    sendGeocoderRequest(value) {
        return new Promise((resolve, reject) => {
            this.currentPromiseReject = reject;
            let url = CalculationHelper.generateUrl(value, this.geocoderUrl, this.apiKey, this.options);
            fetch(url)
                .then((response) => {
                if (response.ok) {
                    response.json().then(data => resolve(data));
                }
                else {
                    response.json().then(data => reject(data));
                }
            });
        });
    }
    sendPlaceDetailsRequest(feature) {
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
                }
                else {
                    response.json().then(data => reject(data));
                }
            });
        });
    }
    async selectCategory(category) {
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
        }
        else {
            this.clearCategoryAndNotify();
        }
    }
    async clearCategory() {
        this.clearCategoryAndNotify();
    }
    async resendPlacesRequestForMore(appendPlaces) {
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
            const data = await this.sendPlacesRequestOrAlt(categoryObj.keys, bias, filter, this.placesListManager.getCurrentOffset(), this.options.placesLimit);
            const places = data.features || [];
            this.placesListManager.setPlaces(places, appendPlaces);
            this.placesListManager.setCurrentOffset(this.placesListManager.getCurrentOffset() + this.options.placesLimit);
            this.callbacks.notifyPlacesRequestEnd(true, data);
        }
        catch (error) {
            this.callbacks.notifyPlacesRequestEnd(false, null, error);
            console.error('Places API request failed:', error);
        }
    }
    getCategory() {
        if (!this.isCategoryModeEnabled()) {
            return null;
        }
        return this.categoryManager.getCategory();
    }
    selectPlace(index) {
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
    async sendPlacesRequest() {
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
            data = await this.sendPlacesRequestOrAlt(this.categoryManager.getCategory().keys, bias, filter, 0, this.options.placesLimit);
            const places = data.features;
            this.placesListManager.setPlaces(places);
            this.placesListManager.setCurrentOffset(this.placesListManager.getCurrentOffset() + this.options.placesLimit);
            this.callbacks.notifyPlacesRequestEnd(true, data);
        }
        catch (error) {
            this.callbacks.notifyPlacesRequestEnd(false, null, error);
            console.error('Places API request failed:', error);
        }
    }
    /* Execute a function when someone writes in the text field: */
    onUserInput(event) {
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
            promise.then((data) => {
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
    onDropdownDataLoad(data, userEnteredValue, event) {
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
        this.currentCategories.forEach((category) => {
            this.populateCategoryDropdownItem(category, event);
        });
        this.currentItems.forEach((feature, index) => {
            this.populateDropdownItem(feature, userEnteredValue, event, index + this.currentCategories.length);
        });
    }
    populateCategoryDropdownItem(category, event) {
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
    populateDropdownItem(feature, userEnteredValue, event, index) {
        /* Create a DIV element for each element: */
        const itemElement = DomHelper.createDropdownItem();
        if (!this.options.skipIcons) {
            DomHelper.addDropdownIcon(feature, itemElement);
        }
        const textElement = DomHelper.createDropdownItemText();
        if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
            const value = this.postprocessHook(feature);
            textElement.innerHTML = DomHelper.getStyledAddressSingleValue(value, userEnteredValue);
        }
        else {
            textElement.innerHTML = DomHelper.getStyledAddress(feature.properties, userEnteredValue);
        }
        itemElement.appendChild(textElement);
        this.addEventListenerOnDropdownClick(itemElement, event, index);
        this.autocompleteItemsElement.appendChild(itemElement);
    }
    addEventListenerOnDropdownClick(itemElement, event, index) {
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
    createDropdown() {
        /*create a DIV element that will contain the items (values):*/
        this.autocompleteItemsElement = document.createElement("div");
        this.autocompleteItemsElement.setAttribute("class", "geoapify-autocomplete-items");
        this.callbacks.notifyOpened();
        /* Append the DIV element as a child of the input wrapper:*/
        this.componentWrapper.appendChild(this.autocompleteItemsElement);
    }
    cancelPreviousTimeout() {
        if (this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }
    cancelPreviousRequest() {
        if (this.currentPromiseReject) {
            this.currentPromiseReject({
                canceled: true
            });
            this.currentPromiseReject = null;
        }
    }
    addEventListeners() {
        this.inputElement.addEventListener('input', this.onUserInput.bind(this), false);
        this.inputElement.addEventListener('keydown', this.onUserKeyPress.bind(this), false);
        document.addEventListener("click", (event) => {
            if (event.target !== this.inputElement) {
                this.closeDropDownList();
            }
            else if (!this.autocompleteItemsElement) {
                // open dropdown list again
                this.openDropdownAgain();
            }
        });
    }
    showClearButton() {
        this.inputClearButton.classList.add("visible");
    }
    removeClearButton() {
        this.inputClearButton.classList.remove("visible");
    }
    onUserKeyPress(event) {
        if (this.autocompleteItemsElement) {
            const itemElements = this.autocompleteItemsElement.getElementsByTagName("div");
            if (event.code === 'ArrowDown') {
                this.handleArrowDownEvent(event, itemElements);
            }
            else if (event.code === 'ArrowUp') {
                this.handleArrowUpEvent(event, itemElements);
            }
            else if (event.code === "Enter") {
                this.handleEnterEvent(event);
            }
            else if (event.code === "Escape") {
                /* If the ESC key is pressed, close the list */
                this.handleEscapeKey();
            }
        }
        else {
            if (event.code == 'ArrowDown') {
                /* Open dropdown list again */
                this.openDropdownAgain();
            }
            else if (event.code === "Escape") {
                /* Handle Esc when dropdown is closed (for double-Esc category clearing) */
                this.handleEscapeKey();
            }
        }
    }
    handleEscapeKey() {
        const now = Date.now();
        if (this.autocompleteItemsElement) {
            // First Esc: Close dropdown
            this.closeDropDownList();
            this.lastEscKeyTime = now;
        }
        else if (this.shouldClearCategoryOnDoubleEscape(now)) {
            // Second Esc within threshold: Clear category and reset input
            this.inputElement.value = '';
            this.removeClearButton();
            this.clearCategory();
            this.lastEscKeyTime = undefined;
        }
        else {
            // Single Esc when dropdown is already closed
            this.lastEscKeyTime = now;
        }
    }
    shouldClearCategoryOnDoubleEscape(currentTime) {
        return this.isCategoryModeEnabled() &&
            this.categoryManager.isCategoryModeActive() &&
            this.lastEscKeyTime !== undefined &&
            (currentTime - this.lastEscKeyTime) < this.DOUBLE_ESC_THRESHOLD;
    }
    handleEnterEvent(event) {
        /* If the ENTER key is pressed and value as selected, close the list*/
        event.preventDefault();
        if (this.focusedItemIndex > -1) {
            const categoryCount = this.currentCategories.length;
            // Check if the focused item is a category
            if (this.focusedItemIndex < categoryCount) {
                // It's a category - trigger setCategory
                const category = this.currentCategories[this.focusedItemIndex];
                this.selectCategory(category);
            }
            else {
                // It's a regular geocoder item
                const itemIndex = this.focusedItemIndex - categoryCount;
                if (this.options.skipSelectionOnArrowKey) {
                    // select the location if it wasn't selected by navigation
                    this.setValueAndNotify(this.currentItems[itemIndex]);
                }
                else {
                    this.closeDropDownList();
                }
            }
        }
    }
    handleArrowUpEvent(event, itemElements) {
        event.preventDefault();
        /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
        this.focusedItemIndex--;
        if (this.focusedItemIndex < 0)
            this.focusedItemIndex = (itemElements.length - 1);
        /*and and make the current item more visible:*/
        this.setActive(itemElements, this.focusedItemIndex);
    }
    handleArrowDownEvent(event, itemElements) {
        event.preventDefault();
        /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
        this.focusedItemIndex++;
        if (this.focusedItemIndex >= itemElements.length)
            this.focusedItemIndex = 0;
        /*and and make the current item more visible:*/
        this.setActive(itemElements, this.focusedItemIndex);
    }
    setActive(items, index) {
        if (!items || !items.length)
            return false;
        DomHelper.addActiveClassToDropdownItem(items, index);
        if (!this.options.skipSelectionOnArrowKey) {
            const categoryCount = this.currentCategories.length;
            // Check if the focused item is a category
            if (index < categoryCount) {
                // It's a category item
                const category = this.currentCategories[index];
                this.inputElement.value = category.label;
            }
            else {
                // It's a regular geocoder item
                const itemIndex = index - categoryCount;
                if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
                    this.inputElement.value = this.postprocessHook(this.currentItems[itemIndex]);
                }
                else {
                    this.inputElement.value = this.currentItems[itemIndex].properties.formatted;
                }
                this.notifyValueSelected(this.currentItems[itemIndex]);
            }
        }
    }
    setValueAndNotify(feature) {
        if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
            this.inputElement.value = this.postprocessHook(feature);
        }
        else {
            this.inputElement.value = feature.properties.formatted;
        }
        // Clear category when selecting a regular place from main dropdown
        this.clearCategoryAndNotify();
        this.notifyValueSelected(feature);
        /* Close the list of autocompleted values: */
        this.closeDropDownList();
    }
    clearFieldAndNotify(event) {
        event.stopPropagation();
        this.inputElement.value = '';
        this.removeClearButton();
        this.cancelPreviousRequest();
        this.cancelPreviousTimeout();
        this.cancelCurrentPlacesRequest();
        this.closeDropDownList();
        if (this.isCategoryModeEnabled() && this.categoryManager.isCategoryModeActive()) {
            this.clearCategoryAndNotify();
        }
        else {
            this.callbacks.notifyClear('address');
        }
        this.notifyValueSelected(null);
    }
    closeDropDownList() {
        if (this.autocompleteItemsElement) {
            this.componentWrapper.removeChild(this.autocompleteItemsElement);
            this.autocompleteItemsElement = null;
            this.callbacks.notifyClosed();
        }
    }
    notifyValueSelected(feature) {
        this.cancelPreviousPlaceDetailsRequest();
        if (this.noNeedToRequestPlaceDetails(feature)) {
            this.callbacks.notifyChange(feature);
        }
        else {
            this.callbacks.notifyPlaceDetailsRequestStart(feature);
            let promise = this.sendPlaceDetailsRequestOrAlt(feature);
            promise.then((detailesFeature) => {
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
    sendPlaceDetailsRequestOrAlt(feature) {
        if (this.sendPlaceDetailsRequestAlt) {
            return this.sendPlaceDetailsRequestAlt(feature, this);
        }
        else {
            return this.sendPlaceDetailsRequest(feature);
        }
    }
    noNeedToRequestPlaceDetails(feature) {
        return !this.options.addDetails || !feature || feature.properties.nonVerifiedParts?.length;
    }
    cancelPreviousPlaceDetailsRequest() {
        if (this.currentPlaceDetailsPromiseReject) {
            this.currentPlaceDetailsPromiseReject({
                canceled: true
            });
            this.currentPlaceDetailsPromiseReject = null;
        }
    }
    cancelCurrentPlacesRequest() {
        if (this.currentPlacesPromiseReject) {
            this.currentPlacesPromiseReject({ canceled: true });
            this.currentPlacesPromiseReject = null;
        }
    }
    openDropdownAgain() {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        this.inputElement.dispatchEvent(event);
    }
    constructOptions(options) {
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
    addClearButton() {
        this.inputClearButton = document.createElement("div");
        this.inputClearButton.classList.add("geoapify-close-button");
        DomHelper.addIcon(this.inputClearButton, 'close');
        this.inputClearButton.addEventListener("click", this.clearFieldAndNotify.bind(this), false);
        this.inputWrapper.appendChild(this.inputClearButton);
    }
    isCategoryModeEnabled() {
        return !!this.options.addCategorySearch;
    }
    clearCategoryAndNotify() {
        if (!this.isCategoryModeEnabled())
            return;
        const wasCategoryActive = this.categoryManager.isCategoryModeActive();
        this.categoryManager.clearCategory();
        this.placesListManager.resetCategory();
        if (wasCategoryActive) {
            this.callbacks.notifyClear('category');
        }
    }
    async sendPlacesRequestOrAlt(categoryKeys, bias, filter, offset, limit) {
        if (this.sendPlacesRequestAlt) {
            return this.sendPlacesRequestAlt(categoryKeys, offset, this);
        }
        let url;
        if (Object.keys(bias || {}).length === 0 && Object.keys(filter || {}).length === 0) {
            const location = await PlacesApiHelper.getLocationForBias(this.apiKey, this.options, this.ipGeolocationUrl);
            url = PlacesApiHelper.generatePlacesUrl(categoryKeys, this.apiKey, this.options, this.placesApiUrl, offset, limit, location ? { [BY_PROXIMITY]: location } : undefined);
        }
        else {
            url = PlacesApiHelper.generatePlacesUrl(categoryKeys, this.apiKey, this.options, this.placesApiUrl, offset, limit, bias, filter);
        }
        return PlacesApiHelper.sendPlacesRequest(url);
    }
}
