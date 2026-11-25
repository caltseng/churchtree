const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'..'),root=process.env.CHURCHTREE_TEST_ROOT?path.resolve(repo,process.env.CHURCHTREE_TEST_ROOT):path.join(repo,'dist'),server=require('./test-server.cjs')(root),output=path.join(repo,'.tmp/browser-check');fs.mkdirSync(output,{recursive:true});
const {pages,countryHistories}=JSON.parse(fs.readFileSync(path.join(repo,'site.config.json'),'utf8')),pageCount=pages.length;
async function openAppearance(page) {
 const trigger = page.getByRole('button', {name:'Site menu', exact:true});
 assert.equal(await trigger.count(), 1);
 assert.equal(await page.getByRole('button', {name:'Appearance', exact:true}).count(), 0);
 await trigger.click();
 const dialog = page.getByRole('dialog', {name:'Site menu', exact:true});
 await dialog.getByRole('button', {name:'Settings', exact:true}).click();
 assert(await page.getByRole('dialog', {name:'Settings', exact:true}).getByRole('heading', {name:'Appearance'}).isVisible());
 return trigger;
}
function luminance(rgb){return rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL==='chromium'?{}:{channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'}),headless:true});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const size of [{width:1440,height:1000},{width:390,height:844},{width:320,height:568},{width:768,height:1024},{width:844,height:390},{width:568,height:320}]){
  const page=await browser.newPage({viewport:size}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(base+'/')).status(),200);assert.equal(await page.locator('.tool-card').count(),pageCount);
  const globalChurch=page.locator('.tool-card[data-id="global-church"]');
  assert.equal(await globalChurch.getAttribute('href'),'global-church/');
  assert.equal(await globalChurch.getByRole('heading').innerText(),'The global church');
  const countryCopy=await globalChurch.innerText();
  for(const country of countryHistories) assert(countryCopy.includes(country.title),country.title+' appears in the available-country copy');
  assert.match(await globalChurch.locator('.card-action').innerText(),/Choose a country/);
  assert.equal(await globalChurch.locator('.card-preview svg').count(),1);
  assert.match(await globalChurch.locator('.card-preview').textContent(),/COUNTRY HISTORIES.*SELECTED EPISODES/);
  assert.doesNotMatch(await globalChurch.innerText(),/Questions and answers|QUESTION & ANSWER/);
  assert.match(await page.locator('.card-preview.westminster').innerText(),/Confession & catechisms/);
  await globalChurch.screenshot({path:path.join(output,`global-church-${size.width}.png`)});
  await globalChurch.focus();await page.keyboard.press('Enter');
  await page.waitForURL('**/global-church/');
  const countryCards=page.locator('.country-card');
  assert.deepEqual(await countryCards.evaluateAll(cards=>cards.map(card=>card.dataset.id)),countryHistories.map(country=>country.id));
  assert.deepEqual(await countryCards.evaluateAll(cards=>cards.map(card=>card.getAttribute('href'))),countryHistories.map(country=>'../'+country.path));
  assert.equal(await countryCards.count(),countryHistories.length);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Country picker fits the viewport');
  const paths=await countryCards.locator('.country-outline path').evaluateAll(elements=>elements.map(element=>element.getAttribute('d')));
  assert.equal(new Set(paths).size,countryHistories.length,'Countries have distinct source outlines');
  assert(paths.every(d=>d.length>500&&!/NaN|Infinity/.test(d)),'Outlines contain detailed, finite geometry');
  for(const [index,country] of countryHistories.entries()){
   const card=countryCards.nth(index);
   assert.equal(await card.getAttribute('aria-labelledby'),country.id+'-name');
   assert.equal(await card.getByRole('heading').innerText(),country.title);
   assert.equal(await card.locator('.country-outline').getAttribute('aria-hidden'),'true');
   const shape=await card.locator('.country-outline path').evaluate(element=>{const b=element.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};});
   assert(shape.width>50&&shape.height>100&&shape.x>=15&&shape.y>=15&&shape.x+shape.width<=305&&shape.y+shape.height<=225,'Entire country is legible inside its map');
  }
  for(const theme of ['parchment','slate','ink']){
   await page.locator('html').evaluate((element,value)=>element.dataset.theme=value,theme);
   for(const selector of ['.country-card h3','.country-card .card-copy>p','.country-card .card-action','.country-section-heading>p','.country-map-notes>p']){
    const colors=await page.locator(selector).first().evaluate(element=>{
     let ancestor=element,background;
     do{background=getComputedStyle(ancestor).backgroundColor;ancestor=ancestor.parentElement;}while(ancestor&&background==='rgba(0, 0, 0, 0)');
     return {text:getComputedStyle(element).color,background};
    });
    const a=luminance(colors.text),b=luminance(colors.background);
    assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,theme+' country picker contrast: '+selector);
   }
   await page.screenshot({path:path.join(output,`country-picker-${theme}-${size.width}.png`),fullPage:true});
  }
  await page.locator('html').evaluate(element=>element.dataset.theme='parchment');
  await page.locator('.skip-link').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
  for(const country of countryHistories){
   const card=page.getByRole('link',{name:country.title,exact:true});
   assert(await card.evaluate(element=>element===document.activeElement),'Sequential keyboard navigation: '+country.title);
   assert(await card.evaluate(element=>getComputedStyle(element).outlineStyle!=='none'&&parseFloat(getComputedStyle(element).outlineWidth)>=3),'Visible focus: '+country.title);
   await page.keyboard.press('Tab');
  }
  const disclosure=page.getByText('About these maps',{exact:true});
  await disclosure.focus();await page.keyboard.press('Enter');
  assert(await page.getByText(/Shapes are individually fitted/).isVisible());
  assert(await page.getByRole('link',{name:'Reuse terms',exact:true}).isVisible());
  await page.keyboard.press('Enter');
  await page.emulateMedia({reducedMotion:'reduce'});
  await countryCards.first().hover();
  assert.equal(await countryCards.first().evaluate(element=>getComputedStyle(element).transform),'none');
  assert.equal(await countryCards.first().locator('.country-outline').evaluate(element=>getComputedStyle(element).transitionDuration),'0s');
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const country of countryHistories){
   await page.getByRole('link',{name:country.title,exact:true}).focus();await page.keyboard.press('Enter');
   await page.waitForURL('**/'+country.path);
   assert.equal(await page.title(),`Church in ${country.title} history · Main Branch`);
   await page.goBack();await page.waitForURL('**/global-church/**');
  }
  await page.locator('.tool-card[data-id="china-history"]').click();
  await page.waitForURL('**/china-history/');
  assert.equal(await page.title(),'Church in China history · Main Branch');
  await page.goto(base+'/');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const theme of ['parchment','slate','ink']){
   await openAppearance(page);await page.locator(`input[name="theme"][value="${theme}"]`).check();
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
   assert(await page.locator('#site-menu').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await page.getByRole('button',{name:'Close',exact:true}).click();
   const colors=await page.evaluate(()=>({text:getComputedStyle(document.body).color,background:getComputedStyle(document.documentElement).backgroundColor}));const a=luminance(colors.text),b=luminance(colors.background);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'Main reading colors must have sufficient contrast');
  }
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
  await page.screenshot({path:path.join(output,`home-ink-${size.width}.png`),fullPage:true});
  await page.locator('.tool-card[data-id="church-history"]').click();await page.locator('#graph svg[aria-label^="Proportional timeline"]').waitFor();assert.match(page.url(),/\/church-history\/$/);assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
  await page.getByRole('link',{name:'Main Branch home',exact:true}).click();assert.equal(await page.locator('.tool-card').count(),pageCount);
  assert.equal(await page.locator('.tool-card[href="wcf/"], .tool-card[href="wsc/"], .tool-card[href="wlc/"]').count(),0);
  await page.locator('.tool-card[data-id="westminster"]').click();await page.waitForURL(/\/westminster-standards\/$/);
  assert.equal(await page.getByRole('heading',{name:'Westminster Standards',exact:true}).count(),1);
  assert.deepEqual(await page.locator('.tool-card').evaluateAll(cards=>cards.map(card=>card.getAttribute('href'))),['../wcf/','../wsc/','../wlc/']);
  assert.match(await page.locator('.card-preview.wcf').innerText(),/Of the Holy Scripture/);
  for(const id of ['wsc','wlc']) assert.match(await page.locator('.card-preview.'+id).innerText(),/Questions and answers/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.keyboard.press('Tab');assert(await page.locator('.skip-link').evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#explore');
  for (const [id,count,selector] of [['wcf',172,'.passage'],['wsc',107,'#reading article'],['wlc',196,'#reading article']]) {
   await page.locator(`.tool-card[data-id="${id}"]`).focus();await page.keyboard.press('Enter');await page.waitForURL(new RegExp('/'+id+'/$'));
   assert.equal(await page.locator(selector).count(),count);
   assert(await page.locator('#sources').count());
   assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
   await page.getByRole('link',{name:/Westminster Standards/}).click();await page.waitForURL(/\/westminster-standards\/$/);
  }
  await page.screenshot({path:path.join(output,`westminster-${size.width}.png`),fullPage:true});
  for (const route of ['/church-history/', ...countryHistories.map(country=>'/'+country.path), '/global-church/', '/westminster-standards/', '/wcf/', '/wsc/', '/wlc/', '/us-denominations/']) {
   assert.equal((await page.goto(base+route)).status(),200);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' fits the viewport');
   const trigger = await openAppearance(page);
   assert(await page.locator('input[name="theme"][value="ink"]').isChecked());
   await page.getByRole('button',{name:'Back to menu'}).click();
   const settings = page.getByRole('button',{name:'Settings',exact:true});
   assert(await settings.evaluate(el=>el===document.activeElement));
   await page.keyboard.press('Enter');
   if(size.width===320 || size.width===1440) await page.screenshot({path:path.join(output,'settings-'+route.split('/')[1]+'-'+size.width+'.png')});
   await page.keyboard.press('Escape');
   assert(!await page.locator('#site-menu').isVisible());
   await page.waitForFunction(()=>document.activeElement.classList.contains('site-menu-trigger'));
   await trigger.press('Enter');
   await page.locator('#site-menu').getByRole('link',{name:'All explorations',exact:true}).click();
   await page.waitForURL('**/#explore');
   assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
  }
  await openAppearance(page);
  await page.locator('#theme-reset').click();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'parchment');
  await page.screenshot({path:path.join(output,`home-${size.width}.png`),fullPage:true});
  assert(await page.locator('.main-branch-symbol').evaluateAll(images=>images.length>0&&images.every(img=>img.complete&&img.naturalWidth>0)));assert.match(await page.locator('link[rel=icon]').getAttribute('href'),/main-branch\.svg$/);await page.locator('.tool-card[data-id="church-history"]').click();await page.locator('#graph svg[aria-label^="Proportional timeline"]').waitFor();assert.match(page.url(),/\/church-history\/$/);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);await page.close();console.log(`Landing, themes, links and logos ${size.width}px: passed`);
 }
 const redirectPage=await browser.newPage();await redirectPage.goto(base+'/westminster/#section-23-3');await redirectPage.waitForURL('**/wcf/#section-23-3');assert(await redirectPage.locator('#section-23-3').isVisible());await redirectPage.close();
 for(const file of fs.readdirSync(path.join(root,'assets/brand/logos')).filter(file=>file.endsWith('.svg'))){const svg=fs.readFileSync(path.join(root,'assets/brand/logos',file),'utf8');const colors=new Set((svg.match(/#[\da-f]{6}\b/gi)||[]).map(c=>c.toLowerCase()));assert(colors.size>0&&colors.size<=3,file+' must use at most three colors');}
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
