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
  const LEVEL_VARIANTS={
    family:{
      2:['Estou usando um celular emprestado, por isso esse número é diferente. Preciso resolver uma despesa fictícia de hoje.',
         'Meu aparelho antigo parou de funcionar. A conta fictícia está vencendo e estou falando por este número novo.'],
      3:['Se preferir, posso aparecer em vídeo, mas estou sem acesso ao meu número antigo. A conta de treino está no nome de outra pessoa.',
         'Sei que parece estranho. Estou usando um número novo e a conta fictícia do Pix é de um conhecido. É importante verificar antes de enviar.']
    },
    relative:{
      2:['Tive que trocar de telefone e ainda não consegui recuperar meu número antigo. Você me reconhece?',
         'Estou numa correria com uma despesa de treino e mandei mensagem por este número novo.'],
      3:['Tenho o seu contato do grupo da família. Eu consigo mandar uma foto, mas não consigo atender pelo meu antigo número.',
         'A conta fictícia para o Pix está no nome de outra pessoa, porque o meu acesso está bloqueado. Você consegue confirmar que sou eu?']
    },
    account:{
      2:['O aviso de segurança diz que sua conta pode ficar indisponível. Você conferiu diretamente no aplicativo?',
         'Este alerta apareceu com urgência no nosso sistema simulado. Não use dados verdadeiros para responder.'],
      3:['O aviso apareceu no SMS e no WhatsApp quase ao mesmo tempo. Mesmo assim, verifique pelo aplicativo oficial.',
         'O número exibido pode parecer o atendimento do banco. Isso por si só não comprova a identidade do contato.']
    },
    delivery:{
      2:['A entrega fictícia teria uma taxa inesperada. Você consegue conferir o pedido no aplicativo oficial?',
         'Apareceu uma pendência no envio simulado, mas só o serviço oficial pode confirmar.'],
      3:['O rastreamento parece legítimo, mas a cobrança de treino veio por uma mensagem diferente. Vale conferir a origem.',
         'Recebi um comprovante de entrega fictício, mas o Pix está em nome diferente da empresa. Isso merece verificação.']
    }
  };
  let scene=null;
  function updateScene(){
    const current=phone.dataset.currentView;
    if(!phone.classList.contains('free-active')||current!=='chat'){
      scene=null;
      return;
    }
    const scenario=window.EducaFreeMode?.videoState?.();
    if(scene?.scenario===scenario)return;
    const level=window.EducaWebGamification?.getSnapshot?.().level||1;
    const variants=LEVEL_VARIANTS[scenario]?.[level];
    if(!variants?.length)return; // Novato usa só as mensagens simples originais.
    const wallpaper=document.getElementById('chatWallpaper');
    if(!wallpaper)return;
    const content=variants[Math.floor(Math.random()*variants.length)];
    scene={scenario,content,injected:false};
    const bubble=document.createElement('div');
    bubble.className='message incoming ed-web-level-scene';
    bubble.textContent=content;
    bubble.setAttribute('data-educa-training-scene','');
    wallpaper.appendChild(bubble);
    wallpaper.scrollTop=wallpaper.scrollHeight;
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
      if(scene&&!scene.injected&&scene.scenario===scenario&&
         Array.isArray(payload.history)&&payload.history.length<12){
        scene.injected=true;
        // O texto já está visível para o participante no chat.
        // É acrescentado ao histórico somente na primeira resposta.
        const history=[...payload.history,{role:'assistant',content:scene.content}];
        return originalFetch(input,{...options,body:JSON.stringify({...payload,history})});
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