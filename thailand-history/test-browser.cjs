const assert = require('node:assert/strict'), fs = require('fs'), path = require('path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..', process.env.CHURCHTREE_TEST_ROOT || 'dist');
const server = require('../scripts/test-server.cjs')(root);
const output = path.resolve(__dirname, '../.tmp/browser-check');
fs.mkdirSync(output, {recursive: true});
(async () => {
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        browser = await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? {} : {channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'}), headless: true});
        const base = `http://127.0.0.1:${server.address().port}`;
        for (const viewport of [{width: 1440, height: 1000}, {width: 390, height: 844}, {width: 320, height: 568}, {width: 844, height: 390}]) {
            const page = await browser.newPage({viewport, reducedMotion: 'reduce'}), errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(base + '/');
            await page.locator('.tool-card[data-id="global-church"]').click();
            await page.locator('.tool-card[data-id="thailand-history"]').click();
            await page.locator('#graph svg').waitFor();
            assert.match(page.url(), /\/thailand-history\/$/);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert(await page.locator('#graph svg > text.mode-note[text-anchor="middle"]').evaluateAll(labels => {
                const boxes = labels.map(label => label.getBoundingClientRect()).sort((a, b) => a.left - b.left);
                return boxes.length === 6 && boxes.every((box, index) => !index || box.left >= boxes[index - 1].right);
            }), 'Country lane headings do not overlap');
            assert(await page.locator('#graph').evaluate(element => {
                const box = element.getBoundingClientRect();
                return Math.min(box.bottom, innerHeight) - Math.max(box.top, 0) >= Math.min(180, innerHeight * .4);
            }), 'Timeline retains useful initial visible area');
            await page.screenshot({path: path.join(output, `thailand-initial-${viewport.width}.png`)});
            for (const orientation of ['horizontal', 'vertical']) {
                await page.goto(base + '/thailand-history/?from=1860&to=1900');
                await page.locator('#graph svg').waitFor();
                const period = await page.locator('#visible-range').innerText();
                await page.locator('#' + orientation).click();
                await page.waitForTimeout(200);
                assert.equal(await page.locator('#visible-range').innerText(), period);
                const node = page.locator('#graph .node').first();
                await node.focus(); await page.keyboard.press('Enter');
                const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
                await details.waitFor({state: 'visible'});
                const members = details.locator('.cluster-members button');
                if (await members.count()) await members.first().click();
                const selectedRange = await page.locator('#visible-range').innerText();
                assert(await details.locator('article').isVisible());
                assert(await details.locator('.source-credit a').count());
                assert(await details.locator('.critical-note').isVisible());
                await details.locator('.record-evidence > summary').click();
                assert(await details.locator('.sources li').first().isVisible());
                if (viewport.width < 1100) {
                    await page.locator('#back-to-timeline').click();
                    assert(await page.evaluate(() => document.getElementById('graph').contains(document.activeElement)));
                }
                assert.equal(await page.locator('#visible-range').innerText(), selectedRange);
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                await page.screenshot({path: path.join(output, `thailand-${orientation}-${viewport.width}.png`)});
            }
            await page.locator('#horizontal').click();
            await page.locator('#zoom-in').click();
            const zoomed = await page.locator('#visible-range').innerText();
            await page.setViewportSize({...viewport, width: viewport.width + 40});
            await page.waitForTimeout(250);
            assert.equal(await page.locator('#visible-range').innerText(), zoomed);
            await page.setViewportSize(viewport);
            await page.goto(base + '/thailand-history/#northern-toleration-edict');
            const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
            await details.locator('article').waitFor();
            assert.match(await details.innerText(), /1878-10-08/);
            await details.locator('.record-evidence > summary').click();
            assert.match(await details.innerText(), /1912/);
            assert.match(await details.locator('.sources a').first().getAttribute('href'), /archive.org/);
            await page.screenshot({path: path.join(output, `thailand-evidence-${viewport.width}.png`)});
            if (viewport.width < 1100) await page.keyboard.press('Escape');
            await page.getByRole('button', {name: 'Search', exact: true}).click();
            await page.locator('#search').fill('Kom Tip');
            await page.locator('#search-panel button').click();
            assert.equal(await page.locator('#record-list article:visible').count(), 1);
            assert.match(await page.locator('#local-women-teachers').innerText(), /1888.*1892/s);
            await page.goto(base + '/thailand-history/?from=oops');
            assert.match(await page.locator('#period-error').innerText(), /Use whole years/);
            assert.deepEqual(errors, []);
            await page.close();
            console.log(`Thailand navigation, both orientations, keyboard evidence and resize ${viewport.width}x${viewport.height}: passed`);
        }
        const noJS = await browser.newPage({javaScriptEnabled: false});
        await noJS.goto(base + '/thailand-history/#reported-affiliation-snapshot');
        assert.equal(await noJS.locator('#record-list article').count(), 40);
        assert.match(await noJS.locator('#reported-affiliation-snapshot').innerText(), /1.2%.*December 2021/s);
        await noJS.locator('#reported-affiliation-snapshot .record-evidence > summary').click();
        assert.match(await noJS.locator('#reported-affiliation-snapshot .sources').innerText(), /Religious Demography/);
        await noJS.close();
        const offline = await browser.newPage();
        await offline.route('https://d3js.org/**', route => route.abort());
        await offline.goto(base + '/thailand-history/');
        assert.match(await offline.locator('#load-status').innerText(), /D3 could not load/);
        assert.equal(await offline.locator('#record-list article:visible').count(), 40);
        await offline.close();
    } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
