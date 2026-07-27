# Migration and deprecated API

The following compatibility options and methods are deprecated. New code should use their replacements.

| Deprecated | Replacement |
| --- | --- |
| `skipDetails` | `addDetails` |
| `position` option | `bias: { proximity: { lon, lat } }` |
| `countryCodes` option | `filter: { countrycode: ['de', 'at'] }` |
| `setPosition(position)` | `addBiasByProximity(position)` |
| `setCountryCodes(codes)` | `addFilterByCountry(codes)` |

## Place Details

Use an opt-in value:

```javascript
const autocomplete = new GeocoderAutocomplete(container, apiKey, {
  addDetails: true
});
```

## Country filters

```javascript
const autocomplete = new GeocoderAutocomplete(container, apiKey, {
  filter: {
    countrycode: ['de', 'at']
  }
});

// At runtime:
autocomplete.addFilterByCountry(['de', 'at']);
```

## Proximity bias

```javascript
const autocomplete = new GeocoderAutocomplete(container, apiKey, {
  bias: {
    proximity: {
      lon: 13.405,
      lat: 52.52
    }
  }
});

// At runtime:
autocomplete.addBiasByProximity({ lon: 13.405, lat: 52.52 });
```

Filters restrict results. Biases influence ranking without guaranteeing that every result is inside the biased area.

## Cancellation payload

When a request is superseded or the component is destroyed, its end event uses the correctly spelled property:

```javascript
{ cancelled: true }
```

Update integrations that look for another spelling. See [Lifecycle and errors](lifecycle-and-errors.md#request-lifecycle) for the complete event contract.
