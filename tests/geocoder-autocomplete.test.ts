import '@testing-library/jest-dom';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

const options: any = {
    skipDetails: true,
    skipIcons: true,
    placeholder: "Search location",
    filter:  {
        byCircle: {
            lon: 10,
            lat: 20,
            radiusMeters: 30
        },
        byCountryCode: ['am'],
        byRect: {
            lon1: 10,
            lat1: 20,
            lon2: 30,
            lat2: 40
        },
        customFilter: 'example string filter'
    },
    bias:  {
        byCircle: {
            lon: 10,
            lat: 20,
            radiusMeters: 30
        },
        byCountryCode: ['am'],
        byRect: {
            lon1: 10,
            lat1: 20,
            lon2: 30,
            lat2: 40
        },
        byProximity: {
            lon: 10,
            lat: 20
        },
    },
    countryCodes: ['ad'],
    position: {
        lon: 10,
        lat: 20
    }
};

const mockResponseWithData = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Main St' }, text: '123 Main St' },
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Elm St' }, text: '123 Elm St' }
    ]
};

const mockResponseWithData2 = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '555 Main St' }, text: '555 Main St' }
    ]
};

const mockEmptyResponse = {
    features: [] as string[]
};

describe('GeocoderAutocomplete', () => {
    let container = document.createElement('div');
    let autocomplete = createGeocoderAutocomplete(container);

    it('should init component properly', () => {
        expect(autocomplete).toBeDefined();
        let initiatedOptions: GeocoderAutocompleteOptions = getPrivateProperty(autocomplete, "options")
        expect(initiatedOptions.filter).toBe(options.filter);
        expect(initiatedOptions.bias).toBe(options.bias);

        checkIfInputInitialized(container);
        checkIfClearButtonInitialized(container);
    });
    it('should not open dropdown when user inputs 2 digits', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockEmptyResponse));

        inputText(container, "12");

        await wait(5000);

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.geoapify.com/v1/geocode/autocomplete?text=12&apiKey=XXXXX&limit=5&filter=countrycode:ad&bias=proximity:10,20"
        );

        // expect the dropdown to be null
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeNull();
    });
    it('should open dropdown when user inputs 3 digits', async () => {
        await inputValueAndPopulateDropdown(container);

        // Expect the dropdown element to be created and attached to the input
        const dropdown = container.querySelector('.geoapify-autocomplete-items');

        // Check if the dropdown contains items (the geocoder API response should populate this)
        const items = dropdown?.querySelectorAll('.geoapify-autocomplete-item');
        expect(items?.length).toBe(2);

        // Optional: Check if the first item in the dropdown contains expected text
        if (items && items.length > 0) {
            const firstItemText = items[0].querySelector('.address')?.textContent;
            expect(firstItemText).toContain('123 Main St');
        }
    });
    it('should clear the input/hide dropdown after clicking on clear icon', async () => {
        await inputValueAndPopulateDropdown(container);
        const clearButton = container.querySelector('.geoapify-close-button') as HTMLElement;
        if (clearButton) {
            clearButton.click();
        } else {
            throw new Error('Clear button not found');
        }
        await wait(1000);
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeNull();
        expect(autocomplete.getValue()).toBe('')
    });
    it('should hide the dropdown if we click outside', async () => {
        await inputValueAndPopulateDropdown(container);
        clickOutside();
        await wait(1000);
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeNull();
        expect(autocomplete.getValue()).toBe('123')
    });
    it('changeCallbacks is triggered properly', async () => {
        // testing on('select', x)
        const selectSpy = jest.fn();
        autocomplete.on('select', selectSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(autocomplete.getValue()).toBe(mockResponseWithData.features[0].text);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features[0]);
        // testing off('select', x)
        autocomplete.off('select', selectSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 1);
        expect(selectSpy).toHaveBeenCalledTimes(1);
        expect(autocomplete.getValue()).toBe(mockResponseWithData.features[1].text);

        // testing once('select', x)
        autocomplete.once('select', selectSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(autocomplete.getValue()).toBe(mockResponseWithData.features[0].text);
        expect(selectSpy).toHaveBeenNthCalledWith(2, mockResponseWithData.features[0]);

        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 1);
        expect(selectSpy).toHaveBeenCalledTimes(2);

    });
    it('suggestionsChangeCallbacks is triggered properly', async () => {
        // testing on('suggestions', x)
        const suggestionChangeSpy = jest.fn();
        autocomplete.on('suggestions', suggestionChangeSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(autocomplete.getValue()).toBe(mockResponseWithData.features[0].text);
        expect(suggestionChangeSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features);
        // testing off('suggestions', x)
        autocomplete.off('suggestions', suggestionChangeSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 1);
        expect(suggestionChangeSpy).toHaveBeenCalledTimes(1);
        expect(autocomplete.getValue()).toBe(mockResponseWithData.features[1].text);

        // testing once('suggestions', x)
        autocomplete.once('suggestions', suggestionChangeSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(autocomplete.getValue()).toBe(mockResponseWithData.features[0].text);
        expect(suggestionChangeSpy).toHaveBeenNthCalledWith(2, mockResponseWithData.features);

        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 1);
        expect(suggestionChangeSpy).toHaveBeenCalledTimes(2);
    });
    it('inputCallbacks is triggered properly', async () => {
        // testing on('input', x)
        const inputChangeSpy = jest.fn();
        autocomplete.on('input', inputChangeSpy);
        await inputValueAndPopulateDropdown(container);
        expect(autocomplete.getValue()).toBe("123");
        expect(inputChangeSpy).toHaveBeenNthCalledWith(1, "123");
        // testing off('input', x)
        autocomplete.off('input', inputChangeSpy);
        await inputValueAndPopulateDropdown(container);
        expect(inputChangeSpy).toHaveBeenCalledTimes(1);
        expect(autocomplete.getValue()).toBe("123");

        // testing once('input', x)
        autocomplete.once('input', inputChangeSpy);
        await inputValueAndPopulateDropdown(container);
        expect(autocomplete.getValue()).toBe("123");
        expect(inputChangeSpy).toHaveBeenNthCalledWith(2, "123");

        await inputValueAndPopulateDropdown(container);
        expect(inputChangeSpy).toHaveBeenCalledTimes(2);
    });
    it('closeCallbacks is triggered properly', async () => {
        // testing on('close', x)
        autocomplete.setValue("");
        if(autocomplete.isOpen()) {
            autocomplete.close();
        }
        const closeSpy = jest.fn();
        autocomplete.on('close', closeSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(closeSpy).toHaveBeenNthCalledWith(1, false);
        expect(closeSpy).toHaveBeenCalledTimes(1);
        // testing off('close', x)
        autocomplete.off('close', closeSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(closeSpy).toHaveBeenCalledTimes(1);

        // testing once('close', x)
        autocomplete.once('close', closeSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(closeSpy).toHaveBeenNthCalledWith(2, false);

        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(closeSpy).toHaveBeenCalledTimes(2);
    });
    it('openCallbacks is triggered properly', async () => {
        // testing on('open', x)
        const openSpy = jest.fn();
        autocomplete.on('open', openSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(openSpy).toHaveBeenNthCalledWith(1, true);
        // testing off('open', x)
        autocomplete.off('open', openSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(openSpy).toHaveBeenCalledTimes(1);

        // testing once('open', x)
        autocomplete.once('open', openSpy);
        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(openSpy).toHaveBeenNthCalledWith(2, true);

        await inputValueAndPopulateDropdown(container);
        selectDropdownItem(container, 0);
        expect(openSpy).toHaveBeenCalledTimes(2);
    });

    it('addFilterByCountry should work properly', async () => {
        autocomplete.clearFilters();
        autocomplete.addFilterByCountry(['ae']);
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&filter=countrycode:ae&bias=proximity:10,20");
    });
    it('addFilterByCircle should work properly', async () => {
        autocomplete.clearFilters();
        autocomplete.addFilterByCircle({
            lon: 30,
            lat: 40,
            radiusMeters: 40
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&filter=circle:30,40,40&bias=proximity:10,20");
    });
    it('addFilterByRect should work properly', async () => {
        autocomplete.clearFilters();
        autocomplete.addFilterByRect({
            lon1: 40,
            lat1: 40,
            lon2: 40,
            lat2: 40
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&filter=rect:40,40,40,40&bias=proximity:10,20");
    });
    it('addFilterByPlace should work properly', async () => {
        autocomplete.clearFilters();
        autocomplete.addFilterByPlace("placeX");
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&filter=place:placeX&bias=proximity:10,20");
    });
    it('addBiasByCountry should work properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();
        autocomplete.addBiasByCountry(['ae']);
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&bias=countrycode:ae");
    });
    it('addBiasByCircle should work properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();
        autocomplete.addBiasByCircle({
            lon: 30,
            lat: 40,
            radiusMeters: 40
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&bias=circle:30,40,40");
    });
    it('addBiasByRect should work properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();
        autocomplete.addBiasByRect({
            lon1: 40,
            lat1: 40,
            lon2: 40,
            lat2: 40
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&bias=rect:40,40,40,40");
    });
    it('addBiasByProximity should work properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();
        autocomplete.addBiasByProximity({
            lon: 10,
            lat: 20
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&bias=proximity:10,20");
        autocomplete.clearBias();
    });
    it('open/close works properly', async () => {
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        autocomplete.close();
        await wait(1000);
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeNull();
        expect(autocomplete.getValue()).toBe('123')

        autocomplete.open();
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeDefined();

        autocomplete.close();
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeNull();
    });
    it('setSuggestionsFilter works properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();
        const suggestionChangeSpy = jest.fn();
        autocomplete.on('suggestions', suggestionChangeSpy);

        autocomplete.setSuggestionsFilter((items) => items.filter(item => item.properties.formatted.includes("Main")));
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");

        expect(suggestionChangeSpy).toHaveBeenCalledTimes(1);
        expect(suggestionChangeSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features.filter(item => item.properties.formatted.includes("Main")));

        suggestionChangeSpy.mockReset();
        autocomplete.setSuggestionsFilter(null);

        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        expect(suggestionChangeSpy).toHaveBeenCalledTimes(1);
        expect(suggestionChangeSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features);
    });
    it('setPreprocessHook works properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();

        autocomplete.setPreprocessHook(item => item + "_test");
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123_test&apiKey=XXXXX&limit=5");

        autocomplete.setPreprocessHook(null);
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
    });
    it('setPostprocessHook works properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();

        autocomplete.setPostprocessHook((feature: any) => {
            return "test_" + feature.properties.formatted;
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        expect(getDropDownItemValue(container, 0)).toBe("test_<strong>123</strong> Main St");
        autocomplete.setPostprocessHook(null);
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        expect(getDropDownItemValue(container, 0)).toBe("<strong>123</strong> Main St");
    });
    it('setSendGeocoderRequestFunc works properly', async () => {
        autocomplete.clearBias();
        autocomplete.clearFilters();

        autocomplete.setSendGeocoderRequestFunc((value: string, geocoderAutocomplete: GeocoderAutocomplete) => {
            return new Promise((resolve) => {
                resolve(mockResponseWithData2);
            });
        });
        await inputValueAndDontExpectTheRequest(container);
        expect(getDropDownItemValue(container, 0)).toBe("555 Main St");

        autocomplete.setSendGeocoderRequestFunc(null);
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        expect(getDropDownItemValue(container, 0)).toBe("<strong>123</strong> Main St");
    });
    it('setSendPlaceDetailsRequestFunc works properly', async () => {
        autocomplete.setAddDetails(true);
        autocomplete.clearBias();
        autocomplete.clearFilters();

        const selectSpy = jest.fn();
        autocomplete.on('select', selectSpy);

        autocomplete.setSendPlaceDetailsRequestFunc((value: string, geocoderAutocomplete: GeocoderAutocomplete) => {
            return new Promise((resolve) => {
                resolve(mockResponseWithData2);
            });
        });
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        selectDropdownItem(container, 0);
        await wait(1000);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithData2);

        selectSpy.mockReset();
        autocomplete.setSendPlaceDetailsRequestFunc(null);
        await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5");
        selectDropdownItem(container, 0);
        await wait(1000);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features[0]);
        autocomplete.setAddDetails(false);
    });
});

function getPrivateProperty(object: any, field: any) {
    return object[field];
}

function checkIfClearButtonInitialized(container: HTMLDivElement) {
    const clearButton = container.querySelector('.geoapify-close-button');
    expect(clearButton).toHaveClass('geoapify-close-button');

    const svgElement = clearButton?.querySelector('svg');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');

    const pathElement = svgElement?.querySelector('path');
    expect(pathElement).toHaveAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'); // Example path for "close" icon
    expect(pathElement).toHaveAttribute('fill', 'currentColor');

}

function checkIfInputInitialized(container: HTMLDivElement) {
    const inputElement = container.querySelector('input') as HTMLInputElement;
    expect(inputElement).toHaveClass('geoapify-autocomplete-input');

    expect(inputElement).toHaveAttribute('type', 'text');

    expect(inputElement).toHaveAttribute('placeholder', 'Search location');
}


function createGeocoderAutocomplete(divElement: HTMLDivElement) {
    const myAPIKey = "XXXXX";
    return new GeocoderAutocomplete(
        divElement,
        myAPIKey, options);
}

function inputText(container: HTMLDivElement, text: string) {
    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = text;

    const event = new Event('input', {bubbles: true, cancelable: true});
    inputElement.dispatchEvent(event);
}

async function wait(millis: number) {
    await new Promise(res => setTimeout(res, millis));
}

async function inputValueAndExpectTheRequest(container: HTMLDivElement, request: string) {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithData));

    inputText(container, "123");

    await wait(1000);

    expect(fetchMock).toHaveBeenCalledWith(request);
}

async function inputValueAndDontExpectTheRequest(container: HTMLDivElement) {
    fetchMock.resetMocks();
    inputText(container, "123");

    await wait(1000);

    expect(fetchMock).toHaveBeenCalledTimes(0);
}

async function inputValueAndPopulateDropdown(container: HTMLDivElement) {
    await inputValueAndExpectTheRequest(container, "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&filter=countrycode:ad&bias=proximity:10,20");
}

function clickOutside() {
    const outsideElement = document.createElement('div'); // Create a new element to click outside
    document.body.appendChild(outsideElement);
    outsideElement.click(); // Simulate click on the outside eleme
    document.body.removeChild(outsideElement);
}

function selectDropdownItem(container: HTMLDivElement, itemIndex: number) {
    let selectedItem = getDropDownItem(container, itemIndex);
    selectedItem.click();
}

function getDropDownItem(container: HTMLDivElement, itemIndex: number) {
    const dropdown = container.querySelector('.geoapify-autocomplete-items');
    const items = dropdown?.querySelectorAll('.geoapify-autocomplete-item');
    return items[itemIndex] as HTMLDivElement;
}

function getDropDownItemValue(container: HTMLDivElement, itemIndex: number) {
    let selectedItem = getDropDownItem(container, itemIndex);
    let spanItem = selectedItem.getElementsByClassName("main-part")[0];
    return spanItem.innerHTML;
}