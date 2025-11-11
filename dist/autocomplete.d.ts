import { Category, GeocoderEventType } from "./types/external";
export declare class GeocoderAutocomplete {
    private apiKey;
    private inputElement;
    private inputWrapper;
    private componentWrapper;
    private inputClearButton;
    private autocompleteItemsElement;
    private placesListManager;
    private focusedItemIndex;
    private currentItems;
    private currentCategories;
    private currentPromiseReject;
    private currentPlaceDetailsPromiseReject;
    private currentTimeout;
    private callbacks;
    private preprocessHook?;
    private postprocessHook?;
    private suggestionsFilter?;
    private sendGeocoderRequestAlt?;
    private sendPlaceDetailsRequestAlt?;
    private sendPlacesRequestAlt?;
    private geocoderUrl;
    private placeDetailsUrl;
    private placesApiUrl;
    private ipGeolocationUrl;
    private readonly categoryManager;
    private currentPlacesPromiseReject?;
    private lastEscKeyTime?;
    private readonly DOUBLE_ESC_THRESHOLD;
    private options;
    constructor(container: HTMLElement, apiKey: string, options?: GeocoderAutocompleteOptions);
    setType(type: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity' | null): void;
    setLang(lang: SupportedLanguage | null): void;
    setAddDetails(addDetails: boolean): void;
    setSkipIcons(skipIcons: boolean): void;
    setAllowNonVerifiedHouseNumber(allowNonVerifiedHouseNumber: boolean): void;
    setAllowNonVerifiedStreet(allowNonVerifiedStreet: boolean): void;
    setCountryCodes(codes: CountyCode[]): void;
    setPosition(position: GeoPosition): void;
    setLimit(limit: number): void;
    setPlacesLimit(limit: number): void;
    setValue(value: string): void;
    getValue(): string;
    addFilterByCountry(codes: ByCountryCodeOptions): void;
    addFilterByCircle(filterByCircle: ByCircleOptions): void;
    addFilterByRect(filterByRect: ByRectOptions): void;
    addFilterByPlace(filterByPlace: string): void;
    clearFilters(): void;
    addBiasByCountry(codes: ByCountryCodeOptions): void;
    addBiasByCircle(biasByCircle: ByCircleOptions): void;
    addBiasByRect(biasByRect: ByRectOptions): void;
    addBiasByProximity(biasByProximity: ByProximityOptions): void;
    clearBias(): void;
    setPlacesFilterByCircle(filterByCircle: ByCircleOptions): void;
    setPlacesFilterByRect(filterByRect: ByRectOptions): void;
    setPlacesFilterByPlace(filterByPlace: string): void;
    setPlacesFilterByGeometry(filterByGeometry: string): void;
    clearPlacesFilters(): void;
    setPlacesBiasByCircle(biasByCircle: ByCircleOptions): void;
    setPlacesBiasByRect(biasByRect: ByRectOptions): void;
    setPlacesBiasByProximity(biasByProximity: ByProximityOptions): void;
    clearPlacesBias(): void;
    on(operation: GeocoderEventType, callback: (param: any) => void): void;
    off(operation: GeocoderEventType, callback?: (param: any) => any): void;
    once(operation: GeocoderEventType, callback: (param: any) => any): void;
    setSuggestionsFilter(suggestionsFilterFunc?: ((suggestions: any[]) => any[]) | null): void;
    setPreprocessHook(preprocessHookFunc?: ((value: string) => string) | null): void;
    setPostprocessHook(postprocessHookFunc?: ((value: string) => string) | null): void;
    setSendGeocoderRequestFunc(sendGeocoderRequestFunc?: ((value: string, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) | null): void;
    setSendPlaceDetailsRequestFunc(sendPlaceDetailsRequestFunc?: ((feature: any, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) | null): void;
    setSendPlacesRequestFunc(sendPlacesRequestFunc?: ((category: string[], offset: number, geocoderAutocomplete: GeocoderAutocomplete) => Promise<any>) | null): void;
    isOpen(): boolean;
    close(): void;
    open(): void;
    private sendGeocoderRequestOrAlt;
    sendGeocoderRequest(value: string): Promise<any>;
    sendPlaceDetailsRequest(feature: any): Promise<any>;
    selectCategory(category: Category | string | string[] | null): Promise<void>;
    clearCategory(): Promise<void>;
    resendPlacesRequestForMore(appendPlaces?: boolean): Promise<void>;
    getCategory(): Category | null;
    selectPlace(index: number | null): void;
    sendPlacesRequest(): Promise<void>;
    onUserInput(event: Event): boolean;
    private onDropdownDataLoad;
    private populateCategoryDropdownItem;
    private populateDropdownItem;
    private addEventListenerOnDropdownClick;
    private createDropdown;
    private cancelPreviousTimeout;
    private cancelPreviousRequest;
    private addEventListeners;
    private showClearButton;
    private removeClearButton;
    private onUserKeyPress;
    private handleEscapeKey;
    private shouldClearCategoryOnDoubleEscape;
    private handleEnterEvent;
    private handleArrowUpEvent;
    private handleArrowDownEvent;
    private setActive;
    private setValueAndNotify;
    private clearFieldAndNotify;
    private closeDropDownList;
    private notifyValueSelected;
    private sendPlaceDetailsRequestOrAlt;
    private noNeedToRequestPlaceDetails;
    private cancelPreviousPlaceDetailsRequest;
    private cancelCurrentPlacesRequest;
    private openDropdownAgain;
    private constructOptions;
    private addClearButton;
    private isCategoryModeEnabled;
    private clearCategoryAndNotify;
    private sendPlacesRequestOrAlt;
}
export interface GeocoderAutocompleteOptions {
    type?: LocationType;
    lang?: SupportedLanguage;
    limit?: number;
    placeholder?: string;
    debounceDelay?: number;
    filter?: {
        [key: string]: ByCircleOptions | ByCountryCodeOptions | ByRectOptions | string;
    };
    bias?: {
        [key: string]: ByCircleOptions | ByCountryCodeOptions | ByRectOptions | ByProximityOptions;
    };
    skipIcons?: boolean;
    /**
     * @deprecated The property should not be used; it is true by default. Use the addDetails property to add details.
     */
    skipDetails?: boolean;
    addDetails?: boolean;
    skipSelectionOnArrowKey?: boolean;
    position?: GeoPosition;
    countryCodes?: CountyCode[];
    allowNonVerifiedHouseNumber?: boolean;
    allowNonVerifiedStreet?: boolean;
    addCategorySearch?: boolean;
    showPlacesList?: boolean;
    hidePlacesListAfterSelect?: boolean;
    enablePlacesLazyLoading?: boolean;
    placesLimit?: number;
    placesFilter?: {
        [key: string]: ByCircleOptions | ByRectOptions | string;
    };
    placesBias?: {
        [key: string]: ByCircleOptions | ByRectOptions | ByProximityOptions;
    };
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
