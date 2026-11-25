# Country picker outlines

The picker reads destinations only from `site.config.json` → `countryHistories`.
Each entry's `outline` is the Natural Earth `ADM0_A3` feature identifier, not
another destination registry. Missing geometry fails the build explicitly.

## Source and reuse

Natural Earth **v5.1.2, 1:50m Admin 0 countries**, by Natural Earth's contributors:

- [Versioned source GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson)
- [Public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/)

`data/country-outlines.geojson` retains the source geometry for registered
destinations, the exact source URL and the SHA-256 of the full downloaded source.
Only non-geographic properties are discarded. No runtime network request or map
dependency is needed. The page carries visible credit and a native disclosure
with source, reuse terms and interpretation limits.

## Reproduce or add an outline

Download that versioned GeoJSON outside the repository. Add the country's
`outline` identifier to its existing registry entry, then run:

```sh
node scripts/country-outlines.cjs --import <downloaded-geojson>
npm run build
```

Commit the subset and generated `global-church/index.html` alongside source edits.
Do not add unavailable destinations just because source geometry exists.

`scripts/country-outlines.cjs` uses a local equirectangular projection with the
standard parallel at the midpoint of each geometry's latitude bounds. Longitude
is multiplied by the cosine of that latitude; latitude is inverted for SVG.
All polygons, islands and interior rings are retained, uniformly fitted into a
320 × 240 viewBox with padding, and rounded to two SVG decimal places.
The source's generalized boundaries are not additionally simplified.

Shapes are north-up, independently fitted and **not at a shared scale**. They
are present-day navigation illustrations, not historical coverage or claims
about disputed borders. No historical text or dates are derived from geometry.
