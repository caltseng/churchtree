const fs = require('node:fs');
const path = require('node:path');

function validateDemographics(data, validateEstimate) {
  const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const unique = (rows, label) => {
    requireValue(Array.isArray(rows) && rows.length > 0, `Missing demographic ${label}`);
    const ids = rows.map(row => row.id);
    requireValue(ids.every(id => text(id) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) &&
      new Set(ids).size === ids.length, `Invalid/duplicate demographic ${label}`);
    return new Set(ids);
  };
  requireValue(data.schemaVersion === 1 && data.studyId === 'pew-rls-2023-24' &&
    data.wave === '2023-24' && text(data.metric) && /^\d{4}-\d{2}-\d{2}$/.test(data.checkedDate), 'Invalid demographic study');
  const dimensions = unique(data.dimensions, 'dimensions');
  requireValue([...dimensions].join(',') === 'age,gender,race-ethnicity,education', 'Expected four independent demographic dimensions');
  for (const dimension of data.dimensions) requireValue(text(dimension.label) && text(dimension.definition) &&
    text(dimension.instrumentLocator), `Missing demographic definition: ${dimension.id}`);
  const categories = unique(data.categories, 'categories');
  requireValue([...categories].join(',') === 'christian,other-religions,unaffiliated', 'Only selected broad demographic affiliations allowed');
  for (const category of data.categories) requireValue(text(category.label) && text(category.sourceRow), 'Missing demographic source row');
  const sources = unique(data.sources, 'sources');
  requireValue(sources.has('questionnaire'), 'Missing demographic instrument');
  for (const source of data.sources) requireValue(text(source.title) && source.publisher === 'Pew Research Center' &&
    source.publicationDate === '2025-02-26' && /^https:\/\//.test(source.url) && text(source.revision) &&
    /^[a-f0-9]{64}$/.test(source.sha256), `Invalid demographic source: ${source.id}`);
  unique(data.populations, 'populations');
  const selected = {
    age: ['age-18-29', 'age-30-49', 'age-50-64', 'age-65-plus'],
    gender: ['men', 'women'], 'race-ethnicity': ['white', 'black', 'asian', 'hispanic'],
    education: ['college-graduate', 'less-than-college']
  };
  requireValue(data.populations.length === 12, 'Expected twelve selected demographic populations');
  const cells = new Set();
  for (const population of data.populations) {
    requireValue(dimensions.has(population.dimension) && selected[population.dimension].includes(population.id) &&
      text(population.label) && text(population.denominatorLabel) &&
      sources.has(population.sourceId) && text(population.locator) && text(population.column) &&
      population.column.endsWith('2023-24') && text(population.nonresponse) && text(population.uncertainty),
    `Invalid demographic population/denominator/locator: ${population.id}`);
    if (population.id === 'asian') requireValue(population.denominatorLabel.includes('English-speaking') &&
      population.denominatorLabel.includes('non-Hispanic') && population.denominatorLabel.includes('only Asian'),
    'Missing Asian population qualifications');
    requireValue(population.estimates.length === categories.size &&
      new Set(population.estimates.map(row => row.categoryId)).size === categories.size, `Missing/duplicate demographic estimates: ${population.id}`);
    for (const estimate of population.estimates) {
      requireValue(categories.has(estimate.categoryId), `Unknown demographic affiliation: ${estimate.categoryId}`);
      const row = estimate.sourceRow || data.categories.find(category => category.id === estimate.categoryId).sourceRow;
      const cell = [population.sourceId, population.locator, population.column, row].join(':');
      requireValue(!cells.has(cell), `Duplicate demographic source cell: ${population.id}`);
      cells.add(cell);
      validateEstimate(estimate, `${population.id}/${estimate.categoryId}`);
    }
  }
  for (const dimension of dimensions) requireValue(data.populations.some(row => row.dimension === dimension), `Empty demographic dimension: ${dimension}`);
  requireValue(text(data.caveat) && text(data.reuse.decision) && text(data.reuse.limits) &&
    data.reuse.termsUrl === 'https://www.pewresearch.org/about/terms-and-conditions/' && text(data.reuse.checkedDate), 'Missing demographic reuse limits');
  requireValue(['pending', 'passed'].includes(data.review.status) && text(data.review.scope), 'Missing demographic source review');
  if (data.review.status === 'passed') requireValue(/^[a-f0-9]{40}$/.test(data.review.reviewedCommit) &&
    text(data.review.reviewer) && text(data.review.checkedDate), 'Incomplete demographic source review');
  return data;
}

function loadDemographics(validateEstimate) {
  return validateDemographics(JSON.parse(fs.readFileSync(path.join(__dirname, 'demographics.json'), 'utf8')), validateEstimate);
}

function projectDemographics(data) {
  return {
    wave: data.wave, metric: data.metric, caveat: data.caveat, reuseLimits: data.reuse.limits,
    dimensions: data.dimensions.map(({id, label, definition, instrumentLocator}) => ({id, label, definition, instrumentLocator})),
    questionnaire: (({title, publisher, publicationDate, url}) => ({title, publisher, publicationDate, url}))(
      data.sources.find(source => source.id === 'questionnaire')),
    populations: data.populations.map(population => {
      const source = data.sources.find(source => source.id === population.sourceId);
      return {
        id: population.id, dimension: population.dimension, label: population.label,
        denominatorId: population.id, denominatorLabel: population.denominatorLabel,
        nonresponse: population.nonresponse, uncertainty: population.uncertainty,
        records: population.estimates.map(estimate => {
          const category = data.categories.find(row => row.id === estimate.categoryId);
          return {
            id: category.id, label: category.label, status: estimate.status,
            valueText: estimate.published, barValue: estimate.status === 'numeric' ? estimate.value : null,
            reason: estimate.reason || null,
            source: {
              title: source.title, publisher: source.publisher, publicationDate: source.publicationDate,
              url: source.url, locator: population.locator, column: population.column,
              row: estimate.sourceRow || category.sourceRow
            }
          };
        })
      };
    })
  };
}

function ledger(data) {
  return projectDemographics(data).populations.flatMap(population => population.records.map(record => ({
    populationId: population.id, denominator: population.denominatorLabel,
    dimension: population.dimension, wave: data.wave, metric: data.metric,
    published: record.valueText, status: record.status, source: record.source,
    revision: data.sources.find(source => source.url === record.source.url).revision,
    sha256: data.sources.find(source => source.url === record.source.url).sha256,
    nonresponse: population.nonresponse, uncertainty: population.uncertainty
  })));
}

module.exports = {loadDemographics, validateDemographics, projectDemographics, ledger};
if (require.main === module) {
  const data = require('./data.cjs').loadData().demographics;
  console.log(JSON.stringify(process.argv.includes('--ledger') ? ledger(data) : {
    populations: data.populations.length, cells: ledger(data).length, review: data.review
  }, null, 2));
}
