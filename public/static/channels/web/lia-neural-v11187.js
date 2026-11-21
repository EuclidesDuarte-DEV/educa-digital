/* LIA Neural V111.87 — Visualização Web; sem bibliotecas remotas.
 * Dados do participante nunca são coletados automaticamente.
 * Token admin somente nesta sessão JS, nunca localStorage.
 */
(()=>{
'use strict';
const byId=id=>document.getElementById(id);
const el=(tag,cls,text)=>{
  const e=document.createElement(tag);
  if(cls)e.className=cls;
  if(text!==undefined)e.textContent=String(text);
  return e;
};
const CATS=[
  ['conhecimento','Conhecimentos','#d9e1ec'],
  ['cenario','Cenários','#d99a61'],
  ['memoria','Memória','#92a2b8'],
  ['aprendizado','Aprendizado','#71c8b6'],
  ['decisao','Decisões','#dac17a']
];
const color=id=>CATS.find(x=>x[0]===id)?.[2]||'#d9e1ec';
const NS='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs={})=>{
  const e=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attrs))e.setAttribute(key,String(value));
  return e;
};
const API='/api/lia/neural';
let token='';
let real=false;
let nodes=[],links=[],selectedId=null,editorId=null;
const positions=new Map();
let zoom=1,panX=0,panY=0,drag=null,dragMoved=false;
const svg=byId('neuralGraph'),group=byId('viewport');
const feedback=(message,isError=false)=>{
  byId('feedback').textContent=message||'';
  byId('feedback').classList.toggle('error',isError);
};
const status=(live)=>{
  const badge=byId('onlineBadge');
  badge.classList.toggle('live',live);
  badge.lastChild.textContent=live?' Biblioteca D1 conectada':' Prévia de conhecimento';
  byId('loginToggle').textContent=live?'Sair da biblioteca':'Acesso administrativo';
};
async function api(path='',method='GET',body=null){
  if(!token)throw Error('Entre com a credencial administrativa.');
  const response=await fetch(API+path,{
    method,
    headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{})
  });
  let value;
  try{value=await response.json();}catch(_){throw Error('Não foi possível ler a resposta do servidor.');}
  if(!response.ok||!value.ok)throw Error(value.message||'Erro na biblioteca.');
  return value;
}
async function demo(){
  const r=await fetch('/static/channels/web/lia-neural-v11187-demo.json?v=11187',{cache:'no-store'});
  if(!r.ok)throw Error('Prévia de conhecimento indisponível.');
  const data=await r.json();
  nodes=data.nodes||[];
  links=data.links||[];
  selectedId=null;
  renderAll();
}
async function refresh(){
  if(!real)return demo();
  const data=await api();
  nodes=data.nodes||[];
  links=data.links||[];
  renderAll();
  if(editorId&&!nodes.some(x=>x.id===editorId))editorId=null;
}
function hash(s){
  let n=2166136261;
  for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}
  return n>>>0;
}
const centers={conhecimento:[385,255],cenario:[585,310],memoria:[430,440],aprendizado:[310,390],decisao:[560,455]};
function positionsFor(items,edges){
  const seen=new Set(items.map(n=>n.id));
  for(const n of items){
    if(positions.has(n.id))continue;
    const h=hash(n.id),p=centers[n.category]||[470,320],theta=(h%628)/100;
    const radius=35+(h%150);
    positions.set(n.id,{x:p[0]+Math.cos(theta)*radius,y:p[1]+Math.sin(theta)*radius});
  }
  // Distribuição estática levemente orientada pela rede; nada de movimento piscando.
  for(let iter=0;iter<85;iter++){
    for(const edge of edges){
      if(!seen.has(edge.source_id)||!seen.has(edge.target_id))continue;
      const a=positions.get(edge.source_id),b=positions.get(edge.target_id);
      if(!a||!b)continue;
      const dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(1,Math.hypot(dx,dy));
      const k=(dist-150)*.0036;
      a.x+=dx/dist*k;a.y+=dy/dist*k;
      b.x-=dx/dist*k;b.y-=dy/dist*k;
    }
    for(let i=0;i<items.length;i++){
      const a=positions.get(items[i].id);
      for(let j=i+1;j<items.length;j++){
        const b=positions.get(items[j].id);
        const dx=a.x-b.x,dy=a.y-b.y,d2=Math.max(50,dx*dx+dy*dy);
        if(d2>18000)continue;
        const force=Math.min(1,420/d2);
        a.x+=dx*force*.09;a.y+=dy*force*.09;
        b.x-=dx*force*.09;b.y-=dy*force*.09;
      }
      a.x=Math.max(35,Math.min(900,a.x));
      a.y=Math.max(35,Math.min(585,a.y));
    }
  }
}
function activeNodes(){
  const q=byId('search').value.trim().toLocaleLowerCase('pt-BR');
  const cat=byId('categoryFilter').value;
  const project=byId('projectFilter').value;
  return nodes.filter(n=>(!cat||n.category===cat)&&(!project||n.project===project)&&
    (!q||[n.title,n.summary,n.keywords,n.project].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(q))));
}
function applyTransform(){
  group.setAttribute('transform','translate('+panX+' '+panY+') scale('+zoom+')');
}
function dots(layer,items){
  // Pontos discretos de fundo: textura inspirada no grafo do Obsidian;
  // eles não fingem ser memórias ou nós computacionais.
  for(let i=0;i<290;i++){
    const c=CATS[i%5],center=centers[c[0]],angle=(((i*23)%290)/290)*Math.PI*2;
    const radius=45+(i*31%180),x=center[0]+Math.cos(angle)*radius;
    const y=center[1]+Math.sin(angle)*radius;
    if(x<8||x>930||y<10||y>620)continue;
    layer.append(svgEl('circle',{cx:x,cy:y,r:(i%9===0?1.7:.7),fill:c[2],opacity:i%11===0?.4:.17}));
  }
}
function graph(){
  const active=activeNodes();
  const ids=new Set(active.map(n=>n.id));
  const edges=links.filter(e=>ids.has(e.source_id)&&ids.has(e.target_id));
  positionsFor(active,edges);
  byId('networkLines').replaceChildren();
  byId('networkNodes').replaceChildren();
  byId('networkLabels').replaceChildren();
  dots(byId('networkLines'),active);
  for(const edge of edges){
    const a=positions.get(edge.source_id),b=positions.get(edge.target_id);
    if(!a||!b)continue;
    byId('networkLines').append(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'edge'}));
  }
  for(const n of active){
    const position=positions.get(n.id);
    const g=svgEl('g');
    const node=svgEl('circle',{cx:position.x,cy:position.y,r:n.id===selectedId?10:6.4,fill:color(n.category),
      class:'node'+(n.id===selectedId?' selected':''),'data-node-id':n.id,tabindex:'0',role:'button',
      'aria-label':n.title+', '+(CATS.find(c=>c[0]===n.category)?.[1]||'conhecimento')});
    node.append(svgEl('title'));
    node.lastChild.textContent=n.title;
    node.addEventListener('click',()=>{if(!dragMoved)void select(n.id);});
    node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void select(n.id);}});
    g.append(node);
    byId('networkNodes').append(g);
    if(n.id===selectedId||active.length<=16){
      const label=svgEl('text',{x:position.x+11,y:position.y-11,class:'node-label'});
      label.textContent=n.title.length>23?n.title.slice(0,22)+'…':n.title;
      byId('networkLabels').append(label);
    }
  }
  byId('graphMessage').textContent=active.length+' nós visíveis · '+edges.length+' conexões · selecione para explorar';
}
function list(){
  const counts=new Map(CATS.map(c=>[c[0],nodes.filter(n=>n.category===c[0]).length]));
  const list=byId('categoryList');
  list.replaceChildren();
  for(const [id,label,hex] of CATS){
    const button=el('button','category'+(byId('categoryFilter').value===id?' active':''),'');
    button.type='button';
    button.append(el('span','small-dot'),el('span','',label),el('span','count',String(counts.get(id))));
    button.firstChild.style.background=hex;
    button.addEventListener('click',()=>{byId('categoryFilter').value=byId('categoryFilter').value===id?'':id;renderAll();});
    list.append(button);
  }
  const projects=[...new Set(nodes.map(n=>n.project).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const projectFilter=byId('projectFilter'),choice=projectFilter.value;
  projectFilter.replaceChildren(new Option('Todos os projetos',''));
  projects.forEach(p=>projectFilter.add(new Option(p,p)));
  projectFilter.value=projects.includes(choice)?choice:'';
  const pl=byId('projectList');pl.replaceChildren();
  for(const p of projects){
    const li=el('li'),button=el('button',projectFilter.value===p?'active':'',p);
    button.type='button';
    button.addEventListener('click',()=>{projectFilter.value=p;renderAll();});
    li.append(button);pl.append(li);
  }
  byId('totalCount').textContent=String(nodes.length);
  byId('linksCount').textContent=String(links.length);
  const opts=[byId('fromNode'),byId('toNode')];
  for(const select of opts){
    const current=select.value;
    select.replaceChildren(new Option('Escolher nota',''));
    [...nodes].sort((a,b)=>a.title.localeCompare(b.title,'pt-BR')).forEach(n=>select.add(new Option(n.title,n.id)));
    select.value=nodes.some(n=>n.id===current)?current:'';
  }
}
function renderAll(){
  list();graph();
  const published=nodes.filter(n=>n.status==='published'&&n.visibility==='public'&&n.category!=='memoria').length;
  byId('publishedNodesCount').textContent=published+' de '+nodes.length+
    ' nós liberados para consulta pela LIA. Notas privadas continuam protegidas.';
}
function noteView(node,full=null){
  byId('notePreview').hidden=false;
  byId('noteForm').hidden=true;
  byId('panelHeading').textContent=node?.title||'Selecionar conhecimento';
  byId('noteState').textContent=node?.status==='published'?'Revisado':node?.status==='draft'?'Rascunho':real?'Biblioteca D1':'Prévia';
  const view=byId('notePreview');view.replaceChildren();
  if(!node){
    view.append(el('div','empty-icon','✦'),el('p','',
      'Selecione um ponto no mapa para visualizar o conhecimento e suas relações.'));
    return;
  }
  view.append(el('small','',node.project+' · '+(CATS.find(c=>c[0]===node.category)?.[1]||'Nota')));
  view.append(el('p','',node.summary||'Sem resumo.'));
  if(full?.content){
    const excerpt=full.content.length>3000?full.content.slice(0,3000)+'…':full.content;
    const pre=el('p','',excerpt);pre.style.whiteSpace='pre-wrap';view.append(pre);
  }
  const near=links.filter(l=>l.source_id===node.id||l.target_id===node.id);
  if(near.length){
    view.append(el('strong','','Conexões'));
    const ul=el('ul','connection-list');
    for(const link of near.slice(0,14)){
      const target=nodes.find(n=>n.id===(link.source_id===node.id?link.target_id:link.source_id));
      if(!target)continue;
      const li=el('li');
      const btn=el('button','',target.title+' · '+link.relation);
      btn.type='button';btn.className='outline';
      btn.addEventListener('click',()=>void select(target.id));
      li.append(btn);ul.append(li);
    }
    view.append(ul);
  }
  if(real){
    const edit=el('button','outline','Editar nota');
    edit.type='button';edit.addEventListener('click',()=>editForm(full||node));
    view.append(edit);
  }
}
async function select(id){
  selectedId=id;
  const node=nodes.find(n=>n.id===id);
  if(!node){noteView(null);graph();return;}
  byId('fromNode').value=id;
  graph();
  if(real){
    try{const details=await api('/nodes/'+encodeURIComponent(id));noteView(node,details.node);}
    catch(e){feedback(e.message,true);noteView(node);}
  }else noteView(node);
}
function editForm(node=null){
  const f=byId('noteForm');
  editorId=node?.id||null;
  f.reset();
  f.elements.title.value=node?.title||'';
  f.elements.category.value=node?.category||'conhecimento';
  f.elements.project.value=node?.project||byId('projectFilter').value||'Educa+ Digital';
  f.elements.summary.value=node?.summary||'';
  f.elements.content.value=node?.content||'';
  f.elements.keywords.value=node?.keywords||'';
  f.elements.source.value=node?.source||'';
  f.elements.status.value=node?.status||'draft';
  f.elements.visibility.value=node?.visibility||'private';
  byId('panelHeading').textContent=editorId?'Editar conhecimento':'Novo conhecimento';
  byId('notePreview').hidden=true;f.hidden=false;
  f.elements.title.focus();
}
function formData(){
  const f=byId('noteForm');
  return Object.fromEntries(['title','category','project','summary','content','keywords','source','status','visibility'].map(k=>[k,f.elements[k].value]));
}
async function showConsentedExamples(){
 if(!real)return;
 const data=await api('/examples');
 const wrap=byId('exampleList');wrap.hidden=false;wrap.replaceChildren();
 wrap.append(el('p','',data.examples.length+
  ' exemplo(s) de treino, com aceite separado e retenção de 7 dias. Nunca são publicados automaticamente na base RAG.'));
 for(const item of data.examples){
  const block=el('div','example-review-item');
  block.style.cssText='padding:10px;border:1px solid #5555;border-radius:9px;margin:8px 0;overflow-wrap:anywhere';
  block.append(el('strong','',item.scenario+' · '+item.signal));
  block.append(el('p','','Participante (trecho filtrado): '+item.participant_excerpt));
  block.append(el('p','','Personagem (trecho gerado): '+item.character_excerpt));
  block.append(el('small','','Apaga automaticamente em '+item.expires_at));
  const discard=el('button','outline','Excluir exemplo');
  discard.type='button';
  discard.addEventListener('click',async()=>{
   try{await api('/examples/'+encodeURIComponent(item.id),'DELETE');
    block.remove();feedback('Exemplo excluído da biblioteca.');}
   catch(error){feedback(error.message,true);}
  });
  block.append(discard);wrap.append(block);
 }
}
async function showReviewQueue(){
 if(!real)return;
 const data=await api('/review/queue');
 const wrap=byId('reviewQueue');wrap.hidden=false;wrap.replaceChildren();
 const eligible=data.candidates.filter(n=>n.eligible);
 wrap.append(el('p','',eligible.length+' fontes institucionais elegíveis. '+
   'Leia cada nota antes de selecioná-la. Memórias e rascunhos não oficiais ficam de fora.'));
 if(!data.candidates.length)return;
 for(const node of data.candidates){
  const row=el('div','review-source-row');
  row.style.cssText='border:1px solid #5555;border-radius:9px;padding:9px;margin:7px 0;overflow-wrap:anywhere';
  const label=document.createElement('label');
  label.style.cssText='display:flex;align-items:flex-start;gap:8px';
  const checked=document.createElement('input');checked.type='checkbox';
  checked.dataset.reviewNote=node.id;
  checked.disabled=!node.eligible;
  checked.setAttribute('aria-label','Aprovar '+node.title);
  label.append(checked,el('strong','',node.title));row.append(label);
  row.append(el('small','',node.source||'Fonte não validada para publicação em lote'));
  const open=el('button','outline','Ler nota');
  open.type='button';open.addEventListener('click',()=>{void select(node.id);});
  row.append(open);
  if(!node.eligible)row.append(el('p','','Requer revisão individual ou fonte oficial verificável.'));
  wrap.append(row);
 }
 const button=el('button','primary','Publicar notas selecionadas para a LIA');
 button.type='button';
 button.addEventListener('click',async()=>{
  const ids=[...wrap.querySelectorAll('input[data-review-note]:checked')].map(n=>n.dataset.reviewNote);
  if(!ids.length){feedback('Selecione pelo menos uma nota revisada.',true);return;}
  if(!confirm('Você abriu, conferiu a fonte e revisou o conteúdo de cada uma das '+ids.length+
     ' notas? Elas ficarão disponíveis para a IA nos treinos de WhatsApp, SMS e LIA.'))return;
  button.disabled=true;
  try{
   const published=await api('/review/publish','POST',{ids});
   feedback(published.published+' conhecimentos aprovados e liberados para a LIA.');
   await refresh();await showReviewQueue();
  }catch(error){feedback(error.message,true);}
  finally{button.disabled=false;}
 });
 wrap.append(button);
}
async function showLearningInsights(){
 if(!real)return;
 const data=await api('/learning/insights');
 const wrap=byId('learningInsights');wrap.hidden=false;wrap.replaceChildren();
 wrap.append(el('p','',data.message));
 for(const item of data.scenarios){
  const row=el('div','learning-insight');
  row.style.cssText='padding:8px;border-bottom:1px solid #5555;overflow-wrap:anywhere';
  row.append(el('strong','',item.scenario+' · '+item.completed+' exercícios voluntários'));
  row.append(el('p','',item.recommendation));wrap.append(row);
 }
}
function controls(enabled){
  for(const id of ['newNote','seedBtn','researchBtn','loadExamples','reviewKnowledge','loadLearningInsights','fromNode','toNode','addLink','files'])
    byId(id).disabled=!enabled;
  byId('uploadLabel').setAttribute('aria-disabled',String(!enabled));
}
async function importFiles(fileList){
  if(!real)return;
  const accepted=/\.(md|txt|json|csv)$/i;
  const project=byId('noteForm').hidden?(byId('projectFilter').value||'Educa+ Digital'):
    byId('noteForm').elements.project.value||'Educa+ Digital';
  const category=byId('categoryFilter').value||'conhecimento';
  let added=0;
  const existing=[...nodes];
  for(const file of [...fileList].slice(0,40)){
    if(!accepted.test(file.name)||file.size>18000){
      feedback('Aceitos: .md, .txt, .json e .csv até 18 KB cada. '+file.name+' não foi importado.',true);
      continue;
    }
    try{
      const content=await file.text();
      const heading=content.match(/^#\s+(.+)$/m)?.[1];
      const title=(heading||file.name.replace(/\.[^.]+$/,'')).slice(0,120);
      const keywords=(title+' '+file.name).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,',').slice(0,400);
      const n={title,category,project,summary:content.replace(/^#\s+.*\n?/,'').trim().slice(0,240),
        content,keywords,source:file.name,status:'draft',visibility:'private'};
      const result=await api('/nodes','POST',n);
      const newly={...n,id:result.id};
      // Relações automáticas por projeto e tema; elas não afirmam uma
      // inferência factual do modelo. A equipe pode revisá-las.
      const tokens=new Set(keywords.split(',').filter(x=>x.length>4));
      const candidates=existing.filter(x=>x.project===project&&
        String(x.keywords||'').split(',').some(k=>tokens.has(k))).slice(0,2);
      for(const match of candidates){
        try{await api('/links','POST',{source_id:result.id,target_id:match.id,relation:'assunto-em-comum'});}catch(_){}
      }
      existing.push(newly);
      added++;
      feedback(added+' arquivo(s) importado(s) como rascunhos privados.');
    }catch(e){feedback(file.name+': '+e.message,true);}
  }
  await refresh();
}
function coordinates(evt){
  const rect=svg.getBoundingClientRect();
  return {x:(evt.clientX-rect.left)/rect.width*940,y:(evt.clientY-rect.top)/rect.height*630};
}
svg.addEventListener('pointerdown',evt=>{
  if(evt.button!==0)return;
  const node=evt.target.closest?.('[data-node-id]');
  const point=coordinates(evt);
  dragMoved=false;
  if(node){
    const p=positions.get(node.dataset.nodeId);
    if(p)drag={type:'node',id:node.dataset.nodeId,sx:point.x,sy:point.y,x:p.x,y:p.y};
  }else drag={type:'pan',sx:point.x,sy:point.y,x:panX,y:panY};
  if(drag){svg.setPointerCapture?.(evt.pointerId);svg.classList.add('dragging');}
});
svg.addEventListener('pointermove',evt=>{
  if(!drag)return;
  const p=coordinates(evt),dx=p.x-drag.sx,dy=p.y-drag.sy;
  if(Math.abs(dx)+Math.abs(dy)>3)dragMoved=true;
  if(drag.type==='node'){
    const pos=positions.get(drag.id);
    if(pos){pos.x=drag.x+dx/zoom;pos.y=drag.y+dy/zoom;graph();}
  }else{panX=drag.x+dx;panY=drag.y+dy;applyTransform();}
});
function endDrag(){drag=null;svg.classList.remove('dragging');setTimeout(()=>dragMoved=false,60);}
svg.addEventListener('pointerup',endDrag);
svg.addEventListener('pointercancel',endDrag);
svg.addEventListener('wheel',evt=>{
  evt.preventDefault();
  zoom=Math.max(.55,Math.min(3.3,zoom*(evt.deltaY>0?.91:1.1)));
  applyTransform();
},{passive:false});
byId('resetGraph').addEventListener('click',()=>{zoom=1;panX=0;panY=0;applyTransform();});
byId('loadExamples').addEventListener('click',()=>{
 if(real)void showConsentedExamples().catch(error=>feedback(error.message,true));
});
byId('reviewKnowledge').addEventListener('click',()=>{
 if(real)void showReviewQueue().catch(error=>feedback(error.message,true));
});
byId('loadLearningInsights').addEventListener('click',()=>{
 if(real)void showLearningInsights().catch(error=>feedback(error.message,true));
});
for(const id of ['search','categoryFilter','projectFilter'])
  byId(id).addEventListener(id==='search'?'input':'change',renderAll);
function loginDialog(show){
  byId('loginOverlay').hidden=!show;
  if(show)byId('adminToken').focus();
  else byId('loginMessage').textContent='';
}
byId('loginToggle').addEventListener('click',()=>{
  if(real){
    token='';real=false;controls(false);byId('noteForm').hidden=true;
    feedback('Sessão administrativa encerrada.');
    status(false);void demo();
  }else loginDialog(true);
});
byId('closeLogin').addEventListener('click',()=>loginDialog(false));
byId('loginOverlay').addEventListener('click',e=>{if(e.target===byId('loginOverlay'))loginDialog(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!byId('loginOverlay').hidden)loginDialog(false);});
byId('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const secret=byId('adminToken').value.trim();
  if(secret.length<24)return;
  token=secret;
  byId('loginMessage').textContent='Verificando credencial e banco D1...';
  try{
    await api('/status');
    real=true;controls(true);status(true);
    byId('adminToken').value='';loginDialog(false);
    await refresh();feedback('Biblioteca conectada. Notas privadas não entram nas conversas da IA.');
  }catch(err){
    token='';real=false;
    byId('loginMessage').classList.add('error');
    byId('loginMessage').textContent=err.message;
  }
});
byId('newNote').addEventListener('click',()=>editForm());
byId('noteForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!real)return;
  const data=formData();
  if(data.visibility==='public'&&data.status==='published'&&
     !confirm('Publicar esta nota para consulta pela LIA em conversas de treinamento? Confirme que não há dados pessoais.'))return;
  try{
    const result=editorId?await api('/nodes/'+encodeURIComponent(editorId),'PATCH',data):
      await api('/nodes','POST',data);
    editorId=result.id;
    feedback('Conhecimento salvo no D1.');
    await refresh();await select(result.id);
  }catch(err){feedback(err.message,true);}
});
byId('seedBtn').addEventListener('click',async()=>{
  if(!real||!confirm('Inserir a base inicial revisada de 15 notas e 19 relações no D1?'))return;
  try{const data=await api('/seed','POST',{});await refresh();feedback('Base carregada: '+data.seeded+' notas e '+data.links+' conexões.');}
  catch(e){feedback(e.message,true);}
});
byId('researchBtn').addEventListener('click',async()=>{
  if(!real||!confirm('Importar 16 pesquisas antifraude de 2025–2026 como rascunhos privados? A equipe deverá revisar as fontes antes de publicar.'))return;
  try{
    const data=await api('/seed/research-2026','POST',{});
    await refresh();
    feedback(data.seeded+' casos documentados importados e '+data.links+' relações criadas para revisão. Nenhuma nota foi publicada na IA.');
  }catch(e){feedback(e.message,true);}
});
byId('files').addEventListener('change',async e=>{
  await importFiles(e.target.files);
  e.target.value='';
});
byId('addLink').addEventListener('click',async()=>{
  const source_id=byId('fromNode').value,target_id=byId('toNode').value;
  if(!source_id||!target_id||source_id===target_id){feedback('Selecione dois conhecimentos diferentes.',true);return;}
  try{
    await api('/links','POST',{source_id,target_id,relation:byId('relation').value||'relacionado'});
    await refresh();feedback('Conexão salva na biblioteca.');
  }catch(e){feedback(e.message,true);}
});
status(false);controls(false);
demo().catch(err=>feedback(err.message,true));
applyTransform();
})();
