const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../timeline-model.js'),'utf8'),context);
const {cluster,connections}=context.window.ChurchTimelineModel;
const nodes=[{id:'a',start_year:1600,tradition_family:'One'},{id:'b',start_year:1600,tradition_family:'One'},{id:'c',start_year:1602,tradition_family:'One'},{id:'d',start_year:1750,tradition_family:'One'},{id:'e',start_year:1600,tradition_family:'Two'}];
const coarse=cluster(nodes,year=>year,54),fine=cluster(nodes,year=>year*100,54);
assert(fine.length>coarse.length);
for(const groups of [coarse,fine]){
 assert.equal(groups.reduce((sum,c)=>sum+c.members.length,0),nodes.length);
 assert.equal(new Set(groups.flatMap(c=>c.members.map(n=>n.id))).size,nodes.length);
 for(const family of ['One','Two']){const rows=groups.filter(c=>c.family===family).sort((a,b)=>a.position-b.position);for(let i=1;i<rows.length;i++)assert(rows[i].position-rows[i-1].position>=54);}
}
assert(fine.some(c=>c.members.length===2&&c.min===1600&&c.max===1600),'Same-date records must remain grouped, not acquire invented dates');
const edges=[{from_id:'a',to_id:'d'},{from_id:'b',to_id:'d'},{from_id:'a',to_id:'b'}];
const grouped=connections(coarse,edges);assert.equal(grouped.length,1);assert.equal(grouped[0].edges.length,2);
console.log('Temporal clustering invariants and aggregated relationships pass.');

const branchingNodes=['parent','split-a','split-b','union'].map(id=>({id}));
const branching= context.window.ChurchTimelineModel.branchLanes(branchingNodes,[{from_id:'parent',to_id:'split-a'},{from_id:'parent',to_id:'split-b'},{from_id:'split-b',to_id:'union'}]);
assert.notEqual(branching.positions.get('split-a'),branching.positions.get('union'));
assert.equal(branching.positions.get('split-b'),branching.positions.get('union'));
