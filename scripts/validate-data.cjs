const fs = require('fs'), vm = require('vm');
const root = require('path').resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(process.argv[2] ? require('path').resolve(root, process.argv[2]) : root + '/data/data.js', 'utf8'), context);
const d = context.window.CHURCHTREE_DATA, errors = [];
for (const key of ['nodes', 'edges', 'events', 'sources', 'citations']) {
    const seen = new Set();
    for (const row of d[key]) {
        if (!row.id || seen.has(row.id))
            errors.push(`${key}: missing/duplicate ID ${row.id}`);
        seen.add(row.id);
    }
}
const ns = new Set(d.nodes.map(x => x.id)), ss = new Set(d.sources.map(x => x.id)), cs = new Set(d.citations.map(x => x.id));
for (const n of d.nodes) {
    if (!n.name || !Number.isFinite(n.start_year))
        errors.push(`Missing name or finite start year in ${n.id}`);
    for (const id of n.successor_ids || [])
        if (!ns.has(id))
            errors.push(`Unresolved successor ${id} in ${n.id}`);
}
for (const e of d.edges)
    if (!ns.has(e.from_id) || !ns.has(e.to_id))
        errors.push(`Dangling edge ${e.id}`);
for (const c of d.citations)
    if (!ss.has(c.source_id))
        errors.push(`Missing source ${c.source_id} in ${c.id}`);
function check(value, where, claimMap = false) {
    if (!value || typeof value !== 'object')
        return;
    for (const [key, v] of Object.entries(value)) {
        if ((key === 'citations' || claimMap) && Array.isArray(v)) {
            for (const id of v)
                if (!cs.has(id))
                    errors.push(`Unresolved citation ${id} in ${where}`);
        }
        else if (v && typeof v === 'object')
            check(v, where, key === 'profile_citations');
    }
}
for (const key of ['nodes', 'edges', 'events'])
    for (const row of d[key])
        check(row, row.id);
console.log(`${d.nodes.length} nodes, ${d.edges.length} edges, ${d.events.length} events, ${d.sources.length} sources, ${d.citations.length} citations`);
if (errors.length) {
    console.error([...new Set(errors)].join('\n'));
    process.exitCode = 1;
}
else
    console.log('All IDs, graph endpoints and citation references resolve.');
