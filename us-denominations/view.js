/* Shared by the offline generator and browser; inputs are the intentional public projection. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.USAffiliationView = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const partial = 'Published detail covers selected reported affiliations, not an exhaustive inventory. No residual is inferred. Totals and children may differ because of rounding or available detail.';
  const complete = 'Published estimates are independently rounded and need not add to the parent or to 100%. No residual is inferred.';
  function members(data, lens) {
    return new Set([data.lenses[lens].rootId, ...data.lenses[lens].panels.flatMap(p => p.children)]);
  }
  function ancestors(data, lens, id) {
    if (lens === 'attendance' || lens === 'demographics') return [];
    const parents = new Map(data.lenses[lens].panels.flatMap(p => p.children.map(child => [child, p.parentId])));
    const result = [];
    let parent = parents.get(id);
    while (parent) { result.unshift(parent); parent = parents.get(parent); }
    return result;
  }
  function normalize(data, input) {
    if (input.view === 'demographics') {
      const dimension = data.demographics.dimensions.some(row => row.id === input.dimension) ? input.dimension : 'age';
      const populations = data.demographics.populations.filter(row => row.dimension === dimension);
      const population = populations.some(row => row.id === input.population) ? input.population : populations[0].id;
      return {view: 'demographics', group: null, dimension, population, format: input.format === 'list' ? 'list' : 'chart'};
    }
    if (input.view === 'attendance') {
      return {view: 'attendance', group: null, format: input.format === 'list' ? 'list' : 'chart'};
    }
    const lens = Object.hasOwn(data.lenses, input.view) ? input.view : 'families';
    let group = input.group || 'us-adults';
    if (!members(data, lens).has(group)) {
      group = Object.hasOwn(data.records, group) && data.records[group].scope.affiliation === 'protestant'
        ? 'protestant' : 'us-adults';
    }
    return {view: lens, group, format: input.format === 'list' ? 'list' : 'chart'};
  }
  function readURL(data, search) {
    const params = new URLSearchParams(search);
    const one = key => params.getAll(key).length === 1 ? params.get(key) : null;
    const input = {view: one('view'), group: one('group'), format: one('format'), dimension: one('dimension'), population: one('population')};
    const state = normalize(data, input);
    const corrected = (params.has('view') && input.view !== state.view) ||
      (params.has('group') && input.group !== state.group) ||
      (params.has('dimension') && input.dimension !== state.dimension) ||
      (params.has('population') && input.population !== state.population) ||
      (params.has('format') && input.format !== state.format) ||
      [...params.keys()].some(key => !['view', 'group', 'format', 'dimension', 'population'].includes(key) || params.getAll(key).length !== 1);
    return {state, corrected};
  }
  function query(state) {
    const params = new URLSearchParams({view: state.view});
    if (state.view === 'demographics') {
      params.set('dimension', state.dimension);
      params.set('population', state.population);
    } else if (state.view !== 'attendance') params.set('group', state.group);
    if (state.format === 'list') params.set('format', 'list');
    return '?' + params.toString();
  }
  function panelFor(data, state) {
    if (state.view === 'attendance' || state.view === 'demographics') return undefined;
    return data.lenses[state.view].panels.find(p => p.parentId === state.group);
  }
  function link(source) {
    return `<a href="${esc(source.url)}">${esc(source.title)}</a>`;
  }
  function citation(source) {
    return `${esc(source.publisher)} (${esc(source.publicationDate)}), ${link(source)}.
      ${esc(source.locator)}; column: ${esc(source.column)}; row: ${esc(source.path ? source.path.join(' > ') : source.row)}.`;
  }
  function context(data) {
    return `<p class="source-context">Pew Research Center, 2023-24 Religious Landscape Study, published ${esc(data.study.publicationDate)}.
      Fielded July 17, 2023-March 4, 2024; 36,908 adults in the 50 U.S. states and D.C.
      Adult religious self-identification. <strong>Share of U.S. adults</strong>, not membership rolls or children.</p>
      <p class="credit">${data.reuse.notices.map(esc).join(' ')}. ${esc(data.reuse.disclaimer)}
      <a href="#methodology">Methods, classification, questionnaire and reuse</a>.</p>`;
  }
  function recordNotes(record) {
    return `<p>${citation(record.source)}</p><p>${esc(record.source.caveat)}</p>
      ${record.reason ? `<p>${esc(record.reason)}</p>` : ''}
      <p>Published label: ${esc(record.sourceLabel)}. ${kind(record)}.
      ${record.scope.tradition ? `Pew tradition: ${esc(record.scope.tradition.replace(/-/g, ' '))}.` : ''}</p>`;
  }
  function sourceDetail(record) {
    return `<details class="row-source"><summary>Source<span class="visually-hidden"> and caveats for ${esc(record.label)}</span></summary>
      ${recordNotes(record)}</details>`;
  }
  const kind = record => esc(record.kind.replace(/-/g, ' '));
  function estimate(record) {
    return `${esc(record.valueText)}${record.id === 'us-adults' ? '' : ' of U.S. adults'}`;
  }
  // Compact visible credit with direct links; the Info disclosure holds the full locators and notices.
  function sourceLine(data, sources) {
    const unique = [...new Map(sources.map(source => [source.url, source])).values()];
    return `<p class="source-line">Source: ${esc(unique[0].publisher)}, ${unique.map(link).join('; ')}.
      ${data.reuse.notices.map(esc).join(' ')}.</p>`;
  }
  function info(label, body) {
    return `<details class="info-detail"><summary><span aria-hidden="true">&#9432;</span> Info<span class="visually-hidden">: sources, methods and notes for ${esc(label)}</span></summary>
      <div class="info-body">${body}</div></details>`;
  }
  // Fixed fills with a text color that meets 4.5:1 for in-slice percentages.
  const palette = [
    ['#315b43', '#ffffff'], ['#d6b579', '#1f2a26'], ['#284f7a', '#ffffff'], ['#6e9d50', '#1f2a26'],
    ['#9c3f57', '#ffffff'], ['#7a5a3f', '#ffffff'], ['#5b4a8a', '#ffffff'], ['#5fa3a3', '#1f2a26'],
    ['#a04b18', '#ffffff'], ['#b7b06a', '#1f2a26'], ['#3e6f8f', '#ffffff'], ['#d99a6c', '#1f2a26'],
    ['#e3c4d0', '#1f2a26'], ['#c7d6e6', '#1f2a26']
  ];
  const RADIUS = 100, INNER = 56, TURN = Math.PI * 2;
  const fmt = n => String(Math.round(n * 1000) / 1000);
  function arcPath(start, end, outer = RADIUS, inner = INNER) {
    const sweep = Math.max(0, Math.min(end - start, TURN - 1e-4)), finish = start + sweep, large = sweep > Math.PI ? 1 : 0;
    const at = (r, a) => `${fmt(r * Math.cos(a))} ${fmt(r * Math.sin(a))}`;
    return `M${at(outer, start)}A${outer} ${outer} 0 ${large} 1 ${at(outer, finish)}L${at(inner, finish)}A${inner} ${inner} 0 ${large} 0 ${at(inner, start)}Z`;
  }
  function pieModel(data, state, panel) {
    const numeric = panel.children.filter(id => data.records[id].barValue !== null);
    const sum = numeric.reduce((total, id) => total + data.records[id].barValue, 0);
    const whole = state.group === 'us-adults' ? 100 : data.records[state.group].barValue;
    const total = Math.max(whole || 0, sum);
    let angle = -Math.PI / 2;
    const slices = numeric.map((id, index) => {
      const sweep = total ? data.records[id].barValue / total * TURN : 0;
      const slice = {id, start: angle, end: angle + sweep, fill: palette[index % palette.length][0], ink: palette[index % palette.length][1]};
      angle += sweep;
      return slice;
    });
    return {whole, sum, total, slices, colors: new Map(slices.map(slice => [slice.id, slice.fill]))};
  }
  function row(data, state, id, model, staticMode) {
    const record = data.records[id];
    const target = {...state, group: id};
    const expandable = Boolean(panelFor(data, target));
    const color = !staticMode && model && model.colors.get(id);
    const swatch = staticMode ? '' : `<span class="swatch${color ? '' : ' swatch-empty'}" aria-hidden="true"${color ? ` style="background:${color}"` : ''}></span>`;
    const name = expandable
      ? `<a class="row-target" data-group="${esc(id)}" href="${query(target)}${staticMode ? '#static-' + state.view + '-' + id : ''}">${swatch}${esc(record.label)} <span aria-hidden="true">&rsaquo;</span></a>`
      : staticMode ? `<span class="row-name">${esc(record.label)}</span>`
      : `<a class="row-detail" data-group="${esc(id)}" href="${query(target)}">${swatch}${esc(record.label)} <span aria-hidden="true">&rsaquo;</span></a>`;
    return `<div class="estimate-row" data-record="${esc(id)}" data-status="${esc(record.status)}">
      <div class="row-label">${name}<strong class="national-value">${estimate(record)}</strong></div>
      ${record.status === 'threshold' ? '<small>Upper threshold; no slice.</small>' : ''}
      ${['unavailable', 'suppressed'].includes(record.status) ? `<small>${esc(record.reason)}; no slice.</small>` : ''}
      ${sourceDetail(record)}</div>`;
  }
  function renderPie(data, state, panel, model) {
    const record = data.records[state.group];
    const label = esc(record.label);
    const parentId = ancestors(data, state.view, state.group).at(-1);
    const gap = model.whole ? model.whole - model.sum : 0;
    const shown = gap > 0.05 && model.slices.length;
    const unsliced = panel.children.filter(id => data.records[id].barValue === null);
    if (!model.slices.length) {
      return `<p class="pie-empty">No pie: each published child of ${label} is an upper threshold or unavailable. Exact values are listed below.</p>`;
    }
    const slices = model.slices.map((slice, index) => {
      const child = data.records[slice.id];
      const target = {...state, group: slice.id};
      const expandable = Boolean(panelFor(data, target));
      const mid = (slice.start + slice.end) / 2;
      const text = slice.end - slice.start >= .32
        ? `<text class="pie-label" x="${fmt(78 * Math.cos(mid))}" y="${fmt(78 * Math.sin(mid))}" fill="${slice.ink}" aria-hidden="true">${esc(child.valueText)}</text>` : '';
      return `<a class="pie-slice" href="${query(target)}" data-group="${esc(slice.id)}" data-slice="${esc(slice.id)}"
        data-start="${fmt(slice.start)}" data-end="${fmt(slice.end)}" tabindex="${index ? -1 : 0}"
        style="--dx:${fmt(6 * Math.cos(mid))}px;--dy:${fmt(6 * Math.sin(mid))}px"
        aria-label="${esc(child.label)}, ${estimate(child)}. ${expandable ? 'Zoom in' : 'Open details'}">
        <title>${esc(child.label)}: ${estimate(child)}</title><path d="${arcPath(slice.start, slice.end)}" fill="${slice.fill}"/>${text}</a>`;
    }).join('');
    const center = parentId
      ? `<a class="pie-center" href="${query({...state, group: parentId})}" data-group="${esc(parentId)}" aria-label="Zoom out to ${esc(data.records[parentId].label)}">
        <title>Zoom out to ${esc(data.records[parentId].label)}</title><circle r="${INNER - 4}"/>
        <text class="pie-center-value" y="-4">${esc(record.valueText)}</text><text class="pie-center-note" y="16">&#9650; Zoom out</text></a>`
      : `<g class="pie-center" aria-hidden="true"><circle r="${INNER - 4}"/>
        <text class="pie-center-value" y="-4">100%</text><text class="pie-center-note" y="16">U.S. adults</text></g>`;
    const scale = model.sum > (model.whole || 0) + 0.05
      ? `Rounded slices total ${fmt(model.sum)}%, above ${label}'s ${esc(record.valueText)}, so the circle is scaled to their total.`
      : state.group === 'us-adults' ? 'Full circle: all U.S. adults.'
      : `Full circle: ${label}, ${estimate(record)}.`;
    return `<figure class="pie-figure">
      <svg class="pie" viewBox="-112 -112 224 224" role="group" aria-labelledby="pie-title" aria-describedby="pie-help">
      <title id="pie-title">Pie chart of ${label}: ${panel.coverage === 'selected' ? 'published detail' : 'affiliations'}</title>
      <defs><pattern id="pie-gap-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect class="pie-gap-base" width="8" height="8"/><line class="pie-gap-line" x1="0" y1="0" x2="0" y2="8"/></pattern></defs>
      <path class="pie-gap" d="${arcPath(0, TURN)}" fill="url(#pie-gap-hatch)" aria-hidden="true"/>
      <g class="pie-slices">${slices}</g>${center}</svg>
      <figcaption id="pie-help" class="pie-help"><span>${scale}${state.group === 'us-adults' ? '' : ' Slices are shares of all U.S. adults.'}<span class="visually-hidden"> Arrow keys move between slices; Enter zooms in.${parentId ? ' The centre zooms out.' : ''}</span></span>
      ${shown ? `<span class="pie-key"><span class="swatch swatch-gap" aria-hidden="true"></span>${panel.coverage === 'selected'
        ? 'Hatched: not itemized by Pew. Not an estimate; no residual is inferred.'
        : 'Hatched: rounding gap, not an unlisted group.'}</span>` : ''}
      ${unsliced.length ? `<span class="pie-key">No slice: ${unsliced.map(id => `${esc(data.records[id].label)} (${esc(data.records[id].valueText)})`).join(', ')}; thresholds and unavailable values are not drawn.</span>` : ''}
      </figcaption></figure>`;
  }
  function precisionNote(data, ids) {
    const selected = ids.filter(id => Object.hasOwn(data.interactiveStrings, id));
    return selected.length ? `<p class="precision-note">Report decimals shown. Pew's interactive separately displays
      ${selected.map(id => `${esc(data.records[id].label)} ${esc(data.interactiveStrings[id])}`).join('; ')}.</p>` : '';
  }
  const precisionDetail = '<p>Report decimals and interactive displays are independently published strings, not re-rounded report cells; ordinary rounding does not explain 11.5% versus 11%.</p>';
  const helpText = '<p>Select a slice, or use arrow keys and Enter, to zoom in. The centre, Back, Reset and breadcrumbs zoom out. List shows the same values without the pie.</p>';
  function coverageLine(panel) {
    return panel.coverage === 'selected' ? '<p class="coverage">Selected published detail, not every group.</p>' : '';
  }
  function panelContext(data, state, panel) {
    const source = data.sources[panel.sourceId];
    const sources = [state.group, ...panel.children].map(id => data.records[id].source);
    const record = data.records[state.group];
    return `${sourceLine(data, sources)}${info(record.label, `<p>${panel.coverage === 'selected' ? partial : complete}</p>
      ${state.group === 'us-adults' ? '' : `<p><strong>${esc(record.label)}</strong></p>${recordNotes(record)}`}
      <p class="panel-source">Hierarchy: ${link(source)}; ${esc(panel.locator)}.
      Each row's Source identifies its estimate, column and precise locator.</p>
      ${panel.children.concat(state.group).some(id => Object.hasOwn(data.interactiveStrings, id)) ? precisionDetail : ''}
      ${context(data)}${helpText}`)}`;
  }
  function renderView(data, state) {
    if (state.view === 'demographics') return renderDemographics(data, state);
    if (state.view === 'attendance') return renderAttendance(data, state.format);
    const record = data.records[state.group];
    const panel = panelFor(data, state);
    const path = [...ancestors(data, state.view, state.group), state.group];
    const model = panel && pieModel(data, state, panel);
    return `<nav aria-label="Affiliation breadcrumb"><ol class="breadcrumbs">${path.map(id => `<li>${id === state.group
      ? `<span aria-current="page">${esc(data.records[id].label)}</span>`
      : `<a data-group="${esc(id)}" href="${query({...state, group: id})}">${esc(data.records[id].label)}</a>`}</li>`).join('')}</ol></nav>
      <h2 id="group-heading" tabindex="-1">${esc(record.label)}</h2>
      ${state.group === 'us-adults' ? '' : `<p class="selected-estimate"><strong>${estimate(record)}</strong> &middot; ${kind(record)}${
        record.status === 'threshold' ? ' &middot; upper threshold' : ''}</p>`}
      ${precisionNote(data, [state.group, ...(panel ? panel.children : [])])}
      ${panel ? `${coverageLine(panel)}<div class="chart pie-chart" data-format="${state.format}">
      ${renderPie(data, state, panel, model)}
      <ol class="estimate-list">${panel.children.map((id, index) => `<li style="--i:${index}">${row(data, state, id, model, false)}</li>`).join('')}</ol></div>
      ${panelContext(data, state, panel)}` : `<p class="leaf-note">No finer breakdown is published.</p>
      ${sourceLine(data, [record.source])}${info(record.label, `${recordNotes(record)}
      ${Object.hasOwn(data.interactiveStrings, state.group) ? precisionDetail : ''}${context(data)}`)}`}`;
  }
  function renderAttendance(data, format, staticMode = false) {
    const attendance = data.attendance;
    return `<h2 id="${staticMode ? 'static-attendance-heading' : 'group-heading'}" tabindex="-1">Religious service attendance</h2>
      <p><strong>${esc(attendance.denominatorLabel)}</strong>. ${esc(attendance.metric)}, excluding weddings and funerals.</p>
      <p>Self-reports; each row has its own adult population. Selected published rows, not a partition to sum.</p>
      <div class="chart attendance-chart" data-format="${format}">
      <p>Fixed scale: 0-100%, ${esc(attendance.axisLabel)}.</p>
      <table class="attendance-table"><caption>Monthly-or-more in-person attendance, 2023-24</caption>
      <thead><tr><th scope="col">Religious group (adult population)</th><th scope="col">Monthly or more often
      <p class="axis"><span>0%</span><span>100%</span></p></th></tr></thead>
      <tbody>${attendance.records.map(record => `<tr data-attendance="${esc(record.id)}">
        <th scope="row">${esc(record.label)}<details class="row-source"><summary>Source and caveats for ${esc(record.label)}</summary>
        <p>${citation(record.source)}</p><p>Published label: ${esc(record.sourceLabel)}. ${esc(record.source.caveat)}</p></details></th>
        <td><strong>${esc(record.valueText)}</strong>${!staticMode ? `<div class="bar-track" aria-hidden="true"><span class="bar" style="width:${record.barValue}%"></span></div>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>
      ${sourceLine(data, [data.sources['attendance-chapter'], data.sources.report])}${info('religious service attendance', `
      <p class="panel-source">Pew Research Center (${esc(data.study.publicationDate)}), ${link(data.sources['attendance-chapter'])}.
      Attending religious services in person, table 08-04 (attachment 199166); ${link(data.sources.report)}, printed p. 165 (PDF p. 166).
      Column: NET Monthly or more often; each row's Source gives its precise row.</p>
      <p class="source-context">2023-24 Religious Landscape Study, published ${esc(data.study.publicationDate)}.
      Fielded July 17, 2023-March 4, 2024; 36,908 adults in the 50 U.S. states and D.C.
      <strong>${esc(attendance.denominatorLabel)}</strong>. ${esc(attendance.responseDefinition)}
      Not denomination-level estimates or virtual attendance; this comparison does not inherit an affiliation focus.</p>
      <p>Question: ${esc(attendance.question)} ${link(data.sources[attendance.instrumentSourceId])},
      ${esc(attendance.instrumentLocator)}. ${esc(attendance.caveat)}</p>
      <p>Selected twelve published population rows, not an exhaustive inventory.
      Nonresponses are not shown in the source table; rounded figures need not add to subtotals.
      Whole-percent estimates are retained as published, without summing rounded frequency cells.
      The national margin of error is &plusmn;0.8 percentage points at 95% confidence, not a margin for every subgroup.
      ${link(data.sources.methods)}; ${link(data.sources.classification)}.</p>
      <p class="credit">${esc(data.reuse.disclaimer)}
      <a href="${esc(data.reuse.termsUrl)}">Pew Terms of Use</a>; <a href="#methodology">Methods and excerpt reuse limits</a>.</p>`)}`;
  }
  function renderDemographics(data, state, staticMode = false) {
    const demographics = data.demographics;
    const population = demographics.populations.find(row => row.id === state.population);
    const dimension = demographics.dimensions.find(row => row.id === population.dimension);
    return `<h2 id="${staticMode ? 'static-demographics-' + population.id + '-heading' : 'group-heading'}" tabindex="-1">Affiliations within ${esc(population.label)}</h2>
      <p><strong>Denominator: ${esc(population.denominatorLabel)}</strong>. Each percentage is within this population, not its share of a religion.</p>
      <div class="chart demographic-chart" data-format="${state.format}">
      <p>Fixed scale: 0-100% of the selected demographic population.</p>
      <table class="attendance-table"><caption>Selected broad affiliations within ${esc(population.denominatorLabel)}, 2023-24</caption>
      <thead><tr><th scope="col">Affiliation</th><th scope="col">% within selected population
      <p class="axis"><span>0%</span><span>100%</span></p></th></tr></thead>
      <tbody>${population.records.map(record => `<tr data-demographic="${esc(record.id)}" data-status="${esc(record.status)}">
        <th scope="row">${esc(record.label)}<details class="row-source"><summary>Source for ${esc(record.label)}</summary>
        <p>${citation(record.source)}</p><p>Denominator: ${esc(population.denominatorLabel)}.</p></details></th>
        <td><strong>${esc(record.valueText)}</strong>
        ${record.barValue !== null && !staticMode ? `<div class="bar-track" aria-hidden="true"><span class="bar" style="width:${record.barValue}%"></span></div>` : ''}
        ${record.status === 'threshold' ? '<small>Published upper threshold; no numeric bar.</small>' : ''}
        ${record.reason ? `<small>${esc(record.reason)}; no numeric bar.</small>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>
      <p>${esc(dimension.definition)}</p>
      <p class="coverage">${esc(demographics.caveat)}</p>
      ${sourceLine(data, [population.records[0].source, demographics.questionnaire])}${info(population.label, `
      <p>${esc(population.nonresponse)} ${esc(population.uncertainty)}</p>
      <p class="panel-source">${citation(population.records[0].source)} All three rows link to their exact source row and column.</p>
      <p class="source-context">Pew Research Center, 2023-24 Religious Landscape Study, published ${esc(data.study.publicationDate)}.
      Fielded July 17, 2023-March 4, 2024 in the 50 U.S. states and D.C.
      Measure: ${esc(demographics.metric)}. Denominator: ${esc(population.denominatorLabel)}.</p>
      <p>${esc(dimension.instrumentLocator)} ${link(demographics.questionnaire)}; ${link(data.sources.methods)}; ${link(data.sources.classification)}.
      Religious identity questionnaire: RELIG and associated classification. Gender is self-described, not sex at birth.</p>
      <p class="credit">${esc(data.reuse.disclaimer)}
      <a href="${esc(data.reuse.termsUrl)}">Pew Terms of Use</a>. ${esc(demographics.reuseLimits)}</p>`)}`;
  }
  function renderStatic(data) {
    function nested(state) {
      const panel = panelFor(data, state);
      if (!panel) return '';
      return `<section id="static-${state.view}-${state.group}" class="static-panel">
        <h3>${esc(data.records[state.group].label)} &mdash; ${panel.coverage === 'selected' ? 'Published detail' : 'Affiliations'}</h3>
        <p class="coverage">${panel.coverage === 'selected' ? partial : complete}</p>
        ${precisionNote(data, [state.group, ...panel.children])}${panelContext(data, state, panel)}
        <ol class="estimate-list">${panel.children.map(id => `<li>${row(data, state, id, null, true)}
        ${panelFor(data, {...state, group: id}) ? `<details class="nested-detail"><summary>Explore ${esc(data.records[id].label)} &mdash; published children</summary>${nested({...state, group: id})}</details>` : ''}</li>`).join('')}</ol></section>`;
    }
    return Object.keys(data.lenses).map(view => `<section aria-labelledby="static-${view}-title"><h2 id="static-${view}-title">${esc(data.lenses[view].label)}</h2>
      ${nested({view, group: 'us-adults', format: 'list'})}</section>`).join('') +
      `<section id="static-attendance" aria-labelledby="static-attendance-heading">${renderAttendance(data, 'list', true)}</section>` +
      `<section id="static-demographics"><h2>Affiliations within demographic populations</h2>
      <p>One published population at a time; no combined filters or inferred denominations.</p>
      ${data.demographics.populations.map(population => `<details id="static-demographics-${population.id}">
      <summary>${esc(data.demographics.dimensions.find(row => row.id === population.dimension).label)}: ${esc(population.label)}</summary>
      ${renderDemographics(data, {population: population.id, format: 'list'}, true)}</details>`).join('')}</section>`;
  }
  return {esc, normalize, readURL, query, ancestors, panelFor, renderView, renderStatic, context, arcPath, pieModel, palette};
});
