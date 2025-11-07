import '@testing-library/jest-dom';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";
import fetchMock from 'jest-fetch-mock';
import { addPlacesSpy, mockIpInfo, mockPlacesApi, reset } from "./test-helper";
import { mockIpInfoResponse, mockPlacesApiResponse } from "./test-data";

fetchMock.enableMocks();

const API_KEY = "YOUR_API_KEY";

// San Francisco coordinates for testing
const SF_LON = -122.4194;
const SF_LAT = 37.7749;

// Yerevan coordinates for testing
const YV_LON = 44.5126;
const YV_LAT = 40.17765;

describe('sendPlacesRequest - Bias and Filter Parameters', () => {
    let container: HTMLDivElement;
    let autocomplete: GeocoderAutocomplete;

    const options: GeocoderAutocompleteOptions = {
        skipIcons: true,
        addCategorySearch: true,
        limit: 5
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        fetchMock.resetMocks();
    });

    afterEach(() => {
        if (autocomplete) {
            reset(autocomplete);
        }
        document.body.removeChild(container);
    });

    describe('Mock Tests - Parameter Handling', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        it('should send request with custom bias and filter objects', async () => {
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.addBiasByProximity({ lon: -87.770231, lat: 41.878968 });
            autocomplete.addFilterByCircle({ lon: -87.770231, lat: 41.878968, radiusMeters: 5000 });
            const placesSpy = addPlacesSpy(autocomplete);

            await autocomplete.selectCategory('catering.cafe');

            expect(placesSpy).toHaveBeenCalledTimes(1);
            expect(placesSpy).toHaveBeenLastCalledWith(mockPlacesApiResponse.features);
            
            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('bias=proximity:-87.770231,41.878968');
            expect(lastCall).toContain('filter=circle:-87.770231,41.878968,5000');
        });

        it('should use options.bias and options.filter when not provided as parameters', async () => {
            const optionsWithBiasFilter: GeocoderAutocompleteOptions = {
                ...options,
                bias: {
                    proximity: { lon: 9.1829, lat: 48.7758 }
                },
                filter: {
                    circle: { lon: 10, lat: 20, radiusMeters: 5000 }
                }
            };

            autocomplete = new GeocoderAutocomplete(container, API_KEY, optionsWithBiasFilter);
            mockPlacesApi(mockPlacesApiResponse);

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('bias=proximity:9.1829,48.7758');
            expect(lastCall).toContain('filter=circle:10,20,5000');
        });

        it('should override options when bias and filter parameters are provided', async () => {
            const optionsWithBiasFilter: GeocoderAutocompleteOptions = {
                ...options,
                bias: {
                    proximity: { lon: 9.1829, lat: 48.7758 }
                },
                filter: {
                    rect: { lon1: 9, lat1: 48, lon2: 10, lat2: 49 }
                }
            };

            autocomplete = new GeocoderAutocomplete(container, API_KEY, optionsWithBiasFilter);
            mockPlacesApi(mockPlacesApiResponse);

            await autocomplete.selectCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);
            
            autocomplete.setPlacesBiasByProximity({ lon: 5, lat: 10 });
            autocomplete.setPlacesFilterByCircle({ lon: 5, lat: 10, radiusMeters: 3000 });
            
            await autocomplete.resendPlacesRequestForMore(false);

            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('bias=proximity:5,10');
            expect(lastCall).not.toContain('proximity:9.1829,48.7758');
            expect(lastCall).toContain('filter=circle:5,10,3000');
        });

        it('should successfully make API call with offset when call more with append', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesLimit(50);
            autocomplete.setPlacesBiasByProximity({ lon: 10, lat: 20 });
            autocomplete.setPlacesFilterByCircle({ lon: 10, lat: 20, radiusMeters: 5000 });
            
            await autocomplete.selectCategory('catering.cafe');

            let lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).not.toContain('offset');
            expect(lastCall).toContain('limit=50');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            await autocomplete.resendPlacesRequestForMore(true);

            lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('offset=50');
            expect(lastCall).toContain('limit=50');
        });

        it('should successfully make API call with offset = 0 when call more no append', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesLimit(50);
            autocomplete.setPlacesBiasByProximity({ lon: 10, lat: 20 });
            autocomplete.setPlacesFilterByCircle({ lon: 10, lat: 20, radiusMeters: 5000 });
            
            await autocomplete.selectCategory('catering.cafe');

            fetchMock.resetMocks();
            
            mockPlacesApi(mockPlacesApiResponse);


            await autocomplete.resendPlacesRequestForMore(false);

            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).not.toContain('offset');
            expect(lastCall).toContain('limit=50');
        });
    });


    describe('Real API Tests - Filter Options', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        it('should support filter by circle', async () => {
            autocomplete.addBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            autocomplete.addFilterByCircle({
                lon: SF_LON,
                lat: SF_LAT,
                radiusMeters: 3000
            });
            autocomplete.setPlacesLimit(5);

            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=circle:-122.4194,37.7749,3000');
        });

        it('should support filter by rect', async () => {
            autocomplete.addBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            autocomplete.addFilterByRect({
                lon1: -122.43,
                lat1: 37.76,
                lon2: -122.41,
                lat2: 37.78
            });
            autocomplete.setPlacesLimit(5);

            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=rect:-122.43,37.76,-122.41,37.78');
        });

        it('should support filter by place (string)', async () => {
            autocomplete.addBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            autocomplete.addFilterByPlace('51cf84e2ac62d23440597454a3c04a614440f00102f901cf03a60700000000c00208');
            autocomplete.setPlacesLimit(5);

            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=place:51cf84e2ac62d23440597454a3c04a614440f00102f901cf03a60700000000c00208');
        });
    });

    describe('Real API Tests - Bias Options', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        it('should support bias by IP Geolocation', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[1][0] as string;
            expect(lastCall).toContain(`bias=proximity:${YV_LON},${YV_LAT}`);
        });


        it('should support bias by proximity', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesBiasByProximity({
                        lon: SF_LON,
                        lat: SF_LAT
                    });

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain(`bias=proximity:${SF_LON},${SF_LAT}`);
        });
    });

    describe('Real API Tests - Combinations', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        it('should support bias (proximity) + filter (circle)', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            autocomplete.setPlacesFilterByCircle({
                        lon: SF_LON,
                        lat: SF_LAT,
                        radiusMeters: 3000
                    });

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('bias=proximity:-122.4194,37.7749');
            expect(lastCall).toContain('filter=circle:-122.4194,37.7749,3000');
        });

        it('should support bias (proximity) + filter (rect)', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            autocomplete.addFilterByRect({
                        lon1: -122.43,
                        lat1: 37.76,
                        lon2: -122.41,
                        lat2: 37.78
                    });

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=rect:-122.43,37.76,-122.41,37.78');
        });
    });

    describe('Real API Tests - Fallback to Options', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it('should use options.bias when bias parameter is not provided', async () => {
            const optionsWithBias: GeocoderAutocompleteOptions = {
                ...options,
                bias: {
                    proximity: { lon: SF_LON, lat: SF_LAT }
                }
            };

            const testAutocomplete = new GeocoderAutocomplete(
                container,
                API_KEY,
                optionsWithBias
            );

            mockPlacesApi(mockPlacesApiResponse);

            const placesSpy = addPlacesSpy(autocomplete);

            await autocomplete.selectCategory('catering.cafe');

            expect(placesSpy).toHaveBeenLastCalledWith(mockPlacesApiResponse.features);
            expect(placesSpy).toHaveBeenCalledTimes(1);

            reset(testAutocomplete);
        });

        it('should use options.filter when filter parameter is not provided', async () => {
            const optionsWithFilter: GeocoderAutocompleteOptions = {
                ...options,
                filter: {
                    circle: { lon: SF_LON, lat: SF_LAT, radiusMeters: 3000 }
                }
            };

            const testAutocomplete = new GeocoderAutocomplete(
                container,
                API_KEY,
                optionsWithFilter
            );

            // Ensure proximity bias to avoid IP lookup during initial category set
            testAutocomplete.addBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            mockPlacesApi(mockPlacesApiResponse);

            await testAutocomplete.selectCategory('catering.cafe');
            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain(`filter=circle:${SF_LON},${SF_LAT},3000`);
        });
    });

    describe('Missing Public Methods Tests', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        it('should send places request using sendPlacesRequest()', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            // First select a category
            autocomplete.selectCategory('catering.cafe');
            await new Promise(resolve => setTimeout(resolve, 100));

            // Clear mocks to test sendPlacesRequest directly
            fetchMock.resetMocks();
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            // Send places request directly
            await autocomplete.sendPlacesRequest();

            const lastCall = fetchMock.mock.calls[1][0] as string;
            expect(lastCall).toContain('categories=catering.cafe');
            expect(lastCall).toContain('apiKey=YOUR_API_KEY');
        });

        it('should clear category using clearCategory()', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            // Select a category first
            autocomplete.selectCategory('catering.cafe');
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(autocomplete.getCategory()).toBeTruthy();
            expect(autocomplete.getValue()).toBe('catering.cafe');

            // Clear the category
            await autocomplete.clearCategory();

            expect(autocomplete.getCategory()).toBeNull();
            // Note: clearCategory() clears the category mode but doesn't clear the input value
            // The input value remains until user manually clears it or types new text
        });

        it('should set places filter by rect using setPlacesFilterByRect()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesFilterByRect({
                lon1: -122.43,
                lat1: 37.76,
                lon2: -122.41,
                lat2: 37.78
            });

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=rect:-122.43,37.76,-122.41,37.78');
        });

        it('should set places filter by place using setPlacesFilterByPlace()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            const placeId = '51cf84e2ac62d23440597454a3c04a614440f00102f901cf03a60700000000c00208';
            autocomplete.setPlacesFilterByPlace(placeId);

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain(`filter=place:${placeId}`);
        });

        it('should set places filter by geometry using setPlacesFilterByGeometry()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            const geometry = 'polygon((10.0 20.0, 15.0 20.0, 15.0 25.0, 10.0 25.0, 10.0 20.0))';
            autocomplete.setPlacesFilterByGeometry(geometry);

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain(`filter=geometry:${geometry}`);
        });

        it('should clear all places filters using clearPlacesFilters()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            // Set filter
            autocomplete.setPlacesFilterByCircle({ lon: SF_LON, lat: SF_LAT, radiusMeters: 3000 });
            await autocomplete.selectCategory('catering.cafe');

            let lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=circle');

            // Clear filters
            fetchMock.resetMocks();
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            
            autocomplete.clearPlacesFilters();
            autocomplete.setPlacesBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            await autocomplete.resendPlacesRequestForMore(false);

            lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).not.toContain('filter=circle');
        });

        it('should set places bias by circle using setPlacesBiasByCircle()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesBiasByCircle({
                lon: SF_LON,
                lat: SF_LAT,
                radiusMeters: 5000
            });

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain(`bias=circle:${SF_LON},${SF_LAT},5000`);
        });

        it('should set places bias by rect using setPlacesBiasByRect()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesBiasByRect({
                lon1: -122.43,
                lat1: 37.76,
                lon2: -122.41,
                lat2: 37.78
            });

            await autocomplete.selectCategory('catering.cafe');

            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('bias=rect:-122.43,37.76,-122.41,37.78');
        });

        it('should clear all places bias using clearPlacesBias()', async () => {
            mockPlacesApi(mockPlacesApiResponse);

            // Set bias
            autocomplete.setPlacesBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            await autocomplete.selectCategory('catering.cafe');

            let lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('bias=proximity:-122.4194');

            // Clear bias
            fetchMock.resetMocks();
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            
            autocomplete.clearPlacesBias();
            await autocomplete.resendPlacesRequestForMore(false);

            lastCall = fetchMock.mock.calls[1][0] as string;
            expect(lastCall).not.toContain('bias=proximity:-122.4194');
            // Should fallback to IP geolocation
            expect(lastCall).toContain(`bias=proximity:${YV_LON},${YV_LAT}`);
        });
    });
});
