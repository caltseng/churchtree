const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'..'),root=path.resolve(repo,process.env.CHURCHTREE_TEST_ROOT||'.'),server=require('./test-server.cjs')(root),output=path.join(repo,'.tmp/browser-check');fs.mkdirSync(output,{recursive:true});
async function selectOverview(page){
  await page.getByRole('button',{name:'Filters',exact:true}).tap();
  await page.locator('#layout').selectOption('lineage');
  await page.getByRole('button',{name:'Filters',exact:true}).tap();
  await page.locator('[data-id="family:Catholic"]').waitFor();
}
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL==='chromium'?{}:{channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'}),headless:true});
 for(const size of [{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:844,height:390}]){
  const context=await browser.newContext({viewport:size,isMobile:true,hasTouch:true});const page=await context.newPage();
  await page.goto(process.env.OVERVIEW_TEST_URL||`http://127.0.0.1:${server.address().port}/church-history/`);await selectOverview(page);await page.waitForTimeout(250);
  const client=await context.newCDPSession(page),graph=page.locator('#graph');
  async function gesture(a,b){await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:a});for(let i=1;i<=12;i++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:a.map((p,j)=>({id:j,x:p.x+(b[j].x-p.x)*i/12,y:p.y+(b[j].y-p.y)*i/12}))});await page.waitForTimeout(16);}await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(80);}
  const box=await graph.boundingBox(),x=box.x+box.width*.5,y=box.y+Math.min(190,(size.height-box.y)*.5);
  const a=[{id:0,x:x-25,y:y-25},{id:1,x:x+25,y:y+25}],b=[{id:0,x:x-55,y:y-55},{id:1,x:x+55,y:y+55}];
  const before=await page.evaluate(()=>({page:visualViewport.scale,width:document.querySelector('.node rect').getBoundingClientRect().width}));
  await gesture(a,b);const after=await page.evaluate(()=>({page:visualViewport.scale,width:document.querySelector('.node rect').getBoundingClientRect().width}));
  if(process.env.OVERVIEW_TEST_URL){console.log(JSON.stringify({size,before,after}));await page.screenshot({path:path.join(output,`overview-production-${size.width}.png`)});await context.close();continue;}
  assert.equal(after.page,before.page,'Overview pinch must not zoom the webpage');assert(after.width>before.width*1.6,'Overview pinch enlarges actual graph geometry '+JSON.stringify({before,after,graph:await page.evaluate(()=>CHURCHTREE_GRAPH?.snapshot())}));
  const zoomed=await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot());
  assert(Math.abs((zoomed.left+box.width/2)/zoomed.scale-box.width/2)<3,'Graph midpoint remains anchored horizontally');
  assert(Math.abs((zoomed.top+y-box.y)/zoomed.scale-(y-box.y))<3,'Graph midpoint remains anchored vertically');
  await gesture(b,a);assert((await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale))<zoomed.scale*.7);
  await gesture(a,b);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:b});
  const transition=await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale);
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b[0]]});assert.equal(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale),transition);
  await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  const panBefore=await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot());await gesture([{id:0,x,y}],[{id:0,x:x-60,y:y-60}]);const panAfter=await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot());assert(panAfter.left>panBefore.left+30&&panAfter.top>panBefore.top+30,'One-finger graph drag pans both axes');
  assert(!await page.locator('#mobile-details').isVisible(),'Gestures never activate nodes');
  if(size.width===390){
   for(let i=0;i<3;i++)await gesture(a,b);assert.equal(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale),4,'Spatial zoom has a usable upper bound');
   for(let i=0;i<4;i++)await gesture(b,a);assert.equal(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale),.5,'Repeated reverse pinch has a lower bound');
  }
  await page.reload();await selectOverview(page);
  const header=page.locator('.explorer-header');
  const controls=header.getByRole('button');
  assert.equal(await controls.count(),4,'Search, Filters, Details and Site menu share the header');
  const boxes=await Promise.all((await controls.all()).map(button=>button.boundingBox()));
  assert(boxes.every(box=>Math.abs(box.y-boxes[0].y)<3 && box.width>=44),'Header actions fit on one row');
  assert(await page.locator('.graph-status').evaluate(el=>el.offsetHeight<=1),'Overview title takes no space above graph');
  await page.screenshot({path:path.join(output,'review-overview-header-'+size.width+'.png')});
  await page.getByRole('button',{name:'Search church history',exact:true}).tap();await page.locator('#search').fill('OPC');
  const close=page.getByRole('button',{name:'Close search',exact:true});assert(await close.isVisible());if(size.width===390){await close.focus();await page.keyboard.press('Enter');}else await close.tap();assert(!await page.locator('#search-form').isVisible());assert.equal(await page.locator('#search').inputValue(),'OPC');assert(await page.locator('#mobile-search-toggle').evaluate(el=>el===document.activeElement));
  await page.getByRole('button',{name:'Search church history',exact:true}).tap();assert(await page.getByRole('button',{name:/^OPC ·/}).isVisible());await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Catholic',exact:true}).tap();assert.equal(await page.locator('#branch').inputValue(),'Catholic','A node remains tappable after pinching/cancellation');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(size.width===390){await gesture([{id:0,x:100,y:25},{id:1,x:150,y:25}],[{id:0,x:60,y:25},{id:1,x:190,y:25}]);assert(await page.evaluate(()=>visualViewport.scale)>1,'Browser pinch remains available outside graph');}
  await context.close();console.log(`Overview gestures and combined header ${size.width}: passed`);
 }
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
