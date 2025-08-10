import { GeocoderAutocomplete } from "../src";
import fetchMock from "jest-fetch-mock";
import '@testing-library/jest-dom';
import { mockResponseWithData, options } from "./test-data";

export const WAIT_TIME = 200;
export const APP_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

export function reset(autocomplete: GeocoderAutocomplete) {
    autocomplete.clearFilters();
    autocomplete.clearBias();
}

export function getPrivateProperty(object: any, field: any) {
    return object[field];
}

export function checkIfClearButtonInitialized(container: HTMLDivElement) {
    const clearButton = container.querySelector('.geoapify-close-button');
    expect(clearButton).toHaveClass('geoapify-close-button');

    const svgElement = clearButton?.querySelector('svg');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');

    const pathElement = svgElement?.querySelector('path');
    expect(pathElement).toHaveAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'); // Example path for "close" icon
    expect(pathElement).toHaveAttribute('fill', 'currentColor');

}

export function checkIfInputInitialized(container: HTMLDivElement) {
    const inputElement = container.querySelector('input') as HTMLInputElement;
    expect(inputElement).toHaveClass('geoapify-autocomplete-input');

    expect(inputElement).toHaveAttribute('type', 'text');

    expect(inputElement).toHaveAttribute('placeholder', 'Search location');
}


export function createGeocoderAutocomplete(divElement: HTMLDivElement) {
    const myAPIKey = "XXXXX";
    return new GeocoderAutocomplete(
        divElement,
        myAPIKey, options);
}

export function inputText(container: HTMLDivElement, text: string) {
    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = text;

    const event = new Event('input', {bubbles: true, cancelable: true});
    inputElement.dispatchEvent(event);
}

export function inputTextWithEvent(container: HTMLDivElement, text: string, eventType: string) {
    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = text;

    const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code: eventType,
        key: eventType
    });
    inputElement.dispatchEvent(event);
}

export async function wait(millis: number) {
    await new Promise(res => setTimeout(res, millis));
}

export async function inputValueAndReturnResponse(container: HTMLDivElement, data: any) {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(data));

    inputText(container, "123");

    await wait(WAIT_TIME);
}

export async function inputValueAndExpectTheRequest(container: HTMLDivElement, request: string) {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithData));

    inputText(container, "123");

    await wait(WAIT_TIME);

    expect(fetchMock).toHaveBeenCalledWith(request);
}

export async function inputValueAndDontExpectTheRequest(container: HTMLDivElement) {
    fetchMock.resetMocks();
    inputText(container, "123");

    await wait(WAIT_TIME);

    expect(fetchMock).toHaveBeenCalledTimes(0);
}

export async function inputValueAndPopulateDropdown(container: HTMLDivElement) {
    await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
}

export function clickOutside() {
    const outsideElement = document.createElement('div'); // Create a new element to click outside
    document.body.appendChild(outsideElement);
    outsideElement.click(); // Simulate click on the outside eleme
    document.body.removeChild(outsideElement);
}

export function selectDropdownItem(container: HTMLDivElement, itemIndex: number) {
    let selectedItem = getDropDownItem(container, itemIndex);
    selectedItem.click();
}

export function getDropDownItem(container: HTMLDivElement, itemIndex: number) {
    const dropdown = container.querySelector('.geoapify-autocomplete-items');
    const items = dropdown?.querySelectorAll('.geoapify-autocomplete-item');
    return items[itemIndex] as HTMLDivElement;
}

export function getDropDownItemValue(container: HTMLDivElement, itemIndex: number) {
    let selectedItem = getDropDownItem(container, itemIndex);
    let spanItem = selectedItem.getElementsByClassName("main-part")[0];
    return spanItem.innerHTML;
}

export function expectDropdownIsClosed(container: HTMLDivElement) {
    expect(container.querySelector('.geoapify-autocomplete-items')).toBeNull();
}

export function addSelectSpy(autocomplete: GeocoderAutocomplete) {
    const selectSpy = jest.fn();
    autocomplete.on('select', selectSpy);
    return selectSpy;
}

export function addSuggestionsSpy(autocomplete: GeocoderAutocomplete) {
    const suggestionChangeSpy = jest.fn();
    autocomplete.on('suggestions', suggestionChangeSpy);
    return suggestionChangeSpy;
}

export function addRequestStartSpy(autocomplete: GeocoderAutocomplete) {
    const requestStartSpy = jest.fn();
    autocomplete.on('request_start', requestStartSpy);
    return requestStartSpy;
}

export function addRequestEndSpy(autocomplete: GeocoderAutocomplete) {
    const requestEndSpy = jest.fn();
    autocomplete.on('request_end', requestEndSpy);
    return requestEndSpy;
}