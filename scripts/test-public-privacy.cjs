const fs = require('fs'), path = require('path'), os = require('os'), assert = require('node:assert/strict');
const verify = require('./verify-public-privacy.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'main-branch-privacy-'));
try {
  const file = path.join(root, 'data.js');
  for (const url of ['https://github.com/caltseng/churchtree', '//github.com/caltseng/churchtree/issues', 'https://caltseng.github.io/churchtree/', 'https:\\/\\/github.com\\/caltseng\\/churchtree']) {
    fs.writeFileSync(file, '// ' + url);
    assert.throws(() => verify(root), /backlink must not be published/);
  }
  fs.writeFileSync(file, '// Historical source: https://github.com/other/source');
  assert.doesNotThrow(() => verify(root));
  fs.writeFileSync(file, '//# sourceMappingURL=data:application/json;base64,e30=');
  assert.throws(() => verify(root), /source map references/);
  fs.writeFileSync(file, '');
  fs.writeFileSync(path.join(root, 'app.js.map'), '{}');
  assert.throws(() => verify(root), /source maps must not/);
  console.log('Artifact privacy rejects project backlinks and source maps while preserving other citations.');
} finally { fs.rmSync(root, {recursive:true, force:true}); }
