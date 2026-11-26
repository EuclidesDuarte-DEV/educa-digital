/* Educa+ Digital V108 — IA no WhatsApp ORIGINAL.
 * Este componente só é ativado depois do pré-teste. Não realiza chamadas ou Pix reais.
 * Sem respostas fingidas: na falta de Workers AI há um erro explícito.
 */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const SCENARIOS=[
 {id:'family',channel:'whatsapp',name:'Filho — número novo',icon:'F',intro:'Oi, sou o Rafael. Troquei de número. Preciso pagar uma conta urgente. Você consegue me mandar R$ 350 por Pix? Te devolvo depois.',notification:'Nova mensagem no WhatsApp',kind:'pix',tips:'Pedidos urgentes de dinheiro de um número novo devem ser confirmados pelo telefone antigo ou pessoalmente. O destinatário do Pix fictício não correspondia ao nome informado.'},
 {id:'family-photo',channel:'whatsapp',name:'Filho — foto e número novo',icon:'F',intro:'Oi, é o Rafa. Troquei de número, salva esse aqui pra mim.',photoUrl:'/static/img/free-family-photo-v11214.webp',photoAsk:'Mãe, tô com uma conta pra pagar hoje e meu Pix ficou limitado. Consegue me emprestar R$ 650? Te devolvo depois.',notification:'WhatsApp · foto recebida de número novo',kind:'pix',tips:'Receber uma foto não comprova quem está falando. Imagens podem ser copiadas ou geradas com IA. Confirme pelo número antigo ou pessoalmente antes de enviar dinheiro.'},
 {id:'bank',channel:'call',name:'Central de segurança',icon:'B',intro:'Boa tarde. Sou do seu banco. Detectamos uma transferência suspeita e precisamos da sua ajuda agora.',notification:'Ligação de número desconhecido',kind:'pix',tips:'Desligue e procure o banco no canal oficial. Bancos não pedem Pix para supostamente proteger uma conta.'},
 {id:'video',channel:'video',name:'Lia · videochamada inesperada',icon:'L',intro:'Oi, sou a Lia. Troquei de celular e estou precisando de um favor. Você pode me emprestar R$ 350 pelo Pix de treino? Eu devolvo depois.',notification:'Videochamada de contato desconhecido',kind:'pix',tips:'Até vídeo e voz podem ser produzidos ou manipulados por IA. Verifique a identidade por um contato independente e conhecido antes de transferir dinheiro.'},
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
// O roteiro NATIVO permanece intacto. Somente Web: foto fictícia primeiro e LIA logo depois.
const SCRIPTED_ORDER=Object.freeze(['family','video','bank']);
const WEB_SCRIPTED_ORDER=Object.freeze(['family-photo','video','bank']);
// Os demais exercícios continuam disponíveis depois do roteiro principal.
const BONUS_ORDER=Object.freeze(['sms-delivery','relative','call-tech','sms-bank','account','sms-prize','prize','code','delivery']);
const WEB_BONUS_ORDER=Object.freeze([...BONUS_ORDER,'family']);
const byId=Object.fromEntries(SCENARIOS.map(s=>[s.id,s]));
// V112.81: contextos narrativos educativos, sem revelar a resposta do desafio.
const STORY_CONTEXT=Object.freeze({
 'family-photo':['Uma mensagem do seu filho','Rafael mora longe e costuma falar com você pelo celular. Hoje, enquanto descansa em casa, você recebe uma mensagem.'],
 family:['Uma conversa em família','Você está organizando o dia e lembra de conversar com seu filho, que vive em outra cidade. Uma nova notificação aparece no celular.'],
 video:['Uma videochamada inesperada','É um fim de tarde tranquilo. Você está usando o celular quando recebe uma solicitação de videochamada. Decida como quer lidar com essa situação.'],
 bank:['Uma ligação durante o dia','Você acabou de terminar algumas tarefas de casa. O telefone toca enquanto você está descansando. A ligação parece estar relacionada à sua conta bancária.'],
 code:['Uma solicitação no celular','Enquanto conversa pelo WhatsApp, você recebe uma mensagem sobre acesso a uma conta. Observe a conversa e escolha o que fazer.'],
 delivery:['Esperando uma encomenda','Você está aguardando uma entrega em casa. Durante a tarde, recebe uma mensagem relacionada a uma encomenda.'],
 'call-tech':['Um telefonema sobre seu aparelho','Você está aprendendo a usar os recursos do celular quando recebe uma ligação relacionada a suporte técnico.'],
 relative:['Notícias de uma prima','Você costuma manter contato com parentes pelo celular. Hoje, uma mensagem chega enquanto você está fazendo suas atividades.'],
 account:['Um aviso sobre sua conta','Você está conferindo suas mensagens quando aparece um aviso relacionado ao acesso a uma conta.'],
 prize:['Uma novidade nas mensagens','Você abre o celular para ver as novidades do dia e encontra uma mensagem sobre uma promoção.'],
 'sms-delivery':['Uma mensagem sobre entrega','Você está em casa aguardando uma encomenda e recebe um SMS. Abra o aplicativo de mensagens para entender a situação.'],
 'sms-bank':['Um aviso por SMS','Durante suas atividades do dia, chega uma mensagem de texto relacionada a uma conta bancária.'],
 'sms-prize':['Uma promoção por SMS','Você está usando o celular quando chega um SMS sobre uma promoção. Observe a mensagem e tome sua decisão.'],
 friend:['Uma amiga quer conversar','Você está praticando o uso do WhatsApp e recebe uma mensagem de uma amiga. Aproveite para treinar uma conversa cotidiana.'],
 daughter:['Uma mensagem da sua filha','Sua filha costuma perguntar como foi seu dia. Uma nova mensagem chega enquanto você está em casa.'],
 'family-group':['Notícias do grupo da família','Você recebe uma notificação do grupo da família. É hora de praticar como acompanhar conversas em grupo.']
});
const STORY_CHANNELS={whatsapp:'WhatsApp',sms:'Mensagens (SMS)',call:'Ligação telefônica',video:'Videochamada'};
let storyScenario=null,storyReadId=null;

const video=()=>window.EducaVideoCall;
const state={active:false,scenario:null,pending:null,unread:new Set(),conversations:new Map(),delivered:0,seen:[],finished:0,completedSteps:new Set(),timer:null,replying:false,blocked:false,callAccepted:false,lastSpoken:'',recognizer:null,request:null,baseline:null,transitionTimer:null,callHandsFree:false,callUtterance:null,learningConsent:false,exampleConsent:false,score:100,riskyScenarios:new Set()};
const els={phone:$('#phoneScreen'),notice:$('#freeEventNotice'),noticeTitle:$('#freeEventTitle'),noticeText:$('#freeEventText'),noticeIcon:$('#freeEventIcon'),tools:$('#freeHomeTools'),floating:$('#freeFloatingHome'),solved:$('#freeSolved'),wallpaper:$('#chatWallpaper'),form:$('#freeOriginalComposer'),input:$('#freeOriginalInput'),send:$('#freeOriginalSend'),status:$('#freeOriginalAiStatus'),typing:$('#freeOriginalTyping'),familyActions:$('#freeFamilyActions'),callName:$('#freeCallName'),callLine:$('#freeCallLine'),callLog:$('#freeCallTranscript'),callForm:$('#freeCallForm'),callInput:$('#freeCallInput'),answer:$('#freeCallAnswer'),smsMessages:$('#freeSmsMessages'),smsSender:$('#freeSmsSender'),smsForm:$('#freeSmsForm'),smsInput:$('#freeSmsInput'),smsSend:$('#freeSmsSend'),smsStatus:$('#freeSmsStatus')};
const bridge=()=>window.EducaFreeView;
const visible=()=>els.phone?.getAttribute('data-current-view')||'';
const now=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const privateData=t=>/(?:\d[\s.-]?){6,}|https?:\/\/|www\.|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t);
function show(name){bridge()?.setView(name);syncUI();}
function syncUI(){const familyChat=state.active&&visible()==='chat'&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal';const showFamilyActions=familyChat&&(!isWebTraining()||!!document.documentElement?.dataset?.educaNativePlatform);if(els.familyActions)els.familyActions.hidden=!showFamilyActions;els.phone?.classList.toggle('free-family-chat',showFamilyActions);if(els.tools)els.tools.hidden=!state.active||visible()!=='home';if(els.floating)els.floating.hidden=!state.active||['home','whatsapp','chat','normal-chat'].includes(visible())||visible().startsWith('free-')||(isWebTraining()&&['bank-home','govbr-home','webreal'].includes(visible()));for(const id of ['freeBankBack','freeWhatsappBack','freeGovBack']){const button=$('#'+id);if(button)button.hidden=!state.active||!isWebTraining();}if(els.solved)els.solved.textContent=isWebTraining()?`${state.finished} situações · ${state.score} pontos`:`${state.finished} situações`;if(els.form)els.form.hidden=!state.active||visible()!=='chat';updateUnread();}
function stopVoice(){state.callHandsFree=false;state.callUtterance=null;window.EducaLiaNeuralPlayback?.stop?.('call');try{state.recognizer?.stop();}catch(_){}state.recognizer=null;}
function clearRequest(){state.request?.abort();state.request=null;state.replying=false;if(els.typing)els.typing.hidden=true;if(els.send)els.send.disabled=false;if(els.smsSend)els.smsSend.disabled=false;}
function clearTransition(){clearTimeout(state.transitionTimer);state.transitionTimer=null;}
// V112.08: se o participante tenta rolar ou ler o resumo, o avanço
// automático pausa apenas na WEB. De outro modo os 2,8 segundos eram
// insuficientes para alcançar a terceira ação no mockup pequeno.
function pauseSummaryTransition(){
 if(document.documentElement?.dataset?.educaPlatform!=='web'||
    !state.active||visible()!=='free-summary'||!state.transitionTimer||
    $('#freeSummaryView')?.classList.contains('web-quick-risk'))return;
 clearTransition();
 const notice=$('#freeSummaryAuto');
 if(notice){
  notice.hidden=false;
  notice.textContent='Avanço automático pausado para você ler. Use os botões abaixo.';
 }
}
function schedule(min=16000,max=30000){clearTimeout(state.timer);state.timer=null;if(state.active)state.timer=setTimeout(triggerEvent,min+Math.random()*(max-min));}
function isWebTraining(){return document.documentElement?.dataset?.educaPlatform==='web';}
// V112.09: análise local de decisão, sem guardar mensagem e sem Pix real.
function riskyTrainingPromise(s,message){
 if(!isWebTraining()||!s||s.kind!=='pix')return false;
 const clean=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const t=clean(message);
 // Condicional, recusa e verificação não representam aceite de pagamento.
 if(/\b(nao|nunca|jamais|sem|primeiro|antes de|so depois|quando|depois que|se)\b/.test(t)||
    /\b(conferir|verificar|confirmar|validar|identidade|canal oficial|numero antigo)\b/.test(t))return false;
 const accepted=/\b(?:vou|irei)\s+(?:(?:te|lhe)\s+)?(?:mandar|enviar|transferir|pagar)\b|\b(?:vou|irei)\s+(?:fazer|realizar|enviar)\s+(?:o|um)?\s*pix\b|\b(?:eu\s+)?(?:pago|transfiro|envio)\s+(?:agora|ja|pra voce|para voce)\b|\b(?:ja\s+)?(?:fiz|enviei|mandei|transferi)\s+(?:o\s+)?(?:pix|dinheiro|valor)\b/.test(t);
 if(!accepted)return false;
 const context=clean([s.intro,...(state.conversations.get(s.id)||[]).filter(r=>r.role==='assistant').map(r=>r.content)].join(' '));
 return /\b(pix|dinheiro|valor|pagar|despesa|emprest|transfer|taxa)\b/.test(context);
}
function registerWebRisk(s,message){
 if(!riskyTrainingPromise(s,message)||state.riskyScenarios.has(s.id))return false;
 state.riskyScenarios.add(s.id);
 state.score=Math.max(0,state.score-15);
 syncUI();
 return true;
}
function setStatus(message){els.status.textContent=message||'';els.status.hidden=!message;}
function updateUnread(){const w=$('#homeView [data-open-app="whatsapp"]');w?.classList.toggle('free-has-unread',state.active&&[...state.unread].some(id=>byId[id]?.channel==='whatsapp'));for(const row of document.querySelectorAll('#whatsappView .wa-chat-list .chat-row')){const id=row.dataset.freeScenario||row.dataset.scenario||row.dataset.normalChat;row.classList.toggle('free-unread',state.unread.has(id));const badge=row.querySelector('.chat-meta b');if(badge)badge.hidden=!state.unread.has(id)&&state.active;}}
function start(){if(!bridge()?.isTraining()||!bridge()?.canFreeMode?.())return;stop();state.active=true;storyReadId=isWebTraining()?WEB_SCRIPTED_ORDER[0]:null;
 state.learningConsent=document.documentElement?.dataset?.educaPlatform==='web'&&
   document.getElementById('freeLearningConsent')?.checked===true;
 state.exampleConsent=document.documentElement?.dataset?.educaPlatform==='web'&&
   document.getElementById('freeExampleConsent')?.checked===true;
 // V112.02: Web deixa de baixar um modelo pesado de voz no celular.
 // Android/iOS nativos preservam o aquecimento original do Kokoro.
 if(window.EducaLiaBrowserKokoro&&document.documentElement?.dataset?.educaPlatform!=='web'&&
    document.getElementById('freeVideoVoiceEngine')?.value!=='padrao')
  void window.EducaLiaBrowserKokoro.prewarmIntro().catch(()=>{});
 // A voz feminina do sistema pode ser procurada paralelamente, sem bloquear.
 if(document.documentElement?.dataset?.educaPlatform==='web')
  void window.EducaLiaVoice?.waitForFemale?.(500)?.catch?.(()=>{});
 state.finished=0;state.score=100;state.riskyScenarios.clear();state.delivered=0;state.seen=[];state.completedSteps.clear();state.unread.clear();state.conversations.clear();state.blocked=false;state.callHandsFree=false;state.baseline=[...document.querySelectorAll('#whatsappView .wa-chat-list .chat-row')].map(row=>({row,preview:row.querySelector('.chat-copy small')?.textContent,time:row.querySelector('.chat-meta small')?.textContent,badgeHidden:row.querySelector('.chat-meta b')?.hidden,hidden:row.hidden}));els.phone?.classList.add('free-active');els.notice.hidden=true;prepareContactRows();show('home');schedule(1800,3200);}
function stop(){clearTransition();cancelIntroReading();storyScenario=null;storyReadId=null;video()?.close?.();clearTimeout(state.timer);state.timer=null;clearRequest();stopVoice();state.active=false;state.learningConsent=false;state.exampleConsent=false;state.pending=null;state.scenario=null;state.blocked=false;state.unread.clear();
 const list=$('#whatsappView .wa-chat-list');for(const dynamic of document.querySelectorAll('#whatsappView [data-free-scenario]'))dynamic.remove();
 if(list&&state.baseline)for(const {row,preview,time,badgeHidden,hidden} of state.baseline){row.hidden=hidden;row.classList.remove('free-unread');if(row.querySelector('.chat-copy small'))row.querySelector('.chat-copy small').textContent=preview;if(row.querySelector('.chat-meta small'))row.querySelector('.chat-meta small').textContent=time;if(row.querySelector('.chat-meta b'))row.querySelector('.chat-meta b').hidden=badgeHidden;list.append(row);}state.baseline=null;
 els.phone?.classList.remove('free-active','free-family-chat');if(els.notice)els.notice.hidden=true;if(els.form)els.form.hidden=true;setStatus('');syncUI();}
function exit(){stop();bridge()?.openLearningHub();}
function home(){if(!state.active)return;if(isWebTraining()&&visible()==='free-intro'){closeFreeIntro();return;}clearRequest();clearTransition();video()?.close?.();stopVoice();const wasResult=visible()==='free-summary';show('home');if(wasResult){state.scenario=null;state.blocked=false;const next=nextScriptedScenario();schedule(next?.id==='video'?1900:7000,next?.id==='video'?2900:11500);}}
// V112.57 — mensagens fictícias surgem apenas quando o evento acontece.
// Retirar as linhas do DOM evita que pesquisa e filtros revelem desafios futuros.
// A lista original das atividades guiadas é restaurada em stop().
function prepareContactRows(){
 const list=$('#whatsappView .wa-chat-list');if(!list)return;
 for(const old of list.querySelectorAll('[data-free-scenario]'))old.remove();
 for(const {row} of state.baseline||[])if(!row.dataset.normalChat)row.remove();
}
function ensureContactRow(s){
 if(!state.active||s.channel!=='whatsapp')return null;
 const list=$('#whatsappView .wa-chat-list');if(!list)return null;
 const existing=$(`#whatsappView [data-scenario="${s.id}"],#whatsappView [data-free-scenario="${s.id}"],#whatsappView [data-normal-chat="${s.id}"]`);
 if(existing)return existing;
 const original=state.baseline?.find(({row})=>row.dataset.scenario===s.id||row.dataset.normalChat===s.id)?.row;
 if(original){original.hidden=false;list.prepend(original);return original;}
 const btn=document.createElement('button');btn.type='button';btn.className='chat-row training-chat';btn.dataset.freeScenario=s.id;
 const avatar=document.createElement('span');avatar.className='avatar wa-avatar green';avatar.textContent=s.icon;
 if(s.photoUrl){
  avatar.textContent='';
  const image=document.createElement('img');image.src=s.photoUrl;image.alt='';image.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%';
  image.onerror=()=>{image.remove();avatar.textContent=s.icon;};
  avatar.append(image);
 }
 const copy=document.createElement('span');copy.className='chat-copy';const strong=document.createElement('strong');strong.textContent=s.name;const small=document.createElement('small');copy.append(strong,small);
 const meta=document.createElement('span');meta.className='chat-meta';const time=document.createElement('small');time.textContent=now();const badge=document.createElement('b');badge.textContent='1';badge.hidden=true;meta.append(time,badge);btn.append(avatar,copy,meta);list.prepend(btn);return btn;
}
function updatePreview(s){
 if(s.channel!=='whatsapp')return;
 const row=ensureContactRow(s);if(!row)return;
 const m=state.conversations.get(s.id)?.at(-1);const preview=row.querySelector('.chat-copy small');
 if(preview)preview.textContent=(m?.content||s.intro).slice(0,55);
 const clock=row.querySelector('.chat-meta small');if(clock)clock.textContent=now();
 row.parentNode?.prepend(row);updateUnread();
}
function nextScriptedScenario(){
 const order=isWebTraining()?WEB_SCRIPTED_ORDER:SCRIPTED_ORDER;
 const bonus=isWebTraining()?WEB_BONUS_ORDER:BONUS_ORDER;
 return byId[order.find(id=>!state.completedSteps.has(id))||
   bonus.find(id=>!state.completedSteps.has(id))]||null;
}
function chooseScenario(){let s=nextScriptedScenario();if(!s){const pool=[...(isWebTraining()?[byId['family-photo']]:[]),byId.code,byId.delivery,byId.relative,byId.account,byId.prize,byId['sms-bank'],byId['sms-delivery'],byId['sms-prize'],byId['call-tech'],byId.friend,byId.family,byId.bank,byId.video].filter(x=>!state.seen.slice(-3).includes(x.id));s=pool[Math.floor(Math.random()*pool.length)];}return s;}
function triggerEvent(){if(!state.active||visible()==='free-intro')return;if(state.blocked||visible()==='free-pix'||visible()==='free-call'||visible()==='free-video'||visible()==='free-sms'||visible()==='chat'){schedule(12000,22000);return;}const s=chooseScenario();if(isWebTraining()&&storyReadId!==s.id){openScenarioStory(s);return;}deliverScenario(s);}
function deliverScenario(s){if(!state.active||!s)return;state.delivered++;state.seen.push(s.id);state.pending=s;
 if(s.channel==='whatsapp'||s.channel==='sms'){const list=state.conversations.get(s.id)||[];if(!list.length)list.push({role:'assistant',content:s.intro});state.conversations.set(s.id,list.slice(-14));state.unread.add(s.id);updatePreview(s);}
 els.noticeIcon.textContent=s.channel==='call'?'☎':s.channel==='video'?'▣':s.channel==='sms'?'✉':'●';els.noticeTitle.textContent=s.notification;els.noticeText.textContent=s.name+': '+s.intro.slice(0,82);els.notice.hidden=false;updateUnread();clearTimeout(state.timer);state.timer=null;
 if(s.channel==='call')showIncomingCall(s);else if(s.channel==='video')video()?.incoming(s);
}
function dismiss(){els.notice.hidden=true;state.pending=null;schedule(18000,28000);}
function openPending(){const s=state.pending;state.pending=null;els.notice.hidden=true;if(!s)return;schedule(28000,48000);if(s.channel==='call')showIncomingCall(s);else if(s.channel==='video')video()?.incoming(s);else if(s.channel==='sms')openSms(s);else openChat(s);}
// Mantém a posição enquanto o participante lê mensagens anteriores.
function chatNearBottom(panel){return !panel||panel.scrollHeight-panel.clientHeight-panel.scrollTop<=48;}
function followChat(panel,follow){if(panel&&follow)panel.scrollTop=panel.scrollHeight;}
function repeatedWhatsAppReply(reply,history){
 const key=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
 const candidate=key(reply);
 if(!candidate)return false;
 return history.filter(row=>row.role==='assistant').slice(-4).some(row=>key(row.content)===candidate);
}
function renderBubble(role,text){const follow=role==='user'||chatNearBottom(els.wallpaper);const div=document.createElement('div');div.className='message '+(role==='user'?'outgoing':'incoming');div.append(document.createTextNode(text));const tm=document.createElement('time');tm.textContent=now();div.append(tm);els.wallpaper.append(div);followChat(els.wallpaper,follow);}
function renderPhoto(s){
 if(!isWebTraining()||!s?.photoUrl||!els.wallpaper)return;
 const bubble=document.createElement('div');bubble.className='message incoming free-training-photo';
 const photo=document.createElement('img');
 photo.src=s.photoUrl;
 photo.onerror=()=>{photo.onerror=null;photo.src='/static/img/free-family-photo-v11212.jpg';};
 photo.alt='Foto ilustrativa sintética enviada pelo contato que afirma ser familiar';
 photo.loading='eager';photo.decoding='async';photo.width=520;photo.height=632;photo.className='free-contact-photo-trigger';photo.tabIndex=0;photo.setAttribute('role','button');photo.setAttribute('aria-label','Ampliar foto recebida nesta simulação');
 const stamp=document.createElement('small');stamp.textContent='Foto recebida · simulação';
 const follow=chatNearBottom(els.wallpaper);bubble.append(photo,stamp);els.wallpaper.append(bubble);followChat(els.wallpaper,follow);
}
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
 clearRequest();state.scenario=s;state.blocked=false;state.pending=null;state.unread.delete(s.id);els.notice.hidden=true;updateUnread();
 if(els.smsSender)els.smsSender.textContent=s.name;
 if(els.smsMessages)els.smsMessages.replaceChildren();
 const history=state.conversations.get(s.id)||[{role:'assistant',content:s.intro}];
 if(!state.conversations.has(s.id))state.conversations.set(s.id,history);
 show('free-sms');for(const m of history)renderSmsBubble(m.role,m.content);
 if(els.smsStatus){els.smsStatus.textContent='SMS fictício · nenhum link é necessário';}
}
function openChat(s){if(!s||!state.active)return;if(!state.timer)schedule(28000,48000);clearRequest();state.scenario=s;state.blocked=false;state.unread.delete(s.id);state.pending=null;els.notice.hidden=true;updateUnread();$('#scenarioTitle').textContent=s.name;$('#scenarioAvatar').textContent=s.icon;$('#scenarioAvatar').className='avatar blue small';$('#scenarioSubtitle').textContent=isWebTraining()?`Contato fictício · ${state.score} pontos`:'Contato fictício · simulação';els.wallpaper.replaceChildren();const badge=document.createElement('span');badge.className='chat-day';badge.textContent='Hoje · Ambiente de treinamento';els.wallpaper.append(badge);let hist=state.conversations.get(s.id);
 if(!hist?.length){hist=[{role:'assistant',content:s.intro}];state.conversations.set(s.id,hist);}
 // A foto é um asset local fictício; o histórico contém apenas textos, nunca bytes ou dados pessoais.
 if(isWebTraining()&&s.photoUrl&&s.photoAsk&&!hist.some(row=>row.role==='assistant'&&row.content===s.photoAsk)){
  hist.splice(1,0,{role:'assistant',content:s.photoAsk});
  state.conversations.set(s.id,hist.slice(-16));
 }
 show('chat');window.EducaWebContactProfile?.refresh?.();for(const row of hist){renderBubble(row.role,row.content);if(row.role==='assistant'&&row.content===s.intro)renderPhoto(s);}followChat(els.wallpaper,true);setStatus('');}
function showIncomingCall(s){if(!state.active)return;window.EducaAccessibility?.stopReading?.();clearRequest();state.pending=null;state.scenario=s;state.callAccepted=false;state.callHandsFree=false;els.notice.hidden=true;els.callName.textContent=s.name;els.callLine.textContent='Chamada simulada recebida';els.callLog.replaceChildren();els.callForm.hidden=true;els.answer.hidden=false;$('#freeCallHangup').textContent='Recusar / encerrar';show('free-call');}
async function send(text){const s=state.scenario;if(!state.active||!s||state.replying||state.blocked)return;const message=String(text||'').trim();if(!message)return;
 if(privateData(message)){const warning='Não informe dados, códigos, senhas ou links reais. Use somente textos fictícios.';setStatus(warning);if(visible()==='free-call')els.callLine.textContent=warning;if(visible()==='free-sms'&&els.smsStatus)els.smsStatus.textContent=warning;return;}
 const current=s.id;const oldHist=(state.conversations.get(s.id)||[]).slice(-8);append('user',message);setStatus('');
 const sentAt=Date.now();
  // V112.10: decisão explícita -> resultado curto e próximo desafio SEM aguardar Workers AI.
  // Não exibir aviso gigante dentro da conversa e não confundir promessa com Pix realizado.
  if(isWebTraining()&&riskyTrainingPromise(s,message)){
   registerWebRisk(s,message);
   finish('risk');
   return;
  }
  state.replying=true;els.send.disabled=true;if(els.smsSend)els.smsSend.disabled=true;if(els.smsStatus&&visible()==='free-sms')els.smsStatus.textContent='O contato fictício está respondendo…';els.typing.hidden=visible()!=='chat';const abort=new AbortController();state.request=abort;let err='';let reply='';let timedOut=false;
 const responseTimeoutMs=document.documentElement?.dataset?.educaPlatform==='web'?18000:17000; // V112.10: limite Web 18s, nativos preservam 17s
 let ownsRequest=false;
 const responseTimer=setTimeout(()=>{timedOut=true;abort.abort();},responseTimeoutMs); // sempre limitar a espera para evitar "em andamento" infinito
 try{const response=await fetch(isWebTraining()?'/api/modo-livre/conversar-web':'/api/modo-livre/conversar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:s.id,message,history:oldHist,
  learningConsent:state.learningConsent===true,exampleConsent:state.exampleConsent===true,
  ...(isWebTraining()?{webChallenge:{level:Math.min(3,1+Math.floor((state.finished+state.riskyScenarios.size)/2)),tries:Math.min(2,oldHist.filter(m=>m.role==='user'&&/n[aã]o|desconfio|golpe|bloquear|canal oficial/i.test(m.content)).length)}}:{})}),signal:abort.signal});const data=await response.json().catch(()=>({}));if(!response.ok||!data.ok||data.mode!=='ia'||!data.reply)throw Error(data.message||'A inteligência artificial está indisponível. Tente novamente.');reply=data.reply.slice(0,330);if(privateData(reply))throw Error('A IA retornou dados inadequados. Tente novamente.');
 // V112.50: indicador "digitando" permanece visível durante a pausa breve.
 if(isWebTraining()&&s.id==='family-photo'){
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
   const target=reduced?250:Math.min(2000,1050+Math.round(message.length*9+reply.length*4));
   const remaining=Math.max(0,target-(Date.now()-sentAt));
   if(remaining>0)await new Promise(resolve=>setTimeout(resolve,remaining));
 }
}
 catch(ex){err=timedOut?'A IA demorou para responder. Tente novamente com uma frase curta.':ex.name==='AbortError'?'A conexão com a IA foi interrompida.':/Failed to fetch|Failed to execute|NetworkError|fetch failed/i.test(String(ex.message))?'Não foi possível conectar à IA. Confira Ollama no Educa+ local ou o Workers AI na Cloudflare.':String(ex.message||'Não foi possível falar com a IA.');}
 finally{clearTimeout(responseTimer);ownsRequest=state.request===abort;if(ownsRequest){state.request=null;state.replying=false;els.send.disabled=false;if(els.smsSend)els.smsSend.disabled=false;els.typing.hidden=true;}}
 if(!ownsRequest||!state.active||state.scenario?.id!==current||(abort.signal.aborted&&!timedOut))return;
 if(err){if(visible()==='chat')setStatus(err);else if(visible()==='free-video')video()?.error(err);else if(visible()==='free-sms'&&els.smsStatus)els.smsStatus.textContent=err;else els.callLine.textContent=err;return;}
 if(isWebTraining()&&s.channel==='whatsapp'&&visible()==='chat'&&repeatedWhatsAppReply(reply,state.conversations.get(s.id)||[])){
  // Não inventar uma nova resposta nem insistir repetidamente: mensagem de estado fora do diálogo.
  setStatus('O contato repetiu uma resposta anterior. Nenhuma nova mensagem foi adicionada. Você pode continuar ou revisar os sinais de segurança.');
  return;
 }
 append('assistant',reply);if(visible()==='free-video')video()?.reply(reply);else if(visible()==='free-call'&&state.callAccepted)speak();else if(visible()==='free-sms'&&els.smsStatus)els.smsStatus.textContent='SMS simulado · responda ou escolha uma ação segura';}
function finish(kind='safe',reason=''){
 if(!state.active)return;
 // V112.10: uma vez encerrada por erro, esta rodada nunca pode virar um acerto.
 if(isWebTraining()&&state.blocked&&visible()==='free-summary')return;
 const s=state.scenario||state.pending;
 if(!s){home();return;}
 // Ao revisitar um contato já reprovado nesta sessão, nem Bloquear nem outro
 // botão pode converter a falha anterior em uma nova vitória ou recuperar pontos.
 if(isWebTraining()&&state.completedSteps.has(s.id)&&state.riskyScenarios.has(s.id))kind='risk';
 const quickRisk=isWebTraining()&&kind==='risk';
 const unsafe=kind==='unsafe'||kind==='risk';
 const safe=!unsafe;
 const commitmentLoss=isWebTraining()&&state.riskyScenarios.has(s.id)?15:0;
 // -15 já é aplicado na mensagem; somente CONFIRMAR Pix deduz mais 25.
 const pixLoss=isWebTraining()&&kind==='unsafe'?(commitmentLoss?25:40):0;
 if(pixLoss)state.score=Math.max(0,state.score-pixLoss);
 // Apenas sinais agregados consentidos são enviados, nunca as conversas.
 if(state.learningConsent===true&&isWebTraining()){
  void fetch('/api/lia/training/outcome',{method:'POST',credentials:'same-origin',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({consent:true,scenario:s.id,outcome:unsafe?'unsafe':'safe'})
  }).catch(()=>{});
 }
 clearRequest();video()?.close?.();stopVoice();
 if(safe)state.finished++;
 if(SCRIPTED_ORDER.includes(s.id)||BONUS_ORDER.includes(s.id)||(isWebTraining()&&s.id==='family-photo'))state.completedSteps.add(s.id);
 state.blocked=true;state.pending=null;clearTimeout(state.timer);state.timer=null;
 if(els.notice)els.notice.hidden=true;
 const summaryView=$('#freeSummaryView');
 summaryView?.classList.toggle('web-quick-risk',quickRisk);
 const next=nextScriptedScenario();
 const icon=$('#freeSummaryIcon'),title=$('#freeSummaryTitle'),text=$('#freeSummaryText');
 const detail=$('#freeSummaryDetail'),nextButton=$('#freeSummaryNext'),transition=$('#freeSummaryAuto');
 if(quickRisk){
  if(icon)icon.textContent='−15';
  if(title)title.textContent='Você perdeu 15 pontos';
  if(text)text.textContent='Você aceitou um Pix suspeito. Restam '+state.score+' pontos.'+(next?.id==='video'?' Próximo: videochamada com a LIA.':'');
  if(detail)detail.textContent='Antes de enviar dinheiro, confirme a identidade pelo número antigo.';
  if(nextButton){nextButton.hidden=false;nextButton.textContent='Ir para o próximo desafio';}
  if(transition){transition.hidden=true;transition.textContent='';}
 }else{
  if(icon)icon.textContent=safe&&!commitmentLoss?'✓':'!';
  if(title)title.textContent=safe&&!commitmentLoss?'Situação concluída':'Atenção à decisão';
  const message=safe?'Você concluiu esta situação do treino.':'Você confirmou um Pix FICTÍCIO. Nenhum dinheiro verdadeiro foi enviado.';
  if(text)text.textContent=message+(['family','family-photo'].includes(s.id)&&next?.id==='video'?' A seguir, uma videochamada com a LIA: ver um rosto não garante a identidade.':'')+(isWebTraining()?' Pontuação: '+state.score+' pontos.'+(pixLoss?' (−'+pixLoss+' pontos pelo Pix fictício confirmado.)':commitmentLoss?' (−15 pontos por aceitar enviar antes de verificar.)':''):'');
  if(detail)detail.textContent=(commitmentLoss?'Você assumiu risco ao concordar em enviar dinheiro sem confirmar a identidade. ':'')+(reason?reason+' ':'')+s.tips;
  if(nextButton){nextButton.hidden=false;nextButton.textContent='Avançar agora';}
  if(transition){transition.hidden=false;transition.textContent=isWebTraining()?'Preparando a próxima história…':next?.id==='video'?'Abrindo videochamada automaticamente…':next?.id==='bank'?'Iniciando ligação telefônica automaticamente…':next?.channel==='sms'?'Um SMS de treinamento chegará em seguida…':'Preparando a próxima atividade automaticamente…';}
 }
 if(isWebTraining()){
  const panel=$('#freeSummaryView .v106-summary');
  if(panel)panel.scrollTop=0;
 }
 show('free-summary');
 clearTransition();
 // Resultado curto não pausa ao rolar; participante pode avançar imediatamente.
 state.transitionTimer=setTimeout(()=>{state.transitionTimer=null;continueTraining();},quickRisk?3200:2800);
}
function continueTraining(){
 if(!state.active||visible()!=='free-summary')return;
 clearTransition();clearTimeout(state.timer);state.timer=null;
 state.scenario=null;state.blocked=false;state.pending=null;
 const next=nextScriptedScenario();
 if(isWebTraining()){openScenarioStory(next||chooseScenario());return;}
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
 const neural=window.EducaLiaNeuralPlayback;
 if(!neural?.speak){els.callLine.textContent='Voz neural não disponível. Continue por texto.';return;}
 try{state.recognizer?.abort?.();}catch(_){}
 state.recognizer=null;
 const phrase=state.lastSpoken||state.scenario?.intro||'Olá';
 const current={};state.callUtterance=current;
 els.callLine.textContent='Preparando a mesma voz neural Dora da LIA…';
 void neural.speak(phrase,{
  owner:'call',speed:1.05,
  onStart:()=>{if(state.callUtterance===current)els.callLine.textContent='Personagem fictício falando com a voz neural…';},
  onEnd:()=>{
   if(state.callUtterance!==current)return;
   state.callUtterance=null;els.callLine.textContent='Sua vez de falar ou digitar.';
   if(state.callHandsFree&&state.active&&visible()==='free-call'&&state.callAccepted)listen();
  },
  onBlocked:()=>{
   if(state.callUtterance!==current)return;
   state.callUtterance=null;els.callLine.textContent='Som bloqueado pelo navegador. Toque em Ouvir personagem novamente.';
  },
  onError:()=>{
   if(state.callUtterance!==current)return;
   state.callUtterance=null;els.callLine.textContent='Voz neural temporariamente indisponível. Continue por texto ou tente novamente.';
  }
 }).catch(()=>{if(state.callUtterance===current){state.callUtterance=null;els.callLine.textContent='Não foi possível reproduzir a voz neural.';}});
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
 const vcall=e.target.closest('#chatView .chat-header-actions button[aria-label="Videochamada"]');if(vcall){e.preventDefault();e.stopImmediatePropagation();if(isWebTraining()&&state.scenario?.id==='family-photo')window.EducaWebContactProfile?.openCall?.('video');else video()?.incoming(byId.video);return;}
 const call=e.target.closest('#chatView .chat-header-actions button[aria-label="Ligação"]');if(call){e.preventDefault();e.stopImmediatePropagation();if(isWebTraining()&&state.scenario?.id==='family-photo')window.EducaWebContactProfile?.openCall?.('call');else showIncomingCall({...state.scenario||byId.family,channel:'call'});return;}
 const pay=e.target.closest('#bankSendPixBtn');if(pay){e.preventDefault();e.stopImmediatePropagation();openPix();return;}
 if(e.target.closest('#chatView .android-back')){clearRequest();setStatus('');}
},true);
// O Android existente já emite estes eventos para os gestos da barra inferior.
for(const name of ['educa:system-home','educa:system-learning','educa:system-back'])window.addEventListener(name,e=>{if(!state.active)return;e.stopImmediatePropagation();home();},true);
$('#gestureHome')?.addEventListener('click',e=>{if(!state.active)return;e.stopImmediatePropagation();home();},true);
// Rolagem, toque ou teclado indicam que a pessoa quer ler os resultados.
const summaryScroller=$('#freeSummaryView .v106-summary');
for(const eventName of ['wheel','touchstart','pointerdown','keydown']){
 summaryScroller?.addEventListener(eventName,event=>{
  // Mantenha o botão no mesmo lugar até o navegador concluir o toque.
  if((eventName==='pointerdown'||eventName==='touchstart')&&event.target.closest?.('button'))return;
  pauseSummaryTransition();
 },{passive:eventName!=='keydown'});
}
// V112.72 — tempo mínimo de leitura da narrativa, sem início automático.
const INTRO_READ_MS=5000;
let introTimer=null,introRemaining=INTRO_READ_MS,introLastTick=0;
function cancelIntroReading(){
 const notice=$('#freeIntroNotice');if(notice)notice.hidden=true;
 if(introTimer!==null)clearInterval(introTimer);
 introTimer=null;introRemaining=INTRO_READ_MS;
 const button=$('#freeIntroStart');if(button)button.disabled=true;
 const label=$('#freeIntroStartLabel');if(label)label.textContent='Leia a história · 5 s';
}
function tickIntroReading(){
 if(visible()!=='free-intro'){cancelIntroReading();return;}
 const now=performance.now();
 if(!document.hidden)introRemaining=Math.max(0,introRemaining-(now-introLastTick));
 introLastTick=now;
 const button=$('#freeIntroStart'),label=$('#freeIntroStartLabel');
 if(introRemaining<=0){
  clearInterval(introTimer);introTimer=null;
  if(button)button.disabled=false;
  if(label)label.textContent='Começar história';
  const status=$('#freeIntroReady');if(status)status.textContent='Você já pode começar a história.';
 }else if(label)label.textContent='Leia a história · '+Math.ceil(introRemaining/1000)+' s';
}
document.addEventListener('visibilitychange',()=>{introLastTick=performance.now();});
window.addEventListener('educa:training-view',e=>{
 if(e.detail?.view==='free-intro'||!storyScenario)return;
 if(state.active){stop();return;}
 cancelIntroReading();storyScenario=null;
});
function openScenarioStory(s){
 if(!s||!bridge()?.isTraining()||!bridge()?.canFreeMode?.())return;
 cancelIntroReading();clearTimeout(state.timer);state.timer=null;
 if(els.notice)els.notice.hidden=true;
 const copy=STORY_CONTEXT[s.id]||['Uma nova situação','Você recebe uma nova comunicação no celular de treinamento. Leia com calma e decida como agir.'];
 const title=$('#freeIntroTitle'),body=$('#freeIntroView .free-intro-story p'),channel=$('#freeIntroChannel'),illustration=$('#freeIntroIllustration');
 if(title)title.textContent=copy[0];
 if(body)body.textContent=copy[1];
 const channelName=STORY_CHANNELS[s.channel];
 if(channel)channel.textContent=channelName||'Celular';
 if(illustration)illustration.src='/static/img/free-story-v11282/'+(channelName?s.channel:'whatsapp')+'.webp';
 show('free-intro');
 if(visible()!=='free-intro')return;
 storyScenario=s;
 const intro=$('#freeIntroView .free-intro-surface');if(intro)intro.scrollTop=0;
 const status=$('#freeIntroReady');if(status)status.textContent='';
 $('#freeIntroTitle')?.focus?.({preventScroll:true});
 const notice=$('#freeIntroNotice');if(notice)notice.hidden=false;
 introLastTick=performance.now();introTimer=setInterval(tickIntroReading,100);
}
function openFreeIntro(){
 if(!bridge()?.isTraining()||!bridge()?.canFreeMode?.())return;
 if(!isWebTraining()){start();return;}
 if(state.active)return;
 openScenarioStory(byId[WEB_SCRIPTED_ORDER[0]]);
}
function closeFreeIntro(){
 if(visible()!=='free-intro')return;
 cancelIntroReading();storyScenario=null;
 if(state.active)exit();else bridge()?.openLearningHub();
 $('#freeModeEntry')?.focus?.();
}
$('#freeModeEntry')?.addEventListener('click',openFreeIntro);
$('#freeIntroStart')?.addEventListener('click',()=>{
 if(visible()!=='free-intro'||!storyScenario||introRemaining>0||$('#freeIntroStart').disabled)return;
 const s=storyScenario;cancelIntroReading();storyScenario=null;
 if(!state.active){start();return;}
 storyReadId=s.id;show('home');deliverScenario(s);
});
$('#freeIntroBack')?.addEventListener('click',closeFreeIntro);
for(const id of ['freeBankBack','freeWhatsappBack','freeGovBack'])$('#'+id)?.addEventListener('click',home);
$('#freeExitBtn')?.addEventListener('click',exit);$('#freeSummaryExit')?.addEventListener('click',exit);$('#freeSummaryHome')?.addEventListener('click',home);$('#freeSummaryNext')?.addEventListener('click',continueTraining);
$('#freeEventOpen')?.addEventListener('click',openPending);$('#freeEventDismiss')?.addEventListener('click',dismiss);$('#freeFloatingBack')?.addEventListener('click',home);
els.form?.addEventListener('submit',e=>{e.preventDefault();const t=els.input.value;if(!t.trim())return;els.input.value='';send(t);});
$('#freeFamilyVerify')?.addEventListener('click',()=>{if(state.active&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal'&&visible()==='chat')show('free-contacts');});
$('#freeFamilyBlock')?.addEventListener('click',()=>{if(state.active&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal'&&visible()==='chat')finish('safe','Você bloqueou o contato suspeito sem compartilhar dados nem transferir dinheiro.');});
els.smsForm?.addEventListener('submit',e=>{e.preventDefault();const text=els.smsInput?.value||'';if(els.smsInput)els.smsInput.value='';send(text);});
 $('#freeSmsVerify')?.addEventListener('click',()=>finish('safe','Você conferiu o SMS fora da mensagem, pelo canal oficial.'));
 $('#freeSmsBlock')?.addEventListener('click',()=>finish('safe','Você ignorou e bloqueou a mensagem suspeita.'));
 $('#freeSmsBack')?.addEventListener('click',home);
 $('#freeCallAnswer')?.addEventListener('click',()=>{if(!state.scenario)return;window.EducaLiaNeuralPlayback?.unlock?.();state.callAccepted=true;els.answer.hidden=true;els.callForm.hidden=false;els.callLine.textContent='Chamada fictícia conectada';if(!state.conversations.get(state.scenario.id)?.length)append('assistant',state.scenario.intro);else {const t=state.conversations.get(state.scenario.id).at(-1)?.content||state.scenario.intro;const p=document.createElement('p');p.textContent=t;els.callLog.append(p);state.lastSpoken=t;}speak();});
$('#freeCallHangup')?.addEventListener('click',()=>finish('safe','Você encerrou a ligação sem passar informações.'));$('#freeCallVerify')?.addEventListener('click',()=>finish('safe','Você preferiu o canal oficial.'));
$('#freeCallSpeak')?.addEventListener('click',()=>{window.EducaLiaNeuralPlayback?.unlock?.();speak();});$('#freeCallMic')?.addEventListener('click',()=>{window.EducaLiaNeuralPlayback?.stop?.('call');state.callHandsFree=true;listen();});$('#freeCallForm')?.addEventListener('submit',e=>{e.preventDefault();const t=els.callInput.value;els.callInput.value='';send(t);});
$('#freeContactsBack')?.addEventListener('click',home);$('#freeContactKnown')?.addEventListener('click',()=>finish('safe','Você confirmou pelo número conhecido.'));$('#freeContactBank')?.addEventListener('click',()=>finish('safe','Você consultou um canal oficial.'));
$('#freePixBack')?.addEventListener('click',()=>show('bank-pix'));$('#freePixCancel')?.addEventListener('click',()=>finish('safe','Você cancelou o Pix sem confirmar o destinatário.'));$('#freePixConfirm')?.addEventListener('click',()=>finish('unsafe','A pessoa que pediu o dinheiro não era o destinatário mostrado.'));
$('#logoutBtn')?.addEventListener('click',stop);$('#focusLogoutBtn')?.addEventListener('click',stop);
if(els.phone)new MutationObserver(syncUI).observe(els.phone,{attributes:true,attributeFilter:['data-current-view']});
window.EducaFreeMode=Object.freeze({currentScenario:()=>state.active&&isWebTraining()?state.scenario?.id:null,currentContact:()=>{const s=state.scenario;return state.active&&isWebTraining()&&visible()==='chat'&&s?.channel==='whatsapp'?Object.freeze({id:s.id,name:s.id==='family-photo'?'Rafael':s.name,icon:s.icon,photo:s.id==='family-photo'&&!!s.photoUrl,normal:s.kind==='normal'}):null;},reportContact:()=>{if(isWebTraining()&&state.active&&state.scenario?.channel==='whatsapp'&&state.scenario?.kind!=='normal'&&visible()==='chat')finish('safe','Você denunciou e bloqueou o contato suspeito no treinamento, sem enviar dinheiro.');},enterVideo:()=>{window.EducaAccessibility?.stopReading?.();stopVoice();clearRequest();state.pending=null;state.scenario=byId.video;state.blocked=false;els.notice.hidden=true;clearTimeout(state.timer);},isActive:()=>state.active,start,stop,triggerEvent,videoState:()=>state.scenario?.id,sendVideo:(text)=>send(text),videoAccepted:()=>{if(state.scenario?.id!==byId.video.id)return;state.lastSpoken=byId.video.intro;append('assistant',byId.video.intro);},hangupVideo:()=>finish('safe','Você encerrou a videochamada para confirmar a identidade. Nenhum dinheiro real foi enviado.'),verifyVideo:()=>finish('safe','Você optou por confirmar a identidade por outro canal conhecido.'),openPixVideo:openPix});
})();
