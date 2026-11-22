const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repoRoot=path.resolve(__dirname,'..'),root=process.env.CHURCHTREE_TEST_ROOT?path.resolve(repoRoot,process.env.CHURCHTREE_TEST_ROOT):repoRoot,output=path.join(repoRoot,'.tmp/browser-check');fs.mkdirSync(output,{recursive:true});
const server=require('./test-server.cjs')(root);
(async()=>{let browser;try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL==='chromium'?{}:{channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'}),headless:true});
 for(const size of [{width:390,height:844},{width:320,height:568},{width:768,height:1024},{width:1024,height:768},{width:844,height:390}]){
  const context=await browser.newContext({viewport:size,isMobile:true,hasTouch:true,deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/church-history/`);await page.locator('#graph svg[aria-label^="Proportional timeline"]').waitFor();
  assert.equal(await page.locator('#layout').inputValue(),'timeline');
  assert.equal(await page.locator('#branch').inputValue(),'');
  assert.equal(await page.locator('#orientation-vertical').getAttribute('aria-pressed'),'true');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page must fit the mobile width');
  assert.equal(await page.locator('#splitter').isVisible(),false);
  const searchToggle=page.getByRole('button',{name:'Search church history',exact:true});
  assert(!await page.locator('#search-form').isVisible(),'Search starts collapsed');
  const headerBefore=await page.locator('header').evaluate(el=>el.clientHeight);
  await page.screenshot({path:path.join(output,`mobile-search-collapsed-${size.width}.png`)});
  if(size.width===390){
   await page.getByRole('button',{name:'Zoom in',exact:true}).tap();
   await page.waitForFunction(()=>CHURCHTREE_TIMELINE.snapshot().scale>=1.7);
   const node=page.locator('#graph .node[data-id="episcopal-church"]');
   await node.scrollIntoViewIfNeeded();
   const snapshot=()=>page.evaluate(()=>{
    const {domain,scale}=CHURCHTREE_TIMELINE.snapshot();
    return {domain,scale};
   });
   const before=await snapshot();
   await node.tap();
   await page.getByRole('dialog',{name:'Historical details'}).waitFor();
   assert.match(await page.locator('#details h2').innerText(),/Episcopal Church/);
   assert.equal(await page.locator('#branch').inputValue(),'');
   assert.deepEqual(await snapshot(),before);
   await page.getByRole('button',{name:'Back to graph'}).tap();
  }
  await searchToggle.tap();
  assert.equal(await searchToggle.getAttribute('aria-expanded'),'true');
  assert(await page.locator('#search').evaluate(el=>el===document.activeElement),'Opening search focuses input');
  assert(await page.locator('#search').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16),'Input avoids iOS focus zoom');
  assert.equal(await page.locator('#search-form').getByRole('button',{name:'Find',exact:true}).evaluate(el=>getComputedStyle(el).fontSize),await page.locator('#mobile-settings-toggle').evaluate(el=>getComputedStyle(el).fontSize));
  assert(await page.locator('header').evaluate(el=>el.clientHeight)>=headerBefore+44,'Collapsed search saves at least one touch-target row');
  await page.locator('#search').fill('OPC');
  await page.screenshot({path:path.join(output,`mobile-search-expanded-${size.width}.png`)});
  await page.keyboard.press('Escape');
  assert(!await page.locator('#search-form').isVisible());
  assert(await searchToggle.evaluate(el=>el===document.activeElement),'Escape returns toggle focus');
  await searchToggle.tap();assert.equal(await page.locator('#search').inputValue(),'OPC','Closing preserves query');
  assert(await page.getByRole('button',{name:/^OPC ·/}).isVisible(),'Reopening restores suggestions');
  await searchToggle.tap();assert(!await page.locator('#search-form').isVisible());
  if(size.width===390){
   await searchToggle.tap();
   await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(200);
   assert(await page.locator('#search').isVisible());assert(!await searchToggle.isVisible());
   await page.locator('#search').focus();
   await page.setViewportSize(size);await page.waitForTimeout(200);
   assert(!await page.locator('#search-form').isVisible());
   assert(await searchToggle.evaluate(el=>el===document.activeElement),'Resizing must not strand focus inside hidden search');
   assert.equal(await page.locator('#search').inputValue(),'OPC');
  }
  assert.equal(await page.locator('#branch').isVisible(),false,'Filters start collapsed');
  const compactHeight=await page.locator('nav').evaluate(el=>el.clientHeight);
  await page.getByRole('button',{name:'Filters / View',exact:true}).tap();
  assert(await page.locator('#branch').isVisible());
  await page.locator('#branch').focus();await page.keyboard.press('Escape');
  assert.equal(await page.locator('#branch').isVisible(),false);
  assert.equal(await page.locator('#mobile-settings-toggle').evaluate(el=>el===document.activeElement),true);
  await page.getByRole('button',{name:'Filters / View',exact:true}).tap();
  assert(compactHeight<await page.locator('nav').evaluate(el=>el.clientHeight),'Collapsed filters occupy less vertical space');
  await page.screenshot({path:path.join(output,`mobile-settings-${size.width}x${size.height}.png`)});
  await page.locator('#branch').selectOption('Presbyterian');
  assert.equal(await page.getByRole('button',{name:'Vertical',exact:true}).getAttribute('aria-pressed'),'true');
  await page.waitForTimeout(250);
  if(size.width===390){
   const client=await context.newCDPSession(page);
   async function gesture(points,endPoints){
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
    for(let i=1;i<=12;i++){
     await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points.map((p,j)=>({id:j,x:p.x+(endPoints[j].x-p.x)*i/12,y:p.y+(endPoints[j].y-p.y)*i/12}))});
     await page.waitForTimeout(16);
    }
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(80);
   }
   for(const orientation of ['Vertical','Horizontal'])for(const branch of ['Presbyterian','']){
    await page.locator('#branch').selectOption(branch);
    await page.getByRole('button',{name:orientation,exact:true}).tap();
    await page.locator('#graph').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
    const box=await page.locator('#graph').boundingBox(),x=box.x+box.width*.58,y=box.y+Math.min(box.height*.6,180);
    const a=[{id:0,x:x-25,y:y-25},{id:1,x:x+25,y:y+25}],b=[{id:0,x:x-55,y:y-55},{id:1,x:x+55,y:y+55}];
    const initial=await page.evaluate(()=>({s:CHURCHTREE_TIMELINE.snapshot(),v:visualViewport.scale}));
    await gesture(a,b);
    const zoomed=await page.evaluate(()=>({s:CHURCHTREE_TIMELINE.snapshot(),v:visualViewport.scale}));
    assert(zoomed.s.scale>initial.s.scale*1.6,orientation+' real pinch must zoom timeline');
    assert.equal(zoomed.v,initial.v,'Pinch inside timeline must not zoom webpage');
    assert(zoomed.s.domain[1]-zoomed.s.domain[0]<initial.s.domain[1]-initial.s.domain[0]);
    // Removing one finger rebases at the remaining contact; cancellation clears it.
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:b});
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b[0]]});
    const transition=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot());
    assert(Math.abs(transition.scale-zoomed.s.scale)<.001,'Finger transition must not jump scale');
    await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    await gesture(b,a);
    const reversed=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot());assert(reversed.scale<zoomed.s.scale*.7,'Reverse pinch must zoom out');
    assert(!await page.getByRole('dialog',{name:'Historical details'}).isVisible(),'Pinch must not activate a node');
    const domain=reversed.domain;
    await gesture([{id:0,x,y}],[{id:0,x:x-65,y:y-65}]);
    const panned=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot().domain);assert(Math.max(...panned.map((v,i)=>Math.abs(v-domain[i])))>.1,orientation+' '+branch+' One-finger drag must pan time '+JSON.stringify({domain,panned}));
   }
   await page.locator('#branch').selectOption('Presbyterian');await page.getByRole('button',{name:'Vertical',exact:true}).tap();
  }
  const start=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot());
  await page.getByRole('button',{name:'Zoom in',exact:true}).tap();await page.waitForTimeout(350);
  const afterZoom=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot());assert(afterZoom.domain[1]-afterZoom.domain[0]<start.domain[1]-start.domain[0],'Touch zoom must narrow the visible date range');
  const beforePan=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot().domain[0]);
  await page.getByRole('button',{name:'Later →',exact:true}).tap();await page.waitForTimeout(350);
  assert((await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot().domain[0]))>beforePan);
  await page.getByRole('button',{name:'Horizontal',exact:true}).tap();
  await page.getByRole('button',{name:'Date range',exact:true}).tap();assert(await page.locator('#year-from').isVisible());
  await page.getByRole('button',{name:'Date range',exact:true}).tap();assert(!await page.locator('#year-from').isVisible());
  if(size.width===390){
   await page.locator('#graph').scrollIntoViewIfNeeded();const box=await page.locator('#graph').boundingBox();const client=await context.newCDPSession(page);const x=box.x+box.width*.86,y=box.y+box.height*.55;
   const before=await page.locator('#graph').evaluate(el=>el.scrollLeft);
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let i=1;i<=8;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*20,y}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   // Let the real-touch click suppression and resize settle before a toolbar tap.
   await page.waitForTimeout(650);
   assert(await page.locator('#graph').evaluate(el=>el.scrollLeft)>before,'A real touch swipe must scroll time horizontally');
  }
  assert.equal(await searchToggle.getAttribute('aria-expanded'),'false','Search remains collapsed while exploring timeline');
  await searchToggle.tap();
  assert.equal(await searchToggle.getAttribute('aria-expanded'),'true','Search toolbar tap opens after a swipe');
  await page.locator('#search').fill('PCA');
  if(size.width===390)await page.keyboard.press('Enter');else if(size.width===320)await page.locator('#search-form').getByRole('button',{name:'Find',exact:true}).tap();else await page.getByRole('button',{name:/^PCA ·/}).tap();
  assert(!await page.locator('#search-form').isVisible(),'Choosing a result collapses mobile search');
  assert.equal(await page.locator('#search').inputValue(),'PCA','Result selection preserves query');
  const dialog=page.getByRole('dialog',{name:'Historical details'});await dialog.waitFor();
  assert.match(await page.locator('#details h2').innerText(),/Presbyterian Church in America/);
  assert.match(await page.locator('#details').innerText(),/Why it formed/);
  assert(await page.locator('#details').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Profile text must fit its sheet');
  await page.screenshot({path:path.join(output,`mobile-profile-${size.width}x${size.height}.png`)});
  await page.getByRole('button',{name:'Back to graph',exact:true}).tap();assert(!await dialog.isVisible());
  const selectedRange=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot().domain);assert(selectedRange[0]<=1973&&selectedRange[1]>=1973,'Search must reveal the selected date on mobile');
  await page.getByRole('button',{name:'Details',exact:true}).tap();assert(await dialog.isVisible());
  if(size.width===390){
   await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(200);
   assert(!await dialog.isVisible());assert(await page.locator('#search').isVisible(),'Desktop search remains visible');assert(!await searchToggle.isVisible());assert(await page.locator('#branch').isVisible(),'Desktop exposes settings');assert(await page.locator('#splitter').isVisible());assert.equal(await page.locator('#details').evaluate(el=>el.parentElement.tagName),'MAIN');
   await page.setViewportSize(size);await page.waitForTimeout(200);assert(!await page.locator('#search-form').isVisible(),'Returning to mobile collapses search');assert(!await page.locator('#branch').isVisible(),'Returning to mobile collapses settings');assert(!await dialog.isVisible());
   await page.getByRole('button',{name:'Details',exact:true}).tap();assert(await dialog.isVisible());
  }
  await page.getByRole('button',{name:'Back to graph',exact:true}).tap();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(await page.locator('#branch').isVisible())await page.getByRole('button',{name:'Filters / View',exact:true}).tap();
  await page.waitForTimeout(250);
  await page.screenshot({path:path.join(output,`mobile-graph-${size.width}x${size.height}.png`)});
  assert.deepEqual(errors,[]);await context.close();console.log(`Mobile ${size.width}×${size.height}: passed`);
 }
}finally{await browser?.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
