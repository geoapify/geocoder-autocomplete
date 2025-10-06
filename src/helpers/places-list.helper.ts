import { DomHelper } from "./dom.helper";
import { GeocoderAutocompleteOptions } from "../autocomplete";

export interface PlacesListCallbacks {
    onPlaceSelect?: (place: GeoJSON.Feature, index: number) => void;
    onLoadMore?: (category: string, offset: number, limit?: number) => Promise<any>;
    onPlacesUpdate?: (allPlaces: GeoJSON.Feature[]) => void;
}

interface PlaceData {
    name: string;
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
    
    // Pagination state
    private currentPlacesOffset: number = 0;
    private currentPlacesCategory: string = null;
    private currentCategoryLabel: string = null;
    private isLoadingMorePlaces: boolean = false;
    private hasMorePlaces: boolean = true;
    private allPlaces: GeoJSON.Feature[] = [];
    
    // Scroll detection
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

    public showPlacesList(places: GeoJSON.Feature[], category: string, categoryLabel?: string, isLoadMore: boolean = false): void {
        if (!this.options.showPlacesList || !places?.length) return;

        // Create elements if they don't exist
        if (!this.placesListElement) {
            this.createPlacesElements();
        }

        // Handle initial vs load more
        if (!isLoadMore) {
            this.currentPlacesCategory = category;
            this.currentCategoryLabel = categoryLabel || category;
            this.currentPlacesOffset = 0;
            this.allPlaces = [];
            this.clearPlacesItems();
            this.updateTitleBar(this.currentCategoryLabel);
        }

        // Add new places
        this.allPlaces.push(...places);
        this.renderPlaces(places, isLoadMore);

        // Update pagination
        this.currentPlacesOffset += places.length;
        this.hasMorePlaces = places.length >= (this.options.limit || 5);

        // Update status bar
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

        // Status bar
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'geoapify-places-status-bar';
        this.placesListElement.appendChild(this.statusBar);

        this.container.appendChild(this.placesListElement);
    }

    private renderPlaces(places: GeoJSON.Feature[], isLoadMore: boolean): void {
        const startIndex = isLoadMore ? this.scrollContainer.children.length : 0;
        
        places.forEach((place, index) => {
            const placeElement = this.createPlaceItem(place, startIndex + index);
            this.scrollContainer.appendChild(placeElement);
        });
    }

    private showList(isLoadMore: boolean): void {
        this.placesListElement.classList.add('active', 'standalone');
        this.placesListElement.style.display = 'block';

        if (!isLoadMore && this.scrollContainer) {
            this.scrollContainer.scrollTop = 0;
        }
    }

    private resetPaginationState(): void {
        this.currentPlacesOffset = 0;
        this.currentPlacesCategory = null;
        this.currentCategoryLabel = null;
        this.hasMorePlaces = true;
        this.isLoadingMorePlaces = false;
        this.allPlaces = [];
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

    private updateStatusBarState(state: 'empty' | 'button' | 'loading' | 'end'): void {
        if (!this.statusBar) return;

        this.statusBar.innerHTML = '';
        this.statusBar.className = state === 'empty' 
            ? 'geoapify-places-status-bar' 
            : `geoapify-places-status-bar ${state}`;

        if (state === 'button') {
            const button = document.createElement('button');
            button.className = 'geoapify-places-status-bar-button';
            button.setAttribute('type', 'button');
            button.setAttribute('aria-label', 'Load more places');
            button.addEventListener('click', () => this.loadMorePlaces());
            
            const iconElement = document.createElement('span');
            DomHelper.addIcon(iconElement, 'chevron-down');
            button.appendChild(iconElement);
            
            this.statusBar.appendChild(button);
        } else if (state === 'loading') {
            const dots = document.createElement('span');
            dots.className = 'geoapify-places-status-bar-loading';
            dots.textContent = '•••';
            this.statusBar.appendChild(dots);
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
        
        // Place name
        const nameElement = document.createElement('span');
        nameElement.className = 'geoapify-places-main-part';
        nameElement.textContent = placeData.name;
        placeElement.appendChild(nameElement);
        
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
            this.selectPlaceFromList(place, index);
        });
        
        return placeElement;
    }

    private extractPlaceData(place: GeoJSON.Feature): PlaceData {
        const props = place.properties;
        return {
            name: props.name || 'Unknown Place',
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