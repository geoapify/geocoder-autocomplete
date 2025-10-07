import { DomHelper } from "./dom.helper";
import { GeocoderAutocompleteOptions } from "../autocomplete";

export interface PlacesListCallbacks {
    onPlaceSelect?: (place: GeoJSON.Feature, index: number) => void;
    onLoadMore?: (category: string[], offset: number, limit?: number) => Promise<any>;
    onPlacesUpdate?: (allPlaces: GeoJSON.Feature[]) => void;
}

interface PlaceData {
    name: string;
    address: string | null;
    openingHours: string | null;
}

export class PlacesListManager {
    private container: HTMLElement;
    private options: GeocoderAutocompleteOptions;
    private callbacks: PlacesListCallbacks;

    private placesListElement: HTMLElement = null;
    private titleBar: HTMLElement = null;
    private scrollContainer: HTMLElement = null;
    private statusBar: HTMLElement = null;
    private loadMoreElement: HTMLElement = null;
    
    // Pagination state
    private currentPlacesOffset: number = 0;
    private currentPlacesCategory: string[] = null;
    private currentCategoryLabel: string = null;
    private isLoadingMorePlaces: boolean = false;
    private hasMorePlaces: boolean = true;
    private allPlaces: GeoJSON.Feature[] = [];
    
    // Scroll detection
    private scrollListener: ((event: Event) => void) | null = null;
    
    private selectedPlaceIndex: number | null = null;

    constructor(
        container: HTMLElement, 
        options: GeocoderAutocompleteOptions, 
        callbacks: PlacesListCallbacks = {}
    ) {
        this.container = container;
        this.options = options;
        this.callbacks = callbacks;
    }

    public showPlacesList(places: GeoJSON.Feature[], category: string[], categoryLabel?: string, isLoadMore: boolean = false): void {
        if (!this.options.showPlacesList) return;

        // Create elements if they don't exist
        if (!this.placesListElement) {
            this.createPlacesElements();
        }

        // Handle initial vs load more
        if (!isLoadMore) {
            this.currentPlacesCategory = category;
            this.currentCategoryLabel = categoryLabel ?? category.join(', ');
            this.currentPlacesOffset = 0;
            this.allPlaces = [];
            this.clearPlacesItems();
            this.updateTitleBar(this.currentCategoryLabel);
        }

        if (!places || places.length === 0) {
            this.showEmptyState();
            this.showList(false);
            return;
        }

        // Add new places
        this.allPlaces.push(...places);
        this.renderPlaces(places, isLoadMore);

        // Update pagination
        this.currentPlacesOffset += places.length;
        this.hasMorePlaces = places.length >= (this.options.limit || 5);

        this.updateStatusBar();
        
        this.updateStatusBarState('empty');

        // Setup scroll detection
        if (this.hasMorePlaces) {
            this.setupScrollDetection();
        } else {
            this.updateStatusBarState('end');
        }

        // Show list
        this.showList(isLoadMore);
        
        // Notify callback
        this.callbacks.onPlacesUpdate?.(this.allPlaces);
    }

    public clearPlacesList(): void {
        if (!this.options.showPlacesList) return;

        if (this.scrollContainer) {
            this.scrollContainer.innerHTML = '';
        }
        
        if (this.placesListElement) {
            this.placesListElement.classList.remove('active', 'standalone');
            this.placesListElement.style.display = 'none';
        }
        
        this.removeScrollListener();
        this.resetPaginationState();
    }

    private clearPlacesItems(): void {
        if (this.scrollContainer) {
            this.scrollContainer.innerHTML = '';
        }
    }

    public resetCategory(): void {
        this.currentPlacesCategory = null;
        this.clearPlacesList();
    }

    public selectPlace(index: number): void {
        if (!this.scrollContainer) return;

        this.selectedPlaceIndex = index;
        this.updateStatusBar();

        // Remove previous selection
        const placeItems = this.scrollContainer.querySelectorAll('.geoapify-places-item');
        placeItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add selection to the specified item
        const targetItem = this.scrollContainer.querySelector(`[data-index="${index}"]`);
        if (targetItem) {
            targetItem.classList.add('active');
            // Scroll item into view if needed (if supported)
            if (typeof targetItem.scrollIntoView === 'function') {
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    public clearSelection(): void {
        if (!this.scrollContainer) return;

        this.selectedPlaceIndex = null;
        this.updateStatusBar();

        // Remove selection from all items
        const placeItems = this.scrollContainer.querySelectorAll('.geoapify-places-item');
        placeItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    private createPlacesElements(): void {
        if (!this.options.showPlacesList) return;

        // Main container
        this.placesListElement = document.createElement('div');
        this.placesListElement.className = 'geoapify-places-list';

        // Title bar
        this.titleBar = document.createElement('div');
        this.titleBar.className = 'geoapify-places-title-bar';
        this.placesListElement.appendChild(this.titleBar);

        // Scroll container
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'geoapify-places-scroll-container';
        this.placesListElement.appendChild(this.scrollContainer);

        // Status bar (at the bottom, outside scroll container - currently empty)
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'geoapify-places-status-bar';
        this.placesListElement.appendChild(this.statusBar);

        // Load more element (will be inside scroll container at the end of the list)
        this.loadMoreElement = document.createElement('div');
        this.loadMoreElement.className = 'geoapify-places-load-more';

        this.container.appendChild(this.placesListElement);
    }

    private renderPlaces(places: GeoJSON.Feature[], isLoadMore: boolean): void {
        if (this.loadMoreElement.parentNode === this.scrollContainer) {
            this.loadMoreElement.remove();
        }
        
        const startIndex = isLoadMore ? this.scrollContainer.children.length : 0;
        
        places.forEach((place, index) => {
            const placeElement = this.createPlaceItem(place, startIndex + index);
            this.scrollContainer.appendChild(placeElement);
        });
        
        this.scrollContainer.appendChild(this.loadMoreElement);
    }

    private showList(isLoadMore: boolean): void {
        this.placesListElement.classList.add('active', 'standalone');
        this.placesListElement.style.display = 'block';

        if (!isLoadMore && this.scrollContainer) {
            this.scrollContainer.scrollTop = 0;
        }
    }

    private showEmptyState(): void {
        if (!this.scrollContainer) return;

        this.scrollContainer.innerHTML = '';

        const emptyState = document.createElement('div');
        emptyState.className = 'geoapify-places-empty-state';

        const iconElement = document.createElement('div');
        iconElement.className = 'geoapify-places-empty-icon';
        
        DomHelper.addIcon(iconElement, 'ban');
        
        emptyState.appendChild(iconElement);

        this.scrollContainer.appendChild(emptyState);
    }

    private resetPaginationState(): void {
        this.currentPlacesOffset = 0;
        this.currentPlacesCategory = null;
        this.currentCategoryLabel = null;
        this.hasMorePlaces = true;
        this.isLoadingMorePlaces = false;
        this.allPlaces = [];
        this.selectedPlaceIndex = null;
    }

    private updateTitleBar(categoryLabel: string): void {
        if (!this.titleBar) return;

        this.titleBar.innerHTML = '';
        
        const searchIcon = document.createElement('span');
        searchIcon.className = 'geoapify-places-title-icon';
        DomHelper.addIcon(searchIcon, 'search');
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'geoapify-places-title-label';
        labelSpan.textContent = categoryLabel;
        
        this.titleBar.appendChild(searchIcon);
        this.titleBar.appendChild(labelSpan);
    }

    private updateStatusBar(): void {
        if (!this.statusBar) return;

        this.statusBar.innerHTML = '';

        // Create icon + count on the left
        const countContainer = document.createElement('div');
        countContainer.className = 'geoapify-places-status-count';
        
        const iconElement = document.createElement('span');
        DomHelper.addIcon(iconElement, 'map-marker');
        countContainer.appendChild(iconElement);
        
        const countText = document.createElement('span');
        countText.textContent = this.allPlaces.length.toString();
        countContainer.appendChild(countText);
        
        this.statusBar.appendChild(countContainer);

        // Show selected item index on the right if a place is selected
        if (this.selectedPlaceIndex !== null) {
            const selectedInfo = document.createElement('div');
            selectedInfo.className = 'geoapify-places-status-selected';
            selectedInfo.textContent = `${this.selectedPlaceIndex + 1} / ${this.allPlaces.length}`;
            this.statusBar.appendChild(selectedInfo);
        }
    }

    private updateStatusBarState(state: 'empty' | 'button' | 'loading' | 'end'): void {
        if (!this.loadMoreElement) return;

        this.loadMoreElement.innerHTML = '';
        
        // Hide the element when there are no more results
        if (state === 'end' || state === 'empty') {
            this.loadMoreElement.style.display = 'none';
            this.loadMoreElement.className = 'geoapify-places-load-more';
            return;
        }
        
        // Show the element for button and loading states
        this.loadMoreElement.style.display = '';
        this.loadMoreElement.className = `geoapify-places-load-more ${state}`;

        if (state === 'button') {
            const button = document.createElement('button');
            button.className = 'geoapify-places-load-more-button';
            button.setAttribute('type', 'button');
            button.setAttribute('aria-label', 'Load more places');
            button.addEventListener('click', () => this.loadMorePlaces());
            
            const iconElement = document.createElement('span');
            DomHelper.addIcon(iconElement, 'chevron-down');
            button.appendChild(iconElement);
            
            this.loadMoreElement.appendChild(button);
        } else if (state === 'loading') {
            const dots = document.createElement('span');
            dots.className = 'geoapify-places-load-more-loading';
            dots.textContent = '•••';
            this.loadMoreElement.appendChild(dots);
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
        
        // Container for name and address
        const textContainer = document.createElement('div');
        textContainer.className = 'geoapify-places-text-container';
        
        // Place name
        const nameElement = document.createElement('span');
        nameElement.className = 'geoapify-places-main-part';
        nameElement.textContent = placeData.name;
        textContainer.appendChild(nameElement);
        
        // Address - only if available
        if (placeData.address) {
            const addressElement = document.createElement('span');
            addressElement.className = 'geoapify-places-secondary-part';
            addressElement.textContent = placeData.address;
            textContainer.appendChild(addressElement);
        }
        
        placeElement.appendChild(textContainer);
        
        // Opening hours (text + icon) - only if available
        if (placeData.openingHours) {
            const hoursContainer = document.createElement('span');
            hoursContainer.className = 'geoapify-places-hours-info';
            
            const clockIcon = document.createElement('span');
            clockIcon.className = 'geoapify-places-clock-icon';
            DomHelper.addIcon(clockIcon, 'clock');
            
            const hoursText = document.createElement('span');
            hoursText.className = 'geoapify-places-hours-text';
            hoursText.textContent = placeData.openingHours;
            
            hoursContainer.appendChild(clockIcon);
            hoursContainer.appendChild(hoursText);
            placeElement.appendChild(hoursContainer);
        }
        
        placeElement.addEventListener('click', () => {
            this.selectedPlaceIndex = index;
            this.updateStatusBar();
            this.selectPlaceFromList(place, index);
        });
        
        return placeElement;
    }

    private extractPlaceData(place: GeoJSON.Feature): PlaceData {
        const props = place.properties;
        return {
            name: props.name || 'Unknown Place',
            address: props.address_line2 || props.formatted || null,
            openingHours: props.opening_hours || null
        };
    }

    // ========================================================================
    // LOAD MORE FUNCTIONALITY & SCROLL DETECTION
    // ========================================================================

    private selectPlaceFromList(place: GeoJSON.Feature, index: number): void {
        if (!this.options.showPlacesList) return;

        // Built-in list doesn't track selection - just notify callback
        this.callbacks.onPlaceSelect?.(place, index);
    }

    private async loadMorePlaces(): Promise<void> {
        if (!this.currentPlacesCategory || this.isLoadingMorePlaces || !this.hasMorePlaces || !this.callbacks.onLoadMore) {
            return;
        }

        this.isLoadingMorePlaces = true;
        this.updateStatusBarState('loading');

        try {
            const data = await this.callbacks.onLoadMore(
                this.currentPlacesCategory,
                this.currentPlacesOffset,
                this.options.limit
            );

            const newPlaces = data.features || [];
            if (newPlaces.length > 0) {
                this.showPlacesList(newPlaces, this.currentPlacesCategory, this.currentCategoryLabel, true);
            } else {
                this.hasMorePlaces = false;
                this.updateStatusBarState('end');
            }
        } catch (error) {
            console.error('Failed to load more places:', error);
            // Revert to button state on error
            this.updateStatusBarState('button');
        } finally {
            this.isLoadingMorePlaces = false;
        }
    }

    private setupScrollDetection(): void {
        if (!this.scrollContainer || !this.hasMorePlaces) return;

        // Remove existing listener to avoid duplicates
        this.removeScrollListener();

        // Create and attach new scroll listener
        this.scrollListener = () => this.onScrollHandler();
        this.scrollContainer.addEventListener('scroll', this.scrollListener);
    }

    private removeScrollListener(): void {
        if (this.scrollListener && this.scrollContainer) {
            this.scrollContainer.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
    }

    private onScrollHandler(): void {
        if (!this.scrollContainer || this.isLoadingMorePlaces || !this.hasMorePlaces) return;

        const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isAtBottom = distanceFromBottom <= 10;

        if (isAtBottom) {
            // Auto-load or show button when at bottom
            if (this.options.enablePlacesLazyLoading) {
                this.loadMorePlaces();
            } else {
                this.updateStatusBarState('button');
            }
        } else if (this.statusBar?.classList.contains('button')) {
            // Hide button when scrolling away from bottom
            this.updateStatusBarState('empty');
        }
    }
}