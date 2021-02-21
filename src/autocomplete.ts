
import countiesData from "./countries.json";

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

    private changeCallbacks: ((selectedOption: any) => any)[] = [];
    private suggestionsChangeCallbacks: ((options: any[]) => any)[] = [];
    private focusChangeCallbacks: ((options?: any) => any)[] = [];

    private geocoderUrl = "https://api.geoapify.com/v1/geocode/autocomplete";
    private placeDetailsUrl = "https://api.geoapify.com/v2/place-details";

    private options: GeocoderAutocompleteOptions = {
        limit: 5,
        debounceDelay: 100
    };

    private BY_COUNTRYCODE = 'countrycode';
    private BY_RECT = 'rect';
    private BY_CIRCLE = 'circle';
    private BY_PROXIMITY = 'proximity';

    constructor(private container: HTMLElement, private apiKey: string, options?: GeocoderAutocompleteOptions) {
        this.options = options ? { ...this.options, ...options } : this.options;
        this.options.filter = this.options.filter || {};
        this.options.bias = this.options.bias || {};

        if (this.options.countryCodes) {
            this.addFilterByCountry(this.options.countryCodes);
        }

        if (this.options.position) {
            this.addBiasByProximity(this.options.position);
        }

        // create input element
        this.inputElement = document.createElement("input");
        this.inputElement.classList.add("geoapify-autocomplete-input");
        this.inputElement.setAttribute("type", "text");
        this.inputElement.setAttribute("placeholder", this.options.placeholder || "Enter an address here");
        this.container.appendChild(this.inputElement);

        // add clear button to input element
        this.inputClearButton = document.createElement("div");
        this.inputClearButton.classList.add("geoapify-close-button");
        this.addIcon(this.inputClearButton, 'close');
        this.inputClearButton.addEventListener("click", this.clearFieldAndNotify.bind(this), false);

        this.container.appendChild(this.inputClearButton);

        this.inputElement.addEventListener('input', this.onUserInput.bind(this), false);
        this.inputElement.addEventListener('keydown', this.onUserKeyPress.bind(this), false);
        this.inputElement.addEventListener('focus', this.onUserFocus.bind(this), false);

        document.addEventListener("click", (event) => {
            if (event.target !== this.inputElement) {
                this.closeDropDownList();
            } else if (!this.autocompleteItemsElement) {
                // open dropdown list again
                this.openDropdownAgain();
            }
        });
    }

    public setType(type: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity') {
        this.options.type = type;
    }

    public setLang(lang: SupportedLanguage) {
        this.options.lang = lang;
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

    public addFilterByCountry(codes: ByCountryCodeOptions) {
        this.options.filter[this.BY_COUNTRYCODE] = codes;
    }

    public addFilterByCircle(filterByCircle: ByCircleOptions) {
        this.options.filter[this.BY_CIRCLE] = filterByCircle;
    }

    public addFilterByRect(filterByRect: ByRectOptions) {
        this.options.filter[this.BY_RECT] = filterByRect;
    }

    public clearFilters() {
        this.options.filter = {};
    }

    public addBiasByCountry(codes: ByCountryCodeOptions) {
        this.options.bias[this.BY_COUNTRYCODE] = codes;
    }

    public addBiasByCircle(biasByCircle: ByCircleOptions) {
        this.options.bias[this.BY_CIRCLE] = biasByCircle;
    }

    public addBiasByRect(biasByRect: ByRectOptions) {
        this.options.bias[this.BY_RECT] = biasByRect;
    }

    public addBiasByProximity(biasByProximity: ByProximityOptions) {
        this.options.bias[this.BY_PROXIMITY] = biasByProximity;
    }

    public clearBias() {
        this.options.bias = {};
    }

    public on(operation: 'select' | 'suggestions' | 'focus', callback: (param: any) => any) {
        if (operation === 'select' && this.changeCallbacks.indexOf(callback) < 0) {
            this.changeCallbacks.push(callback);
        }

        if (operation === 'suggestions' && this.suggestionsChangeCallbacks.indexOf(callback) < 0) {
            this.suggestionsChangeCallbacks.push(callback);
        }

        if (operation === 'focus' && this.focusChangeCallbacks.indexOf(callback) < 0) {
            this.focusChangeCallbacks.push(callback);
        }
    }

    public off(operation: 'select' | 'suggestions' | 'focus', callback: (param: any) => any) {
        if (operation === 'select' && this.changeCallbacks.indexOf(callback) >= 0) {
            this.changeCallbacks.splice(this.changeCallbacks.indexOf(callback), 1);
        }

        if (operation === 'suggestions' && this.suggestionsChangeCallbacks.indexOf(callback) >= 0) {
            this.suggestionsChangeCallbacks.splice(this.suggestionsChangeCallbacks.indexOf(callback), 1);
        }

        if (operation === 'focus' && this.focusChangeCallbacks.indexOf(callback) < 0) {
            this.focusChangeCallbacks.splice(this.suggestionsChangeCallbacks.indexOf(callback), 1);
        }
    }

    onUserFocus() { 
        this.focusChangeCallbacks.forEach(callback => callback());
    }

    /* Execute a function when someone writes in the text field: */
    onUserInput(event: Event) {
        var currentValue = this.inputElement.value;

        /* Close any already open dropdown list */
        this.closeDropDownList();

        this.focusedItemIndex = -1;

        // Cancel previous request
        if (this.currentPromiseReject) {
            this.currentPromiseReject({
                canceled: true
            });
            this.currentPromiseReject = null;
        }

        // Cancel previous timeout
        if (this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        if (!currentValue) {
            this.inputClearButton.classList.remove("visible");
            return false;
        }

        // Show clearButton when there is a text
        this.inputClearButton.classList.add("visible");


        this.currentTimeout = window.setTimeout(() => {
            /* Create a new promise and send geocoding request */
            const promise = new Promise((resolve, reject) => {
                this.currentPromiseReject = reject;
                let url = this.generateUrl(currentValue);

                fetch(url)
                    .then((response) => {
                        if (response.ok) {
                            response.json().then(data => resolve(data));
                        } else {
                            response.json().then(data => reject(data));
                        }
                    });
            });

            promise.then((data: any) => {
                this.currentItems = data.features;
                this.notifySuggestions(this.currentItems);

                if (!this.currentItems.length) {
                    return;
                }

                /*create a DIV element that will contain the items (values):*/
                this.autocompleteItemsElement = document.createElement("div");
                this.autocompleteItemsElement.setAttribute("class", "geoapify-autocomplete-items");

                /* Append the DIV element as a child of the autocomplete container:*/
                this.container.appendChild(this.autocompleteItemsElement);
                /* For each item in the results */
                data.features.forEach((feature: any, index: number) => {
                    /* Create a DIV element for each element: */
                    const itemElement = document.createElement("div");
                    itemElement.classList.add('geoapify-autocomplete-item');


                    if (!this.options.skipIcons) {
                        const iconElement = document.createElement("span");
                        iconElement.classList.add('icon');

                        this.addFeatureIcon(iconElement, feature.properties.result_type, feature.properties.country_code);

                        itemElement.appendChild(iconElement);
                    }

                    const textElement = document.createElement("span");
                    textElement.classList.add('address');
                    textElement.innerHTML = this.getStyledAddress(feature.properties, currentValue);
                    itemElement.appendChild(textElement);

                    itemElement.addEventListener("click", (e) => {
                        event.stopPropagation();
                        this.setValueAndNotify(this.currentItems[index])
                    });
                    this.autocompleteItemsElement.appendChild(itemElement);
                });
            }, (err) => {
                if (!err.canceled) {
                    console.log(err);
                }
            });
        }, this.options.debounceDelay);
    }

    private getStyledAddress(featureProperties: any, currentValue: string): string {
        let mainPart;
        let secondaryPart;
        const parts = featureProperties.formatted.split(',').map((part: string) => part.trim());

        if (featureProperties.name) {
            mainPart = parts[0];
            secondaryPart = parts.slice(1).join(', ');
        } else {
            const mainElements = Math.min(2, Math.max(parts.length - 2, 1));
            mainPart = parts.slice(0, mainElements).join(', ');
            secondaryPart = parts.slice(mainElements).join(', ');
        }

        const valueIndex = mainPart.toLowerCase().indexOf(currentValue.toLowerCase());
        if (valueIndex >= 0) {
            mainPart = mainPart.substring(0, valueIndex) +
                `<strong>${mainPart.substring(valueIndex, valueIndex + currentValue.length)}</strong>` +
                mainPart.substring(valueIndex + currentValue.length);

        }

        return `<span class="main-part">${mainPart}</span><span class="secondary-part">${secondaryPart}</span>`
    }

    private onUserKeyPress(event: KeyboardEvent) {
        if (this.autocompleteItemsElement) {

            const itemElements: HTMLCollectionOf<HTMLDivElement> = this.autocompleteItemsElement.getElementsByTagName("div");
            if (event.keyCode == 40) {
                event.preventDefault();

                /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
                this.focusedItemIndex++;
                if (this.focusedItemIndex >= itemElements.length) this.focusedItemIndex = 0;
                /*and and make the current item more visible:*/
                this.setActive(itemElements, this.focusedItemIndex);
            } else if (event.keyCode == 38) {
                event.preventDefault();

                /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
                this.focusedItemIndex--;
                if (this.focusedItemIndex < 0) this.focusedItemIndex = (itemElements.length - 1);
                /*and and make the current item more visible:*/
                this.setActive(itemElements, this.focusedItemIndex);
            } else if (event.keyCode == 13) {
                /* If the ENTER key is pressed and value as selected, close the list*/
                event.preventDefault();
                if (this.focusedItemIndex > -1) {
                    this.closeDropDownList();
                }
            }
        } else {
            if (event.keyCode == 40) {
                /* Open dropdown list again */
                this.openDropdownAgain();
            }
        }
    }

    private setActive(items: HTMLCollectionOf<HTMLDivElement>, index: number) {
        if (!items || !items.length) return false;

        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("active");
        }

        /* Add class "autocomplete-active" to the active element*/
        items[index].classList.add("active");

        // Change input value and notify
        this.inputElement.value = this.currentItems[index].properties.formatted;
        this.notifyValueSelected(this.currentItems[index]);
    }


    private setValueAndNotify(feature: any) {
        this.inputElement.value = feature.properties.formatted;
        this.notifyValueSelected(feature);

        /* Close the list of autocompleted values: */
        this.closeDropDownList();
    }

    private clearFieldAndNotify(event: MouseEvent) {
        event.stopPropagation();
        this.inputElement.value = '';
        this.inputClearButton.classList.remove("visible");

        // Cancel previous request
        if (this.currentPromiseReject) {
            this.currentPromiseReject({
                canceled: true
            });
            this.currentPromiseReject = null;
        }

        // Cancel previous timeout
        if (this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        this.closeDropDownList();

        // notify here
        this.notifyValueSelected(null);
    }

    private closeDropDownList() {
        if (this.autocompleteItemsElement) {
            this.container.removeChild(this.autocompleteItemsElement);
            this.autocompleteItemsElement = null;
        }
    }

    private addIcon(element: HTMLElement, icon: string) {

        //FortAwesome icons 5. Licence - https://fontawesome.com/license/free

        const icons: { [key: string]: any } = {
            "close": {
                path: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
                viewbox: "0 0 24 24"
            },
            "map-marker": {
                path: "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z",
                viewbox: "0 0 384 512"
            },
            "road": {
                path: "M573.19 402.67l-139.79-320C428.43 71.29 417.6 64 405.68 64h-97.59l2.45 23.16c.5 4.72-3.21 8.84-7.96 8.84h-29.16c-4.75 0-8.46-4.12-7.96-8.84L267.91 64h-97.59c-11.93 0-22.76 7.29-27.73 18.67L2.8 402.67C-6.45 423.86 8.31 448 30.54 448h196.84l10.31-97.68c.86-8.14 7.72-14.32 15.91-14.32h68.8c8.19 0 15.05 6.18 15.91 14.32L348.62 448h196.84c22.23 0 36.99-24.14 27.73-45.33zM260.4 135.16a8 8 0 0 1 7.96-7.16h39.29c4.09 0 7.53 3.09 7.96 7.16l4.6 43.58c.75 7.09-4.81 13.26-11.93 13.26h-40.54c-7.13 0-12.68-6.17-11.93-13.26l4.59-43.58zM315.64 304h-55.29c-9.5 0-16.91-8.23-15.91-17.68l5.07-48c.86-8.14 7.72-14.32 15.91-14.32h45.15c8.19 0 15.05 6.18 15.91 14.32l5.07 48c1 9.45-6.41 17.68-15.91 17.68z",
                viewbox: "0 0 576 512"
            },
            "city": {
                path: "M616 192H480V24c0-13.26-10.74-24-24-24H312c-13.26 0-24 10.74-24 24v72h-64V16c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v80h-64V16c0-8.84-7.16-16-16-16H80c-8.84 0-16 7.16-16 16v80H24c-13.26 0-24 10.74-24 24v360c0 17.67 14.33 32 32 32h576c17.67 0 32-14.33 32-32V216c0-13.26-10.75-24-24-24zM128 404c0 6.63-5.37 12-12 12H76c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12H76c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12H76c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm128 192c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm160 96c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12V76c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm160 288c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40zm0-96c0 6.63-5.37 12-12 12h-40c-6.63 0-12-5.37-12-12v-40c0-6.63 5.37-12 12-12h40c6.63 0 12 5.37 12 12v40z",
                viewbox: "0 0 640 512"
            }
        }

        var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('viewBox', icons[icon].viewbox);
        svgElement.setAttribute('height', "24");

        var iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        iconElement.setAttribute("d", icons[icon].path);
        iconElement.setAttribute('fill', 'currentColor');
        svgElement.appendChild(iconElement);
        element.appendChild(svgElement);
    }

    private addFeatureIcon(element: HTMLElement, type: string, countryCode: string) {
        const iconMap: any = {
            'unknown': 'map-marker',
            'amenity': 'map-marker',
            'building': 'map-marker',
            'street': 'road',
            'suburb': 'city',
            'district': 'city',
            'postcode': 'city',
            'city': 'city',
            'county': 'city',
            'state': 'city'
        };

        const countryData = countiesData.find(county => countryCode && county.code.toLowerCase() === countryCode.toLowerCase());

        if ((type === 'country') && countryData) {
            element.classList.add("emoji");;
            const emojiElement = document.createElement('span');
            emojiElement.innerText = countryData.emoji;
            element.appendChild(emojiElement);
        } else if (iconMap[type]) {
            this.addIcon(element, iconMap[type])
        } else {
            this.addIcon(element, 'map-marker');
        }
    }

    private notifyValueSelected(feature: any) {

        // Cancel previous place details request
        if (this.currentPlaceDetailsPromiseReject) {
            this.currentPlaceDetailsPromiseReject({
                canceled: true
            });
            this.currentPlaceDetailsPromiseReject = null;
        }

        if (this.options.skipDetails || !feature) {
            this.changeCallbacks.forEach(callback => callback(feature));
        } else {
            const promise = new Promise((resolve, reject) => {
                this.currentPlaceDetailsPromiseReject = reject;
                let url = this.generatePlacesUrlUrl(feature.properties.place_id);

                fetch(url)
                    .then((response) => {
                        if (response.ok) {
                            response.json().then(data => resolve(data));
                        } else {
                            response.json().then(data => reject(data));
                        }
                    });
            });


            promise.then((data: any) => {

                if (!data.features.length) {
                    this.changeCallbacks.forEach(callback => callback(feature));
                    return;
                }

                const placeDetails = data.features[0];
                this.changeCallbacks.forEach(callback => callback(placeDetails));
                this.currentPlaceDetailsPromiseReject = null;

            }, (err) => {
                if (!err.canceled) {
                    console.log(err);
                }
            });
        }
    }

    private notifySuggestions(features: any) {
        this.suggestionsChangeCallbacks.forEach(callback => callback(features));
    }

    private openDropdownAgain() {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        this.inputElement.dispatchEvent(event);
    }

    private generatePlacesUrlUrl(placeId: string): string {
        let url = `${this.placeDetailsUrl}?id=${placeId}&apiKey=${this.apiKey}`;
        if (this.options.lang) {
            url += `&lang=${this.options.lang}`;
        }
        return url;
    }

    private generateUrl(value: string): string {
        let url = `${this.geocoderUrl}?text=${encodeURIComponent(value)}&apiKey=${this.apiKey}`;
        // Add type of the location if set. Learn more about possible parameters on https://apidocs.geoapify.com/docs/geocoding/api/api
        if (this.options.type) {
            url += `&type=${this.options.type}`;
        }

        if (this.options.limit) {
            url += `&limit=${this.options.limit}`;
        }

        if (this.options.lang) {
            url += `&lang=${this.options.lang}`;
        }

        const filters = [];
        const filterByCountryCodes: ByCountryCodeOptions = this.options.filter[this.BY_COUNTRYCODE] as ByCountryCodeOptions;
        const filterByCircle: ByCircleOptions = this.options.filter[this.BY_CIRCLE] as ByCircleOptions;
        const filterByRect: ByRectOptions = this.options.filter[this.BY_RECT] as ByRectOptions;

        if (filterByCountryCodes && filterByCountryCodes.length) {
            filters.push(`countrycode:${filterByCountryCodes.join(',').toLowerCase()}`);
        }

        if (filterByCircle && this.isLatitude(filterByCircle.lat) && this.isLongitude(filterByCircle.lon) && filterByCircle.radiusMeters > 0) {
            filters.push(`circle:${filterByCircle.lon},${filterByCircle.lat},${filterByCircle.radiusMeters}`);
        }

        if (filterByRect && this.isLatitude(filterByRect.lat1) && this.isLongitude(filterByRect.lon1) && this.isLatitude(filterByRect.lat2) && this.isLongitude(filterByRect.lon2)) {
            filters.push(`rect:${filterByRect.lon1},${filterByRect.lat1},${filterByRect.lon2},${filterByRect.lat2}`);
        }
        url += filters.length ? `&filter=${filters.join('|')}` : '';

        const bias = [];
        const biasByCountryCodes: ByCountryCodeOptions = this.options.bias[this.BY_COUNTRYCODE] as ByCountryCodeOptions;
        const biasByCircle: ByCircleOptions = this.options.bias[this.BY_CIRCLE] as ByCircleOptions;
        const biasByRect: ByRectOptions = this.options.bias[this.BY_RECT] as ByRectOptions;
        const biasByProximity: ByProximityOptions = this.options.bias[this.BY_PROXIMITY] as ByProximityOptions;

        if (biasByCountryCodes && biasByCountryCodes.length) {
            bias.push(`countrycode:${biasByCountryCodes.join(',').toLowerCase()}`);
        }

        if (biasByCircle && this.isLatitude(biasByCircle.lat) && this.isLongitude(biasByCircle.lon) && biasByCircle.radiusMeters > 0) {
            bias.push(`circle:${biasByCircle.lon},${biasByCircle.lat},${biasByCircle.radiusMeters}`);
        }

        if (biasByRect && this.isLatitude(biasByRect.lat1) && this.isLongitude(biasByRect.lon1) && this.isLatitude(biasByRect.lat2) && this.isLongitude(biasByRect.lon2)) {
            bias.push(`rect:${biasByRect.lon1},${biasByRect.lat1},${biasByRect.lon2},${biasByRect.lat2}`);
        }

        if (biasByProximity && this.isLatitude(biasByProximity.lat) && this.isLongitude(biasByProximity.lon)) {
            bias.push(`proximity:${biasByProximity.lon},${biasByProximity.lat}`);
        }

        url += bias.length ? `&bias=${bias.join('|')}` : '';

        return url;
    }

    private isLatitude(num: any) {
        return num !== '' && num !== null && isFinite(num) && Math.abs(num) <= 90;
    }

    private isLongitude(num: any) {
        return num !== '' && num !== null && isFinite(num) && Math.abs(num) <= 180;
    }
}

export interface GeocoderAutocompleteOptions {
    type?: LocationType;
    lang?: SupportedLanguage;
    limit?: number;
    placeholder?: string;
    debounceDelay?: number;

    filter?: { [key: string]: ByCircleOptions | ByCountryCodeOptions | ByRectOptions },
    bias?: { [key: string]: ByCircleOptions | ByCountryCodeOptions | ByRectOptions | ByProximityOptions },

    skipIcons?: boolean;
    skipDetails?: boolean;

    // to remove in the next version
    position?: GeoPosition;
    countryCodes?: CountyCode[];
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
