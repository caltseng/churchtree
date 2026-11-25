'use strict';
const assert = require('node:assert/strict');
const proofs = require('./scripture-proofs.json');
const text = require('./content.json');
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
assert.equal(proofs.schemaVersion, 1);
assert.equal(proofs.chapters.length, text.chapters.length);
const sourceIDs = new Set();
const excludedIDs = new Set(proofs.source.excludedAmericanReferenceIds);
for (const [i, chapter] of proofs.chapters.entries()) {
  assert.equal(chapter.chapter, i + 1);
  assert.equal(chapter.sections.length, text.chapters[i].sections.length);
  for (const section of chapter.sections) {
    assert(section.groups.length, `Missing Scripture proofs in chapter ${i + 1}`);
    for (const group of section.groups) {
      assert(/^iv\.xvii\.ii-[\w.]+$/.test(group.sourceNote));
      assert(group.references.length);
      for (const ref of group.references) {
        assert(ref.reference && ref.sourceLabel && !sourceIDs.has(ref.sourceId));
        assert(!excludedIDs.has(ref.sourceId), 'American additions must not enter the historical proof list');
        sourceIDs.add(ref.sourceId);
      }
    }
  }
}
function render(chapter, section) {
  const groups = proofs.chapters[chapter - 1].sections[section - 1].groups;
  const count = groups.reduce((total, group) => total + group.references.length, 0);
  return `<details class="scripture-proofs" id="proofs-${chapter}-${section}"><summary>Scripture references <span>${count}</span></summary><div><ul>${groups.map(group => `<li>${group.references.map(ref => `<a href="${esc('https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref.reference) + '&version=ASV')}">${esc(ref.reference)}</a>`).join('; ')} <a class="proof-source" href="${esc(proofs.source.url)}#fna_${esc(group.sourceNote)}" aria-label="Source proof note ${esc(group.sourceNumber)} for section ${chapter}.${section}">Source note ${esc(group.sourceNumber)} ↗</a></li>`).join('')}</ul></div></details>`;
}
module.exports = { render, proofs };
