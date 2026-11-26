# Public website and source privacy

The public site must not send visitors to this project's GitHub repository or
account Pages address. Use relative navigation and the custom `main-branch.com`
domain for canonical and sharing URLs. Keep legitimate historical citations and
required third-party license notices.

The artifact audit on 2026-11-14 found no project backlinks in page templates,
navigation, metadata, generated data, JavaScript, CSS, or SVG assets. No visible
page edits were needed. `verify-site.cjs`, run by the required build check, now
rejects project repository/account Pages references anywhere in the text artifact,
source map references, and `.map` files. Run its regression cases with
`node scripts/test-public-privacy.cjs`. Only the allowlisted `dist/` artifact is
published; development docs, build scripts and Git metadata stay outside it.

Repository privacy is a separate decision. A private repository can serve a public
Pages website with GitHub Pro or an eligible organization plan. GitHub Free only
supports Pages from public repositories. Private-repository branch protections
also require an eligible paid plan. Check plan eligibility and existing rules
before conversion; this change does not alter visibility, plan, DNS, or hosting.

Making source private does not hide downloaded HTML, CSS, JavaScript, public data,
assets, the hosting identity in DNS/HTTP, or copies and forks made while public.
Never place secrets or private research in the publishable artifact. Removing
backlinks reduces casual discovery; it does not provide anonymity or access control.

The China timeline publishes only `china-history/index.html`, `history.css`,
`controller.js` and `public-data.js`. Its canonical editorial input, H/C research
crosswalks, held-record ledger, template, validator and tests are not public files.
The approved projection contains original summaries, critical caveats, source
metadata and passage locators, not the staged research packet or copied media.
`npm run test:countries` checks this route-specific boundary as well as data isolation
from the denomination explorer.

The Cambodia route adds only `cambodia-history/index.html` and `public-data.js`
to this explicit allowlist, reusing China's public controller/CSS. Its seven-file
research packet, editorial data, KH crosswalks, held ledger, template, builders
and tests remain outside the artifact. `npm run test:countries` checks projection,
research roster dispositions, citation links, no-JS fallback and data isolation.
The generated `global-church/index.html` chooser is also explicitly public;
the country registry does not recursively expose country folders.

Thailand likewise adds only `thailand-history/index.html` and `public-data.js`,
sharing the same renderer/assets. Its seven research documents, H/C crosswalks,
four held rows, downloaded research sources and builder/test inputs remain
outside `dist/`. `npm run test:countries` checks complete research-roster accounting,
claim locators, public projection and source-linked fallback, alongside
desktop, mobile portrait and short-landscape interactions.

Official references: [Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[protected branch availability](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility).
