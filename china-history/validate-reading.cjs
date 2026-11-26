const dates = require('../historical-dates.js');
module.exports = function validateReading(chapters, evidence, canonical) {
    const requireText = (row, keys) => {
        for (const key of keys) if (typeof row[key] !== 'string' || !row[key].trim()) throw new Error('Missing reading field: ' + key);
    };
    const unique = values => {
        if (new Set(values).size !== values.length) throw new Error('Duplicate reading identity');
    };
    unique(chapters.map(c => c.id));
    const ids = chapters.flatMap(c => c.events);
    unique(ids);
    if (JSON.stringify([...ids].sort()) !== JSON.stringify(canonical.events.map(e => e.id).sort()))
        throw new Error('Reading chapters must partition the canonical roster exactly');
    for (const chapter of chapters) {
        requireText(chapter, ['id', 'dates', 'title', 'summary', 'feature', 'gap']);
        if (!/^[a-z-]+$/.test(chapter.id) || !chapter.events.includes(chapter.feature)) throw new Error('Invalid reading chapter');
    }
    dates.period(evidence.reviewed);
    for (const source of Object.values(evidence.sources)) {
        requireText(source, ['title', 'publisher', 'published', 'url', 'context']);
        if (!/^https:\/\//.test(source.url)) throw new Error('Unsafe observation source URL');
    }
    unique(evidence.observations.map(o => o.id));
    for (const o of evidence.observations) {
        requireText(o, ['id', 'chapter', 'reference', 'magnitude', 'tradition', 'population', 'age', 'geography', 'measure', 'method', 'attribution', 'confidence']);
        if (!/^[A-Za-z0-9-]+$/.test(o.id) || !chapters.some(c => c.id === o.chapter)) throw new Error('Invalid observation identity/chapter');
        dates.period(o.reference);
        if (!['cumulative-flow', 'population-estimate', 'self-identification', 'belief'].includes(o.measure)) throw new Error('Invalid observation measure');
        requireText(o.uncertainty, ['type', 'note']);
        if (!['self-report', 'coverage-unknown', 'bounded-count', 'survey-limitations', 'source-spread', 'contested-estimate'].includes(o.uncertainty.type))
            throw new Error('Invalid observation uncertainty');
        if (o.uncertainty.type === 'source-spread' && !o.spread_group) throw new Error('Missing source spread group');
        if (!Array.isArray(o.citations) || !o.citations.length) throw new Error('Missing observation citations');
        for (const citation of o.citations) {
            requireText(citation, ['source_id', 'locator']);
            if (!evidence.sources[citation.source_id]) throw new Error('Unknown observation source');
        }
    }
    for (const group of new Set(evidence.observations.map(o => o.spread_group).filter(Boolean))) {
        if (evidence.observations.filter(o => o.spread_group === group).length < 2) throw new Error('Source spread needs distinct observations');
    }
    return {chapters, evidence};
};
