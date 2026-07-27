import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import { GeocoderAutocomplete } from "../src";
import { PlacesApiHelper } from "../src/helpers/places-api.helper";

fetchMock.enableMocks();

function createDeferred<T>() {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });

    return { promise, resolve: resolve!, reject: reject! };
}

function createFeature(formatted: string) {
    return {
        type: 'Feature',
        properties: {
            formatted,
            result_type: 'street',
            country_code: 'de',
            datasource: { sourcename: 'openstreetmap' },
            place_id: formatted
        },
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        }
    };
}

function createResponse(formatted: string) {
    return {
        type: 'FeatureCollection',
        features: [createFeature(formatted)]
    };
}

function inputText(container: HTMLElement, value: string) {
    const input = container.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function flushAsyncWork() {
    await new Promise(resolve => setTimeout(resolve, 0));
}

describe('request lifecycle', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        fetchMock.resetMocks();
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('rejects geocoder requests when fetch fails', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key');
        const networkError = new Error('offline');
        fetchMock.mockRejectOnce(networkError);

        await expect(autocomplete.sendGeocoderRequest('Berlin')).rejects.toBe(networkError);
    });

    it('rejects place-details requests when fetch fails', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key');
        const networkError = new Error('offline');
        fetchMock.mockRejectOnce(networkError);

        await expect(
            autocomplete.sendPlaceDetailsRequest(createFeature('Berlin'))
        ).rejects.toBe(networkError);
    });

    it('rejects Places requests when response JSON is invalid', async () => {
        fetchMock.mockResponseOnce('not-json');

        await expect(
            PlacesApiHelper.sendPlacesRequest('https://example.com/places')
        ).rejects.toBeDefined();
    });

    it('rejects malformed successful geocoder responses', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key');
        fetchMock.mockResponseOnce(JSON.stringify({}));

        await expect(
            autocomplete.sendGeocoderRequest('Berlin')
        ).rejects.toThrow('Invalid geocoder response');
    });

    it('rejects malformed successful place-details responses', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key');
        fetchMock.mockResponseOnce(JSON.stringify({}));

        await expect(
            autocomplete.sendPlaceDetailsRequest(createFeature('Berlin'))
        ).rejects.toThrow('Invalid place details response');
    });

    it('rejects malformed successful Places responses', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));

        await expect(
            PlacesApiHelper.sendPlacesRequest('https://example.com/places')
        ).rejects.toThrow('Invalid Places response');
    });

    it('ignores an older custom geocoder response that resolves last', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key', {
            debounceDelay: 0,
            skipIcons: true
        });
        const olderRequest = createDeferred<any>();
        const newerRequest = createDeferred<any>();
        const requestEndSpy = jest.fn();

        autocomplete.on('request_end', requestEndSpy);
        autocomplete.setSendGeocoderRequestFunc(value => {
            return value === 'older' ? olderRequest.promise : newerRequest.promise;
        });

        inputText(container, 'older');
        await flushAsyncWork();
        inputText(container, 'newer');
        await flushAsyncWork();

        newerRequest.resolve(createResponse('Newer result'));
        await flushAsyncWork();
        olderRequest.resolve(createResponse('Older result'));
        await flushAsyncWork();

        const dropdowns = container.querySelectorAll('.geoapify-autocomplete-items');
        expect(dropdowns).toHaveLength(1);
        expect(dropdowns[0].textContent).toContain('Newer result');
        expect(dropdowns[0].textContent).not.toContain('Older result');
        expect(requestEndSpy).toHaveBeenNthCalledWith(
            1,
            false,
            null,
            { cancelled: true }
        );
        expect(requestEndSpy).toHaveBeenNthCalledWith(
            2,
            true,
            createResponse('Newer result'),
            undefined
        );
    });

    it('ignores older custom place details that resolve last', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key', {
            addDetails: true
        });
        const olderRequest = createDeferred<any>();
        const newerRequest = createDeferred<any>();
        const selectSpy = jest.fn();
        const requestEndSpy = jest.fn();

        autocomplete.on('select', selectSpy);
        autocomplete.on('place_details_request_end', requestEndSpy);
        autocomplete.setSendPlaceDetailsRequestFunc(feature => {
            return feature.properties.formatted === 'Older'
                ? olderRequest.promise
                : newerRequest.promise;
        });

        (autocomplete as any).notifyValueSelected(createFeature('Older'));
        await flushAsyncWork();
        (autocomplete as any).notifyValueSelected(createFeature('Newer'));
        await flushAsyncWork();

        newerRequest.resolve(createFeature('Newer details'));
        await flushAsyncWork();
        olderRequest.resolve(createFeature('Older details'));
        await flushAsyncWork();

        expect(selectSpy).toHaveBeenCalledTimes(1);
        expect(selectSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: expect.objectContaining({ formatted: 'Newer details' })
            })
        );
        expect(requestEndSpy).toHaveBeenNthCalledWith(
            1,
            false,
            null,
            { cancelled: true }
        );
        expect(requestEndSpy).toHaveBeenNthCalledWith(
            2,
            true,
            createFeature('Newer details'),
            undefined
        );
    });

    it('ignores an older custom Places response that resolves last', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key', {
            addCategorySearch: true
        });
        const olderRequest = createDeferred<any>();
        const newerRequest = createDeferred<any>();
        const placesSpy = jest.fn();
        const requestEndSpy = jest.fn();

        autocomplete.on('places', placesSpy);
        autocomplete.on('places_request_end', requestEndSpy);
        autocomplete.setSendPlacesRequestFunc(category => {
            return category[0] === 'older' ? olderRequest.promise : newerRequest.promise;
        });

        const olderSelection = autocomplete.selectCategory({
            keys: ['older'],
            label: 'Older'
        });
        const newerSelection = autocomplete.selectCategory({
            keys: ['newer'],
            label: 'Newer'
        });

        newerRequest.resolve(createResponse('Newer place'));
        await newerSelection;
        olderRequest.resolve(createResponse('Older place'));
        await olderSelection;

        expect(placesSpy).toHaveBeenCalledTimes(1);
        expect(placesSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                properties: expect.objectContaining({ formatted: 'Newer place' })
            })
        ]);
        expect(requestEndSpy).toHaveBeenNthCalledWith(
            1,
            false,
            null,
            { cancelled: true }
        );
        expect(requestEndSpy).toHaveBeenNthCalledWith(
            2,
            true,
            createResponse('Newer place'),
            undefined
        );
    });

    it('destroy removes the component and its owned listeners', async () => {
        const autocomplete = new GeocoderAutocomplete(container, 'api-key', {
            debounceDelay: 0
        });
        const request = createDeferred<any>();
        const requestEndSpy = jest.fn();
        const closeSpy = jest.spyOn(autocomplete as any, 'closeDropDownList');

        autocomplete.on('request_end', requestEndSpy);
        autocomplete.setSendGeocoderRequestFunc(() => request.promise);
        inputText(container, 'Berlin');
        await flushAsyncWork();

        autocomplete.destroy();

        expect(container.querySelector('.geoapify-geocoder-autocomplete-container')).toBeNull();
        expect(requestEndSpy).toHaveBeenCalledWith(
            false,
            null,
            { cancelled: true }
        );

        closeSpy.mockClear();
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(closeSpy).not.toHaveBeenCalled();
        expect(() => autocomplete.destroy()).not.toThrow();

        request.resolve(createResponse('Ignored result'));
        await flushAsyncWork();
    });
});
