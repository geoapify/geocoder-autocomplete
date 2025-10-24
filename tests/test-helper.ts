import { GeocoderAutocomplete } from "../src";
import { Category } from "../src";
import { CategoryManager } from "../src/helpers/category.helper";

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
    return items![itemIndex] as HTMLDivElement;
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

// ========================================================================
// CATEGORY AND PLACES HELPER FUNCTIONS
// ========================================================================

export function addPlacesSpy(autocomplete: GeocoderAutocomplete) {
    const placesSpy = jest.fn();
    autocomplete.on('places', placesSpy);
    return placesSpy;
}

export function addPlacesRequestStartSpy(autocomplete: GeocoderAutocomplete) {
    const placesRequestStartSpy = jest.fn();
    autocomplete.on('places_request_start', placesRequestStartSpy);
    return placesRequestStartSpy;
}

export function addPlacesRequestEndSpy(autocomplete: GeocoderAutocomplete) {
    const placesRequestEndSpy = jest.fn();
    autocomplete.on('places_request_end', placesRequestEndSpy);
    return placesRequestEndSpy;
}

export function addPlaceSelectSpy(autocomplete: GeocoderAutocomplete) {
    const placeSelectSpy = jest.fn();
    autocomplete.on('place_select', placeSelectSpy);
    return placeSelectSpy;
}

export function addClearSpy(autocomplete: GeocoderAutocomplete) {
    const clearSpy = jest.fn();
    autocomplete.on('clear', clearSpy);
    return clearSpy;
}

export function getCategoryDropdownItem(container: HTMLDivElement, itemIndex: number) {
    const dropdown = container.querySelector('.geoapify-autocomplete-items');
    const items = dropdown?.querySelectorAll('.geoapify-category-item');
    return items?.[itemIndex] as HTMLDivElement;
}

export function selectCategoryDropdownItem(container: HTMLDivElement, itemIndex: number) {
    const categoryItem = getCategoryDropdownItem(container, itemIndex);
    if (categoryItem) {
        categoryItem.click();
    } else {
        throw new Error(`Category item at index ${itemIndex} not found`);
    }
}

export function getPlacesListElement(container: HTMLDivElement): HTMLElement | null {
    return container.querySelector('.geoapify-places-list');
}

export function getPlacesListItems(container: HTMLDivElement): NodeListOf<HTMLElement> | null {
    const placesList = getPlacesListElement(container);
    return placesList?.querySelectorAll('.geoapify-places-item') || null;
}

export function selectPlaceFromList(container: HTMLDivElement, itemIndex: number) {
    const items = getPlacesListItems(container);
    if (items && items[itemIndex]) {
        items[itemIndex].click();
    } else {
        throw new Error(`Place item at index ${itemIndex} not found`);
    }
}

export function getLoadMoreButton(container: HTMLDivElement): HTMLElement | null {
    const placesList = getPlacesListElement(container);
    return placesList?.querySelector('.geoapify-places-load-more-button') || null;
}

export function scrollPlacesToBottom(container: HTMLDivElement) {
    const placesList = getPlacesListElement(container);
    const scrollContainer = placesList?.querySelector('.geoapify-places-scroll-container') as HTMLElement;
    if (scrollContainer) {
        // Scroll to bottom to trigger button appearance
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        // Trigger scroll event
        scrollContainer.dispatchEvent(new Event('scroll'));
    }
}

export function clickLoadMoreButton(container: HTMLDivElement) {
    // First scroll to bottom to make button appear
    scrollPlacesToBottom(container);
    
    const loadMoreButton = getLoadMoreButton(container);
    if (loadMoreButton) {
        loadMoreButton.click();
    } else {
        throw new Error('Load more button not found');
    }
}

export function expectPlacesListVisible(container: HTMLDivElement) {
    const placesList = getPlacesListElement(container);
    expect(placesList).toBeTruthy();
    expect(placesList).toHaveClass('geoapify-places-list');
    expect(placesList).toHaveClass('active');
}

export function expectPlacesListHidden(container: HTMLDivElement) {
    const placesList = getPlacesListElement(container);
    expect(placesList).toBeFalsy();
}

export async function setCategory(autocomplete: GeocoderAutocomplete, category: string, mockResponse: any) {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    autocomplete.selectCategory(category);
    await wait(WAIT_TIME);
}

export function expectCategoryInDropdown(container: HTMLDivElement, expectedCount: number) {
    const dropdown = container.querySelector('.geoapify-autocomplete-items');
    const categoryItems = dropdown?.querySelectorAll('.geoapify-category-item');
    expect(categoryItems?.length).toBe(expectedCount);
}

export function mockIpInfo(ipInfoResponse: any) {
    fetchMock.mockResponseOnce(JSON.stringify(ipInfoResponse));
}

export function mockPlacesApi(placesResponse: any) {
    fetchMock.mockResponseOnce(JSON.stringify(placesResponse));
}
