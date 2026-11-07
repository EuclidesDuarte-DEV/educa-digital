/* Educa+ Digital V111.42 — inicializacao unica para apresentacao local (Windows).
   Liga os servicos locais que JA ESTAO INSTALADOS. Sem baixar modelos ou
   instalar dependencias sem o consentimento do responsavel.
   A visita ao site publico nao executa processos no computador do visitante.
*/
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const onWindows=process.platform==='win32';
const checkOnly=process.argv.includes('--verificar');
const logs=join(root,'.local','logs');
const children=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const addr=(port)=>new Promise(done=>{
  const client=net.createConnection({port,host:'127.0.0.1'});
  const finish=ok=>{client.destroy();done(ok);};
  client.setTimeout(450);
  client.once('connect',()=>finish(true));
  client.once('error',()=>finish(false));
  client.once('timeout',()=>finish(false));
});
const command=(cmd,args=[])=>{
  try{
    const result=spawnSync(cmd,args,{cwd:root,encoding:'utf8',windowsHide:true,timeout:8000});
    return !result.error&&result.status===0;
  }catch{return false;}
};
function pythonFor(kind){
  const paths=kind==='motor'?
   [join(root,'lia_motor','.venv','Scripts','python.exe'),join(root,'.venv','Scripts','python.exe')]:
   [join(root,'.venv','Scripts','python.exe'),join(root,'lia_motor','.venv','Scripts','python.exe')];
  for(const p of paths)if(existsSync(p))return {bin:p,args:[]};
  if(command('py',['-3.11','-c','import sys']))return {bin:'py',args:['-3.11']};
  if(command('python',['-c','import sys']))return {bin:'python',args:[]};
  return null;
}
function dependencies(py,mods){
  return !!py&&command(py.bin,[...py.args,'-c',`import ${mods.join(', ')}`]);
}
function logSpawn(label,bin,args,cwd=root,env={}){
  mkdirSync(logs,{recursive:true});
  const out=openSync(join(logs,label+'.out.log'),'a');
  const err=openSync(join(logs,label+'.err.log'),'a');
  let child;
  try{
    child=spawn(bin,args,{cwd,env:{...process.env,...env},windowsHide:true,stdio:['ignore',out,err]});
  }finally{closeSync(out);closeSync(err);}
  children.push(child);
  child.on('error',e=>console.log(`  Erro ao iniciar ${label}: ${e.message}`));
  child.on('exit',(code)=>{if(!stopping)console.log(`  ${label} terminou (${code??'sem codigo'}). Consulte .local/logs.`);});
  return child;
}
async function wait(port,maxMs=14000){
  const until=Date.now()+maxMs;
  while(Date.now()<until){if(await addr(port))return true;await sleep(450);}
  return false;
}
function voiceToken(){
  const path=join(root,'lia_motor','.motor.vars.local');
  let token='';
  if(existsSync(path)){
    const content=readFileSync(path,'utf8');
    token=(content.match(/^LIA_API_TOKEN=(.+)$/m)?.[1]||'').trim();
  }
  if(token.length>=20)return token;
  token=randomBytes(32).toString('base64url');
  writeFileSync(path,`LIA_API_TOKEN=${token}\n`,{encoding:'utf8',mode:0o600});
  console.log('  Credencial local da voz gerada com segurança (nao sera mostrada).');
  return token;
}
function browser(url){
  if(!onWindows)return;
  // URL fixa, sem dados fornecidos pelo usuario ou texto interpolado.
  const task=spawn('cmd.exe',['/d','/c','start "" "http://127.0.0.1:5015"'],{
    cwd:root,windowsHide:true,stdio:'ignore',detached:true
  });
  task.on('error',()=>console.log('  Abra '+url+' no navegador.'));
  task.unref();
}
let stopping=false;
function cleanup(){
  if(stopping)return;stopping=true;
  for(const c of children){try{if(c.pid&&!c.killed)c.kill();}catch{}}
}
process.on('SIGINT',()=>{cleanup();process.exit(0);});
process.on('SIGTERM',()=>{cleanup();process.exit(0);});
process.on('exit',cleanup);

console.log('\nEduca+ Digital V111.42 - inicializacao unica da LIA\n');
if(!onWindows)console.log('  Esta rotina foi preparada para Windows; no Linux/macOS use os comandos do README.');
const installedOllama=command('ollama',['--version']);
const pySite=pythonFor('site'),pyMotor=pythonFor('motor');
const flaskReady=dependencies(pySite,['flask']);
const motorReady=dependencies(pyMotor,['uvicorn','kokoro','soundfile']);
console.log(`  Ollama instalado: ${installedOllama?'sim':'nao'}`);
console.log(`  Flask: ${flaskReady?'pronto':'nao configurado'}`);
console.log(`  Kokoro local: ${motorReady?'pronto':'nao configurado'}`);
if(checkOnly){console.log('  Verificacao concluida. Nenhum processo foi iniciado.');process.exit(0);}

if(!flaskReady){
  console.error('\nPara abrir o site com a LIA local, configure primeiro o Python e o Flask:');
  console.error('  py -3.11 -m venv .venv');
  console.error('  .\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt');
  console.error('O prototipo Cloudflare continua disponivel via npm.cmd run dev.');
  process.exitCode=1;
}else{
  if(!(await addr(11434))){
    if(installedOllama){console.log('  Iniciando Ollama automaticamente...');logSpawn('ollama','ollama',['serve']);}
    else console.log('  Ollama nao instalado; a conversa por IA local depende dele.');
  }else console.log('  Ollama ja estava ligado; mantendo o processo existente.');

  if(!(await addr(8900))){
    if(motorReady){
      const token=voiceToken();
      console.log('  Iniciando Kokoro pf_dora na porta 8900...');
      logSpawn('kokoro',pyMotor.bin,[...pyMotor.args,'-m','uvicorn','server:app','--host','127.0.0.1','--port','8900'],join(root,'lia_motor'),{
        LIA_API_TOKEN:token,LIA_TTS_ENGINE:'kokoro',LIA_PREWARM_VOICE:'true',LIA_MUSETALK_ENABLED:'false'
      });
    }else console.log('  Motor Kokoro Python nao configurado; o Kokoro do navegador continua disponivel.');
  }else console.log('  Motor da voz ja estava ligado; nao sera duplicado.');

  const existing=await addr(5015);
  if(!existing){
    console.log('  Iniciando Educa+ local na porta 5015...');
    logSpawn('educa',pySite.bin,[...pySite.args,'-m','flask','--app','app','run','--host','127.0.0.1','--port','5015','--no-reload'],root);
  }else console.log('  Site ja estava ligado; mantendo o processo existente.');
  if(await wait(5015,14000)){
    console.log('  Prototipo local: http://127.0.0.1:5015');
    console.log('  Painel de logs: .local/logs/');
    console.log('  Feche este terminal ou pressione Ctrl+C para encerrar os servicos iniciados aqui.\n');
    browser('http://127.0.0.1:5015');
  }else console.error('  Site nao respondeu. Confira .local/logs/educa.err.log.');
  // Manter o unico terminal aberto e monitorar o ciclo de vida dos servicos.
  if(children.length){setInterval(()=>{},1000);}
}
