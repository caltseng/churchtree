const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const repoRoot = path.resolve(__dirname, '..');
const root = process.env.CHURCHTREE_TEST_ROOT ? path.resolve(repoRoot, process.env.CHURCHTREE_TEST_ROOT) : repoRoot;
const output = path.join(repoRoot, '.tmp', 'browser-check');
fs.mkdirSync(output, { recursive: true });
const server=require('./test-server.cjs')(root);
async function openFilters(page) {
    const button = page.getByRole("button",{name:"Filters",exact:true});
    if (await button.getAttribute("aria-expanded") === "false") await button.click();
}
async function setView(page,value){
    await openFilters(page);
    await page.locator('#layout').selectOption(value==='lineage'?'lineage':'timeline');
    if(value!=='lineage')await page.getByRole('button',{name:value==='horizontal'?'Horizontal':'Vertical',exact:true}).click();
}
async function assertTimelineDetailsPreserveView(page) {
    const node = page.locator('#graph .node[data-id="episcopal-church"]');
    await node.scrollIntoViewIfNeeded();
    const snapshot = () => page.evaluate(() => {
        const { domain, scale } = CHURCHTREE_TIMELINE.snapshot();
        return { domain, scale };
    });
    const before = await snapshot();
    await node.click();
    assert.match(await page.locator('#details h2').innerText(), /Episcopal Church/);
    assert.equal(await page.locator('#branch').inputValue(), '');
    assert.deepEqual(await snapshot(), before);
}
async function noOverlap(page, selector = '.node') {
    const boxes = await page.locator(selector).evaluateAll(items => items.map(item => ({...item.getBoundingClientRect().toJSON(),record:item.getAttribute('data-members')||item.getAttribute('data-id')})));
    for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            assert(!(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top), `Overlapping nodes ${JSON.stringify(a)}, ${JSON.stringify(b)}`);
        }
}
async function assertExpandedCatalog(browser, url) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    const families = ['Oriental Orthodox', 'Anabaptist', 'Pietist', 'Brethren', 'Evangelical'];
    const fixtures = Array.from({length: 16}, (_, i) => ({
        id: `coverage-fixture-${i}`, name: `Grace Church ${String(i).padStart(2, '0')}`,
        short_label: 'Grace', aliases: ['Shared Name', 'Grace Church 15'], tradition_family: families[i % families.length],
        start_year: 1840 + i, current_status: 'active'
    }));
    fixtures.at(-1).aliases.push('Grace’s Fellowship');
    await page.route('**/data/data.js', async route => {
        const data = fs.readFileSync(path.join(root, 'data', 'data.js'), 'utf8');
        await route.fulfill({ contentType: 'application/javascript',
            body: data + `\nwindow.CHURCHTREE_DATA.nodes.push(...${JSON.stringify(fixtures)});` });
    });
    await page.goto(url);
    await page.locator('#graph .time-node').first().waitFor();
    const search = page.locator('#search');
    const results = page.locator('#results');
    await page.getByRole('button', {name: 'Search church history'}).click();
    await search.fill('Grace Church 15');
    assert.match(await results.locator('button').first().textContent(), /Grace Church 15/);
    await search.fill('GRACES   Fellowship');
    assert.match(await results.locator('button').first().textContent(), /Grace Church 15/);
    await search.fill('Shared Name');
    await search.press('Enter');
    assert(await results.locator('button').first().evaluate(button => button === document.activeElement));
    assert.equal(await page.locator('#search-status').textContent(), 'Showing 12 of 16 matches');
    await page.screenshot({path: path.join(output, 'review-search-similar-names.png')});
    const more = page.getByRole('button', {name: 'Show more results'});
    await more.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#search-status').textContent(), '16 matches');
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Grace Church 12/);
    await results.getByRole('button', {name: /Grace Church 15/}).click();
    assert.equal(await page.locator('#details h2').textContent(), 'Grace Church 15');
    await openFilters(page);
    for (const family of families)
        assert(await page.locator('#branch option').filter({hasText: family}).count(), family);
    for (const view of ['timeline', 'horizontal']) {
        await setView(page, view);
        await page.locator('#branch').selectOption('Brethren');
        const node = page.locator('#graph [data-id="coverage-fixture-3"]');
        await node.waitFor();
        const fill = await node.locator('rect').first().evaluate(rect => getComputedStyle(rect).fill);
        assert(fill && fill !== 'none', `${view} styles a new family's node`);
        const snapshot = () => page.evaluate(() => {
            const {domain, scale} = CHURCHTREE_TIMELINE.snapshot();
            return {domain, scale};
        });
        const before = await snapshot();
        await node.click();
        assert.equal(await page.locator('#details h2').textContent(), 'Grace Church 03');
        assert.equal(await page.locator('#branch').inputValue(), 'Brethren');
        assert.deepEqual(await snapshot(), before);
    }
    await openFilters(page);
    await page.locator('#branch').selectOption('');
    await setView(page, 'lineage');
    await page.locator('[data-id="family:Oriental Orthodox"]').waitFor();
    await noOverlap(page, '#graph .node rect');
    await page.screenshot({path: path.join(output, 'review-lineage-new-families.png')});
    await page.close();
}
(async () => {
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? {} : {channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'}), headless: !process.env.HEADED });
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.address().port}/church-history/`);
        await page.locator('#graph svg[aria-label^="Proportional timeline"]').waitFor();
        assert.equal(await page.locator('#layout').inputValue(), 'timeline');
        assert.equal(await page.locator('#branch').inputValue(), '');
        assert.equal(await page.locator('#orientation-vertical').getAttribute('aria-pressed'), 'true');
        const catholic = page.locator('#graph [data-id="catholic-church"]');
        assert.equal(await catholic.locator('.date').textContent(), '1054 schism');
        assert.equal(await page.locator('#graph .context, #graph .horizontal-origin').count(), 0);
        assert(await page.locator('#graph path.link').evaluateAll(links =>
            links.every(({ __data__: edge }) => ![edge.a.id, edge.b.id].includes('catholic-church'))));
        await page.screenshot({ path: path.join(output, 'review-default-timeline.png') });
        await catholic.focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#details h2').textContent(), 'Roman Catholic Church');
        const defaultDomain = await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot().domain);
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        await page.waitForFunction(() => CHURCHTREE_TIMELINE.snapshot().scale >= 1.7);
        await assertTimelineDetailsPreserveView(page);
        await openFilters(page);
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        assert.deepEqual(await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot().domain), defaultDomain);
        assert.equal(await page.locator('#layout').inputValue(), 'timeline');
        await page.locator('#orientation-horizontal').click();
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        await assertTimelineDetailsPreserveView(page);
        await page.reload();
        await setView(page, 'lineage');
        await page.locator('[data-id="family:Presbyterian"]').waitFor();
        const overviewBox=await page.locator('#graph').boundingBox();
        await page.mouse.move(overviewBox.x+overviewBox.width/2,overviewBox.y+overviewBox.height/2);
        await page.keyboard.down('Control');await page.mouse.wheel(0,-200);await page.keyboard.up('Control');await page.waitForTimeout(100);
        assert(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale)>1.5,'Desktop Ctrl+wheel zooms spatial overview');
        const spatialBefore=await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot());
        const dragPoint=await page.locator('#graph').evaluate(el=>{const r=el.getBoundingClientRect();for(let y=r.top+8;y<r.bottom-20;y+=20)for(let x=r.left+80;x<r.right-20;x+=20){const hit=document.elementFromPoint(x,y);if(el.contains(hit)&&!hit.closest('.node,.link'))return {x,y};}throw Error('No background point');});
        await page.mouse.move(dragPoint.x,dragPoint.y);await page.mouse.down();await page.mouse.move(dragPoint.x-60,dragPoint.y,{steps:6});await page.mouse.up();
        assert(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().left)>spatialBefore.left+40,'Desktop background drag pans overview '+JSON.stringify({spatialBefore,after:await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot())}));
        await page.locator('#graph').focus();await page.keyboard.press('-');
        assert(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale)<spatialBefore.scale,'Keyboard minus zooms the spatial graph');
        await page.keyboard.press('0');assert(Math.abs(await page.evaluate(()=>CHURCHTREE_GRAPH.snapshot().scale)-1)<1e-9,'Keyboard zero resets spatial zoom');
        await page.reload();
        await setView(page, 'lineage');
        await page.locator('[data-id="family:Presbyterian"]').waitFor();
        await noOverlap(page);
        await page.screenshot({ path: path.join(output, 'review-overview.png') });
        await page.getByRole('button', { name: 'Presbyterian', exact: true }).click();
        assert.equal(await page.locator('#layout').inputValue(),'timeline','Overview drill-in should open the detailed timeline');
        await page.screenshot({path:path.join(output,'review-branch-timeline.png')});
        await setView(page,'lineage');
        const branchPositions=await page.locator('.node:not(.context)').evaluateAll(ns=>ns.map(n=>n.getAttribute('transform')));
        assert(new Set(branchPositions.map(t=>t.split(',')[0])).size>1,'Branches must not form a single column');
        await page.screenshot({path:path.join(output,'review-branch-lineage.png')});
        await page.getByRole('button',{name:'Zoom out',exact:true}).click();
        const grouped = await page.locator('.node').count();
        assert(await page.locator('.context').count());
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        assert(await page.locator('.node').count() > grouped);
        await noOverlap(page);
        await page.evaluate(() => {
            const n = CHURCHTREE_DATA.nodes.find(n => n.id === 'pca');
            n.key_figures = [{ name: 'Person fixture', role: 'Role fixture', summary: 'Biographical context fixture', url: 'https://example.com/person', citations: [] }];
            n.further_reading = [{ title: 'Article fixture', snippet: 'Article context fixture', url: 'https://example.com/article' }];
            n.key_documents = [{ title: 'Document fixture', year: 1973, significance: 'Document context fixture', url: 'https://example.com/document', citations: [] }];
        });
        assert(!await page.locator('#search').isVisible(),'Desktop search starts collapsed');
        await page.getByRole('button',{name:'Search church history'}).click();
        await page.locator('#search').fill('PCA');
        await page.getByRole('button', { name: /^PCA ·/ }).click();
        assert.match(await page.locator('#details').innerText(), /Why it formed/);
        assert.match(await page.locator('#details .badge').innerText(), /1973–present/i);
        await page.locator('[data-id="pcus"]').click();
        assert.match(await page.locator('#details .badge').innerText(), /1861–1983/);
        await page.locator('[data-id="pca"]').click();
        assert(await page.locator('#details a').count());
        assert(await page.getByRole('link', { name: 'Person fixture', exact: true }).count());
        assert.match(await page.locator('#details').innerText(), /Biographical context fixture/);
        assert.match(await page.locator('#details').innerText(), /Article context fixture/);
        assert.match(await page.locator('#details').innerText(), /Document context fixture/);
        await page.getByRole('button', { name: 'Trace ancestry' }).click();
        assert(await page.locator('.context').count());
        await noOverlap(page);
        const families = await page.locator('#branch option').evaluateAll(options => options.map(o => o.value).filter(Boolean));
        for (const family of families) {
            await openFilters(page);
            await page.locator('#branch').selectOption(family);
            await setView(page,'lineage');
            await page.getByRole('button',{name:'Zoom out',exact:true}).click();
            await noOverlap(page);
            await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
            await noOverlap(page);
        }
        await openFilters(page);
        await page.locator('#branch').selectOption('Baptist');
        await setView(page,'timeline');
        const initial = await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot());
        assert(initial.clusters.some(c => c.count > 1));
        assert(initial.clusters.every(c => c.title && !/^\d+ (records|entries)$/.test(c.title)));
        assert(initial.clusters.some(c => c.title === 'Baptist and Separatist beginnings'));
        const clusterLabels = await page.locator('.time-node.aggregate .time-label').allTextContents();
        assert(clusterLabels.every(title => /Baptist/.test(title)));
        const box = await page.locator('#graph').boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height * .7);
        await page.mouse.wheel(0, -2000);
        await page.waitForTimeout(400);
        const zoomed = await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot());
        assert(zoomed.scale > initial.scale);
        assert(zoomed.clusters.length > initial.clusters.length, 'Zoom must disclose additional nodes');
        await noOverlap(page);
        await page.mouse.wheel(0, 2000);
        await page.waitForTimeout(400);
        const collapsed = await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot());
        assert(collapsed.clusters.length < zoomed.clusters.length, 'Zoom out must collapse nearby records');
        await page.screenshot({ path: path.join(output, 'review-timeline.png') });
        await setView(page,'horizontal');
        await page.waitForTimeout(180);
        const horizontalInitial = await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot());
        assert(await page.locator('#graph').evaluate(el => el.scrollWidth <= el.clientWidth + 2), 'Horizontal overview should fit the complete date range');
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        assert(await page.locator('#graph').evaluate(el => el.scrollWidth > el.clientWidth));
        const horizontalBox = await page.locator('#graph').boundingBox();
        await page.mouse.move(horizontalBox.x + horizontalBox.width * .65, horizontalBox.y + horizontalBox.height * .6);
        const beforeScroll = await page.locator('#graph').evaluate(el => el.scrollLeft);
        await page.keyboard.down('Shift');
        await page.mouse.wheel(0, 300);
        await page.keyboard.up('Shift');
        await page.waitForTimeout(100);
        assert(await page.locator('#graph').evaluate(el => el.scrollLeft) > beforeScroll);
        for (let i = 0; i < 4; i++)
            await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        const horizontalZoomed = await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot());
        assert(horizontalZoomed.clusters.length > horizontalInitial.clusters.length);
        await noOverlap(page);
        assert((await page.locator('.horizontal-node .date').allTextContents()).every(label => !/(entries|records)/.test(label)));
        await page.screenshot({ path: path.join(output, 'review-horizontal.png') });
        await openFilters(page);
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        assert.equal((await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot())).scale, 1);
        await page.screenshot({ path: path.join(output, 'review-horizontal-initial.png') });
        await openFilters(page);
        await page.locator('#branch').selectOption('');
        await noOverlap(page);
        await page.locator('#graph').evaluate(el=>el.scrollTop=350);
        await page.waitForTimeout(120);
        const axisBox=await page.locator('.horizontal-axis').boundingBox();
        const graphBox=await page.locator('#graph').boundingBox();
        assert(axisBox.y<graphBox.y+50,'Dates must remain visible while scrolling through traditions');
        await page.screenshot({ path: path.join(output, 'review-horizontal-all.png') });
        await setView(page,'timeline');
        await page.getByRole('button',{name:'Search church history'}).click();
        await page.locator('#search').fill('OPC');
        await page.getByRole('button',{name:/^OPC ·/}).click();
        await page.waitForTimeout(400);
        const revealDomain=await page.evaluate(()=>CHURCHTREE_TIMELINE.snapshot().domain);
        assert(revealDomain[0]<1936&&revealDomain[1]>1936,'Search must bring the selected date into view');
        assert(await page.locator('.time-node.selected').count());
        await openFilters(page);
        await page.getByRole('button',{name:'Date range',exact:true}).click();
        await page.locator('#year-from').fill('2000');
        await page.locator('#year-to').fill('1800');
        await page.getByRole('button',{name:'Apply',exact:true}).click();
        assert.match(await page.locator('#period-error').innerText(),/start earlier/);
        await page.locator('#year-from').fill('1800');
        await page.locator('#year-to').fill('2000');
        await page.getByRole('button',{name:'Apply',exact:true}).click();
        assert.equal(await page.locator('#period-error').innerText(),'');
        const verticalBefore = await page.evaluate(() => {const d=CHURCHTREE_TIMELINE.snapshot().domain;return d[1]-d[0];});
        const verticalBox=await page.locator('#graph').boundingBox();
        await page.mouse.move(verticalBox.x+verticalBox.width*.65,verticalBox.y+verticalBox.height*.6);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(300);
        await page.waitForFunction(span=>{const d=CHURCHTREE_TIMELINE.snapshot().domain;return d[1]-d[0]<span*.99;},verticalBefore);
        await openFilters(page);
        await page.locator('#branch').selectOption('');
        await noOverlap(page);
        await setView(page,'lineage');
        await openFilters(page);
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(180);
        assert(await page.evaluate(() => document.body.scrollHeight <= innerHeight));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const before = await page.locator('#details').evaluate(el => el.clientWidth);
        await page.locator('#splitter').focus();
        await page.keyboard.press('ArrowLeft');
        assert(await page.locator('#details').evaluate(el => el.clientWidth) > before);
        await page.waitForTimeout(180);
        await page.screenshot({ path: path.join(output, 'review-desktop.png') });
        await setView(page,'horizontal');
        await setView(page,'lineage');
        await openFilters(page);
        await page.locator('#branch').selectOption('');
        await page.getByRole('button',{name:'Presbyterian',exact:true}).click();
        assert.equal(await page.locator('#orientation-horizontal').getAttribute('aria-pressed'),'true','Drill-in should preserve the last timeline orientation');
        await openFilters(page);
        assert.equal(await catholic.count(), 0);
        assert.equal(Math.round(await page.evaluate(() => CHURCHTREE_TIMELINE.snapshot().domain[0])), 1550);
        await page.locator('#branch').selectOption('Catholic');
        assert.equal(await catholic.locator('.date').textContent(), '1054 schism');
        await catholic.click();
        assert.equal(await page.locator('#details h2').textContent(), 'Roman Catholic Church');
        assert(await page.getByRole('button',{name:'Zoom in',exact:true}).isEnabled());
        for(const width of [1100,1440]){
            await page.setViewportSize({width,height:800});await page.waitForTimeout(180);
            assert(await page.locator('#splitter').isVisible(),'Desktop split view must remain available');
            assert(await page.locator('#mobile-open-details').isVisible());
            assert.equal(await page.locator('#details').evaluate(el=>el.parentElement.tagName),'MAIN');
            assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        }
        const info=page.getByRole('button',{name:'Details',exact:true});
        await info.click();
        assert(!await page.locator('#details').isVisible());
        await info.click();
        assert(await page.locator('#details').isVisible());
        assert.deepEqual(errors, []);
        await assertExpandedCatalog(browser, `http://127.0.0.1:${server.address().port}/church-history/`);
        console.log(JSON.stringify({ passed: true, families: families.length, clustered: initial.clusters.length, zoomed: zoomed.clusters.length, collapsed: collapsed.clusters.length, browserErrors: errors }));
    }
    finally {
        await browser?.close();
        server.close();
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
