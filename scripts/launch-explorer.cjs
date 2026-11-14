// Launch the explorer in a real, resizable desktop browser. Browser tests use
// fixed viewports separately; interactive sessions must follow the window.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage({ viewport: null });
    await page.goto(process.env.CHURCHTREE_URL || 'http://127.0.0.1:8765');
    await page.locator('[data-id="family:Presbyterian"]').waitFor();
    const dimensions = await page.evaluate(() => ({ window: innerWidth, page: document.body.getBoundingClientRect().width, workspace: document.querySelector('main').getBoundingClientRect().right }));
    console.log('Responsive desktop browser:', JSON.stringify(dimensions));
    if (Math.abs(dimensions.window - dimensions.workspace) > 2)
        throw new Error('Workspace does not fill the browser viewport');
    await page.screenshot({ path: '.tmp/browser-check/maximized.png' });
    console.log('Leave this window open to explore; its viewport follows window resizing.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
