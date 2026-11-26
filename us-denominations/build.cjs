const fs = require('node:fs');
const path = require('node:path');
const {loadData, getRecord, getChildren, presentation} = require('./data.cjs');
const view = require('./view.js');
const {projectDemographics} = require('./demographics.cjs');
const shell = require('../scripts/page-shell.cjs');

function publicData(data) {
  const lenses = {};
  for (const [id, lens] of Object.entries(data.hierarchies.lenses)) {
    lenses[id] = {
      label: lens.label, rootId: lens.rootId,
      panels: [...data.hierarchies.sharedPanels, ...lens.panels].map(panel => ({
        parentId: panel.parentId, coverage: panel.coverage, sourceId: panel.sourceId,
        locator: panel.locator, children: getChildren(data, id, panel.parentId).map(row => row.id)
      }))
    };
  }
  const used = new Set(Object.values(lenses).flatMap(lens => [
    lens.rootId, ...lens.panels.flatMap(panel => panel.children)
  ]));
  const records = {};
  for (const id of [...used].sort()) {
    const record = getRecord(data, id);
    const display = presentation(data, id);
    const source = display.source;
    records[id] = {
      id, label: display.label, sourceLabel: record.sourceLabel, kind: record.kind,
      scope: record.scope, status: display.status, valueText: display.valueText,
      barValue: display.barValue, reason: record.estimate.reason || null,
      source: {
        title: source.title, publisher: source.publisher, publicationDate: source.publicationDate,
        url: source.url, locator: source.locator, column: source.column, row: source.row,
        path: source.path, caveat: source.caveat
      }
    };
  }
  const sourceIds = new Set([
    ...Object.values(lenses).flatMap(lens => lens.panels.map(panel => panel.sourceId)),
    'methods', 'topline', 'classification', 'dataset-description', 'attendance-chapter'
  ]);
  const sources = {};
  for (const source of data.provenance.sources.filter(source => sourceIds.has(source.id))) {
    sources[source.id] = {
      title: source.title, publisher: source.publisher, publicationDate: source.publicationDate, url: source.url
    };
  }
  const reuse = data.provenance.reuse[0];
  const series = data.provenance.series.attendance;
  const attendance = {
    metric: series.metric, denominatorId: series.denominatorId, denominatorLabel: series.denominatorLabel,
    axisLabel: series.axisLabel, question: series.question, instrumentSourceId: series.instrumentSourceId,
    instrumentLocator: series.instrumentLocator, responseDefinition: series.responseDefinition,
    scale: series.scale, caveat: series.caveat,
    records: data.attendance.records.map(record => {
      const display = presentation(data, record.id);
      const source = display.source;
      return {
        id: record.id, label: record.label, populationId: record.populationId,
        sourceLabel: record.sourceLabel, status: display.status, valueText: display.valueText,
        barValue: display.barValue,
        source: {
          title: source.title, publisher: source.publisher, publicationDate: source.publicationDate,
          url: source.url, locator: source.locator, column: source.column, row: source.row,
          caveat: source.caveat
        }
      };
    })
  };
  return {
    schemaVersion: 1, study: {publicationDate: data.provenance.study.publicationDate},
    records, lenses, sources, attendance, demographics: projectDemographics(data.demographics),
    interactiveStrings: data.provenance.decisions.find(decision => decision.id === 'tradition-precision').interactiveStrings,
    reuse: {notices: reuse.notices, disclaimer: reuse.disclaimer, termsUrl: reuse.termsUrl}
  };
}

function build() {
  const data = publicData(loadData());
  const esc = view.esc;
  const sourceLink = id => `<a href="${esc(data.sources[id].url)}">${esc(data.sources[id].title)}</a>`;
  const html = `<!doctype html>
<html lang="en"><head>${shell.head({title: 'U.S. denominations · Main Branch',
 description: "Explore selected published U.S. adult religious affiliations, families and denominations from Pew's 2023-24 Religious Landscape Study.",
 canonical: `https://${shell.domain}/us-denominations/`})}
<link rel="stylesheet" href="affiliation.css">
<script defer src="public-data.js"></script><script defer src="../html-escape.js"></script><script defer src="view.js"></script><script defer src="controller.js"></script>
</head><body>${shell.header({className: 'site-header', tagline: true, skipTarget: 'main', skipLabel: 'Skip to U.S. denominations',
 content: '<a class="info-link" href="#methodology">Info</a>'})}
<main id="main" tabindex="-1"><h1>U.S. denominations</h1>
<p class="intro">Pew Research Center &middot; 2023-24 Religious Landscape Study</p>
<div id="route-controls" class="route-controls" hidden>
<label for="affiliation-view">View <select id="affiliation-view"><option value="families">Families and denominations</option><option value="traditions">Protestant traditions</option><option value="demographics">Affiliations within demographics</option><option value="attendance">Religious service attendance</option></select></label>
<div id="demographic-controls" class="route-controls" hidden>
<label for="demographic-dimension">Demographic <select id="demographic-dimension">${data.demographics.dimensions.map(row => `<option value="${esc(row.id)}">${esc(row.label)}</option>`).join('')}</select></label>
<label for="demographic-population">Population <select id="demographic-population"></select></label></div>
<button type="button" id="back">Back</button><button type="button" id="reset">Reset</button>
<button type="button" id="list-toggle" aria-pressed="false">List</button></div>
<p id="route-status" role="status"></p>
<section id="interactive-view" aria-label="Selected religious comparison" hidden></section>
<section id="static-view" aria-label="All published comparisons"><nav aria-label="Static views"><a href="#static-families-title">Families and denominations</a> &middot; <a href="#static-traditions-title">Protestant traditions</a> &middot; <a href="?view=attendance#static-attendance">Religious service attendance</a> &middot; <a href="?view=demographics#static-demographics">Affiliations within demographics</a></nav><p>Expand a group to see its published children. Each estimate has a Source note.</p>${view.renderStatic(data)}</section>
<section id="methodology" aria-labelledby="methodology-heading"><h2 id="methodology-heading">Sources and methodology</h2>
<p>Weighted estimates of adult self-identification from Pew Research Center's 2023-24 Religious Landscape Study, published ${esc(data.study.publicationDate)}: not membership rolls, children, historical lineage or attendance. The national margin of error is &plusmn;0.8 percentage points at 95% confidence, not a margin for every subgroup. ${sourceLink('methods')}.</p>
<p class="credit">${data.reuse.notices.map(esc).join(' ')}. <a href="${esc(data.reuse.termsUrl)}">Pew Terms of Use</a>.</p>
<details class="method-detail"><summary>How the charts work</summary><div class="info-body">
<p>Families and denominations and Protestant traditions use a drill-down pie. Its full circle is the selected group's published share of U.S. adults (all U.S. adults at the top); each slice is one listed affiliation's published share of all U.S. adults, drawn to that scale. Select a slice, or focus the pie and use arrow keys and Enter, to zoom into its published children or, for a leaf, its sourced details. The centre, Back, Reset and breadcrumbs zoom out. When independently rounded children total more than their parent, the circle is scaled to their total and says so. A hatched arc marks the part of a parent not itemized in selected published detail; it is not an estimate. Leaves have no finer published breakdown, so no further pie is drawn. Each level shows a compact source credit with direct links; coverage, record notes, locators, precision and the reuse disclaimer are under Info. Animation is skipped when reduced motion is requested. The ranked list below each pie keeps the exact values, navigation and source notes; List mode hides the pie. Back restores open source notes and Info during this visit.</p>
<p>Attendance and demographic comparisons keep zero-based bars on a fixed scale. Pinch inside those charts to zoom, then drag to pan; zoom buttons and keyboard controls provide non-gesture alternatives without changing estimates or denominators. Browser page zoom remains available outside the chart.</p>
<p>Only numeric estimates have slices or bars. Published upper thresholds retain their exact strings; unavailable or suppressed estimates have reasons and no slice or bar. Selected detail never implies complete coverage; no residuals, sums of censored cells or inferred denominations are added.</p></div></details>
<details class="method-detail"><summary>Classification and precision</summary><div class="info-body">
<p>Pew's mainline, evangelical and historically Black Protestant traditions use denomination and, for some nonspecific responses, race and/or born-again identification. Pew reports that 36% of Protestants were classified using the latter approach. Mainline is a survey classification; some rows are families, networks or general identities, not single denominations.
${sourceLink('classification')}. Nondenominational and nonspecific Protestant responses remain separate.</p>
<p>The report's tradition decimals (23.1%, 11.5%, 5.4%) and interactive displays (23%, 11%, 5%) are separate published presentations. Report decimals take precedence for the matched wave, denominator and taxonomy. Ordinary rounding does not explain 11.5% versus 11%; no unrounded microdata was used to explain it. ${sourceLink('report')}; ${sourceLink('interactive')} (DOI: <a href="https://doi.org/10.58094/3zs9-jc14">10.58094/3zs9-jc14</a>).</p>
<p>Appendix B alone supplies names and classification, not values. Orthodox Presbyterian and Cumberland Presbyterian have no selected reconciled estimate here. Independent Baptist estimates remain tradition-specific; no all-family total is manufactured.</p></div></details>
<details class="method-detail"><summary>Questionnaire and data used</summary><div class="info-body">
<p>Fielded July 17, 2023-March 4, 2024 among 36,908 adults in the 50 states and D.C. Questionnaire: ${sourceLink('topline')}, religious identity questions and denomination coding. ${sourceLink('dataset-description')} explains that the public-use file omits detailed identity variables. No survey dataset or respondent data was used. Demographic comparisons are independent of the national affiliation tree and attendance: three published broad affiliations within twelve populations, selected one at a time. No intersecting filters, group-composition denominator reversal or denomination cross-tabs.</p></div></details>
<details class="method-detail"><summary>Reuse terms</summary><div class="info-body">
<p>${esc(data.reuse.disclaimer)}</p>
<p>Original Main Branch visualization of selected attributed published aggregate excerpts, not a mirrored chart, full catalogue or principal-part republication.
<a href="${esc(data.reuse.termsUrl)}">Pew Terms of Use</a> (effective May 25, 2018; checked November 22, 2026), sections 1 and 2; section 3 restrictions and section 13 dataset terms also reviewed. No written permission has been obtained or claimed. Expansion requires renewed excerpt/reuse review. Publisher artwork, prior waves, detailed demographic cross-tabs and microdata are excluded. ${esc(data.demographics.reuseLimits)}</p></div></details>
<p><a href="#main">Return to explorer</a> &middot; <a href="../#explore">All Main Branch explorations</a></p></section></main></body></html>
`;
  fs.writeFileSync(path.join(__dirname, 'public-data.js'), '// Generated public affiliation, attendance and demographic projection. Do not edit by hand.\nwindow.US_AFFILIATION_DATA = ' +
    JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ';\n');
  fs.writeFileSync(path.join(__dirname, 'index.html'), html.replace(/^[ \t]+|[ \t]+$/gm, ''));
  console.log(`Built U.S. denominations route: ${Object.keys(data.records).length} affiliation records, two lenses, ${data.attendance.records.length} attendance rows, ${data.demographics.populations.length} demographic populations.`);
}

module.exports = {publicData, build};
if (require.main === module) build();
