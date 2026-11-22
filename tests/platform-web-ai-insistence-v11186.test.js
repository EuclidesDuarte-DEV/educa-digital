import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {responderModoLivre} from '../src/free-chat.js';

const worker=readFileSync('src/worker.js','utf8');
const frontend=readFileSync('public/static/channels/web/dialogue-v11183.js','utf8');

function fakeRequest(scenario='family',level=3,tries=1,web=true){
  const route=web?'conversar-web':'conversar';
  const url='https://educa.example/api/modo-livre/'+route;
  return new Request(url,{
    method:'POST',headers:{Origin:'https://educa.example','Content-Type':'application/json'},
    body:JSON.stringify({
      scenario,message:'Não vou mandar Pix.',
      history:[{role:'assistant',content:'Oi, troquei de número. Você consegue me ajudar com uma conta de R$ 350?'}],
      webChallenge:{level,tries}
    })
  });
}
async function getPrompt(scenario,level,tries,web){
  let options=null;
  const r=await responderModoLivre(fakeRequest(scenario,level,tries,web),
    {AI:{run:async(_model,received)=>{options=received;return {response:'Entendi, obrigado por me responder.'};}}},web);
  assert.equal(r.status,200);
  assert.equal((await r.json()).mode,'ia');
  return options.messages[0].content;
}
test('V111.86 — rota Web é separada do endpoint antigo e dispensa D1',()=>{
  assert.match(worker,/rota === '\/api\/modo-livre\/conversar-web'/);
  assert.match(worker,/responderModoLivre\(request, env, true, ctx\)/);
  assert.match(worker,/rota === '\/api\/modo-livre\/conversar'/);
  assert.match(worker,/responderModoLivre\(request, env\)/);
  assert.match(worker,/\/api\/modo-livre\/conversar-web'.*url\.pathname/s);
  assert.match(frontend,/\/api\/modo-livre\/conversar-web/);
});
test('V111.86 — apenas Web avançada tem instrução de insistência limitada',async()=>{
  const native=await getPrompt('family',3,1,false);
  const novato=await getPrompt('family',1,0,true);
  const inter=await getPrompt('family',2,1,true);
  const expert=await getPrompt('family',3,2,true);
  assert.doesNotMatch(native,/Faça apenas UMA tentativa adicional/i);
  assert.match(native,/aceite imediatamente/);
  assert.doesNotMatch(novato,/Faça apenas UMA tentativa adicional/i);
  assert.match(inter,/Faça apenas UMA tentativa adicional/i);
  assert.match(expert,/Faça apenas UMA tentativa adicional/i);
  assert.match(inter,/não peça dados ou transferências reais/i);
  assert.match(expert,/Se a pessoa quiser desligar, bloquear, denunciar ou verificar em outro canal/i);
});
test('V111.86 — o diálogo da LIA por vídeo e telefone usa a mesma lógica Web',async()=>{
  const lia=await getPrompt('video',3,1,true);
  const call=await getPrompt('bank',2,1,true);
  const friend=await getPrompt('friend',3,1,true);
  assert.match(lia,/Faça apenas UMA tentativa adicional/i);
  assert.match(call,/Faça apenas UMA tentativa adicional/i);
  assert.doesNotMatch(friend,/Faça apenas UMA tentativa adicional/i);
});
test('V111.86 — tentativas enviadas pelo cliente são limitadas no backend',async()=>{
  const malformed=await getPrompt('family',3,20000,true);
  // Tentativas acima de 2 recebem clamp, nunca autorização ilimitada.
  assert.match(malformed,/apenas UMA tentativa adicional/i);
  const first=await getPrompt('family',3,0,true);
  assert.doesNotMatch(first,/Faça apenas UMA tentativa adicional/i);
});


test('V111.89 — IA reduz texto apenas na rota Web, sem alterar modelo nativo',async()=>{
  const run=async web=>{
    let captured;
    const env={AI:{run:async(model,options)=>{captured={model,options};return {response:'Pode confirmar por outro contato conhecido.'};}}};
    const response=await responderModoLivre(fakeRequest('family',1,0,web),env,web);
    assert.equal(response.status,200);
    return captured;
  };
  const web=await run(true),native=await run(false);
  assert.equal(web.model,native.model,'modelo não alterado nem substituído');
  assert.equal(web.options.max_completion_tokens,85);
  assert.equal(native.options.max_completion_tokens,150);
  assert.equal(web.options.chat_template_kwargs.enable_thinking,false);
});
