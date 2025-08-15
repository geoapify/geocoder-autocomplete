/* WARNING: This API key is provided for DEMO purposes only.
   Please sign up at https://www.geoapify.com and generate your own API key.
   The demo key may be rotated or blocked at any moment without notice.
*/
const myAPIKey = "52f7bd50de994836b609fbfc6f082700";

// Map style configurations for different themes
const mapStyles = {
    light: `https://maps.geoapify.com/v1/styles/osm-bright-grey/style.json?apiKey=${myAPIKey}`,
    dark: `https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=${myAPIKey}`
};

// The MapLibre GL map object
const map = new maplibregl.Map({
  container: "map", // ID of the container element
  style: mapStyles.light, // Start with light theme
  center: [-77.02346458179596, 38.908838755401035], // Initial center [longitude, latitude]
  zoom: 12, // Initial zoom level
  maxZoom: 20, // Max zoom level
});

// Function to switch map theme
function switchMapTheme(themeName) {
    console.log('Switching map theme to:', themeName);
    
    // Determine if it's a dark theme
    const isDarkTheme = themeName.includes('dark');
    const newStyle = isDarkTheme ? mapStyles.dark : mapStyles.light;
    
    console.log('Using style:', isDarkTheme ? 'dark' : 'light');
    
    // Switch map style
    map.setStyle(newStyle);
    
    // Re-add controls and event listeners after style change
    map.once('style.load', () => {
        // Re-add navigation control
        map.addControl(new maplibregl.NavigationControl({ position: "bottom-right" }));
        
        // Re-add click event listener
        map.on("click", function (e) {
            const lat = e.lngLat.lat;
            const lon = e.lngLat.lng;
            
            getAddressByLatLon(lat, lon).then((location) => {
                if (marker) {
                    marker.remove();
                }
                
                autocompleteInput.setValue(location.properties.formatted);
                marker = new maplibregl.Marker({ element: createMarkerIcon(), offset: [0, -25] })
                    .setLngLat([location.properties.lon, location.properties.lat])
                    .addTo(map);
            });
        });
    });
}

// Add zoom and rotation controls to bottom-right corner
map.addControl(new maplibregl.NavigationControl({ position: "bottom-right" }));

// check the available autocomplete options on the https://www.npmjs.com/package/@geoapify/geocoder-autocomplete
const autocompleteInput = new autocomplete.GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  myAPIKey,
  {
    /* Geocoder options */
  },
);

// Generate a marker icon with https://apidocs.geoapify.com/playground/icon
const markerIcon = new maplibregl.Marker({
  element: createMarkerIcon(),
  anchor: "bottom",
});

function createMarkerIcon() {
  const img = document.createElement("img");
  img.src = `https://api.geoapify.com/v2/icon/?type=awesome&color=%23ff5b5f&size=50&scaleFactor=2&apiKey=${myAPIKey}`;
  img.style.width = "38px";
  img.style.height = "55px";
  return img;
}

let marker;

autocompleteInput.on("select", (location) => {
  // Add marker with the selected location
  if (marker) {
    marker.remove();
  }

  if (location) {
    marker = new maplibregl.Marker({ element: createMarkerIcon(), offset: [0, -25 /* -(icon height - icon shadow offset) / 2 */]})
      .setLngLat([location.properties.lon, location.properties.lat])
      .addTo(map);

    map.flyTo({
      center: [location.properties.lon, location.properties.lat],
      zoom: 14,
    });
  }
});

// Add click event listener to the map
map.on("click", function (e) {
  const lat = e.lngLat.lat; // Get latitude from the click event
  const lon = e.lngLat.lng; // Get longitude from the click event

  // Call reverse geocoding for the clicked location
  getAddressByLatLon(lat, lon).then((location) => {
    if (marker) {
      marker.remove();
    }

    autocompleteInput.setValue(location.properties.formatted);
    marker = new maplibregl.Marker({ element: createMarkerIcon(), offset: [0, -25 /* -(icon height - icon shadow offset) / 2 */] })
      .setLngLat([location.properties.lon, location.properties.lat])
      .addTo(map);
  });
});

function getAddressByLatLon(lat, lon) {
  return fetch(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${myAPIKey}`,
  )
    .then((result) => result.json())
    .then((result) => {
      if (result && result.features && result.features.length) {
        return result.features[0];
      }

      return null;
    });
}

// Wait for DOM to be ready, then override the setTheme function
document.addEventListener('DOMContentLoaded', function() {
    // Override the setTheme function to also switch map theme
    const originalSetTheme = window.setTheme;
    if (originalSetTheme) {
        window.setTheme = function(themeName) {
            console.log('Theme changed to:', themeName);
            // Call the original setTheme function
            originalSetTheme(themeName);
            
            // Switch map theme
            switchMapTheme(themeName);
        };
    }
});
