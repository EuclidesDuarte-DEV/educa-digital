/* V111.82 — SOMENTE WEB: gamificação opcional e local do Modo Livre.
 * Não altera o motor compartilhado, IA, D1 ou canais Android/iOS.
 */
(()=>{
  'use strict';
  if (document.documentElement?.dataset?.educaPlatform !== 'web') return;
  const phone=document.getElementById('phoneScreen');
  const learning=document.querySelector('#learningView .learning-header');
  const controls=document.getElementById('freeHomeTools');
  if (!phone || !learning || !controls) return;
  const STORE='educaWebModoLivreNivelV11182';
  const MAX_XP=9999;
  const LEVELS=[
    {name:'Novato',min:0,next:80},
    {name:'Intermediário',min:80,next:210},
    {name:'Experiente',min:210,next:null}
  ];
  const SCAM_IDS=new Set([
    'family','bank','video','code','delivery','call-tech','relative',
    'account','prize','sms-delivery','sms-bank','sms-prize'
  ]);
  const QUIZZES=Object.freeze({
    1:[
      {id:'n1-number',q:'Um número novo diz ser seu filho e pede Pix com urgência. Qual atitude é mais segura?',options:['Enviar o dinheiro sem conferir','Ligar para o contato antigo e confirmar'],answer:1,explain:'Números novos e urgência são sinais de alerta. Confirme com a pessoa por outro contato conhecido.'},
      {id:'n1-code',q:'Um desconhecido pede o código que chegou por SMS. O que fazer?',options:['Não informar o código','Enviar o código para ajudar'],answer:0,explain:'Códigos de acesso são pessoais, inclusive durante um atendimento fictício.'}
    ],
    2:[
      {id:'n2-delivery',q:'Você recebe um SMS de entrega com uma cobrança inesperada, escrito como se fosse da transportadora. Como conferir?',options:['Abrir o link recebido','Abrir por conta própria o aplicativo oficial da transportadora','Responder com o código de acesso'],answer:1,explain:'A aparência da mensagem não prova a origem. Consulte a empresa pelo aplicativo ou canal oficial.'},
      {id:'n2-bank',q:'Uma suposta central avisa sobre bloqueio urgente e pede confirmação por Pix. Qual decisão protege sua conta?',options:['Desligar e entrar em contato pelo aplicativo oficial do banco','Realizar o Pix de teste','Acreditar no número exibido na chamada'],answer:0,explain:'Golpistas podem imitar centrais e números. Bancos não exigem Pix para proteger uma conta.'}
    ],
    3:[
      {id:'n3-video',q:'Na videochamada, alguém parecido com um familiar usa voz conhecida, diz ter mudado de número e pede Pix para conta de terceiro. O que fazer?',options:['Confiar na aparência do vídeo','Conferir por um canal antigo e independente antes de qualquer transferência','Enviar um valor menor para testar','Pedir código de autenticação do familiar'],answer:1,explain:'Imagem, voz e nome podem ser imitados por IA. A verificação independente continua essencial.'},
      {id:'n3-multichannel',q:'WhatsApp e SMS chegam com o mesmo aviso de bloqueio, enquanto uma pessoa liga oferecendo solução imediata. Qual estratégia é mais segura?',options:['Seguir as instruções da ligação','Abrir os links dos dois canais para comparar','Encerrar o contato e verificar diretamente no serviço oficial','Compartilhar apenas o primeiro código recebido'],answer:2,explain:'Mensagens combinadas e pressão de tempo não são prova de autenticidade. Use um canal que você mesmo iniciou.'}
    ]
  });
  const today=()=>{
    const d=new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  };
  const clamp=n=>Math.max(0,Math.min(MAX_XP,Math.floor(Number(n)||0)));
  const tierFor=xp=>xp>=210?3:xp>=80?2:1;
  function restore(){
    try{
      const d=JSON.parse(localStorage.getItem(STORE)||'{}');
      const credits=typeof d.credits==='object'&&d.credits!==null?d.credits:{};
      return {xp:clamp(d.xp),credits:Object.fromEntries(Object.entries(credits).filter(([k,v])=>typeof k==='string'&&v===today()).slice(-60))};
    }catch(_){return {xp:0,credits:{}};}
  }
  const model=restore();
  let dialog=null, focusBefore=null;
  function persist(){
    try{localStorage.setItem(STORE,JSON.stringify(model));}catch(_){}
  }
  function snapshot(){
    const tier=tierFor(model.xp),spec=LEVELS[tier-1];
    return Object.freeze({xp:model.xp,level:tier,name:spec.name,next:spec.next});
  }
  const badge=document.createElement('button');
  badge.type='button';
  badge.id='edModoLevelBadge';
  badge.className='ed-modo-level-badge';
  badge.setAttribute('aria-haspopup','dialog');
  // A tipografia desta peça compacta é controlada pelo CSS responsivo.
  badge.setAttribute('data-educa-web-ignore-font','');
  badge.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 19.5 5v6c0 5.1-3.2 8.7-7.5 11-4.3-2.3-7.5-5.9-7.5-11V5L12 2Z" fill="currentColor"/><path d="m12 6.4 1.7 3.5 3.9.5-2.8 2.8.7 4-3.5-1.9-3.5 1.9.7-4-2.8-2.8 3.9-.5L12 6.4Z" fill="#fff"/></svg><span>Nível 1</span>';
  learning.appendChild(badge);
  function updateBadge(){
    const info=snapshot();
    badge.querySelector('span').textContent='Nível '+info.level;
    badge.setAttribute('aria-label','Meu nível no Modo Livre: '+info.level+', '+info.name+'. Abrir progresso.');
  }
  function credit(key,delta){
    if (model.credits[key]===today())return null;
    const previous=snapshot();
    model.credits[key]=today();
    const old=model.xp;
    model.xp=clamp(old+delta);
    persist();
    updateBadge();
    return {delta:model.xp-old,previous:previous.level,current:snapshot()};
  }
  function createDialog(title){
    closeDialog();
    focusBefore=document.activeElement;
    dialog=document.createElement('div');
    dialog.className='ed-modo-dialog';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-label',title);
    const sheet=document.createElement('section');
    sheet.className='ed-modo-sheet';
    const close=document.createElement('button');
    close.type='button';
    close.className='ed-modo-close';
    close.setAttribute('aria-label','Fechar');
    close.textContent='×';
    close.addEventListener('click',closeDialog);
    sheet.appendChild(close);
    dialog.appendChild(sheet);
    phone.appendChild(dialog);
    dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
    close.focus();
    return sheet;
  }
  function closeDialog(){
    if(!dialog)return;
    dialog.remove();
    dialog=null;
    focusBefore?.focus?.();
    focusBefore=null;
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog){e.preventDefault();closeDialog();}});
  function element(tag,className,content){
    const el=document.createElement(tag);
    if(className)el.className=className;
    if(content!=null)el.textContent=content;
    return el;
  }
  function progressView(){
    const info=snapshot(),sheet=createDialog('Meu progresso no Modo Livre');
    sheet.append(element('h2','','Minha evolução'));
    sheet.append(element('p','ed-modo-subtitle','Nível '+info.level+' · '+info.name));
    const meter=element('div','ed-modo-meter');
    const filled=element('div','ed-modo-meter-fill');
    const start=LEVELS[info.level-1].min;
    filled.style.width=(info.next?Math.round((info.xp-start)/(info.next-start)*100):100)+'%';
    meter.append(filled);
    sheet.append(meter);
    sheet.append(element('p','ed-modo-count',info.next?info.xp+' de '+info.next+' XP para o próximo nível':info.xp+' XP acumulados · nível máximo'));
    sheet.append(element('p','ed-modo-info','Somente suas decisões e desafios do Modo Livre mudam este nível.'));
    sheet.append(element('p','ed-modo-info','Ação segura: +20 XP · decisão arriscada: −15 XP. Repetir uma mesma situação no dia não gera pontos extras.'));
    sheet.append(element('p','ed-modo-footnote','Progresso salvo neste navegador. Não sincronizado com outras contas ou aparelhos.'));
  }
  badge.addEventListener('click',progressView);
  function showResult(result){
    const summary=document.getElementById('freeSummaryText');
    if(!summary || !result)return;
    let note=document.getElementById('edModoResult');
    if(!note){note=element('p','ed-modo-result');note.id='edModoResult';summary.insertAdjacentElement('afterend',note);}
    const delta=result.delta;
    const prefix=delta>0?'+'+delta:delta===0?'0':String(delta);
    note.textContent=prefix+' XP · '+result.current.name+
      (result.previous!==result.current.level?(result.current.level>result.previous?' · Subiu de nível!':' · Nível ajustado, tente novamente.'):'');
    note.setAttribute('role','status');
  }
  function evaluateSummary(){
    if(!phone.classList.contains('free-active')||phone.dataset.currentView!=='free-summary')return;
    const scenario=window.EducaFreeMode?.videoState?.();
    if(!SCAM_IDS.has(scenario))return;
    const title=document.getElementById('freeSummaryTitle')?.textContent?.trim();
    if(!['Situação concluída','Atenção à decisão'].includes(title))return;
    const safe=title==='Situação concluída';
    const awarded=credit('scenario:'+scenario,safe?20:-15);
    showResult(awarded);
  }
  if(typeof MutationObserver==='function'){
    new MutationObserver(evaluateSummary).observe(phone,{attributes:true,attributeFilter:['data-current-view','class']});
  }
  const challenge=document.createElement('button');
  challenge.type='button';
  challenge.id='edModoChallengeBtn';
  challenge.className='free-micro-control ed-modo-challenge';
  challenge.textContent='Desafio';
  challenge.setAttribute('aria-label','Abrir um desafio de segurança digital do seu nível');
  controls.insertBefore(challenge,controls.firstChild);
  function launchChallenge(){
    if(!phone.classList.contains('free-active'))return;
    const info=snapshot(),pool=QUIZZES[info.level];
    const quiz=pool.find(q=>model.credits['quiz:'+q.id]!==today());
    const sheet=createDialog('Desafio '+info.name);
    sheet.append(element('h2','','Desafio · '+info.name));
    if(!quiz){
      sheet.append(element('p','ed-modo-info','Você já respondeu aos desafios deste nível hoje. Continue nas simulações de WhatsApp, SMS ou chamadas.'));
      return;
    }
    sheet.append(element('p','ed-modo-question',quiz.q));
    const options=element('div','ed-modo-options');
    const buttons=[];
    quiz.options.forEach((option,i)=>{
      const btn=element('button','ed-modo-option',option);
      btn.type='button';
      btn.addEventListener('click',()=>{
        if(!dialog || buttons.every(x=>x.disabled))return;
        buttons.forEach(x=>x.disabled=true);
        const correct=i===quiz.answer;
        const result=credit('quiz:'+quiz.id,correct?15:-10);
        btn.classList.add(correct?'ed-correct':'ed-incorrect');
        const feedback=element('p','ed-modo-feedback',correct?'Boa decisão! ':'Veja como se proteger: ');
        feedback.append(document.createTextNode(quiz.explain));
        sheet.append(feedback);
        if(result&&result.previous!==result.current.level){
          sheet.append(element('p','ed-modo-feedback','Agora você está no nível '+result.current.level+' — '+result.current.name+'.'));
        }
      });
      buttons.push(btn);
      options.append(btn);
    });
    sheet.append(options);
    sheet.append(element('p','ed-modo-footnote','Tudo aqui é fictício. Nenhum link ou Pix real é utilizado.'));
  }
  challenge.addEventListener('click',launchChallenge);
  updateBadge();
  window.EducaWebGamification=Object.freeze({version:'11182',getSnapshot:snapshot});
})();