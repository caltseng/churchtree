const validateCountry = require('../china-history/validate.cjs');
const roster = Array.from({length: 44}, (_, i) => 'H' + String(i + 1).padStart(2, '0'));
module.exports = data => validateCountry(data, roster);
if (require.main === module) {
    module.exports(require('./data.cjs'));
    console.log('Thailand chronology: calendar periods, 44-row dispositions and claim evidence resolve.');
}
