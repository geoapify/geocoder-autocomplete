import { GeocoderAutocompleteOptions } from "../autocomplete";
export declare class DomHelper {
    static createInputElement(inputElement: HTMLInputElement, options: GeocoderAutocompleteOptions, container: HTMLElement): HTMLElement;
    static addFeatureIcon(element: HTMLElement, type: string, countryCode: string): void;
    static addIcon(element: HTMLElement, icon: string): void;
    static addSpinnerIcon(element: HTMLElement): void;
    private static appendHighlightedText;
    private static appendNonVerifiedText;
    static getStyledAddressSingleValue(value: string, currentValue: string): HTMLElement;
    static getStyledAddress(featureProperties: any, currentValue: string): DocumentFragment;
    static addDropdownIcon(feature: any, itemElement: HTMLDivElement): void;
    static addActiveClassToDropdownItem(items: HTMLCollectionOf<HTMLDivElement>, index: number): void;
    static createDropdownItemText(): HTMLSpanElement;
    static createDropdownItem(): HTMLDivElement;
}
