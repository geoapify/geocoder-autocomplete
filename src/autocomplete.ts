
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

    private geocoderUrl = "https://test.geoapify.com/v1/geocode/autocomplete";
    private options: GeocoderAutocompleteOptions = {
        limit: 5,
        size: 'medium'
    };

    constructor(private container: HTMLElement, private apiKey: string, options?: GeocoderAutocompleteOptions) {
        this.options = options ? { ...this.options, ...options } : this.options;

        // container must be positioned relative or absolute or sticky
        if (container.style.position !== "relative" && container.style.position !== "absulute" && container.style.position !== "sticky") {
            container.style.position = "relative";
        }

        // create input element
        this.inputElement = document.createElement("input");
        this.inputElement.setAttribute("type", "text");
        this.inputElement.setAttribute("placeholder", this.options.placeholder || "Enter an address here");

        const padding = this.options.size === 'small' ? 5 : (this.options.size === 'medium' ? 7 : 10);
        const buttonSize = this.options.size === 'small' ? 20 : (this.options.size === 'medium' ? 24 : 24);
        this.inputElement.style.padding = `${padding}px ${padding + buttonSize}px ${padding}px ${padding}px`;
        this.inputElement.style.width = `calc(100% - ${padding * 2 + buttonSize + 3}px)`;

        this.container.appendChild(this.inputElement);

        // add clear button to input element
        this.inputClearButton = document.createElement("div");
        this.inputClearButton.classList.add("close-button");
        this.addIcon(this.inputClearButton, 'close', buttonSize);
        this.inputClearButton.addEventListener("click", this.clearFieldAndNotify.bind(this), false);
        this.inputClearButton.style.position = "absolute";
        this.inputClearButton.style.right = "5px";
        this.inputClearButton.style.top = "0";

        this.container.appendChild(this.inputClearButton);

        this.inputElement.addEventListener('input', this.onUserInput.bind(this), false);
        this.inputElement.addEventListener('keydown', this.onUserKeyPress.bind(this), false);

        document.addEventListener("click", (event) => {
            if (event.target !== this.inputElement) {
                this.closeDropDownList();
            } else if (!this.container.querySelector(".autocomplete-items")) {
                // open dropdown list again
                this.openDropdownAgain();
            }
        });
    }

    public setType(type: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity') {
        this.options.type = type;
    }

    public setLang(lang: 'en' | 'de' | 'it' | 'fr') {
        this.options.lang = lang;
    }

    public setCountryCodes(codes: CountyCode[]) {
        this.options.countryCodes = codes;
    }

    public setPosition(position: GeoPosition) {
        this.options.position = position;
    }

    public setLimit(limit: number) {
        this.options.limit = limit;
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
        }

        if (!currentValue) {
            this.inputClearButton.classList.remove("visible");
            return false;
        }

        // Show clearButton when there is a text
        this.inputClearButton.classList.add("visible");


        /* Create a new promise and send geocoding request */
        const promise = new Promise((resolve, reject) => {
            this.currentPromiseReject = reject;
            let url = `${this.geocoderUrl}?text=${encodeURIComponent(currentValue)}&apiKey=${this.apiKey}`;

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

            if (this.options.countryCodes) {
                url += `&lang=${this.options.countryCodes.join(',')}`;
            }

            if (this.options.position) {
                url += `&lat=${this.options.position.lat}&lon=${this.options.position.lon}`;
            }

            console.log(url);

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
            console.log(data);

            this.currentItems = data.features;

            /*create a DIV element that will contain the items (values):*/
            this.autocompleteItemsElement = document.createElement("div");
            this.autocompleteItemsElement.setAttribute("class", "autocomplete-items");

            /* Append the DIV element as a child of the autocomplete container:*/
            this.container.appendChild(this.autocompleteItemsElement);
            /* For each item in the results */
            data.features.forEach((feature: any, index: number) => {
                /* Create a DIV element for each element: */
                var itemElement = document.createElement("DIV");
                var valueIndex = feature.properties.formatted.toLowerCase()
                    .indexOf(currentValue.toLowerCase());
                if (valueIndex >= 0) {
                    itemElement.innerHTML = feature.properties.formatted.substring(0, valueIndex) +
                        `<strong>${feature.properties.formatted.substring(valueIndex, valueIndex + currentValue.length)}</strong>` +
                        feature.properties.formatted.substring(valueIndex + currentValue.length);

                } else {
                    itemElement.innerHTML = feature.properties.formatted;

                }

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
            items[i].classList.remove("autocomplete-active");
        }

        /* Add class "autocomplete-active" to the active element*/
        items[index].classList.add("autocomplete-active");

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

    private addIcon(element: HTMLElement, icon: string, size: number) {
        const icons: { [key: string]: string } = {
            'close': "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        }

        var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('viewBox', "0 0 24 24");
        svgElement.setAttribute('height', size.toString());

        var iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        iconElement.setAttribute("d", icons[icon]);
        iconElement.setAttribute('fill', 'currentColor');
        svgElement.appendChild(iconElement);
        element.appendChild(svgElement);
    }

    private notifyValueSelected(feature: any) {
        // notify here
    }

    private openDropdownAgain() {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        this.inputElement.dispatchEvent(event);
    }
}

export interface GeocoderAutocompleteOptions extends GeocoderAutocompleteAppearance {
    type?: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity';
    lang?: 'en' | 'de' | 'it' | 'fr';
    position?: GeoPosition;
    countryCodes?: CountyCode[];
    limit?: number;
}

export interface GeoPosition {
    lat: number;
    lon: number;
}

export interface GeocoderAutocompleteAppearance {
    placeholder?: string;
    size?: 'small' | 'medium' | 'large';
}


export type CountyCode = "ad" | "ae" | "af" | "ag" | "ai" | "al" | "am" | "an" | "ao" | "ap" | "aq" | "ar" | "as" | "at" | "au" | "aw" | "az" | "ba" | "bb" | "bd" | "be" | "bf" | "bg" | "bh" | "bi" | "bj" | "bm" | "bn" | "bo" | "br" | "bs" | "bt" | "bv" | "bw" | "by" | "bz" | "ca" | "cc" | "cd" | "cf" | "cg" | "ch" | "ci" | "ck" | "cl" | "cm" | "cn" | "co" | "cr" | "cu" | "cv" | "cx" | "cy" | "cz" | "de" | "dj" | "dk" | "dm" | "do" | "dz" | "ec" | "ee" | "eg" | "eh" | "er" | "es" | "et" | "eu" | "fi" | "fj" | "fk" | "fm" | "fo" | "fr" | "ga" | "gb" | "gd" | "ge" | "gf" | "gh" | "gi" | "gl" | "gm" | "gn" | "gp" | "gq" | "gr" | "gs" | "gt" | "gu" | "gw" | "gy" | "hk" | "hm" | "hn" | "hr" | "ht" | "hu" | "id" | "ie" | "il" | "in" | "io" | "iq" | "ir" | "is" | "it" | "jm" | "jo" | "jp" | "ke" | "kg" | "kh" | "ki" | "km" | "kn" | "kp" | "kr" | "kw" | "ky" | "kz" | "la" | "lb" | "lc" | "li" | "lk" | "lr" | "ls" | "lt" | "lu" | "lv" | "ly" | "ma" | "mc" | "md" | "me" | "mg" | "mh" | "mk" | "ml" | "mm" | "mn" | "mo" | "mp" | "mq" | "mr" | "ms" | "mt" | "mu" | "mv" | "mw" | "mx" | "my" | "mz" | "na" | "nc" | "ne" | "nf" | "ng" | "ni" | "nl" | "no" | "np" | "nr" | "nu" | "nz" | "om" | "pa" | "pe" | "pf" | "pg" | "ph" | "pk" | "pl" | "pm" | "pr" | "ps" | "pt" | "pw" | "py" | "qa" | "re" | "ro" | "rs" | "ru" | "rw" | "sa" | "sb" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sj" | "sk" | "sl" | "sm" | "sn" | "so" | "sr" | "st" | "sv" | "sy" | "sz" | "tc" | "td" | "tf" | "tg" | "th" | "tj" | "tk" | "tm" | "tn" | "to" | "tr" | "tt" | "tv" | "tw" | "tz" | "ua" | "ug" | "um" | "us" | "uy" | "uz" | "va" | "vc" | "ve" | "vg" | "vi" | "vn" | "vu" | "wf" | "ws" | "ye" | "yt" | "za" | "zm" | "zw";