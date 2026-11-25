const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, 'data', 'country-outlines.geojson');
const sourceURL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson';

function countryOutline(code) {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const feature = data.features.find(item => item.properties.ADM0_A3 === code);
  if (!feature) throw new Error('Missing country outline: ' + code + '. See docs/country-outlines.md.');
  const geometry = feature.geometry;
  if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) throw new Error('Expected country polygons: ' + code);
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const coordinates = polygons.flat(2);
  const latitudes = coordinates.map(point => point[1]);
  const midLatitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const project = ([longitude, latitude]) => [longitude * Math.cos(midLatitude * Math.PI / 180), -latitude];
  const projected = coordinates.map(project);
  const xs = projected.map(point => point[0]), ys = projected.map(point => point[1]);
  const left = Math.min(...xs), top = Math.min(...ys);
  const width = Math.max(...xs) - left, height = Math.max(...ys) - top;
  const scale = Math.min(288 / width, 208 / height);
  const xOffset = (320 - width * scale) / 2, yOffset = (240 - height * scale) / 2;
  const point = coordinate => {
    const [x, y] = project(coordinate);
    return `${(xOffset + (x - left) * scale).toFixed(2)},${(yOffset + (y - top) * scale).toFixed(2)}`;
  };
  const d = polygons.flatMap(polygon => polygon.map(ring => 'M' + ring.map(point).join('L') + 'Z')).join('');
  return `<svg class="country-outline" viewBox="0 0 320 240" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${d}"/></svg>`;
}

if (require.main === module) {
  if (process.argv[2] !== '--import' || !process.argv[3]) throw new Error('Usage: node scripts/country-outlines.cjs --import <Natural Earth GeoJSON>');
  const source = fs.readFileSync(process.argv[3]);
  const collection = JSON.parse(source);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
  const features = config.countryHistories.map(country => {
    const feature = collection.features.find(item => item.properties.ADM0_A3 === country.outline);
    if (!feature) throw new Error('No Natural Earth feature for ' + country.id);
    return {type: 'Feature', properties: {ADM0_A3: country.outline}, geometry: feature.geometry};
  });
  fs.writeFileSync(dataFile, JSON.stringify({
    type: 'FeatureCollection', source: sourceURL,
    sourceSHA256: crypto.createHash('sha256').update(source).digest('hex'),
    license: 'Public domain; https://www.naturalearthdata.com/about/terms-of-use/',
    features
  }) + '\n');
  console.log('Imported outlines for ' + features.length + ' registered country histories.');
}

module.exports = countryOutline;
