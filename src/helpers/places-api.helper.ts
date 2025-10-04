import { GeocoderAutocompleteOptions, GeoPosition } from "../autocomplete";
import { IpGeolocationResponse } from "../types/internal";
import { CalculationHelper } from "./calculation.helper";

export class PlacesApiHelper {
    private static readonly DEFAULT_PLACES_API_URL = "https://api.geoapify.com/v2/places";
    private static readonly IP_GEOLOCATION_URL = "https://api.geoapify.com/v1/ipinfo";

    public static generatePlacesUrl(
        category: string,
        apiKey: string,
        options: GeocoderAutocompleteOptions,
        placesApiUrl: string,
        location?: GeoPosition | null,
        offset?: number,
        limit?: number
    ): string {
        let url = `${placesApiUrl}?categories=${encodeURIComponent(category)}&apiKey=${apiKey}`;

        if (options.lang) {
            url += `&lang=${options.lang}`;
        }

        if (limit !== undefined && limit > 0) {
            url += `&limit=${limit}`;
        }

        if (offset !== undefined && offset > 0) {
            url += `&offset=${offset}`;
        }

        const filters = this.generateFilterString(options.filter || {});
        if (filters) {
            url += `&filter=${filters}`;
        }

        const bias = this.generateBiasString(options.bias || {}, location);
        if (bias) {
            url += `&bias=${bias}`;
        }

        return url;
    }

    public static sendPlacesRequest(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then((response) => {
                    if (response.ok) {
                        response.json().then(data => resolve(data));
                    } else {
                        response.json().then(data => reject(data));
                    }
                })
                .catch(error => reject(error));
        });
    }

    public static async getLocationForBias(
        apiKey: string,
        options: GeocoderAutocompleteOptions,
        ipGeolocationUrl: string
    ): Promise<GeoPosition | null> {
        const existingProximity = options.bias?.['proximity'] as any;
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
                const data: IpGeolocationResponse = await response.json();
                return {
                    lat: data.location.latitude,
                    lon: data.location.longitude
                };
            }
        } catch (error) {
            console.warn('Failed to get location for Places API bias:', error);
        }

        return null;
    }

    private static generateFilterString(filter: { [key: string]: any }): string {
        const filters: string[] = [];
        
        Object.keys(filter).forEach(key => {
            const value = filter[key];
            if (value) {
                if (key === 'countrycode' && Array.isArray(value)) {
                    filters.push(`countrycode:${value.join(',').toLowerCase()}`);
                } else if (key === 'circle' && value.lat && value.lon && value.radiusMeters) {
                    filters.push(`circle:${value.lon},${value.lat},${value.radiusMeters}`);
                } else if (key === 'rect' && value.lat1 && value.lon1 && value.lat2 && value.lon2) {
                    filters.push(`rect:${value.lon1},${value.lat1},${value.lon2},${value.lat2}`);
                } else if (key === 'place' && typeof value === 'string') {
                    filters.push(`place:${value}`);
                }
            }
        });

        return filters.join('|');
    }

    private static generateBiasString(
        bias: { [key: string]: any },
        location?: GeoPosition | null
    ): string {
        const biases: string[] = [];
        
        Object.keys(bias).forEach(key => {
            const value = bias[key];
            if (value) {
                if (key === 'proximity' && value.lat && value.lon) {
                    biases.push(`proximity:${value.lon},${value.lat}`);
                } else if (key === 'countrycode' && Array.isArray(value)) {
                    biases.push(`countrycode:${value.join(',').toLowerCase()}`);
                } else if (key === 'circle' && value.lat && value.lon && value.radiusMeters) {
                    biases.push(`circle:${value.lon},${value.lat},${value.radiusMeters}`);
                } else if (key === 'rect' && value.lat1 && value.lon1 && value.lat2 && value.lon2) {
                    biases.push(`rect:${value.lon1},${value.lat1},${value.lon2},${value.lat2}`);
                }
            }
        });

        if (location && !bias['proximity'] &&
            CalculationHelper.isLatitude(location.lat) && 
            CalculationHelper.isLongitude(location.lon)) {
            biases.push(`proximity:${location.lon},${location.lat}`);
        }

        return biases.join('|');
    }
}
