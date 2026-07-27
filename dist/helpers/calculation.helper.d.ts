import { GeocoderAutocompleteOptions } from "../autocomplete";
export declare class CalculationHelper {
    static isLatitude(num: any): boolean;
    static isLongitude(num: any): boolean;
    static isNotOpenStreetMapData(feature: any): boolean;
    static extendByNonVerifiedValues(options: GeocoderAutocompleteOptions, features: any, parsedAddress: any): void;
    private static addHouseNumberToFormatted;
    static generatePlacesUrl(placeDetailsUrl: string, placeId: string, apiKey: string, options: GeocoderAutocompleteOptions): string;
    static needToFilterDataBySuggestionsFilter(currentItems: any, suggestionsFilter?: (suggetions: any[]) => any[]): boolean;
    static needToCalculateExtendByNonVerifiedValues(data: any, options: GeocoderAutocompleteOptions): boolean;
    static generateUrl(value: string, geocoderUrl: string, apiKey: string, options: GeocoderAutocompleteOptions): string;
    static returnIfFunction(func: any): any;
}
