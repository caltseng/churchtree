(() => {
    'use strict';
    const $ = id => document.getElementById(id), data = window.COUNTRY_HISTORY_DATA, dates = window.HistoricalDates;
    if (!data || !dates || !window.ChurchTimelineModel) {
        $('load-status').textContent = 'Interactive data could not load. The complete sourced text remains available below.';
        return;
    }
    const graphical = Boolean(window.d3 && window.renderChurchTimeline && window.renderHorizontalTimeline);
    const nodes = data.events.map(e => {
        const bounds = dates.bounds(e.date);
        return {...e, name: e.title, start_year: bounds?.start, interval_end: bounds?.end, date_kind: e.date.kind,
            tradition_family: data.lanes.find(l => l.id === e.lane_id).label};
    });
    const byId = new Map(nodes.map(n => [n.id, n]));
    const originals = new Map([...$('record-list').children].map(el => [el.id, el]));
    const chapters = data.reading?.chapters;
    let chapter = chapters?.[0];
    const dialog = $('record-dialog'), graph = $('graph');
    let control = null, orientation = 'vertical', mode = 'timeline', selected = null, range = null, trigger = null;
    let renderedQuery = '', resizeTimer;
    const normalize = value => value.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');
    function readQuery() {
        const query = new URLSearchParams(location.search);
        $('search').value = query.get('q') || '';
        $('lane').value = data.lanes.some(l => l.id === query.get('lane')) ? query.get('lane') : '';
        $('year-from').value = query.get('from') || '';
        $('year-to').value = query.get('to') || '';
        orientation = query.get('orientation') === 'horizontal' ? 'horizontal' : 'vertical';
        const view = query.get('view');
        const legacyTimeline = ['orientation', 'from', 'to', 'q', 'lane'].some(key => query.has(key));
        mode = view === 'text' || (!view && location.hash === '#record-list') ? 'text' : chapters && (view === 'era' || (!view && !legacyTimeline)) ? 'era' : graphical ? 'timeline' : 'text';
        if (chapters) {
            chapter = chapters.find(c => c.events.includes(location.hash.slice(1))) ||
                chapters.find(c => c.id === query.get('era')) || chapters[0];
            selected = byId.has(location.hash.slice(1)) ? location.hash.slice(1) : null;
        }
    }
    function updateQuery() {
        const url = new URL(location.href);
        if (mode !== 'text' && url.hash === '#record-list') url.hash = '';
        for (const [key, value] of Object.entries({
            q: $('search').value.trim(), lane: $('lane').value, from: $('year-from').value,
            to: $('year-to').value, orientation: orientation === 'horizontal' ? orientation : '',
            view: chapters ? mode : mode === 'text' ? mode : '', era: chapters ? chapter.id : ''
        })) {
            if (value) url.searchParams.set(key, value);
            else url.searchParams.delete(key);
        }
        history.replaceState(null, '', url);
        renderedQuery = location.search;
    }
    function period() {
        const a = $('year-from').value, b = $('year-to').value;
        if (!a && !b) return null;
        const from = a ? Number(a) : 100, to = b ? Number(b) : 2100;
        if ((a && !/^\d{3,4}$/.test(a)) || (b && !/^\d{3,4}$/.test(b)) ||
            from < 100 || to > 2100 || from > to)
            throw new Error('Use whole years from 100 to 2100, with From no later than To.');
        return [from, to + 1];
    }
    function filtered() {
        const q = normalize($('search').value.trim()), lane = $('lane').value, limits = period();
        return nodes.filter(n => (!lane || n.lane_id === lane) &&
            (!q || normalize([n.title, n.summary, n.caveat, ...n.aliases].join(' ')).includes(q)) &&
            (!limits || !Number.isFinite(n.start_year) || (n.interval_end > limits[0] && n.start_year < limits[1])));
    }
    const presentation = {
        clusterTitle: c => c.members.length === 1 ? c.members[0].title : `${c.members.length} ${c.members[0].tradition_family} records`,
        dateLabel: n => dates.label(n.date),
        intervalEnd: n => ['duration', 'uncertain'].includes(n.date_kind) ? n.interval_end : n.start_year,
        lanes: entries => {
            const families = data.lanes.filter(l => entries.some(n => n.lane_id === l.id));
            const laneOf = n => families.findIndex(l => l.id === n.lane_id);
            return {families: families.map(l => l.label), count: families.length, scopedBranch: false,
                isCatholic: () => false, laneOf, partition: n => n.lane_id};
        }
    };
    function showContent(content, heading, focus = true) {
        const target = mode === 'era' ? $('reading-selection') : matchMedia('(max-width:1099px)').matches ? $('dialog-content') : $('selection');
        target.replaceChildren(content);
        target.hidden = false;
        if (target === $('dialog-content')) {
            if (!dialog.open) dialog.showModal();
            $('back-to-timeline').focus();
        } else {
            const title = target.querySelector('h3') || heading;
            if (title && focus) { title.tabIndex = -1; title.focus({preventScroll: mode !== 'era'}); }
        }
    }
    function select(id, push = true, origin = document.activeElement, focus = true) {
        const node = byId.get(id);
        if (!node) {
            $('load-status').textContent = 'Unknown record link. Use Search or Text view to choose a historical episode.';
            return;
        }
        trigger = origin;
        selected = id;
        if (mode === 'era' && !chapter.events.includes(id)) {
            chapter = chapters.find(c => c.events.includes(id));
            draw();
        }
        if (push && location.hash !== '#' + id) {
            const url = new URL(location.href); url.hash = id;
            history.pushState(null, '', url);
        }
        const article = originals.get(id).cloneNode(true);
        article.removeAttribute('id');
        article.hidden = false;
        article.querySelector('h3 a').replaceWith(document.createTextNode(node.title));
        if (mode === 'text') {
            const original = originals.get(id);
            // A linked record outside current filters remains reachable without silently resetting them.
            if (original.hidden) showContent(article);
            else { original.scrollIntoView({block: 'start'}); original.focus({preventScroll: true}); }
        } else {
            if (mode === 'era' && !$('period-error').textContent && !filtered().some(n => n.id === id)) {
                const note = document.createElement('p');
                note.className = 'critical-note';
                note.textContent = 'Linked episode outside the current filters. Your filters have been preserved.';
                article.prepend(note);
            }
            showContent(article, null, focus);
        }
        if (mode === 'era') $('episodes').querySelectorAll('button').forEach(button =>
            button.setAttribute('aria-pressed', button.dataset.event === id));
        graph.querySelectorAll('.node').forEach(el => {
            el.classList.toggle('selected', (el.dataset.members || '').split(',').includes(id));
        });
    }
    function cluster(members, title) {
        trigger = document.activeElement;
        const section = document.createElement('section'), heading = document.createElement('h3');
        heading.textContent = title;
        const list = document.createElement('div'); list.className = 'cluster-members';
        for (const member of members) {
            const button = document.createElement('button');
            button.textContent = dates.label(member.date) + ' / ' + member.title;
            button.onclick = () => select(member.id, true, trigger);
            list.append(button);
        }
        section.append(heading, list);
        showContent(section, heading);
    }
    function draw(preserve = false) {
        let visible;
        try { visible = filtered(); $('period-error').textContent = ''; }
        catch (error) { $('period-error').textContent = error.message; return false; }
        if (preserve && control) range = control.snapshot().domain;
        control?.destroy(); control = null; graph.replaceChildren();
        const ids = new Set(visible.map(n => n.id));
        for (const [id, article] of originals) article.hidden = !ids.has(id);
        const gaps = visible.filter(n => n.review === 'gap').length;
        $('count').textContent = `${visible.length} records${gaps ? `, including ${gaps} unplaced research gaps` : ''}.`;
        $('timeline-panel').hidden = mode !== 'timeline';
        if (chapters) {
            $('reading-panel').hidden = mode !== 'era';
            if (mode === 'era' && dialog.open) dialog.close();
            if (mode === 'era') $('selection').hidden = true;
            $('reading-lane').value = $('lane').value;
            for (const [id, value] of [['era-view', 'era'], ['proportional-view', 'timeline'], ['sourced-view', 'text']])
                $(id).setAttribute('aria-pressed', mode === value);
            if (mode === 'era') drawReading(visible);
        }
        $('record-list').hidden = mode !== 'text';
        $('text-controls').hidden = mode !== 'text' || !graphical;
        $('vertical').setAttribute('aria-pressed', orientation === 'vertical');
        $('horizontal').setAttribute('aria-pressed', orientation === 'horizontal');
        if (mode === 'timeline') {
            const renderer = orientation === 'vertical' ? window.renderChurchTimeline : window.renderHorizontalTimeline;
            control = renderer({
                container: graph, entries: visible, edges: [], period: range || period(),
                presentation, onNode: id => select(id), onCluster: cluster,
                onRange: domain => {
                    $('visible-range').textContent = `${Math.floor(domain[0])}-${Math.ceil(domain[1])} CE`;
                }
            });
            if (!control) graph.textContent = 'No dated records match. Unplaced gaps remain in Text view.';
            if (selected) graph.querySelectorAll('.node').forEach(el =>
                el.classList.toggle('selected', (el.dataset.members || '').split(',').includes(selected)));
        }
        $('load-status').textContent = mode === 'era' ? 'Editorial chapters / sourced episodes / no institutional bridges inferred across gaps.' : graphical ?
            'Source-linked records / no institutional bridges are inferred across gaps.' :
            'D3 could not load. Search, filters and the complete sourced text remain available.';
        updateQuery();
        return true;
    }
    function drawReading(visible) {
        const index = chapters.indexOf(chapter), ids = new Set(visible.map(n => n.id));
        $('chapter-position').textContent = `Reading chapter ${index + 1} of ${chapters.length} / ${chapter.dates}`;
        $('chapter-title').textContent = chapter.title;
        $('chapter-summary').textContent = chapter.summary;
        $('previous-chapter').disabled = index === 0;
        $('next-chapter').disabled = index === chapters.length - 1;
        $('chapters').querySelectorAll('a').forEach(link => {
            if (link.dataset.chapter === chapter.id) link.setAttribute('aria-current', 'step');
            else link.removeAttribute('aria-current');
        });
        const events = chapter.events.map(id => byId.get(id)).filter(n => ids.has(n.id));
        $('episode-count').textContent = events.length ? `${events.length} episodes, including any unplaced gaps.` :
            'No episodes match in this chapter. Change the display lane, search or date filters.';
        $('episodes').replaceChildren(...events.map(n => {
            const button = document.createElement('button'), meta = document.createElement('span'), title = document.createElement('strong');
            button.dataset.event = n.id;
            button.setAttribute('aria-controls', 'reading-detail');
            meta.textContent = dates.label(n.date) + ' / ' + n.tradition_family;
            title.textContent = n.title;
            button.append(meta, title);
            button.onclick = () => select(n.id);
            return button;
        }));
        $('size-evidence').querySelectorAll('[data-size-chapter]').forEach(section =>
            section.hidden = section.dataset.sizeChapter !== chapter.id);
        const id = selected && chapter.events.includes(selected) ? selected :
            events.find(n => n.id === chapter.feature)?.id || events[0]?.id;
        if (id) select(id, false, null, false);
        else {
            selected = null;
            const message = document.createElement('p');
            message.textContent = 'No episode selected. Choose another chapter or change filters. Size evidence remains separately scoped.';
            $('reading-selection').replaceChildren(message);
        }
    }
    function changeChapter(next) {
        chapter = next; selected = null;
        const url = new URL(location.href);
        url.searchParams.set('era', chapter.id); url.hash = '';
        history.pushState(null, '', url);
        draw();
        $('chapter-title').focus();
        revealChapter();
    }
    function revealChapter() {
        const current = $('chapters').querySelector('[aria-current]');
        if (current) $('chapters').scrollLeft = current.offsetLeft - $('chapters').offsetLeft;
    }
    if (chapters) {
        $('reading-views').hidden = false;
        for (const [id, next] of [['era-view', 'era'], ['proportional-view', 'timeline'], ['sourced-view', 'text']]) $(id).onclick = () => {
            range = control?.snapshot().domain || range;
            mode = next === 'timeline' && !graphical ? 'text' : next;
            const url = new URL(location.href); url.searchParams.set('view', mode);
            history.pushState(null, '', url);
            draw();
            if (selected && location.hash) select(selected, false);
            else (mode === 'era' ? $('chapter-title') : mode === 'text' ? $('record-list') : graph).focus();
        };
        $('chapters').querySelectorAll('a').forEach(link => link.onclick = event => {
            event.preventDefault(); changeChapter(chapters.find(c => c.id === link.dataset.chapter));
        });
        $('previous-chapter').onclick = () => changeChapter(chapters[chapters.indexOf(chapter) - 1]);
        $('next-chapter').onclick = () => changeChapter(chapters[chapters.indexOf(chapter) + 1]);
        $('reading-lane').onchange = () => {
            $('lane').value = $('reading-lane').value; selected = null;
            const url = new URL(location.href);
            url.hash = ''; url.searchParams.set('lane', $('lane').value);
            history.pushState(null, '', url); draw();
        };
        $('back-to-episodes').onclick = () => {
            const button = [...$('episodes').querySelectorAll('button')].find(b => b.dataset.event === selected);
            (button || $('chapter-title')).focus();
        };
    }
    for (const [button, panel] of [['search-toggle', 'search-panel'], ['filters-toggle', 'filters-panel']]) {
        $(button).onclick = () => {
            const open = $(panel).hidden;
            $(panel).hidden = !open; $(button).setAttribute('aria-expanded', open);
            if (open) $(panel).querySelector('input,select').focus();
        };
        $(panel).addEventListener('keydown', event => {
            if (event.key === 'Escape') { $(panel).hidden = true; $(button).setAttribute('aria-expanded', 'false'); $(button).focus(); }
        });
    }
    $('info-toggle').onclick = () => {
        $('scope-info').open = !$('scope-info').open;
        $('info-toggle').setAttribute('aria-expanded', $('scope-info').open);
    };
    $('scope-info').ontoggle = () => $('info-toggle').setAttribute('aria-expanded', $('scope-info').open);
    $('search-panel').onsubmit = event => {
        event.preventDefault(); mode = 'text'; range = null; draw();
        $('record-list').focus({preventScroll: true});
    };
    $('filters-panel').onsubmit = event => { event.preventDefault(); range = null; draw(); };
    $('reset').onclick = () => {
        $('search').value = ''; $('lane').value = ''; $('year-from').value = ''; $('year-to').value = '';
        range = null; window.CHURCHTREE_HORIZONTAL_STATE = null; draw();
    };
    for (const next of ['vertical', 'horizontal']) $(next).onclick = () => {
        const domain = control?.snapshot().domain;
        orientation = next; range = domain || range;
        window.CHURCHTREE_HORIZONTAL_STATE = null; draw();
    };
    $('text-view').onclick = () => { range = control?.snapshot().domain || range; mode = 'text'; draw(); $('record-list').focus(); };
    document.querySelector('.skip-link').onclick = $('text-view').onclick;
    $('timeline-view').onclick = () => { mode = 'timeline'; draw(); graph.focus(); };
    $('zoom-in').onclick = () => control?.step(1.5);
    $('zoom-out').onclick = () => control?.step(1 / 1.5);
    $('earlier').onclick = () => control?.pan(-.4);
    $('later').onclick = () => control?.pan(.4);
    graph.onkeydown = event => {
        if (event.target !== graph) return;
        if (['+', '=', '-', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            if (['+', '=', '-'].includes(event.key)) control?.step(event.key === '-' ? 1 / 1.5 : 1.5);
            else if ((orientation === 'vertical' && ['ArrowUp', 'ArrowDown'].includes(event.key)) ||
                (orientation === 'horizontal' && ['ArrowLeft', 'ArrowRight'].includes(event.key)))
                control?.pan(['ArrowUp', 'ArrowLeft'].includes(event.key) ? -.2 : .2);
            else { graph.scrollLeft += event.key === 'ArrowLeft' ? -80 : event.key === 'ArrowRight' ? 80 : 0;
                graph.scrollTop += event.key === 'ArrowUp' ? -80 : event.key === 'ArrowDown' ? 80 : 0; }
        }
    };
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || !byId.has(link.hash.slice(1))) return;
        event.preventDefault(); select(link.hash.slice(1), true, link);
    });
    $('back-to-timeline').onclick = () => dialog.close();
    dialog.addEventListener('close', () => {
        if (mode === 'era') {
            const button = [...$('episodes').querySelectorAll('button')].find(b => b.dataset.event === selected);
            (button || $('chapter-title')).focus();
            return;
        }
        const fallback = selected && [...graph.querySelectorAll('.node')].find(el => (el.dataset.members || '').split(',').includes(selected));
        (trigger?.isConnected ? trigger : fallback || graph).focus({preventScroll: true});
    });
    function restore() {
        if (location.search !== renderedQuery) { readQuery(); range = null; if (!draw()) return; }
        if (location.hash === '#record-list') {
            range = control?.snapshot().domain || range;
            mode = 'text';
            if (draw()) $('record-list').focus();
            return;
        }
        const id = location.hash.slice(1);
        if (id) select(id, false);
        else {
            selected = null; if (dialog.open) dialog.close(); $('selection').hidden = true;
            if (mode === 'era') drawReading(filtered());
        }
        // History traversal can restore focus after popstate; focus the rendered Era context afterward.
        if (mode === 'era') requestAnimationFrame(() => {
            if (mode !== 'era') return;
            const target = id && byId.has(id) ? $('reading-selection').querySelector('h3') : $('chapter-title');
            if (target) { target.tabIndex = -1; target.focus(); }
        });
    }
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    const resize = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (mode === 'timeline') draw(true); }, 100);
    });
    resize.observe(graph);
    $('enhanced-actions').hidden = false;
    readQuery();
    if (!draw()) {
        // Keep malformed deep-link bounds visible for correction; never silently normalize them.
        $('record-list').hidden = false; $('filters-panel').hidden = false;
        $('filters-toggle').setAttribute('aria-expanded', 'true');
    }
    if (location.hash) {
        restore();
        if (mode === 'timeline') { control?.reveal(location.hash.slice(1)); window.scrollTo(0, 0); }
    }
    if (mode === 'era') revealChapter();
})();
