const fs = require('node:fs');
const path = require('node:path');

const period = { preset: '7d', timeZone: 'America/Los_Angeles', asOf: '2026-11-24T20:00:00Z' };
function handoff(source, channel) {
  const contact = source === 'google-contacts';
  return {
    schemaVersion: 1, dataClass: 'synthetic', source, account: 'fixture-account', connector: 'synthetic-handoff',
    coverage: { start: contact ? null : '2026-11-01T00:00:00Z', end: contact ? null : period.asOf,
      completeness: 'complete', basis: 'Synthetic fixture only; not endpoint access or real history.' },
    pages: [{
      cursor: null, nextCursor: null, retrievedAt: period.asOf,
      identities: [
        { id: 'self', idKind: 'local', displayName: 'Synthetic self', isSelf: true },
        { id: 'person-a', idKind: 'local', displayName: 'Synthetic person A', isSelf: false }
      ],
      threads: contact ? [] : [{ id: 'thread-1', idKind: 'local', kind: 'direct' }],
      memberships: contact ? [] : [{ threadId: 'thread-1', identityId: 'self' }, { threadId: 'thread-1', identityId: 'person-a' }],
      events: contact ? [] : [{ id: 'message-1', idKind: 'local', eventType: 'message',
        threadId: 'thread-1', senderId: 'person-a', timestamp: '2026-11-23T12:00:00Z',
        channel, recipients: [{ identityId: 'self', role: channel === 'email' ? 'to' : 'recipient' }], classification: 'interpersonal' }]
    }]
  };
}
function writeDemo(folder) {
  fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
  if (fs.readdirSync(folder).length > 0) throw new Error('Demo requires an empty output directory; choose a fresh directory.');
  const sources = [];
  for (const [source, channel] of [['google-contacts', null], ['email', 'email'], ['text-messages', 'sms'], ['messenger', 'messenger'], ['whatsapp', 'whatsapp']]) {
    const input = `${source}.synthetic.json`;
    const file = path.join(folder, input);
    if (fs.existsSync(file)) throw new Error('Demo refuses to overwrite an existing input; choose a fresh directory.');
    fs.writeFileSync(file, JSON.stringify(handoff(source, channel), null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    sources.push({ source, account: 'fixture-account', connector: 'synthetic-handoff', mode: 'metadata-import', input });
  }
  const request = { schemaVersion: 1, dataClass: 'synthetic', period, output: '.', resume: false, sources };
  const requestFile = path.join(folder, 'request.synthetic.json');
  fs.writeFileSync(requestFile, JSON.stringify(request, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return { request, folder };
}

module.exports = { handoff, writeDemo, period };
