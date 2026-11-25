module.exports = require('../scripts/build-country-history.cjs')({
    directory: __dirname, data: require('./data.cjs'), validate: require('./validate.cjs'),
    globalName: 'COUNTRY_HISTORY_DATA', lastVerified: '2025-06-28'
});
