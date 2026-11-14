const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),fixtures=path.join(root,'.tmp','build-guard-checks');
if(path.dirname(fixtures)!==path.join(root,'.tmp')||path.basename(fixtures)!=='build-guard-checks'||(fs.existsSync(fixtures)&&fs.lstatSync(fixtures).isSymbolicLink()))throw Error('Unsafe fixture path');
fs.rmSync(fixtures,{recursive:true,force:true});fs.mkdirSync(fixtures,{recursive:true});
function run(script,arg){return spawnSync(process.execPath,[path.join(__dirname,script),arg],{encoding:'utf8'});}
const data={nodes:[{id:'a',name:'Fixture',start_year:1600,citations:['missing']}],edges:[{id:'bad',from_id:'a',to_id:'absent'}],events:[],sources:[],citations:[]};
const file=path.join(fixtures,'bad-data.js');fs.writeFileSync(file,'window.CHURCHTREE_DATA='+JSON.stringify(data)+';');
const bad=run('validate-data.cjs',file);assert.notEqual(bad.status,0);assert.match(bad.stderr,/Dangling edge/);assert.match(bad.stderr,/Unresolved citation/);
const site=path.join(fixtures,'site');fs.mkdirSync(site);fs.writeFileSync(path.join(site,'CNAME'),'main-branch.com\n');fs.writeFileSync(path.join(site,'index.html'),'<link rel="stylesheet" href="missing.css">');
const missing=run('verify-site.cjs',site);assert.notEqual(missing.status,0);assert.match(missing.stderr,/missing missing.css/);
fs.writeFileSync(path.join(site,'missing.css'),'');assert.equal(run('verify-site.cjs',site).status,0);
fs.mkdirSync(path.join(site,'scripts'));const exposed=run('verify-site.cjs',site);assert.notEqual(exposed.status,0);assert.match(exposed.stderr,/Development files must not be published/);
console.log('Broken data, missing assets and exposed development files are rejected.');
