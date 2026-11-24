const fs = require('fs'), path = require('path');
const dates = require('../historical-dates.js');
const validate = require('./validate.cjs');
const canonical = validate(require('./data.cjs'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
// Only these public fields leave the editorial input; no research packet or staging fields.
const data = {
    title: canonical.title, scope: canonical.scope, geography: canonical.geography, limits: canonical.limits,
    lanes: canonical.lanes.map(({id, label}) => ({id, label})),
    events: canonical.events.map(({id, lane_id, title, summary, caveat, date, testimony, claim_citations, review, aliases}) =>
        ({id, lane_id, title, summary, caveat, date, testimony, claim_citations, review, aliases})),
    relations: canonical.relations.map(({id, type, from_id, to_id, summary, claim_citations}) =>
        ({id, type, from_id, to_id, summary, claim_citations})),
    sources: canonical.sources.map(({id, title, publisher, published, url, perspective}) => ({id, title, publisher, published, url, perspective})),
    citations: canonical.citations.map(({id, source_id, locator, accessed}) => ({id, source_id, locator, accessed}))
};
const lane = new Map(data.lanes.map(l => [l.id, l.label]));
const sorted = [...data.events].sort((a, b) => (dates.bounds(a.date)?.start ?? Infinity) - (dates.bounds(b.date)?.start ?? Infinity) || a.id.localeCompare(b.id));
function evidence(ids) {
    return [...new Set(ids)].map(id => {
        const c = data.citations.find(c => c.id === id), s = data.sources.find(s => s.id === c.source_id);
        return `<li><a href="${esc(s.url)}">${esc(s.title)}</a> <span>${esc(s.publisher)}; ${esc(s.published)}</span><p>${esc(c.locator)}</p><details><summary>Source context</summary><p>${esc(s.perspective)} Accessed ${esc(c.accessed)}.</p></details></li>`;
    }).join('');
}
function article(event) {
    const relations = data.relations.filter(r => [r.from_id, r.to_id].includes(event.id));
    return `<article id="${event.id}" data-record="${event.id}" data-lane="${event.lane_id}" tabindex="-1">
<p class="record-meta">${esc(lane.get(event.lane_id))} / ${esc(event.review)} / ${esc(dates.label(event.date))}</p>
<h3><a href="#${event.id}">${esc(event.title)}</a></h3>
<p>${esc(event.summary)}</p><p class="critical-note">${esc(event.caveat)}</p>
<details class="record-evidence"><summary>Date basis and sources</summary><p>${esc(event.date.basis)}${event.testimony ? '. Testimony: ' + esc(event.testimony) + '.' : ''}</p>
<ul class="sources">${evidence(Object.values(event.claim_citations).flat())}</ul></details>
${relations.map(r => {
    const target = r.from_id === event.id ? r.to_id : r.from_id;
    return `<div class="record-relation"><p><strong>${esc(r.type)} (not lineage):</strong> ${esc(r.summary)} <a href="#${target}">${esc(data.events.find(e => e.id === target).title)}</a></p><details><summary>Relationship evidence</summary><ul class="sources">${evidence(r.claim_citations.summary)}</ul></details></div>`;
}).join('')}
<p class="source-credit">Source: ${[...new Set(event.claim_citations.summary.map(id => data.citations.find(c => c.id === id).source_id))].map(id => {
    const s = data.sources.find(s => s.id === id);
    return `<a href="${esc(s.url)}">${esc(s.publisher)}</a>`;
}).join('; ')}.</p></article>`;
}
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const html = template.replace('<!--SCOPE-->', `<p>${esc(data.scope)}</p><p class="critical-note">Last verified event: 2024-10-22. Gaps are not extinction dates.</p>`)
    .replace('<!--INFO-->', `<p>${esc(data.geography)}</p><p>${esc(data.limits)}</p><p>Solid interval marks show periods; dashed intervals show approximate or competing date bases, not institutional continuity. Undated gaps remain in the text view. Sorting within partial dates is an editorial convention.</p><p>All summaries are original paraphrases with passage locators. No scans, portraits, Bible text or translated extracts are reproduced. Sources express different institutional perspectives; linked versions may depend on the same underlying evidence.</p>`)
    .replace('<!--LANES-->', data.lanes.map(l => `<option value="${l.id}">${esc(l.label)}</option>`).join(''))
    .replace('<!--RECORDS-->', sorted.map(article).join('\n'));
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
fs.writeFileSync(path.join(__dirname, 'public-data.js'), '// Generated approved public fields. Do not edit.\nwindow.CHINA_HISTORY_DATA = ' + JSON.stringify(data, null, 2).replace(/</g, '\\u003c') + ';\n');
console.log(`Built Church in China: ${data.events.length} selected records (including unplaced gaps); isolated from denomination data.`);
module.exports = {data, article};
