# Geoapify Geocoder Autocomplete
Geoapify Geocoder Autocomplete is a JavaScript(TypeScript) library that provides autocomplete functionality for the [Geoapify Geocoding API](https://www.geoapify.com/api/geocoding-api/):
* adds and input field to a given container;
* makes calls to Geocoding API on user input;
* show place suggestions in dropdown list;
* notify about suggestions change and selection.

You can also:
* specify a location type - **country**, **state**, **city**, **postcode**, **street**, **amenity**;
* limit the search to one or multiple countries;
* set a prefered position, to show results near the position first;
* select a language for search results;
* change results number shown in the dropdown list.

# [Live demo](https://apidocs.geoapify.com/playground/geocoding)

## Add Geocoder Autocomplete to your project

##### STEP 0. Get an API key from Geoapify
You will need an API key to execute Geoapify Geocoding requests.
Register and get an API key for Free on [myprojects.geoapify.com](https://myprojects.geoapify.com/).
Geoapify has [Freemium pricing model](https://www.geoapify.com/api-pricing/). You can start for Free and extend when you need.

##### STEP 1. Add a container element to webpage
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
##### STEP 2. Initialize the autocomplete field

TODO: Add example of import state!!!

```javascript
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
##### STEP 3. Import Geoapify autocomplete styles:
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
| lang | `en`, `de`, `it`, `fr` | Results language |
| position | GeoPosition | Prefered search position |
| countryCodes | CountyCode[] | Limit the search by countries |
| limit | number | The maximal number of returned suggestions |
| placeholder | string | An input field placeholder |

#### GeoPosition
| Option | Type | Description |
| ------ | ------ | ------ |
| lat | number | Latitude |
| lon | number | Longitude |

#### CountyCode
2-digits [ISO 3166-1 Alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) country code: `ad`, `ae`, `af`, `ag`, `ai`, `al`, `am`, `an`, `ao`, `ap`, `aq`, `ar`, `as`, `at`, `au`, `aw`, `az`, `ba`, `bb`, `bd`, `be`, `bf`, `bg`, `bh`, `bi`, `bj`, `bm`, `bn`, `bo`, `br`, `bs`, `bt`, `bv`, `bw`, `by`, `bz`, `ca`, `cc`, `cd`, `cf`, `cg`, `ch`, `ci`, `ck`, `cl`, `cm`, `cn`, `co`, `cr`, `cu`, `cv`, `cx`, `cy`, `cz`, `de`, `dj`, `dk`, `dm`, `do`, `dz`, `ec`, `ee`, `eg`, `eh`, `er`, `es`, `et`, `eu`, `fi`, `fj`, `fk`, `fm`, `fo`, `fr`, `ga`, `gb`, `gd`, `ge`, `gf`, `gh`, `gi`, `gl`, `gm`, `gn`, `gp`, `gq`, `gr`, `gs`, `gt`, `gu`, `gw`, `gy`, `hk`, `hm`, `hn`, `hr`, `ht`, `hu`, `id`, `ie`, `il`, `in`, `io`, `iq`, `ir`, `is`, `it`, `jm`, `jo`, `jp`, `ke`, `kg`, `kh`, `ki`, `km`, `kn`, `kp`, `kr`, `kw`, `ky`, `kz`, `la`, `lb`, `lc`, `li`, `lk`, `lr`, `ls`, `lt`, `lu`, `lv`, `ly`, `ma`, `mc`, `md`, `me`, `mg`, `mh`, `mk`, `ml`, `mm`, `mn`, `mo`, `mp`, `mq`, `mr`, `ms`, `mt`, `mu`, `mv`, `mw`, `mx`, `my`, `mz`, `na`, `nc`, `ne`, `nf`, `ng`, `ni`, `nl`, `no`, `np`, `nr`, `nu`, `nz`, `om`, `pa`, `pe`, `pf`, `pg`, `ph`, `pk`, `pl`, `pm`, `pr`, `ps`, `pt`, `pw`, `py`, `qa`, `re`, `ro`, `rs`, `ru`, `rw`, `sa`, `sb`, `sc`, `sd`, `se`, `sg`, `sh`, `si`, `sj`, `sk`, `sl`, `sm`, `sn`, `so`, `sr`, `st`, `sv`, `sy`, `sz`, `tc`, `td`, `tf`, `tg`, `th`, `tj`, `tk`, `tm`, `tn`, `to`, `tr`, `tt`, `tv`, `tw`, `tz`, `ua`, `ug`, `um`, `us`, `uy`, `uz`, `va`, `vc`, `ve`, `vg`, `vi`, `vn`, `vu`, `wf`, `ws`, `ye`, `yt`, `za`, `zm`, `zw`.

Learn more about Geoapify Geocoder option on [Geoapify Documentation page](https://apidocs.geoapify.com/docs/geocoding/getting-started/geocoding).

#### Set option with API
The library provides an API that allows to set **Geoapify Geocoder options** during runtime:
```javascript
const autocomplete = new GeocoderAutocomplete(...);

// set location type
autocomplete.setType(options.type);
// set results language
autocomplete.setLang(options.lang);
// set results language
autocomplete.setLang(options.lang);
// limit by countries
autocomplete.setCountryCodes(options.countries);
// set dropdown elements limit
autocomplete.setLimit(options.limit);
// set prefered position
autocomplete.setPosition(options.position);
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
The location have [GeoJSON.Feature](https://geojson.org/) type, suggestions have GeoJSON.Feature[] type.
Learn more about returned types on [Geoapify Documentation page](https://apidocs.geoapify.com/docs/geocoding/getting-started/geocoding).
## Styling
We provide several Themes within the library: 
* `minimal` and `round-borders` - for webpages with light background color
* `minimal-dark` and `round-borders-dark` for webpages with dark background color. 

However, you have aloso opportunity to style the component by youself. Here are classes used:
| Name | Description |
| ------ | ------ |
| `.geoapify-autocomplete-input ` | The input element |
| `.geoapify-autocomplete-items` | The dropdown list |
| `.geoapify-autocomplete-items .active` | Selected item in the dropdown list |
| `.geoapify-close-button` | The clear button |

# Find more Geoapify APIs, Playgrounds and code samples on [apidocs.geoapify.com](https://apidocs.geoapify.com).
