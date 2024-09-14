import { GeocoderAutocomplete } from "../src";

describe('GeocoderAutocomplete', () => {
    let autocomplete: GeocoderAutocomplete;

    beforeEach(() => {
        const myAPIKey = "XXXXX";
        const inputElement = document.createElement('input');
        autocomplete = new GeocoderAutocomplete(
            inputElement,
            myAPIKey, {
                skipDetails: true,
                skipIcons: true,
                placeholder: " "
            });
    });

    it('should initialize without errors', () => {
        expect(autocomplete).toBeDefined();
    });
});
