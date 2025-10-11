## Using `@geoapify/geocoder-autocomplete` in your project
Follow the steps below to seamlessly integrate `@geoapify/geocoder-autocomplete` into your project.

### STEP 1. Prepare your webpage
Incorporate a container element into your webpage where the autocomplete input will be seamlessly integrated, utilizing the full width of the specified element:

```html
<div id="autocomplete" class="autocomplete-container"></div>
```
The container element must have `position: absolute` or `position: relative`
```css
.autocomplete-container {
    position: relative;
}
```
### STEP 2. Initialize the autocomplete field

* **Option 1**. Import the Geocoder Autocomplete types when you use it as a module:
```javascript
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';

const autocomplete = new GeocoderAutocomplete(
                        document.getElementById("autocomplete"), 
                        'YOUR_API_KEY', 
                        { /* Geocoder options */ });

autocomplete.on('select', (location) => {
    // check selected location here 
});

autocomplete.on('suggestions', (suggestions) => {
    // process suggestions here
});
```

* **Option 2**. Refer to the Geocoder Autocomplete as `autocomplete` when you added it as a script:
```javascript
const autocompleteInput = new autocomplete.GeocoderAutocomplete(
                        document.getElementById("autocomplete"), 
                        'YOUR_API_KEY', 
                        { /* Geocoder options */ });

autocompleteInput.on('select', (location) => {
    // check selected location here 
});

autocompleteInput.on('suggestions', (suggestions) => {
    // process suggestions here
});
```
### STEP 3. Add the Autocomplete Input styles:
We provide several Themes within the library: 
* `minimal` and `round-borders` - for webpages with light background color
* `minimal-dark` and `round-borders-dark` for webpages with dark background color. 

You can import the appropriate css-file to your styles:
```css
 @import "~@geoapify/geocoder-autocomplete/styles/minimal.css";
```
or as a link in a HTML-file:
```html
<link rel="stylesheet" type="text/css" href="https://unpkg.com/@geoapify/geocoder-autocomplete@latest/styles/minimal.css">

<!--
or
<link rel="stylesheet" type="text/css" href="https://unpkg.com/@geoapify/geocoder-autocomplete@latest/styles/minimal-dark.css">
or 
<link rel="stylesheet" type="text/css" href="https://unpkg.com/@geoapify/geocoder-autocomplete@latest/styles/round-borders.css">
or 
<link rel="stylesheet" type="text/css" href="https://unpkg.com/@geoapify/geocoder-autocomplete@latest/styles/round-borders-dark.css">

-->
```

## Transitioning from 1.x: Replacing `skipDetails` with `addDetails`

When transitioning from the 1.x version of the library to the 2.x version, it's important to note that the `skipDetails` option has been replaced by the `addDetails` option. This change enhances the clarity of the parameter, as it now explicitly indicates whether you want to include or exclude additional details in the search results. To maintain compatibility with the updated version, make sure to adjust your code accordingly by using the `addDetails` option when needed for your address search functionality.

So, if you require place details in your search results, you should set the `addDetails` option to `true`.

## Category Search and Places List

### Enable Category Search
```javascript
const autocomplete = new GeocoderAutocomplete(
    document.getElementById("autocomplete"), 
    'YOUR_API_KEY', 
    { 
        addCategorySearch: true,
        showPlacesList: true  // Optional: show built-in places list
    });
```

### Custom Places List
```javascript
const autocomplete = new GeocoderAutocomplete(
    document.getElementById("autocomplete"), 
    'YOUR_API_KEY', 
    { 
        addCategorySearch: true,
        showPlacesList: false  // Disable built-in, use custom
    });

autocomplete.on('places', (places) => {
    // Handle places results with your custom implementation
    // See demo/leaflet-places-custom for complete example
});
```
