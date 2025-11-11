import { GeocoderAutocompleteOptions } from "../autocomplete";
export declare class DomHelper {
    static createInputElement(inputElement: HTMLInputElement, options: GeocoderAutocompleteOptions, container: HTMLElement): HTMLElement;
    static addFeatureIcon(element: HTMLElement, type: string, countryCode: string): void;
    static addIcon(element: HTMLElement, icon: string): void;
    static addSpinnerIcon(element: HTMLElement): void;
    static getStyledAddressSingleValue(value: string, currentValue: string): string;
    static getStyledAddress(featureProperties: any, currentValue: string): string;
    static addDropdownIcon(feature: any, itemElement: HTMLDivElement): void;
    static addActiveClassToDropdownItem(items: HTMLCollectionOf<HTMLDivElement>, index: number): void;
    static createDropdownItemText(): HTMLSpanElement;
    static createDropdownItem(): HTMLDivElement;
}
