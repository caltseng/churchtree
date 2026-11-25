const fs=require('fs'),path=require('path'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),fixtures=path.join(root,'.tmp','build-guard-checks');
if(path.dirname(fixtures)!==path.join(root,'.tmp')||path.basename(fixtures)!=='build-guard-checks'||(fs.existsSync(fixtures)&&fs.lstatSync(fixtures).isSymbolicLink()))throw Error('Unsafe fixture path');
fs.rmSync(fixtures,{recursive:true,force:true});fs.mkdirSync(fixtures,{recursive:true});
function run(script,arg){return spawnSync(process.execPath,[path.join(__dirname,script),arg],{encoding:'utf8'});}
const data={nodes:[{id:'a',name:'Fixture',start_year:1600,citations:['missing']}],edges:[{id:'bad',from_id:'a',to_id:'absent'}],events:[],sources:[],citations:[]};
const file=path.join(fixtures,'bad-data.js');fs.writeFileSync(file,'window.CHURCHTREE_DATA='+JSON.stringify(data)+';');
const bad=run('validate-data.cjs',file);assert.notEqual(bad.status,0);assert.match(bad.stderr,/Dangling edge/);assert.match(bad.stderr,/Unresolved citation/);
const site=path.join(fixtures,'site');fs.mkdirSync(site);fs.writeFileSync(path.join(site,'CNAME'),'main-branch.com\n');fs.writeFileSync(path.join(site,'index.html'),'<link rel="stylesheet" href="missing.css">');
const missing=run('verify-site.cjs',site);assert.notEqual(missing.status,0);assert.match(missing.stderr,/missing missing.css/);
fs.writeFileSync(path.join(site,'missing.css'),'');assert.equal(run('verify-site.cjs',site).status,0);
fs.mkdirSync(path.join(site,'scripts'));const exposed=run('verify-site.cjs',site);assert.notEqual(exposed.status,0);assert.match(exposed.stderr,/Development files must not be published/);
const buildCountry = require('./build-country-history.cjs');
const country = {...require('../site.config.json').countryHistories[0], path: 'fixture-history/', title: 'Fixture <country> & "$&"', searchPlaceholder: 'Try "fixture" <search>'};
const directory = path.join(fixtures, country.path);
fs.mkdirSync(directory);
fs.copyFileSync(path.join(root, 'china-history/data.cjs'), path.join(directory, 'data.cjs'));
fs.writeFileSync(path.join(directory, 'validate.cjs'), `module.exports = require(${JSON.stringify(path.join(root, 'china-history/validate.cjs'))});`);
const {data: countryData} = buildCountry(country, {root: fixtures, domain: 'fixture.example'});
function assertCompactBundle(file, name, expected) {
    const text = fs.readFileSync(file, 'utf8');
    const payload = text.slice(text.indexOf(' = ') + 3).trim().replace(/;$/, '');
    assert(!/[\r\n\t]/.test(payload), 'Bundle payload must not contain indentation or line breaks');
    assert.equal(payload, JSON.stringify(JSON.parse(payload)).replace(/</g, '\\u003c'));
    const context = {window: {}};
    vm.runInNewContext(text, context);
    assert.deepEqual(JSON.parse(JSON.stringify(context.window[name])), JSON.parse(JSON.stringify(expected)));
}
assertCompactBundle(path.join(directory, 'public-data.js'), 'COUNTRY_HISTORY_DATA', countryData);
const generated = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
assert(generated.includes('Church in Fixture &lt;country&gt; &amp; &quot;$&amp;&quot;'));
assert(generated.includes('placeholder="Try &quot;fixture&quot; &lt;search&gt;"'));
assert(generated.includes('https://fixture.example/fixture-history/'));
assert(generated.includes('../country-history/controller.js'));
assert(!generated.includes('{{'));
assert(!fs.existsSync(path.join(directory, 'template.html')));
assert(!fs.existsSync(path.join(directory, 'build.cjs')));
assert.throws(() => buildCountry({...country, path: '../escape/'}, {root: fixtures}), /Invalid country path/);
assert.throws(() => buildCountry({...country, lastVerified: '2024-02-30'}, {root: fixtures}));
assert.throws(() => buildCountry({...country, pageDescription: ''}, {root: fixtures}), /Missing country pageDescription/);
const fixtureScripts = path.join(fixtures, 'scripts');
fs.mkdirSync(fixtureScripts);
fs.copyFileSync(path.join(__dirname, 'build-site.cjs'), path.join(fixtureScripts, 'build-site.cjs'));
for (const script of ['scripts/build-home.cjs', 'westminster/build.cjs', 'scripts/build-catechisms.cjs', 'us-denominations/build.cjs']) {
    fs.mkdirSync(path.dirname(path.join(fixtures, script)), {recursive: true});
    fs.writeFileSync(path.join(fixtures, script), '');
}
fs.writeFileSync(path.join(fixtureScripts, 'build-country-history.cjs'),
    `const build = require(${JSON.stringify(path.join(__dirname, 'build-country-history.cjs'))});
const config = require('../site.config.json');
for (const country of config.countryHistories) build(country, {root: require('path').resolve(__dirname, '..'), domain: config.domain});`);
fs.mkdirSync(path.join(fixtures, 'data/common'), {recursive: true});
fs.mkdirSync(path.join(fixtures, 'data/sets'));
for (const type of ['sources', 'citations']) fs.writeFileSync(path.join(fixtures, 'data/common', type + '.json'), '[]');
const fixtureSet = path.join(fixtures, 'data/sets/fixture');
fs.mkdirSync(fixtureSet);
const fixtureNodes = [{id: 'fixture', name: 'Keep  double spaces\nand a newline', start_year: 1600}];
fs.writeFileSync(path.join(fixtureSet, 'nodes.json'), JSON.stringify(fixtureNodes));
fs.writeFileSync(path.join(fixtureSet, 'edges.json'), '[]');
fs.writeFileSync(path.join(fixtures, 'site.config.json'), JSON.stringify({
    domain: 'fixture.example', publicDirectories: [], publicExtensions: ['.html', '.js'],
    publicFiles: [], countryHistories: [country]
}));
const registered = spawnSync(process.execPath, [path.join(fixtureScripts, 'build-site.cjs')], {encoding: 'utf8'});
assert.equal(registered.status, 0, registered.stderr);
assert.deepEqual(fs.readdirSync(path.join(fixtures, 'dist', country.path)).sort(), ['index.html', 'public-data.js']);
assert.equal(fs.readFileSync(path.join(fixtures, 'dist', country.path, 'index.html'), 'utf8'), generated);
assertCompactBundle(path.join(fixtures, 'dist/data/data.js'), 'CHURCHTREE_DATA',
    {nodes: fixtureNodes, edges: [], events: [], sources: [], citations: []});
console.log('Broken data, missing assets and exposed development files are rejected.');
