const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
function files(folder) { return fs.readdirSync(folder).flatMap(name => { const file = path.join(folder, name); return fs.statSync(file).isDirectory() ? files(file) : [file]; }); }
const scripts = [...fs.readdirSync(root).filter(n => n.endsWith('.js')).map(n => path.join(root, n)), ...files(path.join(root, 'scripts')).filter(n => n.endsWith('.cjs')), ...['us-denominations', 'country-history', ...require('../site.config.json').countryHistories.map(country => country.path)].flatMap(folder => files(path.join(root, folder)).filter(n => /\.(cjs|js)$/.test(n)))];
for (const script of scripts) { const check = spawnSync(process.execPath, ['--check', script], { encoding: 'utf8' }); if (check.status !== 0) { process.stderr.write(check.stderr); process.exit(1); } }
for (const file of files(path.join(root, 'data')).filter(n => n.endsWith('.json'))) JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
console.log(`Syntax checked ${scripts.length} scripts and all source JSON.`);
