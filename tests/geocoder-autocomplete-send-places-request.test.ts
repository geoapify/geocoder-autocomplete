import '@testing-library/jest-dom';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";
import fetchMock from 'jest-fetch-mock';
import { mockIpInfo, mockPlacesApi, reset } from "./test-helper";
import { mockIpInfoResponse, mockPlacesApiResponse } from "./test-data";

fetchMock.enableMocks();

const PLACES_API_URL = "https://api.geoapify.com/v2/places";
const API_KEY = "XXXXX";

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
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            const bias = {
                proximity: { lon: -87.770231, lat: 41.878968 }
            };

            const filter = {
                circle: { lon: -87.770231, lat: 41.878968, radiusMeters: 5000 }
            };

            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                bias,
                filter
            );

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

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            await autocomplete.sendPlacesRequest(['catering.cafe']);

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

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            const customBias = {
                proximity: { lon: 5, lat: 10 }
            };

            const customFilter = {
                circle: { lon: 5, lat: 10, radiusMeters: 3000 }
            };

            await autocomplete.sendPlacesRequest(['catering.cafe'], customBias, customFilter);

            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
            expect(lastCall).toContain('bias=proximity:5,10');
            expect(lastCall).not.toContain('proximity:9.1829,48.7758');
            expect(lastCall).toContain('filter=circle:5,10,3000');
        });

        it('should successfully make API call with all parameters', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                { proximity: { lon: 10, lat: 20 } },
                { circle: { lon: 10, lat: 20, radiusMeters: 5000 } },
                0,
                10
            );

            expect(result).toBeDefined();
            expect(result.type).toBe('FeatureCollection');
            expect(result.features).toBeInstanceOf(Array);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(PLACES_API_URL)
            );
        });
    });

    describe('Real API Tests - Filter Options', () => {
        beforeEach(() => {
            fetchMock.disableMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        afterEach(() => {
            fetchMock.enableMocks();
        });

        it('should support filter by circle', async () => {
            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                undefined,
                {
                    circle: {
                        lon: SF_LON,
                        lat: SF_LAT,
                        radiusMeters: 3000
                    }
                },
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);
        }, 10000);

        it('should support filter by rect', async () => {
            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                undefined,
                {
                    rect: {
                        lon1: -122.43,
                        lat1: 37.76,
                        lon2: -122.41,
                        lat2: 37.78
                    }
                },
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);
        }, 10000);

        it('should support filter by place (string)', async () => {
            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                undefined,
                {
                    place: '51cf84e2ac62d23440597454a3c04a614440f00102f901cf03a60700000000c00208'
                },
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);
        }, 10000);
    });

    describe('Real API Tests - Bias Options', () => {
        beforeEach(() => {
            fetchMock.disableMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        afterEach(() => {
            fetchMock.enableMocks();
        });

        it('should support bias by proximity', async () => {
            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                {
                    proximity: {
                        lon: SF_LON,
                        lat: SF_LAT
                    }
                },
                undefined,
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);
        }, 10000);
    });

    describe('Real API Tests - Combinations', () => {
        beforeEach(() => {
            fetchMock.disableMocks();
            autocomplete = new GeocoderAutocomplete(container, API_KEY, options);
        });

        afterEach(() => {
            fetchMock.enableMocks();
        });

        it('should support bias (proximity) + filter (circle)', async () => {
            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
                {
                    proximity: { lon: SF_LON, lat: SF_LAT }
                },
                {
                    circle: {
                        lon: SF_LON,
                        lat: SF_LAT,
                        radiusMeters: 3000
                    }
                },
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);
        }, 10000);

        it('should support bias (proximity) + filter (rect)', async () => {
            const result = await autocomplete.sendPlacesRequest(
                ['catering.cafe'],
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
                },
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);
        }, 10000);
    });

    describe('Real API Tests - Fallback to Options', () => {
        beforeEach(() => {
            fetchMock.disableMocks();
        });

        afterEach(() => {
            fetchMock.enableMocks();
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

            const result = await testAutocomplete.sendPlacesRequest(
                ['catering.cafe'],
                undefined,
                undefined,
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);

            reset(testAutocomplete);
        }, 10000);

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

            const result = await testAutocomplete.sendPlacesRequest(
                ['catering.cafe'],
                { proximity: { lon: SF_LON, lat: SF_LAT } },
                undefined,
                0,
                3
            );

            expect(result.features).toBeDefined();
            expect(result.features).toBeInstanceOf(Array);

            reset(testAutocomplete);
        }, 10000);
    });
});

