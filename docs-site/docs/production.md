# Production guidance

## Protect the API key

A browser API key is visible to users by design. Restrict it in the Geoapify Projects dashboard to the HTTP referrers or origins that should use it. Use separate keys for local development and production, and rotate a key if it is exposed outside its intended sites.

Do not treat minification or storing a key in frontend environment variables as secret storage. For server-only restrictions or additional access control, send requests through your own backend and configure a [custom request function](lifecycle-and-errors.md#custom-request-functions).

## Treat location as user-selected data

Autocomplete improves address entry, but a suggestion is not proof that a delivery point, entrance, or retained non-verified component is precise. For high-impact workflows:

- let the user review the formatted address;
- show the point on a map when coordinate precision matters;
- inspect `nonVerifiedParts` and rank/confidence properties;
- obtain explicit confirmation before submission.

Render any API or proxy data as text, not as trusted HTML. The built-in control uses text-based DOM rendering for result labels.

## Control usage

Choose a debounce delay and suggestion limit appropriate for the interface. Category search and optional Place Details can produce additional API calls. Review current limits and credit costs on the [Geoapify pricing page](https://www.geoapify.com/pricing/), and monitor usage in the Projects dashboard.

Pin the package major version in CDN URLs rather than using `@latest`.

## Troubleshooting

### The dropdown does not appear

- Confirm that one of the packaged theme stylesheets is loaded.
- Check that the container exists before constructing the control.
- Inspect the browser console and Network panel for API-key, CORS, quota, or request errors.
- Ensure parent elements are not clipping the dropdown with `overflow: hidden`.

### Requests return 401, 403, or CORS errors

- Confirm the API key belongs to an active project.
- Check that the current hostname and protocol match the configured origin/referrer restrictions.
- Add local development origins separately from production origins.

### Category selection shows no Places

- Set `addCategorySearch: true`.
- Provide an appropriate Places filter or bias.
- If using the built-in list, set `showPlacesList: true`.
- Listen to `places_request_end` and distinguish failures from `{ cancelled: true }`.

### Load more disappears

The built-in list hides **Load more** when a returned page contains fewer results than `placesLimit`, including zero. This indicates that no additional page is currently known.

### A custom response is rejected

Custom geocoder and Places functions must resolve to an object containing `features: []`. See [Custom request functions](lifecycle-and-errors.md#custom-request-functions).

### A framework view leaks listeners or duplicates controls

Call `destroy()` in the framework cleanup/unmount hook. See [Cleanup](lifecycle-and-errors.md#cleanup).
