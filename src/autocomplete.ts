
export default class GeocoderAutocomplete {

    private geocoderUrl = "https://test.geoapify.com/v1/geocode/autocomplete";
    constructor(container: HTMLElement, apiKey: string, options?: GeocoderAutocompleteOptions) {

    }
}

export interface GeocoderAutocompleteOptions {
    type: 'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity';
    lang:  'en' | 'de' | 'it' | 'fr';
    position: GeoPosition;
    limit: number;
}

export interface GeoPosition {
    lat: number;
    lon: number;
}