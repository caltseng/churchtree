const fs = require('fs'), path = require('path');
module.exports = function verifyPublicPrivacy(root) {
  const errors = [];
  function visit(folder) {
    for (const name of fs.readdirSync(folder)) {
      const file = path.join(folder, name);
      if (fs.statSync(file).isDirectory()) { visit(file); continue; }
      const label = path.relative(root, file);
      if (/\.map$/i.test(file)) errors.push(label + ': source maps must not be published');
      if (!/\.(?:html|css|js|json|txt|svg|webmanifest)$/i.test(file)) continue;
      const text = fs.readFileSync(file, 'utf8').replace(/\\\//g, '/');
      if (/(?:github\.com\/caltseng\/churchtree(?:[^a-z0-9_.-]|$)|caltseng\.github\.io(?:[^a-z0-9_.-]|$))/i.test(text)) errors.push(label + ': project repository or account Pages backlink must not be published');
      if (/sourceMappingURL\s*=/i.test(text)) errors.push(label + ': source map references must not be published');
    }
  }
  visit(root);
  if (errors.length) throw new Error(errors.join('\n'));
};
