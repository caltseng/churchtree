const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { collect, resolvePeriod, outputLocation } = require('./collect.cjs');
const { handoff, writeDemo, period } = require('./demo.cjs');

function fixture(t) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'contacts-synthetic-'));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  const input = handoff('email', 'email');
  const request = { schemaVersion: 1, dataClass: 'synthetic', period, output: path.join(folder, 'store'),
    sources: [{ source: 'email', account: input.account, connector: input.connector, mode: 'metadata-import', input: 'input.json' }] };
  function write() { fs.writeFileSync(path.join(folder, 'input.json'), JSON.stringify(input)); }
  function run() { write(); return collect(request, folder); }
  function state() { return JSON.parse(fs.readFileSync(path.join(request.output, 'collection.json'), 'utf8')); }
  return { folder, input, request, write, run, state };
}
const events = state => Object.values(state.records).filter(value => value.record.type === 'event');

test('all five synthetic sources persist metadata, not inferred cross-source people; repeated imports are idempotent', t => {
  const f = fixture(t);
  const demo = writeDemo(path.join(f.folder, 'demo'));
  const result = collect(demo.request, demo.folder);
  assert.equal(result.exitCode, 0);
  const file = JSON.parse(fs.readFileSync(result.file, 'utf8'));
  assert.equal(events(file).length, 4);
  assert.equal(result.manifest.unresolvedIdentityKeys.length, 5);
  assert.equal(result.manifest.identityMappingRevision, null);
  assert.equal(result.manifest.sources[0].coverage.kind, 'identity-snapshot');
  collect(demo.request, demo.folder);
  assert.equal(events(JSON.parse(fs.readFileSync(result.file, 'utf8'))).length, 4);
  const replayed = JSON.parse(fs.readFileSync(result.file, 'utf8'));
  assert.equal(replayed.history.length, 1);
  assert.equal(replayed.history[0].status, 'collected');
  assert.equal(replayed.history[0].sources.length, 5);
});

test('overlapping connectors reuse reviewed source/account IDs and retain both provenance locators', t => {
  const f = fixture(t);
  assert.equal(f.run().exitCode, 0);
  f.input.connector = 'second-metadata-export';
  f.request.sources[0].connector = f.input.connector;
  assert.equal(f.run().exitCode, 0);
  const rows = events(f.state());
  assert.equal(rows.length, 1);
  assert.equal(rows[0].provenance.length, 2);
  assert.ok(rows[0].provenance.every(item => item.inputDigest.length === 64));
});

test('pagination resumes at persisted cursor and rejects a changed interval', t => {
  const f = fixture(t);
  const next = structuredClone(f.input.pages[0]);
  next.cursor = 'page-2';
  next.events[0].id = 'message-2';
  f.input.pages[0].nextCursor = 'page-2';
  f.input.pages.push(next);
  f.request.maxPages = 1;
  let result = f.run();
  assert.equal(result.exitCode, 2);
  assert.equal(result.manifest.sources[0].nextCursor, 'page-2');
  assert.equal(events(f.state()).length, 1);
  f.request.resume = true;
  result = f.run();
  assert.equal(result.exitCode, 0);
  assert.equal(events(f.state()).length, 2);
  f.request.period = { ...period, preset: '30d' };
  result = f.run();
  assert.equal(result.exitCode, 2);
  assert.equal(result.manifest.sources[0].error.code, 'checkpoint_mismatch');
});

test('failed page leaves the previous page and cursor intact, and a repaired page can resume', t => {
  const f = fixture(t);
  const next = structuredClone(f.input.pages[0]);
  next.cursor = 'page-2';
  next.events[0].id = 'message-2';
  next.events[0].body = 'Synthetic body must never be persisted';
  f.input.pages[0].nextCursor = 'page-2';
  f.input.pages.push(next);
  let result = f.run();
  assert.equal(result.manifest.sources[0].status, 'failed');
  assert.equal(events(f.state()).length, 1);
  assert.equal(Object.values(f.state().checkpoints)[0].nextCursor, 'page-2');
  assert.ok(!fs.readFileSync(result.file, 'utf8').includes('Synthetic body'));
  delete next.events[0].body;
  f.request.resume = true;
  result = f.run();
  assert.equal(result.exitCode, 0);
  assert.equal(events(f.state()).length, 2);
});

test('group membership and broadcast recipient roles do not manufacture pairwise observations', t => {
  const f = fixture(t);
  const page = f.input.pages[0];
  page.threads[0].kind = 'group';
  for (const id of ['person-b', 'person-c']) {
    page.identities.push({ id, idKind: 'local', isSelf: false });
    page.memberships.push({ threadId: 'thread-1', identityId: id });
  }
  page.events[0].recipients.push({ identityId: 'person-b', role: 'cc' }, { identityId: 'person-c', role: 'bcc' });
  assert.equal(f.run().exitCode, 0);
  assert.equal(events(f.state()).length, 1);
  assert.deepEqual(events(f.state())[0].record.recipients.map(item => item.role).sort(), ['bcc', 'cc', 'to']);
  page.threads[0].id = 'new-direct';
  page.threads[0].kind = 'direct';
  page.memberships.forEach(item => { item.threadId = 'new-direct'; });
  page.events[0].threadId = 'new-direct';
  page.events[0].id = 'invalid-direct';
  assert.equal(f.run().manifest.sources[0].status, 'failed');
  assert.equal(events(f.state()).length, 1);
});

test('source errors, unknown history, unavailable sources, and successful sources remain distinct', t => {
  const f = fixture(t);
  f.input.coverage.completeness = 'unknown';
  f.input.coverage.start = null;
  f.input.coverage.end = null;
  f.input.errors = [{ code: 'history_unavailable', retryable: false }];
  f.request.sources.push({ source: 'messenger', account: 'fixture-messenger', connector: 'none',
    mode: 'unavailable', status: 'requires_setup', reason: 'No verified personal-inbox tool configured.' });
  f.request.sources.push({ source: 'whatsapp', account: 'fixture-whatsapp', connector: 'none',
    mode: 'unavailable', status: 'unsupported', reason: 'Native archive parsing is not implemented.' });
  const contacts = handoff('google-contacts', null);
  fs.writeFileSync(path.join(f.folder, 'contacts.json'), JSON.stringify(contacts));
  f.request.sources.push({ source: contacts.source, account: contacts.account, connector: contacts.connector,
    mode: 'metadata-import', input: 'contacts.json' });
  const result = f.run();
  assert.equal(result.exitCode, 2);
  assert.deepEqual(result.manifest.sources.map(source => source.status), ['partial', 'requires_setup', 'unsupported', 'collected']);
  assert.equal(result.manifest.sources[0].paginationComplete, true);
  assert.equal(result.manifest.sources[0].coverage.start, null);
  assert.equal(result.manifest.sources[0].upstreamErrors[0].code, 'history_unavailable');
  assert.equal(result.manifest.sources[0].observedOnly, true);
  assert.equal(events(f.state()).length, 1);
  f.input.pages[0].events[0].body = 'Synthetic rejected payload';
  const failed = f.run();
  assert.deepEqual(failed.manifest.sources.map(source => source.status), ['failed', 'requires_setup', 'unsupported', 'collected']);
});

test('verified empty pages differ from missing inputs and contact presence never creates activity', t => {
  const f = fixture(t);
  f.input.pages[0].events = [];
  assert.equal(f.run().exitCode, 0);
  assert.equal(events(f.state()).length, 0);
  f.request.sources[0].input = 'missing-file.json';
  const result = f.run();
  assert.equal(result.exitCode, 2);
  assert.equal(result.manifest.sources[0].error.code, 'input_unreadable');
  assert.equal(result.manifest.sources[0].coverage, null);
  const contact = handoff('google-contacts', null);
  contact.pages[0].events = [handoff('email', 'email').pages[0].events[0]];
  Object.assign(f.input, contact);
  Object.assign(f.request.sources[0], { source: contact.source, account: contact.account, connector: contact.connector, input: 'input.json' });
  assert.equal(f.run().manifest.sources[0].status, 'failed');
  assert.equal(events(f.state()).length, 0);
});

test('conflicting source events are not overwritten or advanced; edits stay separate event types', t => {
  const f = fixture(t);
  f.run();
  const original = events(f.state())[0].record;
  f.input.pages[0].events[0].timestamp = '2026-11-22T12:00:00Z';
  const result = f.run();
  assert.equal(result.manifest.sources[0].error.code, 'record_conflict');
  assert.deepEqual(events(f.state())[0].record, original);
  f.input.pages[0].events[0].id = 'edit-1';
  f.input.pages[0].events[0].eventType = 'edit';
  assert.equal(f.run().exitCode, 0);
  assert.equal(events(f.state()).filter(value => value.record.eventType === 'message').length, 1);
  assert.equal(events(f.state()).filter(value => value.record.eventType === 'edit').length, 1);
});

test('calendar presets, DST boundaries, 30 days, custom offsets and invalid dates are explicit', () => {
  const spring = resolvePeriod({ preset: '7d', timeZone: 'America/New_York', asOf: '2026-03-10T16:00:00Z' });
  assert.equal(spring.start, '2026-03-04T05:00:00.000Z');
  const fall = resolvePeriod({ preset: '7d', timeZone: 'America/New_York', asOf: '2026-11-03T17:00:00Z' });
  assert.equal(fall.start, '2026-10-28T04:00:00.000Z');
  assert.equal(resolvePeriod({ ...period, preset: '30d' }).start, '2026-10-26T07:00:00.000Z');
  const custom = resolvePeriod({ preset: 'custom', timeZone: 'America/Los_Angeles', asOf: period.asOf,
    start: '2026-11-01T01:30:00-07:00', end: '2026-11-01T01:30:00-08:00' });
  assert.equal(Date.parse(custom.end) - Date.parse(custom.start), 3600000);
  assert.equal(custom.bounds, '[start,end)');
  assert.throws(() => resolvePeriod({ ...period, timeZone: 'not/a-zone' }), /IANA/);
  assert.throws(() => resolvePeriod({ ...period, asOf: '2026-02-30T00:00:00Z' }), /calendar date/);
});

test('unsafe outputs and concurrent writers fail before changing stored records', t => {
  const f = fixture(t);
  assert.throws(() => outputLocation(path.resolve(__dirname, '..', '..', 'assets', 'contacts')), /only under/);
  assert.throws(() => outputLocation(path.resolve(__dirname, '..', '..', 'docs')), /only under/);
  f.run();
  const before = fs.readFileSync(path.join(f.request.output, 'collection.json'), 'utf8');
  fs.writeFileSync(path.join(f.request.output, 'collection.lock'), '');
  assert.throws(f.run, /locked/);
  assert.equal(fs.readFileSync(path.join(f.request.output, 'collection.json'), 'utf8'), before);
});

test('CLI demo and request run without endpoint access, with exit 2 for partial and exit 1 for invalid arguments', t => {
  const f = fixture(t);
  const cli = path.join(__dirname, 'collect.cjs');
  const demo = spawnSync(process.execPath, [cli, '--demo', '--output', path.join(f.folder, 'cli-demo')], { encoding: 'utf8' });
  assert.equal(demo.status, 0, demo.stderr);
  assert.equal(JSON.parse(demo.stdout).dataClass, 'synthetic');
  assert.ok(!demo.stdout.includes('Synthetic person A'));
  const demoAgain = spawnSync(process.execPath, [cli, '--demo', '--output', path.join(f.folder, 'cli-demo')], { encoding: 'utf8' });
  assert.equal(demoAgain.status, 1);
  assert.match(demoAgain.stderr, /empty output directory/);
  f.request.sources = [{ source: 'email', account: 'fixture', connector: 'none', mode: 'unavailable',
    status: 'requires_setup', reason: 'No authorized email tool.' }];
  const requestFile = path.join(f.folder, 'request.json');
  fs.writeFileSync(requestFile, JSON.stringify(f.request));
  const partial = spawnSync(process.execPath, [cli, '--request', requestFile], { encoding: 'utf8' });
  assert.equal(partial.status, 2);
  assert.equal(JSON.parse(partial.stdout).sources[0].status, 'requires_setup');
  assert.equal(spawnSync(process.execPath, [cli, '--unknown'], { encoding: 'utf8' }).status, 1);
});

test('pagination gaps/cycles and out-of-snapshot observations fail explicitly', t => {
  const f = fixture(t);
  f.input.pages[0].nextCursor = 'cycle';
  const next = structuredClone(f.input.pages[0]);
  next.cursor = 'cycle';
  f.input.pages.push(next);
  let result = f.run();
  assert.equal(result.manifest.sources[0].error.code, 'invalid_input');
  assert.equal(events(f.state()).length, 1);
  f.input.pages = [structuredClone(handoff('email', 'email').pages[0])];
  f.input.pages[0].events[0].timestamp = '2026-11-25T00:00:00Z';
  result = f.run();
  assert.equal(result.manifest.sources[0].status, 'failed');
  assert.equal(events(f.state()).length, 1);
});
