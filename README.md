# Geoapify Geocoder Autocomplete

The Geoapify Geocoder Autocomplete is a JavaScript (TypeScript) library designed to enhance web applications and HTML pages by adding advanced **address autocomplete** functionality and **address autofill** input fields. It harnesses the power of the [Geoapify Geocoding API](https://www.geoapify.com/geocoding-api/) to provide accurate and efficient address search capabilities, making it an essential tool for enhancing the geolocation services of web-based applications.

![Geocoder Autocomplete](https://github.com/geoapify/geocoder-autocomplete/blob/9b46b3e458d18b45e2957298e8833f830ed6252a/img/address-autocomplete-example.png?raw=true)

## Table of Contents
1. [Overview](#geoapify-geocoder-autocomplete)
2. [Features](#features)
3. [Live Demos](#live-demos)
4. [Getting Geoapify API key](#getting-geoapify-api-key)
5. [Installation](#installation)
6. [Usage](#using-geoapifygeocoder-autocomplete-in-your-project)
7. [API Methods](#methods)
8. [Styling](#styling)
9. [Working with non-verified address components](#working-with-non-verified-address-components)
10. [Contributions and Support](#contributions-and-support)

## Features
* **Customizable Address Input**: Easily embed address input fields within your web application by adding them to provided HTML containers (e.g., `DIV` elements), allowing for flexible integration and styling.
* **API Integration Flexibility**: By default, the library seamlessly connects to the [Geoapify Address Autocomplete API](https://www.geoapify.com/address-autocomplete/) to retrieve address suggestions. However, developers have the freedom to integrate and combine other third-party Address Search APIs, allowing for extensive customization and the incorporation of multiple data sources.
* **Search Customization**: Tailor your address search with precision by adding filters and bias parameters. This level of customization empowers developers to fine-tune search queries, ensuring more accurate and relevant address suggestions for users.
* **Structured Address Forms**: Utilize the type parameter to craft address input forms that enable users to enter structured addresses, including postal codes, cities, countries, address lines, and more.
* **Place Details Integration**: Optionally, the library can call the [Geoapify Place Details API](https://www.geoapify.com/place-details-api/), providing users with detailed city and building boundaries as part of the search results. This enhances location context and visualization for a richer user experience.
* **Customizable Look-and-Feel**: Tailor the appearance of the address input and autocomplete suggestions effortlessly. The library offers four distinct styles for both light and dark themes, providing design flexibility. Moreover, developers can further fine-tune the visual aspects using CSS classes to achieve a seamless integration with their application's aesthetics.
* **Zero Dependencies**: The library is intentionally built with zero external dependencies. This means that it operates independently and does not rely on external libraries or packages. 

## Live Demos

Try the address autocomplete in the Playground. Experiment with different options, such as geocoding, biasing results, and more, to see how the autocomplete behavior adapts:
* [Playground](https://apidocs.geoapify.com/playground/geocoding/#autocomplete)

### JSFiddle demos

A live example of the address autocomplete field integrated with map libraries:
* [JSFiddle demo: Address Field + Leaflet Map](https://jsfiddle.net/Geoapify/jsgw53z8/)
* [JSFiddle demo: Address Field + MapLibreGL map](https://jsfiddle.net/Geoapify/sf3hp2a6/)

A simple address form demos showcasing how to implement address search and autocomplete for user input:
* [JSFiddle demo: Address Form 1](https://jsfiddle.net/Geoapify/t0eg541k/)
* [JSFiddle demo: Address Form 2](https://jsfiddle.net/Geoapify/stgek5wf/)

This example demonstrates obtaining precise address details for shipping and delivery:
* [JSFiddle demo: Getting precise location for Shipping](https://jsfiddle.net/Geoapify/g9xhcye0/)

> **⚠️ Warning**: While address autocomplete can help users quickly select locations, it is important to note that no autocomplete service provides 100% coverage or guaranteed precision. For critical use cases like shipping or delivery, it is essential to verify and confirm the location.
>
> **Here’s how you can ensure accuracy**:
> 1. After selecting an address, display a map or marker to show the user's selected location.
> 2. Prompt the user to confirm the address details, including street, city, and postal code.
> 3. Optionally, use reverse geocoding to verify the location after selecting the address. You can also use [Geoapify Reverse Geocoding API](https://www.geoapify.com/reverse-geocoding-api/) to confirm the precise location.

This code demonstrates how to set up a custom geocoding function. It customizes the autocomplete input to return countries, states, cities, and counties based on user input, using Geoapify’s Address Autocomplete API:
* [JSFiddle demo: Custom Geocoding Function](https://jsfiddle.net/Geoapify/916oxfja/)


### Local Demos Collection

This repository includes a comprehensive collection of working demos that you can run locally:
* [Demo Collection Overview](demo/demo-index.html) - Navigate to all available demos
* [Basic Address Form](demo/basic/index.html) - Multi-field address input with validation
* [Leaflet Integration](demo/leaflet/index.html) - Interactive map with address search and markers
* [MapLibre GL Integration](demo/maplibre/index.html) - Vector map with reverse geocoding on click

## Getting Geoapify API key
In case you decide to use Geoapify API to search addresses, you'll need to obtain an API key. 

Register for free and obtain your API key at [myprojects.geoapify.com](https://myprojects.geoapify.com/). Geoapify offers a flexible [Freemium pricing model](https://www.geoapify.com/pricing/) that allows you to begin using our services at no cost and seamlessly scale your usage as your needs grow.

## Installation
Start enhancing your web applications today with `@geoapify/geocoder-autocomplete`:

### Option 1
Install  the Geocoder Autocomplete package with NPM or Yarn project manager:

```
npm install @geoapify/geocoder-autocomplete
# or 
yarn add @geoapify/geocoder-autocomplete
```
### Option 2
Refer to the Geocoder Autocomplete library as a UMD module (for CMS websites, including WordPress):
```html
<html>
    <head>
        <script src=".../index.min.js"></script>
        <link rel="stylesheet" type="text/css" href=".../minimal.css">
        ...
    </head>
...
</html>
```

You can use [UNPKG](https://unpkg.com/) to refer or download the library:

```https://unpkg.com/@geoapify/geocoder-autocomplete@latest/dist/index.min.js```

```https://unpkg.com/@geoapify/geocoder-autocomplete@latest/styles/minimal.css```

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
## Documentation

Below, you'll find `@geoapify/geocoder-autocomplete`'s detailed documentation, usage examples, advanced features, and more. You'll find the information you need to seamlessly integrate address autocomplete and enhance your web-based geolocation services and user experiences.
### Creation

| Option | Type | Description |
| ------ | ------ | ------ |
| constructor | *GeocoderAutocomplete(<HTMLElement> el, <String> geoapifyApiKey, <GeocoderAutocompleteOptions> options?)* | *GeocoderAutocomplete(document.getElementById('autocomplete'), 'sdf45dfg68879fhsdgs346dfhdj', { lang: 'it' }*

### GeocoderAutocompleteOptions
| Option | Type | Description |
| ------ | ------ | ------ |
| type | `country`, `state`, `city`, `postcode`, `street`, `amenity` | Type of the location |
| lang | LanguageCode | Results language |
| limit | number | The maximal number of returned suggestions |
| placeholder | string | An input field placeholder |
| debounceDelay | number | A delay between user input and the API call to prevent unnecessary calls. The default value is 100ms. |
| skipIcons | boolean | Don't add icons to suggestions |
| addDetails | boolean | Call Place Details API on selection change to get the place details. For example, opening hours or boundary |
| skipSelectionOnArrowKey | boolean | Don't choose the location with the arrow keys |
| filter | FilterOptions | Filter places by country, boundary, circle, place |
| bias | BiasOptions | Prefer places by country, boundary, circle, location |
| allowNonVerifiedHouseNumber | boolean | Allow the addition of house numbers that are not verified by the Geocoding API or missing in the database. Check the *"Working with non-verified values"* section for details. | 
| allowNonVerifiedStreet | boolean | Allow the addition of streets that are not verified by the Geocoding API or missing in the database. Check the *"Working with non-verified values"* section for details. |

#### LanguageCode
2-character [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code: `ab`, `aa`, `af`, `ak`, `sq`, `am`, `ar`, `an`, `hy`, `as`, `av`, `ae`, `ay`, `az`, `bm`, `ba`, `eu`, `be`, `bn`, `bh`, `bi`, `bs`, `br`, `bg`, `my`, `ca`, `ch`, `ce`, `ny`, `zh`, `cv`, `kw`, `co`, `cr`, `hr`, `cs`, `da`, `dv`, `nl`, `en`, `eo`, `et`, `ee`, `fo`, `fj`, `fi`, `fr`, `ff`, `gl`, `ka`, `de`, `el`, `gn`, `gu`, `ht`, `ha`, `he`, `hz`, `hi`, `ho`, `hu`, `ia`, `id`, `ie`, `ga`, `ig`, `ik`, `io`, `is`, `it`, `iu`, `ja`, `jv`, `kl`, `kn`, `kr`, `ks`, `kk`, `km`, `ki`, `rw`, `ky`, `kv`, `kg`, `ko`, `ku`, `kj`, `la`, `lb`, `lg`, `li`, `ln`, `lo`, `lt`, `lu`, `lv`, `gv`, `mk`, `mg`, `ms`, `ml`, `mt`, `mi`, `mr`, `mh`, `mn`, `na`, `nv`, `nb`, `nd`, `ne`, `ng`, `nn`, `no`, `ii`, `nr`, `oc`, `oj`, `cu`, `om`, `or`, `os`, `pa`, `pi`, `fa`, `pl`, `ps`, `pt`, `qu`, `rm`, `rn`, `ro`, `ru`, `sa`, `sc`, `sd`, `se`, `sm`, `sg`, `sr`, `gd`, `sn`, `si`, `sk`, `sl`, `so`, `st`, `es`, `su`, `sw`, `ss`, `sv`, `ta`, `te`, `tg`, `th`, `ti`, `bo`, `tk`, `tl`, `tn`, `to`, `tr`, `ts`, `tt`, `tw`, `ty`, `ug`, `uk`, `ur`, `uz`, `ve`, `vi`, `vo`, `wa`, `cy`, `wo`, `fy`, `xh`, `yi`, `yo`, `za`.

#### FilterOptions
The Geocoder Autocomplete allows specify the following types of filters:

Name | Filter | Filter Value | Description | Examples
--- | --- | --- | --- | ---
By circle | *circle* | `{ lon: number ,lat: number, radiusMeters: number }`  | Search places inside the circle | `filter['circle'] = {lon: -87.770231, lat: 41.878968, radiusMeters: 5000}`
By rectangle | *rect* | `{ lon1: number ,lat1: number, lon2: number ,lat2: number}`  | Search places inside the rectangle | `filter['rect'] = {lon1: 89.097540, lat1: 39.668983, lon2: -88.399274, lat2: 40.383412}`
By country | *countrycode* | `CountyCode[]`  | Search places in the countries | `filter['countrycode'] = ['de', 'fr', 'es']`
By place | *place* | `string` | Search for places within a given city or postal code. For example, search for streets within a city. Use the 'place_id' returned by another search to specify a filter. | `filter['place'] = '51ac66e77e9826274059f9426dc08c114840f00101f901dcf3000000000000c00208'`

You can provide filters as initial options or add by calling a function:
```
    options.filter = {
        'circle': {lon: -87.770231, lat: 41.878968, radiusMeters: 5000}
    };

    // or

    autocomplete.addFilterByCircle({lon: -87.770231, lat: 41.878968, radiusMeters: 5000});

```

You can combine several filters (but only one of each type) in one request. The **AND** logic is applied to the multiple filters.

#### BiasOptions
You can chage priority of the search by setting bias. The Geocoder Autocomplete allows specify the following types of bias: 

Name | Bias | Bias Value | Description | Examples
--- | --- | --- | --- | ---
By circle | *circle* | `{ lon: number ,lat: number, radiusMeters: number }`  | 	First, search places inside the circle, then worldwide | `bias['circle'] = {lon: -87.770231, lat: 41.878968, radiusMeters: 5000}`
By rectangle | *rect* | `{ lon1: number ,lat1: number, lon2: number ,lat2: number}`  | First, search places inside the rectangle, then worldwide | `bias['rect'] = {lon1: 89.097540, lat1: 39.668983, lon2: -88.399274, lat2: 40.383412}`
By country | *countrycode* | `CountyCode[]`  | First, search places in the countries, then worldwide | `bias['countrycode'] = ['de', 'fr', 'es']`
By location | *proximity* | `{lon: number ,lat: number}` | Prioritize results by farness from the location | `bias['proximity'] = {lon: -87.770231, lat: 41.878968}`

You can combine several bias parameters (but only one of each type) in one request. The OR logic is applied to the multiple bias.

NOTE! The default bias for the geocoding requests is "countrycode:auto", the API detects a country by IP address and provides the search there first. Set `bias['countrycode'] = ['none']` to avoid prioritization by country.

You can provide filters as initial options or add by calling a function:
```
    options.bias = {
        'circle': {lon: -87.770231, lat: 41.878968, radiusMeters: 5000},
        'countrycode': ['none']
    };

    // or

    autocomplete.addBiasByCircle({lon: -87.770231, lat: 41.878968, radiusMeters: 5000});

```
#### CountyCode

* Use 'auto' to detect the country by IP address;
* Use 'none' to skip;
* 2-digits [ISO 3166-1 Alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) country code: `ad`, `ae`, `af`, `ag`, `ai`, `al`, `am`, `an`, `ao`, `ap`, `aq`, `ar`, `as`, `at`, `au`, `aw`, `az`, `ba`, `bb`, `bd`, `be`, `bf`, `bg`, `bh`, `bi`, `bj`, `bm`, `bn`, `bo`, `br`, `bs`, `bt`, `bv`, `bw`, `by`, `bz`, `ca`, `cc`, `cd`, `cf`, `cg`, `ch`, `ci`, `ck`, `cl`, `cm`, `cn`, `co`, `cr`, `cu`, `cv`, `cx`, `cy`, `cz`, `de`, `dj`, `dk`, `dm`, `do`, `dz`, `ec`, `ee`, `eg`, `eh`, `er`, `es`, `et`, `eu`, `fi`, `fj`, `fk`, `fm`, `fo`, `fr`, `ga`, `gb`, `gd`, `ge`, `gf`, `gh`, `gi`, `gl`, `gm`, `gn`, `gp`, `gq`, `gr`, `gs`, `gt`, `gu`, `gw`, `gy`, `hk`, `hm`, `hn`, `hr`, `ht`, `hu`, `id`, `ie`, `il`, `in`, `io`, `iq`, `ir`, `is`, `it`, `jm`, `jo`, `jp`, `ke`, `kg`, `kh`, `ki`, `km`, `kn`, `kp`, `kr`, `kw`, `ky`, `kz`, `la`, `lb`, `lc`, `li`, `lk`, `lr`, `ls`, `lt`, `lu`, `lv`, `ly`, `ma`, `mc`, `md`, `me`, `mg`, `mh`, `mk`, `ml`, `mm`, `mn`, `mo`, `mp`, `mq`, `mr`, `ms`, `mt`, `mu`, `mv`, `mw`, `mx`, `my`, `mz`, `na`, `nc`, `ne`, `nf`, `ng`, `ni`, `nl`, `no`, `np`, `nr`, `nu`, `nz`, `om`, `pa`, `pe`, `pf`, `pg`, `ph`, `pk`, `pl`, `pm`, `pr`, `ps`, `pt`, `pw`, `py`, `qa`, `re`, `ro`, `rs`, `ru`, `rw`, `sa`, `sb`, `sc`, `sd`, `se`, `sg`, `sh`, `si`, `sj`, `sk`, `sl`, `sm`, `sn`, `so`, `sr`, `st`, `sv`, `sy`, `sz`, `tc`, `td`, `tf`, `tg`, `th`, `tj`, `tk`, `tm`, `tn`, `to`, `tr`, `tt`, `tv`, `tw`, `tz`, `ua`, `ug`, `um`, `us`, `uy`, `uz`, `va`, `vc`, `ve`, `vg`, `vi`, `vn`, `vu`, `wf`, `ws`, `ye`, `yt`, `za`, `zm`, `zw`.

Learn more about Geoapify Geocoder options on [Geoapify Documentation page](https://apidocs.geoapify.com/docs/geocoding).

### Methods

Here's a description of the API methods:

| Method                                  | Description                                                         |
|-----------------------------------------|---------------------------------------------------------------------|
| *setType(type: 'country' or 'state' or 'city' or 'postcode' or 'street' or 'amenity'): void* | Sets the type of location for address suggestions. |
| *setLang(lang: SupportedLanguage): void* | Sets the language for address suggestions. |
| *setCountryCodes(codes: CountyCode[]): void* | Sets specific country codes to filter address suggestions. |
| *setPosition(position: GeoPosition = {lat: number; lon: number}): void* | Sets the geographic position to influence suggestions based on proximity.|
| *setLimit(limit: number): void* | Sets the maximum number of suggestions to display. |
| *setValue(value: string): void* | Sets the value of the input field programmatically. |
| *getValue(): string* | Retrieves the current value of the input field. |
| *addFilterByCountry(codes: CountyCode[]): void* | Adds a filter to include or exclude suggestions based on specific country codes. |
| *addFilterByCircle(filterByCircle: ByCircleOptions = {lon: number; lat: number; radiusMeters: number }): void* | Adds a circular filter to include or exclude suggestions within a specified geographic area. |
| *addFilterByRect(filterByRect: ByRectOptions = { lon1: number; lat1: number; lon2: number; lat2: number}): void* | Adds a rectangular filter to include or exclude suggestions within a specified geographic area. |
| *addFilterByPlace(filterByPlace: string): void* | Adds a filter to include or exclude suggestions based on a specific place or location. |
| *clearFilters(): void* | Clears all previously added filters. |
| *addBiasByCountry(codes: CountyCode[]): void* | Adds a bias to prioritize suggestions from specific countries. |
| *addBiasByCircle(biasByCircle: ByCircleOptions = {lon: number; lat: number; radiusMeters: number }): void* | Adds a circular bias to prioritize suggestions within a specified geographic area. |
| *addBiasByRect(biasByRect: ByRectOptions = { lon1: number; lat1: number; lon2: number; lat2: number}): void* | Adds a rectangular bias to prioritize suggestions within a specified geographic area. |
| *addBiasByProximity(biasByProximity: ByProximityOptions = { lon: number; lat: number }): void* | Adds a bias based on proximity to a specific location. |
| *clearBias(): void* | Clears all previously added biases. |
| *setSuggestionsFilter(suggestionsFilterFunc?: (suggestions: GeoJSON.Feature[]) => GeoJSON.Feature[]): void* | Sets a custom filter function for suggestions. |
| *setPreprocessHook(preprocessHookFunc?: (value: string) => string): void* | Sets a preprocessing hook to modify the input value before sending a request. |
| *setPostprocessHook(postprocessHookFunc?: (value: string) => string): void* | Sets a post-processing hook to modify the suggestion values after retrieval. |
| *isOpen(): boolean* | Checks if the suggestions dropdown is currently open. |
| *close(): void* | Manually closes the suggestions dropdown. |
| *open(): void* | Manually opens the suggestions dropdown. |
| *sendGeocoderRequest(value: string): Promise<GeoJSON.FeatureCollection>* | Sends a geocoder request based on the provided value and returns a Promise with the response in [GeoJSON FeatureCollection](https://en.wikipedia.org/wiki/GeoJSON) format containing suggestions. |
| *sendPlaceDetailsRequest(feature: GeoJSON.Feature): Promise<GeoJSON.Feature>* | Sends a place details request based on the provided [GeoJSON feature](https://en.wikipedia.org/wiki/GeoJSON) and returns a Promise with the response in GeoJSON Feature format containing place details. |
| *setSendGeocoderRequestFunc(sendGeocoderRequestFunc: (value: string, geocoderAutocomplete: GeocoderAutocomplete) => Promise<GeoJSON.FeatureCollection>): void* | Sets a custom function to send geocoder requests. |
| *setSendPlaceDetailsRequestFunc(sendPlaceDetailsRequestFunc: (feature: GeoJSON.Feature, geocoderAutocomplete: GeocoderAutocomplete) => Promise<GeoJSON.Feature>): void* | Sets a custom function to send place details requests. |
| *on(operation: 'select' or 'suggestions' or 'input' or 'close' or 'open' or 'request_start' or 'request_end', callback: (param: any) => void): void* | Attaches event listeners to various operations such as selection, suggestions, input changes, dropdown open/close, and request lifecycle events. |
| *off(operation: 'select' or 'suggestions' or 'input' or 'close' or 'open' or 'request_start' or 'request_end', callback?: (param: any) => void): void* | Detaches previously attached event listeners. |
| *once(operation: 'select' or 'suggestions' or 'input' or 'close' or 'open' or 'request_start' or 'request_end', callback: (param: any) => void): void* | Attaches a one-time event listener that triggers only once for the specified operation. |

#### Example. Setting Geocoder options
The library offers a flexible API that enables the dynamic configuration of Geoapify Geocoder options at runtime:

```javascript
const autocomplete = new GeocoderAutocomplete(...);

// set location type
autocomplete.setType(options.type);
// set results language
autocomplete.setLang(options.lang);
// set dropdown elements limit
autocomplete.setLimit(options.limit);

// set filter
autocomplete.addFilterByCountry(codes);
autocomplete.addFilterByCircle(filterByCircle);
autocomplete.addFilterByRect(filterByRect);
autocomplete.addFilterByPlace(placeId);
autocomplete.clearFilters()

// set bias
autocomplete.addBiasByCountry(codes);
autocomplete.addBiasByCircle(biasByCircle);
autocomplete.addBiasByRect(biasByRect);
autocomplete.addBiasByProximity(biasByProximity);
autocomplete.clearBias();
```

#### Example. Close and open the suggestions dropdown automatically

You can also interact with the suggestions dropdown through the API, allowing you to check its current state and toggle the open/close state as needed:

```javascript
// get and change dropdown list state
autocomplete.isOpen();
autocomplete.open();
autocomplete.close();
```

#### Example. Setting and getting the display value
You have the ability to retrieve the current value or modify the displayed value:

```javascript
autocomplete.setValue(value);

const displayValue = autocomplete.getValue();
```

#### Example. Hooks and suggestions filter

Through the inclusion of preprocessing and post-processing hooks, as well as a suggestions filter, you modify both the entered values before sending the request and the received suggestions list:

* **Preprocess Hook** - Empower your address search by modifying the input text dynamically. For instance, when expecting a street name, you can enhance the search by adding a city or postcode to find streets within that specific location.
* **Postprocess Hook** - Tailor the displayed text in both the input field and suggestions list to match your desired format. For example, you can choose to display only the street name, offering a cleaner and more user-friendly presentation.
* **Suggestions Filter** - Efficiently manage and filter suggestions to prevent duplication or remove unnecessary items. This feature is particularly useful when applying a post-process hook, ensuring that suggestions with identical street names are intelligently handled and presented without redundancy.

```javascript

// add preprocess hook
autocomplete.setPreprocessHook((value: string) => {
    // return augmented value here
    return `${value} ${someAdditionalInfo}`
});

// remove the hook
autocomplete.setPreprocessHook(null);

autocomplete.setPostprocessHook((feature) => {
    // feature is GeoJSON feature containing structured address
    // return a part of the address to be displayed
    return feature.properties.street;
});

// remove the hook
autocomplete.setPostprocessHook(null);

autocomplete.setSuggestionsFilter((features: any[]) => {
    // features is an array of GeoJSON features, that contains suggestions
    // return filtered array
    const processedStreets = [];
    const filtered = features.filter(feature => {
        if (!feature.properties.street || processedStreets.indexOf(feature.properties.street) >= 0) {
            return false;
        } else {
            processedStreets.push(feature.properties.street);
            return true;
        }
    });
    return filtered;
});

// remove the filter
autocomplete.setSuggestionsFilter(null);

```

#### Example. Overwrite send request method

The library provides the flexibility to override default API methods, with Geoapify API being the default choice, for searching addresses. This allows you to seamlessly integrate custom or third-party address search services, offering you the freedom to tailor the geocoding functionality to your specific needs.

Here is an example of how you can override the default API methods to integrate custom or third-party address search services:

```javascript
autocomplete.setSendGeocoderRequestFunc((value: string, geocoderAutocomplete: GeocoderAutocomplete) => {

  if (/* check here if you can geocode the value */) {
    ...
    return new Promise((resolve, reject) => {
      resolve({
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
            ...
            "formatted": address
          },
          "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
          }
        }
      ]
      })
    });
  }

  // You can call the default search method this way
  return geocoderAutocomplete.sendGeocoderRequest(value);
});

autocomplete.setSendPlaceDetailsRequestFunc((feature: any, geocoderAutocomplete: GeocoderAutocomplete) => {
  if (/* you have details for the place */) {
    ...
    return new Promise((resolve, reject) => {
      resolve({
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
            ...
            "formatted": address
          },
          "geometry": { ... }
        }
      ]
      })
    });
  }

  // You can call the default place details method this way
  return geocoderAutocomplete.sendPlaceDetailsRequest(feature);
});
```

### Events

`@geoapify/geocoder-autocomplete` provides a set of event handling functions—on, off, and once. These functions allow you to attach, detach, and manage event listeners for various user interactions and changes within the library. 

| Event Name      | Description                                                                                                            |
|-----------------|------------------------------------------------------------------------------------------------------------------------|
| `select`        | Triggered when a suggestion is selected from the dropdown. Useful for capturing and responding to user selections.    |
| `suggestions`   | Fired when suggestions are provided, allowing access to the list of suggestions for customization or interaction. |
| `input`         | Occurs whenever the input field value changes, providing real-time feedback on user input for dynamic adjustments.   |
| `close`         | Triggered when the suggestions dropdown is closed, enabling actions to be performed when the dropdown closes.       |
| `open`          | Fired when the suggestions dropdown is opened, offering an opportunity to respond to dropdown opening events.       |
| `request_start` | Triggered when a geocoding request starts. Provides the search query as parameter. Perfect for showing loading indicators. |
| `request_end`   | Fired when a geocoding request completes (success or failure). Provides success status, data, and error information. Ideal for hiding loading indicators and handling errors. |

These events offer flexibility and customization options for creating tailored interactions and user experiences in your application.

#### Example. Geocoder Autocomplete events

You have the option to attach event listeners to the Geocoder Autocomplete:

```javascript
autocomplete.on('select', (location) => {
    // check selected location here 
});

autocomplete.on('suggestions', (suggestions) => {
    // process suggestions here
});

autocomplete.on('input', (userInput) => {
    // process user input here
});

autocomplete.on('open', () => {
    // dropdown list is opened 
});

autocomplete.on('close', () => {
    // dropdown list is closed 
});

autocomplete.once('open', () => {
    // dropdown list is opened, one time callback
});

autocomplete.once('close', () => {
    // dropdown list is closed, one time callback
});

autocomplete.on('request_start', (query) => {
    // geocoding request started
});

autocomplete.on('request_end', (success, data, error) => {
    // geocoding request completed
});
```
The location have [GeoJSON.Feature](https://geojson.org/) type, suggestions have GeoJSON.Feature[] type. The feature properties contain information about address and location.

Use `off()` function to remove event listerers:
```javascript
// remove open event
autocomplete.off('open', this.onOpen);

// remove all open events
autocomplete.off('open');
```

Learn more about Geocoder result properties on [Geoapify Documentation page](https://apidocs.geoapify.com/docs/geocoding/).

## Styling

We offer a variety of built-in themes within the library, catering to different webpage styles:

1. **Minimal Theme** (`minimal.css`): Designed for webpages with a light background color.
2. **Round Borders Theme** (`round-borders.css`): Tailored for webpages with a light background color, featuring rounded borders. 
3. **Minimal Dark Theme** (`minimal-dark.css`): Ideal for webpages with a dark background color.
4. **Round Borders Dark Theme** (`round-borders-dark.css`): Specifically crafted for webpages with a dark background color, incorporating rounded borders.

These themes offer versatile styling options to seamlessly integrate the address autocomplete component into various webpage designs.

Moreover, if you prefer to have complete control over the styling, you have the opportunity to customize the component yourself. Below are the CSS classes used for styling:

| Class Name                                     | Description                                                    |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `.geoapify-autocomplete-input`                 | Styles the input element.                                      |
| `.geoapify-autocomplete-items`                 | Styles the dropdown list.                                      |
| `.geoapify-autocomplete-items .active`         | Styles the selected item in the dropdown list.                |
| `.geoapify-autocomplete-item`                  | Styles the individual dropdown list items.                     |
| `.geoapify-autocomplete-item.icon`             | Styles the icon within the dropdown list items.                |
| `.geoapify-autocomplete-item.text`             | Styles the text within the dropdown list items.                |
| `.geoapify-close-button`                       | Styles the clear button.                                       |
| `.geoapify-autocomplete-items .main-part .non-verified` | Styles a portion of the street address that could not be verified by the Geocoder. |

## Working with non-verified address components

In some cases, Geoapify may return address components that are non-verified, such as newly constructed streets or buildings that are not yet available in databases. These non-verified components are highlighted in the address suggestions.

You can choose to:
1. Display these components with a warning to the user (e.g., in red).
2. Allow users to manually correct or confirm these non-verified details before finalizing the address.
3. Use the **`allowNonVerifiedHouseNumber`** and **`allowNonVerifiedStreet`** options to handle such cases.

For example, when a house number or street is not verified, the result will include a `nonVerifiedParts` array in the address object, which you can use to highlight or notify users about the provisional status.

### How it works

The library operates by utilizing the API to retrieve essential address details, including the parsed address, the located address, and a match type as results. Using this information as a foundation, the library enhances the result by filling in missing values, such as house numbers, to provide a more complete and user-friendly address representation.

Notably, non-verified address components are denoted with a "non-verified" class, making them visually distinct by default, often highlighted in red to indicate their provisional or unverified status.

It's essential to note that the GPS coordinates associated with the results correspond to the actual locations. Users have the flexibility to adjust these coordinates as needed to ensure accuracy.

Furthermore, the result object is expanded to include a list of non-verified properties. For instance:

```json
{
    "type": "Feature",
    "properties": {
	...
        "address_line1": "Bürgermeister-Heinrich-Straße 60",
        "address_line2": "93077 Bad Abbach, Germany",
        "housenumber": "60",
        "nonVerifiedParts": [
            "housenumber"
        ]
    },
   ...
}
```

This extended result object provides transparency by clearly indicating which address components are non-verified, allowing for informed decision-making and customization based on the level of validation required for your specific use case.

## License
This library is open-source and released under the MIT License.

## Contributions and Support

We welcome contributions! Here's how you can help:
1. **Open Issues**: If you encounter any bugs or have feature requests, please open an issue on [GitHub Issues](https://github.com/geoapify/geocoder-autocomplete/issues).
2. **Submit a Pull Request**: Fork the repository, make your changes, and submit a pull request for review.
3. **Documentation Updates**: Help us improve the documentation by submitting improvements or clarifications.

If you need assistance or have any questions, feel free to reach out to our support team at [info@geoapify.com](mailto:info@geoapify.com).
