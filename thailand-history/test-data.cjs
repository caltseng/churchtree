const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');
const canonical = require('./data.cjs'), validate = require('./validate.cjs');
const clone = () => structuredClone(canonical);

test('Thailand research selection preserves held conflicts and date/testimony boundaries', () => {
    validate(canonical);
    const records = new Map(canonical.events.map(event => [event.research, event]));
    assert.equal(records.size, 40);
    assert.deepEqual(Object.keys(canonical.held).sort(), ['H07', 'H41', 'H42', 'H43']);
    assert.match(records.get('H01').caveat, /Not the first-ever/);
    assert.equal(records.get('H12').date.start, '1867-04');
    assert.equal(records.get('H15').date.start, '1878-10-08');
    assert.match(records.get('H15').testimony, /1912/);
    assert.equal(records.get('H19').date.kind, 'uncertain');
    assert.equal(records.get('H19').date.end, '1914');
    assert.match(records.get('H19').caveat, /Old Testament remained incomplete/);
    assert.equal(records.get('H39').date.start, '2021-12');
    assert.match(records.get('H39').caveat, /not a matching denominator/);
    assert.match(records.get('H40').testimony, /2023.*2024/);
    assert.deepEqual(canonical.relations, []);
});

test('Thailand roster, claim evidence and no-lineage gates reject unsafe imports', () => {
    for (const mutate of [
        d => d.events.pop(),
        d => d.events[0].research = 'H41',
        d => d.events[0].claim_citations.date = ['unread-source'],
        d => d.citations[0].locator = '',
        d => d.events[0].date.start = '1567-02-30',
        d => d.relations.push({
            id: 'invented-descent', type: 'continuation', from_id: d.events[0].id,
            to_id: d.events[1].id, summary: 'Unsupported', claim_citations: {summary: ['resident-mission']}
        })
    ]) {
        const data = clone(); mutate(data); assert.throws(() => validate(data));
    }
});

test('Thailand public selection has complete credits without private research or copied renderer', () => {
    const root = path.resolve(__dirname, '../dist');
    const context = {window: {}};
    vm.runInNewContext(fs.readFileSync(path.join(root, 'thailand-history/public-data.js'), 'utf8'), context);
    const data = context.window.COUNTRY_HISTORY_DATA;
    assert.deepEqual(Array.from(data.events, event => event.id).sort(), canonical.events.map(event => event.id).sort());
    assert(!('held' in data));
    assert(data.events.every(event => !('research' in event)));
    assert(data.citations.every(citation => !('research' in citation)));
    const html = fs.readFileSync(path.join(root, 'thailand-history/index.html'), 'utf8');
    const escape = value => value.replace(/[&<>"']/g, character =>
        ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
    for (const event of data.events) {
        const article = html.split(`<article id="${event.id}"`)[1]?.split('</article>')[0];
        assert(article, event.id);
        assert.match(article, /class="source-credit"/);
        assert.match(article, /class="critical-note"/);
        for (const id of Object.values(event.claim_citations).flat()) {
            const citation = data.citations.find(row => row.id === id);
            const source = data.sources.find(row => row.id === citation.source_id);
            assert(article.includes(source.url.replaceAll('&', '&amp;')));
            assert(article.includes(escape(citation.locator)));
        }
    }
    assert.match(html, /Last verified event: 2023/);
    assert.match(html, /\.\.\/china-history\/controller\.js/);
    assert.match(html, /\.\.\/china-history\/history\.css/);
    assert(!/CHINA_HISTORY_DATA/.test(fs.readFileSync(path.join(root, 'thailand-history/public-data.js'), 'utf8')));
    assert.deepEqual(fs.readdirSync(path.join(root, 'thailand-history')).sort(), ['index.html', 'public-data.js']);
    assert(!fs.existsSync(path.join(root, 'docs/research/thailand')));
    const selection = fs.readFileSync(path.join(root, 'global-church/index.html'), 'utf8');
    assert.match(selection, /thailand-history/);
    assert.match(selection, /china-history/);
    const denominations = {window: {}};
    vm.runInNewContext(fs.readFileSync(path.join(root, 'data/data.js'), 'utf8'), denominations);
    const ids = new Set(denominations.window.CHURCHTREE_DATA.nodes.map(node => node.id));
    assert(data.events.every(event => !ids.has(event.id)));
});

test('research packet maps every selected/held row and every admitted citation', () => {
    const docs = path.resolve(__dirname, '../docs/research/thailand');
    const chronology = fs.readFileSync(path.join(docs, 'chronology.md'), 'utf8');
    const rows = [...chronology.matchAll(/^\| (H\d{2}) \|/gm)].map(match => match[1]);
    assert.deepEqual(rows.sort(), [...canonical.events.map(event => event.research), ...Object.keys(canonical.held)].sort());
    const sources = fs.readFileSync(path.join(docs, 'sources.md'), 'utf8');
    for (const citation of canonical.citations) {
        assert(sources.includes('| ' + citation.research + ' |'), citation.research);
    }
    assert.equal(new Set(canonical.events.map(event => event.research)).size, canonical.events.length);
});
