import { DomHelper } from "./dom.helper";
export class PlacesListManager {
    container;
    options;
    callbacks;
    placesListElement = null;
    titleBar = null;
    scrollContainer = null;
    statusBar = null;
    loadMoreElement = null;
    // Pagination state
    currentOffset = 0;
    currentCategory = null;
    currentCategoryLabel = null;
    isLoadingMorePlaces = false;
    hasMorePlaces = true;
    places = [];
    // Scroll detection
    scrollListener = null;
    selectedPlaceIndex = null;
    constructor(container, options, callbacks) {
        this.container = container;
        this.options = options;
        this.callbacks = callbacks;
    }
    setCurrentOffset(offset) {
        this.currentOffset = offset;
    }
    getCurrentOffset() {
        return this.currentOffset;
    }
    setCategory(category, categoryLabel) {
        this.currentCategory = category;
        this.currentCategoryLabel = categoryLabel ?? category.join(', ');
    }
    showPlacesList(placesToRender, isLoadMore = false) {
        if (!this.options.showPlacesList)
            return;
        // Create elements if they don't exist
        if (!this.placesListElement) {
            this.createPlacesElements();
        }
        if (!this.places || this.places.length === 0 /* places contain already pleaseToRender */) {
            this.showEmptyState();
            this.updateStatusBar();
            this.showList(false);
            return;
        }
        // Add new places
        this.renderPlaces(placesToRender, isLoadMore);
        this.updateStatusBar();
        this.updateStatusBarState('empty');
        // Setup scroll detection
        if (this.hasMorePlaces) {
            this.setupScrollDetection();
        }
        else {
            this.updateStatusBarState('end');
        }
        // Show list
        this.showList(isLoadMore);
    }
    filterDuplicatePlaces(newPlaces) {
        const existingPlaceIds = new Set(this.places
            .map(place => place.properties?.place_id)
            .filter(id => id !== undefined));
        return newPlaces.filter(place => {
            const placeId = place.properties?.place_id;
            return !placeId || !existingPlaceIds.has(placeId);
        });
    }
    setPlaces(places, append) {
        this.hasMorePlaces = places.length === this.options.placesLimit;
        if (append) {
            const newPlaces = this.filterDuplicatePlaces(places);
            this.places.push(...newPlaces);
            this.showPlacesList(newPlaces, true);
        }
        else {
            this.selectedPlaceIndex = null;
            this.clearPlacesItems();
            this.places = [];
            this.places.push(...places);
            this.showPlacesList(places);
        }
        this.updateTitleBar(this.currentCategoryLabel);
        // Notify callback
        this.callbacks.onPlacesUpdate?.(this.places);
    }
    /*    public addPlaces(places: GeoJSON.Feature[], currentPlacesOffset: number) {
                
            this.hasMorePlaces = places.length === this.options.placesLimit;
            this.currentPlacesOffset = currentPlacesOffset;
    
            const newPlaces = this.filterDuplicatePlaces(places);
            this.places.push(...newPlaces);
            this.showPlacesList(newPlaces);
    
            // Notify callback
            this.callbacks.onPlacesUpdate?.(this.places);
        }
    
        public setPlaces(places: GeoJSON.Feature[], currentPlacesOffset: number) {
            this.places = [];
            this.selectedPlaceIndex = null;
            this.clearPlacesItems();
            this.updateTitleBar(this.currentCategoryLabel);
            this.places.push(...places);
            this.showPlacesList(places);
    
            this.currentPlacesOffset = currentPlacesOffset;
    
            // Notify callback
            this.callbacks.onPlacesUpdate?.(this.places);
        }
    
    */
    getPlaces() {
        return this.places;
    }
    clearPlacesList() {
        if (!this.options.showPlacesList)
            return;
        if (this.scrollContainer) {
            this.scrollContainer.innerHTML = '';
        }
        if (this.placesListElement) {
            this.placesListElement.classList.remove('active', 'standalone');
        }
        this.removeScrollListener();
        this.resetPaginationState();
    }
    isPlacesListVisible() {
        if (!this.placesListElement)
            return false;
        return this.placesListElement.classList.contains('active');
    }
    clearPlacesItems() {
        if (this.scrollContainer) {
            this.scrollContainer.innerHTML = '';
        }
    }
    resetCategory() {
        this.currentCategory = null;
        this.clearPlacesList();
    }
    selectPlace(index) {
        if (!this.scrollContainer)
            return;
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
    clearSelection() {
        if (!this.scrollContainer)
            return;
        this.selectedPlaceIndex = null;
        this.updateStatusBar();
        // Remove selection from all items
        const placeItems = this.scrollContainer.querySelectorAll('.geoapify-places-item');
        placeItems.forEach(item => {
            item.classList.remove('active');
        });
    }
    createPlacesElements() {
        if (!this.options.showPlacesList)
            return;
        // Main container
        this.placesListElement = document.createElement('div');
        this.placesListElement.className = 'geoapify-places-list';
        // Title bar
        /*this.titleBar = document.createElement('div');
        this.titleBar.className = 'geoapify-places-title-bar';
        this.placesListElement.appendChild(this.titleBar);*/
        // Scroll container
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'geoapify-places-scroll-container';
        this.placesListElement.appendChild(this.scrollContainer);
        // Status bar (at the bottom, outside scroll container - currently empty)
        /*this.statusBar = document.createElement('div');
        this.statusBar.className = 'geoapify-places-status-bar';
        this.placesListElement.appendChild(this.statusBar);*/
        // Load more element (will be inside scroll container at the end of the list)
        this.loadMoreElement = document.createElement('div');
        this.loadMoreElement.className = 'geoapify-places-load-more';
        this.container.appendChild(this.placesListElement);
    }
    renderPlaces(places, isLoadMore) {
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
    showList(isLoadMore) {
        this.placesListElement.classList.add('active', 'standalone');
        if (!isLoadMore && this.scrollContainer) {
            this.scrollContainer.scrollTop = 0;
        }
    }
    showEmptyState() {
        if (!this.scrollContainer)
            return;
        this.scrollContainer.innerHTML = '';
        const emptyState = document.createElement('div');
        emptyState.className = 'geoapify-places-empty-state';
        const iconElement = document.createElement('div');
        iconElement.className = 'geoapify-places-empty-icon';
        DomHelper.addIcon(iconElement, 'ban');
        emptyState.appendChild(iconElement);
        this.scrollContainer.appendChild(emptyState);
    }
    resetPaginationState() {
        this.currentOffset = 0;
        this.currentCategory = null;
        this.currentCategoryLabel = null;
        this.hasMorePlaces = true;
        this.isLoadingMorePlaces = false;
        this.places = [];
        this.selectedPlaceIndex = null;
    }
    updateTitleBar(categoryLabel) {
        if (!this.titleBar)
            return;
        this.titleBar.innerHTML = '';
        const filterIcon = document.createElement('span');
        filterIcon.className = 'geoapify-places-title-icon';
        //DomHelper.addIcon(filterIcon, 'filter');
        const labelSpan = document.createElement('span');
        labelSpan.className = 'geoapify-places-title-label';
        labelSpan.textContent = categoryLabel;
        this.titleBar.appendChild(filterIcon);
        this.titleBar.appendChild(labelSpan);
    }
    updateStatusBar() {
        if (!this.statusBar)
            return;
        this.statusBar.innerHTML = '';
        // Create icon + count on the left
        const countContainer = document.createElement('div');
        countContainer.className = 'geoapify-places-status-count';
        const iconElement = document.createElement('span');
        DomHelper.addIcon(iconElement, 'map-marker');
        countContainer.appendChild(iconElement);
        const countText = document.createElement('span');
        countText.textContent = this.places.length.toString();
        countContainer.appendChild(countText);
        this.statusBar.appendChild(countContainer);
        // Show selected item index on the right if a place is selected
        if (this.selectedPlaceIndex !== null) {
            const selectedInfo = document.createElement('div');
            selectedInfo.className = 'geoapify-places-status-selected';
            selectedInfo.textContent = `${this.selectedPlaceIndex + 1} / ${this.places.length}`;
            this.statusBar.appendChild(selectedInfo);
        }
    }
    updateStatusBarState(state) {
        if (!this.loadMoreElement)
            return;
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
        }
        else if (state === 'loading') {
            const dots = document.createElement('span');
            dots.className = 'geoapify-places-load-more-loading';
            dots.textContent = '•••';
            this.loadMoreElement.appendChild(dots);
        }
    }
    // ========================================================================
    // PLACE ITEM CREATION
    // ========================================================================
    createPlaceItem(place, index) {
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
            hoursText.title = placeData.openingHours;
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
    extractPlaceData(place) {
        const props = place.properties;
        return {
            name: props.name || '---',
            address: props.address_line2 || props.formatted || null,
            openingHours: props.opening_hours || null
        };
    }
    // ========================================================================
    // LOAD MORE FUNCTIONALITY & SCROLL DETECTION
    // ========================================================================
    selectPlaceFromList(place, index) {
        if (!this.options.showPlacesList)
            return;
        // Built-in list doesn't track selection - just notify callback
        this.callbacks.onPlaceSelect?.(place, index);
    }
    async loadMorePlaces() {
        if (!this.currentCategory || this.isLoadingMorePlaces || !this.hasMorePlaces || !this.callbacks.onLoadMore) {
            return;
        }
        this.isLoadingMorePlaces = true;
        this.updateStatusBarState('loading');
        try {
            await this.callbacks.onLoadMore(this.currentOffset);
            this.updateStatusBarState('end');
        }
        catch (error) {
            console.error('Failed to load more places:', error);
            // Revert to button state on error
            this.updateStatusBarState('button');
        }
        finally {
            this.isLoadingMorePlaces = false;
        }
    }
    setupScrollDetection() {
        if (!this.scrollContainer || !this.hasMorePlaces)
            return;
        // Remove existing listener to avoid duplicates
        this.removeScrollListener();
        // Create and attach new scroll listener
        this.scrollListener = () => this.onScrollHandler();
        this.scrollContainer.addEventListener('scroll', this.scrollListener);
    }
    removeScrollListener() {
        if (this.scrollListener && this.scrollContainer) {
            this.scrollContainer.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
    }
    onScrollHandler() {
        if (!this.scrollContainer || this.isLoadingMorePlaces || !this.hasMorePlaces)
            return;
        const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isAtBottom = distanceFromBottom <= 10;
        if (isAtBottom) {
            // Auto-load or show button when at bottom
            if (this.options.enablePlacesLazyLoading) {
                this.loadMorePlaces();
            }
            else {
                this.updateStatusBarState('button');
            }
        }
        else if (this.statusBar?.classList.contains('button')) {
            // Hide button when scrolling away from bottom
            this.updateStatusBarState('empty');
        }
    }
}
