# Styling

The package includes four themes and CSS hooks for adapting the control to your application.

## Built-in themes

Import or link exactly one theme:

1. `minimal.css` — light, minimal styling.
2. `round-borders.css` — light styling with rounded corners.
3. `minimal-dark.css` — styling for dark backgrounds.
4. `round-borders-dark.css` — dark styling with rounded corners.

For an npm installation:

```javascript
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
```

For a CDN installation:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@geoapify/geocoder-autocomplete@3/styles/minimal.css"
>
```

The themes provide a usable starting point. Test color contrast, keyboard focus, and zoom behavior after applying application-specific overrides.

## Custom styling

Place your overrides after the selected theme. These selectors are present in the current component markup:

| Selector | Description |
| --- | --- |
| `.geoapify-geocoder-autocomplete-container` | Root element created inside your container. |
| `.geoapify-input-wrapper` | Input and clear-button wrapper. |
| `.geoapify-autocomplete-input` | Text input. |
| `.geoapify-close-button` | Clear button. |
| `.geoapify-autocomplete-items` | Suggestions dropdown. |
| `.geoapify-autocomplete-item` | A suggestion row. |
| `.geoapify-autocomplete-items .active` | Keyboard-highlighted suggestion. |
| `.geoapify-autocomplete-item .icon` | Suggestion icon. |
| `.geoapify-autocomplete-item .address` | Suggestion text wrapper. |
| `.geoapify-autocomplete-item .main-part` | Main suggestion text. |
| `.geoapify-autocomplete-item .secondary-part` | Secondary suggestion text. |
| `.geoapify-autocomplete-item .non-verified` | An address part retained but not verified by the API match. |
| `.geoapify-places-list` | Built-in Places list. |
| `.geoapify-places-title-bar` | Places list header. |
| `.geoapify-places-scroll-container` | Scrollable Places results. |
| `.geoapify-places-item` | A Places result row. |
| `.geoapify-places-item .icon` | Place category icon. |
| `.geoapify-places-text-container` | Place name and address wrapper. |
| `.geoapify-places-main-part` | Place name. |
| `.geoapify-places-secondary-part` | Place address. |
| `.geoapify-places-hours-info` | Opening-hours block. |
| `.geoapify-places-hours-text` | Opening-hours text. |
| `.geoapify-places-clock-icon` | Opening-hours icon. |
| `.geoapify-places-status-bar` | Results/status footer. |
| `.geoapify-places-status-count` | Result count. |
| `.geoapify-places-status-selected` | Selected-place status. |
| `.geoapify-places-load-more` | Load-more area. |
| `.geoapify-places-load-more-button` | Load-more button. |
| `.geoapify-places-load-more-loading` | Loading state in the load-more area. |
| `.geoapify-places-empty-state` | Empty-results message. |
| `.geoapify-places-empty-icon` | Empty-results icon. |
| `.geoapify-places-loading-overlay` | Initial loading overlay. |
| `.geoapify-places-loading-indicator` | Initial loading indicator. |
| `.geoapify-places-loading-dots` | Animated loading dots. |

For example:

```css
.geoapify-geocoder-autocomplete-container {
  max-width: 32rem;
}

.geoapify-autocomplete-items .active {
  background: #eef5ff;
}

.geoapify-autocomplete-item .non-verified {
  text-decoration: underline dotted;
}
```

Class names are part of the rendered markup but are not a substitute for visual regression testing when upgrading the package.

## Learn more

- See the [Quick Start](quick-start.md) for installation examples.
- Explore the [API Reference](api-reference/geocoder-autocomplete.md).
- Try the [Interactive Demos](live-demos.md).
