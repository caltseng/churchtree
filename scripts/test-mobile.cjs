const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repoRoot=path.resolve(__dirname,'..'),root=process.env.CHURCHTREE_TEST_ROOT?path.resolve(repoRoot,process.env.CHURCHTREE_TEST_ROOT):repoRoot,output=path.join(repoRoot,'.tmp/browser-check');fs.mkdirSync(output,{recursive:true});
const server=require('./test-server.cjs')(root);
(async()=>{let browser;try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL==='chromium'?{}:{channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'}),headless:true});
 for(const size of [{width:390,height:844},{width:320,height:568},{width:768,height:1024},{width:1024,height:768},{width:844,height:390}]){
  const context=await browser.newContext({viewport:size,isMobile:true,hasTouch:true,deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/church-history/`);await page.locator('[data-id="family:Presbyterian"]').waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page must fit the mobile width');
  assert.equal(await page.locator('#splitter').isVisible(),false);
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
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);
   assert(await page.locator('#graph').evaluate(el=>el.scrollLeft)>before,'A real touch swipe must scroll time horizontally');
  }
  await page.locator('#search').fill('PCA');await page.getByRole('button',{name:/^PCA ·/}).tap();
  const dialog=page.getByRole('dialog',{name:'Historical details'});await dialog.waitFor();
  assert.match(await page.locator('#details h2').innerText(),/Presbyterian Church in America/);
  assert.match(await page.locator('#details').innerText(),/Why it formed/);
  assert(await page.locator('#details').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Profile text must fit its sheet');
  await page.screenshot({path:path.join(output,`mobile-profile-${size.width}x${size.height}.png`)});
  await page.getByRole('button',{name:'Back to graph',exact:true}).tap();assert(!await dialog.isVisible());
  const selectedRange=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot().domain);assert(selectedRange[0]<=1973&&selectedRange[1]>=1973,'Search must reveal the selected date on mobile');
  await page.getByRole('button',{name:'Read details',exact:true}).tap();assert(await dialog.isVisible());
  if(size.width===390){
   await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(200);
   assert(!await dialog.isVisible());assert(await page.locator('#splitter').isVisible());assert.equal(await page.locator('#details').evaluate(el=>el.parentElement.tagName),'MAIN');
   await page.setViewportSize(size);await page.waitForTimeout(200);assert(!await dialog.isVisible());
   await page.getByRole('button',{name:'Read details',exact:true}).tap();assert(await dialog.isVisible());
  }
  await page.getByRole('button',{name:'Back to graph',exact:true}).tap();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(output,`mobile-graph-${size.width}x${size.height}.png`)});
  assert.deepEqual(errors,[]);await context.close();console.log(`Mobile ${size.width}×${size.height}: passed`);
 }
}finally{await browser?.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
