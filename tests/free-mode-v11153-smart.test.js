import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validarMensagem,responderModoLivre} from '../src/free-chat.js';

const read=p=>readFileSync(p,'utf8');
const js=read('public/static/js/free-mode.js');
const html=read('public/html/index.html');
const css=read('public/static/css/free-mode.css');
const sw=read('public/static/sw.js');
const config=read('wrangler.toml');
const req=(scenario,message,history=[])=>new Request('https://educa.example/api/modo-livre/conversar',{
 method:'POST',headers:{Origin:'https://educa.example','Content-Type':'application/json'},
 body:JSON.stringify({scenario,message,history})
});
test('V111.53: IA entende Olá e repara resposta fora do contexto sem inventar roteiro',async()=>{
 let count=0;
 const env={AI:{run:async(model,opts)=>{
  count++;
  assert.match(model,/llama-3\.1-8b/);
  assert.match(opts.messages[0].content,/A pessoa apenas cumprimentou/);
  assert.match(opts.messages[0].content,/Rafael, familiar fictício/);
  assert.equal(opts.messages.at(-1)?.content==='olá'||opts.messages.at(-1)?.role==='system',true);
  return {response:count===1?'Qual é sua função aqui?':'Oi! É o Rafael da simulação, do celular novo. Podemos conferir minha identidade antes de continuar?'};
 }}};
 const response=await responderModoLivre(req('family','olá',[{role:'assistant',content:'Oi, sou o Rafael. Troquei de número.'}]),env);
 assert.equal(response.status,200);
 assert.equal(count,2);
 const data=await response.json();
 assert.equal(data.mode,'ia');
 assert.match(data.reply,/Rafael/);
 assert.doesNotMatch(data.reply,/função aqui/);
});
test('V111.53: falha explicitamente caso a IA repita resposta desconexa',async()=>{
 let attempts=0;
 const response=await responderModoLivre(req('family','Olá?'),{AI:{run:async()=>{attempts++;return {response:'Qual é sua função aqui?'};}}});
 assert.equal(response.status,503);assert.equal(attempts,2);
});
test('V111.53: SMS e ligação fictícios aceitos, informações reais proibidas',async()=>{
 for(const scenario of ['relative','account','prize','sms-delivery','sms-bank','sms-prize','call-tech'])
  assert.equal(validarMensagem({scenario,message:'Como posso verificar?'})?.scenario,scenario);
 assert.match(validarMensagem({scenario:'sms-bank',message:'Meu código é 12345678'}).error,/Não digite/);
 const response=await responderModoLivre(req('sms-delivery','É um golpe?'),{AI:{run:async(model,opts)=>{
  assert.match(opts.messages[0].content,/entrega pendente/i);
  assert.match(opts.messages[0].content,/Se a pessoa desconfiar/);
  return {response:'Você pode verificar no aplicativo oficial; esta é uma simulação.'};
 }}});
 assert.equal(response.status,200);
});
test('V111.53: sequência preserva WhatsApp, vídeo e ligação antes do SMS',()=>{
 assert.match(js,/SCRIPTED_ORDER=Object.freeze\(\['family','video','bank'\]\)/);
 assert.match(js,/BONUS_ORDER=Object.freeze\(\['sms-delivery','relative','call-tech','sms-bank'/);
 assert.match(js,/BONUS_ORDER.find\(id=>!state.completedSteps.has\(id\)\)/);
 assert.match(js,/nextScriptedScenario\(\)/);
 assert.match(js,/if\(s.channel==='sms'\)openSms\(s\)/);
 assert.match(js,/next\?\.channel==='sms'/);
 assert.match(js,/schedule\(900,1500\)/);
});
test('V111.53: SMS integrado no celular sem dados ou links reais',()=>{
 assert.match(html,/data-view="free-sms" id="freeSmsView"/);
 for(const id of ['freeSmsMessages','freeSmsSender','freeSmsForm','freeSmsInput','freeSmsSend','freeSmsVerify','freeSmsBlock','freeSmsBack'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/SMS SIMULADO · TREINAMENTO/);
 assert.match(js,/function openSms\(s\)/);
 assert.match(js,/function renderSmsBubble\(role,text\)/);
 assert.match(js,/if\(visible\(\)==='free-sms'\)/);
 assert.match(js,/Você ignorou e bloqueou a mensagem suspeita/);
 assert.match(css,/min-height:49px/);
 assert.match(css,/@media\(max-width:359px\)/);
});
test('V111.53: chamada fictícia escuta somente depois da ação do participante',()=>{
 assert.match(html,/LIGAÇÃO DE TREINAMENTO/);
 assert.match(html,/Sem ligação real/);
 assert.match(js,/state.callHandsFree=true;listen\(\)/);
 assert.match(js,/if\(state.callHandsFree&&state.active&&visible\(\)==='free-call'/);
 assert.match(js,/window.EducaLiaVoice\?\.choose\?\.\(\)/);
 assert.match(js,/r.lang='pt-BR'/);
 assert.match(js,/r.onresult=e=>/);
});
test('V111.53: build sem containers pagos e bancos D1 preservados',()=>{
 assert.match(sw,/educa-cf11153-modo-livre-sms-contextual|educa-cf11154-home-video-cue|educa-cf11155-bank-spotlight|educa-cf11156-lia-voice-viewport/);
 assert.match(html,/free-mode\.js\?v=11153/);
 assert.match(html,/free-mode\.css\?v=11153/);
 assert.match(config,/database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
 assert.match(config,/database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
 assert.match(config,/LIA_CONTAINER_ENABLED = "false"/);
});
