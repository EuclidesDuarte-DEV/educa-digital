/* Educa+ Digital V112.16 — interfaces Web educativas: Fotos, Gmail e Mensagens.
   Inspiradas nos fluxos demonstrados; nao sao clientes Apple/Google reais.
   Fotos: somente arquivos adicionados voluntariamente, mantidos no IndexedDB local.
   Gmail e SMS: mensagens 100% ficticias, nunca acessam contas/caixas de entrada. */
(()=>{
'use strict';
if(document.documentElement.dataset.educaPlatform!=='web')return;
const body=document.querySelector('#webRealBody');
const view=document.querySelector('#webRealView');
if(!body||!view)return;
const $=(q,root=body)=>root.querySelector(q);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=date=>new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(date));
const month=date=>new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(date));
const demo=[
 {id:1,folder:'inbox',sender:'Equipe do treinamento',subject:'Bem-vindo ao Gmail simulado',preview:'Aprenda a reconhecer remetentes e mensagens suspeitas.',time:'10:22',body:'Esta caixa de entrada é fictícia. Nenhuma mensagem da sua conta real é exibida.',color:'#9f46b9',star:false,unread:true},
 {id:2,folder:'inbox',sender:'Banco de exemplo',subject:'Atenção: confirme o remetente',preview:'Cuidado com links de atualização e pedidos de senha.',time:'Ontem',body:'Se alguém pedir sua senha ou um código por e-mail, não compartilhe. Procure o canal oficial.',color:'#3366a9',star:true,unread:true},
 {id:3,folder:'inbox',sender:'Aula Educa+',subject:'Dicas de proteção digital',preview:'Confira o endereço, os anexos e a origem de cada mensagem.',time:'Seg.',body:'No treinamento, você pode abrir, marcar e pesquisar estas mensagens fictícias.',color:'#138b73',star:false,unread:false},
 {id:4,folder:'promotions',sender:'Loja ilustrativa',subject:'Oferta especial de treinamento',preview:'Aprenda a identificar falsas promoções.',time:'Dom.',body:'Ofertas boas demais para ser verdade podem ser golpes. Confira o site oficial.',color:'#dc722b',star:false,unread:false},
 {id:5,folder:'spam',sender:'Remetente desconhecido',subject:'Prêmio urgente! Atenção',preview:'Não clique em links desconhecidos.',time:'Sab.',body:'Esta mensagem exemplifica uma tentativa de golpe. Nunca forneça dados ou Pix.',color:'#bb3a53',star:false,unread:true},
 {id:6,folder:'sent',sender:'Atividade de exemplo',subject:'Mensagem de treinamento',preview:'Mensagem enviada apenas na demonstração.',time:'Sex.',body:'Nenhum e-mail verdadeiro foi enviado pelo Educa+ Digital.',color:'#4f77be',star:false,unread:false}
];
const folders=[
 ['inbox','Caixa de entrada','▣'],['starred','Com estrela','☆'],['all','Todos os e-mails','▤'],
 ['sent','Enviados','➤'],['drafts','Rascunhos','▤'],['promotions','Promoções','◇'],
 ['spam','Spam','!'],['trash','Lixeira','♜']
];
const smsData=[
 {id:1,name:'Banco de treinamento',initial:'B',color:'#306ad4',time:'Hoje',preview:'Nunca informe códigos recebidos por SMS.',body:['Olá! Esta mensagem faz parte do Educa+ Digital.','Nunca compartilhe senhas ou códigos por mensagem.']},
 {id:2,name:'Contato desconhecido',initial:'?',color:'#8655a6',time:'Ontem',preview:'Você recebeu um link suspeito?',body:['Seu cadastro será bloqueado. Acesse o link agora!','Mensagem fictícia: links inesperados devem ser verificados.']},
 {id:3,name:'Família fictícia',initial:'F',color:'#1b9571',time:'Dom.',preview:'Me chama quando puder.',body:['Olá! Essa é apenas uma conversa de treinamento.']}
];
let active='',api=null,photos=[],tab='library',period='all',chosen=new Set(),photoOpen=null,
    galleryUrls=[],term='',folder='inbox',gmailSearch='',gmailView='list',messageOpen=null,side=false,
    mail=demo.map(m=>({...m})),draft=null,smsOpen=null,smsSearch='';
function revoke(){for(const u of galleryUrls)URL.revokeObjectURL(u);galleryUrls=[];}
function close(){revoke();active='';api=null;photoOpen=null;chosen.clear();body.classList.remove('webx-selecting');view.classList.remove('webx-active','webx-photos','webx-gmail','webx-messages');}
function host(name,html){body.innerHTML='<div class="webx-app webx-'+name+'">'+html+'</div>';}
function imageUrl(blob){const url=URL.createObjectURL(blob);galleryUrls.push(url);return url;}
function galleryHeader(){
 return '<div class="webx-photos-head"><div class="webx-photos-heading"><div><strong>Fototeca</strong><small>Imagens deste navegador · simulação</small></div><button data-webx="photo-select" type="button" aria-pressed="'+String(body.classList.contains('webx-selecting'))+'">'+(body.classList.contains('webx-selecting')?'Cancelar':'Selecionar')+'</button></div>'+
 '<div class="webx-photos-period" role="group" aria-label="Período"><button data-webx="period" data-value="years" aria-pressed="'+(period==='years')+'">Anos</button><button data-webx="period" data-value="months" aria-pressed="'+(period==='months')+'">Meses</button><button data-webx="period" data-value="all" aria-pressed="'+(period==='all')+'">Tudo</button></div></div>';
}
function galleryFooter(){
 return '<nav class="webx-photos-tabs" aria-label="Navegação de Fotos"><button data-webx="photo-tab" data-value="library" aria-current="'+(tab==='library'?'page':'false')+'">▦<small>Fototeca</small></button><button data-webx="photo-tab" data-value="collections" aria-current="'+(tab==='collections'?'page':'false')+'">▣<small>Coleções</small></button><button data-webx="photo-tab" data-value="search" aria-current="'+(tab==='search'?'page':'false')+'">⌕<small>Buscar</small></button></nav>';
}
function photoActions(){
 return '<div class="webx-photo-topactions"><label class="webx-upload">＋ Adicionar fotos<input id="webRealUpload" type="file" accept="image/*" multiple aria-label="Escolher fotos do aparelho"></label><button data-webx="camera" type="button">▣ Câmera</button></div>';
}
function albumEmpty(){
 return '<div class="webx-photo-empty"><span aria-hidden="true">▧</span><strong>Nenhuma foto adicionada</strong><p>Toque em “Adicionar fotos” para escolher imagens. O Educa+ não lê sua galeria automaticamente.</p></div>'+
 '<div class="webx-photo-examples"><strong>Como funciona a Fototeca</strong><div class="webx-example-tiles"><i>🌿</i><i>🌅</i><i>🏙️</i><i>🌊</i></div><small>Ilustrações de exemplo — não são suas fotos.</small></div>';
}
async function syncPhotos(){
 if(active!=='photos'||!api)return;
 try{const list=await api.readPhotos();if(active!=='photos')return;photos=list.sort((a,b)=>b.created-a.created);renderPhotos();}
 catch(e){showStatus('A galeria local está indisponível: '+String(e.message),true);}
}
function renderPhotos(){
 if(active!=='photos')return;
 revoke();
 if(photoOpen!==null){
  const item=photos.find(x=>x.id===photoOpen);
  if(item){
   host('photos','<div class="webx-photo-view"><header><button data-webx="photo-back" aria-label="Voltar à fototeca">‹</button><strong>Foto adicionada</strong><button data-webx="photo-download" data-id="'+item.id+'">Baixar</button></header><div class="webx-photo-stage"><img src="'+imageUrl(item.blob)+'" alt="Foto selecionada pelo participante"></div><footer><span>'+esc(fmt(item.created))+'</span><button data-webx="photo-delete" data-id="'+item.id+'">Apagar</button></footer></div>');return;
  }
  photoOpen=null;
 }
 let items=photos;
 if(tab==='search'){
  const k=term.trim().toLocaleLowerCase('pt-BR');
  if(k)items=photos.filter(p=>(fmt(p.created)+' '+month(p.created)).toLocaleLowerCase('pt-BR').includes(k));
 }
 let tiles='';
 if(tab==='collections'){
  tiles='<div class="webx-collection-card"><span>▧</span><strong>Fotos adicionadas</strong><small>'+photos.length+' imagem(ns)</small></div>';
 }
 if(tab==='search')tiles+='<label class="webx-photo-search">⌕<input id="webxPhotoSearch" type="search" value="'+esc(term)+'" placeholder="Buscar por mês ou ano" aria-label="Buscar fotos por período"></label>';
 if(!items.length)tiles+=photos.length?'<p class="webx-search-empty">Nenhuma foto corresponde à pesquisa.</p>':albumEmpty();
 else{
  const groups=new Map();
  for(const p of items){
   const key=period==='years'?new Date(p.created).getFullYear().toString():
    period==='months'?month(p.created):fmt(p.created);
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(p);
  }
  for(const [key,rows] of groups){
   tiles+='<section class="webx-photo-group"><h3>'+esc(key)+'</h3><div class="webx-photo-grid">';
   for(const p of rows)tiles+='<button type="button" data-webx="photo-open" data-id="'+p.id+'" class="'+(chosen.has(p.id)?'selected':'')+'" aria-label="Abrir foto adicionada em '+esc(fmt(p.created))+'"><img src="'+imageUrl(p.blob)+'" loading="lazy" alt="Foto adicionada pelo participante">'+(chosen.has(p.id)?'<em>✓</em>':'')+'</button>';
   tiles+='</div></section>';
  }
 }
 host('photos',galleryHeader()+photoActions()+'<main class="webx-photos-scroll">'+tiles+'</main>'+
  (chosen.size?'<div class="webx-selection-bar">'+chosen.size+' selecionada(s)<button type="button" data-webx="photo-delete-selected">Apagar selecionadas</button></div>':'')+
  galleryFooter());
}
function gmailFolder(m){
 if(folder==='starred')return m.star&&m.folder!=='trash';
 if(folder==='all')return m.folder!=='trash'&&m.folder!=='spam';
 return m.folder===folder;
}
function gmailSidebar(){
 const counts={};for(const [id] of folders)counts[id]=mail.filter(m=>(id==='starred'?m.star:id==='all'?m.folder!=='trash'&&m.folder!=='spam':m.folder===id)&&m.unread).length;
 return '<div class="webx-mail-drawer'+(side?' open':'')+'" '+(side?'':'hidden')+'><div class="webx-mail-drawer-head">Gmail <small>Treinamento</small><button type="button" data-webx="mail-menu" aria-label="Fechar menu">×</button></div>'+folders.map(([id,label,icon])=>'<button data-webx="mail-folder" data-value="'+id+'" class="'+(id===folder?'active':'')+'">'+icon+' <span>'+label+'</span><small>'+(counts[id]||'')+'</small></button>').join('')+'<button data-webx="mail-official">↗ <span>Abrir Gmail oficial</span></button></div>';
}
function gmailHeader(){
 return '<header class="webx-mail-toolbar"><button aria-label="Abrir pastas" data-webx="mail-menu">☰</button><label><span class="sr-only">Pesquisar mensagens fictícias</span><input type="search" id="webxMailSearch" placeholder="Pesquisar no e-mail" value="'+esc(gmailSearch)+'"></label><button aria-label="Informações da conta simulada" data-webx="mail-info">E</button></header>';
}
function gmailFooter(){return '<nav class="webx-mail-tabs"><button data-webx="mail-folder" data-value="inbox" aria-current="'+(folder==='inbox'?'page':'false')+'">✉ <small>E-mail</small></button><button data-webx="mail-folder" data-value="all">▤ <small>Todos</small></button></nav>';}
/* Filtrar os itens existentes sem recriar o input evita perder foco e teclado no iOS Safari. */
function filterGmailInPlace(){
 if(active!=='gmail'||gmailView!=='list')return;
 const search=gmailSearch.trim().toLocaleLowerCase('pt-BR');
 let count=0;
 body.querySelectorAll('.webx-mail-row').forEach(row=>{
  const id=Number(row.querySelector('[data-webx="mail-open"]')?.dataset.id);
  const m=mail.find(item=>item.id===id);
  const visible=Boolean(m)&&(!search||(m.sender+' '+m.subject+' '+m.preview).toLocaleLowerCase('pt-BR').includes(search));
  row.hidden=!visible;if(visible)count++;
 });
 const label=body.querySelector('.webx-mail-label small');
 if(label)label.textContent='Mensagens fictícias · '+count;
 const empty=body.querySelector('.webx-mail-empty');
 if(empty)empty.hidden=count>0;
}
function renderGmail(){
 if(active!=='gmail')return;
 const panel=gmailSidebar();
 if(gmailView==='message'){
  const m=mail.find(x=>x.id===messageOpen);
  if(!m){gmailView='list';renderGmail();return;}
  host('gmail','<header class="webx-mail-detailhead"><button data-webx="mail-back" aria-label="Voltar à caixa">‹</button><button data-webx="mail-archive" data-id="'+m.id+'" aria-label="Arquivar">▤</button><button data-webx="mail-trash" data-id="'+m.id+'" aria-label="Mover para lixeira">♜</button><button data-webx="mail-star" data-id="'+m.id+'" aria-label="Alternar estrela">'+(m.star?'★':'☆')+'</button></header><main class="webx-mail-detail"><h2>'+esc(m.subject)+'</h2><small>Mensagem fictícia de treinamento</small><div class="webx-mail-sender"><b style="background:'+m.color+'">'+esc(m.sender[0])+'</b><span><strong>'+esc(m.sender)+'</strong><small>remetente@exemplo.test · '+esc(m.time)+'</small></span></div><p>'+esc(m.body)+'</p><div class="webx-mail-notice">Esta mensagem é fictícia e não veio de uma conta Gmail real. Verifique sempre o remetente.</div></main>');
  return;
 }
 if(gmailView==='compose'){
  host('gmail','<div class="webx-mail-compose"><header><button data-webx="mail-back" aria-label="Voltar">‹</button><strong>Escrever</strong><button data-webx="mail-save-draft" type="button">Rascunho</button></header><form id="webxMailForm"><label>Para<input name="to" type="email" required inputmode="email" autocomplete="off" placeholder="contato@exemplo.com" value="'+esc(draft?.to||'')+'"></label><label>Assunto<input name="subject" maxlength="100" placeholder="Assunto" value="'+esc(draft?.subject||'')+'"></label><textarea name="message" rows="7" placeholder="Escreva sua mensagem de exemplo">'+esc(draft?.message||'')+'</textarea><p>Nenhum e-mail é enviado pelo Educa+. Você poderá abrir o aplicativo de e-mail do aparelho para confirmar o envio.</p><button type="submit">Preparar no aplicativo de e-mail</button></form></div>');return;
 }
 const k=gmailSearch.trim().toLocaleLowerCase('pt-BR');
 const list=mail.filter(m=>gmailFolder(m));
 const label=folders.find(x=>x[0]===folder)?.[1]||'Caixa de entrada';
 const rows=list.map(m=>'<div class="webx-mail-row '+(m.unread?'unread':'')+'"><button class="webx-mail-message" data-webx="mail-open" data-id="'+m.id+'"><span class="webx-mail-avatar" style="background:'+m.color+'">'+esc(m.sender[0])+'</span><span class="webx-mail-copy"><strong>'+esc(m.sender)+'</strong><b>'+esc(m.subject)+'</b><small>'+esc(m.preview)+'</small></span><span class="webx-mail-time">'+esc(m.time)+'</span></button><button class="webx-mail-star" aria-label="Marcar com estrela" data-webx="mail-star" data-id="'+m.id+'">'+(m.star?'★':'☆')+'</button></div>').join('');
 host('gmail',gmailHeader()+'<div class="webx-mail-label"><strong>'+esc(label)+'</strong><small>Mensagens fictícias · '+list.length+'</small></div><main class="webx-mail-scroll">'+rows+'<div class="webx-mail-empty" hidden><span aria-hidden="true">✉</span><strong>Nenhuma mensagem nesta pasta ou pesquisa</strong></div></main><button class="webx-mail-fab" data-webx="mail-compose">✎ <span>Escrever</span></button>'+gmailFooter()+panel);
 filterGmailInPlace();
}
function renderSms(){
 if(active!=='messages')return;
 if(smsOpen!==null){
  const s=smsData.find(x=>x.id===smsOpen);if(!s){smsOpen=null;renderSms();return;}
  host('messages','<div class="webx-sms-detail"><header><button data-webx="sms-back" aria-label="Voltar">‹</button><span class="webx-sms-avatar" style="background:'+s.color+'">'+s.initial+'</span><strong>'+esc(s.name)+'</strong></header><main><p class="webx-sms-demo">SMS fictício · ambiente de treinamento</p>'+s.body.map(t=>'<p class="webx-sms-bubble">'+esc(t)+'</p>').join('')+'</main><div class="webx-sms-disabled">Respostas reais estão desativadas nesta demonstração.</div></div>');return;
 }
 const k=smsSearch.toLocaleLowerCase('pt-BR').trim();
 const list=smsData.filter(x=>(x.name+' '+x.preview).toLocaleLowerCase('pt-BR').includes(k));
 host('messages','<div class="webx-sms-head"><h2>Mensagens</h2><p>Conversas fictícias do treinamento</p><label>⌕<input id="webxSmsSearch" type="search" placeholder="Buscar conversas" value="'+esc(smsSearch)+'"></label></div><main class="webx-sms-list">'+list.map(s=>'<button data-webx="sms-open" data-id="'+s.id+'"><span class="webx-sms-avatar" style="background:'+s.color+'">'+s.initial+'</span><span><strong>'+esc(s.name)+'</strong><small>'+esc(s.preview)+'</small></span><time>'+s.time+'</time></button>').join('')+'</main><p class="webx-sms-note">Não acessamos mensagens reais do aparelho.</p>');
}
function showStatus(s,error=false){const target=document.querySelector('#webRealStatus');if(!target)return;target.textContent=s;target.hidden=!s;target.classList.toggle('is-error',error);}
function render(){if(active==='photos')renderPhotos();if(active==='gmail')renderGmail();if(active==='messages')renderSms();}
function open(name,bridge){
 if(!['photos','gmail','messages'].includes(name))return false;
 close();active=name;api=bridge;tab='library';period='all';term='';folder='inbox';gmailSearch='';gmailView='list';messageOpen=null;side=false;photoOpen=null;smsOpen=null;smsSearch='';
 view.classList.add('webx-active','webx-'+name);
 showStatus('');
 if(name==='photos'){renderPhotos();syncPhotos();}
 else render();
 return true;
}
body.addEventListener('click',async e=>{
 if(!active||!view.classList.contains('is-active'))return;
 const btn=e.target.closest('[data-webx]');if(!btn)return;
 e.preventDefault();e.stopPropagation();
 const action=btn.dataset.webx,id=Number(btn.dataset.id),value=btn.dataset.value;
 try{
 if(action==='camera'){window.EducaWebReal?.openApp('camera');return;}
 if(action==='photo-select'){chosen.clear();renderPhotos(); // select mode starts on next click
   if(!body.classList.contains('webx-selecting')){body.classList.add('webx-selecting');const b=$('[data-webx="photo-select"]');if(b)b.textContent='Cancelar';}
   else{body.classList.remove('webx-selecting');}
   return;
 }
 if(action==='photo-tab'){tab=value;term='';photoOpen=null;renderPhotos();return;}
 if(action==='period'){period=value;renderPhotos();return;}
 if(action==='photo-open'){
   if(body.classList.contains('webx-selecting')){chosen.has(id)?chosen.delete(id):chosen.add(id);renderPhotos();return;}
   photoOpen=id;renderPhotos();return;
 }
 if(action==='photo-back'){photoOpen=null;renderPhotos();return;}
 if(action==='photo-download'){const item=photos.find(x=>x.id===id);if(item)api.downloadBlob(item.blob,'educa-foto-'+id+'.jpg');return;}
 if(action==='photo-delete'||action==='photo-delete-selected'){
  const ids=action==='photo-delete-selected'?[...chosen]:[id];if(!ids.length)return;
  if(!window.confirm('Apagar '+ids.length+' foto(s) salvas apenas neste navegador?'))return;
  for(const x of ids)await api.removePhoto(x);
  chosen.clear();photoOpen=null;body.classList.remove('webx-selecting');await syncPhotos();showStatus('Foto(s) removida(s) apenas deste navegador.');return;
 }
 if(action==='mail-menu'){side=!side;renderGmail();return;}
 if(action==='mail-folder'){folder=value;gmailView='list';side=false;renderGmail();return;}
 if(action==='mail-open'){messageOpen=id;const m=mail.find(x=>x.id===id);if(m){m.unread=false;if(m.folder==='drafts'){draft={to:m.to||'',subject:m.subject==='(Sem assunto)'?'':m.subject,message:m.body||''};gmailView='compose';renderGmail();return;}}gmailView='message';renderGmail();return;}
 if(action==='mail-back'){gmailView='list';messageOpen=null;renderGmail();return;}
 if(action==='mail-star'){const m=mail.find(x=>x.id===id);if(m)m.star=!m.star;renderGmail();return;}
 if(action==='mail-trash'||action==='mail-archive'){const m=mail.find(x=>x.id===id);if(m)m.folder=action==='mail-trash'?'trash':'all';gmailView='list';renderGmail();return;}
 if(action==='mail-compose'){gmailView='compose';renderGmail();return;}
 if(action==='mail-save-draft'){const form=$('#webxMailForm');if(form){const fd=new FormData(form);draft={to:String(fd.get('to')||''),subject:String(fd.get('subject')||''),message:String(fd.get('message')||'')};mail=mail.filter(m=>m.id!==1001);mail.unshift({id:1001,folder:'drafts',sender:'Rascunho',subject:draft.subject||'(Sem assunto)',preview:draft.message.slice(0,90)||'Rascunho não enviado',time:'Agora',body:draft.message,to:draft.to,color:'#4e627e',star:false,unread:false});}gmailView='list';folder='drafts';renderGmail();showStatus('Rascunho salvo apenas nesta sessão de treinamento.');return;}
 if(action==='mail-info'){showStatus('Gmail de treinamento: sem acesso à sua conta, senha ou mensagens reais.');return;}
 if(action==='mail-official'){window.open('https://mail.google.com/','_blank','noopener,noreferrer');return;}
 if(action==='sms-open'){smsOpen=id;renderSms();return;}
 if(action==='sms-back'){smsOpen=null;renderSms();return;}
 }catch(error){showStatus(error.message||'Não foi possível concluir esta ação.',true);}
},true);
body.addEventListener('change',async e=>{
 if(active!=='photos'||e.target.id!=='webRealUpload')return;
 e.stopImmediatePropagation();
 const files=[...(e.target.files||[])];e.target.value='';
 if(!files.length)return;
 try{await api.addFiles(files);await syncPhotos();showStatus(files.length+' foto(s) adicionada(s) neste navegador.');}
 catch(err){showStatus(err.message||'Não foi possível adicionar as fotos.',true);}
},true);
body.addEventListener('input',e=>{
 if(active==='photos'&&e.target.id==='webxPhotoSearch'){term=e.target.value; // conservar foco e cursor durante a pesquisa
  const saved=term;renderPhotos();const input=$('#webxPhotoSearch');if(input){input.focus();input.setSelectionRange(saved.length,saved.length);}return;}
 if(active==='gmail'&&e.target.id==='webxMailSearch'){gmailSearch=e.target.value;filterGmailInPlace();return;}
 if(active==='messages'&&e.target.id==='webxSmsSearch'){smsSearch=e.target.value;renderSms();const input=$('#webxSmsSearch');if(input){input.focus();input.setSelectionRange(smsSearch.length,smsSearch.length);}return;}
});
body.addEventListener('submit',e=>{
 if(active!=='gmail'||e.target.id!=='webxMailForm')return;
 e.preventDefault();e.stopImmediatePropagation();
 const fd=new FormData(e.target),to=String(fd.get('to')||'').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)){showStatus('Digite um destinatário válido.',true);return;}
 const subject=String(fd.get('subject')||'').slice(0,100),message=String(fd.get('message')||'').slice(0,2500);
 // Não envia nada; abre a composição no cliente escolhido pelo participante.
 window.location.href='mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
 showStatus('O aplicativo externo foi solicitado. Confira antes de enviar.');
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&active&&view.classList.contains('is-active')){
  if(active==='photos'&&photoOpen!==null){photoOpen=null;renderPhotos();}
  else if(active==='gmail'&&gmailView!=='list'){gmailView='list';renderGmail();}
  else if(active==='gmail'&&side){side=false;renderGmail();}
  else if(active==='messages'&&smsOpen!==null){smsOpen=null;renderSms();}
 }
});
window.EducaWebAppsV11216=Object.freeze({open,close,active:()=>active});
})();