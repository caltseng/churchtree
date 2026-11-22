const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const repo = path.resolve(__dirname, '..');
const root = path.resolve(repo, process.env.CHURCHTREE_TEST_ROOT || 'dist');
const server = require('./test-server.cjs')(root);
const books = [
  ['wsc', 'Westminster Shorter Catechism', 107],
  ['wlc', 'Westminster Larger Catechism', 196],
];

async function run() {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const channel = process.env.PLAYWRIGHT_CHANNEL || 'msedge';
    browser = await chromium.launch(channel === 'chromium' ? {} : { channel });
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 640 } });

    for (const [route, title, count] of books) {
      const source = JSON.parse(fs.readFileSync(path.join(repo, route, 'questions.json'), 'utf8'));
      assert.equal(source.length, count, title);
      await page.goto(base + '/');
      await page.locator('.tool-card[data-id="' + route + '"]').click();
      assert.equal(page.url(), base + '/' + route + '/');
      assert.equal(await page.locator('h1').textContent(), title);
      const actual = await page.locator('article').evaluateAll(articles => articles.map(article => ({
        id: article.id,
        question: article.querySelector('h2').textContent,
        answer: article.querySelector('p').textContent,
        permalink: article.querySelector('h2 a').getAttribute('href'),
      })));
      assert.deepEqual(actual, source.map(({ question, answer }, index) => ({
        id: 'q-' + (index + 1),
        question: 'Q. ' + (index + 1) + '. ' + question,
        answer: 'A. ' + answer,
        permalink: '#q-' + (index + 1),
      })));
      assert.equal(await page.locator('section#reading article').count(), count);
      assert(await page.locator('.main-branch-symbol').evaluate(img => img.complete && img.naturalWidth > 0));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.getByRole('link', { name: '1–10', exact: true }).click();
      assert.equal(new URL(page.url()).hash, '#q-1');
      await page.goto(base + '/' + route + '/#q-' + count);
      await page.reload();
      assert.equal(await page.locator(':target').getAttribute('id'), 'q-' + count);
      assert(await page.locator(':target').evaluate(element => {
        const top = element.getBoundingClientRect().top;
        return top >= 0 && top < innerHeight;
      }));
      const other = books.find(([candidate]) => candidate !== route);
      await page.getByRole('link', { name: other[1], exact: true }).click();
      assert.equal(page.url(), base + '/' + other[0] + '/');
      await page.getByRole('link', { name: 'Westminster Confession of Faith', exact: true }).click();
      assert.equal(page.url(), base + '/wcf/');
      await page.getByRole('link', { name: title, exact: true }).click();
      assert.equal(page.url(), base + '/' + route + '/');
      console.log(title + ' routes, text, anchors and navigation pass with JavaScript disabled.');
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '/wlc/#q-109');
    assert(await page.locator('#q-109').isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally {
    await browser?.close();
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
