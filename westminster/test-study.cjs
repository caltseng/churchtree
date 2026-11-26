'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
module.exports=async function testStudy({browser,baseURL,root,repoRoot}) {
 const readerPath=fs.existsSync(path.join(root,'wcf/content.json'))?'wcf':'westminster';
 const readerURL=baseURL+'/'+readerPath+'/index.html';
 const text=JSON.parse(fs.readFileSync(path.join(root,readerPath,'content.json'),'utf8'));
 const notes=JSON.parse(fs.readFileSync(path.join(root,readerPath,'study-notes.json'),'utf8'));
 const expectedText=text.chapters.flatMap(c=>c.sections);
 for(const size of [{width:1440,height:1000},{width:390,height:844},{width:320,height:568}]) {
  const page=await browser.newPage({viewport:size});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(readerURL);
  assert.equal(await page.locator('.study').count(),notes.chapters.length);
  assert.equal(await page.locator('.study[open]').count(),0,'Study starts closed');
  assert.equal(await page.locator('.study-note').count(),notes.chapters.reduce((count,chapter)=>count+chapter.entries.length,0));
  assert.equal(await page.locator('.pca-comparison').count(),notes.chapters.length);
  if(size.width===390)assert.deepEqual(await page.locator('.passage > p').allTextContents(),expectedText,'Every historical passage is unchanged');
  const summary=page.locator('#study-1>summary');await summary.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#study-1').getAttribute('open'),'','Keyboard opens native disclosure');
  assert(await page.locator('#note-1-authority').isVisible());
  await page.screenshot({path:path.join(repoRoot,`.tmp/browser-check/westminster-study-${size.width}.png`)});
  await summary.focus();await page.keyboard.press('Space');assert.equal(await page.locator('#study-1').getAttribute('open'),null);
  for(const chapter of notes.chapters){
   if(size.width!==390&&![1,19,20,31].includes(chapter.chapter))continue;
   const id=chapter.entries[0].id;
   await page.goto(readerURL+`#${id}`);
   assert(await page.locator('#pca-'+chapter.chapter).isVisible(),'Direct PCA comparison link reveals its chapter');
   if(chapter.chapter===31){
    assert.equal(await page.locator('.pca-numbering tbody tr').count(),5);
    assert.match(await page.locator('.pca-numbering').innerText(),/Omitted/);
   }
   if([1,19,20,31].includes(chapter.chapter)){
    const variants=page.locator('#pca-'+chapter.chapter+'-variants');
    if(await variants.count())await variants.locator('summary').click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Expanded audit fits viewport');
    if(chapter.chapter===31)await page.screenshot({path:path.join(repoRoot,'.tmp/browser-check/westminster-pca-'+chapter.chapter+'-'+size.width+'.png')});
   }
   assert(await page.locator('#'+id).isVisible(),`Direct note in chapter ${chapter.chapter}`);
   assert.equal(await page.locator('article:visible').count(),1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Study fits ${size.width}, chapter ${chapter.chapter}`);
   const invalidLinks=await page.locator(`#study-${chapter.chapter} .note-citations a`).evaluateAll(links=>links.filter(a=>a.hash&&a.origin===location.origin&&!document.getElementById(a.hash.slice(1))).map(a=>a.href));
   assert.deepEqual(invalidLinks,[],'Local citations resolve');
  }
  if(size.width===390){
  await page.goto(readerURL+'#note-31-scottish-reception');await page.reload();
  assert(await page.locator('#note-31-scottish-reception').isVisible());
  const sourceReturn=page.locator('#study-31 .study-tools [data-study-return]');await sourceReturn.click();
  assert.equal(await page.locator('#study-31').getAttribute('open'),null,'Returning dismisses commentary');
  await page.waitForFunction(()=>document.getElementById('section-31-1')===document.activeElement);
  assert.equal(await page.locator('#section-31-1').evaluate(el=>el===document.activeElement),true);
  await page.goBack();assert(await page.locator('#note-31-scottish-reception').isVisible(),'Back restores a note deep link');
  await page.locator('#study-31 .study-tools a[href="#study-31"]').click();
  await page.waitForFunction(()=>document.querySelector('#study-31>summary')===document.activeElement);
  assert.equal(await page.locator('#study-31>summary').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('#study-31>summary').evaluate(el=>el.tabIndex),0,'Deep-linked summary remains in the Tab order');
  await page.locator('#study-31 a.study-disclaimer').click();
  await page.locator('#study-method[open]').waitFor({state:'visible'});
  assert(await page.locator('#study-method[open]').isVisible());
  assert.match(await page.locator('#study-method').innerText(),/No individual presbytery grants/);
  }
  await page.goto(readerURL+'#note-29-presence');
  await page.screenshot({path:path.join(repoRoot,`.tmp/browser-check/westminster-study-body-${size.width}.png`)});
  for(const theme of ['parchment','slate','ink']){
   await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(size.width===1440&&theme==='ink')await page.screenshot({path:path.join(repoRoot,`.tmp/browser-check/westminster-study-${theme}.png`)});
  }
  assert.deepEqual(errors,[]);await page.close();console.log(`Study notes ${size.width}x${size.height}: passed (${size.width===390?'all chapters and navigation':'expanded layout smokes'})`);
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();
 await page.goto(readerURL);assert.equal(await page.locator('article:visible').count(),text.chapters.length);
 await page.locator('#study-1>summary').click();assert(await page.locator('#note-1-authority').isVisible());
 await page.goto(readerURL+'#note-31-scottish-reception');
 // Native browsers reveal fragment targets in closed details. The summary remains an accessible fallback.
 if(!await page.locator('#note-31-scottish-reception').isVisible())await page.locator('#study-31>summary').click();
 assert(await page.locator('#note-31-scottish-reception').isVisible());
 await page.goto(readerURL+'#pca-31');
 if(!await page.locator('#pca-31').isVisible())await page.locator('#study-31>summary').click();
 assert(await page.locator('#pca-31').isVisible(),'No-JavaScript PCA audit access');
 assert.equal(await page.locator('.passage').count(),expectedText.length);
 assert.deepEqual(await page.locator('.passage > p').allTextContents(),expectedText);await context.close();
 console.log('No-JavaScript study and unchanged primary text: passed');
};
