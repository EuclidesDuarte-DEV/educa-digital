import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const dialogue=readFileSync('public/static/channels/web/dialogue-v11183.js','utf8');
const loader=readFileSync('public/static/channels/web/overrides.js','utf8');

function setup(platform='web', aiReply='Continue a conversa.', level=1){
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
    EducaWebGamification:{getSnapshot:()=>({level})},
    fetch:async(input,opts)=>{
      state.fetchCalls.push([input,opts]);
      return new Response(JSON.stringify({ok:true,mode:'ia',reply:aiReply}),{status:200});
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
  assert.match(loader,/dialogue-v11183\.js\?v=11186/);
  assert.match(loader,/free-events-v11184\.js\?v=11184/);
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
test('[web] V111.85 — conversa pertence à IA, sem mensagens inseridas por roteiro',()=>{
  assert.doesNotMatch(dialogue,/LEVEL_VARIANTS|ed-web-level-scene|sceneTimer|launchChallenge|ed-modo-option/);
  assert.doesNotMatch(dialogue,/Você viu meu pedido de Pix fictício/);
  assert.match(dialogue,/naturalize\(data\.reply\)/);
  assert.match(dialogue,/payload\.history\.map/);
  assert.match(dialogue,/function refreshConversations\(/);
});


test('[web] V111.84 — aceitar indiretamente o Pix conta como decisão arriscada',()=>{
  const classify=setup().window.EducaWebDialogue.classify;
  for(const phrase of [
    'Pode mandar a chave Pix.',
    'Manda sua chave.',
    'Me passa a chave por favor.',
    'Deixa que eu pago.',
    'Deixa comigo.',
    'Pode contar comigo.',
    'Vou fazer o pagamento.',
    'Eu te ajudo com dinheiro.'
  ])assert.equal(classify(phrase,'family'),'unsafe',phrase);
  const history=[{role:'assistant',content:'Preciso de R$ 350 por Pix. Você pode me emprestar?'}];
  for(const phrase of ['Sim','Pode deixar','Beleza','Tá bom','Fechado'])
    assert.equal(classify(phrase,'family',history),'unsafe',phrase);
  assert.equal(classify('Beleza','family'),'continue','sem histórico não presume Pix');
  assert.equal(classify('Vou te ajudar','family',history),'unsafe','ajuda após pedido explícito de dinheiro');
  assert.equal(classify('Vou ajudar a conferir no banco','family',history),'continue','verificação não é aceite de Pix');
  assert.equal(classify('Claro','code',[{role:'assistant',content:'Posso enviar uma explicação?'}]),'continue');
});

test('[web] V111.84 — reconhecer golpe, recusar ou verificar é acerto',()=>{
  const classify=setup().window.EducaWebDialogue.classify;
  for(const phrase of [
    'Você não é a pessoa que diz ser! Você é um ladrão.',
    'Você é um golpista, não vou transferir.',
    'Não mande a chave.',
    'Não pode mandar a chave.',
    'Não vou ajudar com dinheiro.',
    'Não vou passar minha senha.',
    'Vou confirmar com meu filho no número antigo.',
    'Não me engana.',
    'Cai fora.',
    'Vou denunciar.'
  ])assert.equal(classify(phrase,'family'),'safe',phrase);
});

test('[web] V111.84 — não desconta pontos por dúvida, citação ou hipótese',()=>{
  const classify=setup().window.EducaWebDialogue.classify;
  for(const phrase of [
    'Posso mandar Pix?',
    'E se eu mandar o Pix?',
    'Não acredito que vou mandar Pix.',
    'Ela disse que vou mandar Pix.',
    'Se eu não mandar o Pix, acontece algo?',
    'Vou mandar dinheiro depois de confirmar.',
    'Você quer que eu passe a chave?',
    'Devo mandar o Pix ou desconfiar?',
    'Talvez eu mande dinheiro.',
    'O que é uma chave Pix?'
  ])assert.equal(classify(phrase,'family'),'continue',phrase);
});

test('[web] V111.85 — respostas em WhatsApp, SMS e ligação sem exposição do treinamento',()=>{
  const clean=setup().window.EducaWebDialogue.naturalize;
  for(const [original,expected] of [
    ['Você viu meu pedido de Pix fictício?', 'Você viu meu pedido de Pix?'],
    ['Pode responder por aqui, por um Pix de treino?', 'Pode responder por aqui, por um Pix?'],
    ['Sua conta de treinamento tem uma movimentação simulada.', 'Sua conta tem uma movimentação.'],
    ['SMS DE TREINO: O rastreio fictício está pendente.', 'O rastreio está pendente.'],
    ['A taxa fictícia é de R$ 12.', 'A taxa é de R$ 12.']
  ]) assert.equal(clean(original),expected,original);
  assert.match(dialogue,/O SMS inicial conserva o marcador explícito/);
  assert.match(dialogue,/freeCallTranscript/);
  assert.doesNotMatch(dialogue,/QUIZZES|ed-modo-question|launchChallenge/);
});


test('[web] V111.85 — o histórico do personagem é limpo antes de consultar a IA',async()=>{
  const v=setup();
  const requestHistory=[
    {role:'assistant',content:'Preciso de um Pix fictício de R$ 350.'},
    {role:'user',content:'Sério isso?'}
  ];
  await v.window.fetch('/api/modo-livre/conversar',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({scenario:'family',message:'Me conta melhor.',history:requestHistory})
  });
  assert.equal(v.state.fetchCalls.length,1);
  const sent=JSON.parse(v.state.fetchCalls[0][1].body);
  assert.equal(sent.history[0].content,'Preciso de um Pix de R$ 350.');
  assert.equal(sent.history[1].content,'Sério isso?');
});

test('[web] V111.85 — a resposta real da IA é naturalizada, não inventada',async()=>{
  const v=setup();
  v.window.EducaFreeMode.videoState();
  // O provedor simulado fornece uma resposta genérica; o proxy não cria novas falas.
  const response=await v.send('E por que precisa do dinheiro?');
  assert.equal(response.status,200);
  const json=await response.json();
  assert.equal(json.reply,'Continue a conversa.');
  assert.equal(v.state.fetchCalls.length,1);
  assert.equal(v.state.clicks.length,0);
});


test('[web] V111.85 — WhatsApp, SMS, ligação e LIA recebem a resposta real sem termos didáticos',async()=>{
  for(const channel of ['family','sms-delivery','bank','video']){
    const v=setup('web','Olha, me ajuda com um Pix de treino? Preciso pagar uma conta fictícia.');
    const result=await v.send('Por quê?',channel);
    const data=await result.json();
    assert.equal(data.mode,'ia');
    assert.equal(data.reply,'Olha, me ajuda com um Pix? Preciso pagar uma conta.');
    assert.equal(v.state.fetchCalls.length,1,'uma única chamada ao motor real para '+channel);
    assert.equal(v.state.clicks.length,0);
  }
});

test('[web] V111.85 — a limpeza só altera falas do personagem, não decisões ou alertas da interface',()=>{
  const v=setup();
  const clean=v.window.EducaWebDialogue.naturalize;
  const warning='Não informe dados, códigos, senhas ou links reais.';
  assert.equal(clean(warning),warning);
  assert.equal(v.window.EducaWebDialogue.classify('Vou mandar o Pix agora.','family'),'unsafe');
  assert.equal(v.window.EducaWebDialogue.classify('Não vou enviar o dinheiro.','family'),'safe');
  assert.equal(v.window.EducaWebDialogue.classify('Sério isso?','family'),'continue');
  assert.doesNotMatch(dialogue,/setTimeout\s*\(\(\)=>sendVisibleLine|ed-web-level-scene|Pix fictício\? Pode responder/);
});
