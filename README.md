# Geoapify Geocoder Autocomplete

[![Docs](https://img.shields.io/badge/Docs-View%20Documentation-blue)](https://geoapify.github.io/geocoder-autocomplete/)

The Geoapify Geocoder Autocomplete is a JavaScript (TypeScript) library designed to enhance web applications and HTML pages by adding advanced **address autocomplete** functionality and **address autofill** input fields. It harnesses the power of the [Geoapify Geocoding API](https://www.geoapify.com/geocoding-api/) to provide accurate and efficient address search capabilities, making it an essential tool for enhancing the geolocation services of web-based applications.

![Geocoder Autocomplete](https://github.com/geoapify/geocoder-autocomplete/blob/9b46b3e458d18b45e2957298e8833f830ed6252a/img/address-autocomplete-example.png?raw=true)

## Table of Contents
- [Features](#features)
- [Live Demos](#live-demos)
- [Getting Geoapify API key](#getting-geoapify-api-key)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Full Documentation](#full-documentation)
- [Contributions and Support](#contributions-and-support)

## Features
* **Customizable Address Input**: Easily embed address input fields within your web application by adding them to provided HTML containers (e.g., `DIV` elements), allowing for flexible integration and styling.
* **API Integration Flexibility**: By default, the library seamlessly connects to the [Geoapify Address Autocomplete API](https://www.geoapify.com/address-autocomplete/) to retrieve address suggestions. However, developers have the freedom to integrate and combine other third-party Address Search APIs, allowing for extensive customization and the incorporation of multiple data sources.
* **Search Customization**: Tailor your address search with precision by adding filters and bias parameters. This level of customization empowers developers to fine-tune search queries, ensuring more accurate and relevant address suggestions for users.
* **Structured Address Forms**: Utilize the type parameter to craft address input forms that enable users to enter structured addresses, including postal codes, cities, countries, address lines, and more.
* **Category Search**: Enable category-based search functionality that allows users to search for places by categories (e.g., restaurants, hotels, gas stations). When enabled, the autocomplete will display category suggestions alongside address results, providing a more comprehensive search experience.
* **Places List Integration**: Optionally display a list of places within selected categories using the [Geoapify Places API](https://www.geoapify.com/places-api/). The built-in places list shows essential place information including name, address, and opening hours, with a "Load More" button to fetch additional results. For more detailed place information, you can implement custom places list handling.
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
* [Basic Address Form with Built-in Places List](demo/basic-places-builtin/index.html) - Address input with category search and built-in places list functionality
* [Leaflet Integration](demo/leaflet/index.html) - Interactive map with address search and markers
* [Leaflet with Custom Places UI](demo/leaflet-places-custom/index.html) - Interactive map with category search and custom places list implementation
* [Leaflet with Built-in Places List](demo/leaflet-places-builtin/index.html) - Interactive map with category search and built-in places list functionality
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

## Full Documentation

Looking for detailed API references, advanced features, and usage examples?

👉 **Explore the full documentation here:**  
[https://geoapify.github.io/geocoder-autocomplete/](https://geoapify.github.io/geocoder-autocomplete/)

The documentation includes:
- **[Complete API Reference](https://geoapify.github.io/geocoder-autocomplete/api-reference/)** - All options, methods, and events
- **[Styling Guide](https://geoapify.github.io/geocoder-autocomplete/styling/)** - Themes and customization
- **[Advanced Usage](https://geoapify.github.io/geocoder-autocomplete/quick-start/)** - Category search, filtering, bias, and hooks
- **[Non-verified Addresses](https://geoapify.github.io/geocoder-autocomplete/non-verified-addresses/)** - Handling unverified address components

## License
This library is open-source and released under the MIT License.

## Contributions and Support

We welcome contributions! Here's how you can help:
1. **Open Issues**: If you encounter any bugs or have feature requests, please open an issue on [GitHub Issues](https://github.com/geoapify/geocoder-autocomplete/issues).
2. **Submit a Pull Request**: Fork the repository, make your changes, and submit a pull request for review.
3. **Documentation Updates**: Help us improve the documentation by submitting improvements or clarifications.

If you need assistance or have any questions, feel free to reach out to our support team at [info@geoapify.com](mailto:info@geoapify.com).
