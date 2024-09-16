import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";

const options: any = {
    skipDetails: true,
    skipIcons: true,
    placeholder: " ",
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

function createGeocoderAutocomplete() {
    const myAPIKey = "XXXXX";
    const inputElement = document.createElement('input');
    return new GeocoderAutocomplete(
        inputElement,
        myAPIKey, options);
}

describe('GeocoderAutocomplete', () => {
    let autocomplete = createGeocoderAutocomplete();

    it('should init the options properly', () => {
        expect(autocomplete).toBeDefined();
        let initiatedOptions: GeocoderAutocompleteOptions = getPrivateProperty(autocomplete, "options")
        expect(initiatedOptions.filter).toBe(options.filter);
        expect(initiatedOptions.bias).toBe(options.bias);
    });
});

function getPrivateProperty(object: any, field: any) {
    return object[field];
}