const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
function list(folder){return fs.readdirSync(folder).flatMap(name=>{const file=path.join(folder,name);return fs.statSync(file).isDirectory()?list(file):[file];});}
const docs=[path.join(root,'README.md'),path.join(root,'AGENTS.md'),path.join(root,'data/README.md'),...list(path.join(root,'docs')),...list(path.join(root,'plans'))].filter(file=>file.endsWith('.md'));
const errors=[];
for(const file of docs){const text=fs.readFileSync(file,'utf8').replace(/```[\s\S]*?```/g,'');for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
 let href=match[1].trim().split(/\s+["']/)[0].replace(/^<|>$/g,'');if(/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(href))continue;href=decodeURIComponent(href.split(/[?#]/)[0]);if(!href)continue;const destination=href.startsWith('/')?path.join(root,href):path.resolve(path.dirname(file),href);if(!fs.existsSync(destination))errors.push(path.relative(root,file)+': '+href);
}}
if(errors.length)throw Error('Broken local documentation links:\n'+errors.join('\n'));
console.log(`Checked local Markdown destinations in ${docs.length} documentation files.`);
