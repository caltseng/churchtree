const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const repo = path.resolve(__dirname, '..');
const root = path.resolve(repo, process.env.CHURCHTREE_TEST_ROOT || 'dist');
const server = require('../scripts/test-server.cjs')(root);
const output = path.join(repo, '.tmp', 'browser-check');
fs.mkdirSync(output, {recursive: true});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({
      ...(process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? {} : {channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'}),
      headless: true
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const size of [{width: 320, height: 568}, {width: 667, height: 375}, {width: 1440, height: 1000}]) {
      const context = await browser.newContext({viewport: size, hasTouch: size.width < 700, reducedMotion: 'reduce'});
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + '/');
      await page.locator('.tool-card[data-id="us-denominations"]').click();
      const content = page.locator('#interactive-view');
      async function heading(name) {
        assert.equal(await content.locator('#group-heading').textContent(), name);
      }
      async function fits() {
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal clipping');
        const rows = await content.locator('.row-target').evaluateAll(elements => elements.map(el => ({
          height: el.getBoundingClientRect().height, scroll: el.scrollWidth, width: el.clientWidth
        })));
        assert(rows.every(row => row.height >= 44 && row.scroll <= row.width + 1), 'Names wrap within 44px targets');
        for (const id of ['back', 'reset', 'list-toggle', 'affiliation-view']) {
          assert((await page.locator('#' + id).boundingBox()).height >= 44);
        }
      }
      async function open(id, name) {
        const target = content.locator(`.row-target[data-group="${id}"]`);
        if (size.width < 700) await target.tap(); else await target.click();
        await heading(name);
        assert(await content.locator('#group-heading').evaluate(el => el === document.activeElement), 'Drill-in focuses heading');
        await fits();
      }
      await heading('U.S. adults');
      assert.equal(await content.locator('.national-value').count(), 4);
      assert(await page.locator('#back').isDisabled());
      await open('christian', 'Christian');
      await open('protestant', 'Protestant');
      await open('baptist', 'Baptist');
      assert.match(await content.locator('.selected-estimate').textContent(), /12.0% of U.S. adults/);
      assert.equal(await content.locator('[data-record="sbc"] .national-value').textContent(), '4.4% of U.S. adults');
      assert.equal(await content.locator('[data-record="pnbc"] .national-value').textContent(), '<0.3% of U.S. adults');
      assert.equal(await content.locator('[data-record="pnbc"] .bar').count(), 0);
      assert.equal(await content.locator('[data-record="sbc"] .row-target').count(), 0);
      assert.match(await content.locator('.coverage').textContent(), /selected reported affiliations/);
      await content.locator('[data-record="pnbc"] summary').click();
      assert.match(await content.locator('[data-record="pnbc"] .row-source').textContent(), /Printed p. 30/);
      assert(await content.locator('[data-record="pnbc"] a[href$=".pdf"]').isVisible());
      const chartRows = await content.locator('.estimate-row').evaluateAll(rows => rows.map(row => ({
        id: row.dataset.record, value: row.querySelector('.national-value').textContent,
        name: row.querySelector('.row-label').textContent, source: row.querySelector('.row-source').textContent
      })));
      await page.locator('#list-toggle').click();
      const listRows = await content.locator('.estimate-row').evaluateAll(rows => rows.map(row => ({
        id: row.dataset.record, value: row.querySelector('.national-value').textContent,
        name: row.querySelector('.row-label').textContent, source: row.querySelector('.row-source').textContent
      })));
      assert.deepEqual(listRows, chartRows);
      assert.equal(await content.locator('.bar:visible').count(), 0);
      assert(await page.locator('#list-toggle').evaluate(el => el === document.activeElement));
      await page.reload();
      assert.equal(await page.locator('#list-toggle').getAttribute('aria-pressed'), 'true');
      await page.locator('#list-toggle').click();
      await page.locator('#back').click();
      await heading('Protestant');
      assert(await content.locator('[data-group="baptist"].row-target').evaluate(el => el === document.activeElement));
      await open('presbyterian', 'Presbyterian');
      assert.equal(await content.locator('[data-record="pcusa"] .national-value').textContent(), '0.8% of U.S. adults');
      assert.equal(await content.locator('[data-record="pca"] .national-value').textContent(), '0.5% of U.S. adults');
      await page.screenshot({path: path.join(output, `us-affiliation-presbyterian-${size.width}.png`), fullPage: true});
      await page.locator('#affiliation-view').selectOption('traditions');
      await heading('Protestant');
      assert.equal(await content.locator('[data-record="mainline"] .national-value').textContent(), '11.5% of U.S. adults');
      assert.match(await content.locator('.precision-note').textContent(), /Mainline Protestant 11%/);
      await open('mainline', 'Mainline Protestant');
      await open('presbyterian-mainline', 'Presbyterian (mainline)');
      await page.reload();
      await heading('Presbyterian (mainline)');
      assert.match(page.url(), /view=traditions&group=presbyterian-mainline/);
      await page.screenshot({path: path.join(output, `us-affiliation-mainline-${size.width}.png`), fullPage: true});
      await page.locator('#back').click();
      await heading('Mainline Protestant');
      await page.goBack();
      await heading('Presbyterian (mainline)');
      await page.goForward();
      await heading('Mainline Protestant');
      await page.locator('#reset').click();
      await heading('U.S. adults');
      assert.equal(await page.locator('#affiliation-view').inputValue(), 'traditions');
      await page.goto(base + '/us-denominations/?view=families&group=pcusa');
      await page.locator('#affiliation-view').selectOption('traditions');
      await heading('Presbyterian Church (USA)');
      assert.match(await content.textContent(), /No published drill-down/);
      assert.match(await content.locator('.breadcrumbs').textContent(), /Mainline Protestant.*Presbyterian \(mainline\)/s);
      for (const [query, name] of [
        ['?view=traditions&group=baptist', 'Protestant'],
        ['?view=families&group=mainline', 'Protestant'],
        ['?view=bad&group=%3Cscript%3E', 'U.S. adults'],
        ['?view=families&group=baptist&group=christian', 'U.S. adults']
      ]) {
        await page.goto(base + '/us-denominations/' + query);
        await heading(name);
        assert.match(await page.locator('#route-status').textContent(), /corrected/);
      }
      await page.goto(base + '/us-denominations/?view=families&group=baptist');
      await fits();
      await page.screenshot({path: path.join(output, `us-affiliation-baptist-${size.width}.png`), fullPage: true});
      await page.getByRole('button', {name: 'Site menu', exact: true}).click();
      await page.getByRole('button', {name: 'Settings', exact: true}).click();
      await page.locator('input[value="ink"]').check();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'ink');
      await page.screenshot({path: path.join(output, `us-affiliation-ink-${size.width}.png`), fullPage: true});
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`Affiliation paths, values, history, lists, sources and layout ${size.width}px: passed`);
    }

    const page = await browser.newPage({viewport: {width: 1280, height: 960}});
    await page.goto(base + '/us-denominations/');
    const content = page.locator('#interactive-view');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Enter');
    async function tabTo(selector) {
      for (let i = 0; i < 80; i++) {
        if (await page.locator(selector).evaluate(el => el === document.activeElement)) return;
        await page.keyboard.press('Tab');
      }
      throw new Error('Keyboard could not reach ' + selector);
    }
    for (const id of ['christian', 'protestant', 'baptist']) {
      await tabTo(`#interactive-view .row-target[data-group="${id}"]`);
      assert(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'));
      await page.keyboard.press('Enter');
      assert(await content.locator('#group-heading').evaluate(el => el === document.activeElement));
    }
    await page.keyboard.press('Shift+Tab');
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Protestant/);
    await page.keyboard.press('Enter');
    assert(await content.locator('.row-target[data-group="baptist"]').evaluate(el => el === document.activeElement));
    // A 1280px desktop browser at 200% page zoom has a 640px CSS layout viewport.
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setDeviceMetricsOverride', {width: 640, height: 480, deviceScaleFactor: 2, mobile: false});
    assert.equal(await page.evaluate(() => innerWidth), 640);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({path: path.join(output, 'us-affiliation-200-percent-layout.png'), fullPage: true});
    await page.close();

    const noJS = await browser.newContext({javaScriptEnabled: false, viewport: {width: 320, height: 568}});
    const staticPage = await noJS.newPage();
    await staticPage.goto(base + '/us-denominations/');
    assert(await staticPage.locator('#static-view').isVisible());
    assert(!await staticPage.locator('#route-controls').isVisible());
    assert(!await staticPage.locator('#interactive-view').isVisible());
    for (const label of ['Christian', 'Protestant', 'Baptist']) {
      const summary = staticPage.locator('#static-view > section').first().getByText(`Explore ${label} — published children`, {exact: true});
      await summary.click();
    }
    const baptist = staticPage.locator('#static-families-baptist');
    assert(await baptist.isVisible());
    assert.equal(await baptist.locator('[data-record="pnbc"] .national-value').textContent(), '<0.3% of U.S. adults');
    await baptist.locator('[data-record="pnbc"] summary').click();
    assert(await baptist.locator('[data-record="pnbc"] a[href$=".pdf"]').isVisible());
    assert.match(await baptist.locator('.source-context').textContent(), /Share of U.S. adults/);
    await staticPage.goto(base + '/us-denominations/?view=traditions&group=presbyterian-mainline#static-traditions-presbyterian-mainline');
    assert(await staticPage.locator('#static-traditions-presbyterian-mainline').isVisible(), 'No-JS fragment opens nested ancestors');
    assert(await staticPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await staticPage.screenshot({path: path.join(output, 'us-affiliation-no-js-320.png'), fullPage: true});
    await noJS.close();
    console.log('Keyboard-only drill/restore, 200% equivalent CSS layout, and no-JS nested sources: passed. Real screen-reader testing is not performed.');
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
