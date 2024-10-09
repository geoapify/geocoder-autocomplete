export class Callbacks {
    public changeCallbacks: ((selectedOption: any) => void)[] = [];
    public suggestionsChangeCallbacks: ((options: any[]) => void)[] = [];
    public inputCallbacks: ((input: string) => void)[] = [];
    public openCallbacks: ((opened: boolean) => void)[] = [];
    public closeCallbacks: ((opened: boolean) => void)[] = [];

    addCallback(operation: 'select' | 'suggestions' | 'input' | 'close' | 'open', callback: (param: any) => void) {
        let currentCallbacks = this.getCallbacksByOperation(operation);
        if(currentCallbacks) {
            if (currentCallbacks.indexOf(callback) < 0) {
                currentCallbacks.push(callback);
            }
        }
    }

    removeCallback(operation: 'select' | 'suggestions' | 'input' | 'close' | 'open', callback?: (param: any) => any) {
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

    private getCallbacksByOperation(operation: "select" | "suggestions" | "input" | "close" | "open") {
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
        }
        return currentCallbacks;
    }

    private setCallbacksByOperation(operation: "select" | "suggestions" | "input" | "close" | "open",
                                    callbacks: ((data: any) => void)[]) {
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
        }
    }
}