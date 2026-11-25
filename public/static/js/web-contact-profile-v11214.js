/* Educa+ Digital V112.14 — perfil e mídia FICTÍCIOS, exclusivamente Web.
   Não telefona, não acessa contatos ou fotos reais, não faz Pix. */
(()=>{
'use strict';
if(document.documentElement.dataset.educaPlatform!=='web')return;
const $=(s,root=document)=>root.querySelector(s);
const chat=$('#chatView'),surface=$('#chatView .chat-surface');
if(!chat||!surface)return;
const PHOTO='/static/img/free-family-photo-v11214.webp';
const FALLBACK='/static/img/free-family-photo-v11212.jpg';
const contact=()=>window.EducaFreeMode?.currentContact?.();
const webScenario=()=>window.EducaFreeMode?.isActive?.()&&!!contact()&&$('#phoneScreen')?.dataset.currentView==='chat';
let current='profile',previous='profile',mute=false,favorite=false,theme='light',temp='Desativadas',focusBefore=null;
const overlay=document.createElement('section');overlay.id='freeContactProfileLayer';overlay.className='fc-layer';overlay.hidden=true;
overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Dados do contato fictício');
overlay.innerHTML=[
'<header class="fc-nav"><button type="button" data-fc="back" aria-label="Voltar">‹</button><strong id="fcTitle">Dados do contato</strong><small>SIMULAÇÃO</small></header>',
'<div class="fc-scroll">',
'<section class="fc-pane" data-pane="profile">',
'<button class="fc-big-avatar" type="button" data-fc="photo" aria-label="Ampliar foto do contato"></button>',
'<h2 data-fc-name>Contato de treino</h2><p class="fc-number">Número fictício</p><span class="fc-unsaved">Contato do ambiente de treinamento</span>',
'<nav class="fc-shortcuts" aria-label="Ações do contato">',
'<button data-fc="call" type="button"><b>☎</b>Ligar</button><button data-fc="video" type="button"><b>▣</b>Vídeo</button>',
'<button data-fc="pix" type="button"><b>◇</b>Pix</button><button data-fc="search" type="button"><b>⌕</b>Pesquisar</button></nav>',
'<div class="fc-group"><button type="button" data-fc="media">▧ <span>Mídia, links e docs</span><small id="fcMediaCount">Nenhuma foto</small><b>›</b></button>',
'<button type="button" data-fc="storage">▤ <span>Liberar espaço de armazenamento</span><small id="fcStorageCount">0 KB</small><b>›</b></button>',
'<button type="button" data-fc="favorite">☆ <span>Favoritos</span><small id="fcFavorite">Nenhuma</small><b>›</b></button></div>',
'<div class="fc-group"><button type="button" data-fc="mute">♧ <span>Notificações</span><small id="fcMuted">Ativadas</small><b>›</b></button>',
'<button type="button" data-fc="theme">◐ <span>Tema da conversa</span><small id="fcTheme">Claro</small><b>›</b></button>',
'<button type="button" data-fc="save">⇩ <span>Salvar no Fotos</span><small>Somente demonstração</small><b>›</b></button>',
'<button type="button" data-fc="temporary">◷ <span>Mensagens temporárias</span><small id="fcTemporary">Desativadas</small><b>›</b></button>',
'<button type="button" data-fc="transcribe">☷ <span>Idioma de transcrição</span><small>Português (Brasil)</small><b>›</b></button>',
'<button type="button" data-fc="lock">♙ <span>Trancar conversa</span><small>Não ativado</small><b>›</b></button>',
'<button type="button" data-fc="restricted">◇ <span>Conversa restrita</span><small>Desativada</small><b>›</b></button>',
'<button type="button" data-fc="encryption">♧ <span>Criptografia</span><small>Informações</small><b>›</b></button></div>',
'<div class="fc-group"><button type="button" data-fc="group">♧ <span>Grupos em comum</span><small>Nenhum</small><b>›</b></button>',
'<button type="button" data-fc="share">↗ <span>Compartilhar contato</span><small>Simulado</small><b>›</b></button>',
'<button type="button" data-fc="verify">✓ <span>Conferir por outro canal</span><b>›</b></button>',
'<button class="fc-danger" type="button" data-fc="block">⊘ <span>Bloquear contato</span><b>›</b></button>',
'<button class="fc-danger" type="button" data-fc="report">! <span>Denunciar contato</span><b>›</b></button></div>',
'<p class="fc-hint">Este contato, número e foto são fictícios. Uma foto de perfil não comprova identidade.</p>',
'</section>',
'<section class="fc-pane" data-pane="photo" hidden><div class="fc-photo-view"><div id="fcFullPhoto"></div><p>Imagem sintética · ambiente de treinamento</p></div></section>',
'<section class="fc-pane" data-pane="outgoing" hidden><div class="fc-outgoing-image" id="fcOutgoingPhoto"></div><h2 data-fc-name>Contato de treino</h2>',
'<p class="fc-outgoing-status" id="fcOutgoingStatus">Chamada simulada</p>',
'<p class="fc-hint">Contato fictício: ver o rosto ou ouvir a voz não comprova identidade.</p>',
'<button class="fc-hangup" type="button" data-fc="back">Encerrar chamada</button></section>',
'<section class="fc-pane" data-pane="media" hidden><h2>Mídia, links e docs</h2><p class="fc-hint" id="fcMediaHint">Nenhuma foto recebida</p>',
'<button type="button" data-fc="photo" id="fcMediaPhoto" aria-label="Abrir foto em tamanho grande"></button>',
'<p class="fc-hint">Nenhum link ou documento recebido.</p></section>',
'<section class="fc-pane" data-pane="search" hidden><label for="fcSearch">Pesquisar na conversa</label>',
'<input id="fcSearch" type="search" maxlength="60" autocomplete="off" placeholder="Pesquisar mensagem...">',
'<p id="fcSearchCount" class="fc-hint" aria-live="polite">Digite uma palavra.</p><div id="fcResults" class="fc-search-results"></div></section>',
'<section class="fc-pane" data-pane="theme" hidden><h2>Tema da conversa</h2><div class="fc-group">',
'<button type="button" data-fc="theme-light"><span>Claro</span></button>',
'<button type="button" data-fc="theme-dark"><span>Escuro</span></button></div></section>',
'<section class="fc-pane" data-pane="temporary" hidden><h2>Mensagens temporárias</h2>',
'<p class="fc-hint">Ajuste demonstrativo: não apaga mensagens ou dados reais.</p><div class="fc-group">',
'<button type="button" data-fc="temp-off"><span>Desativadas</span></button>',
'<button type="button" data-fc="temp-day"><span>24 horas · simulação</span></button>',
'<button type="button" data-fc="temp-week"><span>7 dias · simulação</span></button></div></section>',
'</div><p class="fc-status" id="fcStatus" role="status" aria-live="polite" hidden></p>'
].join('');
const menu=document.createElement('div');menu.id='freeContactMoreMenu';menu.className='fc-menu';menu.hidden=true;menu.setAttribute('role','menu');
menu.innerHTML=[
'<button type="button" data-fc="profile">Ver contato</button><button type="button" data-fc="media">Mídia, links e docs</button>',
'<button type="button" data-fc="search">Pesquisar</button><button type="button" data-fc="mute">Silenciar notificações</button>',
'<button type="button" data-fc="theme">Tema da conversa</button>',
'<button type="button" data-fc="block">Bloquear contato</button><button type="button" data-fc="report">Denunciar contato</button>'
].join('');
surface.append(overlay,menu);
function img(cls){
 const el=document.createElement('img');el.className=cls;el.alt='Retrato sintético de Rafael, personagem fictício, sorrindo em um carro';
 el.src=PHOTO;el.onerror=()=>{el.onerror=null;el.src=FALLBACK;};return el;
}
// Apenas a foto fictícia que já pertence à atividade pode ser exibida.
let displayedContact='';
const settings=new Map();
function refreshContact(){
 const c=contact();if(!c)return;
 if(displayedContact!==c.id){
  if(displayedContact)settings.set(displayedContact,{mute,favorite,theme,temp});
  ({mute=false,favorite=false,theme='light',temp='Desativadas'}=settings.get(c.id)||{});
  displayedContact=c.id;chat.classList.toggle('fc-dark-chat',theme==='dark');
  for(const name of overlay.querySelectorAll('[data-fc-name]'))name.textContent=c.name;
  const hasPhoto=c.id==='family-photo'&&c.photo===true;
  const containers=[['.fc-big-avatar','fc-portrait'],['#fcFullPhoto','fc-full-image'],['#fcMediaPhoto','fc-thumb-image'],['#fcOutgoingPhoto','fc-outgoing-avatar']];
  for(const [selector,cls] of containers){
   const el=$(selector,overlay);el.replaceChildren();
   if(hasPhoto)el.append(img(cls));else el.textContent=c.icon||'?';
  }
  $('.fc-big-avatar',overlay).disabled=!hasPhoto;
  $('.fc-big-avatar',overlay).setAttribute('aria-label',hasPhoto?'Ampliar foto do contato':'Avatar fictício do contato');
  $('#fcMediaPhoto',overlay).hidden=!hasPhoto;
  $('#fcMediaCount',overlay).textContent=hasPhoto?'1 foto':'Nenhuma foto';
  $('#fcStorageCount',overlay).textContent=hasPhoto?'Imagem de treino':'0 KB';
  $('#fcMediaHint',overlay).textContent=hasPhoto?'1 foto recebida':'Nenhuma foto recebida';
  for(const el of [...overlay.querySelectorAll('[data-fc="verify"],[data-fc="block"],[data-fc="report"]'),...menu.querySelectorAll('[data-fc="block"],[data-fc="report"]')])el.hidden=c.normal===true;
 }
}
function showPane(which){
 current=which;
 for(const p of overlay.querySelectorAll('[data-pane]'))p.hidden=p.dataset.pane!==which;
 const names={profile:'Dados do contato',photo:'Foto recebida',media:'Mídia, links e docs',search:'Pesquisar mensagens',theme:'Tema da conversa',temporary:'Mensagens temporárias',outgoing:'Chamada fictícia'};
 $('#fcTitle',overlay).textContent=names[which]||'Dados do contato';
 $('#fcFavorite',overlay).textContent=favorite?'Adicionado':'Nenhuma';
 $('#fcMuted',overlay).textContent=mute?'Silenciadas':'Ativadas';
 $('#fcTheme',overlay).textContent=theme==='dark'?'Escuro':'Claro';
 $('#fcTemporary',overlay).textContent=temp;
 $('#fcStatus',overlay).hidden=true;overlay.scrollTop=0;
 if(which==='search')search();
}
function open(which='profile'){
 if(!webScenario())return;
 refreshContact();
 focusBefore=document.activeElement;previous=current;overlay.hidden=false;menu.hidden=true;showPane(which);
 (which==='search'?$('#fcSearch',overlay):$('[data-fc="back"]',overlay))?.focus({preventScroll:true});
}
function close(){
 overlay.hidden=true;menu.hidden=true;
 focusBefore?.focus?.({preventScroll:true});focusBefore=null;
}
function back(){
 if(current==='photo'){showPane(previous==='media'?'media':'profile');return;}
 if(current!=='profile'){showPane('profile');return;}
 close();
}
function announce(message){const el=$('#fcStatus',overlay);el.textContent=message;el.hidden=false;}
function search(){
 const q=String($('#fcSearch',overlay).value||'').trim().toLocaleLowerCase('pt-BR');
 const results=$('#fcResults',overlay);results.replaceChildren();
 if(!q){$('#fcSearchCount',overlay).textContent='Digite uma palavra.';return;}
 const messages=[...$('#chatWallpaper').querySelectorAll('.message:not(.free-training-photo)')];let found=0;
 for(let i=0;i<messages.length;i++){
  const text=messages[i].textContent||'';if(!text.toLocaleLowerCase('pt-BR').includes(q))continue;
  const button=document.createElement('button');button.type='button';button.dataset.fc='result';button.dataset.index=String(i);
  button.textContent=text.slice(0,180);results.append(button);found++;
 }
 $('#fcSearchCount',overlay).textContent=found+' '+(found===1?'mensagem encontrada':'mensagens encontradas');
}
function action(name,node){
 if(!webScenario())return;
 refreshContact();
 if(name==='photo'&&contact()?.photo!==true)return;
 if(name==='back'){back();return;}
 if(['profile','photo','media','search','theme','temporary'].includes(name)){
  previous=current;if(overlay.hidden)open(name);else showPane(name);return;
 }
 if(name==='favorite'){favorite=!favorite;showPane('profile');announce(favorite?'Contato favoritado nesta simulação.':'Contato retirado dos favoritos da simulação.');return;}
 if(name==='mute'){mute=!mute;showPane('profile');announce(mute?'Notificações silenciadas nesta simulação.':'Notificações ativadas nesta simulação.');return;}
 if(name==='theme-light'||name==='theme-dark'){
  theme=name==='theme-dark'?'dark':'light';chat.classList.toggle('fc-dark-chat',theme==='dark');
  showPane('profile');announce('Tema '+(theme==='dark'?'escuro':'claro')+' aplicado ao chat simulado.');return;
 }
 if(name.startsWith('temp-')){
  temp=name==='temp-off'?'Desativadas':name==='temp-day'?'24 horas':'7 dias';
  showPane('profile');announce('Configuração simulada: '+temp+'. Nenhuma mensagem real será apagada.');return;
 }
 if(name==='pix'){announce('Este Pix é apenas fictício. Confirme a identidade por outro canal antes de enviar dinheiro.');return;}
 const demonstrations={
  storage:contact()?.photo?'A foto desta atividade é fictícia. Nenhum arquivo do seu celular será apagado.':'Não há mídia nesta conversa de treino. Nenhum arquivo real será apagado.',
  save:'Demonstração: nenhuma imagem será salva na galeria real.',
  transcribe:'Idioma ilustrativo: português (Brasil). Nenhum áudio real será transcrito.',
  lock:'Trancar conversa é apenas ilustrado; não altera o WhatsApp verdadeiro.',
  restricted:'A conversa restrita está desativada nesta simulação.',
  encryption:'Esta conversa é do Educa+ Digital, não do WhatsApp real. Não representa criptografia de ponta a ponta entre pessoas.',
  group:'Nenhum grupo real é consultado. Não acessamos seus contatos.',
  share:'Compartilhar o contato é somente demonstrativo; nenhum telefone real é enviado.'
 };
 if(Object.hasOwn(demonstrations,name)){announce(demonstrations[name]);return;}
 if(name==='call'||name==='video'){
  if(overlay.hidden)open('outgoing');else showPane('outgoing');
  $('#fcTitle',overlay).textContent=name==='call'?'Ligação fictícia':'Videochamada fictícia';
  $('#fcOutgoingStatus',overlay).textContent=name==='call'
   ?'Chamando o contato fictício... Esta ligação não se conecta.'
   :'Videochamada de treinamento: nenhum contato verdadeiro será chamado.';
  return;
 }
 if(name==='verify'){close();$('#freeFamilyVerify')?.click();return;}
 if(name==='block'){close();$('#freeFamilyBlock')?.click();return;}
 if(name==='report'){close();window.EducaFreeMode?.reportContact?.();return;}
 if(name==='result'){
  const index=Number(node?.dataset.index);
  const messages=[...$('#chatWallpaper').querySelectorAll('.message:not(.free-training-photo)')];
  if(!Number.isInteger(index)||!messages[index])return;
  close();messages[index].scrollIntoView({block:'center',behavior:'smooth'});
  messages[index].classList.add('fc-highlight');
  setTimeout(()=>messages[index]?.classList.remove('fc-highlight'),1400);
 }
}
overlay.addEventListener('click',e=>{const btn=e.target.closest('[data-fc]');if(btn){e.preventDefault();action(btn.dataset.fc,btn);}});
menu.addEventListener('click',e=>{const btn=e.target.closest('[data-fc]');if(btn){e.preventDefault();menu.hidden=true;action(btn.dataset.fc,btn);}});
$('#fcSearch',overlay).addEventListener('input',search);
function decorate(){
 if(!webScenario())return;
 const c=contact();refreshContact();
 const avatar=$('#scenarioAvatar');if(avatar){
  avatar.textContent=c.photo?'':c.icon;avatar.classList.add('fc-avatar-trigger');
  avatar.style.backgroundImage=c.photo?"url('"+PHOTO+"')":'';avatar.setAttribute('role','button');avatar.tabIndex=0;
  avatar.setAttribute('aria-label','Ver perfil do contato fictício');
 }
 const label=$('#scenarioTitle')?.parentElement;
 if(label){label.classList.add('fc-title-trigger');label.tabIndex=0;label.setAttribute('role','button');label.setAttribute('aria-label','Ver dados do contato');}
 const listAvatar=$('#whatsappView [data-free-scenario="family-photo"] .wa-avatar');
 if(c.photo&&listAvatar){listAvatar.textContent='';listAvatar.classList.add('fc-list-avatar');listAvatar.style.backgroundImage="url('"+PHOTO+"')";}
}
function clear(){
 const avatar=$('#scenarioAvatar');
 if(avatar?.classList.contains('fc-avatar-trigger')){
  avatar.classList.remove('fc-avatar-trigger');avatar.style.backgroundImage='';
  avatar.removeAttribute('role');avatar.removeAttribute('tabindex');avatar.removeAttribute('aria-label');
 }
 const label=$('.fc-title-trigger');
 if(label){label.classList.remove('fc-title-trigger');label.removeAttribute('role');label.removeAttribute('tabindex');label.removeAttribute('aria-label');}
 menu.hidden=true;if(!overlay.hidden)close();
}
document.addEventListener('click',e=>{
 if(!webScenario()){clear();return;}
 const more=e.target.closest('#chatView .chat-header-actions button[aria-label="Menu"]');
 if(more){e.preventDefault();e.stopImmediatePropagation();decorate();menu.hidden=!menu.hidden;return;}
 const photo=e.target.closest('#chatWallpaper .free-training-photo img');
 if(photo){e.preventDefault();e.stopImmediatePropagation();open('photo');return;}
 const target=e.target.closest('#scenarioAvatar,#scenarioTitle,#scenarioSubtitle,.fc-title-trigger');
 if(target&&target.closest('#chatView .chat-header')){
  e.preventDefault();e.stopImmediatePropagation();open('profile');return;
 }
 if(!menu.hidden&&!e.target.closest('#freeContactMoreMenu'))menu.hidden=true;
},true);
document.addEventListener('keydown',e=>{
 if(!webScenario())return;
 if(e.key==='Escape'){
  if(!menu.hidden){menu.hidden=true;e.stopPropagation();return;}
  if(!overlay.hidden){e.preventDefault();e.stopImmediatePropagation();back();}
  return;
 }
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('#scenarioAvatar,.fc-title-trigger,#chatWallpaper .free-training-photo img')){
  e.preventDefault();open(e.target.matches('img')?'photo':'profile');
 }
},true);
const phone=$('#phoneScreen');
if(phone)new MutationObserver(()=>{if(webScenario())decorate();else clear();}).observe(phone,{attributes:true,attributeFilter:['data-current-view']});
new MutationObserver(()=>{if(webScenario())decorate();}).observe($('#whatsappView'),{childList:true,subtree:true});
window.EducaWebContactProfile=Object.freeze({isOpen:()=>!overlay.hidden,refresh:()=>{if(webScenario()){close();decorate();}else clear();},open:()=>open('profile'),openCall:type=>action(type==='video'?'video':'call')});
})();