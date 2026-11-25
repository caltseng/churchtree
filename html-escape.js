(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.HTMLEscape = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
    'use strict';
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    function escapeHTML(characters, emptyNullish, value) {
        return String(emptyNullish ? value ?? '' : value).replace(characters, character => entities[character]);
    }
    return {
        esc: escapeHTML.bind(null, /[&<>"']/g, false),
        // Keep the historical reader's serialized HTML unchanged.
        escReader: escapeHTML.bind(null, /[&<"]/g, false),
        escNullable: escapeHTML.bind(null, /[&<>"']/g, true)
    };
});
