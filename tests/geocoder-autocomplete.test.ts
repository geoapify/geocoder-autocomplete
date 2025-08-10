import '@testing-library/jest-dom';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";
import fetchMock from 'jest-fetch-mock';
import {
    addSelectSpy, addSuggestionsSpy, addRequestStartSpy, addRequestEndSpy,
    APP_URL,
    checkIfClearButtonInitialized,
    checkIfInputInitialized,
    clickOutside,
    createGeocoderAutocomplete,
    expectDropdownIsClosed,
    getDropDownItem,
    getDropDownItemValue,
    getPrivateProperty,
    inputText, inputTextWithEvent,
    inputValueAndDontExpectTheRequest,
    inputValueAndExpectTheRequest,
    inputValueAndPopulateDropdown,
    inputValueAndReturnResponse,
    reset,
    selectDropdownItem,
    wait, WAIT_TIME
} from "./test-helper";
import {
    mockEmptyResponse,
    mockResponseWithData,
    mockResponseWithData2,
    mockResponseWithDataOSM, mockResponseWithDataParsed, mockResponseWithDataParsedWithoutHouseNumber,
    options
} from "./test-data";

fetchMock.enableMocks();

describe('GeocoderAutocomplete', () => {
    let container = document.createElement('div');
    let autocomplete = createGeocoderAutocomplete(container);

    beforeEach(() => {
        if(autocomplete) {
            reset(autocomplete);
        }
    });

    it('should init component properly', () => {
        let autocompleteTest = createGeocoderAutocomplete(container);
        expect(autocompleteTest).toBeDefined();
        let initiatedOptions: GeocoderAutocompleteOptions = getPrivateProperty(autocompleteTest, "options")
        expect(initiatedOptions.filter).toBe(options.filter);
        expect(initiatedOptions.bias).toBe(options.bias);

        checkIfInputInitialized(container);
        checkIfClearButtonInitialized(container);
    });
    it('should not open dropdown when user inputs 2 digits', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(mockEmptyResponse));

        inputText(container, "12");

        await wait(WAIT_TIME);

        expect(fetchMock).toHaveBeenCalledWith(
            `${APP_URL}?text=12&apiKey=XXXXX&limit=5`
        );
        // expect the dropdown to be null
        expectDropdownIsClosed(container);
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
        await wait(WAIT_TIME);
        expectDropdownIsClosed(container);
        expect(autocomplete.getValue()).toBe('')
    });
    it('should hide the dropdown if we click outside', async () => {
        await inputValueAndPopulateDropdown(container);
        clickOutside();
        await wait(WAIT_TIME);
        expectDropdownIsClosed(container);
        expect(autocomplete.getValue()).toBe('123')
    });
    it('changeCallbacks is triggered properly', async () => {
        // testing on('select', x)
        const selectSpy = addSelectSpy(autocomplete);
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
        const suggestionChangeSpy = addSuggestionsSpy(autocomplete);
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
    it('requestStartCallbacks is triggered properly', async () => {
        // testing on('request_start', x)
        const requestStartSpy = addRequestStartSpy(autocomplete);
        await inputValueAndPopulateDropdown(container);
        expect(requestStartSpy).toHaveBeenNthCalledWith(1, "123");
        
        // testing off('request_start', x)
        autocomplete.off('request_start', requestStartSpy);
        await inputValueAndPopulateDropdown(container);
        expect(requestStartSpy).toHaveBeenCalledTimes(1);

        // testing once('request_start', x)
        autocomplete.once('request_start', requestStartSpy);
        await inputValueAndPopulateDropdown(container);
        expect(requestStartSpy).toHaveBeenNthCalledWith(2, "123");

        await inputValueAndPopulateDropdown(container);
        expect(requestStartSpy).toHaveBeenCalledTimes(2);
    });
    it('requestEndCallbacks is triggered properly for successful requests', async () => {
        // testing on('request_end', x) with success
        const requestEndSpy = addRequestEndSpy(autocomplete);
        await inputValueAndPopulateDropdown(container);
        expect(requestEndSpy).toHaveBeenNthCalledWith(1, true, mockResponseWithData, undefined);
        
        // testing off('request_end', x)
        autocomplete.off('request_end', requestEndSpy);
        await inputValueAndPopulateDropdown(container);
        expect(requestEndSpy).toHaveBeenCalledTimes(1);

        // testing once('request_end', x)
        autocomplete.once('request_end', requestEndSpy);
        await inputValueAndPopulateDropdown(container);
        expect(requestEndSpy).toHaveBeenNthCalledWith(2, true, mockResponseWithData, undefined);

        await inputValueAndPopulateDropdown(container);
        expect(requestEndSpy).toHaveBeenCalledTimes(2);
    });
    it('requestEndCallbacks is triggered properly for failed requests', async () => {
        // Clear any previous state first
        reset(autocomplete);
        
        // testing on('request_end', x) with failure
        const requestEndSpy = addRequestEndSpy(autocomplete);
        
        // Mock a failed HTTP response (401 Unauthorized)
        const errorResponse = {
            statusCode: 401,
            error: "Unauthorized", 
            message: "Invalid apiKey"
        };
        
        fetchMock.mockResponseOnce(
            JSON.stringify(errorResponse),
            { status: 401, statusText: 'Unauthorized' }
        );
        
        // Trigger input that will cause a request (3+ characters)
        inputText(container, "error");
        
        // Wait for debounce delay (100ms) + extra time for promise resolution
        await wait(300);
        
        expect(requestEndSpy).toHaveBeenCalledWith(false, null, errorResponse);
        expect(requestEndSpy).toHaveBeenCalledTimes(1);
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
        autocomplete.addFilterByCountry(['ae']);
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&filter=countrycode:ae`);
        autocomplete.addFilterByCountry([]);
    });
    it('addFilterByCircle should work properly', async () => {
        autocomplete.addFilterByCircle({
            lon: 30,
            lat: 40,
            radiusMeters: 40
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&filter=circle:30,40,40`);
    });
    it('addFilterByRect should work properly', async () => {
        autocomplete.addFilterByRect({
            lon1: 40,
            lat1: 40,
            lon2: 40,
            lat2: 40
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&filter=rect:40,40,40,40`);
    });
    it('addFilterByPlace should work properly', async () => {
        autocomplete.addFilterByPlace("placeX");
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&filter=place:placeX`);
    });
    it('addBiasByCountry should work properly', async () => {
        autocomplete.addBiasByCountry(['ae']);
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&bias=countrycode:ae`);
    });
    it('addBiasByCircle should work properly', async () => {
        autocomplete.addBiasByCircle({
            lon: 30,
            lat: 40,
            radiusMeters: 40
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&bias=circle:30,40,40`);
    });
    it('addBiasByRect should work properly', async () => {
        autocomplete.addBiasByRect({
            lon1: 40,
            lat1: 40,
            lon2: 40,
            lat2: 40
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&bias=rect:40,40,40,40`);
    });
    it('addBiasByProximity should work properly', async () => {
        autocomplete.addBiasByProximity({
            lon: 10,
            lat: 20
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&bias=proximity:10,20`);
        autocomplete.clearBias();
    });
    it('open/close works properly', async () => {
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        autocomplete.close();
        await wait(WAIT_TIME);
        expectDropdownIsClosed(container);
        expect(autocomplete.getValue()).toBe('123')

        autocomplete.open();
        expect(container.querySelector('.geoapify-autocomplete-items')).toBeDefined();

        autocomplete.close();
        expectDropdownIsClosed(container);
    });
    it('setSuggestionsFilter works properly', async () => {
        const suggestionChangeSpy = addSuggestionsSpy(autocomplete);

        autocomplete.setSuggestionsFilter((items) => items.filter(item => item.properties.formatted.includes("Main")));
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);

        expect(suggestionChangeSpy).toHaveBeenCalledTimes(1);
        expect(suggestionChangeSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features.filter(item => item.properties.formatted.includes("Main")));

        suggestionChangeSpy.mockReset();
        autocomplete.setSuggestionsFilter(null);

        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        expect(suggestionChangeSpy).toHaveBeenCalledTimes(1);
        expect(suggestionChangeSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features);
    });
    it('setPreprocessHook works properly', async () => {
        autocomplete.setPreprocessHook(item => item + "_test");
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123_test&apiKey=XXXXX&limit=5`);

        autocomplete.setPreprocessHook(null);
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
    });
    it('setPostprocessHook works properly', async () => {
        autocomplete.setPostprocessHook((feature: any) => {
            return "test_" + feature.properties.formatted;
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        expect(getDropDownItemValue(container, 0)).toBe("test_<strong>123</strong> Main St");
        autocomplete.setPostprocessHook(null);
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        expect(getDropDownItemValue(container, 0)).toBe("<strong>123</strong> Main St");
    });
    it('setSendGeocoderRequestFunc works properly', async () => {
        autocomplete.setSendGeocoderRequestFunc((value: string, geocoderAutocomplete: GeocoderAutocomplete) => {
            return new Promise((resolve) => {
                resolve(mockResponseWithData2);
            });
        });
        await inputValueAndDontExpectTheRequest(container);
        expect(getDropDownItemValue(container, 0)).toBe("555 Main St");

        autocomplete.setSendGeocoderRequestFunc(null);
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        expect(getDropDownItemValue(container, 0)).toBe("<strong>123</strong> Main St");
    });
    it('setSendPlaceDetailsRequestFunc works properly', async () => {
        autocomplete.setAddDetails(true);
        const selectSpy = addSelectSpy(autocomplete);

        autocomplete.setSendPlaceDetailsRequestFunc((value: string, geocoderAutocomplete: GeocoderAutocomplete) => {
            return new Promise((resolve) => {
                resolve(mockResponseWithData2);
            });
        });
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        selectDropdownItem(container, 0);
        await wait(WAIT_TIME);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithData2);

        selectSpy.mockReset();
        autocomplete.setSendPlaceDetailsRequestFunc(null);
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        selectDropdownItem(container, 0);
        await wait(WAIT_TIME);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features[0]);
        autocomplete.setAddDetails(false);
    });
    it('sendPlaceDetailsRequest works properly', async () => {
        autocomplete.setAddDetails(true);
        fetchMock.resetMocks();

        const selectSpy = addSelectSpy(autocomplete);
        fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithDataOSM));
        fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithDataOSM));

        autocomplete.setSendPlaceDetailsRequestFunc(null);
        inputText(container, "123");
        await wait(WAIT_TIME);

        selectDropdownItem(container, 0);
        await wait(WAIT_TIME);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithDataOSM.features[0]);
        expect(fetchMock).toHaveBeenCalledWith("https://api.geoapify.com/v2/place-details?id=placeId&apiKey=XXXXX");
        autocomplete.setAddDetails(false);
    });
    it('addFeatureIcon works properly', async () => {
        autocomplete.setSkipIcons(false);

        fetchMock.resetMocks();

        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);

        const dropdownItem = getDropDownItem(container, 0);
        expect(dropdownItem.querySelector(".icon").innerHTML).toContain('M573.19');
        autocomplete.setSkipIcons(true);

        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
        const dropdownItem2 = getDropDownItem(container, 0);
        expect(dropdownItem2.querySelector(".icon")).toBeNull();
    });
    it('extendByNonVerifiedValues works properly', async () => {
        autocomplete.setAllowNonVerifiedHouseNumber(true);
        autocomplete.setAllowNonVerifiedStreet(true);

        fetchMock.resetMocks();

        const suggestionChangeSpy = addSuggestionsSpy(autocomplete);
        await inputValueAndReturnResponse(container, mockResponseWithDataParsed);
        selectDropdownItem(container, 0);

        expect(suggestionChangeSpy).toHaveBeenCalled();
        const calls = suggestionChangeSpy.mock.calls;
        const properties = calls[0][0];
        const item1 = properties[0];
        const item2 = properties[1];
        expect(item1.properties.housenumber).toBe("test_housenumber");
        expect(item1.properties.nonVerifiedParts).toStrictEqual(["housenumber"]);
        expect(item2.properties.formatted).toBe("test_housenumber Test_street, 123 Elm St");
        expect(item2.properties.address_line1).toBe("test_housenumber Test_street");
        expect(item2.properties.street).toBe("Test_street");
        expect(item2.properties.nonVerifiedParts).toStrictEqual(["housenumber", "street"]);

        autocomplete.setAllowNonVerifiedHouseNumber(false);
        autocomplete.setAllowNonVerifiedStreet(false);
    });
    it('extendByNonVerifiedValues works properly without housenumber', async () => {
        autocomplete.setAllowNonVerifiedHouseNumber(true);
        autocomplete.setAllowNonVerifiedStreet(true);

        fetchMock.resetMocks();

        const suggestionChangeSpy = addSuggestionsSpy(autocomplete);
        await inputValueAndReturnResponse(container, mockResponseWithDataParsedWithoutHouseNumber);
        selectDropdownItem(container, 0);

        expect(suggestionChangeSpy).toHaveBeenCalled();
        const calls = suggestionChangeSpy.mock.calls;
        const properties = calls[0][0];
        const item2 = properties[1];
        expect(item2.properties.formatted).toBe("Test_street, 123 Elm St");
        expect(item2.properties.address_line1).toBe("Test_street");
        expect(item2.properties.street).toBe("Test_street");
        expect(item2.properties.nonVerifiedParts).toStrictEqual(["street"]);

        autocomplete.setAllowNonVerifiedHouseNumber(false);
        autocomplete.setAllowNonVerifiedStreet(false);
    });
    it('onUserKeyPress works properly', async () => {
        autocomplete.setAllowNonVerifiedHouseNumber(true);
        autocomplete.setAllowNonVerifiedStreet(true);

        fetchMock.resetMocks();

        fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithData));

        inputTextWithEvent(container, "123", "ArrowDown");
        await wait(WAIT_TIME);
        expect(getDropDownItemValue(container, 0)).toBe("<strong>123</strong> Main St");

        inputTextWithEvent(container, "123", "Escape");
        expectDropdownIsClosed(container);

        fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithData));
        inputTextWithEvent(container, "123", "ArrowDown");
        await wait(WAIT_TIME);
        expect(getDropDownItemValue(container, 0)).toBe("<strong>123</strong> Main St");

        const selectSpy = addSelectSpy(autocomplete);
        inputTextWithEvent(container, "123", "ArrowDown");
        inputTextWithEvent(container, "123", "ArrowDown");
        inputTextWithEvent(container, "123", "ArrowUp");
        inputTextWithEvent(container, "123", "Enter");
        await wait(WAIT_TIME);

        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithData.features[0]);
        expect(selectSpy).toHaveBeenNthCalledWith(2, mockResponseWithData.features[1]);
        expect(selectSpy).toHaveBeenNthCalledWith(3, mockResponseWithData.features[0]);

        expectDropdownIsClosed(container);
    });
    it('setCountryCodes should log warning', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        autocomplete.setCountryCodes(['ae']);

        expect(warnSpy).toHaveBeenCalledWith('WARNING! Obsolete function called. Function setCountryCodes() has been deprecated, please use the new addFilterByCountry() function instead!');
    });
    it('setPosition should log warning', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        autocomplete.setPosition({
            lat: 0,
            lon: 0
        });

        expect(warnSpy).toHaveBeenCalledWith('WARNING! Obsolete function called. Function setPosition() has been deprecated, please use the new addBiasByProximity() function instead!');
    });
    it('setType should work properly', async () => {
        autocomplete.setType('postcode');
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&type=postcode&limit=5`);
        autocomplete.setType(null);
    });
    it('setLang should work properly', async () => {
        autocomplete.setLang('ab');
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5&lang=ab`);
        autocomplete.setLang(null);
    });
    it('setGeocoderUrl works as expected', async () => {
        autocomplete.setGeocoderUrl("https://api.geoapify.com/v2/geocode/autocomplete")
        await inputValueAndExpectTheRequest(container, `https://api.geoapify.com/v2/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5`);
        autocomplete.setGeocoderUrl(APP_URL)
        await inputValueAndExpectTheRequest(container, `${APP_URL}?text=123&apiKey=XXXXX&limit=5`);
    });
    it('setPlaceDetailsUrl works as expected', async () => {
        autocomplete.setPlaceDetailsUrl("https://api.geoapify.com/v3/place-details")
        autocomplete.setAddDetails(true);
        fetchMock.resetMocks();

        const selectSpy = addSelectSpy(autocomplete);
        fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithDataOSM));
        fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithDataOSM));

        autocomplete.setSendPlaceDetailsRequestFunc(null);
        inputText(container, "123");
        await wait(WAIT_TIME);

        selectDropdownItem(container, 0);
        await wait(WAIT_TIME);
        expect(selectSpy).toHaveBeenNthCalledWith(1, mockResponseWithDataOSM.features[0]);
        expect(fetchMock).toHaveBeenCalledWith("https://api.geoapify.com/v3/place-details?id=placeId&apiKey=XXXXX");
        autocomplete.setAddDetails(false);
    });
});
