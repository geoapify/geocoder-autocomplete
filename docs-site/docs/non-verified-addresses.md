## Working with non-verified address components

In some cases, Geoapify may return address components that are non-verified, such as newly constructed streets or buildings that are not yet available in databases. These non-verified components are highlighted in the address suggestions.

You can choose to:
1. Display these components with a warning to the user (e.g., in red).
2. Allow users to manually correct or confirm these non-verified details before finalizing the address.
3. Use the **`allowNonVerifiedHouseNumber`** and **`allowNonVerifiedStreet`** options to handle such cases.

For example, when a house number or street is not verified, the result will include a `nonVerifiedParts` array in the address object, which you can use to highlight or notify users about the provisional status.

### How it works

The library operates by utilizing the API to retrieve essential address details, including the parsed address, the located address, and a match type as results. Using this information as a foundation, the library enhances the result by filling in missing values, such as house numbers, to provide a more complete and user-friendly address representation.

Notably, non-verified address components are denoted with a "non-verified" class, making them visually distinct by default, often highlighted in red to indicate their provisional or unverified status.

It's essential to note that the GPS coordinates associated with the results correspond to the actual locations. Users have the flexibility to adjust these coordinates as needed to ensure accuracy.

Furthermore, the result object is expanded to include a list of non-verified properties. For instance:

```json
{
    "type": "Feature",
    "properties": {
	...
        "address_line1": "Bürgermeister-Heinrich-Straße 60",
        "address_line2": "93077 Bad Abbach, Germany",
        "housenumber": "60",
        "nonVerifiedParts": [
            "housenumber"
        ]
    },
   ...
}
```

This extended result object provides transparency by clearly indicating which address components are non-verified, allowing for informed decision-making and customization based on the level of validation required for your specific use case.
