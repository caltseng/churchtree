const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const output = path.join(repo, 'dist');
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const {spawnSync}=require('child_process');
for(const script of ['scripts/build-home.cjs','westminster/build.cjs','scripts/build-catechisms.cjs','us-denominations/build.cjs','china-history/build.cjs'])if(fs.existsSync(path.join(repo,script))){const result=spawnSync(process.execPath,[path.join(repo,script)],{stdio:'inherit'});if(result.status!==0)throw new Error('Page build failed: '+script);}
const config = readJSON(path.join(repo, 'site.config.json'));
// Delete only this build's fixed output directory; refuse a redirected target.
if (path.dirname(output) !== repo || path.basename(output) !== 'dist' || (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink())) throw new Error('Unsafe build output directory');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'data'), { recursive: true });
const data = { nodes: [], edges: [], events: [], sources: [], citations: [] };
for (const type of ['sources', 'citations']) data[type].push(...readJSON(path.join(repo, 'data/common', type + '.json')));
for (const set of fs.readdirSync(path.join(repo, 'data/sets')).sort()) {
  const folder = path.join(repo, 'data/sets', set);
  if (!fs.statSync(folder).isDirectory()) continue;
  for (const type of Object.keys(data)) {
    const file = path.join(folder, type + '.json');
    if (!fs.existsSync(file)) { if (['nodes', 'edges'].includes(type)) throw new Error('Missing ' + file); continue; }
    const rows = readJSON(file);
    if (!Array.isArray(rows)) throw new Error('Expected an array in ' + file);
    data[type].push(...rows);
  }
}
const bundle = '// Generated from local JSON sources. Do not edit by hand.\nwindow.CHURCHTREE_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(path.join(output, 'data/data.js'), bundle);
const allowed = new Set(config.publicExtensions);
function copyPublic(source, destination) {
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error('Symlinks cannot be published: ' + source);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(source).sort()) copyPublic(path.join(source, child), path.join(destination, child));
  } else if (allowed.has(path.extname(source))) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}
for (const name of fs.readdirSync(repo).sort()) if (fs.statSync(path.join(repo, name)).isFile() && ['.html', '.css', '.js', '.svg', '.png', '.ico', '.webmanifest'].includes(path.extname(name))) copyPublic(path.join(repo, name), path.join(output, name));
for (const name of config.publicDirectories) {
  if (!name || name.startsWith('.') || path.resolve(repo, name) !== path.join(repo, name) || name.includes('..')) throw new Error('Invalid public directory: ' + name);
  if (fs.existsSync(path.join(repo, name))) copyPublic(path.join(repo, name), path.join(output, name === 'westminster' ? 'wcf' : name));
}
// Route inputs and build tooling live beside the page but are never copied recursively.
for (const name of config.publicFiles || []) {
  const source = path.resolve(repo, name);
  if (!name || path.isAbsolute(name) || !source.startsWith(repo + path.sep) ||
      name.split(/[\\/]/).some(part => part === '..' || part.startsWith('.')) ||
      !fs.lstatSync(source).isFile() || !allowed.has(path.extname(source))) throw new Error('Invalid public file: ' + name);
  copyPublic(source, path.join(output, name));
}
// Preserve existing bookmarks, including chapter and section fragments.
fs.mkdirSync(path.join(output, 'westminster'), { recursive: true });
fs.writeFileSync(path.join(output, 'westminster/index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Westminster Confession · Main Branch</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="canonical" href="https://main-branch.com/wcf/"><script>location.replace('../wcf/'+location.search+location.hash);</script><noscript><meta http-equiv="refresh" content="0;url=../wcf/"></noscript></head><body><p>The reader has moved to <a href="../wcf/">the Westminster Confession</a>.</p></body></html>`);

fs.writeFileSync(path.join(output, 'CNAME'), config.domain + '\n');
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Built dist/: ${data.nodes.length} nodes; website assets only.`);
