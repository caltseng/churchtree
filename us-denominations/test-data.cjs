const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  loadData, validateData, getRecord, getChildren, getAncestors,
  presentation, deriveShare, ledger
} = require('./data.cjs');
const original = loadData();
const copy = () => structuredClone(original);
const row = (data, id) => data.affiliation.records.find(record => record.id === id);
const panel = (data, lens, id) => data.hierarchies.lenses[lens].panels.find(item => item.parentId === id);

test('demographic broad excerpts retain independent populations and primary source anchors', () => {
  const anchors = {'age-18-29': ['45%', '9%', '44%'], men: ['59%', '8%', '31%'],
    asian: ['33%', '32%', '33%'], 'college-graduate': ['58%', '10%', '31%']};
  for (const [id, values] of Object.entries(anchors)) {
    const population = original.demographics.populations.find(row => row.id === id);
    assert.deepEqual(population.estimates.map(row => row.published), values);
  }
  assert.match(original.demographics.dimensions.find(row => row.id === 'gender').definition, /Self-described gender, not sex assigned at birth/);
  assert.match(original.demographics.populations.find(row => row.id === 'asian').denominatorLabel, /English-speaking non-Hispanic/);
  assert.equal(original.demographics.populations.find(row => row.id === 'women').column, 'Among women > 2023-24');
  assert.match(ledger(original), /age-distribution\/18-29 > Religious composition > top-level cards/);
  assert.throws(() => getRecord(original, 'men'), /Unknown record/);
});

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
    data => { data.demographics.review.status = 'passed'; }
  ]) {
    const fixture = copy();
    edit(fixture);
    assert.throws(() => validateData(fixture));
  }
});

test('named published anchors retain national values, precision and thresholds', () => {
  const anchors = {
    baptist: '12.0%', presbyterian: '1.7%', sbc: '4.4%', abcusa: '1.0%',
    'nbc-usa': '1.0%', nbca: '0.4%', pnbc: '<0.3%', pcusa: '0.8%', pca: '0.5%',
    evangelical: '23.1%', mainline: '11.5%', 'historically-black': '5.4%'
  };
  for (const [id, published] of Object.entries(anchors)) {
    assert.equal(presentation(original, id).valueText, published);
    assert.equal(presentation(original, id).denominatorLabel, 'Share of U.S. adults');
  }
  assert.deepEqual(original.provenance.decisions[0].interactiveStrings,
    {evangelical: '23%', mainline: '11%', 'historically-black': '5%'});
});

test('families and traditions use distinct intersections and identical denomination records', () => {
  assert.deepEqual(getAncestors(original, 'families', 'baptist'), ['us-adults', 'christian', 'protestant']);
  assert.deepEqual(getAncestors(original, 'families', 'presbyterian'), ['us-adults', 'christian', 'protestant']);
  assert.deepEqual(getAncestors(original, 'traditions', 'presbyterian-mainline'),
    ['us-adults', 'christian', 'protestant', 'mainline']);
  assert.equal(getRecord(original, 'presbyterian-mainline').estimate.published, '1%');
  assert.deepEqual(getChildren(original, 'families', 'presbyterian').map(record => record.id), ['pcusa', 'pca']);
  assert.deepEqual(getChildren(original, 'traditions', 'presbyterian-mainline').map(record => record.id),
    ['pcusa', 'other-presbyterian-mainline']);
  assert.throws(() => getChildren(original, 'traditions', 'presbyterian'), /Group not in lens/);
  assert.throws(() => getChildren(original, 'families', 'baptist-mainline'), /Group not in lens/);
});

test('published detail never manufactures a residual or all-family Independent Baptist', () => {
  const baptists = getChildren(original, 'families', 'baptist');
  assert.equal(baptists.length, 5);
  assert.equal(panel(original, 'families', 'baptist').coverage, 'selected');
  assert.equal(baptists.some(record => /other|remainder|independent/.test(record.id)), false);
  assert.equal(getRecord(original, 'independent-baptist-evangelical').estimate.published, '3%');
  assert.equal(getRecord(original, 'independent-baptist-historically-black').estimate.published, '<1%');
  assert.throws(() => getRecord(original, 'independent-baptist'), /Unknown record/);
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
  const result = deriveShare(original, 'families', 'sbc', 'baptist');
  assert.equal(result.percent, 37);
  assert.equal(result.denominatorId, 'baptist');
  assert.match(result.denominatorLabel, /Baptist/);
  assert.deepEqual(result.inputIds, ['sbc', 'baptist']);
  assert.equal(result.formula, '4.4% / 12.0% * 100');
  assert.match(result.rounding, /rounded published national/);
  assert.equal(deriveShare(original, 'families', 'sbc', 'protestant').percent, 11);
  assert.equal(deriveShare(original, 'families', 'pcusa', 'baptist'), null);
  assert.equal(deriveShare(original, 'families', 'attendance-mainline', 'mainline'), null);
});

test('attendance anchors use published in-person NETs and group populations independently', () => {
  const expected = {'attendance-us-adults': 33, 'attendance-evangelical': 60,
    'attendance-historically-black': 46, 'attendance-mainline': 34};
  for (const [id, value] of Object.entries(expected)) {
    const view = presentation(original, id);
    assert.equal(view.barValue, value);
    assert.equal(view.denominatorLabel, 'Adults in each religious group');
    assert.equal(view.source.column, 'NET Monthly or more often');
    assert.match(view.source.locator, /165/);
  }
  assert.deepEqual(original.provenance.series.attendance.scale, [0, 100]);
  assert.match(original.provenance.series.attendance.instrumentLocator, /ATTENDPERRLS/);
  assert.match(original.provenance.series.attendance.question, /in person/);
  assert.throws(() => getChildren(original, 'families', 'attendance-mainline'), /Group not in lens/);
});

test('stable numeric-first ranking has no fabricated threshold bars and leaves stay leaves', () => {
  const initial = getChildren(original, 'families', 'baptist').map(record => record.id);
  const data = copy();
  panel(data, 'families', 'baptist').children.reverse();
  assert.deepEqual(getChildren(data, 'families', 'baptist').map(record => record.id), initial);
  assert.equal(initial[0], 'sbc');
  assert.equal(initial.at(-1), 'pnbc');
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
  // A whole-percent parent of 1% can contain the separately published decimal child of 1.1%.
  assert.equal(getChildren(original, 'traditions', 'lutheran-evangelical')[0].estimate.value, 1.1);
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
  assert.match(ledger(original), /pnbc\t<0\.3%/);
  assert.match(ledger(original), /Adults in each religious group/);
});

test('internal inputs are never registered for recursive public copying', () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'site.config.json'), 'utf8'));
  assert.equal(config.publicDirectories.includes('us-denominations'), false);
  assert.deepEqual(config.publicFiles.filter(name => name.startsWith('us-denominations/')).sort(),
    ['affiliation.css', 'controller.js', 'index.html', 'public-data.js', 'view.js'].map(name => 'us-denominations/' + name).sort());
});
