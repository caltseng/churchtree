/* Native horizontal scrolling with proportional dates and screen-space clusters. */
window.renderHorizontalTimeline = function ({ container, entries, edges, roots, onNode, onEdge, onCluster, period, onRange }) {
    const family = n => n.tradition_family || 'Other', title = window.churchClusterTitle;
    const dated = entries.filter(n => !roots.some(r => r.id === n.id) && Number.isFinite(n.start_year));
    if (!dated.length) {
        container.textContent = 'No dated records in this scope.';
        return null;
    }
    const families = [...new Set(dated.map(family))].sort(), left = 270, right = 120, top = 155, lane = 100;
    const years = dated.map(n => n.start_year), extent = period || [Math.min(...years) - 10, Math.max(...years) + 10];
    const viewWidth = container.clientWidth, height = Math.max(container.clientHeight - 20, top + families.length * lane + 40), base = Math.max(280, viewWidth - left - right);
    const stateKey = dated.map(n => n.id).sort().join('|') + ':' + extent.join(',');
    const saved = window.CHURCHTREE_HORIZONTAL_STATE?.key === stateKey ? window.CHURCHTREE_HORIZONTAL_STATE : null;
    let k = saved?.scale || 1, clusters = [], scale, currentWidth, highlighted = null;
    const scene = document.createElement('div');
    scene.className = 'horizontal-scene';
    container.append(scene);
    const svg = d3.select(scene).append('svg').attr('height', height).attr('aria-label', 'Horizontal proportional timeline; scroll sideways and use zoom controls');
    const defs = svg.append('defs');
    defs.append('marker').attr('id', 'horizontal-arrow').attr('viewBox', '0 -4 8 8').attr('refX', 7).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto').append('path').attr('d', 'M0,-3L7,0L0,3Z').attr('fill', '#819783');
    const axisBackground = svg.append('rect').attr('x',155).attr('width','100%').attr('height',37).attr('fill','#fffdf7');
    const axis = svg.append('g').attr('class', 'horizontal-axis').attr('transform', 'translate(0,110)'), grid = svg.append('g'), links = svg.append('g'), cards = svg.append('g');
    const labels = document.createElement('div');
    labels.className = 'horizontal-lanes';
    labels.style.height = height + 'px';
    labels.style.marginTop = -height + 'px';
    scene.append(labels);
    const origin = document.createElement('div');
    origin.className = 'horizontal-origin';
    labels.append(origin);
    if (roots.length) {
        for (const root of roots) {
            const b = document.createElement('button');
            b.textContent = root.short_label || root.name;
            b.onclick = () => onNode(root.id);
            origin.append(b);
        }
        const note = document.createElement('small');
        note.textContent = 'Origin context · outside time scale';
        origin.append(note);
    }
    else
        origin.textContent = 'Historical traditions';
    families.forEach((f, i) => {
        const label = document.createElement('div');
        label.className = 'horizontal-lane-label';
        label.style.top = (top + i * lane - 14) + 'px';
        label.textContent = f;
        labels.append(label);
    });
    function domain() {
        return [scale.invert(Math.max(left, container.scrollLeft + 155)), scale.invert(Math.min(currentWidth - right, container.scrollLeft + container.clientWidth))];
    }
    function report() {
        const axisY=Math.max(110,container.scrollTop+28);
        axisBackground.attr('y',axisY-25).raise();
        axis.attr('transform',`translate(0,${axisY})`).raise();
        window.CHURCHTREE_HORIZONTAL_STATE = { key: stateKey, scale: k, scrollLeft: container.scrollLeft };
        onRange?.(domain());
    }
    function draw() {
        currentWidth = left + base * k + right;
        scene.style.width = currentWidth + 'px';
        svg.attr('width', currentWidth);
        scale = d3.scaleLinear().domain(extent).range([left, currentWidth - right]);
        axis.call(d3.axisTop(scale).ticks(Math.max(5, Math.floor(base * k / 110))).tickFormat(d3.format('d')));
        axis.selectAll('text').attr('fill', '#697568');
        axis.selectAll('line,.domain').attr('stroke', '#cbd5c6');
        grid.selectAll('line').data(families).join('line').attr('x1', left).attr('x2', currentWidth - right).attr('y1', (_, i) => top + i * lane).attr('y2', (_, i) => top + i * lane).attr('stroke', '#e2e7dc');
        clusters = window.ChurchTimelineModel.cluster(dated, scale, 225).map(c => ({ ...c, x: c.position, y: top + families.indexOf(c.family) * lane }));
        const combined = window.ChurchTimelineModel.connections(clusters, edges);
        links.selectAll('path').data(combined, e => e.a.id + '>' + e.b.id).join('path').attr('class', e => 'link ' + (e.edges.every(x => x.type === 'split') ? 'split' : '')).attr('marker-end', 'url(#horizontal-arrow)').attr('d', e => {
            const a = e.a, b = e.b;
            if (a.y === b.y) {
                const bend = a.y + 44;
                return `M${a.x + 70},${a.y + 24} C${a.x + 100},${bend} ${b.x - 100},${bend} ${b.x - 70},${b.y + 24}`;
            }
            return `M${a.x + 100},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x - 103},${b.y}`;
        }).attr('role', 'button').attr('tabindex', 0).attr('aria-label', e => e.edges.map(x => x.name || x.type).join('; ')).on('click', (_, e) => e.edges.length === 1 ? onEdge(e.edges[0]) : onCluster(e.a.members.concat(e.b.members), 'Historical connections')).on('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        }).selectAll('title').data(e => [e]).join('title').text(e => e.edges.map(x => x.name || x.type).join('; '));
        const joined = cards.selectAll('g').data(clusters, c => c.id).join(enter => {
            const g = enter.append('g').attr('role', 'button').attr('tabindex', 0);
            g.append('rect').attr('rx', 7);
            g.append('text').attr('class', 'horizontal-title');
            g.append('text').attr('class', 'date');
            g.append('title');
            return g;
        }).attr('class', c => 'node horizontal-node' + (c.members.length > 1 ? ' aggregate' : '') + (c.members.some(n => n.id === highlighted) ? ' selected' : '')).attr('data-members', c => c.members.map(n => n.id).join(',')).attr('data-id', c => c.members.length === 1 ? c.members[0].id : null).attr('transform', c => `translate(${c.x},${c.y})`).attr('aria-label', c => title(c) + ', ' + c.min + '–' + c.max).on('click', (_, c) => {
            if (c.members.length === 1) {
                onNode(c.members[0].id);
                return;
            }
            onCluster(c.members, title(c));
            const pad = Math.max(3, (c.max - c.min) * .25);
            fit([c.min - pad, c.max + pad]);
        }).on('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        });
        joined.select('rect').attr('x', -102).attr('y', -28).attr('width', 204).attr('height', 56);
        joined.select('.horizontal-title').each(function (c) {
            const text = d3.select(this);
            text.selectAll('*').remove();
            const words = title(c).split(/\s+/);
            let lines = [], line = '';
            for (const word of words) {
                if (line && (line + ' ' + word).length > 30) {
                    lines.push(line);
                    line = word;
                }
                else
                    line += (line ? ' ' : '') + word;
            }
            if (line)
                lines.push(line);
            let shown = lines.slice(0, 2);
            if (lines.length > 2)
                shown[1] += '…';
            text.attr('text-anchor', 'middle').attr('y', shown.length > 1 ? -12 : -5);
            shown.forEach((s, i) => text.append('tspan').attr('x', 0).attr('dy', i ? 13 : 0).text(s));
        });
        joined.select('.date').attr('text-anchor', 'middle').attr('y', 18).text(c => c.min === c.max ? c.min : `${c.min}–${c.max}`);
        joined.select('title').text(c => title(c) + '\n' + c.members.map(n => n.name + ' (' + n.start_year + ')').join('\n'));
        report();
    }
    function zoom(factor, anchor = container.clientWidth / 2) {
        const year = scale.invert(container.scrollLeft + anchor);
        k = Math.max(.55, Math.min(64, k * factor));
        draw();
        container.scrollLeft = scale(year) - anchor;
        report();
    }
    function fit(range) {
        k = Math.max(.55, Math.min(64, (extent[1] - extent[0]) / (range[1] - range[0]) * (container.clientWidth - left - right) / base));
        draw();
        container.scrollLeft = scale(range[0]) - left;
        report();
    }
    const wheel = event => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoom(Math.exp(-event.deltaY * .003), event.clientX - container.getBoundingClientRect().left);
            return;
        }
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && (event.shiftKey || container.scrollHeight <= container.clientHeight + 2)) {
            event.preventDefault();
            container.scrollLeft += event.deltaY;
        }
    };
    container.addEventListener('wheel', wheel, { passive: false });
    container.onscroll = report;
    // The parent calls destroy when changing views, avoiding stale wheel listeners.
    draw();
    if (saved) {
        container.scrollLeft = saved.scrollLeft;
        report();
    }
    return { step: zoom, reveal: id => {
            const n = dated.find(n => n.id === id);
            if (!n)
                return;
            highlighted = id;
            const pad = Math.max(3, (extent[1] - extent[0]) / 35);
            fit([n.start_year - pad, n.start_year + pad]);
            container.scrollTop = Math.max(0, top + families.indexOf(family(n)) * lane - container.clientHeight / 2);
        }, reset: () => {
            k = 1;
            draw();
            container.scrollLeft = 0;
            report();
        }, snapshot: () => ({ domain: domain(), scale: k, clusters: clusters.map(c => ({ title: title(c), count: c.members.length, min: c.min, max: c.max })) }), destroy: () => {
            container.removeEventListener('wheel', wheel);
            container.onscroll = null;
        } };
};
