const fs = require('node:fs');
const path = require('node:path');
const {loadData, getRecord, getChildren, presentation} = require('./data.cjs');
const view = require('./view.js');
const {projectDemographics} = require('./demographics.cjs');

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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>U.S. denominations · Main Branch</title>
<meta name="description" content="Explore selected published U.S. adult religious affiliations, families and denominations from Pew's 2023-24 Religious Landscape Study.">
<link rel="canonical" href="https://main-branch.com/us-denominations/">
<link rel="icon" type="image/svg+xml" href="../assets/brand/logos/main-branch.svg">
<link rel="stylesheet" href="../theme.css"><script src="../theme.js"></script>
<link rel="stylesheet" href="../brand.css"><link rel="stylesheet" href="affiliation.css">
<script defer src="public-data.js"></script><script defer src="view.js"></script><script defer src="controller.js"></script>
</head><body><a class="skip-link" href="#main">Skip to U.S. denominations</a>
<header class="site-header"><a class="main-branch-brand" href="../" aria-label="Main Branch home">
<img class="main-branch-symbol" src="../assets/brand/logos/main-branch.svg" width="44" height="44" alt="">
<span class="main-branch-copy">Main Branch<small>HISTORY · IDEAS · SOURCES</small></span></a><a class="info-link" href="#methodology">Info</a></header>
<main id="main"><h1>U.S. denominations</h1>
<p class="intro">Pew Research Center &middot; 2023-24 Religious Landscape Study</p>
<p>Compare national affiliations, affiliations within demographic populations, or in-person attendance. Each view names its adult denominator.</p>
<div id="route-controls" class="route-controls" hidden>
<label for="affiliation-view">View <select id="affiliation-view"><option value="families">Families and denominations</option><option value="traditions">Protestant traditions</option><option value="demographics">Affiliations within demographics</option><option value="attendance">Religious service attendance</option></select></label>
<div id="demographic-controls" class="route-controls" hidden>
<label for="demographic-dimension">Demographic <select id="demographic-dimension">${data.demographics.dimensions.map(row => `<option value="${esc(row.id)}">${esc(row.label)}</option>`).join('')}</select></label>
<label for="demographic-population">Population <select id="demographic-population"></select></label></div>
<button type="button" id="back">Back</button><button type="button" id="reset">Reset</button>
<button type="button" id="list-toggle" aria-pressed="false">List</button></div>
<p id="route-status" role="status"></p>
<section id="interactive-view" aria-label="Selected religious comparison" hidden>${view.renderView(data, {view: 'families', group: 'us-adults', format: 'chart'})}</section>
<section id="static-view" aria-label="All published comparisons"><nav aria-label="Static views"><a href="#static-families-title">Families and denominations</a> &middot; <a href="#static-traditions-title">Protestant traditions</a> &middot; <a href="?view=attendance#static-attendance">Religious service attendance</a> &middot; <a href="?view=demographics#static-demographics">Affiliations within demographics</a></nav><p>Nested lists and comparison tables work without JavaScript. Expand a group to explore its published children; source notes are available with every estimate.</p>${view.renderStatic(data)}</section>
<section id="methodology" aria-labelledby="methodology-heading"><h2 id="methodology-heading">Sources and methodology</h2>
${view.context(data)}
<p>These are weighted national estimates of self-identification from published aggregates, not institutional membership, historical lineage or attendance. The study was fielded July 17, 2023-March 4, 2024 among 36,908 adults in the 50 states and D.C.
The overall margin of error is &plusmn;0.8 percentage points at the 95% confidence level, not a margin for every subgroup. ${sourceLink('methods')}.</p>
<p>Each bar starts at zero on the visible view-specific scale. Pinch inside the chart to zoom, then drag to pan; zoom buttons and keyboard controls provide non-gesture alternatives. Zoom enlarges labels, bars and the axis together without changing estimates or denominators. Select a label or bar to explore published children or denomination details. Back restores the chart's zoom, position and source notes during this visit; Fit chart returns to 100%. List mode has no gestures and keeps the same ranked rows, national values and navigation. Browser page zoom remains available outside the chart.</p>
<p>Only numeric estimates have bars. Published upper thresholds retain their exact strings; unavailable or suppressed estimates have reasons and no bars. Selected detail never implies complete coverage; no residuals, sums of censored cells or inferred denominations are added.</p>
<p>Pew's mainline, evangelical and historically Black Protestant traditions use denomination and, for some nonspecific responses, race and/or born-again identification. Pew reports that 36% of Protestants were classified using the latter approach. Mainline is a survey classification; some rows are families, networks or general identities, not single denominations.
${sourceLink('classification')}. Nondenominational and nonspecific Protestant responses remain separate.</p>
<p>The report's tradition decimals (23.1%, 11.5%, 5.4%) and interactive displays (23%, 11%, 5%) are separate published presentations. Report decimals take precedence for the matched wave, denominator and taxonomy. Ordinary rounding does not explain 11.5% versus 11%; no unrounded microdata was used to explain it. ${sourceLink('report')}; ${sourceLink('interactive')} (DOI: <a href="https://doi.org/10.58094/3zs9-jc14">10.58094/3zs9-jc14</a>).</p>
<p>Appendix B alone supplies names and classification, not values. Orthodox Presbyterian and Cumberland Presbyterian have no selected reconciled estimate here. Independent Baptist estimates remain tradition-specific; no all-family total is manufactured.</p>
<p>Questionnaire: ${sourceLink('topline')}, religious identity questions and denomination coding. ${sourceLink('dataset-description')} explains that the public-use file omits detailed identity variables. No survey dataset or respondent data was used. Demographic comparisons are independent of the national affiliation tree and attendance: three published broad affiliations within twelve populations, selected one at a time. No intersecting filters, group-composition denominator reversal or denomination cross-tabs.</p>
<p>Original Main Branch visualization of selected attributed published aggregate excerpts, not a mirrored chart, full catalogue or principal-part republication.
<a href="${esc(data.reuse.termsUrl)}">Pew Terms of Use</a> (effective May 25, 2018; checked November 22, 2026), sections 1 and 2; section 3 restrictions and section 13 dataset terms also reviewed. No written permission has been obtained or claimed. Expansion requires renewed excerpt/reuse review. Publisher artwork, prior waves, detailed demographic cross-tabs and microdata are excluded. ${esc(data.demographics.reuseLimits)}</p>
<p><a href="#main">Return to explorer</a> &middot; <a href="../#explore">All Main Branch explorations</a></p></section></main></body></html>
`;
  fs.writeFileSync(path.join(__dirname, 'public-data.js'), '// Generated public affiliation, attendance and demographic projection. Do not edit by hand.\nwindow.US_AFFILIATION_DATA = ' +
    JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ';\n');
  fs.writeFileSync(path.join(__dirname, 'index.html'), html.replace(/[ \t]+$/gm, ''));
  console.log(`Built U.S. denominations route: ${Object.keys(data.records).length} affiliation records, two lenses, ${data.attendance.records.length} attendance rows, ${data.demographics.populations.length} demographic populations.`);
}

module.exports = {publicData, build};
if (require.main === module) build();
