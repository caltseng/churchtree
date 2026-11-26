const fs = require('fs'), path = require('path');
const dates = require('../historical-dates.js');
const {esc} = require('../html-escape.js');
const shell = require('./page-shell.cjs');
const {loadCountry} = require('./validate-country-history.cjs');
module.exports = function buildCountryHistory(country, {root = path.resolve(__dirname, '..'), domain = 'main-branch.com'} = {}) {
if (!/^[a-z0-9-]+\/$/.test(country.path)) throw new Error('Invalid country path');
for (const key of ['title', 'pageDescription', 'searchPlaceholder', 'lastVerified']) {
    if (typeof country[key] !== 'string' || !country[key].trim()) throw new Error('Missing country ' + key);
}
const directory = path.join(root, country.path), {lastVerified} = country;
const canonical = loadCountry(country, {root});
dates.period(lastVerified);
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
let readingPanel = '';
if (country.readingChapters) {
    const chapters = require(path.join(directory, 'reading.cjs'));
    const evidence = require(path.join(directory, 'observations.cjs'));
    require(path.join(directory, 'validate-reading.cjs'))(chapters, evidence, canonical);
    data.reading = {chapters};
    const measureLabels = {'cumulative-flow': 'Cumulative baptisms, not living membership',
        'population-estimate': 'Population estimate', 'self-identification': 'Self-identification', belief: 'Belief, not affiliation'};
    function snapshot(o) {
        return `<article id="size-${esc(o.id)}" class="size-snapshot" tabindex="-1">
<p class="record-meta">Reference: ${esc(o.reference)} / ${esc(o.tradition)} / ${esc(measureLabels[o.measure])}</p>
<h3>${esc(o.magnitude)}</h3><p>${esc(o.population)}</p><p>${esc(o.age)}</p>
<p class="critical-note">${esc(o.uncertainty.note)}</p>
<p class="source-credit">${esc(o.attribution)}. ${[...new Set(o.citations.map(c => c.source_id))].map(id => {
    const s = evidence.sources[id];
    return `<a href="${esc(s.url)}">${esc(s.publisher)}</a> (${esc(s.published)})`;
}).join('; ')}.</p>
<details><summary>Geography, method and confidence</summary>
<dl><dt>Geography</dt><dd>${esc(o.geography)}</dd><dt>Method</dt><dd>${esc(o.method)}</dd>
<dt>Uncertainty</dt><dd>${esc(o.uncertainty.type.replace(/-/g, ' '))}</dd><dt>Confidence</dt><dd>${esc(o.confidence)}</dd></dl>
<ul class="sources">${o.citations.map(c => {
    const s = evidence.sources[c.source_id];
    return `<li><a href="${esc(s.url)}">${esc(s.title)}</a><span>Published: ${esc(s.published)}</span><p>${esc(c.locator)}</p><p>${esc(s.context)}</p></li>`;
}).join('')}</ul><p>Passages reviewed and accessed ${esc(evidence.reviewed)}. Attribution review, not independent demographic enumeration.</p>
</details></article>`;
    }
    readingPanel = `<section id="reading-panel" aria-label="Era navigator" hidden>
<p class="reading-note">Reading chapters, not proportional time, institutional lifespans or a continuous genealogy.</p>
<div class="reading-layout"><nav id="chapters" aria-label="Reading chapters">${chapters.map((c, i) =>
    `<a href="?view=era&amp;era=${c.id}" data-chapter="${c.id}"><span>${i + 1} / ${esc(c.dates)}</span>${esc(c.title)}</a>`).join('')}</nav>
<section class="reading-story" aria-labelledby="chapter-title"><p id="chapter-position" class="record-meta"></p>
<h2 id="chapter-title" tabindex="-1"></h2><p id="chapter-summary"></p>
<div class="chapter-steps"><button id="previous-chapter">Earlier chapter</button><button id="next-chapter">Later chapter</button></div>
<label class="reading-lane">Display lane <select id="reading-lane"><option value="">All traditions and context</option>${data.lanes.map(l =>
    `<option value="${l.id}">${esc(l.label)}</option>`).join('')}</select></label>
<p id="episode-count" role="status"></p><div id="episodes" class="episode-list"></div></section>
<aside id="reading-detail" aria-label="Selected historical episode"><div id="reading-selection"></div>
<button id="back-to-episodes">Back to chapter episodes</button></aside>
<section id="size-evidence" aria-labelledby="size-heading"><h2 id="size-heading">Church-size evidence</h2>
<p>Separate snapshots, not a growth series. This track is not filtered by display lane, search or date range. Unknown is not zero.</p>
<p class="reading-note">Affiliation, belief, official counts and cumulative baptisms are different measures. No interpolation, combined national total or implied growth rate.</p>
${chapters.map(c => `<section data-size-chapter="${c.id}" aria-label="${esc(c.title)} size evidence"><p class="critical-note">${esc(c.gap)}</p>${
    evidence.observations.filter(o => o.chapter === c.id).map(snapshot).join('')}</section>`).join('')}
</section></div></section>`;
}
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
const values = {
    head: shell.head({title: `Church in ${country.title} history · Main Branch`, description: country.pageDescription,
        canonical: `https://${domain}/${country.path}`}),
    country: esc(country.title), description: esc(country.pageDescription), domain: esc(domain), path: esc(country.path),
    searchPlaceholder: esc(country.searchPlaceholder),
    scopeDetails: country.scopeDetails || '',
    readingAssets: country.readingChapters ? '<link rel="stylesheet" href="../country-history/reading.css">' : '',
    readingControls: country.readingChapters ? '<nav id="reading-views" class="country-toolbar" aria-label="History view" hidden><button id="era-view" aria-pressed="false">Era navigator</button><button id="proportional-view" aria-pressed="false">Proportional timeline</button><button id="sourced-view" aria-pressed="false">Text view</button></nav>' : '',
    readingPanel,
    afterScope: country.showCountryChooser ? '\n<p><a href="../global-church/">Choose another country</a></p>' : '',
    noScript: esc(country.noScript || 'This is the complete sourced text view. Follow record links to bookmark an episode; expand its evidence to read source locators.')
};
const template = fs.readFileSync(path.join(__dirname, '../templates/country-history.html'), 'utf8')
    .replace(/\{\{header\}\}\s*<!--HEADER-CONTENT-->([\s\S]*?)<!--HEADER-END-->/, (_, content) =>
        shell.header({className: 'explorer-header', skipTarget: 'record-list', skipLabel: 'Skip to sourced records', content}))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (!Object.hasOwn(values, key)) throw new Error('Unknown country template field: ' + key);
        return values[key];
    });
const html = template.replace('<!--SCOPE-->', `<p>${esc(data.scope)}</p><p class="critical-note">Last verified event: ${esc(lastVerified)}. Gaps are not extinction dates.</p>`)
    .replace('<!--INFO-->', `<p>${esc(data.geography)}</p><p>${esc(data.limits)}</p><p>Solid interval marks show periods; dashed intervals show approximate or competing date bases, not institutional continuity. Undated gaps remain in the text view. Sorting within partial dates is an editorial convention.</p><p>All summaries are original paraphrases with passage locators. No scans, portraits, Bible text or translated extracts are reproduced. Sources express different institutional perspectives; linked versions may depend on the same underlying evidence.</p>`)
    .replace('<!--LANES-->', data.lanes.map(l => `<option value="${l.id}">${esc(l.label)}</option>`).join(''))
    .replace('<!--RECORDS-->', sorted.map(article).join('\n'));
fs.writeFileSync(path.join(directory, 'index.html'), html);
fs.writeFileSync(path.join(directory, 'public-data.js'), '// Generated approved public fields. Do not edit.\nwindow.COUNTRY_HISTORY_DATA = ' + JSON.stringify(data).replace(/</g, '\\u003c') + ';\n');
console.log(`Built ${data.title}: ${data.events.length} selected records; isolated from denomination data.`);
return {data, article};
};
if (require.main === module) {
    const config = require('../site.config.json');
    for (const country of config.countryHistories) module.exports(country, {domain: config.domain});
}
