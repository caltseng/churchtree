/* Pure temporal clustering shared by both timeline orientations. Geometry is
 * supplied by the renderer; this module never changes historical dates. */
window.ChurchTimelineModel = {
    cluster(entries, scale, gap) {
        const families = new Map();
        for (const entry of entries) {
            const family = entry.tradition_family || 'Other';
            if (!families.has(family))
                families.set(family, []);
            families.get(family).push(entry);
        }
        const output = [];
        for (const [family, members] of families) {
            const sorted = [...members].sort((a, b) => a.start_year - b.start_year || a.id.localeCompare(b.id));
            const groups = [];
            for (const entry of sorted) {
                const last = groups.at(-1);
                if (!last || scale(entry.start_year) - scale(last[0].start_year) >= gap)
                    groups.push([entry]);
                else
                    last.push(entry);
            }
            const position = group => group.reduce((sum, entry) => sum + scale(entry.start_year), 0) / group.length;
            // Combining close centroids prevents boxes overlapping at cluster borders.
            for (let i = 1; i < groups.length;) {
                if (position(groups[i]) - position(groups[i - 1]) < gap) {
                    groups[i - 1].push(...groups[i]);
                    groups.splice(i, 1);
                    i = Math.max(1, i - 1);
                }
                else
                    i++;
            }
            for (const group of groups)
                output.push({
                    id: group.map(entry => entry.id).join('|'),
                    family, members: group, position: position(group),
                    min: group[0].start_year, max: group.at(-1).start_year,
                });
        }
        return output;
    },
    connections(clusters, edges) {
        const membership = new Map(), combined = new Map();
        for (const cluster of clusters)
            for (const member of cluster.members)
                membership.set(member.id, cluster);
        for (const edge of edges) {
            const a = membership.get(edge.from_id), b = membership.get(edge.to_id);
            if (!a || !b || a === b)
                continue;
            const key = a.id + '>' + b.id;
            if (!combined.has(key))
                combined.set(key, { a, b, edges: [] });
            combined.get(key).edges.push(edge);
        }
        return [...combined.values()];
    },
};
