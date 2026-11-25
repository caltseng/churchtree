const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {loadData, getChildren, getAncestors, presentation} = require('./data.cjs');
const {publicData} = require('./build.cjs');
const view = require('./view.js');
const internal = loadData(), data = publicData(internal);
const root = path.resolve(__dirname, '..');

test('public projection and generated artifact contain only intentional affiliation and attendance content', () => {
  const sandbox = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'public-data.js'), 'utf8'), sandbox);
  assert.equal(JSON.stringify(sandbox.window.US_AFFILIATION_DATA), JSON.stringify(data));
  assert.deepEqual(Object.keys(data).sort(),
    ['schemaVersion', 'study', 'records', 'lenses', 'sources', 'interactiveStrings', 'reuse', 'attendance', 'demographics'].sort());
  for (const record of Object.values(data.records)) {
    assert.deepEqual(Object.keys(record).sort(),
      ['id', 'label', 'sourceLabel', 'kind', 'scope', 'status', 'valueText', 'barValue', 'reason', 'source'].sort());
    assert.equal(record.valueText, presentation(internal, record.id).valueText);
  }
  for (const record of internal.attendance.records) assert(!Object.hasOwn(data.records, record.id));
  assert(Object.hasOwn(data.sources, 'attendance-chapter'));
  const published = path.join(root, 'dist', 'us-denominations');
  assert.deepEqual(fs.readdirSync(published).sort(),
    ['affiliation.css', 'controller.js', 'index.html', 'public-data.js', 'view.js']);
  assert(!JSON.stringify(data).match(/sha256|reviewStatus|sourcePanelId|checkedDate|reviewedCommit/));
  for (const file of ['index.html', 'public-data.js']) {
    assert.equal(fs.readFileSync(path.join(published, file), 'utf8'), fs.readFileSync(path.join(__dirname, file), 'utf8'));
  }
});

test('each panel preserves source ranking, national labels, locators and coverage', () => {
  for (const [lens, tree] of Object.entries(data.lenses)) {
    for (const panel of tree.panels) {
      assert.deepEqual(panel.children, getChildren(internal, lens, panel.parentId).map(row => row.id));
      assert.deepEqual(view.ancestors(data, lens, panel.parentId), getAncestors(internal, lens, panel.parentId));
      const html = view.renderView(data, {view: lens, group: panel.parentId, format: 'chart'});
      assert.match(html, /% of U.S. adults/);
      assert.match(html, /Fielded /);
      assert.match(html, /Pew Research Center has not reviewed or endorsed/);
      assert.match(html, /No residual is inferred/);
      if (panel.coverage === 'selected') assert.match(html, /Published detail covers selected reported affiliations/);
      for (const id of panel.children) {
        const record = data.records[id];
        assert(html.includes(view.esc(record.source.row)));
        assert(html.includes(view.esc(record.source.url)));
        assert(html.includes(view.esc(record.valueText) + ' of U.S. adults'));
        const markup = html.split(`data-record="${id}"`)[1].split('</li>')[0];
        assert(!markup.includes('class="bar"'));
        assert.equal(html.includes(`data-slice="${id}"`), record.barValue !== null, 'Only numeric estimates become slices');
        assert.equal(markup.includes('class="row-target"'), Boolean(tree.panels.find(p => p.parentId === id)));
      }
      const model = view.pieModel(data, {view: lens, group: panel.parentId}, panel);
      assert(html.indexOf('id="pie-notes"') > html.indexOf('</ol>', html.indexOf('class="estimate-list"')),
        'Supporting notes follow the estimate key');
      if (html.includes('class="precision-note"')) {
        assert(html.indexOf('class="precision-note"') > html.indexOf('id="pie-notes"'), 'Precision follows the key');
      }
      for (const id of panel.children) {
        const record = data.records[id];
        const callout = html.match(new RegExp(`data-callout="${id}"[^]*?</div>`));
        if (record.barValue === null) assert.equal(callout, null, 'Thresholds never acquire a numeric callout');
        else {
          assert(callout, 'Even the smallest numeric slices have visible callouts');
          assert(callout[0].includes(view.esc(record.label)), 'Callouts contain the full category name');
          assert(callout[0].includes(`<strong>${view.esc(record.valueText)}</strong>`), 'Callouts keep the published national value');
        }
      }
      if (model.slices.length) {
        assert.match(html, /class="pie"/);
        const whole = panel.parentId === 'us-adults' ? 100 : data.records[panel.parentId].barValue;
        assert.equal(model.total, Math.max(whole, model.sum), 'Circle is the parent estimate unless rounded children exceed it');
        const swept = model.slices.reduce((total, slice) => total + slice.end - slice.start, 0);
        assert(Math.abs(swept / (Math.PI * 2) - model.sum / model.total) < 1e-9, 'Slices are drawn to scale');
        assert.equal(new Set(model.slices.map(slice => slice.fill)).size, model.slices.length, 'Each slice and legend swatch has a distinct fill');
        if (model.sum > whole + 0.05) assert.match(html, /circle is scaled to their total/);
        if (panel.coverage === 'selected' && whole - model.sum > 0.05) assert.match(html, /Hatched: not itemized by Pew\. Not an estimate/);
      } else {
        assert.match(html, /No pie: each published child/);
      }
    }
  }
});

test('pie palette text colors meet WCAG 4.5:1 against their fills', () => {
  const luminance = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const [fill, ink] of view.palette) {
    const [a, b] = [luminance(fill), luminance(ink)];
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    assert(ratio >= 4.5, `${ink} on ${fill} is ${ratio.toFixed(2)}:1`);
  }
});

test('leaf categories explain the missing breakdown without a pie', () => {
  const html = view.renderView(data, {view: 'families', group: 'sbc', format: 'chart'});
  assert.match(html, /No finer breakdown is published\./);
  assert(!html.includes('class="pie"') && !html.includes('data-slice='));
  assert.match(html, /class="source-line"[^]*Pew Research Center[^]*©/, 'Leaf keeps a visible source credit and notice');
  assert.match(html, /<details class="info-detail"[^]*Pew Research Center has not reviewed or endorsed/, 'Disclaimer moves behind Info');
});

test('missing and suppressed fixtures retain reasons, exact text and no fabricated bars', () => {
  for (const status of ['unavailable', 'suppressed']) {
    const fixture = structuredClone(data);
    Object.assign(fixture.records.pnbc, {status, valueText: status === 'unavailable' ? 'Unavailable' : 'Suppressed', barValue: null, reason: 'Not published for this scope'});
    const html = view.renderView(fixture, {view: 'families', group: 'baptist', format: 'chart'});
    const row = html.split('data-record="pnbc"')[1].split('</li>')[0];
    assert.match(row, /Not published for this scope; no slice/);
    assert(!row.includes('class="bar"'));
    assert(!html.includes('data-slice="pnbc"'));
  }
});

test('URL validation, identical-scope lens preservation and incompatible Protestant fallback', () => {
  const cases = [
    ['', 'families', 'us-adults', 'chart', false],
    ['?view=families&group=baptist', 'families', 'baptist', 'chart', false],
    ['?view=traditions&group=presbyterian-mainline&format=list', 'traditions', 'presbyterian-mainline', 'list', false],
    ['?view=traditions&group=baptist', 'traditions', 'protestant', 'chart', true],
    ['?view=families&group=mainline', 'families', 'protestant', 'chart', true],
    ['?view=traditions&group=pcusa', 'traditions', 'pcusa', 'chart', false],
    ['?view=bogus&group=bogus', 'families', 'us-adults', 'chart', true],
    ['?view=families&group=__proto__', 'families', 'us-adults', 'chart', true],
    ['?view=families&group=%3Cscript%3E', 'families', 'us-adults', 'chart', true],
    ['?group=baptist&group=christian', 'families', 'us-adults', 'chart', true],
    ['?view=traditions&view=families', 'families', 'us-adults', 'chart', true],
    ['?format=invalid&unknown=1', 'families', 'us-adults', 'chart', true],
    ['?view=attendance', 'attendance', null, 'chart', false],
    ['?view=attendance&format=list', 'attendance', null, 'list', false],
    ['?view=attendance&group=baptist', 'attendance', null, 'chart', true],
    ['?view=attendance&group=attendance-mainline', 'attendance', null, 'chart', true],
    ['?view=attendance&group=baptist&group=christian', 'attendance', null, 'chart', true],
    ['?view=attendance&format=list&format=chart', 'attendance', null, 'chart', true]
  ];
  for (const [search, lens, group, format, corrected] of cases) {
    assert.deepEqual(view.readURL(data, search), {state: {view: lens, group, format}, corrected});
  }
  for (const id of ['us-adults', 'christian', 'protestant', 'sbc', 'pcusa']) {
    assert.equal(view.normalize(data, {view: 'traditions', group: id}).group, id);
  }
});

test('attendance retains published NETs, exact projection, independent populations and table/chart/static equivalence', () => {
  assert.equal(Object.keys(data.records).length, 85);
  assert.deepEqual(Object.keys(data.attendance).sort(), [
    'metric', 'denominatorId', 'denominatorLabel', 'axisLabel', 'question', 'instrumentSourceId',
    'instrumentLocator', 'responseDefinition', 'scale', 'caveat', 'records'
  ].sort());
  assert.equal(data.attendance.records.length, 12);
  assert.deepEqual(data.attendance.scale, [0, 100]);
  const chart = view.renderView(data, {view: 'attendance', group: null, format: 'chart'});
  const list = view.renderView(data, {view: 'attendance', group: null, format: 'list'});
  assert.equal(chart.replace('data-format="chart"', 'data-format="list"'), list);
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const staticTable = html.split('<section id="static-attendance"')[1].split('</section>')[0];
  for (const record of data.attendance.records) {
    assert.deepEqual(Object.keys(record).sort(), [
      'id', 'label', 'populationId', 'sourceLabel', 'status', 'valueText', 'barValue', 'source'
    ].sort());
    const original = internal.attendance.records.find(row => row.id === record.id);
    const display = presentation(internal, record.id);
    assert.equal(record.valueText, original.estimate.published);
    assert.equal(record.barValue, original.estimate.value);
    assert.equal(record.source.row, display.source.row);
    assert.equal(record.source.locator, display.source.locator);
    assert.deepEqual(Object.keys(record.source).sort(), [
      'title', 'publisher', 'publicationDate', 'url', 'locator', 'column', 'row', 'caveat'
    ].sort());
    assert(!Object.hasOwn(data.records, record.id));
    for (const markup of [chart, list, html]) {
      assert(markup.includes(`data-attendance="${record.id}"`));
      assert(markup.includes(`<strong>${record.valueText}</strong>`));
      assert(markup.includes(view.esc(record.source.row)));
      assert(markup.includes(view.esc(record.source.column)));
    }
    assert(chart.includes(`style="width:${record.barValue}%"`));
  }
  assert(!staticTable.includes('class="bar"'));
  for (const markup of [chart, list, html]) {
    assert.match(markup, /Adults in each religious group/);
    assert.match(markup, /table 08-04 \(attachment 199166\)/);
    assert.match(markup, /printed p. 165 \(PDF p. 166\)/);
    assert.match(markup, /ATTENDPERRLS/);
    assert.match(markup, /Printed p. 23 \(PDF p. 23\)/);
    assert.match(markup, /Fielded /);
    assert.match(markup, /not a margin for every subgroup/);
    assert.match(markup, /not directly comparable with/);
    assert.match(markup, /Pew Research Center has not reviewed or endorsed/);
  }
  for (const markup of [chart, list, staticTable]) {
    assert(!markup.includes(' of U.S. adults'));
    assert(!markup.includes('data-group='));
  }
  assert.deepEqual(view.ancestors(data, 'attendance', null), []);
  assert.equal(view.query({view: 'attendance', group: null, format: 'list'}), '?view=attendance&format=list');
});

test('static nested content includes every lens occurrence and source/threshold/reuse context', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const [lens, tree] of Object.entries(data.lenses)) {
    for (const panel of tree.panels) {
      assert(html.includes(`id="static-${lens}-${panel.parentId}"`));
    }
  }
  assert(html.includes(view.esc(data.records.pnbc.valueText) + ' of U.S. adults'));
  assert.match(html, /Main Branch&#39;s selection and presentation are independent/);
  assert.match(html, /Ordinary rounding does not explain/);
  assert.match(html, /No written permission has been obtained or claimed/);
  assert.match(html, /Appendix B alone supplies names and classification, not values/);
  assert.match(html, /religious identity questions and denomination coding/);
});

test('built HTML shares repeated notes, stays below 120 KB and preserves every static row locator', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(Buffer.byteLength(html) < 120000, `HTML is ${Buffer.byteLength(html)} bytes`);
  const repeated = [
    data.reuse.disclaimer, ...data.reuse.notices,
    'No residual is inferred.',
    'Published detail covers selected reported affiliations, not an exhaustive inventory.',
    'Published estimates are independently rounded and need not add to the parent or to 100%.',
    'Fielded ',
    data.demographics.caveat, data.demographics.reuseLimits
  ];
  for (const text of repeated) assert.equal(html.split(view.esc(text)).length - 1, 1, text);
  for (const text of [
    'has not reviewed or endorsed', 'Select a slice, or use arrow keys',
    'Fielded ', 'need not add to the parent'
  ]) assert(html.split(text).length - 1 <= 1, text);
  assert(!html.includes('<details class="row-source">'), 'Static rows link to shared evidence rather than repeating disclosures');
  assert.match(html, /id="interactive-view"[^>]*hidden><\/section>/, 'JS renders the interactive view, not a second static copy');
  function checkRow(markup, record) {
    const target = markup.match(/href="#(static-source-\d+)"/);
    assert(target, `Source link for ${record.id}`);
    const source = html.split(`id="${target[1]}"`)[1].split('</p>')[0];
    for (const value of ['url', 'publisher', 'publicationDate', 'locator', 'column']) {
      assert(source.includes(view.esc(record.source[value])), `${record.id}: ${value}`);
    }
    assert(markup.includes(view.esc(record.source.path ? record.source.path.join(' > ') : record.source.row)), record.id);
    assert(markup.includes(view.esc(record.valueText)), `${record.id}: estimate`);
    if (record.source.caveat) {
      const caveat = source.match(/href="#(static-caveat-\d+)"/);
      assert(caveat, `${record.id}: caveat link`);
      assert(html.split(`id="${caveat[1]}"`)[1].split('</p>')[0].includes(view.esc(record.source.caveat)));
    }
  }
  for (const [lens, tree] of Object.entries(data.lenses)) {
    for (const panel of tree.panels) {
      const section = html.split(`id="static-${lens}-${panel.parentId}"`)[1];
      for (const id of panel.children) {
        const row = section.split(`data-record="${id}"`)[1].split('</li>')[0];
        checkRow(row, data.records[id]);
      }
    }
  }
  for (const record of data.attendance.records) {
    checkRow(html.split(`data-attendance="${record.id}"`)[1].split('</tr>')[0], record);
  }
  for (const population of data.demographics.populations) {
    const section = html.split(`id="static-demographics-${population.id}"`)[1];
    for (const record of population.records) {
      checkRow(section.split(`data-demographic="${record.id}"`)[1].split('</tr>')[0], record);
    }
  }
});

test('shared static sources preserve distinct caveats on otherwise identical source metadata', () => {
  const fixture = structuredClone(data);
  fixture.records.catholic.source = {...fixture.records.christian.source, caveat: 'Distinct population caveat.'};
  const html = view.renderStatic(fixture);
  const row = html.split('data-record="catholic"')[1].split('</li>')[0];
  const sourceId = row.match(/href="#(static-source-\d+)"/)[1];
  const source = html.split(`id="${sourceId}"`)[1].split('</p>')[0];
  const caveatId = source.match(/href="#(static-caveat-\d+)"/)[1];
  assert(html.split(`id="${caveatId}"`)[1].split('</p>')[0].includes('Distinct population caveat.'));
});

test('demographics use independent subgroup denominators, exact cells and intentional public projection', () => {
  assert.deepEqual(Object.keys(data.demographics).sort(),
    ['wave', 'metric', 'caveat', 'reuseLimits', 'dimensions', 'questionnaire', 'populations'].sort());
  for (const population of data.demographics.populations) {
    assert.deepEqual(Object.keys(population).sort(), [
      'id', 'dimension', 'label', 'denominatorId', 'denominatorLabel', 'nonresponse', 'uncertainty', 'records'
    ].sort());
    const original = internal.demographics.populations.find(row => row.id === population.id);
    assert.equal(population.denominatorId, original.id);
    assert.equal(population.denominatorLabel, original.denominatorLabel);
    const state = {view: 'demographics', group: null, dimension: population.dimension, population: population.id, format: 'chart'};
    const chart = view.renderView(data, state), list = view.renderView(data, {...state, format: 'list'});
    assert.equal(chart.replace('data-format="chart"', 'data-format="list"'), list);
    assert.deepEqual(view.ancestors(data, 'demographics', null), []);
    assert.equal(view.panelFor(data, state), undefined);
    assert.match(chart, /within this population, not its share of a religion/);
    assert.match(chart, /Fixed scale: 0-100%/);
    assert.match(chart, /Fielded /);
    assert.match(chart, /No intersectional combinations/);
    assert.match(chart, /Pew Research Center has not reviewed or endorsed/);
    assert(!chart.includes('data-group=') && !chart.includes('Affiliation breadcrumb'));
    assert(chart.includes(view.esc(population.denominatorLabel)));
    for (const record of population.records) {
      assert.deepEqual(Object.keys(record).sort(), ['id', 'label', 'status', 'valueText', 'barValue', 'reason', 'source'].sort());
      const estimate = original.estimates.find(row => row.categoryId === record.id);
      assert.equal(record.valueText, estimate.published);
      assert.equal(record.barValue, estimate.value);
      assert.equal(record.source.column, original.column);
      assert.equal(record.source.locator, original.locator);
      assert(chart.includes(`<strong>${view.esc(estimate.published)}</strong>`));
      assert(chart.includes(`width:${record.barValue}%`));
      assert(chart.includes(view.esc(record.source.row)) && chart.includes(view.esc(record.source.url)));
    }
    const staticMarkup = view.renderStatic(data).split(`id="static-demographics-${population.id}"`)[1].split('</table>')[0];
    assert(!staticMarkup.includes('class="bar"'));
    assert(staticMarkup.includes(view.esc(population.denominatorLabel)));
  }
});

test('demographic URLs reject incompatible, duplicate, national and intersectional state', () => {
  const defaultState = {view: 'demographics', group: null, dimension: 'age', population: 'age-18-29', format: 'chart'};
  for (const search of [
    '?view=demographics&group=baptist', '?view=demographics&population=baptist',
    '?view=demographics&dimension=invalid', '?view=demographics&dimension=age&dimension=gender',
    '?view=demographics&population=age-18-29&population=women',
    '?view=demographics&age=18-29&gender=men'
  ]) assert.deepEqual(view.readURL(data, search), {state: defaultState, corrected: true});
  const state = {...defaultState, dimension: 'race-ethnicity', population: 'asian', format: 'list'};
  assert.deepEqual(view.readURL(data, view.query(state)), {state, corrected: false});
  assert.equal(view.query(state), '?view=demographics&dimension=race-ethnicity&population=asian&format=list');
  assert.deepEqual(view.readURL(data, '?view=demographics&dimension=gender&population=asian'),
    {state: {...defaultState, dimension: 'gender', population: 'men'}, corrected: true});
  for (const target of ['attendance', 'families']) {
    const result = view.readURL(data, `?view=${target}&dimension=gender&population=men`);
    assert(result.corrected);
    assert(!Object.hasOwn(result.state, 'population'));
  }
});

test('demographic bounds and missing estimates preserve exact text without bars', () => {
  for (const [status, valueText, reason] of [
    ['threshold', '<1%', null], ['suppressed', 'Suppressed', 'Insufficient sample'], ['unavailable', 'Unavailable', 'Not published']
  ]) {
    const fixture = structuredClone(data);
    Object.assign(fixture.demographics.populations[0].records[0], {status, valueText, reason, barValue: null});
    const markup = view.renderView(fixture, {view: 'demographics', population: 'age-18-29', format: 'chart'});
    const row = markup.split('data-demographic="christian"')[1].split('</tr>')[0];
    assert(!row.includes('class="bar"'));
    assert(row.includes(view.esc(valueText)));
    if (reason) assert(row.includes(reason));
  }
});
