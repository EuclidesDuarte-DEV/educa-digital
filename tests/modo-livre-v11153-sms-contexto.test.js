import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { responderModoLivre,validarMensagem } from '../src/free-chat.js';

const js=readFileSync('public/static/js/free-mode.js','utf8');
const h=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/free-mode.css','utf8');
const sw=readFileSync('public/static/sw.js','utf8');
const cfg=readFileSync('wrangler.toml','utf8');
const makeRequest=(scenario,message,history=[])=>new Request('https://educa.example/api/modo-livre/conversar',{method:'POST',headers:{origin:'https://educa.example','Content-Type':'application/json'},body:JSON.stringify({scenario,message,history})});

test('V111.53: reconhece cenários fictícios novos de SMS, WhatsApp e ligação',()=>{
 for(const id of ['sms-delivery','sms-bank','sms-prize','marketplace','support','relative','call-operator']){
  assert.ok(validarMensagem({scenario:id,message:'Olá, quem fala?'}).message,id);
  assert.match(js,new RegExp("id:'"+id+"'"),id);
 }
 assert.match(js,/SCRIPTED_ORDER=Object\.freeze\(\['family','video','bank'\]\)/);
 assert.match(js,/EXTRA_ORDER=Object\.freeze/);
 assert.match(js,/const pool=\[\.\.\.EXTRA_ORDER/);
 assert.match(js,/if\(s\.channel==='sms'\)openSms\(s\)/);
 assert.match(js,/function openSms\(s\)/);
 assert.match(js,/show\('free-sms'\)/);
 assert.match(js,/visible\(\)==='free-sms'/);
});

test('V111.53: IA que pergunta a função do aluno é detectada e refeita mantendo histórico',async()=>{
 let attempts=0;
 const history=[{role:'assistant',content:'Oi, sou o Rafael. Troquei de número e tive um imprevisto fictício.'},{role:'user',content:'Olá?'},{role:'assistant',content:'Estou falando do telefone novo, lembra?'}];
 const result=await responderModoLivre(makeRequest('family','Olá?',history),{AI:{run:async(_model,opts)=>{
  attempts++;
  assert.match(opts.messages[0].content,/O PARTICIPANTE É O DESTINATÁRIO/);
  assert.match(opts.messages[0].content,/última pergunta/);
  assert.equal(opts.messages.at(-1).content,'Olá?');
  if(attempts===1)return {response:'Qual é a sua função aqui?'};
  assert.ok(opts.messages.some(v=>v.content?.includes('CORREÇÃO:')));
  return {response:'Sou o Rafael, estou falando do número novo. Você pode confirmar comigo pelo telefone antigo, tudo bem?'};
 }}});
 assert.equal(attempts,2);
 assert.equal(result.status,200);
 assert.equal((await result.json()).reply,'Sou o Rafael, estou falando do número novo. Você pode confirmar comigo pelo telefone antigo, tudo bem?');
});

test('V111.53: respostas válidas não exigem segunda consulta nem inventam roteiros',async()=>{
 let count=0;
 const result=await responderModoLivre(makeRequest('sms-delivery','Como posso conferir?'),{AI:{run:async(_model,opts)=>{
  count++;assert.match(opts.messages[0].content,/SMS/);
  return {response:'É uma entrega de exemplo. Confira diretamente pelo aplicativo oficial, sem tocar em links.'};
 }}});
 assert.equal(count,1);
 assert.equal(result.status,200);
 assert.equal((await result.json()).mode,'ia');
 const unavailable=await responderModoLivre(makeRequest('sms-bank','Oi'),{});
 assert.equal(unavailable.status,503);
});

test('V111.53: recusa segura e rejeição de links/dados permanecem',async()=>{
 assert.match(validarMensagem({scenario:'sms-bank',message:'Meu código é 123456'}).error,/Não digite/);
 assert.match(validarMensagem({scenario:'support',message:'https://example.com'}).error,/Não digite/);
 let count=0;
 const result=await responderModoLivre(makeRequest('relative','Prefiro verificar pelo número antigo.'),{AI:{run:async()=>{count++;return {response:'Tudo bem, pode confirmar pelo contato que você já conhece.'};}}});
 assert.equal(count,1);
 assert.equal(result.status,200);
 const body=await result.json();assert.match(body.reply,/confirmar/);
});

test('V111.53: interface SMS legível, acessível, sem telefonia ou SMS reais',()=>{
 for(const id of ['freeSmsView','freeSmsTitle','freeSmsMessages','freeSmsForm','freeSmsInput','freeSmsVerify','freeSmsIgnore','freeSmsBack'])assert.match(h,new RegExp('id="'+id+'"'));
 assert.match(h,/data-view="free-sms"/);
 assert.match(h,/SMS fictício/);
 assert.match(h,/nenhuma mensagem é enviada para números reais/);
 assert.match(css,/\.free-sms-screen/);
 assert.match(css,/\.free-sms-controls/);
 assert.match(css,/min-height:48px/);
 assert.match(css,/@media\(max-width:359px\)/);
 assert.doesNotMatch(js,/twilio|sendSMS|sms:|tel:/i);
});

test('V111.53: cache atualizado, banco oficial e preview intactos',()=>{
 assert.match(h,/free-mode\.js\?v=11153/);
 assert.match(h,/free-mode\.css\?v=11153/);
 assert.match(sw,/educa-cf11153-sms-contexto/);
 assert.match(cfg,/database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
 assert.match(cfg,/database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
});
