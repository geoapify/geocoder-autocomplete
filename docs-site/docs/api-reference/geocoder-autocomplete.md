# GeocoderAutocomplete

This page documents the `GeocoderAutocomplete` class, including setup, configuration, events, and advanced features.
Use it to add address and place autocomplete to a web application. Applications that require a precise location should still ask the user to confirm the selected result.

## Constructor

```typescript
constructor(container: HTMLElement, 
            apiKey: string, 
            options?: GeocoderAutocompleteOptions)
```

Creates a new **GeocoderAutocomplete** instance and attaches the autocomplete input to a specified container element.

Here are the parameters you can pass to the constructor:

| Name        | Type                                                                              | Description                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `container` | `HTMLElement`                                                                     | The HTML element (usually a `<div>`) where the autocomplete input will be rendered. |
| `apiKey`    | `string`                                                                          | Your **Geoapify API key**, required for all API requests.                                                                                   |
| `options`   | [`GeocoderAutocompleteOptions`](geocoder-autocomplete-options.md) *(optional)* | A configuration object that controls autocomplete behavior, such as search filters, language, and category search.                          |

The `options` parameter lets you customize nearly every aspect of the autocomplete’s functionality — including filters, result limits, biasing rules, and category search.
See the full list of available options in the [GeocoderAutocompleteOptions documentation](geocoder-autocomplete-options.md).

Basic initialization:

```javascript
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';

const container = document.getElementById('autocomplete');

const autocomplete = new GeocoderAutocomplete(container, 'YOUR_API_KEY', {
  placeholder: 'Enter address...',
  lang: 'en',
  limit: 5
});
```

This creates a fully functional address autocomplete field inside the given container.
As the user types, it retrieves address suggestions in real time from the [Geoapify Address Autocomplete API](https://www.geoapify.com/address-autocomplete/).

## Methods

The `GeocoderAutocomplete` class provides a comprehensive set of public methods that let you configure, control, and extend the behavior of the autocomplete component at runtime.  

You can use these methods to:
- Update filters, bias, or search parameters dynamically;
- Change appearance and behavior (for example, language, type, icons);
- Programmatically open, close, or query the dropdown;
- Integrate custom request logic or hooks;
- Work with the Places and Category modes.

Each method listed below includes its signature, purpose, and (in the full reference) a usage example.  

Runtime setters change subsequent requests; they do not automatically repeat the current request. Places filter and bias setters also reset pagination to offset zero. After changing one, call `sendPlacesRequest()` if the active category should reload immediately.

| Method | Signature | Purpose |
|---|---|---|
| [`setType`](#settype) | `setType(type: LocationType \| null): void` | Restrict result type (granularity). |
| [`setLang`](#setlang) | `setLang(lang: SupportedLanguage \| null): void` | Set language of results. |
| [`setAddDetails`](#setadddetails) | `setAddDetails(addDetails: boolean): void` | Toggle fetching extra geometry/details. |
| [`setSkipIcons`](#setskipicons) | `setSkipIcons(skipIcons: boolean): void` | Show/hide icons in the dropdown. |
| [`setAllowNonVerifiedHouseNumber`](#setallownonverifiedhousenumber) | `setAllowNonVerifiedHouseNumber(value: boolean): void` | Include non-verified house numbers. |
| [`setAllowNonVerifiedStreet`](#setallownonverifiedstreet) | `setAllowNonVerifiedStreet(value: boolean): void` | Include non-verified streets. |
| [`setLimit`](#setlimit) | `setLimit(limit: number): void` | Max suggestions per query. |
| [`setPlacesLimit`](#setplaceslimit) | `setPlacesLimit(limit: number): void` | Page size for Places results. |
| [`setValue`](#setvalue) | `setValue(value: string): void` | Programmatically set input value. |
| [`getValue`](#getvalue) | `getValue(): string` | Read current input value. |
| [`addFilterByCountry`](#addfilterbycountry) | `addFilterByCountry(codes: ByCountryCodeOptions): void` | Hard-filter by country list. |
| [`addFilterByCircle`](#addfilterbycircle) | `addFilterByCircle(opts: ByCircleOptions): void` | Hard-filter by circle area. |
| [`addFilterByRect`](#addfilterbyrect) | `addFilterByRect(opts: ByRectOptions): void` | Hard-filter by rectangle. |
| [`addFilterByPlace`](#addfilterbyplace) | `addFilterByPlace(place: string): void` | Hard-filter by place/geometry id. |
| [`clearFilters`](#clearfilters) | `clearFilters(): void` | Remove all geocoder filters. |
| [`addBiasByCountry`](#addbiasbycountry) | `addBiasByCountry(codes: ByCountryCodeOptions): void` | Soft-bias by country list. |
| [`addBiasByCircle`](#addbiasbycircle) | `addBiasByCircle(opts: ByCircleOptions): void` | Soft-bias by circle area. |
| [`addBiasByRect`](#addbiasbyrect) | `addBiasByRect(opts: ByRectOptions): void` | Soft-bias by rectangle. |
| [`addBiasByProximity`](#addbiasbyproximity) | `addBiasByProximity(p: ByProximityOptions): void` | Soft-bias to a point. |
| [`clearBias`](#clearbias) | `clearBias(): void` | Remove all geocoder biases. |
| [`setPlacesFilterByCircle`](#setplacesfilterbycircle) | `setPlacesFilterByCircle(opts: ByCircleOptions): void` | Places hard-filter by circle. |
| [`setPlacesFilterByRect`](#setplacesfilterbyrect) | `setPlacesFilterByRect(opts: ByRectOptions): void` | Places hard-filter by rectangle. |
| [`setPlacesFilterByPlace`](#setplacesfilterbyplace) | `setPlacesFilterByPlace(place: string): void` | Places hard-filter by place id. |
| [`setPlacesFilterByGeometry`](#setplacesfilterbygeometry) | `setPlacesFilterByGeometry(geom: string): void` | Places hard-filter by geometry. |
| [`clearPlacesFilters`](#clearplacesfilters) | `clearPlacesFilters(): void` | Clear Places filters. |
| [`setPlacesBiasByCircle`](#setplacesbiasbycircle) | `setPlacesBiasByCircle(opts: ByCircleOptions): void` | Places soft-bias by circle. |
| [`setPlacesBiasByRect`](#setplacesbiasbyrect) | `setPlacesBiasByRect(opts: ByRectOptions): void` | Places soft-bias by rect. |
| [`setPlacesBiasByProximity`](#setplacesbiasbyproximity) | `setPlacesBiasByProximity(p: ByProximityOptions): void` | Places soft-bias to a point. |
| [`clearPlacesBias`](#clearplacesbias) | `clearPlacesBias(): void` | Clear Places biases. |
| [`setSuggestionsFilter`](#setsuggestionsfilter) | `setSuggestionsFilter(fn?: ((items:any[])=>any[]) \| null): void` | Post-filter suggestion list client-side. |
| [`setPreprocessHook`](#setpreprocesshook) | `setPreprocessHook(fn?: ((value:string)=>string) \| null): void` | Transform input before request. |
| [`setPostprocessHook`](#setpostprocesshook) | `setPostprocessHook(fn?: ((feature:any)=>string) \| null): void` | Transform display text per feature. |
| [`setSendGeocoderRequestFunc`](#setsendgeocoderrequestfunc) | `setSendGeocoderRequestFunc(fn?: ((value:string, self)=>Promise<any>) \| null): void` | Override geocoder request. |
| [`setSendPlaceDetailsRequestFunc`](#setsendplacedetailsrequestfunc) | `setSendPlaceDetailsRequestFunc(fn?: ((feature:any, self)=>Promise<any>) \| null): void` | Override place-details request. |
| [`setSendPlacesRequestFunc`](#setsendplacesrequestfunc) | `setSendPlacesRequestFunc(fn?: ((keys:string[], offset:number, self)=>Promise<any>) \| null): void` | Override Places request (category mode). |
| [`isOpen`](#isopen) | `isOpen(): boolean` | Dropdown open state. |
| [`close`](#close) | `close(): void` | Close dropdown. |
| [`open`](#open) | `open(): void` | Open dropdown (re-queries current input). |
| [`sendGeocoderRequest`](#sendgeocoderrequest) | `sendGeocoderRequest(value:string): Promise<any>` | Manually trigger geocoder request. |
| [`sendPlaceDetailsRequest`](#sendplacedetailsrequest) | `sendPlaceDetailsRequest(feature:any): Promise<any>` | Manually fetch details for a feature. |
| [`selectCategory`](#selectcategory) | `selectCategory(category: Category \| string \| string[] \| null): Promise<void>` | Activate a category (category mode). |
| [`clearCategory`](#clearcategory) | `clearCategory(): Promise<void>` | Exit category mode & reset list. |
| [`resendPlacesRequestForMore`](#resendplacesrequestformore) | `resendPlacesRequestForMore(append?: boolean): Promise<void>` | Fetch next page for Places list. |
| [`getCategory`](#getcategory) | `getCategory(): Category \| null` | Current category (if any). |
| [`selectPlace`](#selectplace) | `selectPlace(index: number \| null): void` | Select/clear a place in built-in list. |
| [`sendPlacesRequest`](#sendplacesrequest) | `sendPlacesRequest(): Promise<void>` | Load Places for current category. |
| [`destroy`](#destroy) | `destroy(): void` | Remove the component and all owned event listeners. |


### setType()

Signature: `setType(type: LocationType | null)`

Restricts autocomplete results to a **specific level of the address hierarchy**.  
Use this when your application only needs a particular type of result (for example, cities or postcodes).

**Type:** `'country' | 'state' | 'city' | 'postcode' | 'street' | 'amenity' | 'locality' | null`

**Example:**
```javascript
autocomplete.setType('city');
```

This limits suggestions to **city names only**, making it ideal for region or country selectors.


### setLang()

Signature: `setLang(lang: SupportedLanguage | null)`

Defines the **language of returned suggestions**.
Set this to localize addresses or display place names in a user’s preferred language.

**Type:** [`SupportedLanguage`](geocoder-autocomplete-options.md#lang)

**Example:**

```javascript
autocomplete.setLang('fr'); // show results in French
```

If the requested translation is unavailable, the API may return another supported name.


### setAddDetails()

Signature: `setAddDetails(addDetails: boolean)`

Enables or disables fetching **additional place details** such as geometry or administrative boundaries.
When `true`, it performs a secondary lookup via the [Geoapify Place Details API](https://www.geoapify.com/place-details-api/).

**Example:**

```javascript
autocomplete.setAddDetails(true);
```

Use this when your app needs **polygon or shape data** for selected features (for example, city boundaries or building footprints).


### setSkipIcons()

Signature: `setSkipIcons(skipIcons: boolean)`

Toggles whether icons are shown in the dropdown list.
Disabling icons can simplify or speed up rendering, especially in minimal UI designs.

**Example:**

```javascript
autocomplete.setSkipIcons(true);
```

Useful for clean text-only autocomplete fields where visual icons are unnecessary.


### setAllowNonVerifiedHouseNumber()

Signature: `setAllowNonVerifiedHouseNumber(value: boolean)`

Allows the autocomplete to retain a house number typed by the user when the API matched a broader feature but did not verify that number.

**Example:**

```javascript
autocomplete.setAllowNonVerifiedHouseNumber(true);
```

When enabled, non-verified parts appear in results with a `"non-verified"` class, so you can visually highlight them.


### setAllowNonVerifiedStreet()

Signature: `setAllowNonVerifiedStreet(value: boolean)`

Allows the autocomplete to retain a street typed by the user when the API matched a broader feature but did not verify that street.

**Example:**

```javascript
autocomplete.setAllowNonVerifiedStreet(true);
```

Non-verified streets are marked for UI distinction and transparency.

### setLimit()

Signature: `setLimit(limit: number)`

Specifies the **maximum number of autocomplete suggestions** returned per query.

**Example:**

```javascript
autocomplete.setLimit(10);
```

Default is `5`.
Increase this if you want to show more options, but note that large limits may increase API response size.


### setPlacesLimit()

Signature: `setPlacesLimit(limit: number)`

Sets the **page size** for the **Places API** results when category search is enabled.
This controls how many places are fetched per request in the built-in or custom list.

**Example:**

```javascript
autocomplete.setPlacesLimit(50);
```

A smaller limit improves response speed, while a larger one provides a broader result set.


### setValue()

Signature: `setValue(value: string)`

Sets the value of the autocomplete input programmatically. This method does not send a request and does not emit `input` or `select`.

**Example:**
```javascript
autocomplete.setValue('New York, USA');
```

This displays “New York, USA” in the autocomplete field without triggering a new search request.


### getValue()

Signature: `getValue()`

Returns the current value of the autocomplete input.

**Example:**

```javascript
const currentValue = autocomplete.getValue();
console.log(currentValue);
```

Useful for retrieving user input before form submission or integrating with external components.

### addFilterByCountry()

Signature: `addFilterByCountry(codes: ByCountryCodeOptions)`

Applies a **hard filter** limiting results to one or more specific countries.
Only addresses within the listed countries will appear in autocomplete suggestions.

**Type:** [`ByCountryCodeOptions`](geocoder-autocomplete-options.md#bycountrycodeoptions)

**Example:**

```javascript
autocomplete.addFilterByCountry(['us', 'ca']); // United States & Canada only
```

This is equivalent to setting a `filter` option at initialization but can be changed dynamically.

### addFilterByCircle()

Signature: `addFilterByCircle(opts: ByCircleOptions)`

Restricts autocomplete results to a **circular area**.
Useful for location-based search scenarios such as “addresses within 5 km of city center”.

**Type:** [`ByCircleOptions`](geocoder-autocomplete-options.md#bycircleoptions)

**Example:**

```javascript
autocomplete.addFilterByCircle({
  lon: -74.006,
  lat: 40.7128,
  radiusMeters: 5000
});
```

Only results within this 5 km radius around New York City will be displayed.

### addFilterByRect()

Signature: `addFilterByRect(opts: ByRectOptions)`

Filters results to a **rectangular bounding box**, defined by two corner coordinates.

**Type:** [`ByRectOptions`](geocoder-autocomplete-options.md#byrectoptions)

**Example:**

```javascript
autocomplete.addFilterByRect({
  lon1: -124.48,
  lat1: 32.53,
  lon2: -114.13,
  lat2: 42.01
});
```

This example restricts search results to the boundaries of **California, USA**.

### addFilterByPlace()

Signature: `addFilterByPlace(place: string)`

Restricts results to a specific **place or region** identified by its Geoapify Place ID.

**Example:**

```javascript
autocomplete.addFilterByPlace('51b4c20ae4b0324e12a4b92esdf4eghkhjl');
```

Use this when you need to limit searches to an administrative or custom-defined area.

### clearFilters()

Signature: `clearFilters()`

Removes all active **geocoder filters**, restoring global search scope.

**Example:**

```javascript
autocomplete.clearFilters();
```

After calling this method, results will no longer be restricted by country, circle, or bounding box.

### addBiasByCountry()

Signature: `addBiasByCountry(codes: ByCountryCodeOptions)`

Adds a **soft bias** to prioritize results from certain countries, without excluding others.
This is helpful for improving relevance in multi-country applications.

**Example:**

```javascript
autocomplete.addBiasByCountry(['us']);
```

Results from the United States will be ranked higher but not exclusively shown.

### addBiasByCircle()

Signature: `addBiasByCircle(opts: ByCircleOptions)`

Biases results toward a **specific circular area**, prioritizing addresses inside or near it.

**Example:**

```javascript
autocomplete.addBiasByCircle({
  lon: -74.006,
  lat: 40.7128,
  radiusMeters: 10000
});
```

Results within or near this 10 km area around NYC appear higher in suggestions.

### addBiasByRect()

Signature: `addBiasByRect(opts: ByRectOptions)`

Adds a **soft geographic bias** toward a rectangular region.

**Example:**

```javascript
autocomplete.addBiasByRect({
  lon1: -124.48,
  lat1: 32.53,
  lon2: -114.13,
  lat2: 42.01
});
```

Addresses within California will appear first, but results from nearby areas can still appear.

### addBiasByProximity()

Signature: `addBiasByProximity(p: ByProximityOptions)`

Prioritizes results **closest to a specific point**.
Commonly used to rank addresses near the user's current location or map center.

**Type:** [`ByProximityOptions`](geocoder-autocomplete-options.md#byproximityoptions)

**Example:**

```javascript
autocomplete.addBiasByProximity({
  lon: -122.4194,
  lat: 37.7749
});
```

In this example, results near **San Francisco** are shown first.

### clearBias()

Signature: `clearBias()`

Removes all currently applied **geocoder biases**, restoring neutral ranking for all autocomplete results.

**Example:**
```javascript
autocomplete.clearBias();
```

After calling this method, the autocomplete will stop prioritizing results near any previously set areas or countries.

### setPlacesFilterByCircle()

Signature: `setPlacesFilterByCircle(opts: ByCircleOptions)`

Applies a **hard filter** for Places API results within a circular area.
Useful for showing POIs (e.g., restaurants or hotels) inside a certain radius around a point.

**Type:** [`ByCircleOptions`](geocoder-autocomplete-options.md#bycircleoptions)

**Example:**

```javascript
autocomplete.setPlacesFilterByCircle({
  lon: -74.006,
  lat: 40.7128,
  radiusMeters: 5000 // 5 km around New York City
});
```

Only places located inside the specified circle are returned.

### setPlacesFilterByRect()

Signature: `setPlacesFilterByRect(opts: ByRectOptions)`

Applies a **rectangular bounding box filter** for Places API searches.

**Type:** [`ByRectOptions`](geocoder-autocomplete-options.md#byrectoptions)

**Example:**

```javascript
autocomplete.setPlacesFilterByRect({
  lon1: -118.67,
  lat1: 33.70,
  lon2: -117.66,
  lat2: 34.33
});
```

This restricts the search to the **Los Angeles metropolitan area**.

### setPlacesFilterByPlace()

Signature: `setPlacesFilterByPlace(place: string)`

Filters Places results by a **specific Geoapify Place ID or region identifier**.

**Example:**

```javascript
autocomplete.setPlacesFilterByPlace('51b4c20ae4b0324e12a4b92esdf4eghkhjl');
```

This limits results to POIs located within that predefined place or region.

### setPlacesFilterByGeometry()

Signature: `setPlacesFilterByGeometry(geom: string)`

Restricts Places API searches to a geometry previously created by a Geoapify API, such as an isoline.

Pass the Geoapify geometry ID. WKT and raw GeoJSON are not accepted by this filter.

**Example:**

```javascript
autocomplete.setPlacesFilterByGeometry('YOUR_ISOLINE_GEOMETRY_ID');
```

The filter affects the next Places request. Call `sendPlacesRequest()` to reload the current category after changing it.

### clearPlacesFilters()

Signature: `clearPlacesFilters()`

Removes all active **Places filters**, returning the search scope to global.

**Example:**

```javascript
autocomplete.clearPlacesFilters();
```

This restores full access to all POIs regardless of area.

### setPlacesBiasByCircle()

Signature: `setPlacesBiasByCircle(opts: ByCircleOptions)`

Adds a **soft bias** to prioritize Places API results within or near a circular area.

**Type:** [`ByCircleOptions`](geocoder-autocomplete-options.md#bycircleoptions)

**Example:**

```javascript
autocomplete.setPlacesBiasByCircle({
  lon: -74.006,
  lat: 40.7128,
  radiusMeters: 5000
});
```

Places inside this 5 km radius are ranked higher in the list but not exclusively returned.

### setPlacesBiasByRect()

Signature: `setPlacesBiasByRect(opts: ByRectOptions)`

Adds a **soft bias** toward POIs within a rectangular region.

**Type:** [`ByRectOptions`](geocoder-autocomplete-options.md#byrectoptions)

**Example:**

```javascript
autocomplete.setPlacesBiasByRect({
  lon1: -118.67,
  lat1: 33.70,
  lon2: -117.66,
  lat2: 34.33
});
```

Results from this region (Los Angeles area) are ranked higher, but global POIs may still appear.

### setPlacesBiasByProximity()

Signature: `setPlacesBiasByProximity(p: ByProximityOptions)`

Prioritizes Places API results near a **specific coordinate point**, typically the user’s location or map center.

**Type:** [`ByProximityOptions`](geocoder-autocomplete-options.md#byproximityoptions)

**Example:**

```javascript
autocomplete.setPlacesBiasByProximity({
  lon: -122.4194,
  lat: 37.7749
});
```

This prioritizes results near **San Francisco**.

### clearPlacesBias()

Signature: `clearPlacesBias()`

Removes all **Places API biases**, restoring neutral result ranking.

**Example:**

```javascript
autocomplete.clearPlacesBias();
```

After calling this, Places results will no longer be influenced by location or proximity preferences.


### setSuggestionsFilter()

Signature: `setSuggestionsFilter(fn?: ((items: any[]) => any[]) | null)`

Defines a **client-side filter function** that post-processes suggestion results before they are displayed.  
This is useful for removing or reordering results dynamically, without modifying the server response.

**Parameters:**  
- `fn`: A function that takes an array of suggestion items and returns a filtered or modified array.  
- Pass `null` or omit to remove the filter.

**Example:**
```javascript
autocomplete.setSuggestionsFilter((items) =>
  items.filter(item => item.properties.country === 'Germany')
);
```

This will only display address suggestions located in Germany.

### setPreprocessHook()

Signature: `setPreprocessHook(fn?: ((value: string) => string) | null)`

Allows you to **transform user input before sending a request** to the Geoapify API.
Useful for sanitizing, normalizing, or adjusting values before autocomplete processing.

**Parameters:**

* `fn`: A function that receives the input string and returns a transformed version.

**Example:**

```javascript
autocomplete.setPreprocessHook((value) => value.trim().replace(/\s+/g, ' '));
```

This example removes extra spaces from user input before querying the API.

### setPostprocessHook()

Signature: `setPostprocessHook(fn?: ((feature: any) => string) | null)`

Lets you **transform or format how suggestions appear** in the dropdown list after they are fetched.
You can modify label text, append custom info, or apply your own formatting logic.

**Parameters:**

* `fn`: A function that takes each feature (GeoJSON object) and returns the display string.

**Example:**

```javascript
autocomplete.setPostprocessHook((feature) =>
  `${feature.properties.address_line1} (${feature.properties.country})`
);
```

This adds the country name next to each suggestion.

### setSendGeocoderRequestFunc()

Signature: `setSendGeocoderRequestFunc(fn?: ((value: string, self) => Promise<any>) | null)`

Overrides the **default geocoder request**.
You can define your own logic for fetching suggestions — for example, to use a caching layer, a proxy, or a custom API endpoint.

**Parameters:**

* `fn`: A function that receives the search text and the autocomplete instance. It must return a Promise resolving to a GeoJSON FeatureCollection with a `features` array.

**Example:**

```javascript
autocomplete.setSendGeocoderRequestFunc(async (value, self) => {
  return fetch(`/proxy/geocode?q=${encodeURIComponent(value)}`)
    .then(res => res.json());
});
```

This example replaces the direct API call with a proxied request.

### setSendPlaceDetailsRequestFunc()

Signature: `setSendPlaceDetailsRequestFunc(fn?: ((feature: any, self) => Promise<any>) | null)`

Overrides how **place details** are fetched after a user selects a result.
By default, Geoapify fetches extended metadata for OSM-based places — you can change or disable that.

**Parameters:**

* `fn`: A function that takes the selected feature and autocomplete instance. It returns a Promise with the enriched feature used for selection.

**Example:**

```javascript
autocomplete.setSendPlaceDetailsRequestFunc(async (feature) => {
  // Return custom details or skip
  return { ...feature, customInfo: 'Pre-fetched locally' };
});
```

### setSendPlacesRequestFunc()

Signature: `setSendPlacesRequestFunc(fn?: ((keys: string[], offset: number, self) => Promise<any>) | null)`

Overrides **Places API category search requests** — used when category search is enabled (`addCategorySearch: true`).
You can modify or fully replace the request logic to use a different data source or add caching.

**Parameters:**

* `fn`: A function that takes category keys, pagination offset, and the autocomplete instance. It must return a Promise resolving to a GeoJSON FeatureCollection with a `features` array.

**Example:**

```javascript
autocomplete.setSendPlacesRequestFunc(async (keys, offset) => {
  return fetch(`/places-api?category=${keys.join(',')}&offset=${offset}`)
    .then(res => res.json());
});
```

**Note:** If category mode is disabled (`addCategorySearch: false`), this function will not run.


### isOpen()

Signature: `isOpen()`

Returns whether the dropdown list with suggestions is currently open.

**Returns:**  
- `boolean` — `true` if the dropdown is visible, `false` otherwise.

**Example:**
```javascript
if (autocomplete.isOpen()) {
  console.log('Dropdown is open');
}
```

### close()

Signature: `close()`

Closes the currently open suggestions or places dropdown.
Useful when you want to hide the list manually (e.g., after user interaction outside the component).

**Example:**

```javascript
autocomplete.close();
```


### open()

Signature: `open()`

Reopens the dropdown list for the current input value, effectively **re-triggering** a request for suggestions if necessary.

**Example:**

```javascript
autocomplete.open();
```


### sendGeocoderRequest()

Signature: `sendGeocoderRequest(value: string): Promise<any>`

Sends a **manual geocoder API request** with the provided value.
Normally, the autocomplete handles this automatically on user input, but this method is useful for custom workflows or testing.

**Parameters:**

* `value`: The query string to search for.

**Returns:**

* `Promise<any>` resolving to a Geoapify Geocoder API response.

**Example:**

```javascript
autocomplete.sendGeocoderRequest('Berlin, Germany')
  .then(result => console.log(result));
```

### sendPlaceDetailsRequest()

Signature: `sendPlaceDetailsRequest(feature: any): Promise<any>`

Fetches **additional place details** for a selected feature (address or POI).
By default, only OSM-based features support extended details.

**Parameters:**

* `feature`: The GeoJSON feature object returned from the autocomplete.

**Returns:**

* `Promise<any>` resolving to a feature with additional details.

**Example:**

```javascript
autocomplete.sendPlaceDetailsRequest(selectedFeature)
  .then(details => console.log(details.properties));
```

### selectCategory()

Signature: `selectCategory(category: Category | string | string[] | null): Promise<void>`

Activates a **Places category search mode**.
You can pass a category key (or multiple keys) — such as `"restaurant"` or `"park"` — to load nearby results using the Places API.

**Parameters:**

* `category`: The category key(s) or a full `Category` object.

**Example:**

```javascript
await autocomplete.selectCategory('restaurant');
```

**Note:**
Category mode must be enabled via `addCategorySearch: true`.


### clearCategory()

Signature: `clearCategory(): Promise<void>`

Clears the current category selection and exits category mode.
This resets the places list. It does not change the current input value.

**Example:**

```javascript
await autocomplete.clearCategory();
```


### resendPlacesRequestForMore()

Signature: `resendPlacesRequestForMore(append?: boolean): Promise<void>`

Loads Places results for the current category. With `append: true`, it requests the page at the current offset and appends unique results. With `false` or no argument, it resets the offset to zero and replaces the list.

**Parameters:**

* `append` (optional): Append the next page when `true`; restart at the first page when false or omitted.

**Example:**

```javascript
try {
  await autocomplete.resendPlacesRequestForMore(true);
} catch (error) {
  console.error('Could not load more places', error);
}
```

The returned Promise rejects if the request or response validation fails. The `places` event receives the complete accumulated list after an append, not only the new page.

### getCategory()

Signature: `getCategory(): Category | null`

Returns the currently active category (if any).
Useful to check which category mode is active at runtime.

**Example:**

```javascript
const current = autocomplete.getCategory();
console.log(current?.label);
```

### selectPlace()

Signature: `selectPlace(index: number | null): void`

Programmatically highlights or clears a place in the built-in Places list.
This only works when the built-in list (`showPlacesList: true`) is active. It does not emit `place_select`; that event represents a user click.

**Parameters:**

* `index`: The numeric index of the place to select, or `null` to clear.

**Example:**

```javascript
autocomplete.selectPlace(0); // Select first place in list
```

### sendPlacesRequest()

Signature: `sendPlacesRequest(): Promise<void>`

Triggers a first-page Places API request for the currently active category and filters, replacing the current list. Use it to reload results after changing a Places filter or bias.

**Example:**

```javascript
await autocomplete.sendPlacesRequest();
```

### destroy()

Signature: `destroy(): void`

Cancels active request lifecycles, removes the component from the DOM, and unregisters its input, clear-button, document, and Places scroll listeners. Active lifecycle end events are emitted with `(false, null, { cancelled: true })` before callbacks are cleared. Calling `destroy()` more than once is safe.

```javascript
autocomplete.destroy();
```

Call `destroy()` from your framework's unmount or cleanup hook. See [Lifecycle and errors](../lifecycle-and-errors.md#cleanup).

## Listening For Events

The `GeocoderAutocomplete` component emits various **lifecycle and interaction events** — for example, when a request starts, suggestions are received, or a user selects a result.

You can use the following methods to **subscribe**, **unsubscribe**, or **listen once** to these events:

| Function | Signature | Purpose |
|-----------|------------|----------|
| [`on`](#on) | `on(event: GeocoderEventType, cb: (...params:any[])=>any): void` | Subscribe to an event. |
| [`off`](#off) | `off(event: GeocoderEventType, cb?: (...params:any[])=>any): void` | Unsubscribe from an event (optionally for a specific callback). |
| [`once`](#once) | `once(event: GeocoderEventType, cb: (...params:any[])=>any): void` | Subscribe to an event for a single invocation (auto-unsubscribed after first trigger). |

### `on()`

Registers an **event listener** that will be called whenever the specified event is triggered.  
You can use this to respond to input changes, new suggestions, place selections, or request status updates.

**Parameters:**  
- `event`: The name of the event (a value of `GeocoderEventType`).  
- `cb`: Callback function that receives event-specific data.

**Example:**
```javascript
autocomplete.on('select', (feature) => {
  console.log('User selected:', feature.properties.formatted);
});

autocomplete.on('request_start', (query) => {
  console.log('Searching for:', query);
});
```

Common event names include:

* `request_start` — when a geocoder request is initiated.
* `request_end` — when results are received, fail, or are cancelled.
* `suggestions` — when new autocomplete suggestions are available.
* `select` — when the user selects a result.
* `clear` — when the input or category is cleared.
* `open` / `close` — when the dropdown opens or closes.
* `places_request_start` / `places_request_end` — for category search requests.

### `off()`

Removes a previously registered event listener.
If no callback is provided, **all listeners for that event** are removed.

**Parameters:**

* `event`: The event name.
* `cb` (optional): The specific callback function to remove.

**Example:**

```javascript
const onSelect = (f) => console.log('Selected:', f);
autocomplete.on('select', onSelect);

// Later, stop listening
autocomplete.off('select', onSelect);
```

### `once()`

Registers a **one-time listener** that is automatically unsubscribed after being triggered once.
Useful for initialization or one-time actions such as analytics tracking or setup confirmation.

**Parameters:**

* `event`: The event name.
* `cb`: The callback function to execute once.

**Example:**

```javascript
autocomplete.once('open', () => {
  console.log('Dropdown opened for the first time!');
});
```

These event hooks make it easy to **connect the autocomplete to your app logic**, such as updating a map marker, validating user input, or displaying request status.

### Events (names & payloads)

The following table lists all supported event names, payloads, and trigger conditions.
These events let you respond to user actions, geocoder lifecycle stages, and category-based place searches.

| Event | Payload | Fired when… |
|---|---|---|
| `input` | `string` (current input) | User types in the autocomplete field. |
| `request_start` | `string` (query) | Geocoder request is about to be sent. |
| `request_end` | `(success: boolean, data?: any, error?: any)` | Geocoder response succeeds, fails, or is cancelled. |
| `suggestions` | `GeoJSON.Feature[]` | New autocomplete suggestions are available. |
| `select` | `GeoJSON.Feature \| null` | User selects a suggestion or clears the selection. |
| `place_details_request_start` | `GeoJSON.Feature` | Place Details request initiated. |
| `place_details_request_end` | `(success: boolean, data?: GeoJSON.Feature, error?: any)` | Place Details request succeeds, fails, or is cancelled. |
| `open` | `true` | Dropdown is rendered. |
| `close` | `false` | Dropdown is closed. |
| `clear` | `'address' \| 'category'` | Address or category field cleared. |
| `places_request_start` | `Category` | Places API request started (in category search mode). |
| `places_request_end` | `(success: boolean, data?: any, error?: any)` | Places response succeeds, fails, or is cancelled. |
| `places` | `GeoJSON.Feature[]` | Places list updated (in category mode). |
| `place_select` | `(place: GeoJSON.Feature, index: number)` | Place selected from the built-in list. |


**Example: Listening to request and selection events**

```javascript
autocomplete.on('request_start', (query) => {
  console.log('Request started for:', query);
});

autocomplete.on('request_end', (success, data, error) => {
  if (success) console.log('Got results:', data.features.length);
  else if (error?.cancelled) console.log('Request cancelled');
  else console.error('Request failed:', error);
});

autocomplete.on('select', (feature) => {
  if (feature) {
    console.log('Selected:', feature.properties.formatted);
  } else {
    console.log('Selection cleared');
  }
});
```

**Example: Handling Places API and category mode events**

```javascript
autocomplete.on('places_request_start', (category) => {
  console.log('Loading places for:', category.label);
});

autocomplete.on('places_request_end', (success, data, error) => {
  if (success) console.log('Places loaded:', data.features.length);
  else if (!error?.cancelled) console.error('Places failed:', error);
});

autocomplete.on('place_select', (place, index) => {
  console.log(`Selected place #${index}:`, place.properties.name);
});
```

> **Note:**
> Every request lifecycle that emits a start event emits one matching end event. A superseded or destroyed request ends with `(false, null, { cancelled: true })`. Treat cancellation as expected control flow rather than a request failure.
>
> After paginated Places results are appended, `places` contains the full accumulated, de-duplicated list.


## Learn more

* Explore available configuration parameters in the [GeocoderAutocompleteOptions reference](geocoder-autocomplete-options.md).
* Check the [Quick Start guide](../quick-start.md) to see how to set up your first autocomplete field.
* Try live examples in the [Interactive Demos](../live-demos.md).
