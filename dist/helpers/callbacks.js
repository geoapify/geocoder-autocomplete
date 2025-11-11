export class Callbacks {
    changeCallbacks = [];
    suggestionsChangeCallbacks = [];
    inputCallbacks = [];
    openCallbacks = [];
    closeCallbacks = [];
    requestStartCallbacks = [];
    requestEndCallbacks = [];
    placesCallbacks = [];
    placesRequestStartCallbacks = [];
    placesRequestEndCallbacks = [];
    placeDetailsRequestStartCallbacks = [];
    placeDetailsRequestEndCallbacks = [];
    placeSelectCallbacks = [];
    clearCallbacks = [];
    addCallback(operation, callback) {
        let currentCallbacks = this.getCallbacksByOperation(operation);
        if (currentCallbacks) {
            if (currentCallbacks.indexOf(callback) < 0) {
                currentCallbacks.push(callback);
            }
        }
    }
    removeCallback(operation, callback) {
        let currentCallbacks = this.getCallbacksByOperation(operation);
        if (currentCallbacks) {
            if (currentCallbacks.indexOf(callback) >= 0) {
                currentCallbacks.splice(currentCallbacks.indexOf(callback), 1);
                this.setCallbacksByOperation(operation, currentCallbacks);
            }
            else if (!callback) {
                this.setCallbacksByOperation(operation, []);
            }
        }
    }
    notifyInputChange(currentValue) {
        this.inputCallbacks.forEach(callback => callback(currentValue));
    }
    notifyChange(feature) {
        this.changeCallbacks.forEach(callback => callback(feature));
    }
    notifySuggestions(features) {
        this.suggestionsChangeCallbacks.forEach(callback => callback(features));
    }
    notifyOpened() {
        this.openCallbacks.forEach(callback => callback(true));
    }
    notifyClosed() {
        this.closeCallbacks.forEach(callback => callback(false));
    }
    notifyRequestStart(query) {
        this.requestStartCallbacks.forEach(callback => callback(query));
    }
    notifyRequestEnd(success, data, error) {
        this.requestEndCallbacks.forEach(callback => callback(success, data, error));
    }
    notifyPlaces(places) {
        this.placesCallbacks.forEach(callback => callback(places));
    }
    notifyPlacesRequestStart(category) {
        this.placesRequestStartCallbacks.forEach(callback => callback(category));
    }
    notifyPlacesRequestEnd(success, data, error) {
        this.placesRequestEndCallbacks.forEach(callback => callback(success, data, error));
    }
    notifyPlaceDetailsRequestStart(place) {
        this.placeDetailsRequestStartCallbacks.forEach(callback => callback(place));
    }
    notifyPlaceDetailsRequestEnd(success, data, error) {
        this.placeDetailsRequestEndCallbacks.forEach(callback => callback(success, data, error));
    }
    notifyPlaceSelect(place, index) {
        this.placeSelectCallbacks.forEach(callback => callback(place, index));
    }
    notifyClear(itemType) {
        this.clearCallbacks.forEach(callback => callback(itemType));
    }
    getCallbacksByOperation(operation) {
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
                currentCallbacks = this.placeSelectCallbacks;
                break;
            }
            case 'clear': {
                currentCallbacks = this.clearCallbacks;
                break;
            }
        }
        return currentCallbacks;
    }
    setCallbacksByOperation(operation, callbacks) {
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
                this.placeSelectCallbacks = callbacks;
                break;
            }
            case 'clear': {
                this.clearCallbacks = callbacks;
                break;
            }
        }
    }
}
