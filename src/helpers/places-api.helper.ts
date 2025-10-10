import { GeocoderAutocompleteOptions, GeoPosition, ByProximityOptions, ByCircleOptions, ByRectOptions } from "../autocomplete";
import { IpGeolocationResponse } from "../types/internal";
import { CalculationHelper } from "./calculation.helper";

export class PlacesApiHelper {

    public static generatePlacesUrl(
        category: string[],
        apiKey: string,
        options: GeocoderAutocompleteOptions,
        placesApiUrl: string,
        location?: GeoPosition | null,
        offset?: number,
        limit?: number,
        bias?: { [key: string]: ByProximityOptions },
        filter?: { [key: string]: ByCircleOptions | ByRectOptions | string }
    ): string {
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
        const biasString = this.generatePlacesApiBiasString(effectiveBias, location);
        if (biasString) {
            url += `&bias=${biasString}`;
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

    private static convertGeocoderBiasToPlacesApiBias(bias?: { [key: string]: any }): { [key: string]: ByProximityOptions } | undefined {
        if (!bias) return undefined;

        const placesApiBias: { [key: string]: ByProximityOptions } = {};

        if (bias['proximity']) {
            placesApiBias.proximity = bias['proximity'];
        }

        return Object.keys(placesApiBias).length > 0 ? placesApiBias : undefined;
    }

    private static convertGeocoderFilterToPlacesApiFilter(filter?: { [key: string]: any }): { [key: string]: ByCircleOptions | ByRectOptions | string } | undefined {
        if (!filter) return undefined;

        const placesApiFilter: { [key: string]: ByCircleOptions | ByRectOptions | string } = {};

        if (filter['circle']) {
            placesApiFilter.circle = filter['circle'];
        }

        if (filter['rect']) {
            placesApiFilter.rect = filter['rect'];
        }

        if (filter['place'] && typeof filter['place'] === 'string') {
            placesApiFilter.place = filter['place'];
        }

        return Object.keys(placesApiFilter).length > 0 ? placesApiFilter : undefined;
    }

    private static generatePlacesApiFilterString(
        filter?: { [key: string]: ByCircleOptions | ByRectOptions | string }
    ): string {
        if (!filter) return '';
        
        const filters: string[] = [];
        
        Object.keys(filter).forEach(key => {
            const value = filter[key];
            if (value) {
                if (key === 'circle') {
                    const circleValue = value as ByCircleOptions;
                    if (circleValue.lat && circleValue.lon && circleValue.radiusMeters) {
                        filters.push(`circle:${circleValue.lon},${circleValue.lat},${circleValue.radiusMeters}`);
                    }
                } else if (key === 'rect') {
                    const rectValue = value as ByRectOptions;
                    if (rectValue.lat1 && rectValue.lon1 && rectValue.lat2 && rectValue.lon2) {
                        filters.push(`rect:${rectValue.lon1},${rectValue.lat1},${rectValue.lon2},${rectValue.lat2}`);
                    }
                } else if (key === 'place' || key === 'geometry') {
                    const stringValue = value as string;
                    if (stringValue) {
                        filters.push(`${key}:${stringValue}`);
                    }
                }
            }
        });

        return filters.join('|');
    }

    private static generatePlacesApiBiasString(
        bias?: { [key: string]: ByProximityOptions },
        location?: GeoPosition | null
    ): string {
        const biases: string[] = [];
        
        if (bias) {
            Object.keys(bias).forEach(key => {
                const value = bias[key];
                if (value && key === 'proximity' && value.lat && value.lon) {
                    biases.push(`proximity:${value.lon},${value.lat}`);
                }
            });
        }

        // Add location as fallback proximity if no proximity bias was set
        if (location && (!bias || !bias['proximity']) &&
            CalculationHelper.isLatitude(location.lat) && 
            CalculationHelper.isLongitude(location.lon)) {
            biases.push(`proximity:${location.lon},${location.lat}`);
        }

        return biases.join('|');
    }
}
