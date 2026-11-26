const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const createServer = require('./test-server.cjs');

module.exports = async function browserTest(root, run, options = {}) {
    const server = createServer(root);
    let browser;
    try {
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        const channel = process.env.PLAYWRIGHT_CHANNEL || 'msedge';
        browser = await chromium.launch({
            ...(channel === 'chromium' ? {} : {channel}),
            headless: true,
            ...options
        });
        await run({browser, server, base: `http://127.0.0.1:${server.address().port}`});
    } finally {
        try {
            await browser?.close();
        } finally {
            if (server.listening) await new Promise((resolve, reject) =>
                server.close(error => error ? reject(error) : resolve()));
        }
    }
};
