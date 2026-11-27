/* V112.97 — one guided action at a time, inside the apps already on the phone.
 * All alerts, accounts, calls, chats and webpages are local teaching examples.
 * The original landing, topic list, Pix pretest and Modo Livre are untouched. */
(()=>{
'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const phone=$('#phoneScreen');
let session=null;
const element=(tag,cls='',text='')=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
const button=(id,label,cls='guided-real-button')=>{const e=element('button',cls,label);e.type='button';e.id=id;return e;};
function clearNodes(){
 $('.guided-native-panel,.guided-native-row,.guided-real-scene,.guided-real-flag,.guided-real-inbox-row,.guided-real-verification,.guided-real-topline,.guided-real-detail-card,.guided-real-chat-inspect,.guided-real-chat-disclaimer').forEach(el=>el.remove());
 $('#webRealView')?.removeAttribute('data-guided-flow-app');
 phone?.removeAttribute('data-guided-app-lesson');
 phone?.removeAttribute('data-guided-bank-detail');
}
function stop(){
 if(session){session.controller.abort();session=null;}
 clearNodes();
}
function valid(s){return s&&session===s&&phone?.dataset.guidedAppLesson===s.code;}
function step(target,title,description,next,label){
 const s=session;
 const el=typeof target==='string'?$(target):target;
 if(!valid(s)||!el||!el.isConnected){console.error('GUIDED_REAL_TARGET_MISSING',s?.code,title,target);return false;}
 s.controller.abort();
 s.controller=new AbortController();
 s.counter++;
 s.bridge.clearGuide();
 s.bridge.setCoachMessage('ATIVIDADE GUIADA · PASSO '+s.counter,title,description);
 s.bridge.announce(description,true);
 if(!el.matches('button,a,input,select,textarea,[role="button"]')){el.tabIndex=0;el.setAttribute('role','button');}
 const trigger=e=>{
  if(!valid(s)||!el.isConnected||!el.closest('.android-view.is-active'))return;
  e.preventDefault();e.stopImmediatePropagation();
  s.controller.abort();
  s.bridge.clearGuide();
  next();
 };
 el.addEventListener('click',trigger,{capture:true,signal:s.controller.signal});
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){trigger(e);}}, {capture:true,signal:s.controller.signal});
 s.bridge.scheduleGuide(el,{label:label||'Toque aqui'},150);
 return true;
}
function finish(){
 const s=session;if(!valid(s))return;
 const fn=s.bridge.finish;
 stop();s.bridge.clearGuide();fn();
}
function appView(name){const s=session;if(!valid(s))return; s.bridge.setView(name);}
function webApp(name){
 const s=session;if(!valid(s))return false;
 const api=window.EducaWebReal;
 if(typeof api?.openGuidedApp!=='function')return false;
 api.openGuidedApp(name);
 const view=$('#webRealView');
 if(view)view.dataset.guidedFlowApp=name;
 return phone?.dataset.currentView==='webreal';
}
function appContent(){return $('#webRealBody');}
function addText(parent,tag,cls,value){const e=element(tag,cls,String(value||''));parent.append(e);return e;}
function safePreview(s){
 const activity=s.activity,route=s.route;
 return String(route.message||activity.instruction).slice(0,350);
}
function verifiedBox(title,description,action){
 const box=element('section','guided-real-verification');
 addText(box,'small','guided-real-eyebrow','CANAL CONHECIDO · AMBIENTE DE TREINO');
 addText(box,'h2','guided-real-heading',title);
 addText(box,'p','guided-real-copy',description);
 const done=button('guidedRealDone',action);
 box.append(done);
 return {box,done};
}
function verification(){
 const s=session;if(!valid(s))return;
 const r=s.route,activity=s.activity,app=r.verifyApp||r.app;
 // Bank and WhatsApp have their own established application screens.
 if(app==='bank'){
  appView('bank-home');
  const target=$('#bankHomeView .bank-round-btn');
  step(target,'Atendimento do banco','Agora confirme a informação no Banco Educa, sem usar o número recebido na mensagem.',()=>{
   showBankPanel('#bankHomeView .bank-content',r.verifyTitle,activity.learned,'Verificar atendimento',finish);
  },'Ajuda');
  return;
 }
 if(app==='whatsapp'){
  appView('whatsapp');
  const list=$('#whatsappView .wa-chat-list');
  const {box,done}=verifiedBox(r.verifyTitle,activity.learned,r.verifyAction);
  list?.prepend(box);
  step(done,'Encerre com segurança','Não faça depósitos para liberar ganhos. Saia do contato suspeito.',finish,r.verifyAction);
  return;
 }
 if(!webApp(app))return;
 const body=appContent();
 const {box,done}=verifiedBox(r.verifyTitle,activity.learned,r.verifyAction);
 const surface=element('div','guided-real-scene guided-real-verified');
 if(app==='chrome'){
  addText(surface,'div','guided-real-url','🔒 endereço oficial · consulta ilustrativa');
 }else if(app==='phone'){
  addText(surface,'div','guided-real-phone-top','Contatos salvos · demonstração');
 }else if(app==='gmail'){
  addText(surface,'div','guided-real-mail-top','Consultar por canal independente');
 }
 surface.append(box);
 body.replaceChildren(surface);
 step(done,'Confirme por um canal conhecido',activity.learned,finish,r.verifyAction);
}
function openWebDetail(){
 const s=session;if(!valid(s))return;
 const r=s.route,activity=s.activity,app=r.app,body=appContent();
 const surface=element('div','guided-real-scene guided-real-detail-card');
 if(app==='gmail'){
  addText(surface,'div','guided-real-mail-top','‹   Caixa de entrada · Mensagem fictícia');
  addText(surface,'h2','guided-real-heading',activity.title);
  addText(surface,'div','guided-real-sender',r.sender+' · remetente@exemplo.invalid');
 }else if(app==='messages'){
  addText(surface,'div','guided-real-sms-top',r.sender+' · SMS fictício');
 }else if(app==='chrome'){
  addText(surface,'div','guided-real-url','não-oficial.invalid · página simulada');
  addText(surface,'h2','guided-real-heading',r.sender);
 }else if(app==='phone'){
  addText(surface,'div','guided-real-phone-top','☎ Ligação de número desconhecido · treino');
  addText(surface,'h2','guided-real-heading',r.sender);
 }
 addText(surface,'p','guided-real-message',safePreview(s));
 const inspect=button('guidedRealInspect',app==='chrome'?'Conferir o endereço':app==='gmail'?'Conferir o remetente':app==='messages'?'Analisar a mensagem':'Analisar a ligação');
 surface.append(inspect);body.replaceChildren(surface);
 step(inspect,'Observe o sinal de alerta',activity.signals[0]+' Toque em '+inspect.textContent+'.',()=>{
  const flag=element('section','guided-real-flag');
  addText(flag,'strong','','Sinais de alerta');
  const list=element('ul');
  activity.signals.forEach(x=>addText(list,'li','',x));
  flag.append(list);
  const safe=button('guidedRealSafe',app==='phone'?'Desligar e verificar por outro canal':'Não seguir o pedido e verificar');
  flag.append(safe);
  inspect.replaceWith(flag);
  step(safe,'Não siga o pedido suspeito',activity.signals[1]+' Use um canal que você mesmo encontrou.',verification,'Verificar');
 },'Observar');
}
function startWeb(){
 const s=session;if(!valid(s))return false;
 const app=s.route.app;
 if(!webApp(app))return false;
 const body=appContent();
 // Native simulated Gmail and Messages already have working list UI; insert a
 // fictitious unread item into those existing screens.
 if(app==='gmail'){
  const list=$('.webx-mail-scroll',body);
  if(!list)return false;
  const row=element('div','webx-mail-row unread guided-real-inbox-row');
  const btn=button('guidedRealOpen','', 'webx-mail-message');
  btn.append(element('span','webx-mail-avatar',s.route.sender.slice(0,1)));
  const copy=element('span','webx-mail-copy');
  addText(copy,'strong','',s.route.sender);
  addText(copy,'b','',s.activity.title);
  addText(copy,'small','',safePreview(s));
  btn.append(copy,element('span','webx-mail-time','Agora'));row.append(btn);list.prepend(row);
  step(btn,'Novo e-mail de treino','Abra a mensagem destacada na caixa de entrada para conferir remetente e pedido.',openWebDetail,'Abrir e-mail');
  return true;
 }
 if(app==='messages'){
  const list=$('.webx-sms-list',body);
  if(!list)return false;
  const btn=button('guidedRealOpen','','guided-real-inbox-row');
  btn.append(element('span','webx-sms-avatar',s.route.sender.slice(0,1)));
  const copy=element('span');
  addText(copy,'strong','',s.route.sender);
  addText(copy,'small','',safePreview(s));
  btn.append(copy,element('time','','Agora'));list.prepend(btn);
  step(btn,'Novo SMS de treino','Toque no SMS destacado e observe os sinais de alerta antes de agir.',openWebDetail,'Abrir SMS');
  return true;
 }
 // The browser / phone UI remains inside the preexisting webreal app frame,
 // never in guidedPracticeView or the Modo Livre launcher.
 const scene=element('div','guided-real-scene guided-real-list');
 if(app==='chrome'){
  addText(scene,'div','guided-real-url','Navegador · nova página simulada');
  addText(scene,'h2','guided-real-heading','Resultado / anúncio suspeito');
 }else{
  addText(scene,'div','guided-real-phone-top','Telefone · chamada fictícia');
  addText(scene,'h2','guided-real-heading','Chamada recebida');
 }
 const btn=button('guidedRealOpen',s.route.sender+' — '+s.activity.title,'guided-real-entry');
 scene.append(btn);
 addText(scene,'p','guided-real-hint','Nenhum link, pagamento ou ligação real será iniciado.');
 body.replaceChildren(scene);
 step(btn,app==='chrome'?'Abra a página de exemplo':'Atenda à situação fictícia',
  'Leia com atenção o alerta destacado. Tudo acontece somente no celular de treino.',openWebDetail,app==='chrome'?'Abrir página':'Ver ligação');
 return true;
}
function showBankPanel(parentSelector,title,description,action,next){
 const parent=$(parentSelector);if(!parent)return;
 $$('.guided-native-panel').forEach(n=>n.remove());
 const {box,done}=verifiedBox(title,description,action);
 box.classList.add('guided-native-panel');
 parent.append(box);
 step(done,title,description,next,action);
}
function bankDetail(){
 const s=session;if(!valid(s))return;
 const r=s.route,activity=s.activity,kind=r.bankStep;
 const parent=kind==='qr'?'#bankPixView .bank-content':kind==='extrato'?'#bankExtractView .bank-content':'#bankHomeView .bank-content';
 const host=$(parent);if(!host)return;
 phone.dataset.guidedBankDetail=kind;
 const panel=element('section','guided-native-panel guided-real-bank-detail');
 addText(panel,'small','guided-real-eyebrow','BANCO EDUCA · DADOS FICTÍCIOS');
 addText(panel,'h2','guided-real-heading',r.verifyTitle);
 addText(panel,'p','guided-real-copy',r.message);
 const inspect=button('guidedRealInspect','Conferir dados e recebedor');
 panel.append(inspect);host.append(panel);
 step(inspect,'Confira as informações',activity.signals[0]+' Abra os detalhes antes de qualquer pagamento.',()=>{
  inspect.remove();
  const flag=element('section','guided-real-flag');
  addText(flag,'strong','','O que você deve observar');
  activity.signals.forEach(x=>addText(flag,'p','',x));
  const safe=button('guidedRealSafe',r.verifyAction);
  flag.append(safe);panel.append(flag);
  step(safe,'Pratique uma ação segura',activity.signals[1]+' Toque na orientação protegida.',finish,r.verifyAction);
 },'Conferir');
}
function startBank(){
 const s=session;if(!valid(s))return false;
 const r=s.route,kind=r.bankStep;
 appView('bank-home');
 const target=kind==='extrato'?'#bankExtractBtn':kind==='pagar'?'#bankHomeView .bank-shortcuts button:nth-child(2)':kind==='cartao'?'#bankHomeView .bank-shortcuts button:nth-child(4)':kind==='ajuda'?'#bankHomeView .bank-round-btn':'#bankPixBtn';
 step(target,'Encontre a função do banco','Toque na opção destacada dentro do Banco Educa. Não há dinheiro ou conta real.',()=>{
  if(kind==='extrato')appView('bank-extract');
  if(kind==='qr'){
   appView('bank-pix');
   step('#bankPixView .bank-action-grid button:first-child','Veja o QR code','Toque em Ler QR Code para conferir o recebedor no banco.',bankDetail,'QR Code');
  }else bankDetail();
 },kind==='extrato'?'Extrato':kind==='pagar'?'Pagar':kind==='cartao'?'Cartão':kind==='ajuda'?'Ajuda':'Pix');
 return true;
}
function startGov(){
 const s=session;if(!valid(s))return false;
 appView('govbr-home');
 const r=s.route;
 if(r.govStep==='proof'){
  step('#govSearchBox','Encontre serviços','No GOV.BR de treino, abra os serviços sem seguir o link suspeito.',()=>{
   appView('govbr-services');
   step('#govProofRow','Localize prova de vida','Encontre Prova de vida na lista dos serviços.',()=>{
    appView('govbr-proof');
    step('#govProofFoundBtn','Confirme no aplicativo','Leia como localizar o serviço e conclua com segurança.',finish,'Concluir');
   },'Prova de vida');
  },'Serviços');
 }else{
  step('#govProfileNav','Abra o menu','Toque em Menu, dentro do aplicativo GOV.BR simulado.',()=>{
   appView('govbr-menu');
   step('#govSecurityMenuRow','Segurança da conta','Entre na área Segurança da conta.',()=>{
    appView('govbr-security');
    step('#govTwoFactorRow','Verificação em duas etapas','Localize a proteção adicional da conta.',()=>{
     appView('govbr-security-2fa');
     step('#gov2faLearnBtn','Conclua a prática','Nunca compartilhe códigos de acesso. Finalize o treino.',finish,'Concluir');
    },'Duas etapas');
   },'Segurança');
  },'Menu');
 }
 return true;
}
function startWhats(){
 const s=session;if(!valid(s))return false;
 appView('whatsapp');
 const list=$('#whatsappView .wa-chat-list');if(!list)return false;
 const row=button('guidedRealOpen','','chat-row guided-native-row');
 row.append(element('span','avatar blue',s.route.sender.slice(0,1)));
 const copy=element('span','chat-copy');
 addText(copy,'strong','',s.route.sender);addText(copy,'small','',safePreview(s));
 const meta=element('span','chat-meta');meta.append(element('small','','Agora'),element('b','','1'));
 row.append(copy,meta);list.prepend(row);
 step(row,'Mensagem recebida no WhatsApp','Abra a conversa destacada para analisar uma situação fictícia.',()=>{
  $('#scenarioTitle').textContent=s.route.sender;
  $('#scenarioSubtitle').textContent='Conversa fictícia';
  $('#scenarioAvatar').textContent=s.route.sender.slice(0,1);
  $('#scenarioAvatar').className='avatar blue small';
  const wallpaper=$('#chatWallpaper');
  const day=element('span','chat-day','Hoje · SIMULAÇÃO');
  const bubble=element('div','message incoming',safePreview(s));
  const note=element('small','guided-real-chat-disclaimer','Mensagem fictícia para aprender a reconhecer riscos');
  const inspect=button('guidedRealInspect','Analisar a mensagem','guided-real-chat-inspect');
  wallpaper.replaceChildren(day,bubble,note,inspect);
  $('#decisionOptions').replaceChildren();
  const feedback=$('#scenarioAnswerFeedback');if(feedback)feedback.hidden=true;
  appView('chat');
  step(inspect,'Observe a conversa',s.activity.signals[0]+' Toque em Analisar a mensagem.',()=>{
   inspect.remove();
   const flag=element('div','security-note guided-real-flag');
   addText(flag,'strong','','Atenção aos sinais');
   s.activity.signals.forEach(x=>addText(flag,'p','',x));
   wallpaper.append(flag);
   const action=button('guidedRealSafe',s.route.verifyAction,'guided-real-chat-inspect');
   $('#decisionOptions').append(action);
   step(action,'Faça a verificação adequada',s.activity.signals[1]+' Escolha a ação destacada para proteger seus dados.',verification,'Ação segura');
  },'Analisar');
 },'Abrir');
 return true;
}
function startSettings(){
 const s=session;if(!valid(s))return false;
 appView('settings-main');
 const group=$('#settingsMainView .pixel-settings-group');if(!group)return false;
 const row=button('guidedRealOpen','','settings-row guided-native-row');
 row.append(element('span','settings-row-icon blue','⚙'));
 const copy=element('span');
 addText(copy,'strong','','Segurança do aparelho');
 addText(copy,'small','','Bloqueio e proteção de contas');
 row.append(copy,element('b','','›'));group.prepend(row);
 step(row,'Encontre a proteção do aparelho','Toque em Segurança do aparelho para ver o que fazer em caso de perda.',()=>{
  const panel=element('section','guided-native-panel guided-real-settings-detail');
  addText(panel,'small','guided-real-eyebrow','AJUSTES · SIMULAÇÃO');
  addText(panel,'h2','guided-real-heading',s.route.verifyTitle);
  addText(panel,'p','guided-real-copy',s.activity.instruction);
  const inspect=button('guidedRealInspect','Revisar contas conectadas');
  panel.append(inspect);group.prepend(panel);
  step(inspect,'Revise os acessos',s.activity.signals[0],()=>{
   inspect.remove();const done=button('guidedRealDone',s.route.verifyAction);panel.append(done);
   step(done,'Proteja suas contas',s.activity.learned,finish,'Concluir');
  },'Revisar');
 },'Segurança');
 return true;
}
function start(code,activity,bridge){
 const route=window.EducaGuidedAppRoutes?.[code];
 if(!route||!activity?.signals||!bridge||window.EducaFreeMode?.isActive?.())return false;
 stop();
 session={code,route,activity,bridge,counter:0,controller:new AbortController()};
 phone.dataset.guidedAppLesson=code;
 const runners={bank:startBank,govbr:startGov,whatsapp:startWhats,settings:startSettings};
 const ok=(runners[route.app]||startWeb)();
 if(!ok){stop();return false;}
 return true;
}
document.addEventListener('click',e=>{
 if(!session||!e.target.closest('#webRealBack'))return;
 e.preventDefault();e.stopImmediatePropagation();
 session.bridge.back();
},true);
for(const event of ['educa:system-back','educa:system-home']){
 window.addEventListener(event,e=>{
  if(!session)return;
  e.stopImmediatePropagation();
  e.preventDefault();
  session.bridge.back();
 },true);
}
window.EducaGuidedAppFlow=Object.freeze({start,stop,isActive:()=>!!session,routeCount:()=>Object.keys(window.EducaGuidedAppRoutes||{}).length});
})();