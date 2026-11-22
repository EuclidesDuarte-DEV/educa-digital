import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const free=readFileSync('public/static/js/free-mode.js','utf8');
const css=readFileSync('public/static/css/web-quick-result-v11210.css','utf8');
const ai=readFileSync('src/free-chat.js','utf8');
const html=readFileSync('public/html/index.html','utf8');

test('V112.10: promessa de Pix encerra antes de acessar Workers AI',async()=>{
 const start=free.indexOf('async function send(text){'),end=free.indexOf('\nfunction finish(',start);
 assert.ok(start>=0&&end>start);
 const calls=[];
 const state={active:true,scenario:{id:'family',kind:'pix',intro:'Preciso de Pix'},replying:false,blocked:false,
   conversations:new Map([['family',[{role:'assistant',content:'Manda R$ 350 pelo Pix'}]]])};
 const ctx={state,privateData:()=>false,isWebTraining:()=>true,riskyTrainingPromise:()=>true,
  append:()=>calls.push('message'),setStatus:()=>{},registerWebRisk:()=>calls.push('minus15'),
  finish:kind=>calls.push('finish-'+kind),fetch:()=>{calls.push('fetch');throw Error('A IA não deveria ser chamada');}};
 const send=runInNewContext(free.slice(start,end)+'\nsend',ctx);
 await send('VOU TE MANDAR O PIX');
 assert.deepEqual(calls,['message','minus15','finish-risk']);
});

test('V112.10: cair no golpe é definitivo; Bloquear depois não pode virar acerto',()=>{
 const start=free.indexOf("function finish(kind='safe',reason=''){"),
  end=free.indexOf('\nfunction continueTraining(){',start);
 assert.ok(start>=0&&end>start);
 let current='chat',timerMs=null;
 const elements=new Map();
 const $=selector=>{
  if(!elements.has(selector))elements.set(selector,{textContent:'',hidden:false,scrollTop:99,
    classList:{toggle(){},contains(){return true;}}});
  return elements.get(selector);
 };
 const state={active:true,scenario:{id:'family',kind:'pix',tips:'Confirme pelo número antigo'},
  pending:null,score:85,riskyScenarios:new Set(['family']),finished:0,completedSteps:new Set(),
  learningConsent:false,blocked:false,timer:null};
 const ctx={state,$,isWebTraining:()=>true,visible:()=>current,
  home:()=>{},clearRequest:()=>{},video:()=>null,stopVoice:()=>{},
  SCRIPTED_ORDER:['family','video','bank'],BONUS_ORDER:[],
  nextScriptedScenario:()=>({id:'video'}),clearTimeout:()=>{},
  clearTransition:()=>{},show:name=>{current=name;},
  setTimeout:(fn,ms)=>{timerMs=ms;return 123;},els:{notice:{hidden:false}}};
 const finish=runInNewContext(free.slice(start,end)+'\nfinish',ctx);
 finish('risk');
 assert.equal(state.score,85);
 assert.equal(state.finished,0);
 assert.ok(state.completedSteps.has('family'));
 assert.equal(current,'free-summary');
 assert.equal($('#freeSummaryTitle').textContent,'Você perdeu 15 pontos');
 assert.match($('#freeSummaryText').textContent,/Restam 85 pontos/);
 assert.equal($('#freeSummaryNext').textContent,'Ir para o próximo desafio');
 assert.equal($('#freeSummaryAuto').hidden,true);
 assert.equal(timerMs,3200);
 finish('safe','Você bloqueou contato');
 assert.equal(state.score,85);
 assert.equal(state.finished,0);
 assert.equal($('#freeSummaryTitle').textContent,'Você perdeu 15 pontos');
 // Mesmo depois de voltar ao WhatsApp e clicar Bloquear, o desafio já estava perdido.
 state.blocked=false;current='chat';
 finish('safe','Bloqueei depois de cair');
 assert.equal(state.finished,0);
 assert.equal(state.score,85);
 assert.equal($('#freeSummaryTitle').textContent,'Você perdeu 15 pontos');
});

test('V112.10: resumo curto Web sem notificação grande nem pausa, todos botões alcançáveis',()=>{
 assert.match(free,/if\(isWebTraining\(\)&&riskyTrainingPromise\(s,message\)\)\s*\{\s*registerWebRisk\(s,message\);\s*finish\('risk'\);\s*return;/);
 assert.doesNotMatch(free,/free-risk-feedback/);
 assert.match(free,/quickRisk\?3200:2800/);
 assert.match(free,/classList\.contains\('web-quick-risk'\)\)return/);
 assert.match(css,/#freeSummaryView\.web-quick-risk #freeSummaryAuto/);
 assert.match(css,/#freeSummaryView\.web-quick-risk #freeSummaryNext/);
 assert.match(css,/#freeSummaryView\.web-quick-risk #freeSummaryExit/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/justify-content:flex-start!important/);
 assert.match(html,/web-quick-result-v11210\.css\?v=11210/);
 assert.match(html,/score=11210/);
});

test('V112.10: Neural Web consulta grafo em paralelo e evita falas muito longas',()=>{
 assert.match(ai,/Promise\.all\(\[\s*retrieveLiaKnowledge/);
 assert.match(ai,/learningHint\(env,parsed\.scenario\)/);
 assert.match(ai,/max_completion_tokens:webOnly\?85:150/);
 assert.match(ai,/max_tokens:webOnly\?85:130/);
 assert.match(free,/educaPlatform==='web'\?18000:17000/);
 assert.match(free,/fetch\(isWebTraining\(\)\?'\/api\/modo-livre\/conversar-web':'\/api\/modo-livre\/conversar'/);
});
