const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const browserTest = require('./browser-test.cjs');
const {countryHistories} = require('../site.config.json');
const repo = path.resolve(__dirname, '..');
const root = path.resolve(repo, process.env.CHURCHTREE_TEST_ROOT || 'dist');
const output = path.join(repo, '.tmp/browser-check');
fs.mkdirSync(output, {recursive: true});

browserTest(root, async ({browser, base}) => {
    for (const country of countryHistories) {
        const data = require(path.join(repo, country.path, 'data.cjs'));
        const record = data.events.find(event => event.date.kind !== 'unknown');
        const lane = record.lane_id;
        const year = Number(record.date.start.slice(0, 4));
        const from = String(Math.max(100, year - 50));
        const to = String(Math.min(2100, year + 50));
        const url = base + '/' + country.path;
        for (const viewport of [
            {width: 1440, height: 1000}, {width: 390, height: 844},
            {width: 320, height: 568}, {width: 844, height: 390}
        ]) {
            const page = await browser.newPage({viewport, reducedMotion: 'reduce'}), errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(base + '/');
            await page.locator('.tool-card[data-id="global-church"]').focus();
            await page.keyboard.press('Enter');
            await page.waitForURL('**/global-church/');
            await page.locator(`.tool-card[data-id="${country.id}"]`).focus();
            await page.keyboard.press('Enter');
            await page.locator('#graph svg').waitFor();
            assert.equal(page.url(), url);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert(await page.locator('#graph').evaluate(element => {
                const box = element.getBoundingClientRect();
                return Math.min(box.bottom, innerHeight) - Math.max(box.top, 0) >= Math.min(180, innerHeight * .4);
            }), 'Useful graph area is visible initially');
            // Preserve the original Cambodia/Thailand lane-layout check without adding a new China layout gate.
            if (country.id !== 'china-history') {
                assert(await page.locator('#graph svg > text.mode-note[text-anchor="middle"]').evaluateAll(labels => {
                    const boxes = labels.map(label => label.getBoundingClientRect()).sort((a, b) => a.left - b.left);
                    return boxes.length > 0 && boxes.every((box, index) => !index || box.left >= boxes[index - 1].right);
                }), 'Lane headings do not overlap');
            }
            await page.getByRole('button', {name: 'Filters', exact: true}).click();
            await page.locator('#lane').selectOption(lane);
            await page.locator('#year-from').fill(from);
            await page.locator('#year-to').fill(to);
            await page.locator('#filters-panel button', {hasText: 'Apply'}).click();
            await page.getByRole('button', {name: 'Filters', exact: true}).click();
            assert.equal(new URL(page.url()).searchParams.get('lane'), lane);

            for (const orientation of ['vertical', 'horizontal']) {
                await page.goto(`${url}?from=${from}&to=${to}&lane=${lane}`);
                await page.locator('#graph svg').waitFor();
                const period = await page.locator('#visible-range').innerText();
                await page.locator('#' + orientation).click();
                await page.waitForTimeout(200);
                assert.equal(await page.locator('#visible-range').innerText(), period);
                if (orientation === 'horizontal') {
                    assert(await page.locator('#graph .horizontal-axis .tick text').evaluateAll(labels => {
                        const boxes = labels.map(label => label.getBoundingClientRect()).sort((a, b) => a.left - b.left);
                        return boxes.every((box, index) => !index || box.left >= boxes[index - 1].right);
                    }), 'Horizontal date labels remain readable');
                }
                await page.locator('#zoom-in').click();
                await page.waitForTimeout(200);
                const zoomed = await page.locator('#visible-range').innerText();
                assert.notEqual(zoomed, period);
                await page.setViewportSize({...viewport, width: viewport.width + 40});
                await page.waitForTimeout(300);
                assert.equal(await page.locator('#visible-range').innerText(), zoomed);
                await page.setViewportSize(viewport);
                await page.waitForTimeout(300);
                const node = page.locator('#graph .node').first();
                await node.focus();
                await page.keyboard.press('Enter');
                const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
                await details.waitFor({state: 'visible'});
                await page.waitForTimeout(200);
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
                    await page.waitForFunction(() => document.getElementById('graph').contains(document.activeElement));
                }
                assert.equal(await page.locator('#visible-range').innerText(), selectedRange);
                assert.equal(await page.locator('#lane').inputValue(), lane);
                assert.equal(await page.locator('#year-from').inputValue(), from);
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                await page.screenshot({path: path.join(output, `${country.id}-${orientation}-${viewport.width}.png`)});
            }

            await page.goto(url + '#' + record.id);
            const details = viewport.width < 1100 ? page.locator('#record-dialog') : page.locator('#selection');
            await details.getByRole('heading', {name: record.title, exact: true}).waitFor();
            await details.locator('.record-evidence > summary').click();
            assert(await details.locator('.sources li').first().isVisible());
            if (viewport.width < 1100) await page.keyboard.press('Escape');
            await page.getByRole('button', {name: 'Search', exact: true}).click();
            await page.locator('#search').fill(record.title);
            await page.locator('#search-panel button').click();
            assert(await page.locator(`#record-list #${record.id}`).isVisible());
            assert(await page.locator('#record-list article:visible').count() < data.events.length);
            for (const [query, message] of [
                ['?from=2000&to=1900', /From no later than To/],
                ['?from=oops', /Use whole years/]
            ]) {
                await page.goto(url + query);
                assert.match(await page.locator('#period-error').innerText(), message);
                assert(await page.locator('#record-list article').first().isVisible());
            }
            assert.deepEqual(errors, []);
            await page.close();
            console.log(`${country.title}: navigation, orientations, evidence, focus and resize ${viewport.width}x${viewport.height} passed`);
        }
        const noJS = await browser.newPage({javaScriptEnabled: false});
        await noJS.goto(base + '/global-church/');
        await noJS.locator(`.tool-card[data-id="${country.id}"]`).click();
        assert.equal(await noJS.locator('#record-list article').count(), data.events.length);
        await noJS.locator(`#${record.id} .record-evidence > summary`).click();
        assert(await noJS.locator(`#${record.id} .sources li`).first().isVisible());
        assert(!await noJS.locator('#timeline-panel').isVisible());
        await noJS.close();
        const offline = await browser.newPage();
        await offline.route('https://d3js.org/**', route => route.abort());
        await offline.goto(url);
        assert.match(await offline.locator('#load-status').innerText(), /D3 could not load/);
        assert.equal(await offline.locator('#record-list article:visible').count(), data.events.length);
        await offline.close();
    }
}).catch(error => { console.error(error); process.exitCode = 1; });
