Follow these steps to quickly add the **Geoapify Geocoder Autocomplete** to your web project.
You’ll install the library, include the styles, and create your first working address autocomplete field powered by the [Geoapify Address Autocomplete API](https://www.geoapify.com/address-autocomplete/).

## Installation

The **Geoapify Geocoder Autocomplete** library can be added to your project either via a **package manager** (recommended for web applications and build systems) or via a **CDN link** (ideal for CMS platforms or quick integration without a build step).

### Option 1: Install via NPM or Yarn

Install the package using your preferred package manager:

```bash
npm install @geoapify/geocoder-autocomplete
# or
yarn add @geoapify/geocoder-autocomplete
```

Then import the library and stylesheet in your project:

```javascript
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css'; // Available styles: minimal.css | minimal-dark.css | round-borders.css | round-borders-dark.css
```

This method is recommended for applications built with frameworks such as **React**, **Vue**, **Angular**, or **Svelte**, and for bundlers like **Vite**, **Webpack**, or **Rollup**.

### Option 2: Use from CDN (UMD build)

If you are integrating the autocomplete directly into an HTML page or a CMS (e.g., WordPress, Drupal), you can include the prebuilt **UMD module** and stylesheet from a CDN such as [UNPKG](https://unpkg.com/):

```html
<html>
  <head>
    <script src="https://unpkg.com/@geoapify/geocoder-autocomplete@latest/dist/index.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@geoapify/geocoder-autocomplete@latest/styles/minimal.css">
  </head>
  <!-- Page content -->
</html>
```

This approach loads the library directly in the browser, making it suitable for static sites, CMS-based websites, or when you need a lightweight integration without a build pipeline.

## Getting a Geoapify API Key

To use the Geoapify API for address search and autocomplete, you need an API key.
You can **register for free** and get your key at [geoapify.com](https://www.geoapify.com/).

Geoapify offers a flexible [Freemium pricing model](https://www.geoapify.com/pricing/) — the **Free plan** includes up to **3,000 autocomplete requests per day**, allowing you to start building and testing right away. You can easily upgrade later as your application scales.


## Using `@geoapify/geocoder-autocomplete` in Your Project

Follow the steps below to integrate the Geoapify Geocoder Autocomplete into your project.


### Step 1. Add a container

Add an element to your webpage where the autocomplete input will be rendered.
The container should have `position: relative` or `position: absolute` to ensure proper dropdown placement.

```html
<div id="autocomplete" class="autocomplete-container"></div>
```

```css
.autocomplete-container {
  position: relative;
}
```

### Step 2. Initialize the autocomplete

```javascript
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';

// When installed via npm or yarn, GeocoderAutocomplete is imported directly.
// When loaded from CDN, use "autocomplete.GeocoderAutocomplete" instead.
const addressAutocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  { /* Geocoder options */ }
);

addressAutocomplete.on('select', (location) => {
  // Handle selected location
});

addressAutocomplete.on('suggestions', (suggestions) => {
  // Handle suggestion updates
});

```

### Step 3. Listen for address suggestions and selection

Use event listeners to respond to user actions, such as selecting an address or receiving new suggestions.

```javascript
addressAutocomplete.on('select', (location) => {
  // Triggered when the user selects a location from the dropdown
  console.log('Selected location:', location);
});

addressAutocomplete.on('suggestions', (suggestions) => {
  // Triggered whenever new suggestions are available
  console.log('Suggestions:', suggestions);
});
```

## Category Search and Places List

The **Geoapify Geocoder Autocomplete** library can also perform **category-based place searches** using the [Geoapify Places API](https://www.geoapify.com/places-api/).
This feature allows users to find **points of interest (POIs)** such as restaurants, cafes, hotels, parks, or stores — in addition to standard address lookup.


### When It’s Useful

Category search is ideal for:

* Building “Find nearby” or “Explore around me” features.
* Showing local amenities or businesses on a map.
* Adding category-based discovery to your forms or map interface.
* Enhancing location-based search experiences with dynamic data.


### Enable Category Search

To enable category-based search, set the `addCategorySearch` option.

```javascript
const autocomplete = new GeocoderAutocomplete(
  document.getElementById("autocomplete"),
  "YOUR_API_KEY",
  {
    addCategorySearch: true,
    placesFilter: {
      circle: { lon: -74.006, lat: 40.7128, radiusMeters: 5000 }, // 5 km around New York City center
    },
  }
);
```

When users type a category name (e.g., *restaurant*, *gas station*), the autocomplete shows category suggestions alongside address results.
If `showPlacesList` is enabled, matching places are automatically displayed below the input field.

## Next Steps

You’ve successfully added **Geoapify Geocoder Autocomplete** to your project!
From here, you can explore advanced configuration options, customize filters and bias, or enable category-based place search.

Check out more resources to continue building:

* [API Reference](../api-reference/) — full list of options, methods, and events
* [Playground](https://apidocs.geoapify.com/playground/geocoding/#autocomplete) — experiment with live API requests
* [Places API](https://www.geoapify.com/places-api/) — discover how to integrate place and category search

With Geoapify, you can create intuitive, location-aware interfaces that make address entry and place discovery simple and reliable.
