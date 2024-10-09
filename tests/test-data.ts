import '@testing-library/jest-dom';

export const options: any = {
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

export const mockResponseWithData = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Main St' }, text: '123 Main St' },
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Elm St' }, text: '123 Elm St' }
    ]
};

export const mockResponseWithData2 = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '555 Main St' }, text: '555 Main St' }
    ]
};

export const mockResponseWithDataOSM = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Main St', datasource: {sourcename: 'openstreetmap'}, place_id: 'placeId'}, text: '123 Main St'},
    ]
};

export const mockResponseWithDataParsed = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Main St', rank: {match_type: 'match_by_street'}, address_line1: 'address line 1'}, text: '123 Main St' },
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Elm St' , rank: {match_type: 'match_by_city_or_disrict'}, address_line1: 'address lin 1'}, text: '123 Elm St' }
    ],
    query: {
        parsed: {
            housenumber: 'test_housenumber',
            street: 'test_street'
        }
    }
};

export const mockResponseWithDataParsedWithoutHouseNumber = {
    features: [
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Main St', rank: {match_type: 'match_by_street'}, address_line1: 'address line 1'}, text: '123 Main St' },
        { properties: { result_type: 'street', country_code: 'ad', formatted: '123 Elm St' , rank: {match_type: 'match_by_city_or_disrict'}, address_line1: 'address lin 1'}, text: '123 Elm St' }
    ],
    query: {
        parsed: {
            street: 'test_street'
        }
    }
};

export const mockEmptyResponse = {
    features: [] as string[]
};