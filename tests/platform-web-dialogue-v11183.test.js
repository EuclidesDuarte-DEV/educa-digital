import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const dialogue=readFileSync('public/static/channels/web/dialogue-v11183.js','utf8');
const loader=readFileSync('public/static/channels/web/overrides.js','utf8');

function setup(platform='web'){
  const state={active:true,view:'chat',scenario:'family',clicks:[],fetchCalls:[]};
  const nodes={
    freeCallVerify:{click(){state.clicks.push('safe');state.view='free-summary';}},
    freePixConfirm:{click(){state.clicks.push('unsafe');state.view='free-summary';}},
    freeSummaryText:{textContent:'',},
    freeSummaryDetail:{textContent:'Orientação original.'}
  };
  const phone={
    dataset:{get currentView(){return state.view;}},
    classList:{contains:()=>state.active}
  };
  const document={
    documentElement:{dataset:{educaPlatform:platform}},
    getElementById:id=>id==='phoneScreen'?phone:nodes[id]||null
  };
  const window={
    EducaFreeMode:{videoState:()=>state.scenario},
    fetch:async(input,opts)=>{
      state.fetchCalls.push([input,opts]);
      return new Response(JSON.stringify({ok:true,mode:'ia',reply:'Continue a conversa.'}),{status:200});
    }
  };
  vm.runInNewContext(dialogue,{document,window,Response,Promise,queueMicrotask,JSON,Set,String,Math}, {timeout:2000});
  const send=(text,scenario='family')=>{
    state.scenario=scenario;
    return window.fetch('/api/modo-livre/conversar',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({scenario,message:text,history:[]})
    });
  };
  return {window,send,state,nodes};
}
test('[web] V111.83 — reconhecer recusa explícita em mensagens reais',()=>{
  const c=setup().window.EducaWebDialogue.classify;
  for(const message of [
    'Você não é meu filho, você é um ladrão, não irei enviar Pix.',
    'Você é um golpista! Não vou mandar dinheiro.',
    'Eu não vou clicar nesse link',
    'Vou confirmar com meu filho no número antigo.',
    'Vou ligar para o banco pelo aplicativo oficial.',
    'Isso é um golpe',
    'Não vou passar o código que recebi'
  ])assert.equal(c(message,'family'),'safe',message);
});
test('[web] V111.83 — aceitar Pix ou compartilhar códigos encerra com erro',()=>{
  const c=setup().window.EducaWebDialogue.classify;
  for(const [message,scenario] of [
    ['Vou mandar o Pix agora.','family'],
    ['Pode deixar, vou enviar o dinheiro.','video'],
    ['Eu vou fazer um pix de 350 reais.','delivery'],
    ['Vou pagar agora.','bank'],
    ['Vou clicar no link da mensagem.','account'],
    ['Claro, vou passar o código.','code'],
    ['Eu vou informar minha senha.','sms-bank']
  ])assert.equal(c(message,scenario),'unsafe',message);
});
test('[web] V111.83 — perguntas, ironia, hipóteses e ambiguidades não causam punição',()=>{
  const c=setup().window.EducaWebDialogue.classify;
  for(const message of [
    'Quem é você?','Posso mandar Pix?','E se eu mandar o dinheiro?',
    'Talvez eu mande.', 'Vou mandar mensagem pro meu filho para confirmar?',
    'Vou transferir o dinheiro depois de confirmar.',
    'Não sei se é golpe. Me explique?', 'Você diz que eu devo mandar um Pix?',
    'Vou mandar dinheiro só que não, brincadeira.'
  ])assert.equal(c(message,'family'),'continue',message);
  assert.equal(c('Oi, como vai você?','friend'),'continue');
  assert.equal(c('Vou mandar Pix.','friend'),'continue','contatos normais não são golpes');
});
test('[web] V111.83 — uma decisão segura encerra sem chamada à IA e conserva o contexto',async()=>{
  const v=setup();
  const response=await v.send('Você não é meu filho. É um ladrão, não vou mandar Pix.');
  assert.equal(response.status,200);
  await Promise.resolve();
  assert.deepEqual(v.state.clicks,['safe']);
  assert.equal(v.state.fetchCalls.length,0);
  assert.match(v.nodes.freeSummaryText.textContent,/Muito bem/);
  assert.match(v.nodes.freeSummaryDetail.textContent,/Confirme pedidos de familiares/);
});
test('[web] V111.83 — compromisso com Pix encerra com erro e nenhuma transação real',async()=>{
  const v=setup();
  await v.send('Vou enviar Pix para você agora.');
  await Promise.resolve();
  assert.deepEqual(v.state.clicks,['unsafe']);
  assert.equal(v.state.fetchCalls.length,0);
  assert.match(v.nodes.freeSummaryText.textContent,/Nenhum Pix ou envio de dados foi realizado/);
});
test('[web] V111.83 — frases neutras seguem para a IA; fora do Modo Livre, passam intactas',async()=>{
  const v=setup();
  await v.send('Me conta o que aconteceu.');
  assert.equal(v.state.fetchCalls.length,1);
  assert.equal(v.state.clicks.length,0);
  v.state.active=false;
  await v.send('Vou enviar Pix.');
  assert.equal(v.state.fetchCalls.length,2);
  assert.equal(v.state.clicks.length,0);
});
test('[ios/android] V111.83 — desativado inteiramente fora do canal Web',async()=>{
  for(const platform of ['ios','android']){
    const v=setup(platform);
    assert.equal(v.window.EducaWebDialogue,undefined);
    await v.send('Vou enviar Pix.');
    assert.equal(v.state.fetchCalls.length,1);
    assert.equal(v.state.clicks.length,0);
  }
  assert.match(loader,/dialogue-v11183\.js\?v=11183/);
  assert.match(loader,/educaPlatform !== 'web'/);
});

test('[web] V111.83 — feedback contextual não confunde código de SMS com Pix',async()=>{
  const v=setup();
  await v.send('Vou informar minha senha agora.','sms-bank');
  await Promise.resolve();
  assert.deepEqual(v.state.clicks,['unsafe']);
  assert.match(v.nodes.freeSummaryDetail.textContent,/SMS parecido com mensagem bancária/);
  assert.doesNotMatch(v.nodes.freeSummaryDetail.textContent,/destinatário mostrado/);
});
test('[web] V111.83 — nível muda contexto de conversas sem criar questionários',()=>{
  assert.match(dialogue,/LEVEL_VARIANTS/);
  assert.match(dialogue,/Math\.floor\(Math\.random\(\)\*variants\.length\)/);
  assert.match(dialogue,/ed-web-level-scene/);
  assert.match(dialogue,/const history=\[\.\.\.payload\.history/);
  assert.doesNotMatch(dialogue,/launchChallenge|ed-modo-option|ed-modo-question/);
});
