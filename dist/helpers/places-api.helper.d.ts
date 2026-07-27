import { GeocoderAutocompleteOptions, GeoPosition, ByProximityOptions, ByCircleOptions, ByRectOptions } from "../autocomplete";
export declare class PlacesApiHelper {
    static generatePlacesUrl(category: string[], apiKey: string, options: GeocoderAutocompleteOptions, placesApiUrl: string, offset?: number, limit?: number, bias?: {
        [key: string]: ByProximityOptions | ByCircleOptions | ByRectOptions;
    }, filter?: {
        [key: string]: ByCircleOptions | ByRectOptions | string;
    }): string;
    static sendPlacesRequest(url: string): Promise<any>;
    static getLocationForBias(apiKey: string, options: GeocoderAutocompleteOptions, ipGeolocationUrl: string): Promise<GeoPosition | null>;
    static convertGeocoderBiasToPlacesApiBias(bias?: {
        [key: string]: any;
    }): {
        [key: string]: ByProximityOptions | ByCircleOptions | ByRectOptions;
    } | undefined;
    static convertGeocoderFilterToPlacesApiFilter(filter?: {
        [key: string]: any;
    }): {
        [key: string]: ByCircleOptions | ByRectOptions | string;
    } | undefined;
    private static generatePlacesApiFilterString;
    private static generatePlacesApiBiasString;
}
