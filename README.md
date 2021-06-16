# Geoapify Geocoder Autocomplete
Geoapify Geocoder Autocomplete is a JavaScript(TypeScript) library that provides autocomplete functionality for the [Geoapify Geocoding API](https://www.geoapify.com/geocoding-api/):
* adds an input field to a given container;
* makes calls to Geocoding API on user input;
* shows place suggestions in a dropdown list;
* notifies on suggestions change;
* makes a call to Place Details API to get more information and geometry on user selection if is not skipped;  
* notifies on selection change. Returns [Geocoding API](https://apidocs.geoapify.com/docs/geocoding/api/) object or [Place Details API object](https://apidocs.geoapify.com/docs/place-details/feature) depending on options set.

The library makes a call to [Geoapify Place Details API](https://apidocs.geoapify.com/docs/place-details) on user select events. The API lets to get detailed information about the place selected as well as place category and place geometry (building polygon or region boundary). Note, that the Place Details API call costs an additional 'geocoding & places' request. Use the `skipDetails` option to switch the functionality off.

You can also:
* specify a location type - **country**, **state**, **city**, **postcode**, **street**, **amenity**;
* filter results by country, circle or boundary box
* prioritize search by a location, boundary box, circle, and countries
* select a language for search results;
* change result number shown in the dropdown list.

# [Live demo](https://apidocs.geoapify.com/playground/geocoding)

## Add Geocoder Autocomplete to your project

##### STEP 0. Get an API key from Geoapify
You will need an API key to execute Geoapify Geocoding requests.
Register and get an API key for Free on [myprojects.geoapify.com](https://myprojects.geoapify.com/).
Geoapify has a [Freemium pricing model](https://www.geoapify.com/pricing/). You can start for Free and extend when you need it.

##### STEP 1. Install the Geocoder Autocomplete package

```
npm install @geoapify/geocoder-autocomplete
# or 
yarn add @geoapify/geocoder-autocomplete
```

##### STEP 2. Add a container element to webpage
The autocomplete input will be added into the container element and will take the element full width:
```html
<div id="autocomplete" class="autocomplete-container"></div>
```
The container element must have `position: absolute;` or `position: relative;`
```css
.autocomplete-container {
    position: relative;
}
```
##### STEP 3. Initialize the autocomplete field

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
##### STEP 4. Import Geoapify autocomplete styles:
We provide several Themes within the library: 
* `minimal` and `round-borders` - for webpages with light background color
* `minimal-dark` and `round-borders-dark` for webpages with dark background color. 

You can import the appropriate css-file to your styles:
```css
 @import "~@geoapify/geocoder-autocomplete/styles/minimal.css";
```
## Geoapify Geocoder options
#### GeocoderAutocompleteOptions
| Option | Type | Description |
| ------ | ------ | ------ |
| type | `country`, `state`, `city`, `postcode`, `street`, `amenity` | Type of the location |
| lang | LanguageCode | Results language |
| limit | number | The maximal number of returned suggestions |
| placeholder | string | An input field placeholder |
| debounceDelay | number | A delay between user input and the API call to prevent unnecessary calls. The default value is 100ms. |
| skipIcons | boolean | Don't add icons to suggestions |
| skipDetails | boolean | Skip Place Details API call on selection change |
| filter | FilterOptions | Filter places by country, boundary, circle |
| bias | BiasOptions | Prefer places by country, boundary, circle, location | 

#### LanguageCode
2-character [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code: `ab`, `aa`, `af`, `ak`, `sq`, `am`, `ar`, `an`, `hy`, `as`, `av`, `ae`, `ay`, `az`, `bm`, `ba`, `eu`, `be`, `bn`, `bh`, `bi`, `bs`, `br`, `bg`, `my`, `ca`, `ch`, `ce`, `ny`, `zh`, `cv`, `kw`, `co`, `cr`, `hr`, `cs`, `da`, `dv`, `nl`, `en`, `eo`, `et`, `ee`, `fo`, `fj`, `fi`, `fr`, `ff`, `gl`, `ka`, `de`, `el`, `gn`, `gu`, `ht`, `ha`, `he`, `hz`, `hi`, `ho`, `hu`, `ia`, `id`, `ie`, `ga`, `ig`, `ik`, `io`, `is`, `it`, `iu`, `ja`, `jv`, `kl`, `kn`, `kr`, `ks`, `kk`, `km`, `ki`, `rw`, `ky`, `kv`, `kg`, `ko`, `ku`, `kj`, `la`, `lb`, `lg`, `li`, `ln`, `lo`, `lt`, `lu`, `lv`, `gv`, `mk`, `mg`, `ms`, `ml`, `mt`, `mi`, `mr`, `mh`, `mn`, `na`, `nv`, `nb`, `nd`, `ne`, `ng`, `nn`, `no`, `ii`, `nr`, `oc`, `oj`, `cu`, `om`, `or`, `os`, `pa`, `pi`, `fa`, `pl`, `ps`, `pt`, `qu`, `rm`, `rn`, `ro`, `ru`, `sa`, `sc`, `sd`, `se`, `sm`, `sg`, `sr`, `gd`, `sn`, `si`, `sk`, `sl`, `so`, `st`, `es`, `su`, `sw`, `ss`, `sv`, `ta`, `te`, `tg`, `th`, `ti`, `bo`, `tk`, `tl`, `tn`, `to`, `tr`, `ts`, `tt`, `tw`, `ty`, `ug`, `uk`, `ur`, `uz`, `ve`, `vi`, `vo`, `wa`, `cy`, `wo`, `fy`, `xh`, `yi`, `yo`, `za`.

#### FilterOptions
The Geocoder Autocomplete allows specify the following types of filters:

Name | Filter | Filter Value | Description | Examples
--- | --- | --- | --- | ---
By circle | *circle* | `{ lon: number ,lat: number, radiusMeters: number }`  | Search places inside the circle | `filter['circle'] = {lon: -87.770231, lat: 41.878968, radiusMeters: 5000}`
By rectangle | *rect* | `{ lon1: number ,lat1: number, lon2: number ,lat2: number}`  | Search places inside the rectangle | `filter['rect'] = {lon1: 89.097540, lat1: 39.668983, lon2: -88.399274, lat2: 40.383412}`
By country | *countrycode* | `CountyCode[]`  | Search places in the countries | `filter['countrycode'] = ['de', 'fr', 'es']`

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

#### Set option with API
The library provides an API that allows to set **Geoapify Geocoder options** during runtime:
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
autocomplete.clearFilters()

// set bias
autocomplete.addBiasByCountry(codes);
autocomplete.addBiasByCircle(biasByCircle);
autocomplete.addBiasByRect(biasByRect);
autocomplete.addBiasByProximity(biasByProximity);
autocomplete.clearBias();

```

#### Set display value
You can also set initial value or change display value:
```javascript
const autocomplete = new GeocoderAutocomplete(...);

autocomplete.setValue(value);
```

## Hooks and suggestions filter
By adding preprocessing and post-processing hooks and suggestions filter you can change the entered/displayed values and suggestions list:
* **Preprocess Hook** - you can modify the text to search. For example, if you expect that the user enters a street name you can add a city or postcode to search streets in the city.
* **Postprocess Hook** - you can modify the text that will be displayed in the input field and suggestions list. For example, you can show only a street name.
* **Suggestions Filter** - allows filtering some suggestions. It lets to avoid duplicated results when you modify the address with a post-process hook. For example, suggestions may contain several addresses with the same street name, they will be duplicated when not the whole address but only the street name is shown.

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
## Geocoder Autocomplete events
The Geocoder Autocomplete can notify when the list of suggestions is changed or a selection happened:
```javascript
autocomplete.on('select', (location) => {
    // check selected location here 
});
autocomplete.on('suggestions', (suggestions) => {
    // process suggestions here
});
```
The location have [GeoJSON.Feature](https://geojson.org/) type, suggestions have GeoJSON.Feature[] type. Properties of the feature contain information about address and location.
Learn more about Geocoder result properties on [Geoapify Documentation page](https://apidocs.geoapify.com/docs/geocoding/).
## Styling
We provide several Themes within the library: 
* `minimal` and `round-borders` - for webpages with light background color
* `minimal-dark` and `round-borders-dark` for webpages with dark background color. 

However, you have also opportunity to style the component by yourself. Here are the classes used:
| Name | Description |
| ------ | ------ |
| `.geoapify-autocomplete-input ` | The input element |
| `.geoapify-autocomplete-items` | The dropdown list |
| `.geoapify-autocomplete-items .active` | Selected item in the dropdown list |
| `.geoapify-autocomplete-item` | The dropdown list item|
| `.geoapify-autocomplete-item.icon` | The dropdown list item icon |
| `.geoapify-autocomplete-item.text` | The dropdown list item text |
| `.geoapify-close-button` | The clear button |

### Find more Geoapify APIs, Playgrounds and code samples on [apidocs.geoapify.com](https://apidocs.geoapify.com).
