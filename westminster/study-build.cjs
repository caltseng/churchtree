'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const load=name=>JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8'));
const notes=load('study-notes.json'),registry=load('study-sources.json'),text=load('content.json'),sources=registry.sources;
const pca=require('./pca-audit-build.cjs');
const labels={'reading-guide':'Reading the text','historical-context':'Historical context','doctrinal-comparison':'Doctrinal comparison','textual-revision':'Textual revision','subscription-procedure':'Subscription procedure'};
const {escReader:esc}=require('../html-escape.js');
const safeURL=url=>/^https:\/\/|^#(?:section|chapter|study|note)-[\w-]+$/.test(url);
const allIDs=new Set();
assert.equal(notes.schemaVersion,1);assert.equal(registry.schemaVersion,1);assert.equal(notes.chapters.length,33);
for(const [i,c] of notes.chapters.entries()){
 assert.equal(c.chapter,i+1);assert(c.orientation&&c.entries.length>=2,`Missing substantive chapter ${i+1}`);
 for(const e of c.entries){
  assert(!allIDs.has(e.id)&&e.id.startsWith(`note-${c.chapter}-`),'Duplicate/invalid note ID');allIDs.add(e.id);
  assert(labels[e.kind],`Unknown note kind: ${e.kind}`);assert(e.body.split(/\s+/).length>=35,`Thin note ${e.id}`);
  assert(e.sections.length&&e.sections.every(n=>Number.isInteger(n)&&n>=1&&n<=text.chapters[i].sections.length),`Invalid section in ${e.id}`);
  assert.equal(e.reviewStatus,'source-checked-editorial');assert(/^\d{4}-\d{2}-\d{2}$/.test(e.reviewedOn));
  assert(e.citations.length,`Uncited note ${e.id}`);
  for(const r of e.citations){assert(sources[r.sourceId],`Unknown source ${r.sourceId}`);assert(r.locator&&r.supports);assert(safeURL(r.url||sources[r.sourceId].url),`Unsafe URL in ${e.id}`);}
 }
 for(const id of c.furtherReading)assert(sources[id],`Unknown further reading ${id}`);
}
for(const c of pca.audit.chapters)for(const r of c.citations)assert(sources[r.sourceId],`Unknown PCA source ${r.sourceId}`);
for(const [id,s] of Object.entries(sources)){assert.equal(s.id,id);for(const field of ['title','institution','date','type','scope','accessedOn','reuse'])assert(s[field],`Missing ${field} on ${id}`);assert(/^https:\/\//.test(s.url));}
const citations=refs=>`<ul class="note-citations">${refs.map(r=>`<li><a href="${esc(r.url||sources[r.sourceId].url)}">${esc(sources[r.sourceId].title)} · ${esc(r.locator)}${r.url?.startsWith('#')?'':' ↗'}</a><span>${esc(r.supports)}</span></li>`).join('')}</ul>`;
function renderChapter(number) {
 const c=notes.chapters[number-1];
 const entries=c.entries.map(e=>`<section class="study-note" id="${esc(e.id)}" aria-labelledby="${esc(e.id)}-title" tabindex="-1"><div class="note-label">${esc(labels[e.kind])}<a href="#${esc(e.id)}" aria-label="Permanent link: ${esc(e.title)}">#</a></div><h4 id="${esc(e.id)}-title">${esc(e.title)}</h4><p class="note-sections">On ${e.sections.map(s=>`<a href="#section-${number}-${s}" data-study-return>${number}.${s}</a>`).join(', ')}</p><p class="note-body">${esc(e.body)}</p>${citations(e.citations)}</section>`).join('');
 const reading=c.furtherReading.map(id=>{const s=sources[id];return `<li><a href="${esc(s.url)}">${esc(s.title)} ↗</a><p>${esc(s.institution)} · ${esc(s.date)}</p><p>${esc(s.scope)}</p></li>`;}).join('');
 return `<details class="study" id="study-${number}"><summary><span class="study-summary-title">Go deeper <span aria-hidden="true">↗</span></span><span class="study-summary-meta">Context, differences &amp; editions · ${c.entries.length} notes</span></summary><div class="study-body"><header class="study-heading"><p class="eyebrow">EDITORIAL STUDY NOTES · CHAPTER ${number}</p><h3>A closer reading</h3><p>${esc(c.orientation)}</p><div class="study-tools"><a href="#section-${number}-1" data-study-return>Return to the confession ↓</a><a href="#study-${number}" aria-label="Permanent link to chapter ${number} study notes">Link to these notes</a><a class="study-disclaimer" href="#study-method">About all study notes</a></div></header>${entries}${pca.render(number,citations)}<details class="study-reading"><summary>Sources &amp; further reading <span>${c.furtherReading.length}</span></summary><ul>${reading}</ul></details><div class="study-bottom"><a href="#section-${number}-1" data-study-return>Return to the confession ↓</a></div></div></details>`;
}
function renderPolicy(){return `<details class="study-method" id="study-method"><summary>About the study notes &amp; research limits</summary><div><p>${esc(notes.editorialPolicy)}</p><h3>${esc(notes.subscriptionScope.title)}</h3><p>${esc(notes.subscriptionScope.body)}</p>${citations(notes.subscriptionScope.citations)}${pca.renderMethod(citations)}<h3>Research limits</h3><ul>${notes.researchLimits.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p>Each note links the historical passage and its supporting documents. “Reading the text” is an editorial explanation of the confession; other labels distinguish historical context, comparison, revision and subscription procedure. Review status records source checking, not independent expert approval.</p><p><a href="study-notes.json">Study data (JSON) ↓</a> · <a href="study-sources.json">Source registry (JSON) ↓</a></p><p>Last reviewed ${esc(notes.lastReviewed)}. All modern commentary is paraphrased; no publisher’s study guide is reproduced.</p></div></details>`;}
module.exports={renderChapter,renderPolicy,notes,sources};
if(require.main===module)console.log(`Study data verified: ${notes.chapters.length} chapters, ${allIDs.size} notes, ${Object.keys(sources).length} sources.`);
