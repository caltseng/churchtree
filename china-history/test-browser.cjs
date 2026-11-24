const assert = require('node:assert/strict'), path = require('path'), fs = require('fs');
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
            await page.locator('.tool-card[data-id="china-history"]').click();
            await page.locator('#graph svg').waitFor();
            assert.match(page.url(), /\/china-history\/$/);
            await page.goto(base + '/china-history/?from=1900&to=2000');
            await page.locator('#graph svg').waitFor();
            const period = await page.locator('#visible-range').innerText();
            assert.equal(period, '1900-2001 CE');
            for (const orientation of ['horizontal', 'vertical', 'horizontal', 'vertical']) {
                await page.locator('#' + orientation).click();
                await page.waitForTimeout(200);
                assert.equal(await page.locator('#visible-range').innerText(), period,
                    'Changing orientation preserves the full visible period, including on narrow screens');
                if (orientation === 'horizontal') {
                    assert(await page.locator('#graph .horizontal-axis .tick text').evaluateAll(labels => {
                        const boxes = labels.map(label => label.getBoundingClientRect()).sort((a, b) => a.left - b.left);
                        return boxes.every((box, i) => !i || box.left >= boxes[i - 1].right);
                    }), 'Horizontal date labels remain readable at the fitted width');
                }
            }
            await page.locator('#horizontal').click();
            await page.locator('#zoom-in').click();
            await page.waitForTimeout(200);
            const zoomedPeriod = await page.locator('#visible-range').innerText();
            for (const width of [viewport.width + 40, viewport.width]) {
                await page.setViewportSize({...viewport, width});
                await page.waitForTimeout(300);
                assert.equal(await page.locator('#visible-range').innerText(), zoomedPeriod,
                    'Resizing preserves the zoomed horizontal period rather than narrowing it again');
            }
            const clustered = await page.locator('#graph .node').count();
            await page.locator('#zoom-in').evaluate(button => {
                for (let i = 0; i < 24; i++) button.click();
            });
            assert(await page.locator('#graph .node').count() > clustered,
                'Narrow-screen fit retains enough zoom depth to separate dated records');
            await page.goto(base + '/china-history/');
            await page.locator('#graph svg').waitFor();
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert(await page.locator('#graph').evaluate(el => {
                const r = el.getBoundingClientRect();
                return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) >= Math.min(180, innerHeight * .4);
            }), 'Enough timeline visible on initial load');
            await page.getByRole('button', {name: 'Filters', exact: true}).click();
            await page.locator('#lane').selectOption('protestant');
            await page.locator('#year-from').fill('1900');
            await page.locator('#year-to').fill('1940');
            await page.locator('#filters-panel button', {hasText: 'Apply'}).click();
            await page.getByRole('button', {name: 'Filters', exact: true}).click();
            for (const orientation of ['vertical', 'horizontal']) {
                await page.locator('#' + orientation).click();
                await page.locator('#graph svg').waitFor();
                await page.waitForTimeout(150);
                const node = page.locator('#graph .node').first();
                await node.focus(); await page.keyboard.press('Enter');
                const target = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
                await target.waitFor({state: 'visible'});
                const members = target.locator('.cluster-members button');
                if (await members.count()) await members.first().click();
                assert(await target.locator('article').isVisible());
                assert(await target.locator('.source-credit a').count());
                await target.locator('.record-evidence > summary').click();
                assert(await target.locator('.sources li').first().isVisible());
                assert(await target.locator('.record-evidence').innerText());
                const before = await page.locator('#visible-range').innerText();
                if (viewport.width < 1100) {
                    await page.locator('#back-to-timeline').click();
                    assert.equal(await page.locator('#visible-range').innerText(), before);
                    assert(await page.evaluate(() => document.activeElement !== document.body), 'Closing details restores focus');
                }
                assert.equal(await page.locator('#lane').inputValue(), 'protestant');
                assert.equal(await page.locator('#year-from').inputValue(), '1900');
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                await page.screenshot({path: path.join(output, `china-${orientation}-${viewport.width}.png`)});
            }
            await page.goto(base + '/china-history/#alopen-arrival-report');
            const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
            await details.locator('article').waitFor();
            assert.match(await details.innerText(), /781.*635|635.*781/s);
            await details.locator('.record-evidence > summary').click();
            assert.match(await details.innerText(), /1917|Horne/);
            assert.match(await details.locator('.sources a').first().getAttribute('href'), /781nestorian/);
            if (viewport.width < 1100) await page.keyboard.press('Escape');
            await page.getByRole('button', {name: 'Search', exact: true}).click();
            await page.locator('#search').fill('True Jesus Church seminary');
            await page.locator('#search-panel button').click();
            assert.equal(await page.locator('#record-list article:visible').count(), 1);
            const seminary = page.locator('#true-jesus-seminary');
            assert.match(await seminary.innerText(), /1924/);
            await seminary.locator('.record-evidence > summary').click();
            assert.match(await seminary.innerText(), /1947.*2020/s);
            await page.goto(base + '/china-history/?view=text#orthodox-autonomy-dates');
            assert.match(await page.locator('#orthodox-autonomy-dates').innerText(), /Approx\. 1956 to 1957/);
            await page.goto(base + '/china-history/?view=text#tang-yuan-gap');
            assert.match(await page.locator('#tang-yuan-gap').innerText(), /Date unplaced/);
            await page.goto(base + '/china-history/?from=2000&to=1900');
            assert.match(await page.locator('#period-error').innerText(), /From no later than To/);
            assert(await page.locator('#record-list article').first().isVisible());
            await page.goto(base + '/china-history/?from=oops');
            assert.equal(await page.locator('#year-from').inputValue(), 'oops');
            assert.match(await page.locator('#period-error').innerText(), /Use whole years/);
            assert.match(page.url(), /from=oops/);
            assert(await page.locator('#record-list article').first().isVisible());
            assert.deepEqual(errors, []);
            await page.close();
            console.log(`China navigation, both orientations, citations and responsive details ${viewport.width}x${viewport.height}: passed`);
        }
        const noJS = await browser.newPage({javaScriptEnabled: false});
        await noJS.goto(base + '/china-history/#tianjin-treaty');
        assert.equal(await noJS.locator('#record-list article').count(), 45);
        assert.match(await noJS.locator('#tianjin-treaty').innerText(), /1858-06-18/);
        await noJS.locator('#tianjin-treaty .record-evidence > summary').click();
        assert.match(await noJS.locator('#tianjin-treaty .sources').innerText(), /Article XXIX/);
        assert.equal(await noJS.locator('#timeline-panel').isVisible(), false);
        await noJS.close();
        const offline = await browser.newPage();
        await offline.route('https://d3js.org/**', route => route.abort());
        await offline.goto(base + '/china-history/');
        assert.match(await offline.locator('#load-status').innerText(), /D3 could not load/);
        assert.equal(await offline.locator('#record-list article:visible').count(), 45);
        await offline.close();
        const legacy = await browser.newPage();
        await legacy.goto(base + '/church-history/');
        await legacy.locator('#graph svg').waitFor();
        assert.equal(await legacy.locator('script[src="../data/data.js"]').count(), 1);
        assert.equal(await legacy.locator('script[src*="china-history"]').count(), 0);
        await legacy.close();
    } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
