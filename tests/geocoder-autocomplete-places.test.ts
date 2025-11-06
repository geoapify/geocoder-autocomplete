import '@testing-library/jest-dom';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from "../src";
import { Category } from "../src/types/external";
import fetchMock from 'jest-fetch-mock';
import {
    addPlacesSpy,
    addPlacesRequestStartSpy,
    addPlacesRequestEndSpy,
    addPlaceSelectSpy,
    addClearSpy,
    getCategoryDropdownItem,
    selectCategoryDropdownItem,
    getPlacesListItems,
    selectPlaceFromList,
    getLoadMoreButton,
    scrollPlacesToBottom,
    clickLoadMoreButton,
    expectPlacesListVisible,
    expectPlacesListHidden,
    expectCategoryInDropdown,
    mockIpInfo,
    mockPlacesApi,
    inputText,
    inputTextWithEvent,
    expectDropdownIsClosed,
    wait,
    WAIT_TIME,
    reset
} from "./test-helper";
import {
    mockGeocoderResponseWithCategories,
    mockPlacesApiResponse,
    mockPlacesApiResponsePage2,
    mockPlacesApiEmpty,
    mockGeocoderResponseEmpty,
    mockIpInfoResponse
} from "./test-data";

fetchMock.enableMocks();

const PLACES_API_URL = "https://api.geoapify.com/v2/places";

describe('Category Search and Places List', () => {
    let container: HTMLDivElement;
    let autocomplete: GeocoderAutocomplete;

    const optionsWithCategorySearch: GeocoderAutocompleteOptions = {
        skipIcons: true,
        addCategorySearch: true,
        placeholder: "Search location or category",
        placesLimit: 8
    };

    const optionsWithPlacesList: GeocoderAutocompleteOptions = {
        skipIcons: true,
        addCategorySearch: true,
        showPlacesList: true,
        placeholder: "Search location or category",
        placesLimit: 8
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        fetchMock.resetMocks();
    });

    afterEach(() => {
        if (autocomplete) {
            reset(autocomplete);
        }
        document.body.removeChild(container);
    });

    // ========================================================================
    // 1. CATEGORY SELECTION & PLACES REQUEST TESTS
    // ========================================================================

    describe('Category Selection', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should set category properly using selectCategory()', async () => {
            const category: Category = { keys: ['catering.cafe'], label: 'Cafes' };

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory(category);
            await wait(WAIT_TIME);

            expect(autocomplete.getCategory()).toEqual(expect.objectContaining({
                keys: ['catering.cafe'],
                label: 'Cafes'
            }));
            expect(autocomplete.getValue()).toBe('Cafes');
        });

        it('should set category using string', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            const category = autocomplete.getCategory();
            expect(category).toEqual(expect.objectContaining({
                keys: ['catering.cafe'],
                label: 'catering.cafe'
            }));
        });

        it('should get category using getCategory()', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            const category = autocomplete.getCategory();
            expect(category).toBeTruthy();
            expect(category?.keys).toStrictEqual(['catering.cafe']);
        });

        it('should set category using array of strings', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            const categories = ['catering.fast_food.pizza', 'catering.restaurant.pizza'];
            autocomplete.selectCategory(categories);

            await wait(WAIT_TIME);

            const category = autocomplete.getCategory();
            expect(category).toBeTruthy();
            expect(category?.keys).toStrictEqual(categories);
            expect(category?.label).toBe('catering.fast_food.pizza, catering.restaurant.pizza');
        });

        it('should send multiple categories to API as comma-separated string', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            const categories = ['catering.fast_food.pizza', 'catering.restaurant.pizza'];
            autocomplete.selectCategory(categories);

            await wait(WAIT_TIME);

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`${PLACES_API_URL}?categories=catering.fast_food.pizza,catering.restaurant.pizza&apiKey=XXXXX`)
            );
        });

        it('should clear category using selectCategory(null)', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            autocomplete.selectCategory(null);

            expect(autocomplete.getCategory()).toBeNull();
        });

        it('should send places request when category is selected', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`${PLACES_API_URL}?categories=catering.cafe&apiKey=XXXXX&limit=8`)
            );

            // Safely get the last call args
            const [places] = placesSpy.mock.lastCall!; // or: placesSpy.mock.calls.at(-1)!
            expect(Array.isArray(places)).toBe(true);

            // Example checks on content (not strict object identity)
            expect(places).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        properties: expect.objectContaining({
                            place_id: expect.any(String),
                        }),
                    }),
                ])
            );

            // Or just length / simple fields
            expect(places).toHaveLength(mockPlacesApiResponse.features.length);
            expect(places.map((p : any) => p.properties.name ?? p.properties.formatted))
                .toEqual(expect.any(Array));
        });

        it('should trigger places_request_start callback with category', async () => {
            const placesRequestStartSpy = addPlacesRequestStartSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            expect(placesRequestStartSpy).toHaveBeenCalledWith(expect.objectContaining({
                keys: ['catering.cafe'],
                label: 'catering.cafe'
            }));
        });

        it('should trigger places_request_end callback with success and data', async () => {
            const placesRequestEndSpy = addPlacesRequestEndSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            expect(placesRequestEndSpy).toHaveBeenCalledWith(true, mockPlacesApiResponse, undefined);
        });

        it('should trigger places callback with places array', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(1);
            expect(placesSpy).toHaveBeenCalledWith(mockPlacesApiResponse.features);
        });

        it('should handle failed places API requests properly', async () => {
            const placesRequestEndSpy = addPlacesRequestEndSpy(autocomplete);

            const errorResponse = {
                statusCode: 401,
                error: "Unauthorized",
                message: "Invalid apiKey"
            };

            mockIpInfo(mockIpInfoResponse);
            fetchMock.mockResponseOnce(
                JSON.stringify(errorResponse),
                { status: 401, statusText: 'Unauthorized' }
            );

            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(placesRequestEndSpy).toHaveBeenCalledWith(false, null, expect.any(Object));
        });

        it('should return null when category search is disabled', () => {
            const autocompleteNoCategory = new GeocoderAutocomplete(
                container,
                "XXXXX",
                { skipIcons: true }
            );

            expect(autocompleteNoCategory.getCategory()).toBeNull();
        });
    });

    // ========================================================================
    // 2. CATEGORIES FROM GEOCODER RESPONSE
    // ========================================================================

    describe('Categories from Geocoder Response', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should extract categories from geocoder response when available', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));

            inputText(container, 'caf');
            await wait(WAIT_TIME);

            const dropdown = container.querySelector('.geoapify-autocomplete-items');
            expect(dropdown).toBeTruthy();
        });

        it('should display category suggestions in dropdown', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));

            inputText(container, 'caf');
            await wait(WAIT_TIME);

            expectCategoryInDropdown(container, 2); // Should have 2 categories
        });

        it('should render categories before address results', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));

            inputText(container, 'caf');
            await wait(WAIT_TIME);

            const dropdown = container.querySelector('.geoapify-autocomplete-items');
            const allItems = dropdown?.querySelectorAll('.geoapify-autocomplete-item, .geoapify-category-item');
            const firstItem = allItems?.[0];
            const secondItem = allItems?.[1];

            // First two items should be categories
            expect(firstItem).toHaveClass('geoapify-category-item');
            expect(secondItem).toHaveClass('geoapify-category-item');
        });

        it('should allow selecting a category from dropdown', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));
            inputText(container, 'caf');
            await wait(WAIT_TIME);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            selectCategoryDropdownItem(container, 0);
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalled();
            expect(autocomplete.getCategory()).toBeTruthy();
        });

        it('should display category labels correctly', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));

            inputText(container, 'caf');
            await wait(WAIT_TIME);

            const categoryItem = getCategoryDropdownItem(container, 0);
            const labelElement = categoryItem?.querySelector('.main-part');

            expect(labelElement?.textContent).toBe('Food & Dining Places');
        });

        it('should navigate dropdown with arrow down key and populate input with category', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));

            inputText(container, 'caf');
            await wait(WAIT_TIME);

            // Verify dropdown is open with categories
            const dropdown = container.querySelector('.geoapify-autocomplete-items');
            expect(dropdown).toBeTruthy();
            expectCategoryInDropdown(container, 2);

            // Press arrow down to select first item (first category)
            inputTextWithEvent(container, 'caf', 'ArrowDown');

            // Check that the first category label is populated in the input
            const inputElement = container.querySelector('input') as HTMLInputElement;
            expect(inputElement.value).toBe('Food & Dining Places');
        });

        it('should close dropdown and trigger places request when Enter is pressed on category', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));
            inputText(container, 'caf');
            await wait(WAIT_TIME);

            // Verify dropdown is open
            let dropdown = container.querySelector('.geoapify-autocomplete-items');
            expect(dropdown).toBeTruthy();

            // Press arrow down to navigate to first category
            inputTextWithEvent(container, 'caf', 'ArrowDown');

            // Mock IP info and places API for when category is selected
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            // Press Enter to select the category
            inputTextWithEvent(container, 'Food & Dining Places', 'Enter');
            await wait(WAIT_TIME);

            // Dropdown should be closed
            dropdown = container.querySelector('.geoapify-autocomplete-items');
            expect(dropdown).toBeNull();

            // Category should be set and places request should be triggered
            expect(autocomplete.getCategory()).toBeTruthy();
            expect(placesSpy).toHaveBeenCalledWith(mockPlacesApiResponse.features);
        });
    });

    // ========================================================================
    // 3. PLACES LIST DISPLAY TESTS
    // ========================================================================

    describe('Places List Display', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithPlacesList);
        });

        it('should display places list in the DOM', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            expectPlacesListVisible(container);
        });

        it('should render multiple place items', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            const placeItems = getPlacesListItems(container);
            expect(placeItems?.length).toBe(8); // 8 cafes in mock data
        });

        it('should display place names and details', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            const placeItems = getPlacesListItems(container);
            const firstPlace = placeItems?.[0];

            const nameElement = firstPlace?.querySelector('.geoapify-places-main-part');
            expect(nameElement?.textContent).toBe('Marlette');

            // Check that hours info is displayed
            const hoursInfo = firstPlace?.querySelector('.geoapify-places-hours-info');
            expect(hoursInfo).toBeTruthy();
        });

        it('should show opening hours if available', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            const placeItems = getPlacesListItems(container);
            const firstPlace = placeItems?.[0]; // Marlette has opening_hours

            const hoursElement = firstPlace?.querySelector('.geoapify-places-hours-text');
            expect(hoursElement?.textContent).toBe('Mo-Su 11:30-19:30');
        });


        it('should not display places list when showPlacesList is false', async () => {
            const autocompleteNoList = new GeocoderAutocomplete(
                container,
                "XXXXX",
                optionsWithCategorySearch
            );

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocompleteNoList.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expectPlacesListHidden(container);
        });
    });

    // ========================================================================
    // 4. PAGINATION TESTS (LOAD MORE)
    // ========================================================================

    describe('Pagination - Load More', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithPlacesList);
        });

        it('should display "Load More" button when scrolled to bottom', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');

            await wait(WAIT_TIME);

            // Scroll to bottom to trigger button
            scrollPlacesToBottom(container);

            const loadMoreButton = getLoadMoreButton(container);
            expect(loadMoreButton).toBeTruthy();
            expect(loadMoreButton).toHaveClass('geoapify-places-load-more-button');
        });

        it('should load more places when button is clicked', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            const initialItems = getPlacesListItems(container);
            expect(initialItems?.length).toBe(8);

            // Mock second page - use page 2 with different places
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponsePage2);
            clickLoadMoreButton(container);
            await wait(WAIT_TIME);

            const updatedItems = getPlacesListItems(container);
            expect(updatedItems?.length).toBe(16); // 8 + 8
        });

        it('should update offset correctly', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponsePage2);
            clickLoadMoreButton(container);
            await wait(WAIT_TIME);

            expect(fetchMock).toHaveBeenLastCalledWith(
                expect.stringContaining('offset=8')
            );
        });

        it('should hide "Load More" button when no more places available', async () => {
            // Mock response with fewer items than limit
            const smallResponse = {
                type: "FeatureCollection",
                features: mockPlacesApiResponse.features.slice(0, 3) // Only 3 items
            };

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(smallResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            const loadMoreButton = getLoadMoreButton(container);
            expect(loadMoreButton).toBeFalsy();
        });

        it('should append new places to existing list', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            const firstPlaceInitial = getPlacesListItems(container)?.[0];
            const firstPlaceName = firstPlaceInitial?.querySelector('.geoapify-places-main-part')?.textContent;

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponsePage2);
            clickLoadMoreButton(container);
            await wait(WAIT_TIME);

            const firstPlaceAfter = getPlacesListItems(container)?.[0];
            const firstPlaceNameAfter = firstPlaceAfter?.querySelector('.geoapify-places-main-part')?.textContent;

            // First place should remain the same
            expect(firstPlaceNameAfter).toBe(firstPlaceName);
        });
    });

    // ========================================================================
    // 5. PLACE SELECTION TESTS
    // ========================================================================

    describe('Place Selection', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithPlacesList);
        });

        it('should trigger place_select callback when place is clicked', async () => {
            const placeSelectSpy = addPlaceSelectSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            selectPlaceFromList(container, 0);

            expect(placeSelectSpy).toHaveBeenCalledTimes(1);
            expect(placeSelectSpy).toHaveBeenCalledWith(
                mockPlacesApiResponse.features[0],
                0
            );
        });

        it('should pass correct place data and index', async () => {
            const placeSelectSpy = addPlaceSelectSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            selectPlaceFromList(container, 2); // Select third place

            expect(placeSelectSpy).toHaveBeenCalledWith(
                mockPlacesApiResponse.features[2],
                2
            );
        });

        it('should hide places list after selection if hidePlacesListAfterSelect is true', async () => {
            const autocompleteWithHide = new GeocoderAutocomplete(
                container,
                "XXXXX",
                { ...optionsWithPlacesList, hidePlacesListAfterSelect: true }
            );

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocompleteWithHide.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expectPlacesListVisible(container);

            selectPlaceFromList(container, 0);

            const placeItems = getPlacesListItems(container);
            expect(placeItems?.length).toBe(0);
        });

        it('should keep places list visible if hidePlacesListAfterSelect is false', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            selectPlaceFromList(container, 0);

            expectPlacesListVisible(container);
        });
    });

    // ========================================================================
    // 6. CLEAR EVENT TESTS
    // ========================================================================

    describe('Clear Event', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should trigger clear callback with "category" type when category is cleared', async () => {
            const clearSpy = addClearSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            autocomplete.selectCategory(null);

            expect(clearSpy).toHaveBeenCalledWith('category');
        });

        it('should clear places list when clear button is clicked', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            const clearButton = container.querySelector('.geoapify-close-button') as HTMLElement;
            clearButton.click();
            await wait(WAIT_TIME);

            expect(autocomplete.getValue()).toBe('');
        });

        it('should notify "category" when user types and category was active', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            const clearSpy = addClearSpy(autocomplete);

            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseEmpty));
            inputText(container, 'new search');
            await wait(WAIT_TIME);

            expect(clearSpy).toHaveBeenCalledWith('category');
        });

        it('should NOT send duplicate clear events when clearing category via clear button', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);

            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            const clearSpy = addClearSpy(autocomplete);

            const clearButton = container.querySelector('.geoapify-close-button') as HTMLElement;
            clearButton.click();
            await wait(WAIT_TIME);

            // Should only be called once with 'category'
            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(clearSpy).toHaveBeenCalledWith('category');
        });

        it('should notify "place" when clearing without category active', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseEmpty));
            inputText(container, 'some text');
            await wait(WAIT_TIME);

            const clearSpy = addClearSpy(autocomplete);

            const clearButton = container.querySelector('.geoapify-close-button') as HTMLElement;
            clearButton.click();
            await wait(WAIT_TIME);

            expect(clearSpy).toHaveBeenCalledWith('address');
        });
    });

    // ========================================================================
    // 7. ESC KEY FUNCTIONALITY TESTS
    // ========================================================================

    describe('ESC Key Functionality', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should close dropdown when ESC is pressed once', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));
            inputText(container, 'caf');
            await wait(WAIT_TIME);

            // Dropdown should be open
            const dropdown = container.querySelector('.geoapify-autocomplete-items');
            expect(dropdown).toBeTruthy();

            // Press ESC
            inputTextWithEvent(container, 'caf', 'Escape');

            // Dropdown should be closed
            expectDropdownIsClosed(container);
            expect(autocomplete.getValue()).toBe('caf');
        });

        it('should clear category on double ESC press (within threshold)', async () => {
            const clearSpy = addClearSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            const category: Category = { keys: ['catering.cafe'], label: 'Cafes' };
            autocomplete.selectCategory(category);
            await wait(WAIT_TIME);

            expect(autocomplete.getCategory()).toBeTruthy();
            expect(autocomplete.getValue()).toBe('Cafes');

            // First ESC (no dropdown to close in this case)
            inputTextWithEvent(container, 'Cafes', 'Escape');

            // Second ESC within threshold (500ms)
            inputTextWithEvent(container, 'Cafes', 'Escape');

            expect(autocomplete.getCategory()).toBeNull();
            expect(autocomplete.getValue()).toBe('');
            expect(clearSpy).toHaveBeenCalledWith('category');
        });

        it('should not clear category on single ESC when dropdown is closed', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            const category: Category = { keys: ['catering.cafe'], label: 'Cafes' };
            autocomplete.selectCategory(category);
            await wait(WAIT_TIME);

            expect(autocomplete.getCategory()).toBeTruthy();

            // Single ESC
            inputTextWithEvent(container, 'Cafes', 'Escape');

            // Category should still be set
            expect(autocomplete.getCategory()).toBeTruthy();
            expect(autocomplete.getValue()).toBe('Cafes');
        });

        it('should close dropdown first then clear category on second ESC', async () => {
            // Open dropdown with geocoder search
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseWithCategories));
            inputText(container, 'caf');
            await wait(WAIT_TIME);

            // Verify dropdown is open
            const dropdown = container.querySelector('.geoapify-autocomplete-items');
            expect(dropdown).toBeTruthy();

            // First ESC - close dropdown
            inputTextWithEvent(container, 'caf', 'Escape');
            expectDropdownIsClosed(container);

            // Second ESC within threshold - should NOT clear anything (no category is set)
            inputTextWithEvent(container, 'caf', 'Escape');

            // Value should remain
            expect(autocomplete.getValue()).toBe('caf');
        });
    });

    // ========================================================================
    // 8. INTEGRATION WITH EXISTING GEOCODING
    // ========================================================================

    describe('Integration with Existing Geocoding', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithPlacesList);
        });

        it('should clear category mode when user types in input', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(autocomplete.getCategory()).toBeTruthy();

            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseEmpty));
            inputText(container, 'test address');
            await wait(WAIT_TIME);

            expect(autocomplete.getCategory()).toBeNull();
        });

        it('should reset places list when switching back to geocoding mode', async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expectPlacesListVisible(container);

            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseEmpty));
            inputText(container, 'test');
            await wait(WAIT_TIME);

            const placeItems = getPlacesListItems(container);
            expect(placeItems?.length).toBe(0);
        });
    });

    // ========================================================================
    // 9. CUSTOM REQUEST FUNCTION TESTS
    // ========================================================================

    describe('Custom Request Function', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should allow custom places request function via setSendPlacesRequestFunc()', async () => {
            const placesSpy = addPlacesSpy(autocomplete);
            const customResponse = {
                type: "FeatureCollection",
                features: [{ properties: { name: 'Custom Cafe' } }]
            };

            autocomplete.setSendPlacesRequestFunc(() => {
                return Promise.resolve(customResponse);
            });

            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(fetchMock).not.toHaveBeenCalled();
            expect(placesSpy).toHaveBeenCalledWith(customResponse.features);
        });

        it('should use custom function instead of API when set', async () => {
            const customFunc = jest.fn().mockResolvedValue(mockPlacesApiResponse);

            autocomplete.setSendPlacesRequestFunc(customFunc);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(customFunc).toHaveBeenCalledWith(['catering.cafe'], 0, autocomplete);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should reset to default when set to undefined', async () => {
            autocomplete.setSendPlacesRequestFunc(() => Promise.resolve(mockPlacesApiResponse));
            autocomplete.setSendPlacesRequestFunc(undefined);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(fetchMock).toHaveBeenCalled();
        });
    });

    // ========================================================================
    // 10. EVENT CALLBACK TESTS (ON/OFF/ONCE)
    // ========================================================================

    describe('Event Callbacks - on/off/once', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should handle on("places", callback) properly', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(1);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.restaurant');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle off("places", callback) properly', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(1);

            autocomplete.off('places', placesSpy);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.restaurant');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(1); // Should not be called again
        });

        it('should handle once("places", callback) properly', async () => {
            const placesSpy = jest.fn();
            autocomplete.once('places', placesSpy);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(1);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.restaurant');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledTimes(1); // Should only be called once
        });

        it('should handle places_request_start callbacks properly', async () => {
            const startSpy = addPlacesRequestStartSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(startSpy).toHaveBeenCalledWith(expect.objectContaining({
                keys: ['catering.cafe'],
                label: 'catering.cafe'
            }));

            autocomplete.off('places_request_start', startSpy);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.restaurant');
            await wait(WAIT_TIME);

            expect(startSpy).toHaveBeenCalledTimes(1);
        });

        it('should handle places_request_end callbacks properly', async () => {
            const endSpy = addPlacesRequestEndSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            expect(endSpy).toHaveBeenCalledWith(true, mockPlacesApiResponse, undefined);
        });

        it('should handle place_select callbacks properly', async () => {
            const selectSpy = addPlaceSelectSpy(autocomplete);

            const autocompleteWithList = new GeocoderAutocomplete(
                container,
                "XXXXX",
                optionsWithPlacesList
            );
            selectSpy.mockClear();
            autocompleteWithList.on('place_select', selectSpy);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocompleteWithList.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            selectPlaceFromList(container, 0);

            expect(selectSpy).toHaveBeenCalledWith(mockPlacesApiResponse.features[0], 0);
        });

        it('should handle clear callbacks properly', async () => {
            const clearSpy = addClearSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            autocomplete.selectCategory(null);

            expect(clearSpy).toHaveBeenCalledWith('category');
        });
    });

    // ========================================================================
    // 11. EDGE CASES AND EMPTY RESPONSES
    // ========================================================================

    describe('Edge Cases', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithCategorySearch);
        });

        it('should handle empty places response', async () => {
            const placesSpy = addPlacesSpy(autocomplete);

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiEmpty);
            autocomplete.selectCategory('invalid.category');
            await wait(WAIT_TIME);

            expect(placesSpy).toHaveBeenCalledWith([]);
        });

        it('should handle geocoder response without categories', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(mockGeocoderResponseEmpty));

            inputText(container, 'test');
            await wait(WAIT_TIME);

            const dropdown = container.querySelector('.geoapify-autocomplete-items');
            const categoryItems = dropdown?.querySelectorAll('.geoapify-category-item');
            expect(categoryItems?.length || 0).toBe(0); // No categories
        });

        it('should not display load more button for empty response', async () => {
            const autocompleteWithList = new GeocoderAutocomplete(
                container,
                "XXXXX",
                optionsWithPlacesList
            );

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiEmpty);
            autocompleteWithList.selectCategory('invalid.category');
            await wait(WAIT_TIME);

            const loadMoreButton = getLoadMoreButton(container);
            expect(loadMoreButton).toBeFalsy();
        });
    });

    // ========================================================================
    // 12. PROGRAMMATIC PLACE SELECTION (selectPlace API)
    // ========================================================================

    describe('Programmatic Place Selection', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithPlacesList);
        });

        const preparePlacesList = async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            fetchMock.resetMocks();
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.resendPlacesRequestForMore(false);
        };

        it('should add active class to selected place using selectPlace()', async () => {
            await preparePlacesList();

            // Select the second place (index 1)
            autocomplete.selectPlace(1);

            const placeItems = getPlacesListItems(container);
            expect(placeItems?.[1]).toHaveClass('active');
            expect(placeItems?.[0]).not.toHaveClass('active');
            expect(placeItems?.[2]).not.toHaveClass('active');
        });

        it('should clear active class when selectPlace(null) is called', async () => {
            await preparePlacesList();

            // Select a place first
            autocomplete.selectPlace(2);
            let placeItems = getPlacesListItems(container);
            expect(placeItems?.[2]).toHaveClass('active');

            // Clear selection
            autocomplete.selectPlace(null);
            placeItems = getPlacesListItems(container);
            placeItems?.forEach(item => {
                expect(item).not.toHaveClass('active');
            });
        });

        it('should clear active class when selectPlace(-1) is called', async () => {
            await preparePlacesList();

            // Select a place first
            autocomplete.selectPlace(1);
            let placeItems = getPlacesListItems(container);
            expect(placeItems?.[1]).toHaveClass('active');

            // Clear selection with negative index
            autocomplete.selectPlace(-1);
            placeItems = getPlacesListItems(container);
            placeItems?.forEach(item => {
                expect(item).not.toHaveClass('active');
            });
        });

        it('should move selection when selectPlace is called multiple times', async () => {
            await preparePlacesList();

            // Select first place
            autocomplete.selectPlace(0);
            let placeItems = getPlacesListItems(container);
            expect(placeItems?.[0]).toHaveClass('active');

            // Select third place
            autocomplete.selectPlace(2);
            placeItems = getPlacesListItems(container);
            expect(placeItems?.[0]).not.toHaveClass('active');
            expect(placeItems?.[2]).toHaveClass('active');
        });

        it('should do nothing when selectPlace is called without showPlacesList', async () => {
            const autocompleteNoList = new GeocoderAutocomplete(
                container,
                "XXXXX",
                optionsWithCategorySearch // No showPlacesList
            );

            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocompleteNoList.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            // Should not throw error
            expect(() => autocompleteNoList.selectPlace(0)).not.toThrow();
        });
    });

    // ========================================================================
    // 13. STATUS BAR - TOTAL COUNT AND SELECTED INDEX
    // ========================================================================

    describe.skip('Status Bar Display', () => {
        beforeEach(() => {
            autocomplete = new GeocoderAutocomplete(container, "XXXXX", optionsWithPlacesList);
        });

        const preparePlacesList = async () => {
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            autocomplete.selectCategory('catering.cafe');
            await wait(WAIT_TIME);

            fetchMock.resetMocks();
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponse);
            await autocomplete.resendPlacesRequestForMore(false);
        };

        it('should display total count of places in status bar', async () => {
            await preparePlacesList();

            const placesList = container.querySelector('.geoapify-places-list');
            const statusBar = placesList?.querySelector('.geoapify-places-status-bar');
            const countContainer = statusBar?.querySelector('.geoapify-places-status-count');

            expect(countContainer).toBeTruthy();
            expect(countContainer?.textContent).toContain('8'); // 8 places in mock response
        });

        it('should update total count after loading more places', async () => {
            await preparePlacesList();

            const placesList = container.querySelector('.geoapify-places-list');
            let statusBar = placesList?.querySelector('.geoapify-places-status-bar');
            let countContainer = statusBar?.querySelector('.geoapify-places-status-count');
            expect(countContainer?.textContent).toContain('8');

            // Load more - use page 2 with different places
            fetchMock.resetMocks();
            mockIpInfo(mockIpInfoResponse);
            mockPlacesApi(mockPlacesApiResponsePage2);
            clickLoadMoreButton(container);
            await wait(WAIT_TIME);

            statusBar = placesList?.querySelector('.geoapify-places-status-bar');
            countContainer = statusBar?.querySelector('.geoapify-places-status-count');
            expect(countContainer?.textContent).toContain('16'); // 8 + 8
        });

        it('should display selected place index when place is selected', async () => {
            await preparePlacesList();

            // Select third place (index 2)
            autocomplete.selectPlace(2);

            const placesList = container.querySelector('.geoapify-places-list');
            const statusBar = placesList?.querySelector('.geoapify-places-status-bar');
            const selectedInfo = statusBar?.querySelector('.geoapify-places-status-selected');

            expect(selectedInfo).toBeTruthy();
            expect(selectedInfo?.textContent).toBe('3 / 8'); // 3rd place out of 8
        });

        it('should update selected index display when selection changes', async () => {
            await preparePlacesList();

            // Select first place
            autocomplete.selectPlace(0);
            let placesList = container.querySelector('.geoapify-places-list');
            let statusBar = placesList?.querySelector('.geoapify-places-status-bar');
            let selectedInfo = statusBar?.querySelector('.geoapify-places-status-selected');
            expect(selectedInfo?.textContent).toBe('1 / 8');

            // Select last place
            autocomplete.selectPlace(7);
            placesList = container.querySelector('.geoapify-places-list');
            statusBar = placesList?.querySelector('.geoapify-places-status-bar');
            selectedInfo = statusBar?.querySelector('.geoapify-places-status-selected');
            expect(selectedInfo?.textContent).toBe('8 / 8');
        });
    });
});
