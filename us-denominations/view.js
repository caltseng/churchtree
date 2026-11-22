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
    if (lens === 'attendance') return [];
    const parents = new Map(data.lenses[lens].panels.flatMap(p => p.children.map(child => [child, p.parentId])));
    const result = [];
    let parent = parents.get(id);
    while (parent) { result.unshift(parent); parent = parents.get(parent); }
    return result;
  }
  function normalize(data, input) {
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
    const input = {view: one('view'), group: one('group'), format: one('format')};
    const state = normalize(data, input);
    const corrected = (params.has('view') && input.view !== state.view) ||
      (params.has('group') && input.group !== state.group) ||
      (params.has('format') && input.format !== state.format) ||
      [...params.keys()].some(key => !['view', 'group', 'format'].includes(key) || params.getAll(key).length !== 1);
    return {state, corrected};
  }
  function query(state) {
    const params = new URLSearchParams({view: state.view});
    if (state.view !== 'attendance') params.set('group', state.group);
    if (state.format === 'list') params.set('format', 'list');
    return '?' + params.toString();
  }
  function panelFor(data, state) {
    if (state.view === 'attendance') return undefined;
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
  function sourceDetail(record) {
    return `<details class="row-source"><summary>Source and caveats for ${esc(record.label)}</summary>
      <p>${citation(record.source)}</p><p>${esc(record.source.caveat)}</p>
      ${record.reason ? `<p>${esc(record.reason)}</p>` : ''}
      <p>Published label: ${esc(record.sourceLabel)}. ${esc(record.kind.replace(/-/g, ' '))}.
      ${record.scope.tradition ? `Pew tradition: ${esc(record.scope.tradition.replace(/-/g, ' '))}.` : ''}</p></details>`;
  }
  function estimate(record) {
    return `${esc(record.valueText)}${record.id === 'us-adults' ? '' : ' of U.S. adults'}`;
  }
  function row(data, state, id, maximum, staticMode) {
    const record = data.records[id];
    const target = {...state, group: id};
    const expandable = Boolean(panelFor(data, target));
    const name = expandable
      ? `<a class="row-target" data-group="${esc(id)}" href="${query(target)}${staticMode ? '#static-' + state.view + '-' + id : ''}">${esc(record.label)} <span aria-hidden="true">&rsaquo;</span></a>`
      : `<span class="row-name">${esc(record.label)}</span>`;
    return `<div class="estimate-row" data-record="${esc(id)}" data-status="${esc(record.status)}">
      <div class="row-label">${name}<strong class="national-value">${estimate(record)}</strong></div>
      <small class="row-kind">${esc(record.kind.replace(/-/g, ' '))}${record.scope.tradition ? ' / ' + esc(record.scope.tradition.replace(/-/g, ' ')) : ''}</small>
      ${record.barValue !== null && !staticMode ? `<div class="bar-track" aria-hidden="true"><span class="bar" style="width:${record.barValue / maximum * 100}%"></span></div>` : ''}
      ${record.status === 'threshold' ? '<small>Published upper threshold; no numeric bar.</small>' : ''}
      ${['unavailable', 'suppressed'].includes(record.status) ? `<small>${esc(record.reason)}; no numeric bar.</small>` : ''}
      ${sourceDetail(record)}</div>`;
  }
  function precisionNote(data, ids) {
    const selected = ids.filter(id => Object.hasOwn(data.interactiveStrings, id));
    return selected.length ? `<p class="precision-note">We use the report's published decimals.
      The separate national interactive displays ${selected.map(id => `${esc(data.records[id].label)} ${esc(data.interactiveStrings[id])}`).join('; ')}.
      These are independently published strings, not re-rounded report cells; ordinary rounding does not explain 11.5% versus 11%.</p>` : '';
  }
  function panelContext(data, state, panel) {
    const source = data.sources[panel.sourceId];
    const estimates = new Map([state.group, ...panel.children].map(id => {
      const source = data.records[id].source;
      return [source.url, source];
    }));
    return `<p class="panel-source">Estimates: ${[...estimates.values()].map(source =>
      `${esc(source.publisher)} (${esc(source.publicationDate)}), ${link(source)}`).join('; ')}.</p>
      <p class="panel-source">Hierarchy: ${link(source)}; ${esc(panel.locator)}.
      Each row's Source and caveats identifies its estimate, source column and precise locator.</p>${context(data)}`;
  }
  function renderView(data, state) {
    if (state.view === 'attendance') return renderAttendance(data, state.format);
    const record = data.records[state.group];
    const panel = panelFor(data, state);
    const path = [...ancestors(data, state.view, state.group), state.group];
    const maximumValue = panel ? Math.max(0, ...panel.children.map(id => data.records[id].barValue || 0)) : 0;
    const step = maximumValue > 20 ? 10 : maximumValue > 5 ? 5 : maximumValue > 1 ? 1 : 0.5;
    const maximum = Math.max(step, Math.ceil(maximumValue / step) * step);
    return `<nav aria-label="Affiliation breadcrumb"><ol class="breadcrumbs">${path.map(id => `<li>${id === state.group
      ? `<span aria-current="page">${esc(data.records[id].label)}</span>`
      : `<a data-group="${esc(id)}" href="${query({...state, group: id})}">${esc(data.records[id].label)}</a>`}</li>`).join('')}</ol></nav>
      <h2 id="group-heading" tabindex="-1">${esc(record.label)}</h2>
      ${state.group === 'us-adults' ? '' : `<p class="selected-estimate"><strong>${estimate(record)}</strong> &middot; ${esc(record.kind.replace(/-/g, ' '))}</p>`}
      ${state.group === 'us-adults' ? '' : sourceDetail(record)}${precisionNote(data, [state.group, ...(panel ? panel.children : [])])}
      ${panel ? `<h3>${panel.coverage === 'selected' ? 'Published detail' : 'Affiliations'}</h3>
      <p class="coverage">${panel.coverage === 'selected' ? partial : complete}</p>
      <div class="chart" data-format="${state.format}">
      <p class="axis"><span>0</span><span>% of U.S. adults</span><span>${maximum}%</span></p>
      <ol class="estimate-list">${panel.children.map(id => `<li>${row(data, state, id, maximum, false)}</li>`).join('')}</ol></div>
      ${panelContext(data, state, panel)}` : `<p>No published drill-down in this selection. This is a leaf, not a zero estimate.</p>${context(data)}`}`;
  }
  function renderAttendance(data, format, staticMode = false) {
    const attendance = data.attendance;
    return `<h2 id="${staticMode ? 'static-attendance-heading' : 'group-heading'}" tabindex="-1">Religious service attendance</h2>
      <p><strong>${esc(attendance.denominatorLabel)}</strong>. ${esc(attendance.metric)}, excluding weddings and funerals.</p>
      <p>Each row has its own adult population; the overall row is all U.S. adults. These are self-reports, not denomination-level estimates or virtual attendance. This comparison does not inherit an affiliation focus.</p>
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
      <p class="panel-source">Pew Research Center (${esc(data.study.publicationDate)}), ${link(data.sources['attendance-chapter'])}.
      Attending religious services in person, table 08-04 (attachment 199166); ${link(data.sources.report)}, printed p. 165 (PDF p. 166).
      Column: NET Monthly or more often; precise source rows are available with each estimate.</p>
      <p class="source-context">2023-24 Religious Landscape Study, published ${esc(data.study.publicationDate)}.
      Fielded July 17, 2023-March 4, 2024; 36,908 adults in the 50 U.S. states and D.C.
      <strong>${esc(attendance.denominatorLabel)}</strong>. ${esc(attendance.responseDefinition)}</p>
      <p>Question: ${esc(attendance.question)} ${link(data.sources[attendance.instrumentSourceId])},
      ${esc(attendance.instrumentLocator)}. ${esc(attendance.caveat)}</p>
      <p>Selected twelve published population rows, not an exhaustive inventory or a partition to sum.
      Nonresponses are not shown in the source table; rounded figures need not add to subtotals.
      Whole-percent estimates are retained as published, without summing rounded frequency cells.
      The national margin of error is &plusmn;0.8 percentage points at 95% confidence, not a margin for every subgroup.
      ${link(data.sources.methods)}; ${link(data.sources.classification)}.</p>
      <p class="credit">${data.reuse.notices.map(esc).join(' ')}. ${esc(data.reuse.disclaimer)}
      <a href="${esc(data.reuse.termsUrl)}">Pew Terms of Use</a>; <a href="#methodology">Methods and excerpt reuse limits</a>.</p>`;
  }
  function renderStatic(data) {
    function nested(state) {
      const panel = panelFor(data, state);
      if (!panel) return '';
      return `<section id="static-${state.view}-${state.group}" class="static-panel">
        <h3>${esc(data.records[state.group].label)} &mdash; ${panel.coverage === 'selected' ? 'Published detail' : 'Affiliations'}</h3>
        <p class="coverage">${panel.coverage === 'selected' ? partial : complete}</p>
        ${panelContext(data, state, panel)}${precisionNote(data, [state.group, ...panel.children])}
        <ol class="estimate-list">${panel.children.map(id => `<li>${row(data, state, id, 100, true)}
        ${panelFor(data, {...state, group: id}) ? `<details class="nested-detail"><summary>Explore ${esc(data.records[id].label)} &mdash; published children</summary>${nested({...state, group: id})}</details>` : ''}</li>`).join('')}</ol></section>`;
    }
    return Object.keys(data.lenses).map(view => `<section aria-labelledby="static-${view}-title"><h2 id="static-${view}-title">${esc(data.lenses[view].label)}</h2>
      ${nested({view, group: 'us-adults', format: 'list'})}</section>`).join('') +
      `<section id="static-attendance" aria-labelledby="static-attendance-heading">${renderAttendance(data, 'list', true)}</section>`;
  }
  return {esc, normalize, readURL, query, ancestors, panelFor, renderView, renderStatic, context};
});
