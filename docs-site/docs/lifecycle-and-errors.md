# Lifecycle and errors

## Request lifecycle

The component exposes three request lifecycles:

| Request | Start event | End event |
| --- | --- | --- |
| Address autocomplete | `request_start` | `request_end` |
| Place details | `place_details_request_start` | `place_details_request_end` |
| Category/Places search | `places_request_start` | `places_request_end` |

Each emitted start event has one matching end event:

```javascript
autocomplete.on('request_end', (success, data, error) => {
  if (success) {
    console.log(data.features);
  } else if (error?.cancelled) {
    // Expected when a newer query supersedes this one or the control is destroyed.
  } else {
    console.error('Autocomplete failed', error);
  }
});
```

A cancelled request ends with:

```javascript
(false, null, { cancelled: true })
```

Cancellation is normal control flow. For example, typing again can supersede an in-flight autocomplete request.

## Promise errors

`sendGeocoderRequest()`, `sendPlaceDetailsRequest()`, and `resendPlacesRequestForMore()` reject on network errors, non-successful HTTP responses, or malformed responses. Handle rejections when calling them directly:

```javascript
try {
  const response = await autocomplete.sendGeocoderRequest('Berlin');
  console.log(response.features);
} catch (error) {
  if (!error?.cancelled) {
    console.error(error);
  }
}
```

`sendPlacesRequest()` reports a request failure through `places_request_end`; it rejects immediately only when category search is disabled.

## Custom request functions

Custom geocoder and Places request functions must resolve to a GeoJSON FeatureCollection with a `features` array:

```javascript
autocomplete.setSendGeocoderRequestFunc(async (value) => {
  const response = await fetch(`/geocoder-proxy?text=${encodeURIComponent(value)}`);

  if (!response.ok) {
    throw new Error(`Proxy returned ${response.status}`);
  }

  const data = await response.json();
  return {
    type: 'FeatureCollection',
    features: data.features
  };
});
```

The component rejects a response that does not contain an array at `features`. A custom Place Details request function is different: it resolves directly to the selected or enriched feature.

Pass `null` to a custom-request setter to restore the built-in request implementation.

## Runtime configuration

Setters affect subsequent requests. They do not repeat the current request automatically.

Places filter and bias setters reset pagination to the first page. Reload the active category when needed:

```javascript
autocomplete.setPlacesFilterByCircle({
  lon: 13.405,
  lat: 52.52,
  radiusMeters: 3000
});

await autocomplete.sendPlacesRequest();
```

`setValue()` only changes the displayed input. It does not send a request and does not emit `input` or `select`.

## Places pagination

`resendPlacesRequestForMore(true)` requests the current offset and appends unique results. The `places` event then emits the complete accumulated list.

`resendPlacesRequestForMore(false)`, or calling it without an argument, resets to offset zero and replaces the list.

With the built-in list, `enablePlacesLazyLoading: false` is the default and displays a **Load more** button while another page may be available. Set it to `true` to request more results near the end of the scroll area.

## Cleanup

Call `destroy()` before discarding the host element. It cancels active lifecycles, removes owned DOM listeners and markup, and is safe to call more than once.

```javascript
const autocomplete = new GeocoderAutocomplete(container, apiKey);

// When the page, modal, or component is removed:
autocomplete.destroy();
```

In React, return cleanup from the effect that creates the control:

```javascript
useEffect(() => {
  const control = new GeocoderAutocomplete(containerRef.current, apiKey);

  return () => control.destroy();
}, [apiKey]);
```

Do not reuse an instance after calling `destroy()`; create a new instance when the view mounts again.
