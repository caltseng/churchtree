module.exports = require('../scripts/build-country-history.cjs')({
    directory: __dirname, data: require('./data.cjs'), validate: require('./validate.cjs'),
    globalName: 'CHINA_HISTORY_DATA', lastVerified: '2024-10-22'
});
