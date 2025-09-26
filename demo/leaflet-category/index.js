/* WARNING: This API key is provided for DEMO purposes only.
   Please sign up at https://www.geoapify.com and generate your own API key.
   The demo key may be rotated or blocked at any moment without notice.
*/
const myAPIKey = "52f7bd50de994836b609fbfc6f082700";

// The Leaflet map Object
const map = L.map('map', {zoomControl: false}).setView([38.908838755401035, -77.02346458179596], 12);

// Retina displays require different mat tiles quality
const isRetina = L.Browser.retina;

// Map tile configurations for different themes
const mapTiles = {
    light: {
        baseUrl: "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}",
        retinaUrl: "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}",
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors'
    },
    dark: {
        baseUrl: "https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}.png?apiKey={apiKey}",
        retinaUrl: "https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}@2x.png?apiKey={apiKey}",
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors'
    }
};

let currentTileLayer;

// Function to switch map theme
function switchMapTheme(themeName) {
    // Remove current tile layer
    if (currentTileLayer) {
        map.removeLayer(currentTileLayer);
    }
    
    // Determine if it's a dark theme
    const isDarkTheme = themeName.includes('dark');
    const tileConfig = isDarkTheme ? mapTiles.dark : mapTiles.light;
    
    // Add new tile layer
    currentTileLayer = L.tileLayer(isRetina ? tileConfig.retinaUrl : tileConfig.baseUrl, {
        attribution: tileConfig.attribution,
        apiKey: myAPIKey,
        maxZoom: 20,
        id: isDarkTheme ? 'dark-matter-brown' : 'osm-bright'
    }).addTo(map);
}

// Initialize with light theme
switchMapTheme('minimal');

// add a zoom control to bottom-right corner
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Create autocomplete with category search enabled
const autocompleteInput = new autocomplete.GeocoderAutocomplete(
                        document.getElementById("autocomplete"), 
                        myAPIKey, 
                        { 
                            placeholder: "Search for places or categories...",
                            addCategorySearch: true,
                            showPlacesList: true,
                            limit: 8
                        });

// Add some bias to get better results (around Paris)
autocompleteInput.addBiasByProximity({
    lon: 2.3522,
    lat: 48.8566
});

// generate an marker icon with https://apidocs.geoapify.com/playground/icon
const markerIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%232ea2ff&size=large&scaleFactor=2&apiKey=${myAPIKey}`,
  iconSize: [38, 56], // size of the icon
  iconAnchor: [19, 51], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
});

let marker;
let placesMarkers = [];

// UI elements
const placesCount = document.getElementById('places-count');
const placesHeader = document.getElementById('places-header');
const placesListContainer = document.getElementById('places-list');

function clearPlacesMarkers() {
    placesMarkers.forEach(m => m.remove());
    placesMarkers = [];
}

function clearPlacesList() {
    placesListContainer.innerHTML = '';
    placesListContainer.classList.remove('active');
    placesHeader.classList.remove('active');
}

function createPlaceItem(place, index) {
    const placeElement = document.createElement('div');
    placeElement.className = 'place-item';
    placeElement.dataset.index = index;
    
    const props = place.properties;
    const name = props.name || 'Unknown Place';
    
    // Extract rating and reviews
    const rating = props.rating || null;
    const reviewCount = props.review_count || props.reviews_count || null;
    
    // Build price range (if available)
    const priceLevel = props.price_level || null;
    const priceRange = priceLevel ? '€'.repeat(priceLevel) : null;
    
    // Build full address
    const fullAddress = props.formatted || props.address_line2 || 
                       `${props.street || ''}${props.street && props.postcode ? ', ' : ''}${props.postcode || ''} ${props.city || ''}`.trim();
    
    // Separate objects for different tag types
    const categories = [];
    const facilities = [];
    const cuisine = [];
    const details = [];
    const catering = [];
    
    // Utility functions
    function cleanText(text) {
        const lastPart = text.split('.').pop();
        return lastPart
            .replace(/[_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }
    
    function shouldExcludeTag(text) {
        const lastPart = text.split('.').pop().toLowerCase();
        return lastPart === 'yes';
    }
    
    // Extract categories (only leaf categories, not parents)
    if (props.categories && Array.isArray(props.categories)) {
        const leafCategories = props.categories.filter(category => {
            if (typeof category !== 'string' || !category.trim()) return false;
            
            const isParent = props.categories.some(otherCategory => 
                otherCategory !== category && 
                otherCategory.startsWith(category + '.')
            );
            
            return !isParent;
        });
        
        leafCategories.forEach(category => {
            if (!shouldExcludeTag(category)) {
                categories.push(cleanText(category));
            }
        });
    }
    
    // Extract facilities (boolean true values only)
    if (props.facilities && typeof props.facilities === 'object') {
        for (const [key, value] of Object.entries(props.facilities)) {
            if (value === true && !shouldExcludeTag(key)) {
                facilities.push(cleanText(key));
            }
        }
    }
    
    // Extract catering info (with special handling for cuisine)
    if (props.catering && typeof props.catering === 'object') {
        for (const [key, value] of Object.entries(props.catering)) {
            if (key === 'cuisine' || key.includes('cuisine')) {
                // Cuisine goes to cuisine array
                if (typeof value === 'string' && value.trim()) {
                    const values = value.split(';').map(v => v.trim()).filter(v => v);
                    values.forEach(val => {
                        if (!shouldExcludeTag(val)) {
                            cuisine.push(cleanText(val));
                        }
                    });
                }
            } else {
                // Other catering info goes to catering array
                if (value === true && !shouldExcludeTag(key)) {
                    catering.push(cleanText(key));
                } else if (typeof value === 'string' && value.trim()) {
                    const values = value.split(';').map(v => v.trim()).filter(v => v);
                    values.forEach(val => {
                        if (!shouldExcludeTag(val)) {
                            catering.push(cleanText(val));
                        }
                    });
                }
            }
        }
    }
    
    // Opening hours
    const openingHours = props.opening_hours || null;
    
    placeElement.innerHTML = `
        <div class="place-content">
            <div class="place-header">
                <div class="place-title">${name}</div>
                <div class="place-meta-line">
                    ${rating ? `
                        <span class="rating-stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}</span>
                        <span class="rating-number">${rating}</span>
                        ${reviewCount ? `<span class="review-count">(${reviewCount})</span>` : ''}
                    ` : ''}
                    ${(rating && priceRange) ? `<span class="separator">•</span>` : ''}
                    ${priceRange ? `<span class="price-range">${priceRange}</span>` : ''}
                </div>
            </div>
            ${(categories.length > 0 || cuisine.length > 0 || facilities.length > 0 || catering.length > 0) ? `
                <div class="place-tags-container">
                    ${categories.length > 0 ? `
                        <div class="tag-group">
                            <span class="tag-label">Categories:</span>
                            ${categories.map(tag => `<span class="tag-badge tag-primary">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${cuisine.length > 0 ? `
                        <div class="tag-group">
                            <span class="tag-label">Cuisine:</span>
                            ${cuisine.map(tag => `<span class="tag-badge tag-secondary">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${facilities.length > 0 ? `
                        <div class="tag-group">
                            <span class="tag-label">Facilities:</span>
                            ${facilities.map(tag => `<span class="tag-badge tag-facility">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${catering.length > 0 ? `
                        <div class="tag-group">
                            <span class="tag-label">Catering:</span>
                            ${catering.map(tag => `<span class="tag-badge tag-secondary">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            <div class="place-bottom">
                <div class="place-address">${fullAddress}</div>
                ${openingHours ? `
                    <div class="place-hours">
                        <div class="hours-label">Opening hours:</div>
                        <div class="hours-text">${openingHours}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add click handler
    placeElement.addEventListener('click', () => {
        selectPlaceFromList(place, index);
    });
    
    return placeElement;
}

function selectPlaceFromList(place, index) {
    // Remove previous selection
    document.querySelectorAll('.place-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    document.querySelector(`.place-item[data-index="${index}"]`).classList.add('selected');
    
    // Focus on the place marker
    if (placesMarkers[index]) {
        map.panTo([place.properties.lat, place.properties.lon]);
        placesMarkers[index].openPopup();
    }
}

function showPlacesList(places) {
    clearPlacesList();
    
    if (!places || places.length === 0) {
        return;
    }
    
    places.forEach((place, index) => {
        const placeElement = createPlaceItem(place, index);
        placesListContainer.appendChild(placeElement);
    });
    
    placesHeader.classList.add('active');
    placesListContainer.classList.add('active');
    
    // Scroll to top of the places list
    placesListContainer.scrollTop = 0;
}

function updatePlacesCount(count, isPlaces = false) {
    if (isPlaces && count > 0) {
        placesCount.textContent = `${count} places found`;
        placesHeader.classList.add('active');
    } else {
        placesCount.textContent = '';
        placesHeader.classList.remove('active');
    }
}

// Handle regular address selection
autocompleteInput.on('select', (location) => {
    // Add marker with the selected location
    if (marker) {
        marker.remove();
    }
    
    clearPlacesMarkers();
    clearPlacesList();
    
    if (location) {
        marker = L.marker([location.properties.lat, location.properties.lon], {
            icon: markerIcon
        }).addTo(map);
      
        map.panTo([location.properties.lat, location.properties.lon]);
    }
});

// Handle places results (when category is selected)
autocompleteInput.on('places', (places) => {
    clearPlacesMarkers();
    
    updatePlacesCount(places.length, true);
    
    // Show places in the Google Maps-style list
    showPlacesList(places);
    
    // Add markers for all places
    places.forEach((place, index) => {
        if (place.properties.lat && place.properties.lon) {
            const placeMarker = L.marker([place.properties.lat, place.properties.lon], {
                icon: markerIcon
            }).addTo(map);
            
            // Add popup with place information - just the name
            const name = place.properties.name || place.properties.formatted;
            placeMarker.bindPopup(name);
            
            placesMarkers.push(placeMarker);
        }
    });
    
    // Fit map to show all places if there are any
    if (placesMarkers.length > 0) {
        const group = new L.featureGroup(placesMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
});

// Handle suggestions (for address results)
autocompleteInput.on('suggestions', (suggestions) => {
    const currentCategory = autocompleteInput.getCategory();
    if (!currentCategory) {
        updatePlacesCount(suggestions.length, false);
    }
});

// Handle category clearing
autocompleteInput.on('clear', (context) => {
    if (context === 'category') {
        clearPlacesMarkers();
        clearPlacesList();
        if (marker) {
            marker.remove();
            marker = null;
        }
    }
});

// Handle places request events for loading feedback
autocompleteInput.on('places_request_start', (category) => {
    placesCount.textContent = 'Loading places...';
});

autocompleteInput.on('places_request_end', (success, data, error) => {
    if (!success) {
        placesCount.textContent = 'Error loading places';
        console.error('Places request failed:', error);
    }
});

// Wait for DOM to be ready, then override the setTheme function
document.addEventListener('DOMContentLoaded', function() {
    // Override the setTheme function to also switch map theme
    const originalSetTheme = window.setTheme;
    if (originalSetTheme) {
        window.setTheme = function(themeName) {
            // Call the original setTheme function
            originalSetTheme(themeName);
            
            // Switch map theme
            switchMapTheme(themeName);
        };
    }
});
