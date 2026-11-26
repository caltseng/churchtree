const {esc} = require('../html-escape.js');
const {domain} = require('../site.config.json');

function head({title, description, canonical, prefix = '../', themeScript = true}) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<meta name="application-name" content="Main Branch"><meta property="og:site_name" content="Main Branch">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/svg+xml" href="${esc(prefix)}assets/brand/logos/main-branch.svg">
<link rel="stylesheet" href="${esc(prefix)}theme.css">${themeScript ? `<script src="${esc(prefix)}theme.js"></script>` : ''}
<link rel="stylesheet" href="${esc(prefix)}brand.css">`;
}

function brand({prefix = '../', tagline = false} = {}) {
  return `<a class="main-branch-brand" href="${esc(prefix)}" aria-label="Main Branch home"><img class="main-branch-symbol" src="${esc(prefix)}assets/brand/logos/main-branch.svg" width="44" height="44" alt=""><span class="main-branch-copy">Main Branch${tagline ? '<small>HISTORY · IDEAS · SOURCES</small>' : ''}</span></a>`;
}

function skipLink(target, label) {
  return `<a class="skip-link" href="#${esc(target)}">${esc(label)}</a>`;
}

// Content is trusted page-template markup; text and URLs use the escaping helper.
function header({className, content = '', prefix, tagline, brandHeading = false, skipTarget, skipLabel}) {
  const lockup = brand({prefix, tagline});
  return `${skipLink(skipTarget, skipLabel)}
<header class="${esc(className)}">${brandHeading ? `<h1>${lockup}</h1>` : lockup}${content}</header>`;
}

function footer({className, content, prefix, showBrand = false, id, tag = 'footer'}) {
  if (!['footer', 'div'].includes(tag)) throw new Error('Invalid footer element');
  return `<${tag}${className ? ` class="${esc(className)}"` : ''}${id ? ` id="${esc(id)}"` : ''}>${showBrand ? brand({prefix}) : ''}${content}</${tag}>`;
}

module.exports = {head, header, footer, skipLink, domain};
