import { DomHelper } from "./dom.helper";
import { GeocoderAutocompleteOptions } from "../autocomplete";

export interface PlacesListCallbacks {
    onPlaceSelect?: (place: GeoJSON.Feature, index: number) => void;
    onLoadMore?: (category: string, offset: number, limit?: number) => Promise<any>;
    onPlacesUpdate?: (allPlaces: GeoJSON.Feature[]) => void;
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
    private lazyLoadingIndicator: HTMLElement = null;
    
    // Pagination state
    private currentPlacesOffset: number = 0;
    private currentPlacesCategory: string = null;
    private isLoadingMorePlaces: boolean = false;
    private hasMorePlaces: boolean = true;
    private allPlaces: GeoJSON.Feature[] = [];
    
    // Lazy loading
    private scrollListener: ((event: Event) => void) | null = null;

    constructor(
        container: HTMLElement, 
        options: GeocoderAutocompleteOptions, 
        callbacks: PlacesListCallbacks = {}
    ) {
        this.container = container;
        this.options = options;
        this.callbacks = callbacks;
    }

    public showPlacesList(places: GeoJSON.Feature[], category: string, isLoadMore: boolean = false): void {
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

        // Add load more button or setup lazy loading
        if (this.hasMorePlaces) {
            if (this.options.enablePlacesLazyLoading) {
                this.setupLazyLoading();
            } else {
                this.createLoadMoreButton();
            }
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
        
        this.removeLazyLoadingListener();
        this.resetPaginationState();
    }

    public resetCategory(): void {
        this.currentPlacesCategory = null;
        this.clearPlacesList();
    }

    public selectPlace(index: number): void {
        if (!this.placesListElement) return;

        // Remove previous selection
        const placeItems = this.placesListElement.querySelectorAll('.geoapify-places-item');
        placeItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add selection to the specified item
        const targetItem = this.placesListElement.querySelector(`[data-index="${index}"]`);
        if (targetItem) {
            targetItem.classList.add('active');
            // Scroll item into view if needed (if supported)
            if (typeof targetItem.scrollIntoView === 'function') {
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    public clearSelection(): void {
        if (!this.placesListElement) return;

        // Remove selection from all items
        const placeItems = this.placesListElement.querySelectorAll('.geoapify-places-item');
        placeItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    private createPlacesElements(): void {
        if (!this.options.showPlacesList) return;

        this.placesListElement = document.createElement('div');
        this.placesListElement.className = 'geoapify-places-list';

        this.container.appendChild(this.placesListElement);
    }

    private renderPlaces(places: GeoJSON.Feature[], isLoadMore: boolean): void {
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

    private createPlaceItem(place: GeoJSON.Feature, index: number): HTMLElement {
        const placeElement = document.createElement('div');
        placeElement.className = 'geoapify-places-item';
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

    private extractPlaceData(place: GeoJSON.Feature): PlaceData {
        const props = place.properties;
        return {
            name: props.name || 'Unknown Place',
            address: props.formatted || props.address_line2 || '',
            openingHours: props.opening_hours || null
        };
    }

    private createAddressContainer(): HTMLElement {
        const container = document.createElement('span');
        container.className = 'geoapify-places-address-container';
        return container;
    }

    private createNameElement(name: string): HTMLElement {
        const nameElement = document.createElement('span');
        nameElement.className = 'geoapify-places-main-part';
        nameElement.textContent = name;
        return nameElement;
    }

    private createDetailsElement(placeData: PlaceData): HTMLElement {
        const detailsElement = document.createElement('span');
        detailsElement.className = 'geoapify-places-details';
        
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
                this.hideLazyLoadingIndicator();
            }
        } catch (error) {
            console.error('Failed to load more places:', error);
            this.updateLoadMoreButtonState(false);
            this.hideLazyLoadingIndicator();
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

    private selectPlaceFromList(place: GeoJSON.Feature, index: number): void {
        if (!this.options.showPlacesList) return;

        // Built-in list doesn't track selection - just notify callback
        this.callbacks.onPlaceSelect?.(place, index);
    }

    private setupLazyLoading(): void {
        if (!this.placesListElement || !this.options.enablePlacesLazyLoading) return;

        // Remove existing listener to avoid duplicates
        this.removeLazyLoadingListener();

        // Create and attach new scroll listener
        this.scrollListener = (event: Event) => this.onScrollHandler(event);
        this.placesListElement.addEventListener('scroll', this.scrollListener);
        
        // Create loading indicator
        this.createLazyLoadingIndicator();
    }

    private removeLazyLoadingListener(): void {
        if (this.scrollListener && this.placesListElement) {
            this.placesListElement.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
        this.removeLazyLoadingIndicator();
    }

    private onScrollHandler(event: Event): void {
        if (!this.placesListElement || this.isLoadingMorePlaces || !this.hasMorePlaces) {
            return;
        }

        const element = this.placesListElement;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;

        // Calculate distance from bottom (threshold: 100px from bottom)
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const threshold = 100;

        // Trigger load more when user is close to the bottom
        if (distanceFromBottom < threshold) {
            this.showLazyLoadingIndicator();
            this.loadMorePlaces();
         }
    }

    private createLazyLoadingIndicator(): void {
        if (!this.placesListElement || this.lazyLoadingIndicator) return;

        this.lazyLoadingIndicator = document.createElement('div');
        this.lazyLoadingIndicator.className = 'geoapify-places-lazy-loading';
        this.lazyLoadingIndicator.style.display = 'none';

        const spinnerElement = document.createElement('span');
        spinnerElement.className = 'geoapify-places-lazy-loading-spinner';
        DomHelper.addSpinnerIcon(spinnerElement);

        this.lazyLoadingIndicator.appendChild(spinnerElement);
        this.placesListElement.appendChild(this.lazyLoadingIndicator);
    }

    private showLazyLoadingIndicator(): void {
        if (this.lazyLoadingIndicator) {
            this.lazyLoadingIndicator.style.display = 'flex';
        }
    }

    private hideLazyLoadingIndicator(): void {
        if (this.lazyLoadingIndicator) {
            this.lazyLoadingIndicator.style.display = 'none';
        }
    }

    private removeLazyLoadingIndicator(): void {
        if (this.lazyLoadingIndicator) {
            this.lazyLoadingIndicator.remove();
            this.lazyLoadingIndicator = null;
        }
    }
}