const http=require('http'),fs=require('fs'),path=require('path');
module.exports=function createServer(root){return http.createServer((request,response)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);}catch{response.writeHead(400);response.end();return;}
 let file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(error,data)=>{const contentType={'.css':'text/css','.js':'application/javascript','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.json':'application/json','.txt':'text/plain','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';response.writeHead(error?404:200,{'Content-Type':contentType});response.end(error?'Not found':data);});
});};
