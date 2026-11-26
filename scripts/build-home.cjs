const fs=require('fs'),path=require('path');
const countryOutline=require('./country-outlines.cjs');
const root=path.resolve(__dirname,'..');const config=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const {esc}=require('../html-escape.js');
const shell=require('./page-shell.cjs');
function page(template, {title, description, route = '', prefix = '../', skipLabel, footerContent, showBrand = false, brandHeading = false, skipTarget = 'explore'}) {
 const headerOptions={className:brandHeading?'explorer-header':'home-header',prefix,tagline:!brandHeading,brandHeading,skipTarget,skipLabel};
 return template.replace(/\{\{header\}\}\s*<!--HEADER-CONTENT-->([\s\S]*?)<!--HEADER-END-->/,(_,content)=>shell.header({...headerOptions,content}))
  .replace(/\{\{(head|header|footer)\}\}/g,(_,key)=>({
   head:()=>shell.head({title,description,canonical:`https://${config.domain}/${route}`,prefix}),
   header:()=>shell.header(headerOptions),
   footer:()=>shell.footer({className:'home-footer',content:footerContent,prefix,showBrand})
  }[key]()));
}
const history=`<svg viewBox="0 0 500 210" role="img" aria-label="Paths diverging and reconnecting in a history graph"><g fill="none" stroke-width="2.5"><path class="preview-path" d="M70 105H150C200 105 190 45 245 45H420M150 105H245C300 105 290 165 345 165H420"/><path class="preview-split" d="M245 45C300 45 290 105 345 105H420"/></g><g class="preview-node"><circle cx="70" cy="105" r="9"/><circle cx="245" cy="45" r="9"/><circle cx="245" cy="105" r="9"/><circle cx="345" cy="165" r="9"/><circle cx="420" cy="45" r="9"/><circle cx="420" cy="105" r="9"/><circle cx="420" cy="165" r="9"/></g><g class="preview-label"><text x="48" y="142">ROOTS</text><text x="205" y="198">BRANCHES</text><text x="378" y="198">CONNECTIONS</text></g></svg>`;
const reader=`<div class="book-preview" aria-hidden="true"><div class="book-margin">I</div><div class="book-page"><span>THE WESTMINSTER CONFESSION</span><h3>Of the Holy Scripture</h3><div class="reading-line long"></div><div class="reading-line"></div><div class="reading-line long"></div><div class="reading-line short"></div><div class="page-mark">CHAPTER I <span>01 / 33</span></div></div></div>`;
const affiliation=`<svg viewBox="0 0 500 210" aria-hidden="true"><g fill="none" transform="rotate(-90 150 95)"><circle cx="150" cy="95" r="55" stroke="var(--ct-accent)" stroke-width="34" stroke-dasharray="214 346"/><circle cx="150" cy="95" r="55" stroke="var(--ct-axis)" stroke-width="34" stroke-dasharray="0 218 100 346"/><circle cx="150" cy="95" r="55" stroke="var(--ct-accent)" stroke-opacity=".45" stroke-width="34" stroke-dasharray="0 322 22 346"/></g><path d="M215 95H285" stroke="var(--ct-axis)" stroke-width="2" stroke-dasharray="5 5"/><g fill="none" transform="rotate(-90 360 95)"><circle cx="360" cy="95" r="38" stroke="var(--ct-accent)" stroke-width="24" stroke-dasharray="155 239"/><circle cx="360" cy="95" r="38" stroke="var(--ct-axis)" stroke-width="24" stroke-dasharray="0 159 76 239"/></g><text x="85" y="185" class="preview-label">FAMILIES · DENOMINATIONS · TRADITIONS</text></svg>`;
const catechismPreview = title => reader.replace("THE WESTMINSTER CONFESSION", esc(title.toUpperCase())).replace("Of the Holy Scripture", "Questions and answers").replace("CHAPTER I <span>01 / 33</span>", "QUESTION &amp; ANSWER");
const countryHistory=`<svg viewBox="0 0 500 210" aria-hidden="true"><g class="preview-label"><text x="50" y="35">CHINA · SELECTED EPISODES</text><text x="50" y="190">635</text><text x="420" y="190">2024</text></g><g fill="none" stroke-width="2.5"><path class="preview-path" d="M50 160H450M70 75H155M220 105H295M335 75H420M355 130H440"/></g><g class="preview-node"><circle cx="70" cy="75" r="7"/><circle cx="155" cy="75" r="7"/><circle cx="220" cy="105" r="7"/><circle cx="295" cy="105" r="7"/><circle cx="335" cy="75" r="7"/><circle cx="420" cy="75" r="7"/><circle cx="355" cy="130" r="7"/><circle cx="440" cy="130" r="7"/></g></svg>`;
const collectionPreview=reader.replace('THE WESTMINSTER CONFESSION','WESTMINSTER STANDARDS').replace('Of the Holy Scripture','Confession &amp; catechisms').replace('CHAPTER I <span>01 / 33</span>','THREE READINGS');
const globalPreview=countryHistory.replace('CHINA · SELECTED EPISODES','COUNTRY HISTORIES · SELECTED EPISODES').replace('>635<','>DATES<').replace('>2024<','>SOURCES<');
const countryIds=new Set(config.countryHistories.map(page=>page.id));
function validatePages(pages){
const ids=new Set();for(const page of pages){if(ids.has(page.id))throw Error('Duplicate page ID '+page.id);ids.add(page.id);if(!/^[a-z0-9-]+\/$/.test(page.path))throw Error('Expected a relative page directory');}
}
function tilesFor(pages,prefix=''){
validatePages(pages);return pages.map(page=>`<a class="tool-card" data-id="${esc(page.id)}" href="${prefix}${esc(page.path)}"><div class="card-preview ${esc(page.id)}">${page.id==='church-history'?history:page.id==='global-church'||countryIds.has(page.id)?globalPreview:page.id==='us-denominations'?affiliation:page.id==='westminster'?collectionPreview:page.id==='wcf'?reader:catechismPreview(page.title)}</div><div class="card-copy"><p class="eyebrow">${esc(page.kind)}</p><h3>${esc(page.title)}</h3><p>${esc(page.description)}</p><ul class="tags">${page.tags.map(tag=>`<li>${esc(tag)}</li>`).join('')}</ul><span class="card-action">${esc(page.action)} <span aria-hidden="true">→</span></span></div></a>`).join('\n');
}
const tiles=tilesFor(config.pages);
let html=page(fs.readFileSync(path.join(root,'templates/home.html'),'utf8'),{
 title:'Main Branch · Explore history. Read the sources.',description:'Main Branch is a growing collection of maps, timelines and readers for exploring Christian history and its sources.',
 prefix:'./',skipLabel:'Skip to explorations',showBrand:true,footerContent:'<p>A work in progress, built for clear explanations and traceable sources.</p>'
}).replace('{{tiles}}',tiles);fs.writeFileSync(path.join(root,'index.html'),html);console.log('Built landing: '+config.pages.length+' exploration tiles.');
const collection=page(fs.readFileSync(path.join(root,'templates/westminster-standards.html'),'utf8'),{
 title:'Westminster Standards · Main Branch',description:'Read the Westminster Confession of Faith, Shorter Catechism and Larger Catechism, with complete texts, document navigation and edition sources.',
 route:'westminster-standards/',skipLabel:'Skip to readings',footerContent:'<a href="../#explore">All explorations</a><p>Source and edition information accompanies each document.</p>'
}).replace('{{tiles}}',tilesFor(config.westminsterDocuments,'../'));
fs.mkdirSync(path.join(root,'westminster-standards'),{recursive:true});
fs.writeFileSync(path.join(root,'westminster-standards/index.html'),collection);
console.log('Built Westminster collection: '+config.westminsterDocuments.length+' readers.');
validatePages(config.countryHistories);
for(const country of config.countryHistories){
if(!fs.existsSync(path.join(root,country.path,'data.cjs')))throw Error('Missing country input: '+country.path+'data.cjs');
}
const countryTiles=config.countryHistories.map(country=>`<a class="tool-card country-card" data-id="${esc(country.id)}" href="../${esc(country.path)}" aria-labelledby="${esc(country.id)}-name" aria-describedby="${esc(country.id)}-description"><div class="country-map" aria-hidden="true"><span class="country-north">N</span>${countryOutline(country.outline)}<span class="country-map-label">COUNTRY HISTORY</span></div><div class="card-copy"><h3 id="${esc(country.id)}-name">${esc(country.title)}</h3><p id="${esc(country.id)}-description">${esc(country.description)}</p><span class="card-action">${esc(country.action)} <span aria-hidden="true">→</span></span></div></a>`).join('\n');
const countries=page(fs.readFileSync(path.join(root,'templates/global-church.html'),'utf8'),{
 title:'The global church · Main Branch',description:'Choose a sourced country history, with selected episodes, source credit and explicit coverage gaps.',
 route:'global-church/',skipLabel:'Skip to countries',footerContent:'<a href="../#explore">All explorations</a><p>Source credit and coverage limits accompany each history.</p>'
}).replace('{{tiles}}',countryTiles);
fs.mkdirSync(path.join(root,'global-church'),{recursive:true});
fs.writeFileSync(path.join(root,'global-church/index.html'),countries);
console.log('Built global church: '+config.countryHistories.length+' country histories.');
fs.writeFileSync(path.join(root,'church-history/index.html'),page(fs.readFileSync(path.join(root,'templates/church-history.html'),'utf8'),{
 title:'Church History · Main Branch',description:'Explore church history with Main Branch: interactive maps and timelines of Christian traditions, with sourced histories.',
 route:'church-history/',brandHeading:true,skipTarget:'graph',skipLabel:'Skip to church history graph'
}));
