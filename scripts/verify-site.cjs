const fs = require('fs'), path = require('path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../dist');
function files(folder) { return fs.readdirSync(folder).flatMap(name => { const file = path.join(folder, name); return fs.statSync(file).isDirectory() ? files(file) : [file]; }); }
const errors = [];
// Inspect generated data and comments as well as visible links. Historical
// citations and license notices for unrelated projects remain allowed.
require('./verify-public-privacy.cjs')(root);
for (const file of files(root).filter(n => n.endsWith('.html') || n.endsWith('.css'))) {
  const text = fs.readFileSync(file, 'utf8');
  const refs = file.endsWith('.html') ? [...text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(m => m[1]) : [...text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)].map(m => m[1]);
  for (const ref of refs) {
    if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    const target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(file), clean);
    if (!target.startsWith(root + path.sep) && target !== root) { errors.push('Path escapes site: ' + ref); continue; }
    if (!fs.existsSync(target)) errors.push(path.relative(root, file) + ': missing ' + ref);
  }
}
assert(!fs.existsSync(path.join(root, 'scripts')) && !fs.existsSync(path.join(root, 'docs')) && !fs.existsSync(path.join(root, '.git')), 'Development files must not be published');
assert.equal(fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim(), 'main-branch.com');
if (errors.length) throw new Error(errors.join('\n'));
console.log('Published asset references and artifact boundaries pass.');
