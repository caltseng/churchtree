const validateCountry = require('../scripts/validate-country-history.cjs');
const roster = Array.from({length: 54}, (_, i) => 'H' + String(i + 1).padStart(2, '0'));
module.exports = data => validateCountry(data, roster);
if (require.main === module) {
    module.exports(require('./data.cjs'));
    console.log('China chronology: IDs, calendar periods, roster dispositions, endpoints and evidence resolve.');
}
