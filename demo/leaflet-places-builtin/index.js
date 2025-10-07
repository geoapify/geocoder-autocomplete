/* WARNING: This API key is provided for DEMO purposes only.
   Please sign up at https://www.geoapify.com and generate your own API key.
   The demo key may be rotated or blocked at any moment without notice.
*/
const myAPIKey = "52f7bd50de994836b609fbfc6f082700";

// The Leaflet map Object - centered on Paris to match the bias
const map = L.map('map', {zoomControl: false}).setView([48.8566, 2.3522], 12);

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

// Create autocomplete with category search and built-in places list enabled
const autocompleteInput = new autocomplete.GeocoderAutocomplete(
                        document.getElementById("autocomplete"), 
                        myAPIKey, 
                        { 
                            placeholder: "Search for places or categories...",
                            addCategorySearch: true,
                            showPlacesList: true,  // Built-in places list instead of custom UI
                            limit: 8
                        });

// Add bias based on map view for better results
function updateBias() {
    const center = map.getCenter();
    autocompleteInput.addBiasByProximity({
        lon: center.lng,
        lat: center.lat
    });
}

// Set initial bias
updateBias();

// Update bias and rerun places query when map moves significantly
let mapMoveTimeout;
map.on('moveend', () => {
    updateBias();
    
    // Rerun places query if a category is selected and map moved significantly
    if (currentCategoryObj && lastQueryCenter) {
        const currentCenter = map.getCenter();
        const distance = currentCenter.distanceTo(lastQueryCenter); // Distance in meters
        
        // Requery if moved more than 500 meters
        if (distance > 500) {
            clearTimeout(mapMoveTimeout);
            mapMoveTimeout = setTimeout(() => {
                console.log(`Map moved ${Math.round(distance)}m - requerying places`);
                lastQueryCenter = map.getCenter();
                autocompleteInput.setCategory(currentCategoryObj); // Pass the full category object
            }, 500); // Wait 500ms after map stops moving
        }
    }
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
let currentPlaces = [];
let currentCategoryObj = null; // Track current selected category object for requerying
let lastQueryCenter = null; // Track the center of the last places query

function clearPlacesMarkers() {
    placesMarkers.forEach(m => m.remove());
    placesMarkers = [];
}

// Handle regular address selection
autocompleteInput.on('select', (location) => {
    // Add marker with the selected location
    if (marker) {
        marker.remove();
    }
    
    clearPlacesMarkers();
    
    if (location) {
        marker = L.marker([location.properties.lat, location.properties.lon], {
            icon: markerIcon
        }).addTo(map);
      
        map.panTo([location.properties.lat, location.properties.lon]);
    }
});

// Handle places results (when category is selected) - now with map integration
autocompleteInput.on('places', (places) => {
    clearPlacesMarkers();
    currentPlaces = places; // Store for later use
    
    // Store current category object and map center
    const category = autocompleteInput.getCategory();
    if (category) {
        currentCategoryObj = category; // Store the full category object with label
        lastQueryCenter = map.getCenter(); // Store the center when places are loaded
    }
    
    console.log(`Found ${places.length} places`);
    
    // Add markers for all places (same as leaflet-category demo)
    places.forEach((place, index) => {
        if (place.properties.lat && place.properties.lon) {
            const placeMarker = L.marker([place.properties.lat, place.properties.lon], {
                icon: markerIcon
            }).addTo(map);
            
            // Add popup with place information - just the name
            const name = place.properties.name || place.properties.formatted;
            placeMarker.bindPopup(name);
            
            // When marker is clicked, select the place in the built-in list
            placeMarker.on('click', () => {
                // Highlight in list
                autocompleteInput.selectPlace(index);
                // Pan and zoom (same as place_select callback)
                map.panTo([place.properties.lat, place.properties.lon]);
                placeMarker.openPopup();
                if (map.getZoom() < 16) {
                    map.setZoom(16);
                }
            });
            
            placesMarkers.push(placeMarker);
        }
    });
    
});

// Handle category clearing
autocompleteInput.on('clear', (context) => {
    if (context === 'category') {
        clearPlacesMarkers();
        currentCategoryObj = null; // Clear current category
        lastQueryCenter = null; // Clear last query center
        if (marker) {
            marker.remove();
            marker = null;
        }
    }
});

autocompleteInput.on('place_select', (place, index) => {
    console.log('Place selected:', place.properties.name, 'at index:', index);
    
    // Highlight the place in the list
    autocompleteInput.selectPlace(index);
    
    if (placesMarkers[index]) {
        map.panTo([place.properties.lat, place.properties.lon]);
        placesMarkers[index].openPopup();
        
        if (map.getZoom() < 16) {
            map.setZoom(16);
        }
    }
});

// Handle places request events for loading feedback
autocompleteInput.on('places_request_start', (category) => {
    console.log('Loading places for category:', category);
});

autocompleteInput.on('places_request_end', (success, data, error) => {
    if (!success) {
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
