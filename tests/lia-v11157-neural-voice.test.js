import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {escolherModelo,responderModoLivre} from '../src/free-chat.js';
import apiWorker from '../src/worker.js';

const worker=readFileSync('public/static/js/lia-kokoro-worker.js','utf8');
const call=readFileSync('public/static/js/free-video.js','utf8');
const browser=readFileSync('public/static/js/lia-kokoro-browser.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const cache=readFileSync('public/static/sw.js','utf8');
const request=(message,history=[])=>new Request('https://educa.example/api/modo-livre/conversar',{
 method:'POST',headers:{Origin:'https://educa.example','Content-Type':'application/json'},
 body:JSON.stringify({scenario:'video',message,history})
});

test('V111.57: proxy neural só serve arquivos fixos, sem D1 nem SSRF',async()=>{
 const original=globalThis.fetch;
 let fetched='';
 try{
  globalThis.fetch=async url=>{
   fetched=String(url);
   return new Response('{"ok":true}',{status:200,headers:{'Content-Type':'application/json'}});
  };
  const ok=await apiWorker.fetch(new Request('https://educa.example/api/lia-model/config.json'),{});
  assert.equal(ok.status,200);
  assert.match(fetched,/^https:\/\/huggingface\.co\/onnx-community\/Kokoro-82M-v1\.0-ONNX\/resolve\/main\/config\.json$/);
  assert.equal(ok.headers.get('content-type'),'application/json');
  const denied=await apiWorker.fetch(new Request('https://educa.example/api/lia-model/evil-model.bin'),{});
  assert.equal(denied.status,404);
  assert.match((await denied.json()).message,/não permitido/);
 }finally{globalThis.fetch=original;}
});

test('V111.57: Gemma 4 MoE substitui Llama 3.1 e modo 70B continua opt-in',()=>{
 assert.equal(escolherModelo({}), '@cf/google/gemma-4-26b-a4b-it');
 assert.equal(escolherModelo({LIA_AI_MODEL:'inteligente'}),'@cf/meta/llama-3.3-70b-instruct-fp8-fast');
 assert.notEqual(escolherModelo({}), '@cf/meta/llama-3.1-8b-instruct-fp8');
});

test('V111.57: API Gemma 4 retorna chat.completions sem roteiro artificial',async()=>{
 let captured;
 const reply=await responderModoLivre(request('Por que você me ligou?',[
  {role:'assistant',content:'Oi, troquei de celular. Você pode me emprestar R$ 350 pelo Pix de treino?'}
 ]),{AI:{run:async(model,opts)=>{
  captured={model,opts};
  return {choices:[{message:{content:'Troquei de aparelho e precisava de uma ajuda, mas é só um Pix de treino. Você pode confirmar quem sou primeiro.'}}]};
 }}});
 assert.equal(reply.status,200);
 assert.match((await reply.json()).reply,/Pix de treino/);
 assert.equal(captured.model,'@cf/google/gemma-4-26b-a4b-it');
 assert.equal(captured.opts.max_completion_tokens,150);
 assert.match(captured.opts.messages[0].content,/JÁ fez o pedido de empréstimo/);
 assert.match(captured.opts.messages[0].content,/não repita "isto é um treinamento"/);
});

test('V111.57: responde à recusa sem insistir em dinheiro nem dados reais',async()=>{
 let instruction='';
 const response=await responderModoLivre(request('Não vou te mandar Pix, vou confirmar pelo número antigo',[
  {role:'assistant',content:'Oi, troquei de celular. Você pode me emprestar R$ 350 pelo Pix de treino?'}
 ]),{AI:{run:async(_,opts)=>{
  instruction=opts.messages[0].content;
  return {choices:[{message:{content:'Entendo. Pode confirmar pelo contato que você já conhecia. Não envie nada.'}}]};
 }}});
 assert.equal(response.status,200);
 assert.match(instruction,/finalize com respeito/);
 assert.match(instruction,/Não solicite CPF/);
 assert.doesNotMatch((await response.json()).reply,/enviar dinheiro/);
});

test('V111.57: falas com dinheiro são fonetizadas por extenso e não muda o cenário',()=>{
 const start=worker.indexOf('function valorPorExtenso(n){');
 const end=worker.indexOf('function wav(',start);
 assert.ok(start>=0&&end>start);
 const functions=vm.runInNewContext(worker.slice(start,end)+';({normalizeSpeechPtBR,valorPorExtenso})');
 assert.equal(functions.normalizeSpeechPtBR('Me empresta R$ 350 pelo Pix de treino?'),
  'Me empresta trezentos e cinquenta reais pelo Pix de treino?');
 assert.equal(functions.normalizeSpeechPtBR('Taxa de R$ 12.'),'Taxa de doze reais.');
 assert.equal(functions.normalizeSpeechPtBR('R$ 1.'),'um real.');
 assert.match(worker,/const MODEL='onnx-community\/Kokoro-82M-v1\.0-ONNX'/);
 assert.match(worker,/const VOICE='pf_dora'/);
 assert.match(worker,/const speed=style==='calma'\?\.94:style==='clara'\?\.98:1\.00/);
});

test('V111.57: áudio neural tardio do iPhone só toca se conversa ainda for a mesma',()=>{
 assert.match(call,/async function playBrowserResult\(result,text,serial\)/);
 assert.match(call,/if\(expired\|\|serial!==session\.serial\|\|!session\.active\|\|!session\.connected\|\|session\.waiting\|\|session\.utterance\)return/);
 assert.match(call,/void pending\.then\(result=>/);
 assert.match(call,/clearTimeout\(lateTimer\)/);
 assert.match(call,/scheduleListen\(400\)/);
});

test('V111.57: codec neural atenua bordas, versão de voz renova e bancos seguem iguais',()=>{
 assert.match(worker,/const fade=Math\.min\(1,i\/72,\(n-1-i\)\/72\)/);
 assert.match(browser,/lia-kokoro-worker\.js\?v=11157/);
 assert.match(browser,/voice:'pf_dora',version:'11157'/);
 assert.match(html,/lia-kokoro-browser\.js\?v=11157/);
 assert.match(cache,/const CACHE = 'educa-cf11157-lia-neural-gemma4-voice-r2'/);
 assert.doesNotMatch(cache,/\/api\/.*cache\.put/);
 const wrangler=readFileSync('wrangler.toml','utf8');
 assert.match(wrangler,/database_name = "educa-digital"/);
 assert.match(wrangler,/database_name = "educa-digital-preview"/);
 assert.match(wrangler,/LIA_CONTAINER_ENABLED = "false"/);
});
