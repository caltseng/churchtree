const test = require('node:test'), assert = require('node:assert/strict'), fs = require('fs'), path = require('path'), vm = require('vm');
const dates = require('../historical-dates.js'), validate = require('./validate.cjs'), canonical = require('./data.cjs');
const clone = () => structuredClone(canonical);
test('calendar periods retain precision, leap days, duration and unknown bounds', () => {
    assert.equal(dates.period('1924-05').precision, 'month');
    assert(dates.period('2000-02-29').year > 2000);
    for (const value of ['1900-02-29', '2024-02-30', '1924-13', '635', '1924-00', '1924-01-00'])
        assert.throws(() => dates.period(value));
    assert.equal(dates.bounds({start: null, end: null, kind: 'unknown', basis: 'No terminal year'}), null);
    for (const date of [
        {start: '1924', end: '1923', kind: 'duration'}, {start: '1924', end: '1924-05', kind: 'duration'},
        {start: null, end: '1924', kind: 'unknown'}, {start: '1924', end: '1926', kind: 'point'}
    ]) assert.throws(() => dates.bounds({...date, basis: 'Fixture'}));
    const span = dates.bounds({start: '1924-05', end: '1924-06', kind: 'duration', basis: 'Council months'});
    assert(span.start > 1924 && span.end < 1925 && span.end > span.start);
    assert.equal(dates.label({start: '0635', end: '0635', kind: 'point'}), '635');
});
test('all research rows receive exactly one explicit publication disposition', () => {
    assert.equal(validate(canonical), canonical);
    assert.equal(canonical.events.filter(e => e.review === 'gap').length, 2);
    assert.equal(canonical.events.find(e => e.research === 'H01').date.start, '0635');
    assert.match(canonical.events.find(e => e.research === 'H01').testimony, /781/);
    assert.equal(canonical.events.find(e => e.research === 'H22').date.start, '1858-06-18');
    assert.match(canonical.events.find(e => e.research === 'H32').testimony, /1947.*2020/);
    assert.equal(canonical.events.find(e => e.research === 'H41').date.kind, 'uncertain');
    assert(!canonical.relations.some(r => ['origin', 'split', 'merge', 'continuation'].includes(r.type)));
    const missing = clone(); missing.events.pop(); assert.throws(() => validate(missing), /complete research roster/);
});
test('validator rejects corrupt IDs, dates, source references and relationship endpoints', () => {
    for (const mutate of [
        d => d.events.push({...d.events[0]}),
        d => d.events[0].date.start = '0635-02-30',
        d => d.events[0].lane_id = 'missing',
        d => d.events[0].claim_citations.date = ['missing'],
        d => d.citations[0].source_id = 'missing',
        d => d.citations[0].locator = '',
        d => d.sources[0].url = 'javascript:alert(1)',
        d => d.relations[0].to_id = 'missing',
        d => d.relations[0].to_id = d.relations[0].from_id,
        d => d.relations.push({...d.relations[0], id: 'duplicate-link'}),
        d => d.relations[0].type = 'continuation'
    ]) { const data = clone(); mutate(data); assert.throws(() => validate(data)); }
});
test('generated public route is isolated, citation-complete and excludes staging fields', () => {
    const root = path.resolve(__dirname, '../dist'), context = {window: {}};
    vm.runInNewContext(fs.readFileSync(path.join(root, 'china-history/public-data.js'), 'utf8'), context);
    const data = context.window.COUNTRY_HISTORY_DATA;
    assert.equal(data.events.length, canonical.events.length);
    const html = fs.readFileSync(path.join(root, 'china-history/index.html'), 'utf8');
    for (const event of data.events) {
        assert(html.includes('id="' + event.id + '"'));
        assert(!('research' in event));
        for (const id of Object.values(event.claim_citations).flat()) {
            const citation = data.citations.find(c => c.id === id), source = data.sources.find(s => s.id === citation.source_id);
            assert(source && citation.locator && !('research' in citation));
            assert(html.includes(source.url.replaceAll('&', '&amp;')));
        }
    }
    assert(!('held' in data));
    for (const file of ['data.cjs', 'build.cjs', 'validate.cjs', 'template.html', 'test-data.cjs', 'test-browser.cjs'])
        assert(!fs.existsSync(path.join(root, 'china-history', file)), 'Do not publish ' + file);
    assert(!fs.existsSync(path.join(root, 'docs/research')));
    const denominations = {window: {}};
    vm.runInNewContext(fs.readFileSync(path.join(root, 'data/data.js'), 'utf8'), denominations);
    const ids = new Set(denominations.window.CHURCHTREE_DATA.nodes.map(n => n.id));
    assert(data.events.every(e => !ids.has(e.id)), 'Do not mix China records into denomination discovery');
});
