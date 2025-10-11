# Geoapify Geocoder Autocomplete

The Geoapify Geocoder Autocomplete is a JavaScript (TypeScript) library designed to enhance web applications and HTML pages by adding advanced **address autocomplete** functionality and **address autofill** input fields. It harnesses the power of the [Geoapify Geocoding API](https://www.geoapify.com/geocoding-api/) to provide accurate and efficient address search capabilities, making it an essential tool for enhancing the geolocation services of web-based applications.

![Geocoder Autocomplete](https://github.com/geoapify/geocoder-autocomplete/blob/9b46b3e458d18b45e2957298e8833f830ed6252a/img/address-autocomplete-example.png?raw=true)

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
> **Here's how you can ensure accuracy**:
> 1. After selecting an address, display a map or marker to show the user's selected location.
> 2. Prompt the user to confirm the address details, including street, city, and postal code.
> 3. Optionally, use reverse geocoding to verify the location after selecting the address. You can also use [Geoapify Reverse Geocoding API](https://www.geoapify.com/reverse-geocoding-api/) to confirm the precise location.

This code demonstrates how to set up a custom geocoding function. It customizes the autocomplete input to return countries, states, cities, and counties based on user input, using Geoapify's Address Autocomplete API:
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
