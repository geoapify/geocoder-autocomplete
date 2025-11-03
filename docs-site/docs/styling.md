The Geoapify Geocoder Autocomplete library comes with multiple **predefined themes** and a rich set of **CSS classes** that make it easy to adapt the component to your website’s design system.

### Built-in Themes

You can quickly style the autocomplete widget by linking one of the built-in themes provided in the library.
Each theme is optimized for light or dark backgrounds and can be swapped simply by including a different stylesheet.

1. **Minimal Theme** (`minimal.css`) – clean, modern look for light backgrounds.
2. **Round Borders Theme** (`round-borders.css`) – similar to Minimal but with softly rounded input and dropdown corners.
3. **Minimal Dark Theme** (`minimal-dark.css`) – best suited for dark background layouts.
4. **Round Borders Dark Theme** (`round-borders-dark.css`) – combines dark tones with rounded visual elements.

These ready-to-use styles ensure seamless visual integration while maintaining clarity and accessibility.

### Custom Styling

If you prefer to define your own appearance, the library offers full flexibility.
You can override or extend the built-in CSS rules using the following class names:

| Class Name                                              | Description                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `.geoapify-autocomplete-input`                          | Styles the input element.                                          |
| `.geoapify-autocomplete-items`                          | Styles the dropdown list.                                          |
| `.geoapify-autocomplete-items .active`                  | Styles the active (highlighted) suggestion.                        |
| `.geoapify-autocomplete-item`                           | Styles individual dropdown items.                                  |
| `.geoapify-autocomplete-item.icon`                      | Styles icons in suggestion items.                                  |
| `.geoapify-autocomplete-item.text`                      | Styles text in suggestion items.                                   |
| `.geoapify-close-button`                                | Styles the clear (X) button.                                       |
| `.geoapify-autocomplete-items .main-part .non-verified` | Highlights non-verified parts of the address (e.g., house number). |
| `.geoapify-places-list`                                 | Styles the container for the Places list.                          |
| `.geoapify-places-item`                                 | Styles each place item in the list.                                |
| `.geoapify-places-item .icon`                           | Styles category icons in Places items.                             |
| `.geoapify-places-main-part`                            | Styles the main section of a place item.                           |
| `.geoapify-places-details`                              | Styles additional place details.                                   |
| `.geoapify-places-address-container`                    | Styles the address block in place details.                         |
| `.geoapify-places-address-element`                      | Styles individual address fields.                                  |
| `.geoapify-places-hours-container`                      | Styles the container for opening hours.                            |
| `.geoapify-places-hours-text`                           | Styles the opening hours text.                                     |
| `.geoapify-places-clock-icon`                           | Styles the clock icon near opening hours.                          |
| `.geoapify-places-load-more-button`                     | Styles the “Load More” button.                                     |
| `.geoapify-places-load-more-icon`                       | Styles the arrow icon inside the “Load More” button.               |
| `.geoapify-places-spinner-icon`                         | Styles the spinner shown during loading.                           |
| `.geoapify-input-wrapper`                               | Wrapper for the input field and clear button.                      |
| `.geoapify-category-item`                               | Styles category suggestion elements.                               |
| `.geoapify-places-title-bar`                            | Styles the top bar of the Places list.                             |
| `.geoapify-places-title-icon`                           | Styles the icon in the title bar.                                  |
| `.geoapify-places-title-label`                          | Styles the label text in the title bar.                            |
| `.geoapify-places-scroll-container`                     | Styles the scrollable content area for Places.                     |
| `.geoapify-places-text-container`                       | Styles the name-and-address container.                             |
| `.geoapify-places-secondary-part`                       | Styles secondary text like addresses.                              |
| `.geoapify-places-hours-info`                           | Styles the hours information block.                                |
| `.geoapify-places-status-bar`                           | Styles the bottom status bar.                                      |
| `.geoapify-places-status-count`                         | Styles the count display in the status bar.                        |
| `.geoapify-places-status-selected`                      | Styles the “selected place” indicator.                             |
| `.geoapify-places-load-more`                            | Styles the “load more” section container.                          |
| `.geoapify-places-load-more-loading`                    | Styles the animated dots during loading.                           |
| `.geoapify-places-empty-state`                          | Styles the “no results found” message.                             |
| `.geoapify-places-empty-icon`                           | Styles the icon shown in empty state.                              |
| `.geoapify-places-loading-overlay`                      | Styles the overlay shown while loading.                            |
| `.geoapify-places-loading-indicator`                    | Styles the loader container.                                       |
| `.geoapify-places-loading-dots`                         | Styles the animation for loading dots.                             |

### Learn more

* See the [Quick Start](../quick-start/) guide for setup and usage examples.
* Explore the [API Reference](../api-reference/) for configuration details and advanced options.
* Try the [Interactive Demos](../live-demos/) to experiment with themes and styling in real time.

