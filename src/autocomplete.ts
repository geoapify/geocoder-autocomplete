import { CalculationHelper } from "./helpers/calculation.helper";
import { DomHelper } from "./helpers/dom.helper";
import {
    BY_CIRCLE,
    BY_COUNTRYCODE,
    BY_PLACE,
    BY_PROXIMITY,
    BY_RECT
} from "./helpers/constants";
import { Callbacks } from "./helpers/callbacks";

export class GeocoderAutocomplete {

    private inputElement: HTMLInputElement;
    private inputClearButton: HTMLElement;
    private autocompleteItemsElement: HTMLElement = null;

    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    private focusedItemIndex: number;

    /* Current autocomplete items data (GeoJSON.Feature) */
    private currentItems: any;

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

    private geocoderUrl = "https://api.geoapify.com/v1/geocode/autocomplete";
    private placeDetailsUrl = "https://api.geoapify.com/v2/place-details";

    private options: GeocoderAutocompleteOptions = {
        limit: 5,
        debounceDelay: 100
    };

    constructor(private container: HTMLElement, private apiKey: string, options?: GeocoderAutocompleteOptions) {
        this.constructOptions(options);

        this.inputElement = document.createElement("input");
        DomHelper.createInputElement(this.inputElement, this.options, this.container);

        this.addClearButton();

        this.addEventListeners();
    }

    public setGeocoderUrl(geocoderUrl: string) {
        this.geocoderUrl = geocoderUrl;
    }

    public setPlaceDetailsUrl(placeDetailsUrl: string) {
        this.placeDetailsUrl = placeDetailsUrl;
    }

    public setType(type: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity') {
        this.options.type = type;
    }

    public setLang(lang: SupportedLanguage) {
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

    public on(operation: 'select' | 'suggestions' | 'input' | 'close' | 'open', callback: (param: any) => void) {
        this.callbacks.addCallback(operation, callback);
    }

    public off(operation: 'select' | 'suggestions' | 'input' | 'close' | 'open', callback?: (param: any) => any) {
        this.callbacks.removeCallback(operation, callback);
    }

    public once(operation: 'select' | 'suggestions' | 'input' | 'close' | 'open', callback: (param: any) => any) {
        this.on(operation, callback);

        const current = this;
        const currentListener = () => {
            current.off(operation, callback);
            current.off(operation, currentListener);
        }

        this.on(operation, currentListener);
    }

    public setSuggestionsFilter(suggestionsFilterFunc?: (suggestions: any[]) => any[]) {
        this.suggestionsFilter = CalculationHelper.returnIfFunction(suggestionsFilterFunc);
    }

    public setPreprocessHook(preprocessHookFunc?: (value: string) => string) {
        this.preprocessHook = CalculationHelper.returnIfFunction(preprocessHookFunc);
    }

    public setPostprocessHook(postprocessHookFunc?: (value: string) => string) {
        this.postprocessHook = CalculationHelper.returnIfFunction(postprocessHookFunc);
    }

    public setSendGeocoderRequestFunc(sendGeocoderRequestFunc: (value: string, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) {
        this.sendGeocoderRequestAlt = CalculationHelper.returnIfFunction(sendGeocoderRequestFunc);
    }

    public setSendPlaceDetailsRequestFunc(sendPlaceDetailsRequestFunc: (feature: any, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) {
        this.sendPlaceDetailsRequestAlt = CalculationHelper.returnIfFunction(sendPlaceDetailsRequestFunc);
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

    /* Execute a function when someone writes in the text field: */
    onUserInput(event: Event) {
        let currentValue = this.inputElement.value;
        let userEnteredValue = this.inputElement.value;

        this.callbacks.notifyInputChange(currentValue);

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

            let promise = this.sendGeocoderRequestOrAlt(currentValue);

            promise.then((data: any) => {
                this.onDropdownDataLoad(data, userEnteredValue, event);
            }, (err) => {
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

        if (!this.currentItems.length) {
            return;
        }

        this.createDropdown();

        this.currentItems.forEach((feature: any, index: number) => {
            this.populateDropdownItem(feature, userEnteredValue, event, index);
        });
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
            this.setValueAndNotify(this.currentItems[index])
        });
    }

    private createDropdown() {
        /*create a DIV element that will contain the items (values):*/
        this.autocompleteItemsElement = document.createElement("div");
        this.autocompleteItemsElement.setAttribute("class", "geoapify-autocomplete-items");

        this.callbacks.notifyOpened();

        /* Append the DIV element as a child of the autocomplete container:*/
        this.container.appendChild(this.autocompleteItemsElement);
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
                /* If the ESC key is presses, close the list */
                this.closeDropDownList();
            }
        } else {
            if (event.code == 'ArrowDown') {
                /* Open dropdown list again */
                this.openDropdownAgain();
            }
        }
    }

    private handleEnterEvent(event: KeyboardEvent) {
        /* If the ENTER key is pressed and value as selected, close the list*/
        event.preventDefault();
        if (this.focusedItemIndex > -1) {
            if (this.options.skipSelectionOnArrowKey) {
                // select the location if it wasn't selected by navigation
                this.setValueAndNotify(this.currentItems[this.focusedItemIndex]);
            } else {
                this.closeDropDownList();
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
            // Change input value and notify
            if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
                this.inputElement.value = this.postprocessHook(this.currentItems[index]);
            } else {
                this.inputElement.value = this.currentItems[index].properties.formatted;
            }
            this.notifyValueSelected(this.currentItems[index]);
        }
    }

    private setValueAndNotify(feature: any) {
        if (CalculationHelper.returnIfFunction(this.postprocessHook)) {
            this.inputElement.value = this.postprocessHook(feature);
        } else {
            this.inputElement.value = feature.properties.formatted;
        }

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

        this.closeDropDownList();

        // notify here
        this.notifyValueSelected(null);
    }

    private closeDropDownList() {
        if (this.autocompleteItemsElement) {
            this.container.removeChild(this.autocompleteItemsElement);
            this.autocompleteItemsElement = null;
            this.callbacks.notifyClosed();
        }
    }

    private notifyValueSelected(feature: any) {
        this.cancelPreviousPlaceDetailsRequest();

        if (this.noNeedToRequestPlaceDetails(feature)) {
            this.callbacks.notifyChange(feature);
        } else {
            let promise = this.sendPlaceDetailsRequestOrAlt(feature);

            promise.then((detailesFeature: any) => {
                this.callbacks.notifyChange(detailesFeature);
                this.currentPlaceDetailsPromiseReject = null;
            }, (err) => {
                if (!err.canceled) {
                    console.log(err);
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

    private openDropdownAgain() {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        this.inputElement.dispatchEvent(event);
    }

    private constructOptions(options: GeocoderAutocompleteOptions) {
        this.options = options ? {...this.options, ...options} : this.options;
        this.options.filter = this.options.filter || {};
        this.options.bias = this.options.bias || {};

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
        this.container.appendChild(this.inputClearButton);
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
