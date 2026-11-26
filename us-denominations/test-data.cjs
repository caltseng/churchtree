const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  loadData, validateData, getChildren,
  presentation, deriveShare, ledger
} = require('./data.cjs');
const original = loadData();
const copy = () => structuredClone(original);
const row = (data, id) => data.affiliation.records.find(record => record.id === id);
const panel = (data, lens, id) => data.hierarchies.lenses[lens].panels.find(item => item.parentId === id);

test('demographic validation rejects denominator qualifications, source drift and mixed scopes', () => {
  for (const edit of [
    data => { data.demographics.wave = '2014'; },
    data => { data.demographics.populations[0].dimension = 'gender'; },
    data => { data.demographics.populations[0].column = '2014'; },
    data => { data.demographics.populations[0].denominatorLabel = ''; },
    data => { data.demographics.populations.find(row => row.id === 'asian').denominatorLabel = 'U.S. Asian adults'; },
    data => { data.demographics.populations[0].estimates[0].value = 62; },
    data => { data.demographics.populations[0].estimates[0].categoryId = 'baptist'; },
    data => { data.demographics.populations[0].estimates[1].categoryId = 'christian'; },
    data => { data.demographics.sources[0].sha256 = 'unknown'; },
    data => { data.demographics.review.status = 'passed'; delete data.demographics.review.reviewedCommit; }
  ]) {
    const fixture = copy();
    edit(fixture);
    assert.throws(() => validateData(fixture));
  }
});
test('groups outside a selected lens are rejected', () => {
  assert.throws(() => getChildren(original, 'traditions', 'presbyterian'), /Group not in lens/);
  assert.throws(() => getChildren(original, 'families', 'baptist-mainline'), /Group not in lens/);
});

test('published detail never manufactures a residual or all-family Independent Baptist', () => {
  const data = copy();
  panel(data, 'families', 'baptist').remainder = 5.2;
  assert.throws(() => validateData(data), /Synthetic remainder/);
});

test('thresholds, suppressed and unavailable values never yield numeric bars or ratios', () => {
  for (const id of ['pnbc', 'jehovahs-witness', 'other-presbyterian-mainline', 'us-adults']) {
    assert.equal(presentation(original, id).barValue, null);
  }
  assert.equal(deriveShare(original, 'families', 'pnbc', 'baptist'), null);
  assert.equal(deriveShare(original, 'traditions', 'pcusa', 'presbyterian-mainline'), null);
  for (const status of ['unavailable', 'suppressed']) {
    const data = copy();
    row(data, 'pcusa').estimate = {status, published: status === 'suppressed' ? 'Suppressed' : 'Unavailable', reason: 'Test fixture'};
    validateData(data);
    assert.equal(presentation(data, 'pcusa').barValue, null);
    assert.equal(deriveShare(data, 'families', 'pcusa', 'presbyterian'), null);
    row(data, 'pcusa').estimate.value = 0;
    assert.throws(() => validateData(data), /Non-numeric row carries a number/);
  }
});

test('conditional estimates verify ancestry and precision and retain input provenance', () => {
  const data = copy();
  Object.assign(row(data, 'sbc').estimate, {value: 2, published: '2.0%'});
  Object.assign(row(data, 'baptist').estimate, {value: 8, published: '8.0%'});
  Object.assign(row(data, 'protestant').estimate, {value: 20, published: '20.0%'});
  const result = deriveShare(data, 'families', 'sbc', 'baptist');
  assert.equal(result.percent, 25);
  assert.equal(result.denominatorId, 'baptist');
  assert.match(result.denominatorLabel, /Baptist/);
  assert.deepEqual(result.inputIds, ['sbc', 'baptist']);
  assert.equal(result.formula, '2.0% / 8.0% * 100');
  assert.match(result.rounding, /rounded published national/);
  assert.equal(deriveShare(data, 'families', 'sbc', 'protestant').percent, 10);
  assert.equal(deriveShare(original, 'families', 'pcusa', 'baptist'), null);
  assert.equal(deriveShare(original, 'families', 'attendance-mainline', 'mainline'), null);
});

test('stable numeric-first ranking has no fabricated threshold bars and leaves stay leaves', () => {
  const initial = getChildren(original, 'families', 'baptist').map(record => record.id);
  const data = copy();
  panel(data, 'families', 'baptist').children.reverse();
  assert.deepEqual(getChildren(data, 'families', 'baptist').map(record => record.id), initial);
  assert(initial.findIndex(id => row(original, id).estimate.status !== 'numeric') >
    initial.findLastIndex(id => row(original, id).estimate.status === 'numeric'));
  assert.deepEqual(getChildren(original, 'families', 'pcusa'), []);
  assert.equal(getChildren(original, 'families', 'us-adults').some(record => record.id === 'no-answer'), true);
});

test('reject duplicate IDs, cells, repeated rows, invalid roots and disconnected cycles', () => {
  const mutations = [
    [data => data.affiliation.records.push({...row(data, 'baptist')}), /Duplicate record ID/],
    [data => {row(data, 'pcusa').source = {...row(data, 'pca').source};}, /Duplicate source cell/],
    [data => panel(data, 'families', 'baptist').children.push('sbc'), /Repeated row/],
    [data => panel(data, 'families', 'baptist').children.push('missing'), /Unknown child/],
    [data => panel(data, 'families', 'baptist').children.push('us-adults'), /cyclic root/],
    [data => {data.hierarchies.lenses.families.rootId = 'baptist';}, /Invalid hierarchy root/],
    [data => {panel(data, 'families', 'protestant').children.splice(0, 1);}, /Disconnected or cyclic/]
  ];
  for (const [mutate, expected] of mutations) {
    const data = copy();
    mutate(data);
    assert.throws(() => validateData(data), expected);
  }
});

test('reject overlapping sibling aggregates, incompatible scopes/series and implausible children', () => {
  const mutations = [
    [data => {
      panel(data, 'families', 'baptist').children = panel(data, 'families', 'baptist').children.filter(id => id !== 'sbc');
      panel(data, 'families', 'protestant').children.push('sbc');
    }, /Overlapping aggregate\/child siblings/],
    [data => {row(data, 'pcusa').scope.tradition = 'evangelical';}, /Invalid subset scope/],
    [data => {row(data, 'sbc').seriesId = 'attendance'; row(data, 'sbc').populationId = 'baptist'; delete row(data, 'sbc').scope; row(data, 'sbc').source = {panelId: 'monthly-attendance', row: 'Fixture'};}, /Incompatible year\/metric\/denominator/],
    [data => {row(data, 'sbc').estimate = {status: 'numeric', value: 20, precision: 1, published: '20.0%'};}, /Child exceeds parent/],
    [data => {data.provenance.study.wave = '2014';}, /Incompatible survey wave/],
    [data => {data.provenance.series.affiliation.denominatorId = 'protestants';}, /national denominator/]
  ];
  for (const [mutate, expected] of mutations) {
    const data = copy();
    mutate(data);
    assert.throws(() => validateData(data), expected);
  }
});

test('reject malformed locators, fabricated threshold values and precision drift', () => {
  const mutations = [
    [data => {row(data, 'sbc').source.row = '';}, /Invalid row locator/],
    [data => {row(data, 'baptist-mainline').source.path = ['Baptist'];}, /Incomplete interactive hierarchy/],
    [data => {row(data, 'pnbc').estimate.value = 0.15;}, /Mixed numeric\/threshold fields/],
    [data => {row(data, 'pcusa').estimate.published = '0.80%';}, /precision mismatch/],
    [data => {row(data, 'pcusa').estimate.value = 0.84;}, /Value exceeds published precision/],
    [data => {row(data, 'sbc').estimate.value = -1;}, /Invalid percentage/],
    [data => {data.provenance.sources[0].reuseDecisionId = 'missing';}, /Missing reuse decision/]
  ];
  for (const [mutate, expected] of mutations) {
    const data = copy();
    mutate(data);
    assert.throws(() => validateData(data), expected);
  }
  for (const input of [original.affiliation, original.attendance]) {
    for (const record of input.records) {
      const view = presentation(original, record.id);
      assert.ok(view.source.url.startsWith('https://www.pewresearch.org/'));
      assert.ok(view.source.row && view.source.column && view.source.locator);
      assert.equal(view.source.publisher, 'Pew Research Center');
    }
  }
  assert.match(ledger(original), /Adults in each religious group/);
});
