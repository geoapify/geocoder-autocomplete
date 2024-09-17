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

async function inputValueAndPopulateDropdown(container: HTMLDivElement) {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponseWithData));

    inputText(container, "123");

    await wait(5000);

    expect(fetchMock).toHaveBeenCalledWith(
        "https://api.geoapify.com/v1/geocode/autocomplete?text=123&apiKey=XXXXX&limit=5&filter=countrycode:ad&bias=proximity:10,20"
    );
}

function clickOutside() {
    const outsideElement = document.createElement('div'); // Create a new element to click outside
    document.body.appendChild(outsideElement);
    outsideElement.click(); // Simulate click on the outside eleme
    document.body.removeChild(outsideElement);
}