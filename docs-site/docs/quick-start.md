# Quick start

Add Geoapify Geocoder Autocomplete with a package manager or directly from a CDN.

## Get an API key

Create a Geoapify account and API key at [geoapify.com](https://www.geoapify.com/). The current free plan includes up to 3,000 address autocomplete requests per day; check the [pricing page](https://www.geoapify.com/pricing/) for current limits.

For a production website, restrict the key to the origins or referrers that should use it. See [Production guidance](production.md#protect-the-api-key).

## Install with npm

```bash
npm install @geoapify/geocoder-autocomplete
```

Import the constructor and one theme:

```javascript
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

const addressAutocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  'YOUR_API_KEY',
  {
    placeholder: 'Enter an address',
    limit: 5
  }
);
```

## Load from a CDN

Pin the major version so a future breaking release is not loaded unexpectedly:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@geoapify/geocoder-autocomplete@3/styles/minimal.css"
>
<script src="https://unpkg.com/@geoapify/geocoder-autocomplete@3/dist/index.min.js"></script>

<div id="autocomplete"></div>

<script>
  const addressAutocomplete = new autocomplete.GeocoderAutocomplete(
    document.getElementById('autocomplete'),
    'YOUR_API_KEY',
    {
      placeholder: 'Enter an address',
      limit: 5
    }
  );
</script>
```

The npm build exports `GeocoderAutocomplete` directly. The CDN UMD build exposes it as `autocomplete.GeocoderAutocomplete`.

## Add a container

The control renders inside an existing element:

```html
<div id="autocomplete" class="autocomplete-container"></div>
```

Give the container a width appropriate for your layout. The control creates its own positioned wrapper for the dropdown.

```css
.autocomplete-container {
  width: min(100%, 32rem);
}
```

## Listen for selection

```javascript
addressAutocomplete.on('select', (feature) => {
  if (!feature) {
    return;
  }

  console.log('Selected location:', feature);
});

addressAutocomplete.on('suggestions', (features) => {
  console.log('Suggestions:', features);
});
```

Programmatic `setValue()` calls only update the input; they do not issue a request or emit `input` or `select`.

## Enable category search

Category search uses the Geoapify Places API. Enable `showPlacesList` to render the built-in result list:

```javascript
const placesAutocomplete = new GeocoderAutocomplete(
  document.getElementById('places-autocomplete'),
  'YOUR_API_KEY',
  {
    addCategorySearch: true,
    showPlacesList: true,
    placesFilter: {
      circle: {
        lon: -74.006,
        lat: 40.7128,
        radiusMeters: 5000
      }
    }
  }
);
```

When `enablePlacesLazyLoading` is omitted, the list uses a **Load more** button. Set it to `true` for scroll-based loading.

## Clean up

Remove the control when its host page or framework component is unmounted:

```javascript
addressAutocomplete.destroy();
```

See [Lifecycle and errors](lifecycle-and-errors.md) for cancellation, request errors, custom request functions, and framework cleanup.

## Next steps

- [Options reference](api-reference/geocoder-autocomplete-options.md)
- [Methods and events](api-reference/geocoder-autocomplete.md)
- [Styling](styling.md)
- [Interactive demos](live-demos.md)
