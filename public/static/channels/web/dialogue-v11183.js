/* V111.83 — SOMENTE WEB: decisões contextuais no diálogo do Modo Livre.
 * O classificador local decide apenas diante de intenção explícita e inequívoca.
 * Em situações ambíguas não encerra a conversa nem retira pontos.
 * Reutiliza o motor de conclusão (safe/unsafe) já presente no Modo Livre,
 * sem alterar scripts, endpoints ou componentes nativos compartilhados.
 */
(()=>{
  'use strict';
  if(document.documentElement?.dataset?.educaPlatform!=='web')return;
  const phone=document.getElementById('phoneScreen');
  if(!phone||!window.EducaFreeMode||typeof window.fetch!=='function')return;
  const SCAMS=new Set([
    'family','bank','video','code','delivery','call-tech','relative',
    'account','prize','sms-delivery','sms-bank','sms-prize'
  ]);
  const TIPS={
    family:'Confirme pedidos de familiares usando um número antigo e conhecido.',
    relative:'Uma pessoa conhecida pode ser imitada: confira por outro contato.',
    bank:'Bancos não exigem Pix para proteger contas. Use o aplicativo oficial.',
    video:'Imagem e voz podem ser imitados. Verifique a identidade por um canal independente.',
    code:'Códigos de confirmação e senhas nunca devem ser enviados a desconhecidos.',
    'sms-bank':'Mesmo um SMS parecido com mensagem bancária pode ser falso. Abra o aplicativo oficial.',
    'sms-delivery':'Confira taxas inesperadas diretamente no aplicativo da entrega.',
    'sms-prize':'Prêmios e cobranças inesperados devem ser verificados em canais oficiais.',
    account:'Mensagens sobre bloqueio e links devem ser verificadas dentro do serviço oficial.',
    delivery:'Confirme a entrega e qualquer taxa diretamente no aplicativo oficial.',
    prize:'Desconfie de promoções inesperadas que pedem pagamento antecipado.',
    'call-tech':'Não instale aplicativos nem conceda acesso remoto por ligação inesperada.'
  };
  const asText=s=>String(s||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}\s?]/gu,' ')
    .replace(/\s+/g,' ').trim();
  const riskVerbs='enviar|mandar|transferir|fazer|pagar|depositar|passar|compartilhar|informar|clicar|abrir|dar';
  const safeRefusal=new RegExp('\\b(?:nao|nunca|jamais|nem)\\s+(?:(?:vou|irei|quero|pretendo|posso|estou)\\s+)?(?:(?:te|lhe|me)\\s+)?(?:'+riskVerbs+'|mando|envio|pago|passo|faco|compartilho|transfiro|deposito)\\b','g');
  const riskyAction=new RegExp('\\b(?:(?:eu\\s+)?(?:vou|irei|quero|pretendo|estou\\s+indo)\\s+(?:(?:te|lhe|me)\\s+)?(?:'+riskVerbs+')|(?:eu\\s+)?(?:mando|envio|pago|passo|faco|compartilho|transfiro|deposito))\\b','g');
  const safeRecognition=[
    /\b(?:isso|essa mensagem|esse pedido|essa ligacao)\s+(?:e|parece)\s+(?:um\s+)?(?:golpe|fraude)\b/,
    /\bvoce\s+(?:e|parece)\s+(?:um\s+)?(?:golpista|ladrao|fraudador|falso)\b/,
    /\bvoce\s+nao\s+(?:e|eh)\s+(?:meu|minha|o|a|quem)\b/,
    /\b(?:vou|irei|quero|prefiro)\s+(?:bloquear|denunciar|desligar|verificar|conferir|confirmar|consultar)\b/,
    /\b(?:vou|irei|prefiro)\s+(?:ligar\s+para|falar\s+com)\s+(?:meu|minha|o|a|um|uma)?\s*(?:filho|filha|banco|contato|familiar|central|suporte|numero)\b/,
    /\b(?:vou|irei)\s+mandar\s+(?:uma\s+)?mensagem\s+(?:para|pro|pra)\s+(?:o|a|meu|minha)?\s*(?:filho|filha|banco|familiar|contato)\b/,
    /\b(?:nao\s+vou\s+cair\s+nessa|nao\s+confio\s+nesse\s+pedido|parece\s+golpe)\b/
  ];
  /* V111.84: classificador por decisão, sem punir frases exploratórias.
     A última solicitação da personagem ajuda a interpretar respostas curtas.
     Texto e fala transcrita percorrem o MESMO send() e a mesma pontuação. */
  function classify(message,scenario,history=[]){
    if(!SCAMS.has(scenario))return 'continue';
    const raw=String(message||'').trim(),normalized=asText(raw);
    if(!normalized||normalized.length>350||/[?]/.test(raw))return 'continue';
    const conditional=/\b(?:se\s+eu|caso\s+eu|e\s+se|talvez|seria|poderia|mandaria|enviaria|brincadeira|so\s+que\s+nao|se\s+for|depois\s+de\s+confirmar|antes\s+de\s+(?:pagar|mandar|confirmar|conferir|verificar))\b/;
    if(conditional.test(normalized))return 'continue';
    // Negativas no imperativo ("não mande a chave") não significam aceite.
    if(/\b(?:nao|nem|nunca|jamais)\s+(?:me\s+)?(?:manda|mande|envia|envie|passa|passe|pague|paga)\b/.test(normalized))return 'safe';
    if(/\b(?:nao\s+acredito\s+que|ele\s+disse\s+que|ela\s+disse\s+que|alguem\s+disse\s+que)\b/.test(normalized))return 'continue';
    const refusal=[...normalized.matchAll(safeRefusal)];
    let withoutRefusals=normalized;
    for(const match of refusal)withoutRefusals=withoutRefusals.replace(match[0],' ');
    const explicitRefusal=refusal.length>0 ||
      /\b(?:nao\s+(?:vou\s+)?(?:dar\s+dinheiro|ajudar\s+com\s+dinheiro|fazer\s+isso|cair\s+nesse\s+golpe|aceito|caio\s+nessa)|nem\s+pensar|cai\s+fora|nao\s+me\s+engana)\b/.test(normalized);
    const recognized=safeRecognition.some(re=>re.test(normalized)) ||
      /\b(?:e\s+golpe|isso\s+e\s+mentira|voce\s+esta\s+tentando\s+me\s+enganar|nao\s+confio\s+em\s+voce|vou\s+denunciar|vou\s+bloquear)\b/.test(normalized);
    const safe=explicitRefusal||recognized;
    const cashScenarios=new Set(['family','bank','video','relative','delivery','prize','sms-delivery','sms-prize']);
    const wantsMoney=cashScenarios.has(scenario);
    const riskObject=/\b(?:pix|dinheiro|reais|valor|quantia|pagamento|transferencia|chave|codigo|senha|token|link|dados|conta)\b/;
    const direct=[...withoutRefusals.matchAll(riskyAction)].some(m=>{
      const verb=m[0],after=withoutRefusals.slice(m.index+m[0].length,m.index+m[0].length+70);
      const explicit=riskObject.test(after);
      const money=/(?:pagar|depositar|transfiro|transferir|pago|deposito)/.test(verb)&&wantsMoney;
      return explicit||money||
        (/\b(?:mandar|enviar|mando|envio)\b/.test(verb)&&/\b(?:agora|pra voce|para voce)\b/.test(after));
    });
    // Pedir a chave Pix em contexto de golpe já indica intenção de pagar.
    const askingKey=wantsMoney&&
      /\b(?:manda|mande|me\s+manda|me\s+envia|me\s+passa|pode\s+(?:mandar|passar|enviar)|passa|envia)\s+(?:(?:a|sua|o|seu|uma|pra\s+mim)\s+){0,3}(?:chave|pix|dados\s+da\s+conta)\b/.test(withoutRefusals);
    const committing=wantsMoney&&
      /\b(?:deixa\s+(?:comigo|que\s+eu\s+(?:pago|mando|faco|transfiro))|eu\s+(?:te|lhe)\s+(?:ajudo|pago)|pode\s+contar\s+comigo|eu\s+assumo\s+(?:o\s+)?pagamento)\b/.test(withoutRefusals);
    const recent=Array.isArray(history)?history.filter(x=>x?.role==='assistant').slice(-2).map(x=>asText(x.content)).join(' '):'';
    const requestedRisk=/\b(?:pix|dinheiro|emprestimo|empresta|emprestar|transferencia|transferir|pagamento|pagar|codigo|senha|chave)\b/.test(recent);
    const consent=/^(?:sim|certo|beleza|ta\s+bom|tudo\s+bem|pode\s+ser|combinado|fechado|ok|claro|vou\s+fazer|pode\s+deixar)(?:\s+(?:pode\s+deixar|eu\s+faco|eu\s+mando|eu\s+pago|vou\s+ajudar|agora|sim|ok))?$/;
    const implicit=requestedRisk&&consent.test(withoutRefusals);
    const risky=direct||askingKey||committing||implicit;
    if(safe&&risky)return 'continue'; // Mensagem contraditória: evite pontuação automática.
    if(safe)return 'safe';
    if(risky)return 'unsafe';
    return 'continue';
  }
  // Variações curtas e educativas; aparecem como mensagens NORMAIS do
  // WhatsApp, não como questionário ou alerta. A IA recebe a fala vista.
  // Mensagens extras chegam sem quiz, no próprio canal, com dificuldade por nível.
  const LEVEL_VARIANTS={
    family:{
      1:['Você viu meu pedido de Pix fictício? Pode responder por aqui, sem compartilhar dados reais.'],
      2:['Estou usando um celular emprestado, por isso esse número é diferente. Preciso resolver uma despesa fictícia de hoje.',
         'Meu aparelho antigo parou de funcionar. A conta fictícia está vencendo e estou falando por este número novo.'],
      3:['Se preferir, posso aparecer em vídeo, mas estou sem acesso ao meu número antigo. A conta de treino está no nome de outra pessoa.',
         'Sei que parece estranho. Estou usando um número novo e a conta fictícia do Pix é de um conhecido. É importante verificar antes de enviar.']
    },
    relative:{
      1:['Oi, você recebeu minha mensagem deste número novo?'],
      2:['Tive que trocar de telefone e ainda não consegui recuperar meu número antigo. Você me reconhece?',
         'Estou numa correria com uma despesa de treino e mandei mensagem por este número novo.'],
      3:['Tenho o seu contato do grupo da família. Eu consigo mandar uma foto, mas não consigo atender pelo meu antigo número.',
         'A conta fictícia para o Pix está no nome de outra pessoa, porque o meu acesso está bloqueado. Você consegue confirmar que sou eu?']
    },
    account:{
      1:['Você viu o aviso fictício sobre a conta?'],
      2:['O aviso de segurança diz que sua conta pode ficar indisponível. Você conferiu diretamente no aplicativo?',
         'Este alerta apareceu com urgência no nosso sistema simulado. Não use dados verdadeiros para responder.'],
      3:['O aviso apareceu no SMS e no WhatsApp quase ao mesmo tempo. Mesmo assim, verifique pelo aplicativo oficial.',
         'O número exibido pode parecer o atendimento do banco. Isso por si só não comprova a identidade do contato.']
    },
    delivery:{
      1:['A entrega simulada ainda está pendente. Você recebeu o aviso?'],
      2:['A entrega fictícia teria uma taxa inesperada. Você consegue conferir o pedido no aplicativo oficial?',
         'Apareceu uma pendência no envio simulado, mas só o serviço oficial pode confirmar.'],
      3:['O rastreamento parece legítimo, mas a cobrança de treino veio por uma mensagem diferente. Vale conferir a origem.',
         'Recebi um comprovante de entrega fictício, mas o Pix está em nome diferente da empresa. Isso merece verificação.']
    },
    code:{
      1:['Recebeu aquele código de treino?'],
      2:['O sistema simulado diz que o código de acesso vai vencer em alguns minutos.'],
      3:['O alerta fictício chegou por dois canais diferentes. Você consegue confirmar no aplicativo oficial?']
    },
    bank:{
      1:['Sou da central fictícia. Você conseguiu conferir o aviso?'],
      2:['O alerta de segurança apareceu hoje, mas o aplicativo oficial pode mostrar informações diferentes.'],
      3:['O aviso simulado também apareceu em uma mensagem parecida com a do banco. Você confia nesse contato?']
    },
    video:{
      1:['Oi, ainda estou aqui na videochamada de treino. Você ouviu meu pedido?'],
      2:['Estou em outro telefone e preciso resolver a despesa fictícia. Você reconhece minha voz?'],
      3:['Mesmo com esta videochamada, estou num número novo e a conta Pix fictícia é de outra pessoa. Você tem certeza de quem sou?']
    },
    'call-tech':{
      1:['Você ouviu o aviso fictício sobre o celular?'],
      2:['A suposta central de suporte precisa que você aja rápido. Você verificou quem ligou?'],
      3:['O identificador de chamada parece oficial, mas também poderia ser falsificado. Você conferiu a origem por outro meio?']
    },
    'sms-delivery':{
      1:['SMS DE TREINO: Sua entrega simulada ainda está aguardando confirmação.'],
      2:['SMS DE TREINO: o rastreio fictício mostra uma taxa inesperada.'],
      3:['SMS DE TREINO: o código de rastreio parece conhecido, mas o destinatário da cobrança é diferente.']
    },
    'sms-bank':{
      1:['SMS DE TREINO: Confira seu banco pelo aplicativo oficial.'],
      2:['SMS DE TREINO: uma movimentação de teste foi sinalizada como suspeita.'],
      3:['SMS DE TREINO: aviso parecido com o do banco, enviado por número diferente.']
    },
    'sms-prize':{
      1:['SMS DE TREINO: Você recebeu uma mensagem sobre um prêmio fictício.'],
      2:['SMS DE TREINO: a promoção simulada anuncia prazo curto para resgate.'],
      3:['SMS DE TREINO: a oferta parece oficial, mas exige uma taxa antecipada fictícia.']
    },
    prize:{
      1:['Você viu a oferta fictícia que mandei?'],
      2:['A promoção simulada diz que o prazo está quase acabando.'],
      3:['A mensagem parece vir de uma marca conhecida, mas a taxa de treino usa outro destinatário.']
    }
  };
  let scene=null,sceneTimer=null;
  function resetScene(){
    if(sceneTimer!==null)clearTimeout(sceneTimer);
    sceneTimer=null;
    scene=null;
  }
  function sendVisibleLine(target){
    if(scene!==target||!phone.classList.contains('free-active')||
       phone.dataset.currentView!==target.view)return;
    if(document.hidden||Date.now()-(target.lastReplyAt||0)<9000){
      sceneTimer=setTimeout(()=>sendVisibleLine(target),5500);
      return;
    }
    // A chamada deve estar atendida antes de uma segunda fala.
    if(target.view==='free-video'&&target.level===1)return; // Novato: uma fala por vez.
    if(target.view==='free-video'&&(
       window.speechSynthesis?.speaking||
       !document.getElementById('freeVideoVoiceProgress')?.hidden||
       document.getElementById('freeVideoSend')?.disabled)){
      sceneTimer=setTimeout(()=>sendVisibleLine(target),5000);return;
    }
    if(target.view==='free-video'&&!window.EducaVideoCall?.isConnected?.()){
      sceneTimer=setTimeout(()=>sendVisibleLine(target),4500);return;
    }
    if(target.view==='free-call'&&!document.getElementById('freeCallAnswer')?.hidden){
      sceneTimer=setTimeout(()=>sendVisibleLine(target),4500);return;
    }
    const phrases=LEVEL_VARIANTS[target.scenario]?.[target.level]||[];
    if(!phrases.length)return;
    const content=phrases[Math.floor(Math.random()*phrases.length)];
    if(target.view==='chat'){
      const wallpaper=document.getElementById('chatWallpaper');
      if(!wallpaper)return;
      const bubble=document.createElement('div');
      bubble.className='message incoming ed-web-level-scene';
      bubble.textContent=content;
      bubble.setAttribute('data-educa-training-scene','');
      wallpaper.appendChild(bubble);
      wallpaper.scrollTop=wallpaper.scrollHeight;
    }else if(target.view==='free-sms'){
      const messages=document.getElementById('freeSmsMessages');
      if(!messages)return;
      const bubble=document.createElement('p');
      bubble.className='v11153-sms-bubble received ed-web-level-scene';
      const body=document.createElement('span');body.textContent=content;
      const stamp=document.createElement('small');stamp.textContent='Agora · treino';
      bubble.append(body,stamp);messages.appendChild(bubble);
      messages.scrollTop=messages.scrollHeight;
    }else if(target.view==='free-call'){
      const log=document.getElementById('freeCallTranscript');
      if(!log)return;
      const row=document.createElement('p');
      const strong=document.createElement('strong');strong.textContent='Contato fictício: ';
      row.append(strong,document.createTextNode(content));log.appendChild(row);
      log.scrollTop=log.scrollHeight;
      if(window.SpeechSynthesisUtterance&&window.speechSynthesis&&!window.speechSynthesis.speaking){
        try{
          const utterance=new window.SpeechSynthesisUtterance(content);
          utterance.lang='pt-BR';utterance.rate=1.02;
          window.speechSynthesis.speak(utterance);
        }catch(_){}
      }
    }else if(target.view==='free-video'){
      // A LIA mantém sua própria voz, avatar e sincronismo.
      // Usar a mesma API de respostas do vídeo evita uma legenda sem áudio.
      if(!window.EducaVideoCall?.reply)return;
      window.EducaVideoCall.reply(content);
    }else return;
    target.count++;
    target.pending.push(content);
    if(target.pending.length>2)target.pending.shift();
    // Uma ou duas insistências espaçadas, sem mensagens infinitas por conversa.
    if(target.count<(target.level===1?1:2))
      sceneTimer=setTimeout(()=>sendVisibleLine(target),21000+Math.random()*7000);
  }
  function updateScene(){
    const view=phone.dataset.currentView;
    const scenario=window.EducaFreeMode?.videoState?.();
    if(!phone.classList.contains('free-active')||
       !['chat','free-sms','free-call','free-video'].includes(view)||
       !SCAMS.has(scenario)){
      resetScene();return;
    }
    if(scene?.scenario===scenario&&scene.view===view)return;
    resetScene();
    const level=window.EducaWebGamification?.getSnapshot?.().level||1;
    if(!LEVEL_VARIANTS[scenario]?.[level])return;
    scene={scenario,view,level,count:0,pending:[],lastReplyAt:0};
    sceneTimer=setTimeout(()=>sendVisibleLine(scene),
      view==='free-video'?25000:level===1?14500:11000+Math.random()*4000);
  }
  if(typeof MutationObserver==='function')
    new MutationObserver(updateScene).observe(phone,{attributes:true,attributeFilter:['data-current-view','class']});
  const originalFetch=window.fetch.bind(window);
  const nextMicrotask=fn=>typeof queueMicrotask==='function'?queueMicrotask(fn):Promise.resolve().then(fn);
  window.fetch=function(input,options){
    const url=typeof input==='string'?input:input?.url||'';
    if(!/\/api\/modo-livre\/conversar(?:\?|$)/.test(url)||
       !phone.classList.contains('free-active')||
       !['chat','free-sms','free-call','free-video'].includes(phone.dataset.currentView)||
       typeof options?.body!=='string')return originalFetch(input,options);
    let payload;
    try{payload=JSON.parse(options.body);}catch(_){return originalFetch(input,options);}
    const scenario=payload?.scenario;
    if(scenario!==window.EducaFreeMode.videoState?.())return originalFetch(input,options);
    const verdict=classify(payload?.message,scenario,payload?.history);
    if(verdict==='continue'){
      if(scene&&scene.scenario===scenario)scene.lastReplyAt=Date.now();
      if(scene?.pending?.length&&scene.scenario===scenario&&
         Array.isArray(payload.history)&&payload.history.length<12){
        // A IA recebe somente mensagens que a pessoa VIU/OUVIU.
        const context=scene.pending.splice(0,Math.max(0,12-payload.history.length))
          .map(content=>({role:'assistant',content}));
        return originalFetch(input,{...options,body:JSON.stringify({...payload,history:[...payload.history,...context]})});
      }
      return originalFetch(input,options);
    }
    // O Modo Livre já desenhou a mensagem da pessoa antes deste fetch.
    // Finalizamos usando as mesmas ações existentes, sem duplicar o resultado.
    const action=document.getElementById(verdict==='safe'?'freeCallVerify':'freePixConfirm');
    if(!action||typeof Response!=='function')return originalFetch(input,options);
    nextMicrotask(()=>{
      if(!phone.classList.contains('free-active')||
         window.EducaFreeMode.videoState?.()!==scenario||
         phone.dataset.currentView==='free-summary')return;
      action.click();
      const text=document.getElementById('freeSummaryText');
      const detail=document.getElementById('freeSummaryDetail');
      if(phone.dataset.currentView==='free-summary'&&text){
        text.textContent=verdict==='safe'
          ?'Muito bem! Você percebeu o risco e não aceitou a solicitação suspeita.'
          :'Nesta simulação, você aceitou uma solicitação arriscada. Nenhum Pix ou envio de dados foi realizado.';
        if(detail)detail.textContent=(verdict==='safe'
          ?'Você identificou sinais de alerta e preferiu se proteger. '
          :'Pare antes de transferir, clicar ou compartilhar códigos. ')+
          (TIPS[scenario]||'Confira sempre por um canal independente e confiável.');
      }
    });
    // O encerramento aborta a solicitação local e impede resposta fictícia
    // extra da IA. Nenhum dado é enviado à rede para pontuar a decisão.
    return Promise.resolve(new Response(JSON.stringify({ok:true,mode:'ia',reply:'Fim da simulação.'}),{
      status:200,headers:{'Content-Type':'application/json'}
    }));
  };
  window.EducaWebDialogue=Object.freeze({version:'11183',classify});
})();