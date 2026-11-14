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
window.ChurchTimelineModel.originOnly = function(container, roots, onNode) {
  const panel=document.createElement('div');panel.className='empty';
  const message=document.createElement('p');message.textContent='Origin context is shown without a fixed founding date. Open the profile to read its history, or choose another branch to explore dated developments.';panel.append(message);
  for(const root of roots){const button=document.createElement('button');button.className='context';button.textContent=root.name;button.onclick=()=>onNode(root.id);panel.append(button);}
  container.append(panel);
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
