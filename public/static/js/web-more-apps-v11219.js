/* Educa+ V112.19 — apps educacionais claros para a Web.
   YouTube e Maps: telas FICTICIAS, nao consultam Google nem localizacao.
   Agenda: eventos locais no navegador, sem sincronizacao remota. */
(()=>{
'use strict';
if(document.documentElement.dataset.educaPlatform!=='web')return;
const view=document.querySelector('#webRealView'), body=document.querySelector('#webRealBody');
if(!view||!body)return;
const $=(s,root=body)=>root.querySelector(s);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const lessons=[
 {id:'pix',title:'Como reconhecer pedidos urgentes de Pix',category:'Segurança',channel:'Educa+ Digital',time:'3 min',tone:'wv-rose',symbol:'◇',
  summary:'Aprenda a conferir pedidos de dinheiro que chegam de números desconhecidos.',
  steps:['Desconfie de mensagens que exigem pagamento imediato.','Confirme a identidade por um contato antigo que você já conhece.','Antes de qualquer Pix real, confira nome, valor e destinatário.']},
 {id:'senha',title:'Crie senhas fortes e proteja suas contas',category:'Segurança',channel:'Educa+ Digital',time:'4 min',tone:'',symbol:'▣',
  summary:'Dicas simples para não compartilhar senhas e códigos de confirmação.',
  steps:['Use uma senha longa e diferente para cada serviço.','Ative a verificação em duas etapas no aplicativo oficial.','Não entregue códigos recebidos por mensagem a desconhecidos.']},
 {id:'mapa',title:'Como conferir um endereço e usar mapas',category:'Tutoriais',channel:'Educa+ Digital',time:'2 min',tone:'wv-green',symbol:'⌖',
  summary:'Descubra como pesquisar lugares e confirmar se uma localização é verdadeira.',
  steps:['Confira o nome do local, bairro e informações oficiais.','Cuidado com links desconhecidos prometendo rotas mais rápidas.','Para orientação real, abra um aplicativo de mapas oficial.']},
 {id:'email',title:'Cuidado com e-mails e anexos suspeitos',category:'Tutoriais',channel:'Educa+ Digital',time:'3 min',tone:'',symbol:'✉',
  summary:'Diferencie remetentes legítimos de mensagens que tentam roubar dados.',
  steps:['Leia o endereço completo do remetente.','Evite abrir anexos ou links de mensagens inesperadas.','Em caso de dúvida, acesse o site oficial sem usar o link recebido.']},
 {id:'familia',title:'O golpe do familiar que trocou de número',category:'Segurança',channel:'Educa+ Digital',time:'3 min',tone:'wv-rose',symbol:'♧',
  summary:'Uma foto e um nome familiar não bastam para provar a identidade.',
  steps:['Desconfie de números novos pedindo dinheiro.','Ligue para o número antigo do familiar.','Não envie dinheiro antes de ter certeza de quem está pedindo.']}
];
const places=[
 {id:'library',name:'Biblioteca Educa',type:'Biblioteca ilustrativa',symbol:'▤',desc:'Lugar fictício para praticar a busca e leitura de informações sobre um endereço.'},
 {id:'clinic',name:'Centro de Saúde Exemplo',type:'Serviço de exemplo',symbol:'✚',desc:'Local totalmente fictício para treinar como confirmar serviços de saúde.'},
 {id:'park',name:'Praça Modelo',type:'Praça ilustrativa',symbol:'♧',desc:'Ponto de referência fictício usado apenas nesta simulação.'}
];
const APP_CLASSES=['webv-active','webv-youtube','webv-maps','webv-calendar'];
let app='',ytTab='home',ytCategory='Todos',ytQuery='',ytCurrent=null,ytLiked=new Set(),ytRead=new Set(),
    ytSubscribed=false,mTab='explore',mQuery='',mSelected=null,mRoute=false,mSaved=new Set(),
    calendarMode='month',calendarDate=new Date(),calendarForm=false,calendarNotice='';
const STORE='educa-v109-eventos-locais';
function dateKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function parseDate(s){const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));if(!match)return null;
 const d=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
 return dateKey(d)===s?d:null;
}
function dateText(d,opts){return new Intl.DateTimeFormat('pt-BR',opts).format(d);}
function loadEvents(){
 try{const data=JSON.parse(localStorage.getItem(STORE)||'[]');
  return Array.isArray(data)?data.filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&
   parseDate(e.date)&&/^\d{2}:\d{2}$/.test(e.time)).slice(0,80):[];
 }catch(_){return [];}
}
function saveEvents(events){try{localStorage.setItem(STORE,JSON.stringify(events.slice(0,80)));return true;}catch(_){return false;}}
function downloadEvent(item){
 const d=parseDate(item.date);if(!d)return;
 const [h,m]=item.time.split(':').map(Number);
 d.setHours(h,m,0,0);
 const z=v=>v.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
 const start=z(d),end=z(new Date(d.getTime()+3600000));
 const safe=String(item.title).replace(/[\\;,:]/g,c=>'\\'+c).replace(/[\r\n]/g,' ');
 const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Educa+ Digital//Treino//PT-BR',
  'BEGIN:VEVENT','UID:'+String(item.id).replace(/[^a-zA-Z0-9_-]/g,'')+'@educa-digital.local',
  'DTSTAMP:'+z(new Date()),'DTSTART:'+start,'DTEND:'+end,'SUMMARY:'+safe,'END:VEVENT',
  'END:VCALENDAR',''].join('\r\n');
 const href=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
 const anchor=document.createElement('a');anchor.href=href;anchor.download='educa-agenda-treino.ics';
 document.body.appendChild(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(href),6000);
}
function shell(content){body.innerHTML='<div class="webx-app webv-app webv-'+esc(app)+'">'+content+'</div>';}
function tabs(items,active){
 return '<nav class="webv-tabs" aria-label="Navegação do aplicativo">'+items.map(item=>
  '<button type="button" data-wv="'+item.action+'" data-value="'+esc(item.id)+'" aria-current="'+(active===item.id?'page':'false')+'"><span aria-hidden="true">'+item.icon+'</span>'+esc(item.text)+'</button>').join('')+'</nav>';
}
function videoCard(v){
 return '<button class="webv-video-card" type="button" data-wv="video" data-value="'+v.id+
  '" aria-label="Abrir aula demonstrativa: '+esc(v.title)+'">'+
  '<div class="webv-video-art '+v.tone+'"><span aria-hidden="true">'+v.symbol+'</span><small>'+esc(v.time)+'</small></div>'+
  '<span class="webv-video-copy"><strong>'+esc(v.title)+'</strong><small>'+esc(v.channel)+' · '+esc(v.category)+' · conteúdo ilustrativo</small></span></button>';
}
function renderYoutube(){
 const items=[{id:'home',action:'yt-tab',icon:'⌂',text:'Início'},
  {id:'shorts',action:'yt-tab',icon:'▣',text:'Curtos'},
  {id:'subscriptions',action:'yt-tab',icon:'☆',text:'Inscrições'},
  {id:'library',action:'yt-tab',icon:'▤',text:'Você'}];
 if(ytCurrent){
  const v=lessons.find(x=>x.id===ytCurrent);if(!v){ytCurrent=null;renderYoutube();return;}
  shell('<header class="webv-head"><button type="button" class="webv-icon-btn" data-wv="yt-back" aria-label="Voltar ao YouTube">‹</button><h2>Aula de treinamento</h2><span>▶</span></header>'+
   '<main class="webv-scroll"><article class="webv-lesson"><div class="webv-video-art '+v.tone+'">'+v.symbol+
   '<small>AULA ILUSTRATIVA</small></div><div class="webv-lesson-content"><h3>'+esc(v.title)+'</h3><p>'+
   esc(v.summary)+'</p><p><strong>Nesta simulação, a aula é apresentada por texto. Nenhum vídeo do YouTube real é reproduzido.</strong></p><ul>'+
   v.steps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><div class="webv-actions">'+
   '<button type="button" class="webv-secondary" data-wv="yt-like">'+(ytLiked.has(v.id)?'★ Curtido':'☆ Gostei')+'</button>'+
   '<button type="button" class="webv-primary" data-wv="yt-read">'+(ytRead.has(v.id)?'✓ Aula revisada':'Marcar como revisada')+'</button></div></div></article>'+
   '<p class="webv-note">Conteúdo fictício do Educa+ Digital. Para vídeos verdadeiros, use o YouTube oficial.</p></main>');
  return;
 }
 const query=norm(ytQuery);
 let rows=lessons.filter(x=>(!query||norm(x.title+' '+x.category+' '+x.summary).includes(query))&&
  (ytCategory==='Todos'||x.category===ytCategory));
 if(ytTab==='shorts')rows=rows.slice(0,3);
 if(ytTab==='subscriptions'&&!ytSubscribed)rows=[];
 if(ytTab==='library')rows=rows.filter(x=>ytLiked.has(x.id)||ytRead.has(x.id));
 shell('<header class="webv-head"><h2>▶ YouTube</h2><button class="webv-icon-btn" data-wv="yt-official" aria-label="Abrir YouTube oficial">↗</button></header>'+
  '<form id="wvYtSearch" class="webv-search"><input type="search" name="search" value="'+esc(ytQuery)+
  '" aria-label="Pesquisar aulas do YouTube simulado" placeholder="Pesquisar aulas de treino"><button type="submit">Buscar</button></form>'+
  '<div class="webv-chips" aria-label="Temas"><button data-wv="yt-category" data-value="Todos" class="'+(ytCategory==='Todos'?'active':'')+'">Todos</button>'+
  ['Segurança','Tutoriais'].map(x=>'<button data-wv="yt-category" data-value="'+x+'" class="'+(ytCategory===x?'active':'')+'">'+x+'</button>').join('')+
  '</div><main class="webv-scroll"><p class="webv-note">Simulação educativa · sem vídeos, anúncios ou conta real do YouTube.</p>'+
  (ytTab==='subscriptions'?'<button class="webv-secondary" data-wv="yt-subscribe">'+(ytSubscribed?'✓ Inscrito no canal de treino':'Inscrever-se no canal de treino')+'</button>':'')+
  (ytTab==='library'?'<h3>Suas aulas marcadas nesta sessão</h3>':'')+
  (ytTab==='shorts'?'<h3>Conteúdos curtos de segurança</h3>':'')+
  (rows.length?rows.map(videoCard).join(''):'<p class="webv-empty">Nenhuma aula encontrada. Experimente outro tema ou inscreva-se no canal fictício.</p>')+
  '<button type="button" class="webv-secondary" data-wv="yt-official">Abrir YouTube oficial em outra aba</button></main>'+
  tabs(items,ytTab));
}
function placeCard(p){
 return '<button class="webv-place-card" type="button" data-wv="map-place" data-value="'+p.id+'">'+
  '<span class="webv-place-icon" aria-hidden="true">'+p.symbol+'</span><span><strong>'+esc(p.name)+
  '</strong><small>'+esc(p.type)+'</small></span><span aria-hidden="true">›</span></button>';
}
function renderMaps(){
 const rows=places.filter(p=>(mTab!=='saved'||mSaved.has(p.id))&&
  (!mQuery||norm(p.name+' '+p.type+' '+p.desc).includes(norm(mQuery))));
 const selected=places.find(p=>p.id===mSelected);
 shell('<header class="webv-head"><h2>⌖ Maps</h2><button type="button" class="webv-icon-btn" data-wv="maps-official" aria-label="Abrir Google Maps oficial">↗</button></header>'+
  '<form id="wvMapsSearch" class="webv-search"><input type="search" name="query" value="'+esc(mQuery)+
  '" placeholder="Buscar um local de exemplo" aria-label="Buscar no mapa ilustrativo"><button type="submit">Buscar</button></form>'+
  '<div class="webv-map-surface" role="img" aria-label="Mapa esquemático de três locais fictícios">'+
  places.map(p=>'<button type="button" class="webv-map-marker '+(mSelected===p.id?'active':'')+
   '" data-wv="map-place" data-value="'+p.id+'" data-spot="'+p.id+'" aria-label="'+esc(p.name)+'">'+p.symbol+'</button>').join('')+
  '</div><main class="webv-scroll"><p class="webv-note">Mapa ilustrativo. Os locais, pinos e caminhos NÃO representam lugares reais ou sua localização.</p>'+
  (selected?'<section class="webv-place-detail" id="webvMapDetail"><h3>'+esc(selected.name)+'</h3><p>'+esc(selected.desc)+'</p>'+
   (mRoute?'<p><strong>Rota demonstrativa:</strong> confirme o destino em um aplicativo oficial antes de sair. Sem distância ou navegação real.</p>':'')+
   '<div class="webv-actions"><button type="button" class="webv-primary" data-wv="map-route">Como chegar (treino)</button>'+
   '<button type="button" class="webv-secondary" data-wv="map-save">'+(mSaved.has(selected.id)?'★ Salvo':'☆ Salvar')+
   '</button></div></section>':'')+
  '<h3>'+(mTab==='saved'?'Locais salvos':'Explore locais de exemplo')+'</h3><div class="webv-places">'+
  (rows.length?rows.map(placeCard).join(''):'<p class="webv-empty">Nenhum local encontrado nesta simulação.</p>')+'</div>'+
  '<p class="webv-note">Para pesquisar endereços e trajetos reais, abra o Google Maps oficial.</p></main>'+
  tabs([{id:'explore',action:'map-tab',icon:'⌖',text:'Explorar'},
        {id:'saved',action:'map-tab',icon:'☆',text:'Salvos'}],mTab));
}
function calendarGrid(events){
 const month=new Date(calendarDate.getFullYear(),calendarDate.getMonth(),1);
 const start=month.getDay(),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const weekdays=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
 let out='<div class="webv-calendar-grid" role="group" aria-label="Dias do mês">'+
  weekdays.map(w=>'<span class="webv-weekday">'+w+'</span>').join('');
 for(let i=0;i<start;i++)out+='<span aria-hidden="true"></span>';
 for(let d=1;d<=days;d++){
  const dt=new Date(month.getFullYear(),month.getMonth(),d),key=dateKey(dt);
  const selected=dateKey(calendarDate)===key,has=events.some(ev=>ev.date===key);
  out+='<button type="button" data-wv="cal-day" data-value="'+key+'" aria-label="'+
   esc(dateText(dt,{day:'numeric',month:'long'}))+'" aria-pressed="'+selected+'" class="'+(has?'webv-has-event':'')+
   '">'+d+'</button>';
 }
 return out+'</div>';
}
function eventRows(events){
 return events.length?events.map(ev=>'<div class="webv-event-card"><div><strong>'+esc(ev.title)+
  '</strong><small>'+esc(ev.time)+' · salvo somente neste navegador</small></div>'+
  '<button type="button" data-wv="cal-export" data-value="'+esc(ev.id)+'" aria-label="Exportar evento '+esc(ev.title)+'">⇩</button>'+
  '<button type="button" data-wv="cal-delete" data-value="'+esc(ev.id)+'" aria-label="Apagar evento '+esc(ev.title)+'">×</button></div>').join(''):
  '<p class="webv-empty">Nenhum evento de treino para este dia. Use + para adicionar.</p>';
}
function agendaHours(events){
 let out='<div class="webv-day-list">';
 for(let h=6;h<=21;h++){
  const inHour=events.filter(ev=>Number(ev.time.slice(0,2))===h);
  out+='<div class="webv-day-hour"><span>'+String(h).padStart(2,'0')+':00</span>'+
   (inHour.length?'<strong>'+inHour.map(ev=>esc(ev.time+' · '+ev.title)).join(' · ')+'</strong>':'')+'</div>';
 }
 return out+'</div>';
}
function renderAgenda(){
 const events=loadEvents();
 const day=dateKey(calendarDate);
 const today=events.filter(ev=>ev.date===day).sort((a,b)=>a.time.localeCompare(b.time));
 const monthLabel=dateText(calendarDate,{month:'long',year:'numeric'});
 const title=dateText(calendarDate,{weekday:'long',day:'numeric',month:'long'});
 const form=calendarForm?
  '<form id="wvAgendaForm" class="webv-event-form">'+
  '<label>Título do evento de treino<input type="text" name="title" required maxlength="80" placeholder="Ex.: Treinar segurança digital"></label>'+
  '<label>Data<input type="date" name="date" required value="'+day+'"></label>'+
  '<label>Horário<input type="time" name="time" required value="09:00"></label>'+
  '<button type="submit" class="webv-primary">Salvar neste navegador</button>'+
  '<button type="button" class="webv-secondary" data-wv="cal-cancel">Cancelar</button></form>':'';
 shell('<header class="webv-head"><h2>▦ Agenda</h2><button type="button" class="webv-icon-btn" data-wv="cal-add" aria-label="Criar evento">＋</button></header>'+
  '<div class="webv-cal-controls"><button type="button" data-wv="cal-prev" aria-label="Período anterior">‹</button>'+
  '<strong>'+esc(monthLabel)+'</strong><button type="button" data-wv="cal-next" aria-label="Próximo período">›</button>'+
  '<button type="button" data-wv="cal-today">Hoje</button></div>'+
  '<div class="webv-chips"><button class="'+(calendarMode==='month'?'active':'')+'" data-wv="cal-mode" data-value="month">Mês</button>'+
  '<button class="'+(calendarMode==='day'?'active':'')+'" data-wv="cal-mode" data-value="day">Dia</button>'+
  '<button type="button" data-wv="cal-official">Abrir calendário oficial ↗</button></div>'+
  '<main class="webv-scroll"><p class="webv-note">Agenda de treinamento · eventos guardados apenas neste navegador. Não sincroniza sua conta real.</p>'+
  (calendarMode==='month'?calendarGrid(events):'')+
  '<h3>'+esc(title)+'</h3>'+
  (calendarNotice?'<p class="webv-note" role="status">'+esc(calendarNotice)+'</p>':'')+
  form+
  (calendarMode==='day'?agendaHours(today):'')+
  '<section aria-label="Eventos do dia">'+eventRows(today)+'</section>'+
  '<button type="button" class="webv-primary" data-wv="cal-add">＋ Novo evento de treino</button></main>');
}
function render(){
 if(app==='youtube')renderYoutube();
 else if(app==='maps')renderMaps();
 else if(app==='calendar')renderAgenda();
}
function close(){
 app='';
 for(const cls of APP_CLASSES)view.classList.remove(cls);
}
function open(name){
 if(!['youtube','maps','calendar'].includes(name))return false;
 close();app=name;view.classList.add('webv-active','webv-'+name);
 ytTab='home';ytCategory='Todos';ytQuery='';ytCurrent=null;
 mTab='explore';mQuery='';mSelected=null;mRoute=false;
 calendarMode='month';calendarDate=new Date();calendarForm=false;calendarNotice='';
 render();return true;
}
function openOfficial(url){
 window.open(url,'_blank','noopener,noreferrer');
}
body.addEventListener('click',event=>{
 if(!app)return;
 const el=event.target.closest('[data-wv]');
 if(!el||!body.contains(el))return;
 event.preventDefault();event.stopPropagation();
 const act=el.dataset.wv,value=el.dataset.value||'';
 if(act==='yt-official'){openOfficial('https://www.youtube.com/');return;}
 if(act==='maps-official'){openOfficial('https://www.google.com/maps/');return;}
 if(act==='cal-official'){openOfficial('https://calendar.google.com/');return;}
 if(app==='youtube'){
  if(act==='yt-tab'){ytTab=value;ytCurrent=null;render();return;}
  if(act==='yt-category'){ytCategory=value;render();return;}
  if(act==='video'){ytCurrent=value;render();return;}
  if(act==='yt-back'){ytCurrent=null;render();return;}
  if(act==='yt-like'&&ytCurrent){ytLiked.has(ytCurrent)?ytLiked.delete(ytCurrent):ytLiked.add(ytCurrent);render();return;}
  if(act==='yt-read'&&ytCurrent){ytRead.add(ytCurrent);render();return;}
  if(act==='yt-subscribe'){ytSubscribed=!ytSubscribed;render();return;}
 }
 if(app==='maps'){
  if(act==='map-tab'){mTab=value;mSelected=null;mRoute=false;render();return;}
  if(act==='map-place'){mSelected=value;mRoute=false;render();return;}
  if(act==='map-route'){mRoute=!mRoute;render();return;}
  if(act==='map-save'&&mSelected){mSaved.has(mSelected)?mSaved.delete(mSelected):mSaved.add(mSelected);render();return;}
 }
 if(app==='calendar'){
  if(act==='cal-prev'||act==='cal-next'){
   const step=act==='cal-prev'?-1:1;
   calendarDate=calendarMode==='month'?
    new Date(calendarDate.getFullYear(),calendarDate.getMonth()+step,1):
    new Date(calendarDate.getFullYear(),calendarDate.getMonth(),calendarDate.getDate()+step);
   calendarForm=false;calendarNotice='';render();return;
  }
  if(act==='cal-today'){calendarDate=new Date();calendarForm=false;calendarNotice='';render();return;}
  if(act==='cal-day'){const parsed=parseDate(value);if(parsed){calendarDate=parsed;calendarNotice='';render();}return;}
  if(act==='cal-mode'){calendarMode=value==='day'?'day':'month';calendarNotice='';render();return;}
  if(act==='cal-add'){calendarForm=true;calendarNotice='';render();return;}
  if(act==='cal-cancel'){calendarForm=false;render();return;}
  if(act==='cal-delete'){
   const items=loadEvents();const found=items.find(x=>x.id===value);
   if(!found||!window.confirm('Apagar este evento salvo somente neste navegador?'))return;
   calendarNotice=saveEvents(items.filter(x=>x.id!==value))?'Evento de treino apagado.':'Não foi possível atualizar o armazenamento.';
   render();return;
  }
  if(act==='cal-export'){const item=loadEvents().find(x=>x.id===value);if(item)downloadEvent(item);return;}
 }
},true);
body.addEventListener('submit',event=>{
 if(!app)return;
 const form=event.target;
 if(form.id==='wvYtSearch'&&app==='youtube'){
  event.preventDefault();ytQuery=String(new FormData(form).get('search')||'').slice(0,90);ytCurrent=null;render();return;
 }
 if(form.id==='wvMapsSearch'&&app==='maps'){
  event.preventDefault();mQuery=String(new FormData(form).get('query')||'').slice(0,100);
  mSelected=null;mRoute=false;render();return;
 }
 if(form.id==='wvAgendaForm'&&app==='calendar'){
  event.preventDefault();
  const fd=new FormData(form), title=String(fd.get('title')||'').trim().slice(0,80),
   date=String(fd.get('date')||''),time=String(fd.get('time')||'');
  const validTime=/^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  if(!title||!parseDate(date)||!validTime){calendarNotice='Preencha título, data e horário válidos.';render();return;}
  const events=loadEvents();
  if(events.length>=80){calendarNotice='Limite de 80 eventos locais nesta simulação.';render();return;}
  const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),title,date,time};
  if(saveEvents([...events,item])){
   calendarDate=parseDate(date);calendarForm=false;calendarNotice='Evento de treino salvo somente neste navegador.';
  }else calendarNotice='O navegador não permitiu salvar este evento.';
  render();return;
 }
},true);
window.EducaWebMoreAppsV11219=Object.freeze({open,close,active:()=>app});
})();
