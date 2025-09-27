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
            
            placesMarkers.push(placeMarker);
        }
    });
    
    // Fit map to show all places if there are any
    if (placesMarkers.length > 0) {
        const group = new L.featureGroup(placesMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
});

// Handle category clearing
autocompleteInput.on('clear', (context) => {
    if (context === 'category') {
        clearPlacesMarkers();
        if (marker) {
            marker.remove();
            marker = null;
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
