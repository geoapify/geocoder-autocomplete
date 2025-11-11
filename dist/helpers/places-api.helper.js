import { CalculationHelper } from "./calculation.helper";
import { BY_CIRCLE, BY_PLACE, BY_PROXIMITY, BY_RECT } from "./constants";
export class PlacesApiHelper {
    static generatePlacesUrl(category, apiKey, options, placesApiUrl, offset, limit, bias, filter) {
        const categoriesParam = category.map(c => encodeURIComponent(c)).join(',');
        let url = `${placesApiUrl}?categories=${categoriesParam}&apiKey=${apiKey}`;
        if (options.lang) {
            url += `&lang=${options.lang}`;
        }
        if (limit !== undefined && limit > 0) {
            url += `&limit=${limit}`;
        }
        if (offset !== undefined && offset > 0) {
            url += `&offset=${offset}`;
        }
        // Merge filter: passed parameter takes precedence over options
        const effectiveFilter = filter || this.convertGeocoderFilterToPlacesApiFilter(options.filter);
        const filters = this.generatePlacesApiFilterString(effectiveFilter);
        if (filters) {
            url += `&filter=${filters}`;
        }
        // Merge bias: passed parameter takes precedence over options
        const effectiveBias = bias || this.convertGeocoderBiasToPlacesApiBias(options.bias);
        const biasString = this.generatePlacesApiBiasString(effectiveBias);
        if (biasString) {
            url += `&bias=${biasString}`;
        }
        return url;
    }
    static sendPlacesRequest(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then((response) => {
                if (response.ok) {
                    response.json().then(data => resolve(data));
                }
                else {
                    response.json().then(data => reject(data));
                }
            })
                .catch(error => reject(error));
        });
    }
    static async getLocationForBias(apiKey, options, ipGeolocationUrl) {
        const existingProximity = options.bias?.['proximity'];
        if (existingProximity &&
            CalculationHelper.isLatitude(existingProximity.lat) &&
            CalculationHelper.isLongitude(existingProximity.lon)) {
            return {
                lat: existingProximity.lat,
                lon: existingProximity.lon
            };
        }
        try {
            const ipUrl = `${ipGeolocationUrl}?apiKey=${apiKey}`;
            const response = await fetch(ipUrl);
            if (response.ok) {
                const data = await response.json();
                return {
                    lat: data.location.latitude,
                    lon: data.location.longitude
                };
            }
        }
        catch (error) {
            console.warn('Failed to get location for Places API bias:', error);
        }
        return null;
    }
    static convertGeocoderBiasToPlacesApiBias(bias) {
        if (!bias)
            return undefined;
        const placesApiBias = {};
        if (bias[BY_PROXIMITY]) {
            placesApiBias[BY_PROXIMITY] = bias[BY_PROXIMITY];
        }
        if (bias[BY_CIRCLE]) {
            placesApiBias[BY_CIRCLE] = bias[BY_CIRCLE];
        }
        if (bias[BY_RECT]) {
            placesApiBias[BY_RECT] = bias[BY_RECT];
        }
        return Object.keys(placesApiBias).length > 0 ? placesApiBias : undefined;
    }
    static convertGeocoderFilterToPlacesApiFilter(filter) {
        if (!filter)
            return undefined;
        const placesApiFilter = {};
        if (filter[BY_CIRCLE]) {
            placesApiFilter[BY_CIRCLE] = filter[BY_CIRCLE];
        }
        if (filter[BY_RECT]) {
            placesApiFilter[BY_RECT] = filter[BY_RECT];
        }
        if (filter[BY_PLACE] && typeof filter[BY_PLACE] === 'string') {
            placesApiFilter[BY_PLACE] = filter[BY_PLACE];
        }
        return Object.keys(placesApiFilter).length > 0 ? placesApiFilter : undefined;
    }
    static generatePlacesApiFilterString(filter) {
        if (!filter)
            return '';
        const filters = [];
        Object.keys(filter).forEach(key => {
            const value = filter[key];
            if (value) {
                if (key === 'circle') {
                    const circleValue = value;
                    if (circleValue.lat && circleValue.lon && circleValue.radiusMeters) {
                        filters.push(`circle:${circleValue.lon},${circleValue.lat},${circleValue.radiusMeters}`);
                    }
                }
                else if (key === 'rect') {
                    const rectValue = value;
                    if (rectValue.lat1 && rectValue.lon1 && rectValue.lat2 && rectValue.lon2) {
                        filters.push(`rect:${rectValue.lon1},${rectValue.lat1},${rectValue.lon2},${rectValue.lat2}`);
                    }
                }
                else if (key === 'place' || key === 'geometry') {
                    const stringValue = value;
                    if (stringValue) {
                        filters.push(`${key}:${stringValue}`);
                    }
                }
            }
        });
        return filters.join('|');
    }
    static generatePlacesApiBiasString(bias) {
        const biases = [];
        if (bias) {
            Object.keys(bias).forEach(key => {
                const value = bias[key];
                if (value && key === 'proximity') {
                    const proximityBias = value;
                    if (proximityBias.lat && proximityBias.lon) {
                        biases.push(`proximity:${proximityBias.lon},${proximityBias.lat}`);
                    }
                }
                else if (key === 'rect') {
                    const rectValue = value;
                    if (rectValue.lat1 && rectValue.lon1 && rectValue.lat2 && rectValue.lon2) {
                        biases.push(`rect:${rectValue.lon1},${rectValue.lat1},${rectValue.lon2},${rectValue.lat2}`);
                    }
                }
                else if (key === 'circle') {
                    const circleValue = value;
                    if (circleValue.lat && circleValue.lon && circleValue.radiusMeters) {
                        biases.push(`circle:${circleValue.lon},${circleValue.lat},${circleValue.radiusMeters}`);
                    }
                }
            });
        }
        return biases.join('|');
    }
}
