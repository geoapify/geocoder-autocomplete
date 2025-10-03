import { GeocoderEventType, ItemType } from "../types/external";

export class Callbacks {
    public changeCallbacks: ((selectedOption: any) => void)[] = [];
    public suggestionsChangeCallbacks: ((options: any[]) => void)[] = [];
    public inputCallbacks: ((input: string) => void)[] = [];
    public openCallbacks: ((opened: boolean) => void)[] = [];
    public closeCallbacks: ((opened: boolean) => void)[] = [];
    public requestStartCallbacks: ((query: string) => void)[] = [];
    public requestEndCallbacks: ((success: boolean, data?: any, error?: any) => void)[] = [];
    
    public placesCallbacks: ((places: GeoJSON.Feature[]) => void)[] = [];
    public placesRequestStartCallbacks: ((category: string) => void)[] = [];
    public placesRequestEndCallbacks: ((success: boolean, data?: any, error?: any) => void)[] = [];
    public placeDetailsRequestStartCallbacks: ((place: GeoJSON.Feature) => void)[] = [];
    public placeDetailsRequestEndCallbacks: ((success: boolean, data?: any, error?: any) => void)[] = [];
    public placeSelectCallbacks: ((place: GeoJSON.Feature, index: number) => void)[] = [];

    public clearCallbacks: ((itemType: ItemType) => void)[] = [];

    addCallback(operation: GeocoderEventType, callback: (param: any) => void) {
        let currentCallbacks = this.getCallbacksByOperation(operation);
        if(currentCallbacks) {
            if (currentCallbacks.indexOf(callback) < 0) {
                currentCallbacks.push(callback);
            }
        }
    }

    removeCallback(operation: GeocoderEventType, callback?: (param: any) => any) {
        let currentCallbacks = this.getCallbacksByOperation(operation);
        if(currentCallbacks) {
            if (currentCallbacks.indexOf(callback) >= 0) {
                currentCallbacks.splice(currentCallbacks.indexOf(callback), 1);
                this.setCallbacksByOperation(operation, currentCallbacks);
            } else if (!callback) {
                this.setCallbacksByOperation(operation, []);
            }
        }
    }

    notifyInputChange(currentValue: string) {
        this.inputCallbacks.forEach(callback => callback(currentValue));
    }

    notifyChange(feature: any){
        this.changeCallbacks.forEach(callback => callback(feature));
    }

    notifySuggestions(features: any) {
        this.suggestionsChangeCallbacks.forEach(callback => callback(features));
    }

    notifyOpened() {
        this.openCallbacks.forEach(callback => callback(true));
    }

    notifyClosed() {
        this.closeCallbacks.forEach(callback => callback(false));
    }

    notifyRequestStart(query: string) {
        this.requestStartCallbacks.forEach(callback => callback(query));
    }

    notifyRequestEnd(success: boolean, data?: any, error?: any) {
        this.requestEndCallbacks.forEach(callback => callback(success, data, error));
    }

    notifyPlaces(places: GeoJSON.Feature[]) {
        this.placesCallbacks.forEach(callback => callback(places));
    }

    notifyPlacesRequestStart(category: string) {
        this.placesRequestStartCallbacks.forEach(callback => callback(category));
    }

    notifyPlacesRequestEnd(success: boolean, data?: any, error?: any) {
        this.placesRequestEndCallbacks.forEach(callback => callback(success, data, error));
    }

    notifyPlaceDetailsRequestStart(place: GeoJSON.Feature) {
        this.placeDetailsRequestStartCallbacks.forEach(callback => callback(place));
    }

    notifyPlaceDetailsRequestEnd(success: boolean, data?: any, error?: any) {
        this.placeDetailsRequestEndCallbacks.forEach(callback => callback(success, data, error));
    }

    notifyPlaceSelect(place: GeoJSON.Feature, index: number) {
        this.placeSelectCallbacks.forEach(callback => callback(place, index));
    }

    notifyClear(itemType: ItemType) {
        this.clearCallbacks.forEach(callback => callback(itemType));
    }

    private getCallbacksByOperation(operation: GeocoderEventType) {
        let currentCallbacks = null;
        switch (operation) {
            case 'select': {
                currentCallbacks = this.changeCallbacks;
                break;
            }
            case 'suggestions': {
                currentCallbacks = this.suggestionsChangeCallbacks;
                break;
            }
            case 'input': {
                currentCallbacks = this.inputCallbacks;
                break;
            }
            case 'close': {
                currentCallbacks = this.closeCallbacks;
                break;
            }
            case 'open': {
                currentCallbacks = this.openCallbacks;
                break;
            }
            case 'request_start': {
                currentCallbacks = this.requestStartCallbacks;
                break;
            }
            case 'request_end': {
                currentCallbacks = this.requestEndCallbacks;
                break;
            }
            case 'places': {
                currentCallbacks = this.placesCallbacks;
                break;
            }
            case 'places_request_start': {
                currentCallbacks = this.placesRequestStartCallbacks;
                break;
            }
            case 'places_request_end': {
                currentCallbacks = this.placesRequestEndCallbacks;
                break;
            }
            case 'place_details_request_start': {
                currentCallbacks = this.placeDetailsRequestStartCallbacks;
                break;
            }
            case 'place_details_request_end': {
                currentCallbacks = this.placeDetailsRequestEndCallbacks;
                break;
            }
            case 'place_select': {
                currentCallbacks = this.placeSelectCallbacks as any;
                break;
            }
            case 'clear': {
                currentCallbacks = this.clearCallbacks;
                break;
            }
        }
        return currentCallbacks;
    }

    private setCallbacksByOperation(operation: GeocoderEventType, callbacks: ((data: any) => void)[]) {
        switch (operation) {
            case 'select': {
                this.changeCallbacks = callbacks;
                break;
            }
            case 'suggestions': {
                this.suggestionsChangeCallbacks = callbacks;
                break;
            }
            case 'input': {
                this.inputCallbacks = callbacks;
                break;
            }
            case 'close': {
                this.closeCallbacks = callbacks;
                break;
            }
            case 'open': {
                this.openCallbacks = callbacks;
                break;
            }
            case 'request_start': {
                this.requestStartCallbacks = callbacks;
                break;
            }
            case 'request_end': {
                this.requestEndCallbacks = callbacks;
                break;
            }
            case 'places': {
                this.placesCallbacks = callbacks;
                break;
            }
            case 'places_request_start': {
                this.placesRequestStartCallbacks = callbacks;
                break;
            }
            case 'places_request_end': {
                this.placesRequestEndCallbacks = callbacks;
                break;
            }
            case 'place_details_request_start': {
                this.placeDetailsRequestStartCallbacks = callbacks;
                break;
            }
            case 'place_details_request_end': {
                this.placeDetailsRequestEndCallbacks = callbacks;
                break;
            }
            case 'place_select': {
                this.placeSelectCallbacks = callbacks as any;
                break;
            }
            case 'clear': {
                this.clearCallbacks = callbacks;
                break;
            }
        }
    }
}