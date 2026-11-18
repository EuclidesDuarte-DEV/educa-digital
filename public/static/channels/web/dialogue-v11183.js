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
    if(/\b(?:nao|nem|nunca|jamais)\s+(?:pode\s+)?(?:me\s+)?(?:mandar|passar|enviar|pagar|manda|mande|envia|envie|passa|passe|pague|paga)\b/.test(normalized))return 'safe';
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
    // Frases de concordância que dependem do pedido imediatamente anterior.
    const helping=requestedRisk&&wantsMoney&&
      /\b(?:vou|irei|quero|posso|eu\s+vou)\s+(?:(?:te|lhe)\s+)?(?:ajudar|resolver\s+isso|cuidar\s+disso|fazer\s+isso)\b/.test(withoutRefusals)&&
      !/\b(?:conferir|confirmar|verificar|identificar|denunciar|bloquear|consultar|investigar)\b/.test(withoutRefusals);
    const risky=direct||askingKey||committing||implicit||helping;
    if(safe&&risky)return 'continue'; // Mensagem contraditória: evite pontuação automática.
    if(safe)return 'safe';
    if(risky)return 'unsafe';
    return 'continue';
  }
  // Variações curtas e educativas; aparecem como mensagens NORMAIS do
  // WhatsApp, não como questionário ou alerta. A IA recebe a fala vista.
  /* V111.85 — IMERSÃO WEB: a conversa pertence à IA, não a um roteiro
   * que injeta frases a cada 15 s. Avisos pedagógicos continuam nos
   * elementos de orientação da interface, fora dos balões do personagem.
   * Nunca reescrever mensagens enviadas pelo participante.
   */
  function naturalize(value){
    const original=String(value||'');
    let text=original
      .replace(/^\s*SMS\s+(?:SIMULADO|DE\s+TREINO)\s*:\s*/iu,'')
      .replace(/\b(?:Pix|transferência)\s+(?:de\s+)?(?:treino|treinamento|fict[ií]ci[oa]|simulad[oa])\b/giu,m=>m.split(/\s+/)[0])
      .replace(/\b(conta|taxa|pedido|despesa|pagamento|prêmio|empréstimo|código|valor|entrega|aviso|movimentação|promoção|rastreio|central)\s+(?:de\s+)?(?:treino|treinamento|fict[ií]ci[oa]|simulad[oa])\b/giu,'$1')
      .replace(/\b(?:nesta|nessa)\s+simulação\s*[,;:—-]?\s*/giu,'')
      .replace(/\b(?:de\s+treinamento|de\s+treino|fict[ií]ci[oa]|simulad[oa])\b/giu,'')
      .replace(/\s+([.,;:!?])/g,'$1')
      .replace(/\s{2,}/g,' ')
      .trim();
    // Remova instruções metalinguísticas que são próprias da interface.
    text=text.replace(/(?:^|[.!?]\s+)(?:tudo aqui é|isto é|isso é|este é|esta é)\s+(?:apenas\s+)?(?:um\s+)?(?:treino|simulação|exercício|ambiente de treinamento)[.!?]?/giu,' ');
    text=text.replace(/(?:^|[.!?]\s+)(?:não compartilhe dados reais|nenhum pix real será enviado|nenhum dinheiro real será enviado|nenhum pix ou pagamento real será feito)[.!?]?/giu,' ');
    text=text.replace(/\s+([.,;:!?])/g,'$1').replace(/\s{2,}/g,' ').trim();
    return text.length>=5?text:original;
  }
  function cleanMessageNode(node){
    if(!node)return;
    if(node.classList?.contains('message')&&node.classList?.contains('incoming')){
      for(const child of node.childNodes||[]){
        if(child.nodeType===3){const revised=naturalize(child.textContent);if(revised!==child.textContent)child.textContent=revised;}
      }
    }else{
      const revised=naturalize(node.textContent);
      if(revised!==node.textContent)node.textContent=revised;
    }
  }
  function refreshConversations(){
    if(!phone.classList.contains('free-active'))return;
    const selectors=[
      '#chatWallpaper .message.incoming',
      '#freeCallTranscript p'
    ];
    for(const selector of selectors){
      for(const item of document.querySelectorAll?.(selector)||[]){
        if(selector.includes('#freeCallTranscript')){
          for(const node of item.childNodes||[]){
            if(node.nodeType===3){const clean=naturalize(node.textContent);if(clean!==node.textContent)node.textContent=clean;}
          }
        }else cleanMessageNode(item);
      }
    }
    const notice=document.getElementById('freeEventText');
    if(notice&&!notice.hidden)cleanMessageNode(notice);
  }
  if(typeof MutationObserver==='function'){
    // Observa apenas os contêineres de conversa, não a tela inteira.
    // O SMS inicial conserva o marcador explícito "SMS SIMULADO" por segurança
    // e compatibilidade; a IA naturaliza apenas as respostas que gerar.
    for(const id of ['chatWallpaper','freeCallTranscript','freeEventText']){
      const node=document.getElementById(id);
      if(node)new MutationObserver(refreshConversations)
        .observe(node,{childList:true,subtree:true,characterData:true});
    }
  }
  if(typeof MutationObserver==='function')
    new MutationObserver(refreshConversations)
      .observe(phone,{attributes:true,attributeFilter:['data-current-view','class']});
  refreshConversations();
  const originalFetch=window.fetch.bind(window);
  const nextMicrotask=fn=>typeof queueMicrotask==='function'?queueMicrotask(fn):Promise.resolve().then(fn);
  window.fetch=async function(input,options){
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
      // O mesmo histórico da pessoa segue para a IA, mas sem termos de
      // bastidores nos textos do personagem. Isso evita ecoar "fictício".
      const history=Array.isArray(payload.history)
        ?payload.history.map(item=>item?.role==='assistant'
            ?{role:'assistant',content:naturalize(item.content)}
            :item)
        :[];
      const revised={...payload,history};
      const response=await originalFetch(input,{...options,body:JSON.stringify(revised)});
      if(!response?.ok||typeof response.clone!=='function')return response;
      let data;
      try{data=await response.clone().json();}catch(_){return response;}
      if(!data?.ok||data.mode!=='ia'||typeof data.reply!=='string')return response;
      const improved=naturalize(data.reply);
      if(!improved||improved===data.reply)return response;
      return new Response(JSON.stringify({...data,reply:improved}),{
        status:response.status,
        statusText:response.statusText,
        headers:response.headers
      });
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
  window.EducaWebDialogue=Object.freeze({version:'11185',classify,naturalize});
})();