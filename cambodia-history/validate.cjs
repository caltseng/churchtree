const validateCountry = require('../scripts/validate-country-history.cjs');
const roster = Array.from({length: 57}, (_, i) => 'KH' + String(i + 1).padStart(2, '0'));
module.exports = data => validateCountry(data, roster);
if (require.main === module) {
    module.exports(require('./data.cjs'));
    console.log('Cambodia chronology: complete research dispositions, dates and claim evidence resolve.');
}
