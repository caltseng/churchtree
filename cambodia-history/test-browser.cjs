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
        browser = await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? {} :
            {channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'}), headless: true});
        const base = `http://127.0.0.1:${server.address().port}`;
        for (const viewport of [{width: 1440, height: 1000}, {width: 390, height: 844},
            {width: 320, height: 568}, {width: 844, height: 390}]) {
            const page = await browser.newPage({viewport, reducedMotion: 'reduce'}), errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(base + '/');
            await page.locator('.tool-card[data-id="global-church"]').focus();
            await page.keyboard.press('Enter');
            await page.waitForURL('**/global-church/');
            await page.locator('.tool-card[data-id="cambodia-history"]').focus();
            await page.keyboard.press('Enter');
            await page.locator('#graph svg').waitFor();
            assert.match(page.url(), /\/cambodia-history\/$/);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert(await page.locator('#graph').evaluate(el => {
                const r = el.getBoundingClientRect();
                return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) >= Math.min(180, innerHeight * .4);
            }), 'Useful graph area is visible initially');
            await page.screenshot({path: path.join(output, `cambodia-initial-${viewport.width}.png`)});
            for (const orientation of ['vertical', 'horizontal']) {
                await page.goto(base + '/cambodia-history/?from=1900&to=2000&lane=protestant');
                await page.locator('#graph svg').waitFor();
                await page.waitForTimeout(150);
                const period = await page.locator('#visible-range').innerText();
                await page.locator('#' + orientation).click();
                await page.waitForTimeout(150);
                assert.equal(await page.locator('#visible-range').innerText(), period);
                await page.locator('#zoom-in').click();
                await page.waitForTimeout(150);
                assert.notEqual(await page.locator('#visible-range').innerText(), period);
                const node = page.locator('#graph .node').first();
                await node.focus(); await page.keyboard.press('Enter');
                const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
                await details.waitFor({state: 'visible'});
                // Cluster expansion intentionally fits its dates before individual details open.
                await page.waitForTimeout(150);
                const expanded = await page.locator('#visible-range').innerText();
                const cluster = details.locator('.cluster-members button');
                if (await cluster.count()) await cluster.first().click();
                assert(await details.locator('article').isVisible());
                assert(await details.locator('.source-credit a').count());
                await details.locator('.record-evidence > summary').click();
                assert(await details.locator('.sources li').first().isVisible());
                await page.screenshot({path: path.join(output, `cambodia-evidence-${orientation}-${viewport.width}.png`)});
                if (viewport.width < 1100) {
                    await page.locator('#back-to-timeline').click();
                    assert(await page.evaluate(() => document.activeElement !== document.body));
                }
                assert.equal(await page.locator('#visible-range').innerText(), expanded);
                assert.equal(await page.locator('#lane').inputValue(), 'protestant');
                assert.equal(await page.locator('#year-from').inputValue(), '1900');
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                await page.screenshot({path: path.join(output, `cambodia-${orientation}-${viewport.width}.png`)});
            }
            await page.goto(base + '/cambodia-history/#salas-consecration');
            const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
            await details.locator('article').waitFor();
            assert.match(await details.innerText(), /1976 and 1977/);
            await details.locator('.record-evidence > summary').click();
            assert.match(await details.innerText(), /April 15, 1975/);
            if (viewport.width < 1100) await page.keyboard.press('Escape');
            await page.getByRole('button', {name: 'Search', exact: true}).click();
            await page.locator('#search').fill('Nai');
            await page.locator('#search-panel button').click();
            assert.equal(await page.locator('#record-list article:visible').count(), 1);
            assert.match(await page.locator('#women-support-nai').innerText(), /1960/);
            await page.goto(base + '/cambodia-history/?view=text#da-cruz-mission');
            assert.match(await page.locator('#da-cruz-mission').innerText(), /1555 to 1556/);
            await page.locator('#scope-info > summary').click();
            assert.match(await page.locator('#scope-info').innerText(), /eight rows.*held|eight rows are held/i);
            assert.match(await page.locator('#scope-info').innerText(), /data-file frequencies are not population/);
            assert.deepEqual(errors, []);
            await page.close();
            console.log(`Cambodia country journey, orientations, evidence, focus and preserved view ${viewport.width}x${viewport.height}: passed`);
        }
        const noJS = await browser.newPage({javaScriptEnabled: false});
        await noJS.goto(base + '/global-church/');
        await noJS.locator('.tool-card[data-id="cambodia-history"]').click();
        assert.equal(await noJS.locator('#record-list article').count(), 42);
        await noJS.locator('#hammond-bible-distributed .record-evidence > summary').click();
        assert.match(await noJS.locator('#hammond-bible-distributed .sources').innerText(), /completion\/distribution/);
        assert(!await noJS.locator('#timeline-panel').isVisible());
        await noJS.close();
        const offline = await browser.newPage();
        await offline.route('https://d3js.org/**', route => route.abort());
        await offline.goto(base + '/cambodia-history/');
        assert.match(await offline.locator('#load-status').innerText(), /D3 could not load/);
        assert.equal(await offline.locator('#record-list article:visible').count(), 42);
        await offline.close();
    } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
