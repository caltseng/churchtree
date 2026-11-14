const path=require('path'),fs=require('fs');const root=path.resolve(__dirname,'../dist');
if(!fs.existsSync(path.join(root,'index.html')))throw Error('Run npm run build first.');
const server=require('./test-server.cjs')(root);const port=Number(process.env.PORT||4173);
server.on('error',error=>{console.error(error.message);process.exitCode=1;});server.listen(port,'127.0.0.1',()=>console.log(`Main Branch: http://127.0.0.1:${port}`));
