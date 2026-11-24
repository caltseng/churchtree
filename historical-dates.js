/* Calendar periods remain periods; plot coordinates never replace source dates. */
(function (root) {
    'use strict';
    function period(value) {
        const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
        if (!match) throw new Error('Invalid historical date: ' + value);
        const year = Number(match[1]), month = Number(match[2] || 1), day = Number(match[3] || 1);
        const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year < 100 || month < 1 || month > 12 || day < 1 || day > days[month - 1])
            throw new Error('Invalid calendar date: ' + value);
        const start = Date.UTC(year, month - 1, day);
        const end = match[3] ? start + 86400000 : match[2] ? Date.UTC(year, month, 1) : Date.UTC(year + 1, 0, 1);
        const coordinate = time => year + (time - Date.UTC(year, 0, 1)) / (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1));
        return {start, end, year: coordinate(start), lastYear: coordinate(end), precision: match[3] ? 'day' : match[2] ? 'month' : 'year'};
    }
    function bounds(date) {
        if (!date || !['point', 'duration', 'uncertain', 'unknown'].includes(date.kind))
            throw new Error('Invalid date kind');
        if (!date.basis?.trim()) throw new Error('Date basis required');
        if (date.kind === 'unknown') {
            if (date.start !== null || date.end !== null) throw new Error('Unknown date must have null bounds');
            return null;
        }
        const first = period(date.start), last = period(date.end);
        if (first.start > last.start || first.precision !== last.precision ||
            (date.kind === 'point' && date.start !== date.end))
            throw new Error('Inconsistent date bounds');
        return {start: first.year, end: last.lastYear, precision: first.precision};
    }
    function label(date) {
        if (date.kind === 'unknown') return 'Date unplaced';
        const trim = value => value.replace(/^0+/, '');
        const range = date.start === date.end ? trim(date.start) : trim(date.start) + ' to ' + trim(date.end);
        return (date.kind === 'uncertain' ? 'Approx. ' : '') + range;
    }
    const api = {period, bounds, label};
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.HistoricalDates = api;
})(globalThis);
