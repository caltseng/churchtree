/* Proportional, vertically zoomable timeline. Clustering is computed in screen
   space within each tradition, so clusters dissolve as dates move apart. */
window.renderChurchTimeline = function ({ container, entries, edges, roots, onNode, onEdge, onCluster, period, onRange }) {
    const margin = { top: 130, bottom: 35, left: 62, right: 20 }, height = Math.max(350, container.clientHeight - 4), available = container.clientWidth - 4;
    const family = n => n.tradition_family || 'Other';
    // A temporal cluster is a display grouping, not a newly invented church.
    // Prefer the most specific curated historical group that contains its members.
    const clusterTitle = window.churchClusterTitle;
    const dated = entries.filter(n => !roots.some(r => r.id === n.id) && Number.isFinite(n.start_year));
    if (!dated.length) {
        window.ChurchTimelineModel.originOnly(container,roots,onNode);
        return null;
    }
    const branchLayout=window.ChurchTimelineModel.branchLanes(dated,edges);
    const scopedBranch=new Set(dated.map(family)).size===1;
    const branchSpacing=Math.max(120,(available-margin.left-margin.right)/branchLayout.count);
    const families = [...new Set(dated.map(family))].sort(), laneWidth = Math.max(105, (available - margin.left - margin.right) / families.length), width = Math.max(available, margin.left + (scopedBranch?branchLayout.count*branchSpacing:families.length*laneWidth) + margin.right);
    const years = dated.map(n => n.start_year), extent = period || [Math.min(...years) - 10, Math.max(...years) + 10];
    const scale = d3.scaleLinear().domain(extent).range([margin.top, height - margin.bottom]);
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height).attr('aria-label', 'Proportional timeline; mouse wheel zooms time and drag pans');
    const defs = svg.append('defs');
    defs.append('clipPath').attr('id', 'timeline-clip').append('rect').attr('x', margin.left).attr('y', margin.top - 10).attr('width', width - margin.left).attr('height', height - margin.top - margin.bottom + 20);
    defs.append('marker').attr('id', 'time-arrow').attr('viewBox', '0 -4 8 8').attr('refX', 7).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto').append('path').attr('d', 'M0,-3L7,0L0,3Z').attr('fill', 'var(--ct-arrow)');
    const axis = svg.append('g').attr('class', 'time-axis').attr('transform', `translate(${margin.left - 8},0)`), plot = svg.append('g').attr('clip-path', 'url(#timeline-clip)'), links = plot.append('g'), cards = plot.append('g');
    svg.append('text').attr('x', 14).attr('y', 16).attr('class', 'mode-note').text('True time scale · wheel to zoom · drag to pan · select a cluster to expand');
    const rootGroup = svg.append('g');
    roots.slice(0, 3).forEach((root, i) => {
        const g = rootGroup.append('g').attr('class', 'node context').attr('data-id', root.id).attr('transform', `translate(${margin.left + i * 225},30)`).attr('role', 'button').attr('tabindex', 0).on('click', () => onNode(root.id)).on('keydown', ev => {
            if (ev.key === 'Enter')
                onNode(root.id);
        });
        g.append('rect').attr('width', 205).attr('height', 49).attr('rx', 6);
        g.append('text').attr('x', 10).attr('y', 20).text(root.short_label || root.name);
        g.append('text').attr('x', 10).attr('y', 38).attr('class', 'date').text('Origin context · outside time scale');
    });
    families.forEach((f, i) => {
        svg.append('text').attr('class', 'mode-note').attr('x', margin.left + i * laneWidth + laneWidth / 2).attr('y', 111).attr('text-anchor', 'middle').text(f);
    });
    let transform = d3.zoomIdentity, currentClusters = [], highlighted = null;
    function draw(t) {
        transform = t;
        const y = t.rescaleY(scale), domain = y.domain();
        onRange?.(domain);
        axis.call(d3.axisLeft(y).ticks(Math.max(4, Math.floor((height - margin.top) / 65))).tickFormat(d3.format('d')).tickSize(-(width - margin.left - margin.right)));
        axis.selectAll('.tick line').attr('stroke', 'var(--ct-grid)');
        axis.selectAll('.tick text').attr('fill', 'var(--ct-text-muted)');
        axis.select('.domain').remove();
        const clusters = window.ChurchTimelineModel.cluster(dated,y,54,scopedBranch?n=>branchLayout.positions.get(n.id):family).map(c=>({...c,x:scopedBranch?margin.left+branchSpacing/2+(branchLayout.positions.get(c.members[0].id)||0)*branchSpacing:margin.left+families.indexOf(c.family)*laneWidth+laneWidth/2,y:c.position}));
        currentClusters = clusters;
        const combined = window.ChurchTimelineModel.connections(clusters, edges);
        links.selectAll('path').data(combined, e => e.a.id + '>' + e.b.id).join('path').attr('class', e => 'link ' + (new Set(e.edges.map(x=>x.type)).size>1?'mixed':e.edges[0].type)).attr('marker-end', 'url(#time-arrow)').attr('d', e => {
            const a = e.a, b = e.b;
            if (Math.abs(a.x - b.x) < 1) {
                const side = a.x + Math.min(42, laneWidth * .35);
                return `M${a.x},${a.y + 18} C${side},${a.y + 25} ${side},${b.y - 25} ${b.x},${b.y - 20}`;
            }
            return `M${a.x},${a.y + 18} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y - 20}`;
        }).on('click', (_, e) => e.edges.length === 1 ? onEdge(e.edges[0]) : onCluster(e.a.members.concat(e.b.members), 'Connected records')).selectAll('title').data(e => [e]).join('title').text(e => e.edges.map(x => x.name || x.type).join('; '));
        const visible = clusters.filter(c => c.y >= margin.top - 15 && c.y <= height - margin.bottom + 15);
        const joined = cards.selectAll('g').data(visible, c => c.id).join(enter => {
            const g = enter.append('g').attr('role', 'button').attr('tabindex', 0);
            g.append('rect').attr('rx', 6);
            g.append('text').attr('class', 'time-label');
            g.append('text').attr('class', 'date');
            g.append('title');
            return g;
        }).attr('class', c => 'node time-node' + (c.members.length > 1 ? ' aggregate' : '') + (c.members.some(n => n.id === highlighted) ? ' selected' : '')).attr('data-id',c=>c.members.length===1?c.members[0].id:null).attr('data-members', c => c.members.map(n => n.id).join(',')).attr('transform', c => `translate(${c.x},${c.y})`).attr('aria-label', c => c.members.length > 1 ? `${clusterTitle(c)}, ${c.members.length} entries, ${c.min} to ${c.max}` : c.members[0].name).on('click', (_, c) => {
            if (c.members.length === 1)
                onNode(c.members[0].id);
            else {
                onCluster(c.members, clusterTitle(c));
                const pad = Math.max(2, (c.max - c.min) * .3);
                fit([c.min - pad, c.max + pad]);
            }
        }).on('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                this.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        });
        const boxWidth = Math.min(195, (scopedBranch?branchSpacing:laneWidth) - 12);
        joined.select('rect').attr('x', -boxWidth / 2).attr('y', -22).attr('width', boxWidth).attr('height', 44);
        joined.select('.time-label').attr('x', 0).attr('y', -3).attr('text-anchor', 'middle').each(function (c) {
            const text = d3.select(this);
            text.selectAll('*').remove();
            const words = clusterTitle(c).split(/\s+/), lines = [];
            let line = '';
            const limit = Math.max(12, Math.floor(boxWidth / 6));
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
            const shown = lines.slice(0, 2);
            if (lines.length > 2)
                shown[1] = shown[1].replace(/…$/, '') + '…';
            text.attr('y', shown.length > 1 ? -10 : -3);
            shown.forEach((part, i) => text.append('tspan').attr('x', 0).attr('dy', i ? 12 : 0).text(part));
        });
        // Measure rendered glyphs: system fonts differ between Windows and Linux.
        joined.selectAll('.time-label tspan').each(function(){
            const full=this.textContent;let length=full.length;
            while(this.getComputedTextLength()>boxWidth-12&&length>1){length--;this.textContent=full.slice(0,length).replace(/…$/,'')+'…';}
        });
        joined.select('.date').attr('x', 0).attr('y', 14).attr('text-anchor', 'middle').text(c => (c.min === c.max ? c.min : `${c.min}–${c.max}`));
        joined.select('title').text(c => clusterTitle(c) + '\n' + c.members.map(n => `${n.name} (${n.start_year})`).join('\n'));
    }
    const zoom = d3.zoom().scaleExtent([.6, 100]).filter(e => !e.button && (!e.target.closest('.node') || e.type === 'wheel')).on('zoom', event => draw(event.transform));
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('touchstart.zoom touchmove.zoom touchend.zoom touchcancel.zoom',null);
    const stopTouch=window.ChurchTimelineModel.touch(container,{
        pan:(dx,dy)=>{container.scrollLeft-=dx;svg.interrupt().call(zoom.transform,d3.zoomIdentity.translate(transform.x,transform.y+dy).scale(transform.k));},
        pinch:(factor,a,b)=>{
            const box=svg.node().getBoundingClientRect(), parent=container.getBoundingClientRect();
            const before=a.y+parent.top-box.top, after=b.y+parent.top-box.top;
            const k=Math.max(.6,Math.min(100,transform.k*factor));
            svg.interrupt().call(zoom.transform,d3.zoomIdentity.translate(0,after-(before-transform.y)*k/transform.k).scale(k));
        }
    });
    function fit(domain) {
        const k = (extent[1] - extent[0]) / (domain[1] - domain[0]), bounded = Math.max(.6, Math.min(100, k)), target = d3.zoomIdentity.translate(0, margin.top - bounded * scale(domain[0])).scale(bounded);
        svg.transition().duration(300).call(zoom.transform, target);
    }
    draw(d3.zoomIdentity);
    return { pan: fraction => svg.transition().duration(250).call(zoom.translateBy,0,-fraction*(height-margin.top-margin.bottom)/transform.k), destroy: () => { stopTouch(); svg.interrupt(); svg.on('.zoom', null); }, reveal: id => {
            const n = dated.find(n => n.id === id);
            if (!n)
                return;
            highlighted = id;
            const pad = Math.max(3, (extent[1] - extent[0]) / 35);
            fit([n.start_year - pad, n.start_year + pad]);
        }, step: factor => svg.transition().duration(250).call(zoom.scaleBy, factor, [width / 2, (margin.top + height - margin.bottom) / 2]), reset: () => svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity), snapshot: () => ({ domain: transform.rescaleY(scale).domain(), clusters: currentClusters.map(c => ({ title: clusterTitle(c), count: c.members.length, min: c.min, max: c.max })), scale: transform.k }) };
};
