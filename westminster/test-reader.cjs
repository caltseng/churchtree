const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const browserTest = require('../scripts/browser-test.cjs');
const repoRoot = path.resolve(__dirname, '..');
const root = path.resolve(repoRoot, process.env.CHURCHTREE_TEST_ROOT || 'dist');
fs.mkdirSync(path.join(repoRoot, '.tmp/browser-check'), { recursive: true });
const readerPath = fs.existsSync(path.join(root, 'wcf/content.json')) ? 'wcf' : 'westminster';
const data = require(path.join(root, readerPath, 'content.json'));
const proofs = require(path.join(root, readerPath, 'scripture-proofs.json'));
assert.deepEqual(data.chapters.map(chapter => chapter.sections.length),
  [10,3,8,2,7,6,6,8,5,4,6,1,3,3,6,7,3,4,7,4,8,7,4,6,6,3,5,7,8,4,5,3,3]);
const expectedProofs = proofs.chapters.flatMap(chapter => chapter.sections)
  .flatMap(section => section.groups).flatMap(group => group.references);
for (const [sourceId, reference] of [
  ['iv.xvii.ii-p3.468', 'Psalms 145:3'],
  ['iv.xvii.ii-p7.644', 'Hebrews 9:15-17'],
  ['iv.xvii.ii-p9.734', '1 Corinthians 11:23-26'],
]) {
  assert.equal(expectedProofs.find(ref => ref.sourceId === sourceId)?.reference, reference,
    'Printed proof labels override malformed machine metadata');
}
const typography = page => page.locator('.reading-prose').first().evaluate(element => {
  const style = getComputedStyle(element);
  return [style.fontFamily, style.fontSize, style.lineHeight];
});
async function run() {
  return browserTest(root, async ({browser, base: baseURL}) => {
    const url = `${baseURL}/${readerPath}/index.html`;
    await require('./test-study.cjs')({ browser, baseURL, root, repoRoot });
    for (const size of [
      { width: 1440, height: 1000 }, { width: 390, height: 844 },
      { width: 320, height: 568 }, { width: 768, height: 1024 },
      { width: 844, height: 390 }, { width: 568, height: 320 },
    ]) {
      const page = await browser.newPage({ viewport: size });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      assert.equal(await page.locator('article:visible').count(), 1);
      assert.equal(await page.locator('.passage').count(), 172);
      assert.equal(await page.locator('#sources[open]').count(), 0, 'Global footer starts collapsed');
      assert.equal(await page.locator('article .pca-scope').count(), 0, 'No repeated global audit caveat');
      assert.equal(await page.locator('.section-index[open]').count(), 0, 'Chapter navigation is prioritized');
      assert.deepEqual(await page.locator('.scripture-proofs li>a:not(.proof-source)').evaluateAll(links =>
        links.map(link => ({ reference: link.textContent, url: link.href }))),
      expectedProofs.map(({ reference, url }) => ({ reference, url })));
      const readingStyle = await typography(page);
      assert.equal(readingStyle[1], '17px', 'Slightly smaller reading text');
      for (const route of ['wsc', 'wlc']) {
        await page.goto(`${baseURL}/${route}/`);
        assert.deepEqual(await typography(page), readingStyle, `${route} matches WCF typography`);
      }
      await page.goto(url);
      await page.locator('#chapter-select').selectOption('23');
      await page.waitForFunction(() => document.querySelector('#chapter-23 h2') === document.activeElement);
      assert.equal(await page.locator('#chapter-select').inputValue(), '23');
      const next = page.locator('#chapter-23 .chapter-nav-top a').last();
      assert(await next.evaluate(element => element.getBoundingClientRect().height >= 44));
      await next.click();
      await page.locator('#chapter-24').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#chapter-select').inputValue(), '24');
      await page.locator('#chapter-24 .chapter-nav-top a').first().click();
      await page.locator('#chapter-23').waitFor({ state: 'visible' });
      await page.locator('#chapter-23 .section-index>summary').click();
      await page.locator('#chapter-23 .section-links a[href="#section-23-3"]').click();
      await page.reload();
      assert(await page.locator('#section-23-3').isVisible());
      await page.locator('#proofs-23-3>summary').focus();
      await page.keyboard.press('Enter');
      assert(await page.locator('#proofs-23-3 li>a').first().isVisible(), 'Keyboard opens clickable proofs');
      await page.locator('#proofs-23-3 .proof-credit a').click();
      await page.locator('#sources[open]').waitFor({ state: 'visible' });
      assert(await page.locator('#sources').innerText().then(text => text.includes('bracketed American additions')));
      await page.goto(url + '#note-30-assembly-dissent');
      assert(await page.locator('#note-30-assembly-dissent').isVisible());
      await page.goto(url + '#proofs-31-2');
      assert(await page.locator('#proofs-31-2[open]').isVisible(), 'Proof permalink reveals the right chapter');
      assert.equal(await page.locator('#chapter-select').inputValue(), '31');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(repoRoot, `.tmp/browser-check/reader-${size.width}x${size.height}.png`) });
      await page.goto(url + '#chapter-33');
      await page.locator('#chapter-33 .chapter-nav-top a').last().click();
      await page.locator('#chapter-1').waitFor({ state: 'visible' });
      await page.goBack();
      await page.locator('#chapter-33').waitFor({ state: 'visible' });
      for (const theme of ['slate', 'ink']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Westminster ${size.width}x${size.height}: chapter navigation, proofs, typography and links passed`);
    }
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
    await page.goto(url + '#chapter-23');
    assert.equal(await page.locator('article:visible').count(), 33);
    await page.locator('#chapter-23 .chapter-nav-top a').last().click();
    assert.equal(new URL(page.url()).hash, '#chapter-24');
    await page.locator('#proofs-24-1>summary').click();
    assert(await page.locator('#proofs-24-1 li>a').first().isVisible());
    assert.deepEqual(await page.locator('.passage > p').allTextContents(), data.chapters.flatMap(chapter => chapter.sections));
    await page.close();
    console.log('No-JavaScript complete text, chapter navigation and Scripture proofs: passed');
  });
}
run().catch(error => { console.error(error); process.exitCode = 1; });
