const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const dates = require('../historical-dates.js');
const {esc: escape} = require('../html-escape.js');
const {countryHistories} = require('../site.config.json');
const repo = path.resolve(__dirname, '..');
const root = path.resolve(repo, process.env.CHURCHTREE_TEST_ROOT || 'dist');

test('calendar periods retain precision, leap days, duration and unknown bounds', () => {
    assert.equal(dates.period('1924-05').precision, 'month');
    assert(dates.period('2000-02-29').year > 2000);
    for (const value of ['1900-02-29', '2024-02-30', '1924-13', '635', '1924-00', '1924-01-00'])
        assert.throws(() => dates.period(value));
    assert.equal(dates.bounds({start: null, end: null, kind: 'unknown', basis: 'Fixture'}), null);
    for (const date of [
        {start: '1924', end: '1923', kind: 'duration'}, {start: '1924', end: '1924-05', kind: 'duration'},
        {start: null, end: '1924', kind: 'unknown'}, {start: '1924', end: '1926', kind: 'point'}
    ]) assert.throws(() => dates.bounds({...date, basis: 'Fixture'}));
    const span = dates.bounds({start: '1924-05', end: '1924-06', kind: 'duration', basis: 'Fixture'});
    assert(span.start > 1924 && span.end < 1925 && span.end > span.start);
    assert.equal(dates.label({start: '0635', end: '0635', kind: 'point'}), '635');
});

for (const country of countryHistories) {
    const canonical = require(path.join(repo, country.path, 'data.cjs'));
    const validate = require(path.join(repo, country.path, 'validate.cjs'));
    test(`${country.title}: validator rejects broken rosters, evidence, dates and relations`, () => {
        assert.equal(validate(canonical), canonical);
        const relation = {
            id: 'fixture-link', type: 'attests', from_id: canonical.events[0].id,
            to_id: canonical.events[1].id, summary: 'Fixture',
            claim_citations: {summary: [canonical.citations[0].id]}
        };
        for (const mutate of [
            d => d.events.pop(),
            d => d.events.push({...d.events[0]}),
            d => d.events[0].date.start = '2000-02-30',
            d => d.events[0].lane_id = 'missing',
            d => d.events[0].claim_citations.date = ['missing'],
            d => d.citations[0].source_id = 'missing',
            d => d.citations[0].locator = '',
            d => d.sources[0].url = 'javascript:alert(1)',
            d => d.held[d.events[0].research] = 'Duplicate selected record',
            d => d.relations = [{...relation, to_id: 'missing'}],
            d => d.relations = [{...relation, to_id: relation.from_id}],
            d => d.relations = [relation, {...relation, id: 'duplicate-link'}],
            d => d.relations = [{...relation, type: 'continuation'}]
        ]) {
            const data = structuredClone(canonical);
            mutate(data);
            assert.throws(() => validate(data));
        }
    });

    test(`${country.title}: public output retains claim-level credits without private research`, () => {
        const context = {window: {}};
        vm.runInNewContext(fs.readFileSync(path.join(root, country.path, 'public-data.js'), 'utf8'), context);
        const data = context.window.COUNTRY_HISTORY_DATA;
        assert.deepEqual(Array.from(data.events, event => event.id), canonical.events.map(event => event.id));
        assert(!('held' in data));
        assert(data.citations.every(citation => !('research' in citation)));
        const html = fs.readFileSync(path.join(root, country.path, 'index.html'), 'utf8');
        for (const event of data.events) {
            assert(!('research' in event));
            const article = html.split(`<article id="${event.id}"`)[1]?.split('</article>')[0];
            assert(article, event.id);
            assert.match(article, /class="source-credit"/);
            assert.match(article, /class="critical-note"/);
            for (const id of Object.values(event.claim_citations).flat()) {
                const citation = data.citations.find(row => row.id === id);
                const source = data.sources.find(row => row.id === citation.source_id);
                assert(article.includes(escape(source.url)));
                assert(article.includes(escape(citation.locator)));
            }
        }
        assert.match(html, /\.\.\/country-history\/controller\.js/);
        assert.match(html, /\.\.\/country-history\/history\.css/);
        assert.deepEqual(fs.readdirSync(path.join(root, country.path)).sort(), ['index.html', 'public-data.js']);
        assert(!fs.existsSync(path.join(root, 'docs/research')));
        const denominations = {window: {}};
        vm.runInNewContext(fs.readFileSync(path.join(root, 'data/data.js'), 'utf8'), denominations);
        const ids = new Set(denominations.window.CHURCHTREE_DATA.nodes.map(node => node.id));
        assert(data.events.every(event => !ids.has(event.id)));
    });
}

test('the country registry drives every selector card and generated route', () => {
    const html = fs.readFileSync(path.join(root, 'global-church/index.html'), 'utf8');
    assert.equal((html.match(/class="tool-card(?: [^"]*)?"/g) || []).length, countryHistories.length);
    for (const country of countryHistories) {
        assert(html.includes('href="../' + country.path + '"'));
        assert(fs.existsSync(path.join(root, country.path, 'index.html')));
    }
});
