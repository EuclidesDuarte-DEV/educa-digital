import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {responderModoLivre} from '../src/free-chat.js';

const read=path=>readFileSync(path,'utf8');
const video=read('public/static/js/free-video.js');
const free=read('public/static/js/free-mode.js');
const css=read('public/static/css/lia-call-v11156.css');
const html=read('public/html/index.html');
const sw=read('public/static/sw.js');

test('V111.56: voz que não começa é recuperada sem deixar a chamada bloqueada',()=>{
 assert.match(video,/function recoverVoice\(serial,text,message\)/);
 assert.match(video,/session\.utterance=null;session\.speechQueue=\[\];session\.prefetched=null/);
 assert.match(video,/stopVoiceProgress\(\);toListening\(\);subtitle\(session\.lastSpoken\|\|text\)/);
 assert.match(video,/scheduleListen\(400\)/);
 assert.match(video,/session\.utterance===u/);
 assert.match(video,/A voz do navegador não começou após 4 segundos/);
 assert.match(video,/audioOnly\(phrase,serial\)/);
 assert.match(video,/audio\.onplaying=\(\)=>\{if\(serial===session\.serial\)\{stopVoiceProgress\(\)/);
});
test('V111.56: intro de empréstimo educativo é consistente com histórico',()=>{
 const intro=/Você pode me emprestar R\$ 350 pelo Pix de treino\?/;
 assert.match(video,intro);
 assert.match(free,intro);
 assert.match(free,/videoAccepted:\(\)=>\{[^}]*append\('assistant',byId\.video\.intro\)/);
});
test('V111.56: diálogo da Lia respeita a história e responde perguntas de identidade',async()=>{
 let instruction='';
 const request=new Request('https://educa.example/api/modo-livre/conversar',{
  method:'POST',headers:{Origin:'https://educa.example','Content-Type':'application/json'},
  body:JSON.stringify({scenario:'video',message:'Quem é você?',history:[
   {role:'assistant',content:'Troquei de celular. Você pode me emprestar R$ 350 pelo Pix de treino?'}
  ]})
 });
 const res=await responderModoLivre(request,{AI:{run:async(_,opts)=>{
  instruction=opts.messages[0].content;
  return {response:'Sou a Lia da simulação. Antes de qualquer Pix de treino, confira se você me conhece.'};
 }}});
 assert.equal(res.status,200);
 assert.match(instruction,/A pessoa perguntou identidade/);
 assert.match(instruction,/NÃO repita o pedido sem necessidade/);
 assert.match(instruction,/Se a pessoa desconfiar/);
});
test('V111.56: viewport móvel, desktop e nova versão no cache',()=>{
 assert.match(video,/classList\.toggle\('lia-call-visible'/);
 assert.match(css,/@media \(max-width:700px\)/);
 assert.match(css,/height:calc\(100dvh - 104px\)/);
 assert.match(css,/body\.lia-call-visible #phoneHardware/);
 assert.match(css,/object-fit:contain!important/);
 assert.match(html,/lia-call-v11156\.css\?v=11156/);
 assert.match(html,/free-video\.js\?v=11154&patch=11157/);
 assert.match(sw,/educa-cf11156-lia-voice-viewport/);
});
