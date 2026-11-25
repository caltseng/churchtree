const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');
const canonical = require('./data.cjs'), validate = require('./validate.cjs');
const repo = path.resolve(__dirname, '..'), dist = path.join(repo, 'dist');
test('Cambodia selection exactly reconciles researched and held rows without false precision', () => {
    validate(canonical);
    const chronology = fs.readFileSync(path.join(repo, 'docs/research/cambodia/chronology.md'), 'utf8');
    const rows = [...chronology.matchAll(/^\| (KH\d+) \|(.+)$/gm)];
    assert.equal(rows.length, 50);
    for (const [, id, text] of rows) {
        const selected = canonical.events.filter(e => e.research === id);
        assert.equal(selected.length, text.includes('| Selected') ? 1 : 0, id);
        assert.equal(Object.hasOwn(canonical.held, id), text.includes('| Held'), id);
    }
    const byId = Object.fromEntries(canonical.events.map(e => [e.id, e]));
    assert.equal(byId['da-cruz-mission'].date.kind, 'uncertain');
    assert.equal(byId['da-cruz-mission'].date.end, '1556');
    assert.equal(byId['women-correspondence-report'].date.start, '1975-06-02');
    assert.match(byId['women-correspondence-report'].date.basis, /report/);
    assert.match(byId['salas-consecration'].caveat, /1976 and 1977/);
    assert(!canonical.events.some(e => e.research === 'KH26'));
    assert.equal(byId['khmer-coadjutor-appointment'].date.start, '2025-06-28');
    for (const mutate of [
        d => d.events.pop(),
        d => d.held.KH01 = 'Duplicate selected record',
        d => d.events[0].claim_citations.date = ['missing'],
        d => d.events[0].date.start = '1555-02-30',
        d => d.relations[0].type = 'origin',
        d => d.relations[0].to_id = 'missing'
    ]) {
        const data = structuredClone(canonical); mutate(data);
        assert.throws(() => validate(data));
    }
});
test('public artifacts retain source locators, strip research and isolate country records', () => {
    const context = {window: {}};
    vm.runInNewContext(fs.readFileSync(path.join(dist, 'cambodia-history/public-data.js'), 'utf8'), context);
    const data = context.window.COUNTRY_HISTORY_DATA;
    const html = fs.readFileSync(path.join(dist, 'cambodia-history/index.html'), 'utf8');
    assert.equal(data.events.length, canonical.events.length);
    assert(!Object.hasOwn(data, 'held'));
    for (const event of data.events) {
        assert(html.includes('id="' + event.id + '"'));
        assert(!Object.hasOwn(event, 'research'));
        for (const id of Object.values(event.claim_citations).flat()) {
            const citation = data.citations.find(c => c.id === id);
            const source = data.sources.find(s => s.id === citation.source_id);
            assert(citation.locator && citation.accessed && source.perspective);
            assert(html.includes(source.url.replaceAll('&', '&amp;')));
        }
    }
    for (const file of ['data.cjs', 'build.cjs', 'template.html', 'validate.cjs', 'test-data.cjs', 'test-browser.cjs'])
        assert(!fs.existsSync(path.join(dist, 'cambodia-history', file)));
    assert(!fs.existsSync(path.join(dist, 'docs/research/cambodia')));
    const denominations = {window: {}};
    vm.runInNewContext(fs.readFileSync(path.join(dist, 'data/data.js'), 'utf8'), denominations);
    assert(data.events.every(e => !denominations.window.CHURCHTREE_DATA.nodes.some(n => n.id === e.id)));
});
test('one generated country registry drives the selector and every registered builder', () => {
    const config = require('../site.config.json');
    const html = fs.readFileSync(path.join(dist, 'global-church/index.html'), 'utf8');
    assert.equal(config.pages.find(p => p.id === 'global-church').path, 'global-church/');
    assert(config.countryHistories.some(c => c.id === 'china-history'));
    assert(config.countryHistories.some(c => c.id === 'cambodia-history'));
    assert.equal((html.match(/class="tool-card(?: [^"]*)?"/g) || []).length, config.countryHistories.length);
    for (const country of config.countryHistories) {
        assert(html.includes('href="../' + country.path + '"'));
        assert(fs.existsSync(path.join(dist, country.path, 'index.html')));
        assert(fs.existsSync(path.join(repo, country.path, 'build.cjs')));
    }
    const sourceIndex = fs.readFileSync(path.join(repo, 'docs/research/cambodia/sources.md'), 'utf8');
    for (const citation of canonical.citations) assert(sourceIndex.includes('| ' + citation.id.toUpperCase() + ' |'));
});
