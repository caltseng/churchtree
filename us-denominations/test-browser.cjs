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
      const context = await browser.newContext({viewport: size, isMobile: size.width < 700, hasTouch: size.width < 700, reducedMotion: 'reduce'});
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
      async function chartSnapshot() {
        return page.evaluate(() => {
          const viewport = document.querySelector('.chart-viewport'), chart = viewport.firstElementChild;
          return {scale: Number(chart.style.zoom), left: viewport.scrollLeft, top: viewport.scrollTop,
            width: chart.getBoundingClientRect().width, pageScale: visualViewport.scale};
        });
      }
      const viewport = content.locator('.chart-viewport');
      await viewport.scrollIntoViewIfNeeded();
      const initialChart = await chartSnapshot();
      if (size.width < 700) {
        const client = await context.newCDPSession(page);
        async function gesture(start, end) {
          await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: start});
          for (let i = 1; i <= 12; i++) {
            await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: start.map((point, index) => ({
              id: index, x: point.x + (end[index].x - point.x) * i / 12,
              y: point.y + (end[index].y - point.y) * i / 12
            }))});
            await page.waitForTimeout(16);
          }
          await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
        }
        const box = await viewport.boundingBox();
        const x = box.x + box.width / 2;
        const y = (Math.max(15, box.y) + Math.min(size.height - 15, box.y + box.height)) / 2;
        const start = [{id: 0, x: x - 25, y}, {id: 1, x: x + 25, y}];
        const end = [{id: 0, x: x - 55, y}, {id: 1, x: x + 55, y}];
        await gesture(start, end);
        const pinched = await chartSnapshot();
        assert(pinched.width > initialChart.width * 1.8, 'Real pinch enlarges actual chart geometry');
        assert.equal(pinched.pageScale, initialChart.pageScale, 'Chart pinch never zooms the webpage');
        assert(Math.abs((pinched.left + box.width / 2) / pinched.scale - box.width / 2) < 4,
          'Pinch anchors the chart midpoint');
        assert.equal(new URL(page.url()).searchParams.get('group'), 'us-adults', 'Pinch never drills in');
        await gesture([{id: 0, x, y}], [{id: 0, x: x - 50, y: y - 40}]);
        const panned = await chartSnapshot();
        assert(panned.left > pinched.left + 30 && panned.top > pinched.top + 20, 'Real drag pans both axes');
        await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: end});
        await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: [end[0]]});
        assert.equal((await chartSnapshot()).scale, panned.scale, 'Finger transition does not jump zoom');
        await client.send('Input.dispatchTouchEvent', {type: 'touchCancel', touchPoints: []});
        await gesture(end, start);
        assert((await chartSnapshot()).scale < panned.scale * .7, 'Reverse pinch zooms out');
        for (let i = 0; i < 3; i++) await gesture(start, end);
        assert.equal((await chartSnapshot()).scale, 4, 'Pinch upper bound');
        for (let i = 0; i < 4; i++) await gesture(end, start);
        assert.equal((await chartSnapshot()).scale, 1, 'Pinch lower bound');
        await page.waitForTimeout(450);
        await page.screenshot({path: path.join(output, `us-chart-gestures-${size.width}.png`), fullPage: true});
        await page.reload();
      } else {
        await viewport.focus();
        await page.keyboard.press('+');
        assert((await chartSnapshot()).width > initialChart.width * 1.2, 'Keyboard zoom enlarges geometry');
        await page.keyboard.press('ArrowRight');
        assert((await chartSnapshot()).left > 0, 'Keyboard pans chart');
        const box = await viewport.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + 80);
        await page.keyboard.down('Control');
        await page.mouse.wheel(0, -250);
        await page.keyboard.up('Control');
        assert((await chartSnapshot()).scale > 1.5, 'Ctrl+wheel zooms chart');
        await page.keyboard.press('0');
        assert.equal((await chartSnapshot()).scale, 1);
      }
      await page.goto(base + '/us-denominations/?view=families&group=baptist');
      await content.locator('[data-record="sbc"] summary').click();
      await page.getByRole('button', {name: 'Zoom chart in', exact: true}).click();
      await content.locator('[data-record="sbc"] .bar-link').scrollIntoViewIfNeeded();
      const beforeDetail = await chartSnapshot();
      await content.locator('[data-record="sbc"] .bar-link').click();
      await heading('Southern Baptist Convention');
      assert.match(await content.textContent(), /No published drill-down/);
      assert(await content.locator('.row-source a').first().isVisible() === false, 'Sources start collapsed on leaf');
      await content.locator('.row-source summary').click();
      assert(await content.locator('.row-source a').first().isVisible(), 'Leaf detail exposes source link');
      await page.locator('#back').click();
      await heading('Baptist');
      const restoredChart = await chartSnapshot();
      assert.equal(restoredChart.scale, beforeDetail.scale, 'Back restores chart zoom');
      assert(Math.abs(restoredChart.left - beforeDetail.left) < 2 && Math.abs(restoredChart.top - beforeDetail.top) < 2,
        'Back restores chart scroll');
      assert(await content.locator('[data-record="sbc"] .row-source').getAttribute('open') !== null, 'Back restores source disclosure');
      await page.locator('#list-toggle').click();
      assert(await content.locator('.chart-controls').isHidden(), 'List removes zoom controls');
      await page.locator('#list-toggle').click();
      assert.equal((await chartSnapshot()).scale, beforeDetail.scale, 'List round trip preserves zoom');
      await page.getByRole('button', {name: 'Fit chart', exact: true}).click();
      assert.equal((await chartSnapshot()).scale, 1);
      await content.locator('[data-record="pnbc"] .row-detail').click();
      await heading('Progressive National Baptist Convention');
      assert.match(await content.locator('.selected-estimate').textContent(), /<0.3% of U.S. adults/);
      assert.equal(await content.locator('.bar').count(), 0, 'Threshold leaf never acquires a bar');
      await page.goto(base + '/us-denominations/');
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
      await page.locator('#affiliation-view').selectOption('attendance');
      await heading('Religious service attendance');
      assert(await content.locator('#group-heading').evaluate(el => el === document.activeElement));
      assert.equal(new URL(page.url()).search, '?view=attendance');
      assert(!await page.locator('#back').isVisible());
      assert(!await page.locator('#reset').isVisible());
      assert.equal(await content.locator('.breadcrumbs, .row-target, .selected-estimate').count(), 0);
      assert.equal(await content.locator('tbody tr').count(), 12);
      assert.match(await content.textContent(), /Adults in each religious group/);
      assert.match(await content.textContent(), /excluding weddings and funerals/);
      assert.match(await content.textContent(), /ATTENDPERRLS/);
      assert(!/ of U.S. adults/.test(await content.textContent()));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const attendanceRows = () => content.locator('tbody tr').evaluateAll(rows => rows.map(row => ({
        id: row.dataset.attendance, text: row.textContent
      })));
      const attendanceChart = await attendanceRows();
      for (const [id, value] of [['us-adults', 33], ['evangelical', 60], ['historically-black', 46], ['mainline', 34]]) {
        const row = content.locator(`[data-attendance="attendance-${id}"]`);
        assert.equal(await row.locator('td strong').textContent(), `${value}%`);
        const ratio = await row.locator('.bar-track').evaluate(track =>
          track.firstElementChild.getBoundingClientRect().width / (track.clientWidth - 1));
        assert(Math.abs(ratio - value / 100) < .01, 'Bar uses a fixed 100% scale');
      }
      await content.locator('[data-attendance="attendance-historically-black"] summary').click();
      assert(await content.locator('[data-attendance="attendance-historically-black"] a').isVisible());
      assert.match(await content.locator('[data-attendance="attendance-historically-black"] .row-source').textContent(), /Protestant > Historically Black/);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({path: path.join(output, `us-attendance-${size.width}.png`), fullPage: true});
      await page.locator('#list-toggle').click();
      assert.deepEqual(await attendanceRows(), attendanceChart);
      assert.equal(await content.locator('.bar:visible').count(), 0);
      assert(await page.locator('#list-toggle').evaluate(el => el === document.activeElement));
      await page.locator('#affiliation-view').selectOption('families');
      await heading('Baptist');
      assert.equal(await page.locator('#list-toggle').getAttribute('aria-pressed'), 'true');
      await page.goBack();
      await heading('Religious service attendance');
      await page.goBack();
      assert.equal(await page.locator('#list-toggle').getAttribute('aria-pressed'), 'false');
      await page.goForward();
      assert.equal(await page.locator('#list-toggle').getAttribute('aria-pressed'), 'true');
      await page.reload();
      await heading('Religious service attendance');
      await page.locator('#affiliation-view').selectOption('traditions');
      await heading('U.S. adults');
      await page.goto(base + '/us-denominations/?view=attendance&group=sbc');
      await heading('Religious service attendance');
      assert.match(await page.locator('#route-status').textContent(), /corrected/);
      assert.equal(new URL(page.url()).search, '?view=attendance');
      await page.goto(base + '/us-denominations/?view=families&group=baptist');
      await page.locator('#affiliation-view').selectOption('demographics');
      await heading('Affiliations within 18-29');
      assert.equal(new URL(page.url()).search, '?view=demographics&dimension=age&population=age-18-29');
      assert(!await page.locator('#back').isVisible() && !await page.locator('#reset').isVisible());
      assert.equal(await content.locator('.breadcrumbs, .row-target, .selected-estimate').count(), 0);
      for (const [dimension, populations] of [
        ['age', ['age-18-29', 'age-30-49', 'age-50-64', 'age-65-plus']],
        ['gender', ['men', 'women']], ['race-ethnicity', ['white', 'black', 'asian', 'hispanic']],
        ['education', ['college-graduate', 'less-than-college']]
      ]) {
        await page.locator('#demographic-dimension').selectOption(dimension);
        for (const population of populations) {
          await page.locator('#demographic-population').selectOption(population);
          assert.equal(await content.locator('tbody tr').count(), 3);
          assert.match(await content.textContent(), /within this population, not its share of a religion/);
          assert.match(await content.textContent(), /No intersectional combinations/);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Demographic content wraps');
          for (const id of ['demographic-dimension', 'demographic-population']) {
            assert((await page.locator('#' + id).boundingBox()).height >= 44);
          }
        }
      }
      await page.locator('#demographic-dimension').selectOption('race-ethnicity');
      await page.locator('#demographic-population').selectOption('asian');
      await heading('Affiliations within Asian (English-speaking, non-Hispanic, one race)');
      assert(await content.locator('#group-heading').evaluate(el => el === document.activeElement));
      assert.match(await content.textContent(), /English-speaking non-Hispanic U.S. adults reporting only Asian race/);
      assert.equal(await content.locator('[data-demographic="christian"] td strong').textContent(), '33%');
      const demographicRows = () => content.locator('tbody tr').evaluateAll(rows => rows.map(row => row.textContent));
      const demographicChart = await demographicRows();
      const barRatio = await content.locator('[data-demographic="other-religions"] .bar-track').evaluate(track =>
        track.firstElementChild.getBoundingClientRect().width / (track.clientWidth - 1));
      assert(Math.abs(barRatio - .32) < .01);
      await page.locator('#list-toggle').click();
      assert.deepEqual(await demographicRows(), demographicChart);
      assert.equal(await content.locator('.bar:visible').count(), 0);
      await content.locator('[data-demographic="christian"] summary').click();
      assert(await content.locator('[data-demographic="christian"] a').isVisible());
      assert.match(await content.locator('[data-demographic="christian"] .row-source').textContent(), /Among Asian adults > 2023-24/);
      await page.screenshot({path: path.join(output, `us-demographics-${size.width}.png`), fullPage: true});
      await page.locator('#affiliation-view').selectOption('attendance');
      await heading('Religious service attendance');
      assert(!await page.locator('#demographic-controls').isVisible());
      await page.locator('#affiliation-view').selectOption('families');
      await heading('Baptist');
      await page.locator('#affiliation-view').selectOption('demographics');
      await heading('Affiliations within Asian (English-speaking, non-Hispanic, one race)');
      assert.equal(await page.locator('#list-toggle').getAttribute('aria-pressed'), 'true');
      await page.reload();
      await heading('Affiliations within Asian (English-speaking, non-Hispanic, one race)');
      await page.locator('#demographic-dimension').selectOption('gender');
      await heading('Affiliations within Men');
      await page.goBack();
      await heading('Affiliations within Asian (English-speaking, non-Hispanic, one race)');
      await page.goForward();
      await heading('Affiliations within Men');
      await page.goto(base + '/us-denominations/?view=demographics&dimension=gender&population=asian&group=baptist');
      await heading('Affiliations within Men');
      assert.match(await page.locator('#route-status').textContent(), /corrected/);
      assert.equal(new URL(page.url()).search, '?view=demographics&dimension=gender&population=men');
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
    await page.goto(base + '/us-denominations/?view=families&group=baptist');
    await tabTo('#affiliation-view');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    assert.equal(await content.locator('#group-heading').textContent(), 'Religious service attendance');
    assert(await content.locator('#group-heading').evaluate(el => el === document.activeElement));
    await tabTo('#interactive-view [data-attendance="attendance-us-adults"] summary');
    assert(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'));
    await page.keyboard.press('Enter');
    await tabTo('#interactive-view [data-attendance="attendance-us-adults"] a');
    assert(await page.evaluate(() => document.activeElement.href.includes('pewresearch.org')));
    await page.goto(base + '/us-denominations/?view=demographics&dimension=age&population=age-18-29');
    await tabTo('#demographic-dimension');
    assert(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'));
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    assert.equal(await content.locator('#group-heading').textContent(), 'Affiliations within College graduate');
    await tabTo('#demographic-population');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    assert.equal(await content.locator('#group-heading').textContent(), 'Affiliations within Less than a college degree');
    await tabTo('#interactive-view [data-demographic="christian"] summary');
    await page.keyboard.press('Enter');
    await tabTo('#interactive-view [data-demographic="christian"] a');
    assert(await page.evaluate(() => document.activeElement.href.includes('pewresearch.org')));
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
    await staticPage.goto(base + '/us-denominations/?view=attendance#static-attendance');
    const attendance = staticPage.locator('#static-attendance');
    assert(await attendance.isVisible());
    assert.equal(await attendance.locator('tbody tr').count(), 12);
    assert.equal(await attendance.locator('[data-attendance="attendance-historically-black"] td strong').textContent(), '46%');
    await attendance.locator('[data-attendance="attendance-us-adults"] summary').click();
    assert(await attendance.locator('[data-attendance="attendance-us-adults"] a').isVisible());
    assert.match(await attendance.textContent(), /Adults in each religious group/);
    assert.match(await attendance.textContent(), /ATTENDPERRLS/);
    assert(await staticPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await staticPage.screenshot({path: path.join(output, 'us-attendance-no-js-320.png'), fullPage: true});
    await staticPage.goto(base + '/us-denominations/?view=demographics&dimension=race-ethnicity&population=asian#static-demographics-asian');
    const demographic = staticPage.locator('#static-demographics-asian');
    assert(await demographic.isVisible());
    if (!await demographic.evaluate(el => el.open)) await demographic.locator(':scope > summary').click();
    assert.equal(await demographic.locator('tbody tr').count(), 3);
    assert.match(await demographic.textContent(), /English-speaking non-Hispanic/);
    assert.match(await demographic.textContent(), /No intersectional combinations/);
    await demographic.locator('[data-demographic="christian"] summary').click();
    assert(await demographic.locator('[data-demographic="christian"] a').isVisible());
    assert(await staticPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await staticPage.screenshot({path: path.join(output, 'us-demographics-no-js-320.png'), fullPage: true});
    await noJS.close();
    console.log('Keyboard-only drill/restore, 200% equivalent CSS layout, and no-JS nested sources: passed. Real screen-reader testing is not performed.');
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
