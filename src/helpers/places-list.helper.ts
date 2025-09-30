import { DomHelper } from "./dom.helper";
import { GeocoderAutocompleteOptions } from "../autocomplete";

export interface PlacesListCallbacks {
    onPlaceSelect?: (place: any, index: number) => void;
    onLoadMore?: (category: string, offset: number, limit?: number) => Promise<any>;
    onPlacesUpdate?: (allPlaces: any[]) => void;
}

interface PlaceData {
    name: string;
    address: string;
    openingHours: string | null;
}

export class PlacesListManager {
    private container: HTMLElement;
    private options: GeocoderAutocompleteOptions;
    private callbacks: PlacesListCallbacks;

    private placesListElement: HTMLElement = null;
    private loadMoreButton: HTMLElement = null;
    
    // Pagination state
    private currentPlacesOffset: number = 0;
    private currentPlacesCategory: string = null;
    private isLoadingMorePlaces: boolean = false;
    private hasMorePlaces: boolean = true;
    private allPlaces: any[] = [];

    constructor(
        container: HTMLElement, 
        options: GeocoderAutocompleteOptions, 
        callbacks: PlacesListCallbacks = {}
    ) {
        this.container = container;
        this.options = options;
        this.callbacks = callbacks;
    }

    public showPlacesList(places: any[], category: string, isLoadMore: boolean = false): void {
        if (!this.options.showPlacesList || !places?.length) return;

        // Create elements if they don't exist
        if (!this.placesListElement) {
            this.createPlacesElements();
        }

        // Handle initial vs load more
        if (!isLoadMore) {
            this.currentPlacesCategory = category;
            this.currentPlacesOffset = 0;
            this.allPlaces = [];
            this.clearPlacesList();
        }

        // Remove existing load more button
        this.removeLoadMoreButton();

        // Add new places
        this.allPlaces.push(...places);
        this.renderPlaces(places, isLoadMore);

        // Update pagination
        this.currentPlacesOffset += places.length;
        this.hasMorePlaces = places.length >= (this.options.limit || 5);

        // Add load more button if needed
        if (this.hasMorePlaces) {
            this.createLoadMoreButton();
        }

        // Show list
        this.showList(isLoadMore);
        
        // Notify callback
        this.callbacks.onPlacesUpdate?.(this.allPlaces);
    }

    public clearPlacesList(): void {
        if (!this.options.showPlacesList) return;

        if (this.placesListElement) {
            this.placesListElement.innerHTML = '';
            this.placesListElement.classList.remove('active', 'standalone');
            this.placesListElement.style.display = 'none';
        }
        
        this.resetPaginationState();
    }

    public resetCategory(): void {
        this.currentPlacesCategory = null;
        this.clearPlacesList();
    }

    private createPlacesElements(): void {
        if (!this.options.showPlacesList) return;

        this.placesListElement = document.createElement('div');
        this.placesListElement.className = 'geoapify-autocomplete-items geoapify-places-list';

        this.container.appendChild(this.placesListElement);
    }

    private renderPlaces(places: any[], isLoadMore: boolean): void {
        const startIndex = isLoadMore ? this.placesListElement.children.length : 0;
        
        places.forEach((place, index) => {
            const placeElement = this.createPlaceItem(place, startIndex + index);
            this.placesListElement.appendChild(placeElement);
        });
    }

    private showList(isLoadMore: boolean): void {
        this.placesListElement.classList.add('active', 'standalone');
        this.placesListElement.style.display = 'block';

        if (!isLoadMore) {
            this.placesListElement.scrollTop = 0;
        }
    }

    private resetPaginationState(): void {
        this.currentPlacesOffset = 0;
        this.hasMorePlaces = true;
        this.isLoadingMorePlaces = false;
        this.loadMoreButton = null;
        this.allPlaces = [];
    }

    private removeLoadMoreButton(): void {
        if (this.loadMoreButton) {
            this.loadMoreButton.remove();
            this.loadMoreButton = null;
        }
    }

    // ========================================================================
    // PLACE ITEM CREATION
    // ========================================================================

    private createPlaceItem(place: any, index: number): HTMLElement {
        const placeElement = document.createElement('div');
        placeElement.className = 'geoapify-autocomplete-item';
        placeElement.dataset.index = index.toString();
        
        const placeData = this.extractPlaceData(place);
        const addressContainer = this.createAddressContainer();
        const nameElement = this.createNameElement(placeData.name);
        const detailsElement = this.createDetailsElement(placeData);
        
        addressContainer.appendChild(nameElement);
        addressContainer.appendChild(detailsElement);
        placeElement.appendChild(addressContainer);
        
        placeElement.addEventListener('click', () => {
            this.selectPlaceFromList(place, index);
        });
        
        return placeElement;
    }

    private extractPlaceData(place: any): PlaceData {
        const props = place.properties;
        return {
            name: props.name || 'Unknown Place',
            address: props.formatted || props.address_line2 || '',
            openingHours: props.opening_hours || null
        };
    }

    private createAddressContainer(): HTMLElement {
        const container = document.createElement('span');
        container.className = 'address';
        container.className = 'address geoapify-places-address-container';
        return container;
    }

    private createNameElement(name: string): HTMLElement {
        const nameElement = document.createElement('span');
        nameElement.className = 'main-part';
        nameElement.textContent = name;
        return nameElement;
    }

    private createDetailsElement(placeData: PlaceData): HTMLElement {
        const detailsElement = document.createElement('span');
        detailsElement.className = 'secondary-part geoapify-places-details';
        
        const addressElement = this.createAddressElement(placeData.address);
        detailsElement.appendChild(addressElement);
        
        if (placeData.openingHours) {
            const hoursElement = this.createOpeningHoursElement(placeData.openingHours);
            detailsElement.appendChild(hoursElement);
        }
        
        return detailsElement;
    }

    private createAddressElement(address: string): HTMLElement {
        const addressElement = document.createElement('span');
        addressElement.className = 'geoapify-places-address-element';
        
        addressElement.textContent = address;
        
        return addressElement;
    }

    private createOpeningHoursElement(openingHours: string): HTMLElement {
        const hoursContainer = document.createElement('span');
        hoursContainer.className = 'geoapify-places-hours-container';
        
        const clockIcon = this.createClockIcon();
        const hoursText = this.createHoursText(openingHours);
        
        hoursContainer.appendChild(clockIcon);
        hoursContainer.appendChild(hoursText);
        
        return hoursContainer;
    }

    private createClockIcon(): HTMLElement {
        const clockIconSpan = document.createElement('span');
        clockIconSpan.className = 'clock-icon geoapify-places-clock-icon';
        
        DomHelper.addIcon(clockIconSpan, 'clock');
        
        return clockIconSpan;
    }

    private createHoursText(openingHours: string): HTMLElement {
        const hoursSpan = document.createElement('span');
        hoursSpan.textContent = openingHours;
        hoursSpan.className = 'geoapify-places-hours-text';
        return hoursSpan;
    }

    // ========================================================================
    // LOAD MORE FUNCTIONALITY
    // ========================================================================

    private createLoadMoreButton(): void {
        if (!this.options.showPlacesList) return;

        this.loadMoreButton = document.createElement('div');
        this.loadMoreButton.className = 'geoapify-places-load-more-button';

        const iconElement = document.createElement('span');
        iconElement.className = 'geoapify-places-load-more-icon';
        DomHelper.addIcon(iconElement, 'chevron-down');
        this.loadMoreButton.appendChild(iconElement);

        this.loadMoreButton.addEventListener('click', () => {
            this.loadMorePlaces();
        });

        this.placesListElement.appendChild(this.loadMoreButton);
    }

    private async loadMorePlaces(): Promise<void> {
        if (!this.currentPlacesCategory || this.isLoadingMorePlaces || !this.hasMorePlaces || !this.callbacks.onLoadMore) {
            return;
        }

        this.isLoadingMorePlaces = true;
        this.updateLoadMoreButtonState(true);

        try {
            const data = await this.callbacks.onLoadMore(
                this.currentPlacesCategory,
                this.currentPlacesOffset,
                this.options.limit
            );

            const newPlaces = data.features || [];
            if (newPlaces.length > 0) {
                this.showPlacesList(newPlaces, this.currentPlacesCategory, true);
            } else {
                this.hasMorePlaces = false;
                this.removeLoadMoreButton();
            }
        } catch (error) {
            console.error('Failed to load more places:', error);
            this.updateLoadMoreButtonState(false);
        } finally {
            this.isLoadingMorePlaces = false;
        }
    }

    private updateLoadMoreButtonState(loading: boolean): void {
        if (!this.loadMoreButton) return;

        const iconElement = this.loadMoreButton.querySelector('span') as HTMLElement;

        if (loading) {
            iconElement.innerHTML = '';
            DomHelper.addSpinnerIcon(iconElement);
            this.loadMoreButton.classList.add('loading');
        } else {
            iconElement.innerHTML = '';
            DomHelper.addIcon(iconElement, 'chevron-down');
            this.loadMoreButton.classList.remove('loading');
        }
    }

    private selectPlaceFromList(place: any, index: number): void {
        if (!this.options.showPlacesList) return;

        // Remove previous selection
        const placeItems = this.placesListElement?.querySelectorAll('.geoapify-autocomplete-item');
        placeItems?.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add selection to clicked item
        const clickedItem = this.placesListElement?.querySelector(`[data-index="${index}"]`);
        clickedItem?.classList.add('active');
        
        // Notify callback
        this.callbacks.onPlaceSelect?.(place, index);
    }
}