/* Graph selection is independent of SVG rendering so a future renderer can reuse it. */
(() => {
    'use strict';
    const d = window.CHURCHTREE_DATA, $ = id => document.getElementById(id);
    if (!d || !window.d3) {
        $('graph').textContent = 'Unable to load graph data or D3. Check your connection and rebuild data/data.js.';
        return;
    }
    const nodes = new Map(d.nodes.map(n => [n.id, n])), sources = new Map(d.sources.map(s => [s.id, s])), citations = new Map(d.citations.map(c => [c.id, c]));
    const families = [...new Set(d.nodes.map(n => n.tradition_family || 'Other'))].sort();
    let level = 0, family = '', selected = null, focus = null, layout = 'timeline', period = null, timelineControl = null, lastTimeline = 'timeline';
    let graphControl=null,graphViewKey='';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const label = n => n.short_label || n.name;
    const searchInput = $('search'), searchResults = $('results'), searchStatus = $('search-status');
    const searchMore = $('search-more');
    const searchPageSize = 12;
    const normalizeSearch = value => String(value ?? '').toLowerCase().normalize('NFKD')
        .replace(/\p{M}/gu, '').replace(/['’‘]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const searchEntries = Array.from(nodes.values(), node => ({
        node,
        name: normalizeSearch(node.name),
        terms: [node.short_label, ...(node.aliases || []), node.id].map(normalizeSearch).filter(Boolean)
    }));
    families.forEach(f => {
        const o = document.createElement('option');
        o.value = f;
        o.textContent = f;
        $('branch').append(o);
    });
    function ancestors(id) {
        const seen = new Set([id]), todo = [id];
        while (todo.length) {
            const next = todo.pop();
            d.edges.filter(e => e.to_id === next).forEach(e => {
                if (!seen.has(e.from_id)) {
                    seen.add(e.from_id);
                    todo.push(e.from_id);
                }
            });
        }
        return seen;
    }
    function scopeNodes() {
        return d.nodes.filter(n => focus ? focus.has(n.id) : !family || (n.tradition_family || 'Other') === family);
    }
    function evidence(ids) {
        const unique = [...new Set(ids || [])];
        if (!unique.length)
            return '<p>No claim-linked citations recorded for this entry.</p>';
        return unique.map(id => {
            const c = citations.get(id), s = sources.get(c?.source_id);
            if (!c || !s)
                return `<p>Evidence unavailable: ${esc(id)}</p>`;
            let url;
            try {
                const u = new URL(s.url);
                if (['https:', 'http:'].includes(u.protocol))
                    url = u.href;
            }
            catch {
            }
            return `<div class="source">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>` : esc(s.title)}${c.note ? `<p>${esc(c.note)}</p>` : ''}<div>${esc(c.locator || '')}</div><small>${esc(s.kind || 'Source')} · accessed ${esc(c.accessed || 'not recorded')}</small></div>`;
        }).join('');
    }
    function list(title, items) {
        return items?.length ? `<h3>${title}</h3><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
    }
    function safeLink(url) {
        try {
            const u = new URL(url);
            return ['http:', 'https:'].includes(u.protocol) ? u.href : null;
        }
        catch {
            return null;
        }
    }
    function people(items) {
        return items?.length ? '<h3>Key people</h3>' + items.map(person => {
            if (typeof person === 'string')
                return '<p>' + esc(person) + '</p>';
            const url = safeLink(person.url);
            return '<div class="source"><strong>' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(person.name) + '</a>' : esc(person.name)) + '</strong><p>' + esc(person.role || '') + '</p><p>' + esc(person.summary || '') + '</p>' + evidence(person.citations) + '</div>';
        }).join('') : '';
    }
    function reading(items) {
        return items?.length ? '<h3>Read more</h3>' + items.map(x => {
            const url = safeLink(x.url);
            return '<div class="source">' + (url ? '<a target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + esc(x.title) + '</a>' : esc(x.title)) + '<p>' + esc(x.snippet || '') + '</p></div>';
        }).join('') : '';
    }
    function documents(items) {
        return items?.length ? '<h3>Key documents and confessions</h3>' + items.map(x => {
            let url;
            try {
                const u = new URL(x.url);
                if (['http:', 'https:'].includes(u.protocol))
                    url = u.href;
            }
            catch {
            }
            return '<div class="source"><strong>' + (url ? '<a target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + esc(x.title) + '</a>' : esc(x.title)) + '</strong> ' + esc(x.year || '') + '<p>' + esc(x.significance || '') + '</p>' + evidence(x.citations) + '</div>';
        }).join('') : '';
    }
    function successors(n) {
        const ids = [...new Set([...(n.successor_ids || []), ...(n.end_year || ['merged', 'dissolved', 'inactive', 'defunct', 'historical'].includes(n.current_status) ? d.edges.filter(e => e.from_id === n.id && ['merge', 'continuation'].includes(e.type)).map(e => e.to_id) : [])])].filter(id => nodes.has(id));
        return ids.length ? '<h3>Continue to successors</h3>' + ids.map(id => '<button class="relationship successor" data-successor="' + esc(id) + '">' + esc(nodes.get(id).name) + ' →</button>').join('') : '';
    }
    function lifespan(node) {
        const start = node.start_year ?? 'Unknown origin';
        if (Number.isFinite(node.end_year)) return start + '–' + node.end_year;
        if (node.current_status === 'active') return start + '–present';
        return start + '–end unknown';
    }
    function showNode(id) {
        const n = nodes.get(id);
        selected = id;
        const relationships = d.edges.filter(e => e.from_id === id || e.to_id === id);
        $('details').innerHTML = `<span class="badge">${esc(n.kind || 'Historical body')} · ${esc(lifespan(n))}</span><h2>${esc(n.name)}</h2><p>${esc(n.summary || n.notes || 'A detailed summary has not yet been recorded.')}</p><button id="ancestry">Trace ancestry</button><h3>Identity</h3><p>${[n.tradition_family, n.region, n.ecclesial_orientation, n.current_status].filter(Boolean).map(esc).join(' · ')}</p><h3>Why it formed</h3><p>${esc(n.formation_narrative || 'The causes and circumstances of formation have not yet been fully documented.')}</p><h3>What happened to it</h3><p>${esc(n.ending_narrative || (n.current_status === 'active' ? 'Recorded as active. Its later development has not yet been fully documented.' : 'Its ending or continuation has not yet been fully documented.'))}</p>${successors(n)}${list('Core beliefs', n.core_beliefs)}${list('Distinctives', n.distinctives)}${list('Milestones', n.key_dates?.map(x => `${x.year ?? '?'} — ${x.label}`))}${people(n.key_figures)}${documents(n.key_documents)}${reading(n.further_reading)}<h3>Scale</h3><p>${esc(n.size_estimate || 'Not recorded')}</p><h3>Relationships</h3><div id="relationships"></div><h3>Evidence</h3>${evidence([...(n.citations || []), ...(n.key_dates || []).flatMap(x => x.citations || [])])}`;
        $('details').querySelectorAll('[data-successor]').forEach(b => b.onclick = () => openNode(b.dataset.successor));
        $('ancestry').onclick = () => {
            focus = ancestors(id);
            family = '';
            period = null;
            layout = 'lineage';
            level = 2;
            render();
            if(detailsDialog.open)detailsDialog.close();
        };
        relationships.forEach(e => {
            const b = document.createElement('button');
            b.className = 'relationship';
            b.textContent = `${label(nodes.get(e.from_id))} → ${label(nodes.get(e.to_id))} · ${e.year || '?'} · ${e.type}`;
            b.onclick = () => showEdge(e);
            $('relationships').append(b);
        });
        $('details').scrollTop = 0;
        document.querySelectorAll('.node').forEach(el => el.classList.toggle('selected', el.dataset.id === id));
    }
    function showEdge(e) {
        $('details').innerHTML = `<span class="badge">${esc(e.type)} · ${esc(e.year ?? 'Date unknown')}</span><h2>${esc(e.name || 'Historical relationship')}</h2><p>${esc(nodes.get(e.from_id)?.name)} → ${esc(nodes.get(e.to_id)?.name)}</p><p>${esc(e.narrative || e.description || 'Narrative not recorded.')}</p>${list('Reasons and drivers', [...new Set([...(e.reasons || []), ...(e.causes || [])])])}${list('Milestones', e.key_dates?.map(x => `${x.year ?? '?'} — ${x.label}`))}${people(e.key_figures)}<h3>Evidence</h3>${evidence([...(e.citations || []), ...(e.key_dates || []).flatMap(x => x.citations || [])])}`;
    }
    function openNode(id) {
        if(!family&&!focus&&layout==='lineage')layout=lastTimeline;
        selected = id;
        period = null;
        family = nodes.get(id).tradition_family || 'Other';
        focus = null;
        level = 2;
        render();
        showNode(id);
        timelineControl?.reveal?.(id);
        requestAnimationFrame(() => document.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }));
    }
    function aggregateEntries(entries) {
        const ids = new Set(entries.map(n => n.id)), claimed = new Set(), out = [];
        for (const g of window.CHURCHTREE_GROUPS) {
            const members = g.members.filter(id => ids.has(id));
            if (!members.length)
                continue;
            members.forEach(id => claimed.add(id));
            out.push({ id: g.id, name: g.name, short_label: g.name, members, start_year: Math.min(...members.map(id => nodes.get(id).start_year)), aggregate: true });
        }
        entries.filter(n => !claimed.has(n.id)).forEach(n => out.push(n));
        return out;
    }
    function groupDetails(n) {
        $('details').innerHTML = `<span class="badge">Collapsed historical group</span><h2>${esc(n.name)}</h2><p>This is a display group containing ${n.members.length} recorded entries, rather than a separate denomination. Expand it to inspect the individual histories.</p><button id="expand-group">Expand group</button><h3>Included entries</h3><div id="group-members"></div>`;
        $('expand-group').onclick = () => {
            if(detailsDialog.open)detailsDialog.close();
            level = 2;
            render();
            document.querySelector(`[data-id="${CSS.escape(n.members[0])}"]`)?.scrollIntoView({ block: 'center', inline: 'center' });
        };
        n.members.forEach(id => {
            const b = document.createElement('button');
            b.className = 'relationship';
            b.textContent = nodes.get(id).name;
            b.onclick = () => openNode(id);
            $('group-members').append(b);
        });
    }
    function scopeIntroduction() {
        const title = family || 'Church history';
        $('details').innerHTML = '<span class="badge">Explore this scope</span><h2>' + esc(title) + '</h2><p>Select a historical body to read its beliefs, formation, people and documents. Select a connection to understand the transition.</p><p>Compact lineage groups related records. The proportional timeline clusters nearby dates as you zoom out.</p>';
    }
    const mobile = matchMedia('(max-width: 1099px)');
    const detailsPanel=$('details'),detailsDialog=$('mobile-details');
    const detailsButton = $("mobile-open-details");
    function setDesktopDetails(open) {
        detailsPanel.hidden = !open;
        $("splitter").hidden = !open;
        document.querySelector("main").classList.toggle("details-collapsed", !open);
        detailsButton.setAttribute("aria-expanded", String(open));
    }
    function syncDetailLayout() {
        if (mobile.matches) {
            setDesktopDetails(false);
            detailsPanel.hidden = false;
            $("mobile-details-body").append(detailsPanel);
            detailsButton.removeAttribute("aria-expanded");
            detailsButton.setAttribute("aria-controls", detailsDialog.id);
            detailsButton.setAttribute("aria-haspopup", "dialog");
        } else {
            if (detailsDialog.open) detailsDialog.close();
            document.querySelector("main").append(detailsPanel);
            setDesktopDetails(true);
            detailsButton.setAttribute("aria-controls", detailsPanel.id);
            detailsButton.removeAttribute("aria-haspopup");
        }
    }
    function openDetails() {
        if (mobile.matches) {
            if (!detailsDialog.open) detailsDialog.showModal();
        } else if (detailsPanel.hidden) {
            setDesktopDetails(true);
        }
    }
    detailsButton.onclick = () => {
        if (!mobile.matches && !detailsPanel.hidden) setDesktopDetails(false);
        else openDetails();
    };
    $("mobile-close-details").onclick = () => detailsDialog.close();
    detailsDialog.addEventListener("close", () => detailsButton.focus({preventScroll: true}));
    new MutationObserver(() => {
        if (detailsPanel.querySelector(".badge")?.textContent !== "Explore this scope") openDetails();
    }).observe(detailsPanel, {childList: true});

    const searchPanel = $("search-form");
    const filtersPanel = $("view-settings");
    const searchButton = $("mobile-search-toggle");
    const filtersButton = $("mobile-settings-toggle");
    const rangeButton = $("mobile-range-toggle");
    function showPanel(panel, button, open) {
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
    }
    function closeSearch(restoreFocus = false) {
        showPanel(searchPanel, searchButton, false);
        searchResults.replaceChildren();
        searchStatus.textContent = '';
        searchMore.hidden = true;
        if (restoreFocus) searchButton.focus({preventScroll: true});
    }
    searchButton.onclick = () => {
        if (!searchPanel.hidden) closeSearch(true);
        else {
            showPanel(filtersPanel, filtersButton, false);
            showPanel(searchPanel, searchButton, true);
            $("search").focus({preventScroll: true});
            search();
        }
    };
    $("mobile-close-search").onclick = () => closeSearch(true);
    filtersButton.onclick = () => {
        closeSearch();
        const open = filtersPanel.hidden;
        showPanel(filtersPanel, filtersButton, open);
        if (open) $("branch").focus({preventScroll: true});
    };
    const explorerHeader = document.querySelector(".explorer-header");
    document.addEventListener("pointerdown", event => {
        if (explorerHeader.contains(event.target)) return;
        if (!searchPanel.hidden) closeSearch(searchPanel.contains(document.activeElement));
        if (!filtersPanel.hidden) {
            if (filtersPanel.contains(document.activeElement)) filtersButton.focus({preventScroll: true});
            showPanel(filtersPanel, filtersButton, false);
        }
    });
    explorerHeader.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        if (!searchPanel.hidden) closeSearch(true);
        else if (!filtersPanel.hidden) {
            showPanel(filtersPanel, filtersButton, false);
            filtersButton.focus({preventScroll: true});
        } else return;
        event.preventDefault();
        event.stopPropagation();
    });
    rangeButton.onclick = () => {
        const expanded = filtersPanel.classList.toggle("dates-open");
        rangeButton.setAttribute("aria-expanded", String(expanded));
    };
    const shortLandscape = matchMedia('(min-width: 568px) and (max-width: 1099px) and (max-height: 450px) and (orientation: landscape)');
    const graphTools = document.querySelector('.graph-tools');
    const graphStage = graphTools.parentElement;
    const headerActions = explorerHeader.querySelector('.explorer-actions');
    const timeNavigation = $('mobile-pan');
    function placeGraphTools() {
        const parent = shortLandscape.matches && !timeNavigation.hidden ? explorerHeader : graphStage;
        if (graphTools.parentElement === parent) return;
        const focusedControl = graphTools.contains(document.activeElement) ? document.activeElement : null;
        parent.insertBefore(graphTools, parent === explorerHeader ? headerActions : null);
        focusedControl?.focus({preventScroll: true});
    }
    shortLandscape.addEventListener('change', placeGraphTools);
    $("time-earlier").onclick = () => timelineControl?.pan?.(-.65);
    $("time-later").onclick = () => timelineControl?.pan?.(.65);
    syncDetailLayout();
    mobile.addEventListener('change',()=>{syncDetailLayout();render();});
    function render() {
        const nextGraphKey=layout+':'+level+':'+family+':'+(focus||'');
        const graphScale=nextGraphKey===graphViewKey?graphControl?.snapshot().scale||1:1;
        graphControl?.destroy();graphControl=null;window.CHURCHTREE_GRAPH=null;graphViewKey=nextGraphKey;
        document.body.classList.toggle('major-overview',layout==='lineage'&&level===0);
        $('mobile-range-toggle').hidden=layout==='lineage';
        timeNavigation.hidden=layout==='lineage';
        placeGraphTools();
        $('branch').value = family;
        $('layout').value = layout==='lineage'?'lineage':'timeline';
        $('orientation').hidden=layout==='lineage';
        $('orientation-vertical').setAttribute('aria-pressed',String(layout==='timeline'));
        $('orientation-horizontal').setAttribute('aria-pressed',String(layout==='horizontal'));
        $('period').hidden = layout !== 'timeline' || level === 0;
        $('level').textContent = ['1 · Major branches', '2 · Historical groups', '3 · Denominations'][level];
        $('zoom-out').disabled = level === 0;
        $('zoom-in').disabled = level === 2;
        $('clear-focus').hidden = !focus;
        const graph = $('graph');
        timelineControl?.destroy?.();
        graph.replaceChildren();
        timelineControl = null;
        let entries, rawEdges = [];
        if (layout === 'timeline' || layout === 'horizontal') {
            $('zoom-out').disabled = false;
            $('zoom-in').disabled = false;
            $('period').hidden = false;
            const scoped = scopeNodes();
            const catholicId = 'catholic-church';
            const edges = d.edges.filter(e => e.from_id !== catholicId && e.to_id !== catholicId);
            const years = scoped.map(n => n.start_year).filter(Number.isFinite);
            if (years.length) {
                $('year-from').value = period?.[0] ?? Math.min(...years) - 10;
                $('year-to').value = period?.[1] ?? Math.max(...years) + 10;
            }
            const scopeTitle=(focus ? label(nodes.get(selected)) + ' · ancestry' : family || 'All branches')+(layout==='horizontal'?' · horizontal timeline':' · proportional timeline');
            $('scope-title').textContent=mobile.matches?(focus ? label(nodes.get(selected)) + ' · ancestry' : family || 'All branches'):scopeTitle;
            $('scope-title').setAttribute('aria-label',scopeTitle);$('scope-title').title=scopeTitle;
            $('scope-note').textContent = layout === 'horizontal' ? 'Time runs left to right. Scroll sideways (Shift + wheel) to travel through time. Use +/− or Ctrl + wheel to zoom; nearby records collapse into named groups.' : 'Mouse wheel zooms time; drag to pan. Nearby records cluster within each tradition and separate as you zoom in. Cluster dates show their actual range.';
            timelineControl = (layout === 'horizontal' ? window.renderHorizontalTimeline : window.renderChurchTimeline)({ container: graph, entries: scoped, edges, period, onNode: showNode, onEdge: showEdge, onRange: domain => {
                    if (!['year-from', 'year-to'].includes(document.activeElement?.id)) {
                        $('year-from').value = Math.floor(domain[0]);
                        $('year-to').value = Math.ceil(domain[1]);
                    }
                    $('level').textContent = Math.round(domain[0]) + '–' + Math.round(domain[1]);
                    $('count').textContent = scoped.length + ' records in scope';
                }, onCluster: (members, title) => {
                    $('details').innerHTML = '<span class="badge">Nearby records in time</span><h2>' + esc(title) + '</h2><p>These records are visually clustered, not a single historical body. Zoom in to explore their dates, or select an entry below. Entries sharing a date may remain grouped.</p><div id="cluster-members"></div>';
                    [...new Map(members.map(n => [n.id, n])).values()].forEach(n => {
                        const b = document.createElement('button');
                        b.className = 'relationship';
                        b.textContent = n.name + ' · ' + n.start_year;
                        b.onclick = () => {
                            showNode(n.id);
                            timelineControl?.reveal?.(n.id);
                        };
                        $('cluster-members').append(b);
                    });
                } });
            if(!timelineControl){$('zoom-in').disabled=true;$('zoom-out').disabled=true;$('period').hidden=true;$('level').textContent='No dated entries';$('count').textContent=scoped.length+' entries in scope';}
            timeNavigation.hidden=!timelineControl;
            placeGraphTools();
            if(mobile.matches)$('scope-note').textContent=layout==='horizontal'?'Drag to explore time; pinch to zoom around your fingers. Tap a node for its history.':'Drag to pan time and branches; pinch to zoom around your fingers. Earlier/Later and +/− also work.';
            window.CHURCHTREE_TIMELINE = timelineControl;
            return;
        }
        window.CHURCHTREE_TIMELINE = null;
        $('scope-title').removeAttribute('aria-label');$('scope-title').removeAttribute('title');
        if (level === 0) {
            $('scope-title').textContent = 'Major branches';
            $('scope-note').textContent = 'Connections summarize recorded relationships between traditions. Spacing is for readability, not elapsed time. Select a branch to drill in.';
            entries = families.map(f => ({ id: 'family:' + f, name: f, short_label: f, members: d.nodes.filter(n => (n.tradition_family || 'Other') === f).map(n => n.id), family: f, aggregate: true }));
            rawEdges = d.edges;
        }
        else {
            if (!family && !focus)
                family = 'Presbyterian';
            $('branch').value = family;
            let scoped = scopeNodes();
            const allScoped = scoped;
            entries = level === 1 ? aggregateEntries(scoped) : scoped.map(n => ({ ...n }));
            const scopeIds = new Set(scoped.map(n => n.id)), ancestryIds = new Set();
            scoped.forEach(n => ancestors(n.id).forEach(id => ancestryIds.add(id)));
            // Keep originating bodies outside the active chronology, without pretending a
            // collapsed ancestry path is a direct split. Roots are relative to this dataset.
            const roots = d.nodes.filter(n => ancestryIds.has(n.id) && !scopeIds.has(n.id) && !d.edges.some(e => e.to_id === n.id));
            entries.unshift(...roots.map(n => ({ ...n, context: true })));
            entries = entries.map(n => n.id === 'catholic-church' ? { ...n, context: true } : n);
            rawEdges = d.edges.filter(e => scopeIds.has(e.from_id) && scopeIds.has(e.to_id));
            for (const root of roots) {
                const queue = [{ id: root.id, path: [] }], seen = new Set([root.id]);
                while (queue.length) {
                    const current = queue.shift();
                    for (const e of d.edges.filter(e => e.from_id === current.id)) {
                        if (scopeIds.has(e.to_id)) {
                            rawEdges.push({ ...e, id: 'context:' + root.id + ':' + e.to_id, from_id: root.id, context: true, path: [...current.path, e.id], description: `Collapsed ancestry path through ${current.path.length} intermediate recorded relationships. This is lineage context, not a direct split.`, name: 'Origin context · collapsed lineage' });
                        }
                        else if (!seen.has(e.to_id)) {
                            seen.add(e.to_id);
                            queue.push({ id: e.to_id, path: [...current.path, e.id] });
                        }
                    }
                }
            }
            $('scope-title').textContent = (focus ? `${label(nodes.get(selected))} · ancestry` : family) + (' · lineage');
            $('scope-note').textContent = 'Chronological order with compact spacing, not elapsed time. Dashed origin nodes stay visible; zoom reveals or collapses historical groups.';
            $('count').textContent = `${scoped.length} of ${allScoped.length} records · ${entries.length} visible nodes`;
        }
        if (!entries.length) {
            graph.innerHTML = '<p class="empty">No entries in this period. Widen the date range.</p>';
            return;
        }
        const membership = new Map();
        entries.forEach(n => (n.members || [n.id]).forEach(id => membership.set(id, n.id)));
        const edgeMap = new Map();
        for (const e of rawEdges) {
            const a = membership.get(e.from_id), b = membership.get(e.to_id);
            if (!a || !b || a === b)
                continue;
            const key = a + '|' + b;
            let edge = edgeMap.get(key);
            if (!edge) {
                edge = { id: key, from_id: a, to_id: b, originals: [], type: e.type, context: e.context };
                edgeMap.set(key, edge);
            }
            edge.originals.push(e);
        }
        const edges = [...edgeMap.values()];
        if (level === 0)
            $('count').textContent = `${entries.length} branches · ${edges.length} connections`;
        const positions = new Map(), width = Math.max(650, graph.clientWidth - 20);
        let height = 0;
        if (level === 0) {
            const rowMap = { Catholic: 0, Orthodox: 0, Reformed: 1, Anglican: 1, Lutheran: 1, Presbyterian: 2, Baptist: 2, Methodist: 2, Revivalist: 3, Holiness: 3, Restorationist: 3, Adventist: 4, Pentecostal: 4 };
            const rows = d3.group(entries, n => rowMap[n.family] ?? 5);
            const cardsPerRow = 1 + Math.floor((width - 240) / 220);
            let row = 0;
            for (const [, members] of [...rows].sort(([a], [b]) => a - b)) {
                for (let start = 0; start < members.length; start += cardsPerRow) {
                    const cards = members.slice(start, start + cardsPerRow);
                    const y = 35 + row++ * 112;
                    cards.forEach((n, i) => positions.set(n.id, { x: 30 + i * (width - 240) / Math.max(1, cards.length - 1), y }));
                    height = y + 100;
                }
            }
        }
        else {
            const ordered = [...entries].sort((a, b) => (a.context ? -1 : b.context ? 1 : 0) || a.start_year - b.start_year || a.id.localeCompare(b.id));
            const branchLayout=window.ChurchTimelineModel.branchLanes(entries,edges);
            let lastYear=null,row=-1;const spacing=Math.min(235,(width-250)/Math.max(1,branchLayout.count-1));
            for(const n of ordered){
                if(!n.context&&n.start_year!==lastYear){row++;lastYear=n.start_year;}
                let py=n.context?25:155+row*94;
                const slot=branchLayout.positions.get(n.id)||0,px=25+slot*spacing;
                // Compact chronology may add vertical room to keep full-size cards legible.
                for(const previous of positions.values())if(Math.abs(previous.x-px)<220&&py<previous.y+65)py=previous.y+65;
                positions.set(n.id,{x:px,y:py});
                height=Math.max(height,py+100);
            }
        }

        // Route each overlapping connection through its own side channel. Horizontal
        // portions use gutters between rows rather than cutting through node cards.
        const lanes = [];
        edges.sort((a, b) => positions.get(a.from_id).y - positions.get(b.from_id).y);
        for (const e of edges) {
            const a = positions.get(e.from_id), b = positions.get(e.to_id);
            const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
            let lane = lanes.findIndex(spans => spans.every(s => hi < s[0] || lo > s[1]));
            if (lane < 0) {
                lane = lanes.length;
                lanes.push([]);
            }
            lanes[lane].push([lo, hi]);
            e.lane = lane;
        }
        const right = level === 0 ? width - 5 : Math.max(...[...positions.values()].map(p=>p.x+205))+25;
        const actualWidth = level === 0 ? width : Math.max(width, right + lanes.length * 16 + 25);
        height = Math.max(height, graph.clientHeight - 20);
        const svg = d3.select(graph).append('svg').attr('width', actualWidth).attr('height', height).attr('aria-label', level === 0 ? 'Connected major traditions' : 'Historical lineage graph');
        svg.append('defs').append('marker').attr('id', 'arrow').attr('viewBox', '0 -4 8 8').attr('refX', 7).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path').attr('d', 'M0,-3L7,0L0,3Z').attr('fill', 'var(--ct-arrow)');
        const scene=svg.append('g').attr('class','graph-scene');
        graphControl=window.ChurchTimelineModel.graphGestures(graph,svg,scene,actualWidth,height,graphScale);
        window.CHURCHTREE_GRAPH=graphControl;
        const showConnection = e => {
            if (e.originals.length === 1 && !e.context) {
                showEdge(e.originals[0]);
                return;
            }
            $('details').innerHTML = `<span class="badge">${e.context ? 'Origin context' : 'Grouped relationships'}</span><h2>${e.originals.length} recorded connection${e.originals.length === 1 ? '' : 's'}</h2><p>${e.context ? 'Intermediate ancestors are collapsed. This does not assert a direct split.' : 'This line combines the following recorded relationships. Expand the groups to see individual bodies.'}</p><div id="connection-list"></div>`;
            e.originals.forEach(original => {
                const b = document.createElement('button');
                b.className = 'relationship';
                b.textContent = original.context ? 'Show collapsed ancestry path' : `${original.name || original.type} · ${original.year || '?'}`;
                b.onclick = () => {
                    if (original.context) {
                        $('details').innerHTML = '<h2>Collapsed lineage path</h2>' + original.path.map(id => {
                            const item = d.edges.find(e => e.id === id);
                            return `<p>${esc(nodes.get(item.from_id).name)} → ${esc(nodes.get(item.to_id).name)} · ${esc(item.year)}</p>`;
                        }).join('');
                    }
                    else
                        showEdge(original);
                };
                $('connection-list').append(b);
            });
        };
        scene.append('g').selectAll('path').data(edges).join('path').attr('class', e => `link ${new Set(e.originals.map(x=>x.type)).size>1?'mixed':e.type}`).attr('tabindex', 0).attr('role', 'button').attr('aria-label', e => `${entries.find(n => n.id === e.from_id).name} to ${entries.find(n => n.id === e.to_id).name}, ${e.originals.length} relationships`).attr('marker-end', 'url(#arrow)').attr('stroke-dasharray', e => e.context ? '5 4' : null).attr('d', e => {
            const a = positions.get(e.from_id), b = positions.get(e.to_id);
            if (a.y === b.y) {
                const yy = a.y - 17 - (e.lane % 3) * 6;
                return `M${a.x + 102},${a.y} C${a.x + 102},${yy} ${b.x + 102},${yy} ${b.x + 102},${b.y - 3}`;
            }
            const sx = a.x + 102, sy = a.y + 54, tx = b.x + 102, ty = b.y;
            const blockers = entries.filter(n => n.id !== e.from_id && n.id !== e.to_id).map(n => positions.get(n.id)).filter(p => p.y + 54 > Math.min(sy, ty) && p.y < Math.max(sy, ty) && p.x < Math.max(sx, tx) + 12 && p.x + 205 > Math.min(sx, tx) - 12);
            if (!blockers.length && ty > sy)
                return `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty - 3}`;
            const involved = [a, b, ...blockers], left = Math.max(15, Math.min(...involved.map(p => p.x)) - 22 - (e.lane % 4) * 9), r = Math.max(...involved.map(p => p.x)) + 230 + (e.lane % 4) * 9;
            const channel = Math.abs(sx - left) + Math.abs(tx - left) < Math.abs(sx - r) + Math.abs(tx - r) ? left : r;
            const y1 = sy + 12 + (e.lane % 3) * 4, y2 = ty - 14 - (e.lane % 3) * 4;
            const points = [[sx, sy], [sx, y1], [channel, y1], [channel, y2], [tx, y2], [tx, ty - 3]];
            const p = d3.path();
            p.moveTo(...points[0]);
            for (let i = 1; i < points.length - 1; i++) {
                p.arcTo(...points[i], ...points[i + 1], 5);
            }
            p.lineTo(...points.at(-1));
            return p.toString();
        }).on('mouseenter', function (_, e) {
            svg.selectAll('.link').style('opacity', other => other === e ? 1 : .12);
            d3.select(this).raise();
        }).on('mouseleave', () => svg.selectAll('.link').style('opacity', null)).on('click', (_, e) => showConnection(e)).on('keydown', (ev, e) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                showConnection(e);
            }
        }).append('title').text(e => e.originals.map(x => x.name || x.type).join('; '));
        const groups = scene.append('g').selectAll('g').data(entries).join('g').attr('class', n => `node ${n.aggregate ? 'aggregate' : ''} ${n.context ? 'context' : ''}${n.id === selected ? ' selected' : ''}`).attr('data-id', n => n.id).attr('transform', n => {
            const p = positions.get(n.id);
            return `translate(${p.x},${p.y})`;
        }).attr('tabindex', 0).attr('role', 'button').attr('aria-label', n => n.name).on('click', (_, n) => {
            if (n.family) {
                family = n.family;
                focus = null;
                selected = null;
                level = 2;
                period = null;
                layout = lastTimeline;
                scopeIntroduction();
                render();
            }
            else if (n.aggregate)
                groupDetails(n);
            else
                showNode(n.id);
        }).on('keydown', function (ev, n) {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                this.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        });
        groups.append('rect').attr('width', 205).attr('height', 54).attr('rx', 8);
        groups.append('text').attr('x', 10).attr('y', 18).each(function (n) {
            const text = d3.select(this), words = label(n).split(' ');
            let line = '', lines = [];
            for (const word of words) {
                if ((line + ' ' + word).length > 29) {
                    lines.push(line);
                    line = word;
                }
                else
                    line += (line ? ' ' : '') + word;
            }
            if (line)
                lines.push(line);
            lines.slice(0, 2).forEach((l, i) => text.append('tspan').attr('x', 10).attr('dy', i ? 13 : 0).text(l));
        });
        groups.append('text').attr('class', 'date').attr('x', 10).attr('y', 46).text(n => n.context ? 'Origin context · outside time scale' : n.aggregate ? `${n.members.length} entries · click to explore` : `${n.start_year ?? 'Date unknown'} · ${n.region || n.kind || ''}`);
        groups.append('title').text(n => n.name);
    }
    $('zoom-in').onclick = () => {
        if (timelineControl) {
            timelineControl.step(1.7);
            return;
        }
        if (level < 2) {
            level++;
            render();
        }
    };
    $('zoom-out').onclick = () => {
        if (timelineControl) {
            timelineControl.step(1 / 1.7);
            return;
        }
        if (level > 0) {
            level--;
            if (!level) {
                focus = null;
                family = '';
            }
            render();
        }
    };
    $('branch').onchange = () => {
        period = null;
        const fromAll=!family&&!focus;
        family = $('branch').value;
        if(fromAll&&family&&layout==='lineage')layout=lastTimeline;
        focus = null;
        selected = null;
        level = family ? 2 : 0;
        scopeIntroduction();
        render();
    };
    $('reset').onclick = () => {
        graphViewKey='';
        if (timelineControl) {
            if (layout === 'horizontal') {
                timelineControl.reset();
                return;
            }
            period = null;
            render();
            return;
        }
        family = '';
        level = 0;
        focus = null;
        selected = null;
        searchInput.value = '';
        search();
        scopeIntroduction();
        render();
    };
    $('layout').onchange = () => {
        layout = $('layout').value==='lineage'?'lineage':lastTimeline;
        if(layout==='timeline'||layout==='horizontal')lastTimeline=layout;
        if (layout === 'timeline' || layout === 'horizontal')
            level = 2;
        period = null;
        render();
    };
    function changeOrientation(next) {
        if(layout===next)return;
        period=timelineControl?.snapshot().domain || period;
        layout=next;lastTimeline=next;level=2;
        render();
    }
    $('orientation-vertical').onclick=()=>changeOrientation('timeline');
    $('orientation-horizontal').onclick=()=>changeOrientation('horizontal');
    $('apply-period').onclick = () => {
        const a = Number($('year-from').value), b = Number($('year-to').value);
        if ($('year-from').value !== '' && $('year-to').value !== '' && Number.isInteger(a) && Number.isInteger(b) && a < b) {
            $('period-error').textContent = '';
            period = [a, b];
            render();
        }
        else
            $('period-error').textContent = 'Enter whole years, with the start earlier than the end.';
    };
    $('clear-focus').onclick = () => {
        focus = null;
        family = nodes.get(selected)?.tradition_family || 'Presbyterian';
        render();
    };
    function search() {
        const query = normalizeSearch(searchInput.value);
        searchResults.replaceChildren();
        searchStatus.textContent = '';
        searchMore.hidden = true;
        searchPanel.scrollTop = 0;
        if (!query)
            return [];
        const matches = searchEntries.map(({node, name, terms}) => {
            if (name === query) return {node, rank: 0};
            if (terms.includes(query)) return {node, rank: 1};
            const values = [name, ...terms];
            if (values.some(value => value.startsWith(query))) return {node, rank: 2};
            if (values.some(value => value.includes(query))) return {node, rank: 3};
            return null;
        }).filter(Boolean)
            .sort((a, b) => a.rank - b.rank || a.node.name.localeCompare(b.node.name) || a.node.id.localeCompare(b.node.id));
        if (!matches.length) {
            searchStatus.textContent = 'No matching entries.';
            return matches;
        }
        function appendResults(start) {
            const end = Math.min(start + searchPageSize, matches.length);
            for (const {node} of matches.slice(start, end)) {
                const button = document.createElement('button');
                button.type = 'button';
                const short = label(node);
                const title = short === node.name ? node.name : `${short} · ${node.name}`;
                const year = node.start_year ?? 'Unknown origin';
                button.textContent = `${title} · ${year} · ${node.tradition_family || 'Other'}`;
                button.onclick = () => {
                    closeSearch(true);
                    openNode(node.id);
                };
                searchResults.append(button);
            }
            searchStatus.textContent = end < matches.length ? `Showing ${end} of ${matches.length} matches`
                : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`;
            searchMore.hidden = end === matches.length;
            searchMore.onclick = () => {
                appendResults(end);
                searchResults.children[end].focus();
            };
        }
        appendResults(0);
        return matches;
    }
    searchInput.oninput = search;
    searchPanel.onsubmit = e => {
        e.preventDefault();
        const [first, second] = search();
        const button = searchResults.firstElementChild;
        if (first && (!second || (first.rank <= 1 && first.rank < second.rank)))
            button.click();
        else
            button?.focus();
    };
    const splitter = $('splitter');
    function resizeDetails(width) {
        const bounded=Math.max(300,Math.min(innerWidth*.55,width));
        document.documentElement.style.setProperty('--details-width',bounded+'px');
        splitter.setAttribute('aria-valuenow',Math.round(bounded));
        splitter.setAttribute('aria-valuemin','300');
        splitter.setAttribute('aria-valuemax',Math.round(innerWidth*.55));
        splitter.setAttribute('aria-valuetext',Math.round(bounded)+' pixels for the reading panel');
    }
    let dragging = false;
    splitter.onpointerdown = e => {
        dragging = true;
        splitter.setPointerCapture(e.pointerId);
    };
    splitter.onpointermove = e => {
        if (dragging)
            resizeDetails(innerWidth-e.clientX);
    };
    splitter.onpointerup = () => dragging = false;
    splitter.onpointercancel = () => dragging = false;
    splitter.onkeydown = e => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const w = $('details').getBoundingClientRect().width;
            resizeDetails(w+(e.key==='ArrowLeft'?30:-30));
        }
    };
    splitter.setAttribute('aria-valuenow',Math.round($('details').getBoundingClientRect().width));
    splitter.setAttribute('aria-valuemin','300');
    splitter.setAttribute('aria-valuemax',Math.round(innerWidth*.55));
    render();
    const graph = $('graph');
    const graphSize = () => graph.clientWidth + 'x' + graph.clientHeight;
    let resizeTimer, previousSize = graphSize();
    new ResizeObserver(() => {
        const size = graphSize();
        if (size === previousSize)
            return;
        previousSize = size;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const left = graph.scrollLeft, top = graph.scrollTop;
            if (timelineControl && layout !== 'horizontal')
                period = timelineControl.snapshot().domain;
            render();
            graph.scrollLeft = left;
            graph.scrollTop = top;
        }, 100);
    }).observe(graph);
})();
