/* Educa+ Digital V109 | Recursos REAIS permitidos pelo navegador.
   Ativado SOMENTE no Modo Livre; não altera as 22 atividades guiadas.
   Não é Android nativo. Nenhuma API de Gmail, SMS, telefone ou Play Store
   é falsamente apresentada como conectada ao sistema operacional.
   Dados e fotos de treino não são enviados ao servidor. */
(()=>{
'use strict';
const $ = q => document.querySelector(q);
const body=$('#webRealBody'), screen=$('#phoneScreen'), status=$('#webRealStatus');
const titles={camera:'Câmera',photos:'Fotos',gmail:'Gmail',calendar:'Agenda',chrome:'Navegador',phone:'Telefone',messages:'Mensagens',playstore:'Play Store',maps:'Maps',youtube:'YouTube'};
const icons={camera:'camera',photos:'photos',gmail:'gmail',calendar:'calendar',chrome:'chrome',phone:'phone',messages:'messages',playstore:'playstore',maps:'maps',youtube:'youtube'};
const intercepted=new Set(Object.keys(titles));
let current='', stream=null, cameraFacing='environment', photoUrls=[], dbPromise=null;
const isFree=()=>window.EducaFreeMode?.isActive?.()===true;
const card=(title,desc)=>`<section class="wr-card"><strong>${title}</strong><p>${desc}</p>`;
const end='</section>';
function notice(msg,error=false){if(!status)return;status.textContent=msg;status.hidden=!msg;status.classList.toggle('is-error',error);}
function clearNotice(){notice('');}
function stopCamera(){if(stream){for(const track of stream.getTracks())track.stop();stream=null;}const video=$('#webRealCameraVideo');if(video)video.srcObject=null;}
function clearUrls(){photoUrls.forEach(URL.revokeObjectURL);photoUrls=[];}
function leave(){stopCamera();clearUrls();current='';clearNotice();}
function back(){leave();window.EducaFreeView?.setView('home');}
function openApp(app){
 if(!isFree()||!intercepted.has(app))return;
 leave();current=app;
 $('#webRealTitle').textContent=titles[app];
 $('#webRealIcon').src='/static/icons/'+icons[app]+'.svg';
 $('#webRealSubtitle').textContent=app==='camera'?'Permissão necessária para usar a câmera':'Modo Livre · recursos web';
 window.EducaFreeView?.setView('webreal');
 const p='<p class="wr-disclosure">Este é um ambiente educativo. Recursos do seu aparelho só são usados após uma ação sua.</p>';
 switch(app){
  case 'camera': body.innerHTML=p+card('Câmera do seu aparelho','Permita o acesso quando o navegador solicitar. As fotos ficam neste navegador, não vão para a nuvem.')+`<div class="wr-camera-frame"><video id="webRealCameraVideo" autoplay muted playsinline></video></div><div class="wr-row"><button type="button" class="wr-primary" data-wr="camera-start">Ligar câmera</button><button type="button" data-wr="camera-flip">Virar câmera</button></div><div class="wr-row"><button type="button" data-wr="camera-capture">Tirar foto</button><button type="button" data-wr="open-photos">Ver fotos</button></div>`+end;break;
  case 'photos': body.innerHTML=p+card('Minhas fotos locais','Você pode escolher fotos do aparelho ou usar a câmera. Elas ficam apenas neste navegador e podem ser apagadas.')+`<label class="wr-upload">Adicionar imagens<input type="file" id="webRealUpload" accept="image/*" multiple></label><button type="button" data-wr="camera-open">Abrir câmera</button>`+end+`<div id="webRealGallery" class="wr-gallery" aria-label="Fotos salvas"></div>`; renderGallery();break;
  case 'gmail': body.innerHTML=p+card('Gmail real','O Gmail pode abrir em outra aba para você entrar diretamente no serviço oficial. O Educa+ não lê suas mensagens nem recebe sua senha.')+`<button type="button" class="wr-primary" data-wr="gmail-site">Abrir Gmail oficial</button>`+end+card('Escrever e-mail no aplicativo do aparelho','O botão usa o aplicativo de e-mail escolhido no seu sistema, se houver.')+`<label>Para<input id="wrEmailTo" type="email" inputmode="email" placeholder="destinatario@exemplo.com"></label><label>Assunto<input id="wrEmailSubject" maxlength="100" placeholder="Assunto do e-mail"></label><button type="button" data-wr="compose-email">Preparar e-mail</button>`+end+card('Integração completa de Gmail','Ler e enviar e-mails dentro do simulador exige um projeto Google Cloud, OAuth 2.0, consentimento e escopos Gmail. Essa autorização não está configurada e nenhuma caixa postal é acessada aqui.')+end;break;
  case 'calendar': body.innerHTML=p+card('Minha agenda','Crie lembretes fictícios e salve neste navegador. É possível exportar um evento para seu calendário real.')+`<form id="wrEventForm"><label>O que você quer lembrar?<input name="title" required maxlength="80" placeholder="Ex.: Consulta, treinamento"></label><label>Data<input name="date" type="date" required></label><label>Horário<input name="time" type="time" required></label><button type="submit" class="wr-primary">Salvar lembrete</button></form>`+end+`<section class="wr-card"><strong>Lembretes neste navegador</strong><div id="wrEvents"></div></section><button type="button" data-wr="calendar-site">Abrir Google Agenda oficial</button>`; $('#wrEventForm [name="date"]').value=(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');})();$('#wrEventForm [name="time"]').value='09:00';renderEvents();break;
  case 'chrome': body.innerHTML=p+card('Navegador real','Digite um site ou uma pesquisa. O endereço será aberto em uma nova aba segura do navegador do aparelho.')+`<form id="wrBrowserForm"><label>Endereço ou pesquisa<input name="query" inputmode="url" maxlength="240" required placeholder="Ex.: www.gov.br ou receita de bolo"></label><button type="submit" class="wr-primary">Pesquisar / abrir site</button></form>`+end+`<section class="wr-card"><strong>Sites conhecidos</strong><div class="wr-row"><button type="button" data-wr="govbr-site">GOV.BR</button><button type="button" data-wr="gmail-site">Gmail</button><button type="button" data-wr="youtube-site">YouTube</button></div></section>`;break;
  case 'phone': body.innerHTML=p+card('Telefone do aparelho','Digite um número de sua escolha. Só abriremos o aplicativo de chamadas após sua confirmação. Não ligamos automaticamente.')+`<form id="wrPhoneForm"><label>Número<input name="number" type="tel" inputmode="tel" required maxlength="22" placeholder="DDD + número"></label><button type="submit" class="wr-primary">Abrir discador real</button></form>`+end+card('Treino de chamadas','As ligações suspeitas do Modo Livre continuam sendo simulações, com a IA por trás das respostas. Chamadas telefônicas verdadeiras são iniciadas somente por você.')+end;break;
  case 'messages': body.innerHTML=p+card('Mensagens SMS do aparelho','Um SMS verdadeiro só pode ser preparado no aplicativo de mensagens escolhido pelo sistema. O site não acessa sua caixa de SMS.')+`<form id="wrSmsForm"><label>Destinatário<input name="number" required type="tel" inputmode="tel" maxlength="22" placeholder="DDD + número"></label><label>Mensagem<textarea name="message" maxlength="350" rows="4" placeholder="Escreva sua mensagem"></textarea></label><button type="submit" class="wr-primary">Preparar SMS real</button></form>`+end+card('Mensagens do treinamento','As mensagens surpresa do Modo Livre são fictícias. Elas não aparecem no SMS real do seu aparelho.')+end;break;
  case 'playstore': body.innerHTML=p+card('Google Play Store oficial','Você pode visitar a loja real, mas uma página web não pode instalar aplicativos silenciosamente nem mostrar todos os apps instalados.')+`<button type="button" class="wr-primary" data-wr="playstore-site">Abrir Google Play oficial</button><button type="button" data-wr="playstore-whatsapp">Ver WhatsApp oficial na Play Store</button>`+end+card('Dica de segurança','Antes de instalar, confira o desenvolvedor e os comentários. Nunca baixe arquivos APK de links desconhecidos.')+end;break;
  case 'maps': body.innerHTML=p+card('Google Maps','Pesquise um local no Google Maps oficial. Sua localização não será solicitada automaticamente.')+`<form id="wrMapsForm"><label>Local que deseja procurar<input required name="query" maxlength="150" placeholder="Ex.: hospital perto de mim"></label><button type="submit" class="wr-primary">Pesquisar no Google Maps</button></form>`+end+`<button type="button" data-wr="maps-location">Ver localização no Maps (pedir permissão)</button>`;break;
  case 'youtube': body.innerHTML=p+card('YouTube','Pesquise e assista a vídeos no serviço oficial. O simulador não acessa seu histórico ou a sua conta do YouTube.')+`<form id="wrYouTubeForm"><label>O que você quer assistir?<input required name="query" maxlength="150" placeholder="Ex.: como reconhecer um golpe Pix"></label><button type="submit" class="wr-primary">Pesquisar no YouTube</button></form><button type="button" data-wr="youtube-site">Abrir YouTube</button>`+end;break;
 }
}
function openExternal(url){const u=new URL(url);if(u.protocol!=='https:')throw Error('Endereço não permitido.');window.open(u.href,'_blank','noopener,noreferrer');notice('Abertura do serviço solicitada. Se nada abrir, permita novas abas neste navegador.');}
function safeBrowserQuery(query){const s=String(query||'').trim().slice(0,240);if(!s)return null;if(/^(javascript|data|file|ftp):/i.test(s))return null;try{const maybe=/^https?:\/\//i.test(s)?s:/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(s)?'https://'+s:null;if(maybe){const u=new URL(maybe);if(u.protocol==='https:'&&u.hostname.includes('.'))return u.href;}}catch(_){}return 'https://www.google.com/search?q='+encodeURIComponent(s);}
function openIntent(kind,number,message=''){
 let digits=String(number||'').replace(/[\s().-]/g,'');
 if(!/^\+?\d{8,15}$/.test(digits)){notice('Digite um número de telefone válido com DDD.',true);return;}
 const msg=kind==='sms'?'Abrir o aplicativo de SMS real para este número? Nenhuma mensagem será enviada automaticamente.':'Abrir o discador real para este número? A ligação poderá gerar custos.';
 if(!window.confirm(msg))return;
 const link=document.createElement('a');
 link.href=kind==='sms'?'sms:'+digits+(message?'?body='+encodeURIComponent(String(message).slice(0,350)):''):'tel:'+digits;
 link.style.display='none';document.body.append(link);link.click();link.remove();
 notice(kind==='sms'?'Abertura do aplicativo de SMS solicitada. Confira tudo antes de enviar.':'Abertura do discador solicitada. Confirme a chamada no aparelho.');
}
function openDB(){
 if(!('indexedDB' in window))return Promise.reject(Error('O armazenamento de fotos não está disponível neste navegador.'));
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open('educa-digital-fotos-web-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('Não foi possível abrir a galeria local.'));});return dbPromise;
}
async function storePhoto(blob){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('photos','readwrite');const r=t.objectStore('photos').add({blob,created:Date.now()});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function readPhotos(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('photos').objectStore('photos').getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}
async function removePhoto(id){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('photos','readwrite').objectStore('photos').delete(id);r.onsuccess=resolve;r.onerror=()=>reject(r.error);});}
async function compressImage(file){if(!file.type.startsWith('image/'))throw Error('Selecione uma imagem.');if(file.size>15*1024*1024)throw Error('Imagem grande demais (máximo 15 MB).');const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(bitmap.width*scale));cv.height=Math.max(1,Math.round(bitmap.height*scale));cv.getContext('2d').drawImage(bitmap,0,0,cv.width,cv.height);return await new Promise((resolve,reject)=>cv.toBlob(b=>b?resolve(b):reject(Error('Não foi possível salvar imagem.')),'image/jpeg',.83));}finally{bitmap.close();}}
async function renderGallery(){const grid=$('#webRealGallery');if(!grid)return;clearUrls();grid.replaceChildren();try{const list=(await readPhotos()).sort((a,b)=>b.created-a.created);if(current!=='photos')return;if(!list.length){const tip=document.createElement('p');tip.className='wr-muted';tip.textContent='Nenhuma foto salva neste navegador ainda.';grid.append(tip);}for(const item of list){const tile=document.createElement('article');tile.className='wr-photo-tile';const img=document.createElement('img');img.alt='Foto armazenada neste navegador';img.src=URL.createObjectURL(item.blob);photoUrls.push(img.src);const buttons=document.createElement('div');const download=document.createElement('button');download.type='button';download.textContent='Baixar';download.dataset.downloadPhoto=String(item.id);const del=document.createElement('button');del.type='button';del.textContent='Apagar';del.dataset.deletePhoto=String(item.id);buttons.append(download,del);tile.append(img,buttons);grid.append(tile);}}catch(e){notice(String(e.message),true);}}
async function addFiles(files){if(!files?.length)return;try{const count=(await readPhotos()).length;if(count+files.length>30)throw Error('Limite de 30 fotos de treino neste navegador. Apague algumas primeiro.');let added=0;for(const file of files){await storePhoto(await compressImage(file));added++;}notice(`${added} foto(s) salva(s) somente neste navegador.`);await renderGallery();}catch(e){notice(String(e.message),true);}}
async function cameraStart(){stopCamera();if(!navigator.mediaDevices?.getUserMedia){notice('A câmera não está disponível aqui. Use HTTPS/localhost e permita acesso ao navegador.',true);return;}try{stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:cameraFacing}}});if(current!=='camera'){stopCamera();return;}const v=$('#webRealCameraVideo');if(v){v.srcObject=stream;await v.play().catch(()=>{});}notice('Câmera ligada com sua permissão. As imagens não saem do aparelho.');}catch(e){notice('Não foi possível abrir a câmera: '+(e.name==='NotAllowedError'?'permissão negada.':e.message),true);}}
async function cameraCapture(){const video=$('#webRealCameraVideo');if(!stream||!video||video.readyState<2){notice('Primeiro ligue a câmera e aguarde a imagem aparecer.',true);return;}try{const cnv=document.createElement('canvas');const r=Math.min(1,1280/Math.max(video.videoWidth,video.videoHeight));cnv.width=Math.round(video.videoWidth*r);cnv.height=Math.round(video.videoHeight*r);cnv.getContext('2d').drawImage(video,0,0,cnv.width,cnv.height);const blob=await new Promise(ok=>cnv.toBlob(ok,'image/jpeg',.82));if(!blob)throw Error('Captura falhou.');await storePhoto(blob);notice('Foto capturada! Toque em “Ver fotos” para visualizá-la.');}catch(e){notice('Não foi possível salvar: '+e.message,true);}}
const KEY='educa-v109-eventos-locais';
function events(){try{const list=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(list)?list.filter(x=>x&&typeof x.title==='string').slice(0,80):[];}catch(_){return [];}}
function saveEvents(list){localStorage.setItem(KEY,JSON.stringify(list.slice(0,80)));}
function renderEvents(){const target=$('#wrEvents');if(!target)return;target.replaceChildren();const rows=events().sort((a,b)=>String(a.date+a.time).localeCompare(b.date+b.time));if(!rows.length){const p=document.createElement('p');p.className='wr-muted';p.textContent='Sem lembretes ainda.';target.append(p);}for(const ev of rows){const div=document.createElement('div');div.className='wr-event';const text=document.createElement('span');const strong=document.createElement('strong');strong.textContent=ev.title;const small=document.createElement('small');small.textContent=`${ev.date.split('-').reverse().join('/')} · ${ev.time}`;text.append(strong,small);const exportBtn=document.createElement('button');exportBtn.type='button';exportBtn.textContent='Exportar';exportBtn.dataset.exportEvent=ev.id;const del=document.createElement('button');del.type='button';del.textContent='Apagar';del.dataset.deleteEvent=ev.id;div.append(text,exportBtn,del);target.append(div);}}
function ics(ev){const dt=new Date(`${ev.date}T${ev.time}:00`);if(Number.isNaN(dt.getTime()))throw Error('Data inválida.');const at=d=>d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';const clean=String(ev.title).replace(/[\\;,:]/g,m=>'\\'+m).replace(/[\r\n]/g,' ');const start=at(dt),end=at(new Date(dt.getTime()+60*60000));return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Educa+ Digital//Agenda Local//PT-BR','BEGIN:VEVENT','UID:'+ev.id+'@educa-digital.local','DTSTAMP:'+at(new Date()),'DTSTART:'+start,'DTEND:'+end,'SUMMARY:'+clean,'END:VEVENT','END:VCALENDAR',''].join('\r\n');}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);}
function createEvent(fd){const title=String(fd.get('title')||'').trim().slice(0,80),date=String(fd.get('date')||''),time=String(fd.get('time')||'');if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))throw Error('Preencha o nome, a data e o horário.');const list=events();list.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),title,date,time});saveEvents(list);renderEvents();notice('Lembrete salvo apenas neste navegador.');}
function handleExternal(action){const urls={'gmail-site':'https://mail.google.com/','calendar-site':'https://calendar.google.com/','govbr-site':'https://www.gov.br/pt-br','playstore-site':'https://play.google.com/store/apps','playstore-whatsapp':'https://play.google.com/store/apps/details?id=com.whatsapp','youtube-site':'https://www.youtube.com/'};if(urls[action]){openExternal(urls[action]);return true;}return false;}
document.addEventListener('click',event=>{if(!isFree())return;
 const tile=event.target.closest('#homeView [data-open-app]');if(tile&&intercepted.has(tile.dataset.openApp)){event.preventDefault();event.stopImmediatePropagation();openApp(tile.dataset.openApp);return;}
 if(event.target.closest('#homeView .google-search')){event.preventDefault();event.stopImmediatePropagation();openApp('chrome');return;}
},true);
$('#webRealBack')?.addEventListener('click',back);
body?.addEventListener('click',async event=>{const button=event.target.closest('button');if(!button)return;const action=button.dataset.wr;
 try{
 if(action&&handleExternal(action))return;
 switch(action){
  case 'camera-start':await cameraStart();break;
  case 'camera-flip':cameraFacing=cameraFacing==='environment'?'user':'environment';await cameraStart();break;
  case 'camera-capture':await cameraCapture();break;
  case 'open-photos':openApp('photos');break;
  case 'camera-open':openApp('camera');break;
  case 'compose-email':{const to=String($('#wrEmailTo')?.value||'').trim();const subject=String($('#wrEmailSubject')?.value||'');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))throw Error('Informe um e-mail válido.');window.location.href='mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subject);notice('Aplicativo de e-mail solicitado. Confira o destinatário antes de enviar.');break;}
  case 'maps-location':if(!navigator.geolocation)throw Error('Localização indisponível.');notice('Aguardando sua permissão de localização…');navigator.geolocation.getCurrentPosition(pos=>{openExternal(`https://www.google.com/maps/search/?api=1&query=${pos.coords.latitude}%2C${pos.coords.longitude}`);},e=>notice('Localização não autorizada ou indisponível: '+e.message,true),{enableHighAccuracy:false,timeout:11000,maximumAge:120000});break;
 }
 if(button.dataset.deletePhoto){if(window.confirm('Apagar esta foto do navegador?')){await removePhoto(Number(button.dataset.deletePhoto));await renderGallery();notice('Foto apagada.');}}
 if(button.dataset.downloadPhoto){const item=(await readPhotos()).find(x=>x.id===Number(button.dataset.downloadPhoto));if(item)downloadBlob(item.blob,'educa-foto-'+item.id+'.jpg');}
 if(button.dataset.deleteEvent){saveEvents(events().filter(x=>x.id!==button.dataset.deleteEvent));renderEvents();notice('Lembrete apagado.');}
 if(button.dataset.exportEvent){const item=events().find(x=>x.id===button.dataset.exportEvent);if(item){downloadBlob(new Blob([ics(item)],{type:'text/calendar;charset=utf-8'}),'educa-evento.ics');notice('Arquivo de calendário preparado. Importe-o no aplicativo de sua preferência.');}}
 }catch(e){notice(e.message||'Não foi possível realizar a ação.',true);}
});
body?.addEventListener('change',event=>{if(event.target?.id==='webRealUpload'){addFiles(event.target.files);event.target.value='';}});
body?.addEventListener('submit',event=>{event.preventDefault();const form=event.target;if(!(form instanceof HTMLFormElement))return;const data=new FormData(form);try{
 if(form.id==='wrEventForm'){createEvent(data);form.reset();return;}
 if(form.id==='wrBrowserForm'){const url=safeBrowserQuery(data.get('query'));if(!url)throw Error('Endereço inválido.');openExternal(url);return;}
 if(form.id==='wrPhoneForm'){openIntent('tel',data.get('number'));return;}
 if(form.id==='wrSmsForm'){openIntent('sms',data.get('number'),data.get('message'));return;}
 if(form.id==='wrMapsForm'){openExternal('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(String(data.get('query')).slice(0,150)));return;}
 if(form.id==='wrYouTubeForm'){openExternal('https://www.youtube.com/results?search_query='+encodeURIComponent(String(data.get('query')).slice(0,150)));return;}
 }catch(e){notice(e.message,true);}});
if(screen)new MutationObserver(()=>{if(screen.getAttribute('data-current-view')!=='webreal'&&current){leave();}}).observe(screen,{attributes:true,attributeFilter:['data-current-view']});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCamera();});
window.addEventListener('pagehide',stopCamera);
window.EducaWebReal=Object.freeze({openApp,stopCamera,isActive:()=>current==='camera'||current==='photos'});
})();
