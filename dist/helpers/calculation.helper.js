import { BY_CIRCLE, BY_COUNTRYCODE, BY_PLACE, BY_PROXIMITY, BY_RECT } from "./constants";
export class CalculationHelper {
    static isLatitude(num) {
        return num !== '' && num !== null && isFinite(num) && Math.abs(num) <= 90;
    }
    static isLongitude(num) {
        return num !== '' && num !== null && isFinite(num) && Math.abs(num) <= 180;
    }
    static isNotOpenStreetMapData(feature) {
        return feature.properties.datasource?.sourcename !== 'openstreetmap' || !feature.properties.place_id;
    }
    static extendByNonVerifiedValues(options, features, parsedAddress) {
        features.forEach((feature) => {
            if (parsedAddress.housenumber &&
                options.allowNonVerifiedHouseNumber && feature.properties.rank.match_type === "match_by_street") {
                // add housenumber
                this.addHouseNumberToFormatted(feature.properties, null, parsedAddress.housenumber);
                feature.properties.nonVerifiedParts = ["housenumber"];
            }
            else if (parsedAddress.street && parsedAddress.housenumber &&
                options.allowNonVerifiedStreet &&
                (feature.properties.rank.match_type === "match_by_city_or_disrict" || feature.properties.rank.match_type === "match_by_postcode")) {
                // add housenumber and street
                this.addHouseNumberToFormatted(feature.properties, parsedAddress.street, parsedAddress.housenumber);
                feature.properties.nonVerifiedParts = ["housenumber", "street"];
            }
            else if (parsedAddress.street &&
                options.allowNonVerifiedStreet &&
                (feature.properties.rank.match_type === "match_by_city_or_disrict" || feature.properties.rank.match_type === "match_by_postcode")) {
                // add street
                feature.properties.street = parsedAddress.street.replace(/(^\w|\s\w|[-]\w)/g, (m) => m.toUpperCase());
                feature.properties.address_line1 = feature.properties.street;
                feature.properties.address_line2 = feature.properties.formatted;
                feature.properties.formatted = feature.properties.street + ", " + feature.properties.formatted;
                feature.properties.nonVerifiedParts = ["street"];
            }
        });
    }
    static addHouseNumberToFormatted(featureProperties, street, housenumber) {
        const houseNumberAndStreetFormatsPerCountry = {
            "{{{road}}} {{{house_number}}}": ["af", "ai", "al", "ao", "ar", "at", "aw", "ax", "ba", "be", "bg", "bi", "bo", "bq", "br", "bs", "bt", "bv", "bw", "cf", "ch", "cl", "cm", "co", "cr", "cu", "cv", "cw", "cy", "cz", "de", "dk", "do", "ec", "ee", "eh", "er", "et", "fi", "fo", "gd", "ge", "gl", "gq", "gr", "gt", "gw", "hn", "hr", "ht", "hu", "id", "il", "ir", "is", "jo", "ki", "km", "kp", "kw", "lc", "li", "lr", "lt", "lv", "ly", "me", "mk", "ml", "mn", "mo", "mx", "ni", "nl", "no", "np", "pa", "pe", "pl", "ps", "pt", "pw", "py", "qa", "ro", "rs", "ru", "sb", "sd", "se", "si", "sj", "sk", "so", "sr", "ss", "st", "sv", "sx", "sz", "td", "tj", "tl", "tr", "um", "uz", "uy", "vc", "ve", "vu", "ws"],
            "{{{house_number}}} {{{road}}}": ["ad", "ae", "ag", "am", "as", "au", "az", "bb", "bd", "bf", "bh", "bl", "bm", "bz", "ca", "cc", "ci", "ck", "cn", "cx", "dj", "dm", "dz", "eg", "fj", "fk", "fm", "fr", "ga", "gb", "gf", "gg", "gh", "gi", "gm", "gn", "gp", "gs", "gu", "gy", "hk", "hm", "ie", "im", "io", "iq", "je", "jm", "jp", "ke", "kh", "kn", "kr", "ky", "lb", "lk", "ls", "lu", "ma", "mc", "mf", "mh", "mg", "mm", "mp", "ms", "mt", "mq", "mv", "mw", "my", "na", "nc", "ne", "nf", "ng", "nr", "nu", "nz", "om", "pf", "pg", "ph", "pk", "pm", "pr", "re", "rw", "sa", "sc", "sg", "sh", "sl", "sn", "tc", "tf", "th", "tk", "tn", "to", "tt", "tv", "tw", "tz", "ug", "us", "vg", "vi", "wf", "yt", "za", "zm", "zw"],
            "{{{road}}}, {{{house_number}}}": ["by", "es", "it", "kg", "kz", "md", "mz", "sm", "sy", "ua", "va"],
            "{{{house_number}}}, {{{road}}}": ["bj", "bn", "cd", "cg", "in", "la", "mr", "mu", "tg", "tm", "vn", "ye"]
        };
        const format = Object.keys(houseNumberAndStreetFormatsPerCountry).find(key => houseNumberAndStreetFormatsPerCountry[key].indexOf(featureProperties.country_code) >= 0) || "{{{road}}} {{{house_number}}}";
        if (street) {
            // add street and housenumber
            featureProperties.street = street.replace(/(^\w|\s\w|[-]\w)/g, m => m.toUpperCase());
            featureProperties.housenumber = housenumber;
            const addressPart = format.replace("{{{road}}}", featureProperties.street).replace("{{{house_number}}}", housenumber);
            featureProperties.address_line1 = addressPart;
            featureProperties.address_line2 = featureProperties.formatted;
            featureProperties.formatted = addressPart + ", " + featureProperties.formatted;
        }
        else {
            // add house number only
            featureProperties.housenumber = housenumber;
            const addressPart = format.replace("{{{road}}}", featureProperties.street).replace("{{{house_number}}}", housenumber);
            featureProperties.address_line1 = featureProperties.address_line1.replace(featureProperties.street, addressPart);
            ;
            featureProperties.formatted = featureProperties.formatted.replace(featureProperties.street, addressPart);
        }
    }
    static generatePlacesUrl(placeDetailsUrl, placeId, apiKey, options) {
        let url = `${placeDetailsUrl}?id=${placeId}&apiKey=${apiKey}`;
        if (options.lang) {
            url += `&lang=${options.lang}`;
        }
        return url;
    }
    static needToFilterDataBySuggestionsFilter(currentItems, suggestionsFilter) {
        return currentItems && currentItems.length && suggestionsFilter && typeof suggestionsFilter === 'function';
    }
    static needToCalculateExtendByNonVerifiedValues(data, options) {
        return data.features && data.features.length &&
            data?.query?.parsed &&
            (options.allowNonVerifiedHouseNumber || options.allowNonVerifiedStreet);
    }
    static generateUrl(value, geocoderUrl, apiKey, options) {
        let url = `${geocoderUrl}?text=${encodeURIComponent(value)}&apiKey=${apiKey}`;
        // Add type of the location if set. Learn more about possible parameters on https://apidocs.geoapify.com/docs/geocoding/api/api
        if (options.type) {
            url += `&type=${options.type}`;
        }
        if (options.limit) {
            url += `&limit=${options.limit}`;
        }
        if (options.lang) {
            url += `&lang=${options.lang}`;
        }
        const filters = [];
        const filterByCountryCodes = options.filter[BY_COUNTRYCODE];
        const filterByCircle = options.filter[BY_CIRCLE];
        const filterByRect = options.filter[BY_RECT];
        const filterByPlace = options.filter[BY_PLACE];
        if (filterByCountryCodes && filterByCountryCodes.length) {
            filters.push(`countrycode:${filterByCountryCodes.join(',').toLowerCase()}`);
        }
        if (filterByCircle && CalculationHelper.isLatitude(filterByCircle.lat) && CalculationHelper.isLongitude(filterByCircle.lon) && filterByCircle.radiusMeters > 0) {
            filters.push(`circle:${filterByCircle.lon},${filterByCircle.lat},${filterByCircle.radiusMeters}`);
        }
        if (filterByRect && CalculationHelper.isLatitude(filterByRect.lat1) && CalculationHelper.isLongitude(filterByRect.lon1) && CalculationHelper.isLatitude(filterByRect.lat2) && CalculationHelper.isLongitude(filterByRect.lon2)) {
            filters.push(`rect:${filterByRect.lon1},${filterByRect.lat1},${filterByRect.lon2},${filterByRect.lat2}`);
        }
        if (filterByPlace) {
            filters.push(`place:${filterByPlace}`);
        }
        url += filters.length ? `&filter=${filters.join('|')}` : '';
        const bias = [];
        const biasByCountryCodes = options.bias[BY_COUNTRYCODE];
        const biasByCircle = options.bias[BY_CIRCLE];
        const biasByRect = options.bias[BY_RECT];
        const biasByProximity = options.bias[BY_PROXIMITY];
        if (biasByCountryCodes && biasByCountryCodes.length) {
            bias.push(`countrycode:${biasByCountryCodes.join(',').toLowerCase()}`);
        }
        if (biasByCircle && CalculationHelper.isLatitude(biasByCircle.lat) && CalculationHelper.isLongitude(biasByCircle.lon) && biasByCircle.radiusMeters > 0) {
            bias.push(`circle:${biasByCircle.lon},${biasByCircle.lat},${biasByCircle.radiusMeters}`);
        }
        if (biasByRect && CalculationHelper.isLatitude(biasByRect.lat1) && CalculationHelper.isLongitude(biasByRect.lon1) && CalculationHelper.isLatitude(biasByRect.lat2) && CalculationHelper.isLongitude(biasByRect.lon2)) {
            bias.push(`rect:${biasByRect.lon1},${biasByRect.lat1},${biasByRect.lon2},${biasByRect.lat2}`);
        }
        if (biasByProximity && CalculationHelper.isLatitude(biasByProximity.lat) && CalculationHelper.isLongitude(biasByProximity.lon)) {
            bias.push(`proximity:${biasByProximity.lon},${biasByProximity.lat}`);
        }
        url += bias.length ? `&bias=${bias.join('|')}` : '';
        return url;
    }
    static returnIfFunction(func) {
        if (func && typeof func === 'function') {
            return func;
        }
        else {
            return null;
        }
    }
}
