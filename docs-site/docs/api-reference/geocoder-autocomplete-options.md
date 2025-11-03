The `GeocoderAutocompleteOptions` object allows you to configure the behavior, appearance, and search logic of the Geoapify Geocoder Autocomplete control.

## Reference

Each property fine-tunes how address suggestions are fetched and displayed — from limiting the result type to customizing filters, language, or category search.

| Option                                                        | Type                                                                                                                                               | Default | Description                                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------: | ------------------------------------------------------------------------------------------------------------------ |
| [`type`](#type)                                               | [LocationType](#locationtype)                                                                                                                      |       — | Restrict suggestions to a specific type (e.g., `city`, `postcode`, `street`).                                      |
| [`lang`](#lang)                                               | 2-character [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code                                                                                                        |       — | Language of returned results.                                                                                      |
| [`limit`](#limit)                                             | number                                                                                                                                             |   **5** | Maximum number of suggestions per query.                                                                           |
| [`placeholder`](#placeholder)                                 | string                                                                                                                                             |       — | Placeholder text shown in the input.                                                                               |
| [`debounceDelay`](#debouncedelay)                             | number (ms)                                                                                                                                        | **100** | Delay before sending requests after typing.                                                                        |
| [`filter`](#filter)                                           | Object: keys with [ByCircleOptions](#bycircleoptions), [ByCountryCodeOptions](#bycountrycodeoptions), [ByRectOptions](#byrectoptions), or `string` |    `{}` | **Hard filter** for geocoder results (limit by country, circle, rect, or place).                                   |
| [`bias`](#bias)                                               | Object: keys with [ByCircleOptions](#bycircleoptions), [ByRectOptions](#byrectoptions), [ByProximityOptions](#byproximityoptions)                  |    `{}` | **Soft bias** for geocoder results (prioritize by area or proximity).                                              |
| [`skipIcons`](#skipicons)                                     | boolean                                                                                                                                            | `false` | Hide icons in the dropdown.                                                                                        |
| [`addDetails`](#adddetails)                                   | boolean                                                                                                                                            | `false` | Enrich selected result with details/geometry via [Place Details API](https://www.geoapify.com/place-details-api/). |
| [`skipSelectionOnArrowKey`](#skipselectiononarrowkey)         | boolean                                                                                                                                            | `false` | Do not update input while navigating with arrow keys.                                                              |
| [`allowNonVerifiedHouseNumber`](#allownonverifiedhousenumber) | boolean                                                                                                                                            | `false` | Include non-verified house numbers where helpful.                                                                  |
| [`allowNonVerifiedStreet`](#allownonverifiedstreet)           | boolean                                                                                                                                            | `false` | Include non-verified streets where helpful.                                                                        |
| [`addCategorySearch`](#addcategorysearch)                     | boolean                                                                                                                                            | `false` | Enable category/POI search via [Places API](https://www.geoapify.com/places-api/).                                 |
| [`showPlacesList`](#showplaceslist)                           | boolean                                                                                                                                            | `false` | Show built-in places list under the input (when category search is enabled).                                       |
| [`hidePlacesListAfterSelect`](#hideplaceslistafterselect)     | boolean                                                                                                                                            | `false` | Auto-hide the places list after a selection.                                                                       |
| [`enablePlacesLazyLoading`](#enableplaceslazyloading)         | boolean                                                                                                                                            |  `true` | Load additional places as the user scrolls the list.                                                               |
| [`placesLimit`](#placeslimit)                                 | number                                                                                                                                             |  **20** | Page size for places requests.                                                                                     |
| [`placesFilter`](#placesfilter)                               | Object: keys with [ByCircleOptions](#bycircleoptions), [ByRectOptions](#byrectoptions), or `string`                                                |    `{}` | **Hard filter** for Places results (e.g., circle/rect area).                                                       |
| [`placesBias`](#placesbias)                                   | Object: keys with [ByCircleOptions](#bycircleoptions), [ByRectOptions](#byrectoptions), [ByProximityOptions](#byproximityoptions)                  |    `{}` | **Soft bias** for Places results (e.g., proximity to a point).                                                     |

Below are detailed explanations and usage examples for each option.

## Options Overview

### `type`

Specifies the **location type** for the autocomplete results.
This option helps narrow down the suggestions to a specific level of the address hierarchy, such as country, city, street, or amenity.

**Type:** [`LocationType`](#locationtype)
**Default:** none

**Accepted values:**

* `country` — returns only countries.
* `state` — returns administrative regions or states.
* `city` — returns populated places such as cities, towns, or villages.
* `postcode` — limits results to postal codes.
* `street` — returns only street names.
* `amenity` — returns facilities such as restaurants, schools, hospitals, etc.

**Example:**

```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    type: 'city'
  }
);
```

This configuration limits the autocomplete suggestions to **city names only** (useful for country or region selectors).

### `lang`

Defines the **language** of the returned address suggestions.
Use this option to localize the autocomplete results and display place names in a specific language (when available).

**Type:** 2-character [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code
**Default:** 'en'

If the chosen language is not available for a specific location, the API automatically falls back to English or another supported language.

**Example:**

```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    lang: 'fr' // French
  }
);
```

In this configuration, the autocomplete suggestions will be returned in **French** (e.g., “Allemagne”, “États-Unis d'Amérique”).

### `placeholder`

Defines the **placeholder text** shown inside the autocomplete input field before the user types anything.
This is useful for guiding users on what type of input is expected, such as a city, address, or postal code.

**Type:** `string`
**Default:** none

**Example:**

```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    placeholder: 'Enter an address or city...'
  }
);
```

The placeholder text appears as a hint in the input field, improving the usability of your form or map interface.

### `debounceDelay`

Specifies the **delay in milliseconds** before sending an API request after the user stops typing.  

This parameter is used to **optimize the number of requests** sent to the Geoapify API and improve overall performance.  

When users type quickly, multiple keystrokes occur within milliseconds — the `debounceDelay` ensures that only the most recent input triggers a request, preventing redundant API calls.

**Type:** `number`  
**Default:** `100`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    debounceDelay: 300 // wait 300ms before sending requests
  }
);
```

### `filter`

Defines **hard filters** that restrict autocomplete results to specific areas or criteria.  
Unlike `bias` (which only prioritizes certain results), filters **exclude all addresses that do not match** the defined conditions.  
Filters are essential for applications where results must be **strictly limited** to a region, country, or bounding area — for example, delivery zones, city boundaries, or marketplace coverage.

**Type:** object — accepts the following keys:  
- `countrycode`: [ByCountryCodeOptions](#bycountrycodeoptions)  
- `circle`: [ByCircleOptions](#bycircleoptions)  
- `rect`: [ByRectOptions](#byrectoptions)  
- `place`: `string`


#### `ByCountryCodeOptions`

An array of ISO country codes to restrict results to one or more countries.  
Use this to limit address search to specific countries.

**Example:**
```javascript
filter: { countrycode: ['us', 'ca'] } // United States and Canada
```


#### `ByCircleOptions`

Restricts search results to a **circular area**.
Useful when you want users to select locations within a radius (for example, 10 km around a store or city center).

**Structure:**

```typescript
{
  lon: number;       // Center longitude
  lat: number;       // Center latitude
  radiusMeters: number; // Search radius in meters
}
```

**Example:**

```javascript
filter: {
  circle: { lon: -73.9857, lat: 40.7484, radiusMeters: 5000 } // 5 km around NYC
}
```

#### `ByRectOptions`

Restricts search results to a **rectangular bounding box**, defined by two opposite corners.

**Structure:**

```typescript
{
  lon1: number; // Southwest corner longitude
  lat1: number; // Southwest corner latitude
  lon2: number; // Northeast corner longitude
  lat2: number; // Northeast corner latitude
}
```

**Example:**

```javascript
filter: {
  rect: { lon1: -124.48, lat1: 32.53, lon2: -114.13, lat2: 42.01 } // California
}
```


#### Filter by place

Specifies a **place filter** by Geoapify Place ID or predefined region identifier.
Useful when you want to limit results to a specific administrative or custom area.

**Example:**

```javascript
filter: {
  place: '51b4c20ae4b0324e12a4b92esdf4eghkhjl' // Example place ID
}
```

### `bias`

Defines **soft preferences** that influence the ranking of autocomplete results without excluding others.  
It helps prioritize results within or near a specified area — for example, around the user’s location or the visible part of a map.

**Type:** object — accepts the following keys:  
- `circle`: [ByCircleOptions](#bycircleoptions)  
- `rect`: [ByRectOptions](#byrectoptions)  
- `proximity`: [ByProximityOptions](#byproximityoptions)

Use this option when your users are likely searching near their current location or a specific map view.

#### `ByProximityOptions`

Biases results toward a **single reference point**, typically representing the user's location or map center.  
Addresses closest to this point are ranked higher.

**Structure:**
```typescript
{
  lon: number; // Longitude of the point
  lat: number; // Latitude of the point
}
```

**Example:**

```javascript
bias: {
  proximity: { lon: -122.4194, lat: 37.7749 } // Prioritize results near San Francisco
}
```

### `skipIcons`

Controls whether **icons** are displayed next to autocomplete suggestions.  
By default, icons visually represent result types (e.g., city, street, or place).  
Disabling them can simplify the UI when you want a more compact or minimalistic design.

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    skipIcons: true // hide icons in suggestions list
  }
);
```

Use `skipIcons` when your layout already provides clear visual context or when aiming for a **lightweight, text-only interface**.

### `addDetails`

Specifies whether to **enrich the selected result with additional details** such as geometry, boundaries, or building-level information.  
When enabled, the autocomplete performs an additional lookup using the [Geoapify Place Details API](https://www.geoapify.com/place-details-api/).

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    addDetails: true // include extra geometry and place information
  }
);
```

Use `addDetails` when your application needs **precise geometries** (e.g., city or building boundaries) for mapping, highlighting areas, or validating user selections.

### `skipSelectionOnArrowKey`

Determines whether the input value changes while navigating suggestions using arrow keys.  
By default, the field text updates as users move through suggestions — enabling this option prevents that behavior, keeping the input unchanged until the user confirms a selection.

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    skipSelectionOnArrowKey: true // don't change text when navigating with arrows
  }
);
```

Use `skipSelectionOnArrowKey` to avoid visual flickering or text changes in situations where users need to **browse suggestions** before selecting one explicitly (e.g., when using keyboard-only input).

### `allowNonVerifiedHouseNumber`

Allows the autocomplete to include **non-verified house numbers** in results.  
By default, the geocoder returns only verified and accurate addresses.  
However, in regions where house number data is incomplete or still being updated, enabling this option helps users find approximate or newly added addresses.

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    allowNonVerifiedHouseNumber: true // include approximate house numbers
  }
);
```

Use this option when your application serves areas with **partial or changing address coverage**, or when approximate address matching is acceptable (e.g., new residential developments).

#### Working with Non-Verified Address Components

In some cases, Geoapify may return **non-verified address components**, such as newly built streets or buildings not yet present in official databases.
These components are still valid but carry a lower verification confidence.

You can handle them in several ways:

1. Display non-verified fields with a **visual indicator** (e.g., highlight in red or show a warning).
2. Allow users to **edit or confirm** the suggested address before submission.
3. Use the options **`allowNonVerifiedHouseNumber`** and **`allowNonVerifiedStreet`** to control how these cases are handled.

When non-verified elements are present, the result object includes a `nonVerifiedParts` array identifying which fields (like `street` or `housenumber`) are provisional.

**Example Response:**

```json
{
  "type": "Feature",
  "properties": {
    "address_line1": "Bürgermeister-Heinrich-Straße 60",
    "address_line2": "93077 Bad Abbach, Germany",
    "housenumber": "60",
    "nonVerifiedParts": [
      "housenumber"
    ]
  }
}
```

The library ensures that **GPS coordinates remain accurate**, even for non-verified entries.
These fields are automatically marked with a `"non-verified"` CSS class, allowing developers to style or flag them in the UI.

This provides both **data transparency** and **flexibility**, letting you inform users when address data might not be fully validated while still offering the most complete search experience possible.

### `allowNonVerifiedStreet`

Allows the autocomplete to include **non-verified street names** in address suggestions.  
By default, the autocomplete returns only verified street data.  
However, enabling this option ensures that new or unconfirmed streets — often found in developing areas or new housing projects — can still appear in the search results.

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    allowNonVerifiedStreet: true // include approximate or new street names
  }
);
```

When enabled, the result object may contain a `nonVerifiedParts` array indicating that the `street` component is not yet fully verified.
These streets are highlighted with a `"non-verified"` CSS class in the rendered suggestions, making them easy to visually distinguish.

Use this option when your users need to find **recently built or unofficial streets**, especially in regions where address data is frequently updated or incomplete.

### `addCategorySearch`

Enables **category-based place search** in addition to address autocomplete.  
When activated, the input field can return **points of interest (POIs)** such as restaurants, cafes, hotels, gas stations, and more — powered by the [Geoapify Places API](https://www.geoapify.com/places-api/).

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true, // allow searching by place categories
    placesFilter: {
      circle: { lon: -74.006, lat: 40.7128, radiusMeters: 5000 } // 5 km around New York
    }
  }
);
```

Category search is useful for implementing features such as:

* “Find nearby” or “Search around me”
* Location-based discovery for maps and local directories
* Showing nearby amenities or business listings

> **Tip:** Category search always works relative to a location or bounding area.
> Make sure to provide a **filter** or **bias** (for example, using user geolocation, IP location, or current map view) to focus the search.

### `showPlacesList`

Controls whether a **built-in places list** is displayed under the autocomplete field when category search is enabled.  
When active, matching POIs (points of interest) are automatically shown in a scrollable list that includes names, addresses, and opening hours.

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    showPlacesList: true // display built-in places list
  }
);
```

The built-in list simplifies implementation for most projects by providing a ready-to-use UI for category search results.
If you prefer to create your own custom layout, set `showPlacesList: false` and handle results manually using the `places` event.


### `hidePlacesListAfterSelect`

Determines whether the **places list** (shown when `showPlacesList` is enabled) should automatically hide after the user selects a place.  
This helps keep the interface clean after a successful selection, especially on mobile devices or compact layouts.

**Type:** `boolean`  
**Default:** `false`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    showPlacesList: true,
    hidePlacesListAfterSelect: true // hide list after user clicks a place
  }
);
```

Enable this when your design requires **single-selection behavior** — for example, when users choose a destination or location and should immediately proceed to the next step.

### `enablePlacesLazyLoading`

Controls whether the **places list** supports **lazy loading** — automatically fetching additional results as the user scrolls.  
This allows users to explore more POIs without needing to manually trigger additional requests.

**Type:** `boolean`  
**Default:** `true`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    showPlacesList: true,
    enablePlacesLazyLoading: true // load more places while scrolling
  }
);
```

Keep this enabled to provide a smooth, **infinite-scroll experience** for category search results.
You can disable it if you prefer to manage pagination manually or display a limited set of results.

### `placesLimit`

Specifies the **maximum number of places** retrieved per request when category search is enabled.  
This setting controls the **page size** of results in the built-in places list or your custom implementation.

**Type:** `number`  
**Default:** `20`

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    showPlacesList: true,
    placesLimit: 50 // fetch up to 50 places per request
  }
);
```

Adjust `placesLimit` to balance **performance** and **result variety**:

* A smaller limit ensures faster responses.
* A larger limit provides a broader overview of available places in one request.
  This setting is especially relevant when lazy loading is enabled.

### `placesFilter`

Defines spatial filters that restrict **where** the Places API searches for results.  
Use this option to focus category searches on a specific **geographic area** — for example, within a city, a bounding box, or a radius around the user’s location.

**Type:** object — accepts the following keys:  
- `circle`: [ByCircleOptions](#bycircleoptions)  
- `rect`: [ByRectOptions](#byrectoptions)  
- `place`: `string` — a place identifier or GeoJSON geometry string

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    placesFilter: {
      circle: { lon: -74.006, lat: 40.7128, radiusMeters: 5000 } // 5 km around NYC
    }
  }
);
```

Filters are especially useful when the search should be limited to a specific **map view**, **user’s detected position**, or **known region**.

### `placesBias`

Specifies a **spatial bias** to prioritize certain areas in place search results, without fully restricting the results to that area.  
This helps make search results more relevant to a user's location while still allowing broader matches.

**Type:** object — accepts the following keys:  
- `circle`: [ByCircleOptions](#bycircleoptions)  
- `rect`: [ByRectOptions](#byrectoptions)  
- `proximity`: [ByProximityOptions](#byproximityoptions)

**Example:**
```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    placesBias: {
      proximity: { lon: -118.2437, lat: 34.0522 } // prioritize results near Los Angeles
    }
  }
);
```

Use `placesBias` when you want to **influence search ranking** toward a certain location —
for instance, to show nearby restaurants or hotels first while still including other results in the region.


## Learn more
- See how to use these options in the [`GeocoderAutocomplete`](../geocoder-autocomplete/) constructor.
- Try live examples in the [Interactive Demos](../../live-demos/).