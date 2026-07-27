/* WARNING: This API key is provided for DEMO purposes only.
   Please sign up at https://www.geoapify.com and generate your own API key.
   The demo key may be rotated or blocked at any moment without notice.
*/
const myAPIKey = "52f7bd50de994836b609fbfc6f082700";

// The Leaflet map Object - centered on Paris to match the bias
const map = L.map("map", { zoomControl: false }).setView([48.8566, 2.3522], 16);

// Retina displays require different mat tiles quality
const isRetina = L.Browser.retina;

// Map tile configurations for different themes
const mapTiles = {
  light: {
    baseUrl:
      "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}",
    retinaUrl:
      "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}",
    attribution:
      'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
  },
  dark: {
    baseUrl:
      "https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}.png?apiKey={apiKey}",
    retinaUrl:
      "https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}@2x.png?apiKey={apiKey}",
    attribution:
      'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
  },
};

let currentTileLayer;

// Function to switch map theme
function switchMapTheme(themeName) {
  // Remove current tile layer
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  // Determine if it's a dark theme
  const isDarkTheme = themeName.includes("dark");
  const tileConfig = isDarkTheme ? mapTiles.dark : mapTiles.light;

  // Add new tile layer
  currentTileLayer = L.tileLayer(
    isRetina ? tileConfig.retinaUrl : tileConfig.baseUrl,
    {
      attribution: tileConfig.attribution,
      apiKey: myAPIKey,
      maxZoom: 20,
      id: isDarkTheme ? "dark-matter-brown" : "osm-bright",
    }
  ).addTo(map);
}

// Initialize with light theme
switchMapTheme("minimal");

// add a zoom control to bottom-right corner
L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);

// Create autocomplete with category search enabled
const autocompleteInput = new autocomplete.GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  myAPIKey,
  {
    placeholder: "Search for places or categories...",
    addCategorySearch: true,
    showPlacesList: false,
    limit: 8,
  }
);

// Add bias based on map view for better results
function updateBiasAndFilters() {
  const center = map.getCenter();

  autocompleteInput.addBiasByProximity({
    lon: center.lng,
    lat: center.lat,
  });

  const mapBounds = map.getBounds();
  const rect = {
    lat1: mapBounds.getSouthWest().lat,
    lon1: mapBounds.getSouthWest().lng,
    lat2: mapBounds.getNorthEast().lat,
    lon2: mapBounds.getNorthEast().lng,
  };

  autocompleteInput.setPlacesBiasByRect(rect);
  autocompleteInput.setPlacesFilterByRect(rect);
}

// Set initial bias
updateBiasAndFilters();

// Update bias and rerun places query when map moves significantly
let mapMoveTimeout;
map.on("moveend", () => {
  updateBiasAndFilters();

  // Only when a category is active
  if (!currentCategoryObj) return;

  // no search on small zoom levels
  if (map.getZoom() < 14) return;

  // Requery only when moved significantly
  const currentCenter = map.getCenter();
  const distance = lastQueryCenter
    ? currentCenter.distanceTo(lastQueryCenter)
    : Infinity;
  if (distance <= 500) return;

  // Show "Search here" button when a category is active and map moved notably
    if (currentCategoryObj && map.getZoom() >= 14 && distance > 500) {
      showSearchHere();
    }
});

// generate an marker icon with https://apidocs.geoapify.com/playground/icon
const markerIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%232ea2ff&size=large&scaleFactor=2&apiKey=${myAPIKey}`,
  iconSize: [38, 56], // size of the icon
  iconAnchor: [19, 51], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -60], // point from which the popup should open relative to the iconAnchor
});

let marker;
let placesMarkers = [];
let markerByIndex = []; // Map list index -> marker
let currentCategoryObj = null; // Track current selected category object for requerying
let lastQueryCenter = null; // Track the center of the last places query

// UI elements
const placesListContainer = document.getElementById("places-list");

function anyMarkerVisible() {
  const bounds = map.getBounds();
  return placesMarkers.some(m => bounds.contains(m.getLatLng()));
}

// Leaflet control: "Search here" button
const searchHereControl = L.control({ position: "bottomright" });
let searchHereEl = null;

searchHereControl.onAdd = function () {
  const wrap = L.DomUtil.create("div");
  wrap.className = "search-here-control";

  const btn = L.DomUtil.create("button", "search-here-button", wrap);
  btn.textContent = "Search here";

  L.DomEvent.disableClickPropagation(wrap);
  L.DomEvent.on(btn, "click", () => {
    const append = anyMarkerVisible();
    autocompleteInput.resendPlacesRequestForMore(append);
    hideSearchHere();
  });

  searchHereEl = wrap;
  return wrap;
};

function showSearchHere() {
  if (searchHereEl) {
    const btn = searchHereEl.querySelector('button');
    if (btn) {
      // If some marker is visible, offer to show more; otherwise, prompt to search here
      btn.textContent = anyMarkerVisible() ? 'Show more' : 'Search here';
    }
    searchHereEl.classList.add("visible");
  }
}

function hideSearchHere() {
  if (searchHereEl) searchHereEl.classList.remove("visible");
}

searchHereControl.addTo(map);
// Move control to map container to allow true top-center positioning via CSS
try {
  const mc = map.getContainer();
  if (searchHereEl && mc && searchHereEl.parentNode !== mc) {
    mc.appendChild(searchHereEl);
  }
} catch (_) {}

function clearPlacesMarkers() {
  placesMarkers.forEach((m) => m.remove());
  placesMarkers = [];
  markerByIndex = [];
}

function clearPlacesList() {
  placesListContainer.innerHTML = "";
  placesListContainer.classList.remove("active", "standalone");
}

function createPlaceItem(place, index) {
  const placeElement = document.createElement("div");
  placeElement.className = "place-item";
  placeElement.dataset.index = index;

  const props = place.properties;
  const name = props.name || "Unknown Place";

  // Extract rating and reviews
  const rating = props.rating || null;
  const reviewCount = props.review_count || props.reviews_count || null;

  // Build price range (if available)
  const priceLevel = props.price_level || null;
  const priceRange = priceLevel ? "€".repeat(priceLevel) : null;

  // Build full address
  const fullAddress =
    props.formatted ||
    props.address_line2 ||
    `${props.street || ""}${props.street && props.postcode ? ", " : ""}${
      props.postcode || ""
    } ${props.city || ""}`.trim();

  // Separate objects for different tag types
  const categories = [];
  const facilities = [];
  const cuisine = [];
  const catering = [];

  // Utility functions
  function cleanText(text) {
    const lastPart = text.split(".").pop();
    return lastPart
      .replace(/[_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  }

  function shouldExcludeTag(text) {
    const lastPart = text.split(".").pop().toLowerCase();
    return lastPart === "yes";
  }

  // Extract categories (only leaf categories, not parents)
  if (props.categories && Array.isArray(props.categories)) {
    const leafCategories = props.categories.filter((category) => {
      if (typeof category !== "string" || !category.trim()) return false;

      const isParent = props.categories.some(
        (otherCategory) =>
          otherCategory !== category && otherCategory.startsWith(category + ".")
      );

      return !isParent;
    });

    leafCategories.forEach((category) => {
      if (!shouldExcludeTag(category)) {
        categories.push(cleanText(category));
      }
    });
  }

  // Extract facilities (boolean true values only)
  if (props.facilities && typeof props.facilities === "object") {
    for (const [key, value] of Object.entries(props.facilities)) {
      if (value === true && !shouldExcludeTag(key)) {
        facilities.push(cleanText(key));
      }
    }
  }

  // Extract catering info (with special handling for cuisine)
  if (props.catering && typeof props.catering === "object") {
    for (const [key, value] of Object.entries(props.catering)) {
      if (key === "cuisine" || key.includes("cuisine")) {
        // Cuisine goes to cuisine array
        if (typeof value === "string" && value.trim()) {
          const values = value
            .split(";")
            .map((v) => v.trim())
            .filter((v) => v);
          values.forEach((val) => {
            if (!shouldExcludeTag(val)) {
              cuisine.push(cleanText(val));
            }
          });
        }
      } else {
        // Other catering info goes to catering array
        if (value === true && !shouldExcludeTag(key)) {
          catering.push(cleanText(key));
        } else if (typeof value === "string" && value.trim()) {
          const values = value
            .split(";")
            .map((v) => v.trim())
            .filter((v) => v);
          values.forEach((val) => {
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
                    ${
                      rating
                        ? `
                        <span class="rating-stars">${"★".repeat(
                          Math.floor(rating)
                        )}${"☆".repeat(5 - Math.floor(rating))}</span>
                        <span class="rating-number">${rating}</span>
                        ${
                          reviewCount
                            ? `<span class="review-count">(${reviewCount})</span>`
                            : ""
                        }
                    `
                        : ""
                    }
                    ${
                      rating && priceRange
                        ? `<span class="separator">•</span>`
                        : ""
                    }
                    ${
                      priceRange
                        ? `<span class="price-range">${priceRange}</span>`
                        : ""
                    }
                </div>
            </div>
            ${
              categories.length > 0 ||
              cuisine.length > 0 ||
              facilities.length > 0 ||
              catering.length > 0
                ? `
                <div class="place-tags-container">
                    ${
                      categories.length > 0
                        ? `
                        <div class="tag-group">
                            <span class="tag-label">Categories:</span>
                            ${categories
                              .map(
                                (tag) =>
                                  `<span class="tag-badge tag-primary">${tag}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    ${
                      cuisine.length > 0
                        ? `
                        <div class="tag-group">
                            <span class="tag-label">Cuisine:</span>
                            ${cuisine
                              .map(
                                (tag) =>
                                  `<span class="tag-badge tag-secondary">${tag}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    ${
                      facilities.length > 0
                        ? `
                        <div class="tag-group">
                            <span class="tag-label">Facilities:</span>
                            ${facilities
                              .map(
                                (tag) =>
                                  `<span class="tag-badge tag-facility">${tag}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    ${
                      catering.length > 0
                        ? `
                        <div class="tag-group">
                            <span class="tag-label">Catering:</span>
                            ${catering
                              .map(
                                (tag) =>
                                  `<span class="tag-badge tag-secondary">${tag}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }
            <div class="place-bottom">
                <div class="place-address">${fullAddress}</div>
                ${
                  openingHours
                    ? `
                    <div class="place-hours">
                        <div class="hours-label">Opening hours:</div>
                        <div class="hours-text">${openingHours}</div>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `;

  // Add click handler
  placeElement.addEventListener("click", () => {
    selectPlaceFromList(place, index, true);
  });

  return placeElement;
}

function selectPlaceFromList(place, index, panMap) {
  // Remove previous selection
  document.querySelectorAll(".place-item").forEach((item) => {
    item.classList.remove("selected");
  });

  // Add selection to clicked item
  document
    .querySelector(`.place-item[data-index="${index}"]`)
    .classList.add("selected");

  // Open popup for the corresponding marker and pan to it
  try {
    const m = markerByIndex[index];
    if (m) {
      m.openPopup();
      if (panMap)
        map.panTo(m.getLatLng());
    }
  } catch (_) {}

  // Scroll selected list item into view if it's outside the visible area
  try {
    const container = placesListContainer;
    const item = document.querySelector(`.place-item[data-index="${index}"]`);
    if (container && item) {
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const viewTop = container.scrollTop;
      const viewBottom = viewTop + container.clientHeight;
      if (itemTop < viewTop || itemBottom > viewBottom) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  } catch (_) {}
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

  placesListContainer.classList.add("active", "standalone");

  // Scroll to top of the places list
  placesListContainer.scrollTop = 0;
}

// Handle regular address selection
autocompleteInput.on("select", (location) => {
  // Add marker with the selected location
  if (marker) {
    marker.remove();
  }

  clearPlacesMarkers();
  clearPlacesList();

  if (location) {
    marker = L.marker([location.properties.lat, location.properties.lon], {
      icon: markerIcon,
    }).addTo(map);

    map.panTo([location.properties.lat, location.properties.lon]);
  }
});

// Handle places results (when category is selected)
autocompleteInput.on("places", (places) => {
  clearPlacesMarkers();

  // Store current category object and map center
  const category = autocompleteInput.getCategory();
  if (category) {
    currentCategoryObj = category; // Store the full category object with label
    lastQueryCenter = map.getCenter(); // Store the center when places are loaded
  }

  // Show places in the Google Maps-style list
  showPlacesList(places);

  // Add markers for all places
  places.forEach((place, index) => {
    if (place.properties.lat && place.properties.lon) {
      const placeMarker = L.marker(
        [place.properties.lat, place.properties.lon],
        {
          icon: markerIcon,
        }
      ).addTo(map);

      // Add popup with place information - just the name (disable autoPan to avoid recentering)
      const name = place.properties.name || place.properties.formatted;
      placeMarker.bindPopup(name, { autoPan: false });

      // When marker is clicked, select the corresponding place in the list
      placeMarker.on("click", () => {
        selectPlaceFromList(place, index);
      });

      placesMarkers.push(placeMarker);
      markerByIndex[index] = placeMarker;
    } else {
      markerByIndex[index] = null;
    }
  });

  // Don't auto-zoom to places - let user control the map view
  hideSearchHere && hideSearchHere();
});

// Handle suggestions (for address results)
autocompleteInput.on("suggestions", (suggestions) => {
  const currentCategory = autocompleteInput.getCategory();
  // No longer need to update places count
});

// Handle category clearing
autocompleteInput.on("clear", (context) => {
  if (context === "category") {
    clearPlacesMarkers();
    clearPlacesList();
    currentCategoryObj = null; // Clear current category
    lastQueryCenter = null; // Clear last query center
    if (marker) {
      marker.remove();
      marker = null;
    }
    hideSearchHere && hideSearchHere();
  }
});

// Handle places request events for loading feedback
autocompleteInput.on("places_request_start", (category) => {
  // Could add loading indicator here if needed
});

autocompleteInput.on("places_request_end", (success, data, error) => {
  if (!success) {
    console.error("Places request failed:", error);
  }
});

// Wait for DOM to be ready, then override the setTheme function
document.addEventListener("DOMContentLoaded", function () {
  // Override the setTheme function to also switch map theme
  const originalSetTheme = window.setTheme;
  if (originalSetTheme) {
    window.setTheme = function (themeName) {
      // Call the original setTheme function
      originalSetTheme(themeName);

      // Switch map theme
      switchMapTheme(themeName);
    };
  }
});
