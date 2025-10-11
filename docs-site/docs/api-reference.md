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
| addCategorySearch | boolean | Enable category search functionality. When enabled, the autocomplete will show category suggestions alongside address results, allowing users to search for places by category (e.g., restaurants, hotels). |
| showPlacesList | boolean | Enable built-in places list functionality. When a category is selected, displays a list of places within that category showing name, address, and opening hours. Requires `addCategorySearch` to be enabled. |
| hidePlacesListAfterSelect | boolean | Automatically hide the places list after a place is selected. Defaults to `false`. |
| placesApiUrl | string | Custom URL for the Places API. Defaults to Geoapify Places API if not specified. |
| ipGeolocationUrl | string | Custom URL for IP geolocation service. Used for location-based bias when no explicit location is provided. |

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
| *setAddDetails(addDetails: boolean): void* | Enables or disables calling Place Details API on selection to get additional place information. |
| *setSkipIcons(skipIcons: boolean): void* | Enables or disables icons in the suggestions dropdown. |
| *setAllowNonVerifiedHouseNumber(allowNonVerifiedHouseNumber: boolean): void* | Allows the addition of house numbers that are not verified by the Geocoding API or missing in the database. |
| *setAllowNonVerifiedStreet(allowNonVerifiedStreet: boolean): void* | Allows the addition of streets that are not verified by the Geocoding API or missing in the database. |
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
| *setCategory(category: Category or string or string[] or null): void* | Sets the selected category for places search. Pass null to clear the category. |
| *resendPlacesRequest(): Promise<void>* | Resends the places search request for the currently selected category without changing the category. Useful for refreshing places data when filters or bias have changed (e.g., after map movement). |
| *getCategory(): Category or null* | Retrieves the currently selected category. |
| *selectPlace(index: number or null): void* | Programmatically selects a place from the places list by index. Pass null to clear selection. |
| *setGeocoderUrl(url: string): void* | Overrides the default Geocoder API URL. |
| *setPlaceDetailsUrl(url: string): void* | Overrides the default Place Details API URL. |
| *setPlacesApiUrl(url: string): void* | Overrides the default Places API URL. |
| *setIpGeolocationUrl(url: string): void* | Overrides the default IP Geolocation API URL. |
| *sendGeocoderRequest(value: string): Promise<GeoJSON.FeatureCollection>* | Sends a geocoder request based on the provided value and returns a Promise with the response in [GeoJSON FeatureCollection](https://en.wikipedia.org/wiki/GeoJSON) format containing suggestions. |
| *sendPlaceDetailsRequest(feature: GeoJSON.Feature): Promise<GeoJSON.Feature>* | Sends a place details request based on the provided [GeoJSON feature](https://en.wikipedia.org/wiki/GeoJSON) and returns a Promise with the response in GeoJSON Feature format containing place details. |
| *sendPlacesRequest(category: string[], bias?: object, filter?: object, offset?: number, limit?: number): Promise<GeoJSON.FeatureCollection>* | Sends a places search request for the specified category and returns a Promise with the response in GeoJSON FeatureCollection format containing places. |
| *setSendPlacesRequestFunc(sendPlacesRequestFunc: (category: string[], geocoderAutocomplete: GeocoderAutocomplete, offset?: number, limit?: number) => Promise<GeoJSON.FeatureCollection>): void* | Sets a custom function to send places search requests. |
| *setSendGeocoderRequestFunc(sendGeocoderRequestFunc: (value: string, geocoderAutocomplete: GeocoderAutocomplete) => Promise<GeoJSON.FeatureCollection>): void* | Sets a custom function to send geocoder requests. |
| *setSendPlaceDetailsRequestFunc(sendPlaceDetailsRequestFunc: (feature: GeoJSON.Feature, geocoderAutocomplete: GeocoderAutocomplete) => Promise<GeoJSON.Feature>): void* | Sets a custom function to send place details requests. |
| *on(operation: 'select' or 'suggestions' or 'input' or 'close' or 'open' or 'request_start' or 'request_end' or 'places' or 'places_request_start' or 'places_request_end' or 'place_details_request_start' or 'place_details_request_end' or 'place_select' or 'clear', callback: (param: any) => void): void* | Attaches event listeners to various operations such as selection, suggestions, input changes, dropdown open/close, places, and request lifecycle events. |
| *off(operation: 'select' or 'suggestions' or 'input' or 'close' or 'open' or 'request_start' or 'request_end' or 'places' or 'places_request_start' or 'places_request_end' or 'place_details_request_start' or 'place_details_request_end' or 'place_select' or 'clear', callback?: (param: any) => void): void* | Detaches previously attached event listeners. |
| *once(operation: 'select' or 'suggestions' or 'input' or 'close' or 'open' or 'request_start' or 'request_end' or 'places' or 'places_request_start' or 'places_request_end' or 'place_details_request_start' or 'place_details_request_end' or 'place_select' or 'clear', callback: (param: any) => void): void* | Attaches a one-time event listener that triggers only once for the specified operation. |

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

| Event Name                    | Description                                                                                                            |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `select`                      | Triggered when a suggestion is selected from the dropdown. Useful for capturing and responding to user selections.    |
| `suggestions`                 | Fired when suggestions are provided, allowing access to the list of suggestions for customization or interaction. |
| `input`                       | Occurs whenever the input field value changes, providing real-time feedback on user input for dynamic adjustments.   |
| `close`                       | Triggered when the suggestions dropdown is closed, enabling actions to be performed when the dropdown closes.       |
| `open`                        | Fired when the suggestions dropdown is opened, offering an opportunity to respond to dropdown opening events.       |
| `request_start`               | Triggered when a geocoding request starts. Provides the search query as parameter. Perfect for showing loading indicators. |
| `request_end`                 | Fired when a geocoding request completes (success or failure). Provides success status, data, and error information. Ideal for hiding loading indicators and handling errors. |
| `places`                      | Fired when places are found for a selected category. Provides an array of places. Useful for custom places list implementations. |
| `places_request_start`        | Triggered when a places search request starts. Provides the category as parameter. Useful for showing loading indicators during places search. |
| `places_request_end`          | Fired when a places search request completes (success or failure). Provides success status, data, and error information. |
| `place_details_request_start` | Triggered when a place details request starts. Provides the selected feature as parameter. Useful for showing loading indicators during place details fetching. |
| `place_details_request_end`   | Fired when a place details request completes (success or failure). Provides success status, data, and error information. Ideal for hiding loading indicators and handling place details errors. |
| `place_select`                | Triggered when a place is selected from the places list. Provides the selected place and its index. |
| `clear`                       | Fired when the autocomplete is cleared. Provides the item type that was cleared (e.g., categories, places). |

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

autocomplete.on('places', (places) => {
    // places found for selected category
});

autocomplete.on('places_request_start', (category) => {
    // places search request started
});

autocomplete.on('places_request_end', (success, data, error) => {
    // places search request completed
});

autocomplete.on('place_details_request_start', (feature) => {
    // place details request started
});

autocomplete.on('place_details_request_end', (success, data, error) => {
    // place details request completed
});

autocomplete.on('place_select', (place, index) => {
    // place selected from places list
});

autocomplete.on('clear', (itemType) => {
    // autocomplete cleared
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
