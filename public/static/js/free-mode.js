/* Educa+ Digital V108 — IA no WhatsApp ORIGINAL.
 * Este componente só é ativado depois do pré-teste. Não realiza chamadas ou Pix reais.
 * Sem respostas fingidas: na falta de Workers AI há um erro explícito.
 */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const SCENARIOS=[
 {id:'family',channel:'whatsapp',name:'Filho — número novo',icon:'F',intro:'Oi, sou o Rafael. Troquei de número. Preciso pagar uma conta urgente. Você consegue me mandar R$ 350 por Pix? Te devolvo depois.',notification:'Nova mensagem no WhatsApp',kind:'pix',tips:'Pedidos urgentes de dinheiro de um número novo devem ser confirmados pelo telefone antigo ou pessoalmente. O destinatário do Pix fictício não correspondia ao nome informado.'},
 {id:'bank',channel:'call',name:'Central de segurança',icon:'B',intro:'Boa tarde. Sou do seu banco. Detectamos uma transferência suspeita e precisamos da sua ajuda agora.',notification:'Ligação de número desconhecido',kind:'pix',tips:'Desligue e procure o banco no canal oficial. Bancos não pedem Pix para supostamente proteger uma conta.'},
 {id:'video',channel:'video',name:'Lia · videochamada inesperada',icon:'L',intro:'Oi! Sou a Lia. Estou usando outro celular e preciso de ajuda com um Pix fictício de R$ 350. Você consegue me ajudar?',notification:'Videochamada de contato desconhecido',kind:'pix',tips:'Até vídeo e voz podem ser produzidos ou manipulados por IA. Verifique a identidade por um contato independente e conhecido antes de transferir dinheiro.'},
 {id:'code',channel:'whatsapp',name:'Contato desconhecido',icon:'?',intro:'Olá. Você pode me ajudar com uma confirmação de acesso? Recebeu algum código no seu celular?',notification:'WhatsApp · contato desconhecido',kind:'code',tips:'Nunca compartilhe códigos ou senhas reais, mesmo se quem escreve parecer conhecido.'},
 {id:'delivery',channel:'whatsapp',name:'Entrega pendente',icon:'E',intro:'Olá! Uma entrega fictícia está pendente de uma taxa de R$ 12. Você consegue verificar o pagamento?',notification:'Aviso de entrega no WhatsApp',kind:'pix',tips:'Confirme taxas inesperadas diretamente no aplicativo ou canal oficial do serviço.'},
 {id:'call-tech',channel:'call',name:'Suporte desconhecido (treino)',icon:'☎',intro:'Olá! Aqui é uma suposta central de suporte nesta simulação. Disseram que seu celular está com um problema. Você confirma antes de fazer qualquer coisa?',notification:'Ligação simulada · suposto suporte',kind:'code',tips:'Uma ligação inesperada pode inventar problemas no celular. Não instale aplicativos indicados por desconhecidos nem dê acesso remoto.'},
 {id:'relative',channel:'whatsapp',name:'Prima · número novo (treino)',icon:'P',intro:'Oi! Sou sua prima na simulação. Troquei de celular e estou tentando resolver uma despesa fictícia. Podemos conversar?',notification:'WhatsApp · familiar de número novo',kind:'pix',tips:'Um contato pode usar nomes conhecidos sem ser a pessoa verdadeira. Confira pelo número antigo antes de qualquer decisão.'},
 {id:'account',channel:'whatsapp',name:'Aviso de conta (treino)',icon:'!',intro:'Olá! Este é um aviso fictício de segurança. A sua conta de treinamento parece bloqueada. Pode conferir essa informação?',notification:'WhatsApp · aviso suspeito de conta',kind:'code',tips:'Mensagens inesperadas sobre bloqueios devem ser conferidas pelo próprio aplicativo oficial, nunca por links ou senhas na conversa.'},
 {id:'prize',channel:'whatsapp',name:'Promoção surpresa (treino)',icon:'★',intro:'Parabéns! Esta é uma promoção de treinamento e você foi escolhido para receber um prêmio fictício. Quer saber mais?',notification:'WhatsApp · promoção inesperada',kind:'pix',tips:'Prêmios inesperados e taxas antecipadas são sinais de alerta. Não pague nem envie dados pessoais.'},
 {id:'sms-delivery',channel:'sms',name:'Entrega pendente (SMS de treino)',icon:'✉',intro:'SMS SIMULADO: sua entrega de treinamento está pendente. Existe uma taxa fictícia de R$ 12. Confira no aplicativo oficial.',notification:'Novo SMS · entrega de treinamento',kind:'pix',tips:'Não toque em links recebidos por SMS. Verifique a situação pelo aplicativo ou site oficial digitado por você.'},
 {id:'sms-bank',channel:'sms',name:'Alerta bancário (SMS de treino)',icon:'✉',intro:'SMS SIMULADO: detectamos uma movimentação incomum na conta de treino. Consulte seu banco pelo canal oficial.',notification:'Novo SMS · suposto banco',kind:'code',tips:'Mesmo um SMS com aparência de banco pode ser falso. Não passe códigos; procure o banco pelo aplicativo oficial.'},
 {id:'sms-prize',channel:'sms',name:'Prêmio inesperado (SMS de treino)',icon:'✉',intro:'SMS SIMULADO: você foi selecionado para uma promoção fictícia. Desconfie de qualquer pedido de taxa.',notification:'Novo SMS · promoção não solicitada',kind:'pix',tips:'Ofertas inesperadas por SMS não comprovam que existe prêmio. Ignore e bloqueie contatos suspeitos.'},
 {id:'friend',channel:'whatsapp',name:'Mariana · amiga',icon:'M',intro:'Oi! Como está indo seu treino com o celular?',notification:'Mensagem da Mariana',kind:'normal',tips:'Nem toda mensagem é fraude. Aprenda a conferir sem perder a confiança nas conversas normais.'},
 {id:'daughter',channel:'whatsapp',name:'Maria (filha)',icon:'M',intro:'Oi! Tudo bem por aí?',notification:'Maria enviou uma mensagem',kind:'normal',tips:'Conversas com contatos já conhecidos também fazem parte do aprendizado.'},
 {id:'family-group',channel:'whatsapp',name:'Grupo da família',icon:'G',intro:'João: mandei as fotos do almoço!',notification:'Mensagem no grupo da família',kind:'normal',tips:'Grupos legítimos ajudam a treinar comunicação e privacidade.'}
];
// Roteiro principal: WhatsApp primeiro, videochamada inovadora em segundo, voz depois.
const SCRIPTED_ORDER=Object.freeze(['family','video','bank']);
// Depois do roteiro principal, novas tentativas são entregues sem botão "Próxima atividade".
const BONUS_ORDER=Object.freeze(['sms-delivery','relative','call-tech','sms-bank','account','sms-prize','prize','code','delivery']);
const byId=Object.fromEntries(SCENARIOS.map(s=>[s.id,s]));
const video=()=>window.EducaVideoCall;
const state={active:false,scenario:null,pending:null,unread:new Set(),conversations:new Map(),delivered:0,seen:[],finished:0,completedSteps:new Set(),timer:null,replying:false,blocked:false,callAccepted:false,lastSpoken:'',recognizer:null,request:null,baseline:null,transitionTimer:null,callHandsFree:false,callUtterance:null};
const els={phone:$('#phoneScreen'),notice:$('#freeEventNotice'),noticeTitle:$('#freeEventTitle'),noticeText:$('#freeEventText'),noticeIcon:$('#freeEventIcon'),tools:$('#freeHomeTools'),floating:$('#freeFloatingHome'),solved:$('#freeSolved'),wallpaper:$('#chatWallpaper'),form:$('#freeOriginalComposer'),input:$('#freeOriginalInput'),send:$('#freeOriginalSend'),status:$('#freeOriginalAiStatus'),typing:$('#freeOriginalTyping'),familyActions:$('#freeFamilyActions'),callName:$('#freeCallName'),callLine:$('#freeCallLine'),callLog:$('#freeCallTranscript'),callForm:$('#freeCallForm'),callInput:$('#freeCallInput'),answer:$('#freeCallAnswer'),smsMessages:$('#freeSmsMessages'),smsSender:$('#freeSmsSender'),smsForm:$('#freeSmsForm'),smsInput:$('#freeSmsInput'),smsSend:$('#freeSmsSend'),smsStatus:$('#freeSmsStatus')};
const bridge=()=>window.EducaFreeView;
const visible=()=>els.phone?.getAttribute('data-current-view')||'';
const now=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const privateData=t=>/(?:\d[\s.-]?){6,}|https?:\/\/|www\.|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t);
function show(name){bridge()?.setView(name);syncUI();}
function syncUI(){const familyChat=state.active&&visible()==='chat'&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal';if(els.familyActions)els.familyActions.hidden=!familyChat;els.phone?.classList.toggle('free-family-chat',familyChat);if(els.tools)els.tools.hidden=!state.active||visible()!=='home';if(els.floating)els.floating.hidden=!state.active||['home','whatsapp','chat','normal-chat'].includes(visible())||visible().startsWith('free-');if(els.solved)els.solved.textContent=`${state.finished} situações`;if(els.form)els.form.hidden=!state.active||visible()!=='chat';updateUnread();}
function stopVoice(){state.callHandsFree=false;state.callUtterance=null;try{window.speechSynthesis?.cancel();}catch(_){}try{state.recognizer?.stop();}catch(_){}state.recognizer=null;}
function clearRequest(){state.request?.abort();state.request=null;state.replying=false;if(els.typing)els.typing.hidden=true;if(els.send)els.send.disabled=false;}
function clearTransition(){clearTimeout(state.transitionTimer);state.transitionTimer=null;}
function schedule(min=16000,max=30000){clearTimeout(state.timer);state.timer=null;if(state.active)state.timer=setTimeout(triggerEvent,min+Math.random()*(max-min));}
function setStatus(message){els.status.textContent=message||'';els.status.hidden=!message;}
function updateUnread(){const w=$('#homeView [data-open-app="whatsapp"]');w?.classList.toggle('free-has-unread',state.active&&state.unread.size>0);for(const row of document.querySelectorAll('#whatsappView .wa-chat-list .chat-row')){const id=row.dataset.freeScenario||row.dataset.scenario||row.dataset.normalChat;row.classList.toggle('free-unread',state.unread.has(id));const badge=row.querySelector('.chat-meta b');if(badge)badge.hidden=!state.unread.has(id)&&state.active;}}
function start(){if(!bridge()?.isTraining())return;stop();state.active=true;
 // A pré-síntese acontece DURANTE o WhatsApp, antes da videochamada.
 // Nenhum áudio é tocado e nenhum dado pessoal é enviado ao motor.
 if(window.EducaLiaBrowserKokoro&&document.getElementById('freeVideoVoiceEngine')?.value!=='padrao')
  void window.EducaLiaBrowserKokoro.prewarmIntro().catch(()=>{});
 state.finished=0;state.delivered=0;state.seen=[];state.completedSteps.clear();state.unread.clear();state.conversations.clear();state.blocked=false;state.callHandsFree=false;state.baseline=[...document.querySelectorAll('#whatsappView .wa-chat-list .chat-row')].map(row=>({row,preview:row.querySelector('.chat-copy small')?.textContent,time:row.querySelector('.chat-meta small')?.textContent,badgeHidden:row.querySelector('.chat-meta b')?.hidden}));els.phone?.classList.add('free-active');els.notice.hidden=true;makeContactRows();show('home');schedule(900,1450);}
function stop(){clearTransition();video()?.close?.();clearTimeout(state.timer);state.timer=null;clearRequest();stopVoice();state.active=false;state.pending=null;state.scenario=null;state.blocked=false;state.unread.clear();
 const list=$('#whatsappView .wa-chat-list');for(const dynamic of document.querySelectorAll('#whatsappView [data-free-scenario]'))dynamic.remove();
 if(list&&state.baseline)for(const {row,preview,time,badgeHidden} of state.baseline){row.classList.remove('free-unread');if(row.querySelector('.chat-copy small'))row.querySelector('.chat-copy small').textContent=preview;if(row.querySelector('.chat-meta small'))row.querySelector('.chat-meta small').textContent=time;if(row.querySelector('.chat-meta b'))row.querySelector('.chat-meta b').hidden=badgeHidden;list.append(row);}state.baseline=null;
 els.phone?.classList.remove('free-active','free-family-chat');if(els.notice)els.notice.hidden=true;if(els.form)els.form.hidden=true;setStatus('');syncUI();}
function exit(){stop();bridge()?.openLearningHub();}
function home(){if(!state.active)return;clearTransition();video()?.close?.();stopVoice();const wasResult=visible()==='free-summary';show('home');if(wasResult){state.scenario=null;state.blocked=false;const next=nextScriptedScenario();schedule(next?.id==='video'?1900:7000,next?.id==='video'?2900:11500);}}
function makeContactRows(){const list=$('#whatsappView .wa-chat-list');if(!list)return;
  for(const old of list.querySelectorAll('[data-free-scenario]'))old.remove();
  for(const s of [byId.delivery,byId.code,byId.relative,byId.account,byId.prize,byId.friend]){
    const btn=document.createElement('button');btn.type='button';btn.className='chat-row training-chat';btn.dataset.freeScenario=s.id;
    const avatar=document.createElement('span');avatar.className='avatar wa-avatar green';avatar.textContent=s.icon;
    const copy=document.createElement('span');copy.className='chat-copy';const strong=document.createElement('strong');strong.textContent=s.name;const small=document.createElement('small');small.textContent='Toque para conversar';copy.append(strong,small);
    const meta=document.createElement('span');meta.className='chat-meta';const time=document.createElement('small');time.textContent=now();const badge=document.createElement('b');badge.textContent='1';badge.hidden=true;meta.append(time,badge);btn.append(avatar,copy,meta);list.append(btn);
  }
}
function updatePreview(s){const row=$(`#whatsappView [data-scenario="${s.id}"],#whatsappView [data-free-scenario="${s.id}"],#whatsappView [data-normal-chat="${s.id}"]`);if(!row)return;const m=state.conversations.get(s.id)?.at(-1);row.querySelector('.chat-copy small').textContent=(m?.content||s.intro).slice(0,55);const clock=row.querySelector('.chat-meta small');if(clock)clock.textContent=now();row.parentNode?.prepend(row);updateUnread();}
function nextScriptedScenario(){return byId[SCRIPTED_ORDER.find(id=>!state.completedSteps.has(id))||BONUS_ORDER.find(id=>!state.completedSteps.has(id))]||null;}
function chooseScenario(){let s=nextScriptedScenario();if(!s){const pool=[byId.code,byId.delivery,byId.relative,byId.account,byId.prize,byId['sms-bank'],byId['sms-delivery'],byId['sms-prize'],byId['call-tech'],byId.friend,byId.family,byId.bank,byId.video].filter(x=>!state.seen.slice(-3).includes(x.id));s=pool[Math.floor(Math.random()*pool.length)];}state.delivered++;state.seen.push(s.id);return s;}
function triggerEvent(){if(!state.active)return;if(state.blocked||visible()==='free-pix'||visible()==='free-call'||visible()==='free-video'||visible()==='free-sms'||visible()==='chat'){schedule(12000,22000);return;}const s=chooseScenario();state.pending=s;
 if(s.channel==='whatsapp'||s.channel==='sms'){const list=state.conversations.get(s.id)||[];if(!list.length)list.push({role:'assistant',content:s.intro});state.conversations.set(s.id,list.slice(-14));state.unread.add(s.id);updatePreview(s);}
 els.noticeIcon.textContent=s.channel==='call'?'☎':s.channel==='video'?'▣':s.channel==='sms'?'✉':'●';els.noticeTitle.textContent=s.notification;els.noticeText.textContent=s.name+': '+s.intro.slice(0,82);els.notice.hidden=false;updateUnread();clearTimeout(state.timer);state.timer=null;
 if(s.channel==='call')showIncomingCall(s);else if(s.channel==='video')video()?.incoming(s);
}
function dismiss(){els.notice.hidden=true;state.pending=null;schedule(18000,28000);}
function openPending(){const s=state.pending;state.pending=null;els.notice.hidden=true;if(!s)return;schedule(28000,48000);if(s.channel==='call')showIncomingCall(s);else if(s.channel==='video')video()?.incoming(s);else if(s.channel==='sms')openSms(s);else openChat(s);}
function renderBubble(role,text){const div=document.createElement('div');div.className='message '+(role==='user'?'outgoing':'incoming');div.append(document.createTextNode(text));const tm=document.createElement('time');tm.textContent=now();div.append(tm);els.wallpaper.append(div);els.wallpaper.scrollTop=els.wallpaper.scrollHeight;}
function append(role,text){const s=state.scenario;if(!s)return;const t=String(text).slice(0,350);let hist=state.conversations.get(s.id)||[];hist.push({role,content:t});hist=hist.slice(-16);state.conversations.set(s.id,hist);updatePreview(s);if(visible()==='chat')renderBubble(role,t);else if(visible()==='free-video'){video()?.addLine(role,t);}else if(visible()==='free-sms'){renderSmsBubble(role,t);}else if(visible()==='free-call'){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=role==='assistant'?s.name+': ':'Você: ';p.append(strong,document.createTextNode(t));els.callLog.append(p);els.callLog.scrollTop=els.callLog.scrollHeight;}if(role==='assistant')state.lastSpoken=t;}
function renderSmsBubble(role,text){
 if(!els.smsMessages)return;
 const p=document.createElement('p');p.className='v11153-sms-bubble '+(role==='user'?'sent':'received');
 const body=document.createElement('span');body.textContent=String(text).slice(0,350);
 const clock=document.createElement('small');clock.textContent=now();
 p.append(body,clock);els.smsMessages.append(p);els.smsMessages.scrollTop=els.smsMessages.scrollHeight;
}
function openSms(s){
 if(!s||s.channel!=='sms'||!state.active)return;
 clearRequest();state.scenario=s;state.blocked=false;state.pending=null;els.notice.hidden=true;
 if(els.smsSender)els.smsSender.textContent=s.name;
 if(els.smsMessages)els.smsMessages.replaceChildren();
 const history=state.conversations.get(s.id)||[{role:'assistant',content:s.intro}];
 if(!state.conversations.has(s.id))state.conversations.set(s.id,history);
 show('free-sms');for(const m of history)renderSmsBubble(m.role,m.content);
 if(els.smsStatus){els.smsStatus.textContent='SMS fictício · nenhum link é necessário';}
}
function openChat(s){if(!s||!state.active)return;if(!state.timer)schedule(28000,48000);clearRequest();state.scenario=s;state.blocked=false;state.unread.delete(s.id);state.pending=null;els.notice.hidden=true;updateUnread();$('#scenarioTitle').textContent=s.name;$('#scenarioAvatar').textContent=s.icon;$('#scenarioAvatar').className='avatar blue small';$('#scenarioSubtitle').textContent='Contato fictício · simulação';els.wallpaper.replaceChildren();const badge=document.createElement('span');badge.className='chat-day';badge.textContent='Hoje · Ambiente de treinamento';els.wallpaper.append(badge);let hist=state.conversations.get(s.id);
 if(!hist?.length){hist=[{role:'assistant',content:s.intro}];state.conversations.set(s.id,hist);}
 show('chat');for(const row of hist)renderBubble(row.role,row.content);setStatus('');}
function showIncomingCall(s){if(!state.active)return;clearRequest();state.pending=null;state.scenario=s;state.callAccepted=false;state.callHandsFree=false;els.notice.hidden=true;els.callName.textContent=s.name;els.callLine.textContent='Chamada simulada recebida';els.callLog.replaceChildren();els.callForm.hidden=true;els.answer.hidden=false;$('#freeCallHangup').textContent='Recusar / encerrar';show('free-call');}
async function send(text){const s=state.scenario;if(!state.active||!s||state.replying||state.blocked)return;const message=String(text||'').trim();if(!message)return;
 if(privateData(message)){setStatus('Não digite CPF, telefones, códigos, senhas ou links reais. Use apenas textos fictícios.');if(visible()==='free-call')els.callLine.textContent='Não informe dados reais.';return;}
 const current=s.id;const oldHist=(state.conversations.get(s.id)||[]).slice(-8);append('user',message);setStatus('');state.replying=true;els.send.disabled=true;if(els.smsSend)els.smsSend.disabled=true;if(els.smsStatus&&visible()==='free-sms')els.smsStatus.textContent='O contato fictício está respondendo…';els.typing.hidden=visible()!=='chat';const abort=new AbortController();state.request=abort;let err='';let reply='';let timedOut=false;
 const responseTimer=setTimeout(()=>{timedOut=true;abort.abort();},17000); // evitar "em andamento" sem fim quando Workers AI travar
 try{const response=await fetch('/api/modo-livre/conversar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:s.id,message,history:oldHist}),signal:abort.signal});const data=await response.json().catch(()=>({}));if(!response.ok||!data.ok||data.mode!=='ia'||!data.reply)throw Error(data.message||'A inteligência artificial está indisponível. Tente novamente.');reply=data.reply.slice(0,330);if(privateData(reply))throw Error('A IA retornou dados inadequados. Tente novamente.');}
 catch(ex){err=timedOut?'A IA demorou para responder. Tente novamente com uma frase curta.':ex.name==='AbortError'?'A conexão com a IA foi interrompida.':/Failed to fetch|Failed to execute|NetworkError|fetch failed/i.test(String(ex.message))?'Não foi possível conectar à IA. Confira Ollama no Educa+ local ou o Workers AI na Cloudflare.':String(ex.message||'Não foi possível falar com a IA.');}
 finally{clearTimeout(responseTimer);if(state.request===abort)state.request=null;state.replying=false;els.send.disabled=false;if(els.smsSend)els.smsSend.disabled=false;els.typing.hidden=true;}
 if(!state.active||state.scenario?.id!==current||(abort.signal.aborted&&!timedOut))return;
 if(err){if(visible()==='chat')setStatus(err);else if(visible()==='free-video')video()?.error(err);else if(visible()==='free-sms'&&els.smsStatus)els.smsStatus.textContent=err;else els.callLine.textContent=err;return;}
 append('assistant',reply);if(visible()==='free-video')video()?.reply(reply);else if(visible()==='free-call'&&state.callAccepted)speak();else if(visible()==='free-sms'&&els.smsStatus)els.smsStatus.textContent='SMS simulado · responda ou escolha uma ação segura';}
function finish(kind='safe',reason=''){
 if(!state.active)return;const s=state.scenario||state.pending;if(!s){home();return;}
 clearRequest();video()?.close?.();stopVoice();const safe=kind!=='unsafe';if(safe)state.finished++;
 if(SCRIPTED_ORDER.includes(s.id))state.completedSteps.add(s.id);
 state.blocked=true;state.pending=null;clearTimeout(state.timer);els.notice.hidden=true;
 $('#freeSummaryIcon').textContent=safe?'✓':'!';$('#freeSummaryTitle').textContent=safe?'Situação concluída':'Atenção à decisão';
 const message=safe?'Você concluiu esta situação do treino.':'Você confirmou um Pix FICTÍCIO. Nenhum dinheiro verdadeiro foi enviado.';
 const next=nextScriptedScenario();
 $('#freeSummaryText').textContent=message+(s.id==='family'&&next?.id==='video'?' A seguir, uma videochamada com IA: ver um rosto não garante a identidade.':'');
 $('#freeSummaryDetail').textContent=(reason?reason+' ':'')+s.tips;
 // A próxima etapa inicia SOZINHA; "Avançar agora" é apenas um atalho opcional.
 // Um resumo curto permite perceber o feedback sem precisar confirmar nada.
 const nextButton=$('#freeSummaryNext');if(nextButton){nextButton.hidden=false;nextButton.textContent='Avançar agora';}
 const transition=$('#freeSummaryAuto');if(transition){transition.hidden=false;transition.textContent=next?.id==='video'?'Abrindo videochamada automaticamente…':next?.id==='bank'?'Iniciando ligação telefônica automaticamente…':next?.channel==='sms'?'Um SMS de treinamento chegará em seguida…':'Preparando a próxima atividade automaticamente…';}
 show('free-summary');
 clearTransition();
 state.transitionTimer=setTimeout(()=>{state.transitionTimer=null;continueTraining();},2800);
}
function continueTraining(){
 if(!state.active||visible()!=='free-summary')return;
 clearTransition();clearTimeout(state.timer);state.timer=null;
 state.scenario=null;state.blocked=false;state.pending=null;
 const next=nextScriptedScenario();
 if(next?.id==='video'){
  // Reutiliza a mesma integração da Lia, apenas eliminando o clique intermediário.
  if(video()?.incoming){video().incoming(next);return;}
  show('home');schedule(800,1400);return;
 }
 if(next?.id==='bank'){showIncomingCall(next);return;}
 show('home');schedule(900,1500);
}
function openPix(){if(!state.active)return;video()?.close?.();const s=state.scenario||state.pending||byId.family;state.scenario=s;$('#freePixKey').value='CHAVE-TREINO-'+(s.id==='delivery'?'ENTREGA':s.id==='bank'?'CENTRAL':s.id==='video'?'LIA':'RAFAEL');$('#freePixAmount').value=s.id==='delivery'?'12,00':'350,00';$('#freePixReceiver').textContent=s.id==='delivery'?'Equipe Entrega · não verificada':'Lucas Almeida · pessoa desconhecida';$('#freePixContext').textContent='Confira quem está recebendo antes de confirmar. Esta transferência é 100% fictícia.';show('free-pix');}
// Chamada REALISTA dentro do protótipo: fala pt-BR e escuta somente com gesto
// explícito. Não origina ligação telefônica, não usa número real.
function speak(){
 if(!state.active||!state.callAccepted||visible()!=='free-call')return;
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){els.callLine.textContent='Voz indisponível neste navegador. Responda por texto.';return;}
 try{state.recognizer?.abort?.();}catch(_){}
 state.recognizer=null;
 try{window.speechSynthesis.cancel();}catch(_){}
 const utterance=new window.SpeechSynthesisUtterance(state.lastSpoken||state.scenario?.intro||'Olá');
 utterance.lang='pt-BR';utterance.rate=1.02;utterance.pitch=1;utterance.volume=1;
 const voices=window.speechSynthesis.getVoices?.()||[];
 const candidate=window.EducaLiaVoice?.choose?.()||voices.find(v=>/^pt[-_]BR$/i.test(v.lang||''));
 if(candidate)utterance.voice=candidate;
 utterance.onstart=()=>{if(state.callUtterance===utterance)els.callLine.textContent='Personagem fictício falando…';};
 utterance.onend=()=>{
  if(state.callUtterance!==utterance)return;
  state.callUtterance=null;els.callLine.textContent='Sua vez de falar ou digitar.';
  if(state.callHandsFree&&state.active&&visible()==='free-call'&&state.callAccepted)listen();
 };
 utterance.onerror=()=>{
  if(state.callUtterance!==utterance)return;
  state.callUtterance=null;els.callLine.textContent='Áudio indisponível. Continue por texto.';
 };
 state.callUtterance=utterance;
 try{window.speechSynthesis.resume?.();window.speechSynthesis.speak(utterance);}
 catch(_){state.callUtterance=null;els.callLine.textContent='Não foi possível reproduzir voz. Continue por texto.';}
}
function listen(){
 if(!state.active||!state.callAccepted||visible()!=='free-call')return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){state.callHandsFree=false;els.callLine.textContent='Reconhecimento de voz indisponível. Digite sua resposta.';return;}
 if(state.recognizer)return;
 try{
  const r=new SR();state.recognizer=r;r.lang='pt-BR';r.interimResults=false;r.maxAlternatives=1;
  els.callLine.textContent='Ouvindo sua resposta em português…';
  r.onresult=e=>{
   if(state.recognizer!==r)return;
   const phrase=String(e.results?.[0]?.[0]?.transcript||'').trim().slice(0,350);
   state.recognizer=null;
   try{r.stop?.();}catch(_){}
   if(phrase){els.callLine.textContent='Personagem preparando resposta…';void send(phrase);}
  };
  r.onerror=()=>{if(state.recognizer!==r)return;state.recognizer=null;els.callLine.textContent='Microfone indisponível. Continue pelo teclado.';};
  r.onend=()=>{if(state.recognizer===r){state.recognizer=null;els.callLine.textContent='Toque em Responder por voz ou escreva sua resposta.';}};
  r.start();
 }catch(_){state.recognizer=null;els.callLine.textContent='Falha ao abrir microfone. Continue por texto.';}
}
// Captura apenas no Modo Livre. Fora dele, as 22 atividades e o WhatsApp permanecem intactos.
document.addEventListener('click',e=>{if(!state.active)return;
 if(e.target.closest('#gestureHome')){e.preventDefault();e.stopImmediatePropagation();home();return;}
 const row=e.target.closest('#whatsappView .wa-chat-list .chat-row');if(row){e.preventDefault();e.stopImmediatePropagation();const id=row.dataset.freeScenario||row.dataset.scenario||row.dataset.normalChat;openChat(byId[id]);return;}
 const app=e.target.closest('#homeView [data-open-app]');if(app&&app.dataset.openApp==='whatsapp'){e.preventDefault();e.stopImmediatePropagation();show('whatsapp');return;}
 const vcall=e.target.closest('#chatView .chat-header-actions button[aria-label="Videochamada"]');if(vcall){e.preventDefault();e.stopImmediatePropagation();video()?.incoming(byId.video);return;}
 const call=e.target.closest('#chatView .chat-header-actions button[aria-label="Ligação"]');if(call){e.preventDefault();e.stopImmediatePropagation();showIncomingCall({...state.scenario||byId.family,channel:'call'});return;}
 const pay=e.target.closest('#bankSendPixBtn');if(pay){e.preventDefault();e.stopImmediatePropagation();openPix();return;}
 if(e.target.closest('#chatView .android-back')){clearRequest();setStatus('');}
},true);
// O Android existente já emite estes eventos para os gestos da barra inferior.
for(const name of ['educa:system-home','educa:system-learning','educa:system-back'])window.addEventListener(name,e=>{if(!state.active)return;e.stopImmediatePropagation();home();},true);
$('#gestureHome')?.addEventListener('click',e=>{if(!state.active)return;e.stopImmediatePropagation();home();},true);
$('#freeModeEntry')?.addEventListener('click',start);$('#freeExitBtn')?.addEventListener('click',exit);$('#freeSummaryExit')?.addEventListener('click',exit);$('#freeSummaryHome')?.addEventListener('click',home);$('#freeSummaryNext')?.addEventListener('click',continueTraining);
$('#freeEventOpen')?.addEventListener('click',openPending);$('#freeEventDismiss')?.addEventListener('click',dismiss);$('#freeFloatingBack')?.addEventListener('click',home);
els.form?.addEventListener('submit',e=>{e.preventDefault();const t=els.input.value;if(!t.trim())return;els.input.value='';send(t);});
$('#freeFamilyVerify')?.addEventListener('click',()=>{if(state.active&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal'&&visible()==='chat')show('free-contacts');});
$('#freeFamilyBlock')?.addEventListener('click',()=>{if(state.active&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal'&&visible()==='chat')finish('safe','Você bloqueou o contato suspeito sem compartilhar dados nem transferir dinheiro.');});
els.smsForm?.addEventListener('submit',e=>{e.preventDefault();const text=els.smsInput?.value||'';if(els.smsInput)els.smsInput.value='';send(text);});
 $('#freeSmsVerify')?.addEventListener('click',()=>finish('safe','Você conferiu o SMS fora da mensagem, pelo canal oficial.'));
 $('#freeSmsBlock')?.addEventListener('click',()=>finish('safe','Você ignorou e bloqueou a mensagem suspeita.'));
 $('#freeSmsBack')?.addEventListener('click',home);
 $('#freeCallAnswer')?.addEventListener('click',()=>{if(!state.scenario)return;state.callAccepted=true;els.answer.hidden=true;els.callForm.hidden=false;els.callLine.textContent='Chamada fictícia conectada';if(!state.conversations.get(state.scenario.id)?.length)append('assistant',state.scenario.intro);else {const t=state.conversations.get(state.scenario.id).at(-1)?.content||state.scenario.intro;const p=document.createElement('p');p.textContent=t;els.callLog.append(p);state.lastSpoken=t;}speak();});
$('#freeCallHangup')?.addEventListener('click',()=>finish('safe','Você encerrou a ligação sem passar informações.'));$('#freeCallVerify')?.addEventListener('click',()=>finish('safe','Você preferiu o canal oficial.'));
$('#freeCallSpeak')?.addEventListener('click',speak);$('#freeCallMic')?.addEventListener('click',()=>{state.callHandsFree=true;listen();});$('#freeCallForm')?.addEventListener('submit',e=>{e.preventDefault();const t=els.callInput.value;els.callInput.value='';send(t);});
$('#freeContactsBack')?.addEventListener('click',home);$('#freeContactKnown')?.addEventListener('click',()=>finish('safe','Você confirmou pelo número conhecido.'));$('#freeContactBank')?.addEventListener('click',()=>finish('safe','Você consultou um canal oficial.'));
$('#freePixBack')?.addEventListener('click',()=>show('bank-pix'));$('#freePixCancel')?.addEventListener('click',()=>finish('safe','Você cancelou o Pix sem confirmar o destinatário.'));$('#freePixConfirm')?.addEventListener('click',()=>finish('unsafe','A pessoa que pediu o dinheiro não era o destinatário mostrado.'));
$('#logoutBtn')?.addEventListener('click',stop);$('#focusLogoutBtn')?.addEventListener('click',stop);
if(els.phone)new MutationObserver(syncUI).observe(els.phone,{attributes:true,attributeFilter:['data-current-view']});
window.EducaFreeMode=Object.freeze({enterVideo:()=>{clearRequest();state.pending=null;state.scenario=byId.video;state.blocked=false;els.notice.hidden=true;clearTimeout(state.timer);},isActive:()=>state.active,start,stop,triggerEvent,videoState:()=>state.scenario?.id,sendVideo:(text)=>send(text),videoAccepted:()=>{if(state.scenario?.id!==byId.video.id)return;state.lastSpoken=byId.video.intro;append('assistant',byId.video.intro);},hangupVideo:()=>finish('safe','Você encerrou a videochamada para confirmar a identidade. Nenhum dinheiro real foi enviado.'),verifyVideo:()=>finish('safe','Você optou por confirmar a identidade por outro canal conhecido.'),openPixVideo:openPix});
})();
