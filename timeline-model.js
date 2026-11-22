/* Pure temporal clustering shared by both timeline orientations. Geometry is
 * supplied by the renderer; this module never changes historical dates. */
window.ChurchTimelineModel = {
    cluster(entries, scale, gap, partition = entry => entry.tradition_family || 'Other') {
        const families = new Map();
        for (const entry of entries) {
            const family = partition(entry);
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
                    family: group[0].tradition_family || 'Other', partition: family, members: group, position: position(group),
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
// Place branches by the terminal histories reachable from each body. Splits
// diverge toward different leaves; mergers converge on their shared successor.
window.ChurchTimelineModel.branchLanes = function(entries, edges) {
  const ids=new Set(entries.map(n=>n.id)),children=new Map(entries.map(n=>[n.id,[]]));
  for(const e of edges)if(ids.has(e.from_id)&&ids.has(e.to_id))children.get(e.from_id).push(e.to_id);
  const leaves=entries.filter(n=>!children.get(n.id).length).sort((a,b)=>a.id.localeCompare(b.id));
  const leafIndex=new Map(leaves.map((n,i)=>[n.id,i])),cache=new Map(),visiting=new Set();
  function terminals(id){if(cache.has(id))return cache.get(id);if(visiting.has(id))return new Set();visiting.add(id);const found=new Set();if(leafIndex.has(id))found.add(id);for(const child of children.get(id)||[])for(const leaf of terminals(child))found.add(leaf);visiting.delete(id);cache.set(id,found);return found;}
  const positions=new Map();for(const n of entries){const reach=[...terminals(n.id)];positions.set(n.id,reach.length?Math.round(2*reach.reduce((sum,id)=>sum+leafIndex.get(id),0)/reach.length):0);}
  const used=[...new Set(positions.values())].sort((a,b)=>a-b);
  for(const [id,slot] of positions)positions.set(id,used.indexOf(slot));
  return {positions,count:Math.max(1,used.length)};
};
// Own gestures only inside the interactive viewport. Rebase on every finger
// transition so adding/removing a finger never jumps the time scale.
window.ChurchTimelineModel.touch = function(element, {pan, pinch}) {
  const oldAction=element.style.touchAction;
  element.style.touchAction='none';
  let previous=null, moved=false, suppressUntil=0, origin=null;
  function points(event) {
    const box=element.getBoundingClientRect(), touches=Array.from(event.touches).slice(0,2);
    if(!touches.length)return null;
    return {count:touches.length,x:touches.reduce((s,t)=>s+t.clientX-box.left,0)/touches.length,y:touches.reduce((s,t)=>s+t.clientY-box.top,0)/touches.length,d:touches.length===2?Math.hypot(touches[1].clientX-touches[0].clientX,touches[1].clientY-touches[0].clientY):0};
  }
  function start(event) {
    if(!previous){moved=false;origin=points(event);suppressUntil=0;}
    previous=points(event);
    if(previous?.count===2){moved=true;event.preventDefault();}
  }
  function move(event) {
    const next=points(event);
    if(!next||!previous)return;
    if(next.count===previous.count){
      if(next.count===2){event.preventDefault();moved=true;pinch(next.d/Math.max(1,previous.d),previous,next);}
      else if(moved||Math.hypot(next.x-origin.x,next.y-origin.y)>5){event.preventDefault();moved=true;pan(next.x-previous.x,next.y-previous.y);}
    }
    previous=next;
  }
  function end(event) {
    if(moved){event.preventDefault();suppressUntil=Date.now()+500;}
    previous=event.type==='touchcancel'?null:points(event);
    if(previous)origin=previous;
  }
  function click(event){if(Date.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}}
  const handlers={touchstart:start,touchmove:move,touchend:end,touchcancel:end};
  for(const [type,handler] of Object.entries(handlers))element.addEventListener(type,handler,{passive:false});
  element.addEventListener('click',click,true);
  return ()=>{for(const [type,handler] of Object.entries(handlers))element.removeEventListener(type,handler);element.removeEventListener('click',click,true);element.style.touchAction=oldAction;};
};
// The overview/compact lineage has spatial zoom rather than a time domain.
window.ChurchTimelineModel.graphGestures = function(container,svg,scene,width,height,initial=1){
  let k=initial,drag=null;
  function size(){svg.attr('width',Math.max(container.clientWidth-2,width*k)).attr('height',Math.max(container.clientHeight-2,height*k));scene.attr('transform',`scale(${k})`);}
  function zoom(factor,a,b=a){
    const x=(container.scrollLeft+a.x)/k,y=(container.scrollTop+a.y)/k;
    k=Math.max(.5,Math.min(4,k*factor));size();
    container.scrollLeft=x*k-b.x;container.scrollTop=y*k-b.y;
  }
  const stop=window.ChurchTimelineModel.touch(container,{pan:(dx,dy)=>{container.scrollLeft-=dx;container.scrollTop-=dy;},pinch:zoom});
  const wheel=event=>{if(event.ctrlKey||event.metaKey){event.preventDefault();const box=container.getBoundingClientRect();zoom(Math.exp(-event.deltaY*.003),{x:event.clientX-box.left,y:event.clientY-box.top});}};
  const down=event=>{if(event.pointerType!=='mouse'||event.button||event.target.closest('.node,.link'))return;drag={x:event.clientX,y:event.clientY};container.setPointerCapture(event.pointerId);};
  const move=event=>{if(!drag)return;container.scrollLeft+=drag.x-event.clientX;container.scrollTop+=drag.y-event.clientY;drag={x:event.clientX,y:event.clientY};};
  const up=()=>drag=null;
  const key=event=>{if(event.target!==container)return;const center={x:container.clientWidth/2,y:container.clientHeight/2};
    if(['+','=','-','0'].includes(event.key)){event.preventDefault();zoom(event.key==='0'?1/k:event.key==='-'?1/1.25:1.25,center);}
    else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();container.scrollLeft+=event.key==='ArrowLeft'?-60:event.key==='ArrowRight'?60:0;container.scrollTop+=event.key==='ArrowUp'?-60:event.key==='ArrowDown'?60:0;}
  };
  const handlers={pointerdown:down,pointermove:move,pointerup:up,pointercancel:up,keydown:key};
  container.addEventListener('wheel',wheel,{passive:false});for(const [type,handler]of Object.entries(handlers))container.addEventListener(type,handler);
  size();
  return {snapshot:()=>({scale:k,left:container.scrollLeft,top:container.scrollTop}),destroy:()=>{stop();container.removeEventListener('wheel',wheel);for(const [type,handler]of Object.entries(handlers))container.removeEventListener(type,handler);}};
};

window.ChurchTimelineModel.timelineLanes = function (dated, edges) {
    const family = n => n.tradition_family || 'Other';
    const isCatholic = n => n.id === 'catholic-church';
    const families = [...new Set(dated.map(family))].sort((a, b) =>
        Number(b === 'Catholic') - Number(a === 'Catholic') || a.localeCompare(b));
    const scopedBranch = families.length === 1;
    const branchLayout = scopedBranch ? this.branchLanes(dated, edges) : null;
    const laneOf = n => scopedBranch ? branchLayout.positions.get(n.id) : families.indexOf(family(n));
    const partition = n => isCatholic(n) ? n.id : laneOf(n);
    return { isCatholic, scopedBranch, laneOf, partition, count: branchLayout?.count ?? families.length, families };
};
