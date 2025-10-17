import '@testing-library/jest-dom';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";
import fetchMock from 'jest-fetch-mock';
import { mockIpInfo, mockPlacesApi, reset } from "./test-helper";
import { mockIpInfoResponse, mockPlacesApiResponse } from "./test-data";

fetchMock.enableMocks();

const API_KEY = "b8568cb9afc64fad861a69edbddb2658";

// San Francisco coordinates for testing
const SF_LON = -122.4194;
const SF_LAT = 37.7749;

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
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.sendPlacesRequest();

            expect(result).toEqual(mockPlacesApiResponse);
            
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

            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            await autocomplete.sendPlacesRequest();

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


            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

                        const customBias = {
                proximity: { lon: 5, lat: 10 }
            };

            const customFilter = {
                circle: { lon: 5, lat: 10, radiusMeters: 3000 }
            };

            await autocomplete.resendPlacesRequestForMore(false, 0, customBias, customFilter);

            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('bias=proximity:5,10');
            expect(lastCall).not.toContain('proximity:9.1829,48.7758');
            expect(lastCall).toContain('filter=circle:5,10,3000');
        });

        it('should successfully make API call with all parameters', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.setPlacesLimit(50);
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.resendPlacesRequestForMore(
                false,
                330,
                { proximity: { lon: 10, lat: 20 } },
                { circle: { lon: 10, lat: 20, radiusMeters: 5000 } }
            );

            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('offset=330');
            expect(lastCall).toContain('limit=5');
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
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.sendPlacesRequest();

            expect(result).toEqual(mockPlacesApiResponse);
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
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.sendPlacesRequest();

            expect(result).toEqual(mockPlacesApiResponse);
            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=rect:-122.43,37.76,-122.41,37.78');
        });

        it('should support filter by place (string)', async () => {
            autocomplete.addBiasByProximity({ lon: SF_LON, lat: SF_LAT });
            autocomplete.addFilterByPlace('51cf84e2ac62d23440597454a3c04a614440f00102f901cf03a60700000000c00208');
            autocomplete.setPlacesLimit(5);

            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.sendPlacesRequest();

            expect(result).toEqual(mockPlacesApiResponse);
            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('filter=place:51cf84e2ac62d23440597454a3c04a614440f00102f901cf03a60700000000c00208');
        });
    });

    describe('Real API Tests - Bias Options', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        it('should support bias by proximity', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.resendPlacesRequestForMore(
                false,
                0,
                {
                    proximity: {
                        lon: SF_LON,
                        lat: SF_LAT
                    }
                }
            );

            expect(result).toEqual(expect.objectContaining({ features: expect.any(Array) }));
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
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.resendPlacesRequestForMore(
                false,
                0,
                {
                    proximity: { lon: SF_LON, lat: SF_LAT }
                },
                {
                    circle: {
                        lon: SF_LON,
                        lat: SF_LAT,
                        radiusMeters: 3000
                    }
                }
            );

            expect(result).toEqual(expect.objectContaining({ features: expect.any(Array) }));
            const lastCall = fetchMock.mock.calls[0][0] as string;
            expect(lastCall).toContain('bias=proximity:-122.4194,37.7749');
            expect(lastCall).toContain('filter=circle:-122.4194,37.7749,3000');
        });

        it('should support bias (proximity) + filter (rect)', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);
            const result = await autocomplete.resendPlacesRequestForMore(
                false,
                0,
                {
                    proximity: { lon: SF_LON, lat: SF_LAT }
                },
                {
                    rect: {
                        lon1: -122.43,
                        lat1: 37.76,
                        lon2: -122.41,
                        lat2: 37.78
                    }
                }
            );

            expect(result).toEqual(expect.objectContaining({ features: expect.any(Array) }));
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
            await testAutocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await testAutocomplete.sendPlacesRequest();

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);

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
            await testAutocomplete.setCategory('catering.cafe');

            fetchMock.resetMocks();
            mockPlacesApi(mockPlacesApiResponse);

            const result = await testAutocomplete.resendPlacesRequestForMore(
                false,
                0,
                { proximity: { lon: SF_LON, lat: SF_LAT } },
                undefined
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);

            reset(testAutocomplete);
        });
    });
});
