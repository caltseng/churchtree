/* Native horizontal scrolling with proportional dates and screen-space clusters. */
window.renderHorizontalTimeline = function ({ container, entries, edges, onNode, onEdge, onCluster, period, onRange, presentation = {} }) {
    const title = presentation.clusterTitle || window.churchClusterTitle;
    const dateLabel = presentation.dateLabel || (n => String(n.start_year));
    const dated = entries.filter(n => Number.isFinite(n.start_year));
    if (!dated.length) {
        container.innerHTML = '<p class="empty">No dated entries in this branch.</p>';
        return null;
    }
    const { isCatholic, laneOf, partition, count, families } =
        (presentation.lanes || window.ChurchTimelineModel.timelineLanes.bind(window.ChurchTimelineModel))(dated, edges);
    const mobile = matchMedia('(max-width:1099px)').matches, rail = mobile ? 96 : 155, viewWidth = container.clientWidth;
    const cardWidth = mobile ? Math.min(204, Math.max(100, viewWidth - rail - 64)) : 204;
    const left = mobile ? rail + cardWidth / 2 : 270, right = mobile ? cardWidth / 2 : 120, top = 68, lane = 100, axisTop = 26;
    const compactFirstLane = families.length > 1 && families[0] === 'Catholic';
    const laneCenter = index => top + index * lane - (compactFirstLane && index > 0 ? lane - 62 : 0);
    const years = dated.map(n => n.start_year), extent = period || [Math.min(...years) - 10, Math.max(...years) + 10];
    const height = Math.max(container.clientHeight - 20, laneCenter(count - 1) + lane + 40), base = Math.max(1, viewWidth - left - right);
    // Fit narrow screens without reducing the previous maximum time resolution.
    const maxScale = 64 * Math.max(1, 280 / base);
    const stateKey = dated.map(n => n.id).sort().join('|') + ':' + extent.join(',');
    const saved = window.CHURCHTREE_HORIZONTAL_STATE?.key === stateKey ? window.CHURCHTREE_HORIZONTAL_STATE : null;
    let k = saved?.scale || 1, clusters = [], scale, currentWidth, highlighted = null;
    const scene = document.createElement('div');
    scene.className = 'horizontal-scene';
    container.append(scene);
    const svg = d3.select(scene).append('svg').attr('height', height).attr('aria-label', 'Horizontal proportional timeline; scroll sideways and use zoom controls');
    const defs = svg.append('defs');
    defs.append('marker').attr('id', 'horizontal-arrow').attr('viewBox', '0 -4 8 8').attr('refX', 7).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto').append('path').attr('d', 'M0,-3L7,0L0,3Z').attr('fill', 'var(--ct-arrow)');
    const axisBackground = svg.append('rect').attr('x',rail).attr('width','100%').attr('height',37).attr('fill','var(--ct-surface)');
    const axis = svg.append('g').attr('class', 'horizontal-axis').attr('transform', 'translate(0,' + axisTop + ')'), grid = svg.append('g'), links = svg.append('g'), cards = svg.append('g');
    const labels = document.createElement('div');
    labels.className = 'horizontal-lanes';
    labels.style.height = height + 'px';
    labels.style.marginTop = -height + 'px';
    scene.append(labels);
    families.forEach((f, i) => {
        const label = document.createElement('div');
        label.className = 'horizontal-lane-label';
        label.style.top = (laneCenter(i) - 14) + 'px';
        label.textContent = f;
        labels.append(label);
    });
    function domain() {
        return [scale.invert(container.scrollLeft + left), scale.invert(container.scrollLeft + left + base)];
    }
    function report() {
        const axisY=Math.max(axisTop,container.scrollTop+28);
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
        axis.call(d3.axisTop(scale).ticks(Math.max(1, Math.floor(base * k / 110))).tickFormat(d3.format('d')));
        axis.selectAll('text').attr('fill', 'var(--ct-text-muted)');
        axis.selectAll('line,.domain').attr('stroke', 'var(--ct-axis)');
        grid.selectAll('line.lane-guide').data(families).join('line').attr('class', 'lane-guide').attr('x1', left).attr('x2', currentWidth - right).attr('y1', (_, i) => laneCenter(i)).attr('y2', (_, i) => laneCenter(i)).attr('stroke', 'var(--ct-grid)');
        grid.selectAll('line.event-interval').data(presentation.intervalEnd ? dated.filter(n => presentation.intervalEnd(n) > n.start_year) : [], n => n.id)
            .join('line').attr('class', n => 'event-interval ' + (n.date_kind || ''))
            .attr('x1', n => scale(n.start_year)).attr('x2', n => scale(presentation.intervalEnd(n)))
            .attr('y1', n => laneCenter(laneOf(n))).attr('y2', n => laneCenter(laneOf(n)));
        const visible = dated.filter(n => !isCatholic(n) || (n.start_year >= extent[0] && n.start_year <= extent[1]));
        clusters = window.ChurchTimelineModel.cluster(visible, scale, 225, partition).map(c => ({
            ...c, x: c.position, y: laneCenter(laneOf(c.members[0])),
        }));
        const combined = window.ChurchTimelineModel.connections(clusters, edges);
        links.selectAll('path').data(combined, e => e.a.id + '>' + e.b.id).join('path').attr('class', e => 'link ' + (new Set(e.edges.map(x=>x.type)).size>1?'mixed':e.edges[0].type)).attr('marker-end', 'url(#horizontal-arrow)').attr('d', e => {
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
        }).attr('class', c => 'node horizontal-node' + (c.members.length > 1 ? ' aggregate' : '') + (c.members.some(n => n.id === highlighted) ? ' selected' : '')).attr('data-members', c => c.members.map(n => n.id).join(',')).attr('data-id', c => c.members.length === 1 ? c.members[0].id : null).attr('transform', c => `translate(${c.x},${c.y})`).attr('aria-label', c => presentation.dateLabel && c.members.length === 1 ? title(c) + ', ' + dateLabel(c.members[0]) : isCatholic(c.members[0]) ? c.members[0].name + ', ' + c.min + ' schism' : title(c) + ', ' + c.min + '–' + c.max).on('click', (_, c) => {
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
        joined.select('rect').attr('x', c => isCatholic(c.members[0]) ? -58 : -cardWidth / 2).attr('y', c => isCatholic(c.members[0]) ? -22 : -28)
            .attr('width', c => isCatholic(c.members[0]) ? 116 : cardWidth).attr('height', c => isCatholic(c.members[0]) ? 44 : 56);
        joined.select('.horizontal-title').each(function (c) {
            const text = d3.select(this);
            text.selectAll('*').remove();
            const words = title(c).split(/\s+/);
            const limit = Math.max(10, Math.min(30, Math.floor(((isCatholic(c.members[0]) ? 116 : cardWidth) - 12) / 6)));
            let lines = [], line = '';
            for (const word of words) {
                if (line && (line + ' ' + word).length > limit) {
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
        joined.selectAll('.horizontal-title tspan').each(function (c) {
            const width = (isCatholic(c.members[0]) ? 116 : cardWidth) - 12, full = this.textContent;
            let length = full.length;
            while (this.getComputedTextLength() > width && length > 1) this.textContent = full.slice(0, --length).replace(/…$/, '') + '…';
        });
        joined.select('.date').attr('text-anchor', 'middle').attr('y', c => isCatholic(c.members[0]) ? 13 : 18).text(c => presentation.dateLabel && c.members.length === 1 ? dateLabel(c.members[0]) : isCatholic(c.members[0]) ? c.min + ' schism' : Math.floor(c.min) === Math.floor(c.max) ? Math.floor(c.min) : `${Math.floor(c.min)}–${Math.floor(c.max)}`);
        joined.select('title').text(c => title(c) + '\n' + c.members.map(n => n.name + ' (' + dateLabel(n) + ')').join('\n'));
        report();
    }
    function zoom(factor, anchor = container.clientWidth / 2) {
        const year = scale.invert(container.scrollLeft + anchor);
        k = Math.max(.55, Math.min(maxScale, k * factor));
        draw();
        container.scrollLeft = scale(year) - anchor;
        report();
    }
    function fit(range) {
        k = Math.max(.55, Math.min(maxScale, (extent[1] - extent[0]) / (range[1] - range[0]) * (container.clientWidth - left - right) / base));
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
    const stopTouch=window.ChurchTimelineModel.touch(container,{
        pan:(dx,dy)=>{container.scrollLeft-=dx;container.scrollTop-=dy;report();},
        pinch:(factor,a,b)=>{zoom(factor,a.x);container.scrollLeft+=a.x-b.x;container.scrollTop+=a.y-b.y;report();}
    });
    // The parent calls destroy when changing views, avoiding stale wheel listeners.
    draw();
    if (saved) {
        container.scrollLeft = saved.scrollLeft;
        report();
    }
    return { pan:fraction=>{container.scrollLeft+=fraction*container.clientWidth;report();}, step: zoom, reveal: id => {
            const n = dated.find(n => n.id === id);
            if (!n)
                return;
            highlighted = id;
            const pad = Math.max(3, (extent[1] - extent[0]) / 35);
            fit([n.start_year - pad, n.start_year + pad]);
            container.scrollTop = Math.max(0, laneCenter(laneOf(n)) - container.clientHeight / 2);
        }, reset: () => {
            k = 1;
            draw();
            container.scrollLeft = 0;
            report();
        }, snapshot: () => ({ domain: domain(), scale: k, clusters: clusters.map(c => ({ title: title(c), count: c.members.length, min: c.min, max: c.max })) }), destroy: () => {
            stopTouch();
            container.removeEventListener('wheel', wheel);
            container.onscroll = null;
        } };
};
