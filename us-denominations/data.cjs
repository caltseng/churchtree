const fs = require('node:fs');
const path = require('node:path');

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
}

function loadData() {
  const data = {
    provenance: readJSON('sources.json'),
    affiliation: readJSON('affiliation.json'),
    attendance: readJSON('attendance.json'),
    hierarchies: readJSON('hierarchies.json')
  };
  validateData(data);
  return data;
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function unique(rows, label) {
  const ids = new Set();
  for (const row of rows) {
    requireValue(text(row.id) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id), `Invalid ${label} ID`);
    requireValue(!ids.has(row.id), `Duplicate ${label} ID: ${row.id}`);
    ids.add(row.id);
  }
  return ids;
}

function records(data) {
  return [data.affiliation, data.attendance].flatMap(input => input.records.map(row => ({
    ...row,
    seriesId: row.seriesId || input.seriesId,
    series: data.provenance.series[row.seriesId || input.seriesId],
    study: data.provenance.study,
    checkedDate: data.provenance.checkedDate
  })));
}

function getRecord(data, id) {
  const row = records(data).find(record => record.id === id);
  requireValue(row, `Unknown record: ${id}`);
  return row;
}

function panels(data, lens) {
  requireValue(Object.hasOwn(data.hierarchies.lenses, lens), `Unknown lens: ${lens}`);
  return [...data.hierarchies.sharedPanels, ...data.hierarchies.lenses[lens].panels];
}

function validateEstimate(estimate, id) {
  requireValue(estimate && text(estimate.published), `Missing estimate: ${id}`);
  requireValue(['numeric', 'threshold', 'unavailable', 'suppressed'].includes(estimate.status), `Invalid estimate status: ${id}`);
  if (estimate.status === 'unavailable' || estimate.status === 'suppressed') {
    requireValue(text(estimate.reason), `Missing unavailable/suppressed reason: ${id}`);
    requireValue(!Object.hasOwn(estimate, 'value') && !Object.hasOwn(estimate, 'upperBound'), `Non-numeric row carries a number: ${id}`);
    return;
  }
  requireValue(Number.isInteger(estimate.precision) && estimate.precision >= 0 && estimate.precision <= 1, `Invalid precision: ${id}`);
  const numeric = estimate.status === 'numeric';
  const value = numeric ? estimate.value : estimate.upperBound;
  requireValue(Number.isFinite(value) && value >= 0 && value <= 100 && (numeric || value > 0), `Invalid percentage: ${id}`);
  requireValue(Number(value.toFixed(estimate.precision)) === value, `Value exceeds published precision: ${id}`);
  requireValue(!Object.hasOwn(estimate, numeric ? 'upperBound' : 'value'), `Mixed numeric/threshold fields: ${id}`);
  requireValue(estimate.published === `${numeric ? '' : '<'}${value.toFixed(estimate.precision)}%`, `Published string/precision mismatch: ${id}`);
}

function scopesOverlap(a, b) {
  return !Object.keys(a).some(key => Object.hasOwn(b, key) && a[key] !== b[key]);
}

function interval(estimate) {
  if (estimate.status === 'numeric') {
    const halfUnit = 0.5 * 10 ** -estimate.precision;
    return [Math.max(0, estimate.value - halfUnit), Math.min(100, estimate.value + halfUnit)];
  }
  if (estimate.status === 'threshold') return [0, estimate.upperBound];
  return null;
}

function sameSeries(a, b) {
  return a.seriesId === b.seriesId &&
    a.series.studyId === b.series.studyId &&
    a.series.metric === b.series.metric &&
    a.series.denominatorId === b.series.denominatorId &&
    a.study.wave === b.study.wave &&
    a.study.geography === b.study.geography;
}

function validateData(data) {
  const provenance = data.provenance;
  requireValue(provenance.schemaVersion === 1, 'Unsupported data schema');
  requireValue(/^\d{4}-\d{2}-\d{2}$/.test(provenance.checkedDate), 'Missing checked date');
  requireValue(provenance.study.id === 'pew-rls-2023-24' && provenance.study.wave === '2023-24', 'Incompatible survey wave');
  requireValue(provenance.study.fieldPeriod.start === '2023-07-17' && provenance.study.fieldPeriod.end === '2024-03-04', 'Incompatible field period');
  requireValue(provenance.study.sampleSize === 36908 && text(provenance.study.geography), 'Invalid population metadata');
  requireValue(data.affiliation.seriesId === 'affiliation' && data.attendance.seriesId === 'attendance', 'Invalid input series');
  for (const id of ['affiliation', 'attendance']) {
    const series = provenance.series[id];
    requireValue(series.studyId === provenance.study.id && text(series.metric) && text(series.denominatorLabel) && text(series.axisLabel), `Invalid series: ${id}`);
  }
  requireValue(provenance.series.affiliation.denominatorId === 'us-adults', 'Affiliation must use national denominator');
  requireValue(provenance.series.attendance.denominatorId === 'adults-in-each-religious-group', 'Attendance must use group denominator');
  requireValue(JSON.stringify(provenance.series.attendance.scale) === '[0,100]' && text(provenance.series.attendance.responseDefinition) &&
    text(provenance.series.attendance.question) && text(provenance.series.attendance.instrumentLocator), 'Invalid attendance measure');
  const sourceIds = unique(provenance.sources, 'source');
  requireValue(sourceIds.has(provenance.series.attendance.instrumentSourceId), 'Missing attendance instrument source');
  const panelIds = unique(provenance.panels, 'source panel');
  const reuseIds = unique(provenance.reuse, 'reuse decision');
  for (const source of provenance.sources) {
    requireValue(text(source.url) && /^https:\/\//.test(source.url) && text(source.title) && text(source.publisher) &&
      text(source.publicationDate) && text(source.revision), `Invalid source metadata: ${source.id}`);
    requireValue(reuseIds.has(source.reuseDecisionId), `Missing reuse decision: ${source.id}`);
    if (source.sha256) requireValue(/^[a-f0-9]{64}$/.test(source.sha256), `Invalid source hash: ${source.id}`);
  }
  for (const decision of provenance.reuse) {
    requireValue(text(decision.termsUrl) && text(decision.checkedDate) && text(decision.decision) &&
      text(decision.limits) && text(decision.attribution) && decision.notices.length > 0 &&
      text(decision.disclaimer), `Incomplete reuse decision: ${decision.id}`);
  }
  for (const panel of provenance.panels) {
    requireValue(sourceIds.has(panel.sourceId) && text(panel.locator) && text(panel.column) && text(panel.caveat), `Invalid source locator: ${panel.id}`);
  }
  const allRecords = records(data);
  const recordIds = unique(allRecords, 'record');
  const recordMap = new Map(allRecords.map(row => [row.id, row]));
  const sourceCells = new Set();
  for (const row of allRecords) {
    requireValue(text(row.label) && text(row.sourceLabel) && row.series, `Invalid row metadata: ${row.id}`);
    requireValue(panelIds.has(row.source.panelId) && text(row.source.row), `Invalid row locator: ${row.id}`);
    const cell = `${row.source.panelId}:${row.source.row}`;
    requireValue(!sourceCells.has(cell), `Duplicate source cell: ${row.id}`);
    sourceCells.add(cell);
    if (row.source.panelId === 'national') {
      requireValue(Array.isArray(row.source.path) && row.source.path.length > 0 &&
        row.source.path.every(text) && row.source.path.at(-1) === row.source.row, `Incomplete interactive hierarchy: ${row.id}`);
    }
    validateEstimate(row.estimate, row.id);
    if (row.seriesId === 'affiliation') {
      requireValue(['population', 'affiliation', 'family', 'family-intersection', 'tradition', 'denomination', 'network', 'response-category'].includes(row.kind), `Invalid row kind: ${row.id}`);
      requireValue(row.scope && Object.entries(row.scope).every(([key, value]) =>
        ['religion', 'affiliation', 'family', 'tradition', 'identity'].includes(key) && text(value)), `Invalid affiliation scope: ${row.id}`);
      requireValue(row.id === 'us-adults' || text(row.scope.religion), `Missing religious scope: ${row.id}`);
      if (row.kind === 'family-intersection') requireValue(text(row.scope.family) && text(row.scope.tradition), `Missing family/tradition intersection: ${row.id}`);
      if (row.kind === 'tradition') requireValue(text(row.scope.tradition) && !row.scope.family, `Invalid tradition scope: ${row.id}`);
      if (row.kind === 'denomination' || row.kind === 'network') requireValue(text(row.scope.identity) && text(row.scope.family) && text(row.scope.tradition), `Missing denomination classification: ${row.id}`);
    } else {
      requireValue(row.seriesId === 'attendance' && recordIds.has(row.populationId) &&
        recordMap.get(row.populationId).seriesId === 'affiliation', `Invalid attendance population: ${row.id}`);
      requireValue(!row.scope && row.source.panelId === 'monthly-attendance', `Attendance must remain independent: ${row.id}`);
    }
  }
  requireValue(Object.keys(data.hierarchies.lenses).sort().join(',') === 'families,traditions', 'Expected two affiliation lenses');
  const used = new Set();
  for (const lens of Object.keys(data.hierarchies.lenses)) {
    const tree = data.hierarchies.lenses[lens];
    requireValue(tree.rootId === 'us-adults', `Invalid hierarchy root: ${lens}`);
    const parentMap = new Map();
    const panelMap = new Map();
    for (const panel of panels(data, lens)) {
      requireValue(recordIds.has(panel.parentId) && !panelMap.has(panel.parentId), `Invalid/duplicate panel parent: ${panel.parentId}`);
      requireValue(['complete', 'selected'].includes(panel.coverage) && Array.isArray(panel.children) &&
        panel.children.length > 0, `Invalid detail coverage: ${panel.parentId}`);
      requireValue(!Object.hasOwn(panel, 'remainder'), `Synthetic remainder: ${panel.parentId}`);
      requireValue(sourceIds.has(panel.sourceId) && text(panel.locator), `Missing subset evidence: ${panel.parentId}`);
      panelMap.set(panel.parentId, panel);
      const parent = recordMap.get(panel.parentId);
      requireValue(parent.seriesId === 'affiliation', `Non-affiliation parent: ${panel.parentId}`);
      const siblings = [];
      for (const id of panel.children) {
        requireValue(recordIds.has(id), `Unknown child: ${id}`);
        requireValue(id !== tree.rootId && !parentMap.has(id), `Repeated row or cyclic root: ${id}`);
        parentMap.set(id, panel.parentId);
        const child = recordMap.get(id);
        requireValue(sameSeries(parent, child), `Incompatible year/metric/denominator: ${id}`);
        requireValue(Object.entries(parent.scope).every(([key, value]) => child.scope[key] === value) &&
          Object.keys(child.scope).length > Object.keys(parent.scope).length, `Invalid subset scope: ${id}`);
        requireValue(siblings.every(sibling => !scopesOverlap(sibling.scope, child.scope)), `Overlapping aggregate/child siblings: ${id}`);
        siblings.push(child);
        const parentRange = interval(parent.estimate), childRange = interval(child.estimate);
        if (parentRange && childRange) requireValue(childRange[0] <= parentRange[1] + 1e-10, `Child exceeds parent outside rounding: ${id}`);
      }
    }
    const visited = new Set();
    function visit(id) {
      requireValue(!visited.has(id), `Cycle or repeated occurrence: ${id}`);
      visited.add(id);
      for (const child of panelMap.get(id)?.children || []) visit(child);
    }
    visit(tree.rootId);
    requireValue([...panelMap.keys(), ...parentMap.keys()].every(id => visited.has(id)), `Disconnected or cyclic hierarchy: ${lens}`);
    for (const id of visited) used.add(id);
  }
  requireValue(data.affiliation.records.every(row => used.has(row.id)), 'Orphan affiliation record');
  return data;
}

function numericValue(row) {
  return row.estimate.status === 'numeric' ? row.estimate.value : null;
}

function compareRows(a, b) {
  const rank = {numeric: 0, threshold: 1, suppressed: 2, unavailable: 3};
  const status = rank[a.estimate.status] - rank[b.estimate.status];
  if (status) return status;
  const value = (numericValue(b) ?? b.estimate.upperBound ?? 0) - (numericValue(a) ?? a.estimate.upperBound ?? 0);
  return value || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function getChildren(data, lens, parentId) {
  const candidates = panels(data, lens);
  requireValue(parentId === data.hierarchies.lenses[lens].rootId ||
    candidates.some(panel => panel.children.includes(parentId)), `Group not in lens: ${parentId}`);
  const panel = candidates.find(candidate => candidate.parentId === parentId);
  return panel ? panel.children.map(id => getRecord(data, id)).sort(compareRows) : [];
}

function getAncestors(data, lens, id) {
  getChildren(data, lens, id);
  const parentMap = new Map(panels(data, lens).flatMap(panel => panel.children.map(child => [child, panel.parentId])));
  const ancestors = [];
  let parent = parentMap.get(id);
  while (parent) {
    ancestors.unshift(parent);
    parent = parentMap.get(parent);
  }
  return ancestors;
}

function sourceFor(data, row) {
  const panel = data.provenance.panels.find(item => item.id === row.source.panelId);
  requireValue(panel, `Unknown source panel: ${row.source.panelId}`);
  const source = data.provenance.sources.find(item => item.id === panel.sourceId);
  return {...source, locator: panel.locator, column: panel.column, row: row.source.row,
    path: row.source.path || null, caveat: panel.caveat};
}

function presentation(data, id) {
  const row = getRecord(data, id);
  return {
    id: row.id,
    label: row.label,
    valueText: row.estimate.published,
    status: row.estimate.status,
    barValue: numericValue(row),
    denominatorId: row.series.denominatorId,
    denominatorLabel: row.series.denominatorLabel,
    populationLabel: row.seriesId === 'attendance' ? getRecord(data, row.populationId).label : row.study.population,
    source: sourceFor(data, row)
  };
}

function deriveShare(data, lens, childId, parentId) {
  const child = getRecord(data, childId), parent = getRecord(data, parentId);
  if (!sameSeries(child, parent) || child.seriesId !== 'affiliation') return null;
  if (!getAncestors(data, lens, childId).includes(parentId)) return null;
  const suitable = row => row.estimate.status === 'numeric' && row.estimate.value > 0 &&
    (row.estimate.precision > 0 || row.estimate.value >= 10);
  if (!suitable(child) || !suitable(parent)) return null;
  const percent = Math.round(child.estimate.value / parent.estimate.value * 100);
  return {
    percent,
    approximate: true,
    denominatorId: parent.id,
    denominatorLabel: `Adults identifying as ${parent.label}`,
    inputIds: [child.id, parent.id],
    formula: `${child.estimate.published} / ${parent.estimate.published} * 100`,
    rounding: 'Calculated from rounded published national estimates; rounded to a whole percent.'
  };
}

function ledger(data) {
  const lines = ['ID\tPublished value\tDenominator\tSource\tURL\tColumn\tRow / interactive path'];
  for (const row of records(data)) {
    const source = sourceFor(data, row);
    lines.push([row.id, row.estimate.published, row.series.denominatorLabel,
      `${source.title}; ${source.locator}`, source.url, source.column, source.path?.join(' > ') || source.row].join('\t'));
  }
  for (const lens of Object.keys(data.hierarchies.lenses)) {
    lines.push(`\n${lens}: verified subset mapping to reconcile`);
    for (const panel of panels(data, lens)) lines.push(`${panel.parentId} -> ${panel.children.join(', ')}\t${panel.coverage}\t${panel.sourceId}: ${panel.locator}`);
  }
  return lines.join('\n');
}

module.exports = {loadData, validateData, records, getRecord, getChildren, getAncestors, sourceFor, presentation, numericValue, deriveShare, compareRows, ledger};

if (require.main === module) {
  const data = loadData();
  if (process.argv.includes('--ledger')) console.log(ledger(data));
  else console.log(`Validated ${data.affiliation.records.length} affiliation records, ${data.attendance.records.length} attendance records and two reference hierarchies (offline). Source reconciliation: ${data.provenance.review.status}.`);
}
