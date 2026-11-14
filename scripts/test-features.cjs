const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(__dirname,'..'),root=process.env.CHURCHTREE_TEST_ROOT?path.resolve(repo,process.env.CHURCHTREE_TEST_ROOT):repo,server=require('./test-server.cjs')(root),output=path.join(repo,'.tmp/browser-check');fs.mkdirSync(output,{recursive:true});
function luminance(rgb){return rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL==='chromium'?{}:{channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'}),headless:true});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const size of [{width:1440,height:1000},{width:390,height:844},{width:320,height:568},{width:768,height:1024}]){
  const page=await browser.newPage({viewport:size}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(base+'/')).status(),200);assert.equal(await page.locator('.tool-card').count(),2);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const theme of ['parchment','slate','ink']){
   await page.locator('#theme-open').click();await page.locator(`input[name="theme"][value="${theme}"]`).check();
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
   assert(await page.locator('#theme-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await page.locator('#theme-close').click();
   const colors=await page.evaluate(()=>({text:getComputedStyle(document.body).color,background:getComputedStyle(document.documentElement).backgroundColor}));const a=luminance(colors.text),b=luminance(colors.background);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'Main reading colors must have sufficient contrast');
  }
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
  await page.screenshot({path:path.join(output,`home-ink-${size.width}.png`),fullPage:true});
  await page.locator('.tool-card[data-id="church-history"]').click();await page.locator('[data-id="family:Presbyterian"]').waitFor();assert.match(page.url(),/\/church-history\/$/);assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
  await page.getByRole('link',{name:'Main Branch home',exact:true}).click();assert.equal(await page.locator('.tool-card').count(),2);
  await page.locator('.tool-card[data-id="westminster"]').click();assert.equal(await page.locator('.passage').count(),172);assert(await page.locator('#chapter-1').isVisible());assert.equal(await page.locator('html').getAttribute('data-theme'),'ink');
  await page.goto(base+'/');await page.locator('#theme-open').click();await page.locator('#theme-reset').click();await page.locator('#theme-close').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'parchment');
  await page.screenshot({path:path.join(output,`home-${size.width}.png`),fullPage:true});
  assert(await page.locator('.main-branch-symbol').evaluateAll(images=>images.length>0&&images.every(img=>img.complete&&img.naturalWidth>0)));assert.match(await page.locator('link[rel=icon]').getAttribute('href'),/main-branch\.svg$/);await page.locator('.growing-note a').click();await page.locator('[data-id="family:Presbyterian"]').waitFor();assert.match(page.url(),/\/church-history\/$/);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);await page.close();console.log(`Landing, themes, links and logos ${size.width}px: passed`);
 }
 for(const file of fs.readdirSync(path.join(root,'assets/brand/logos')).filter(file=>file.endsWith('.svg'))){const svg=fs.readFileSync(path.join(root,'assets/brand/logos',file),'utf8');const colors=new Set((svg.match(/#[\da-f]{6}\b/gi)||[]).map(c=>c.toLowerCase()));assert(colors.size>0&&colors.size<=3,file+' must use at most three colors');}
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
