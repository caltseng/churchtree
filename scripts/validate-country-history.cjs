const dates = require('../historical-dates.js');
const assert = require('node:assert/strict');
function validate(data, researchIds) {
    const index = (name, pattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/) => {
        assert(Array.isArray(data[name]), name + ' must be an array');
        const map = new Map();
        for (const row of data[name]) {
            assert(pattern.test(row.id) && !map.has(row.id), 'Invalid or duplicate ' + name + ' ID: ' + row.id);
            map.set(row.id, row);
        }
        return map;
    };
    const lanes = index('lanes'), events = index('events'), sources = index('sources'), citations = index('citations');
    index('relations');
    const text = (value, label) => assert(typeof value === 'string' && value.trim(), label + ' required');
    for (const key of ['title', 'scope', 'geography', 'limits']) text(data[key], key);
    for (const lane of lanes.values()) text(lane.label, 'Lane label');
    for (const source of sources.values()) {
        for (const key of ['title', 'publisher', 'published', 'perspective']) text(source[key], 'Source ' + key);
        assert.equal(new URL(source.url).protocol, 'https:', 'Source URL must be HTTPS');
    }
    for (const citation of citations.values()) {
        assert(sources.has(citation.source_id), 'Missing citation source');
        text(citation.locator, 'Citation locator');
        assert.match(citation.accessed, /^\d{4}-\d{2}-\d{2}$/);
        dates.period(citation.accessed);
    }
    function evidence(row, claims) {
        for (const claim of claims) {
            const ids = row.claim_citations?.[claim];
            assert(Array.isArray(ids) && ids.length && ids.every(id => citations.has(id)), 'Missing claim citation: ' + row.id + '/' + claim);
        }
    }
    const crosswalk = new Set();
    for (const event of events.values()) {
        assert(lanes.has(event.lane_id), 'Missing event lane');
        for (const key of ['title', 'summary', 'caveat']) text(event[key], 'Event ' + key);
        assert(['qualified', 'provisional', 'gap'].includes(event.review), 'Invalid review disposition');
        assert(!crosswalk.has(event.research), 'Duplicate research crosswalk');
        crosswalk.add(event.research);
        dates.bounds(event.date);
        assert.equal(event.review === 'gap', event.date.kind === 'unknown', 'Gaps must remain unplaced');
        evidence(event, ['date', 'summary']);
    }
    const links = new Set();
    for (const relation of data.relations) {
        assert(['attests', 'cooperation'].includes(relation.type), 'Unsupported relation type (not lineage)');
        assert(events.has(relation.from_id) && events.has(relation.to_id) && relation.from_id !== relation.to_id, 'Invalid relation endpoints');
        const key = [relation.type, relation.from_id, relation.to_id].join(':');
        assert(!links.has(key), 'Duplicate typed relation');
        links.add(key);
        text(relation.summary, 'Relation summary');
        evidence(relation, ['summary']);
    }
    for (const [id, reason] of Object.entries(data.held)) {
        assert(!crosswalk.has(id), 'Held record must not be imported');
        text(reason, 'Held-record reason');
        crosswalk.add(id);
    }
    assert.deepEqual([...crosswalk].sort(), [...researchIds].sort(), 'Account for the complete research roster');
    return data;
}
module.exports = validate;
