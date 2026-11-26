/* V112.63 — gamificação Web: XP por conta, fila local e sincronização D1.
 * Não transfere XP legado sem proprietário nem envia mensagens do treino.
 */
(()=>{
  'use strict';
  if (document.documentElement?.dataset?.educaPlatform !== 'web') return;
  const phone=document.getElementById('phoneScreen');
  const learning=document.querySelector('#learningView .learning-header');
  if (!phone || !learning) return;
  const STORE='educaWebModoLivreNivelV11182';
  const MAX_XP=9999;
  const LEVELS=[
    {name:'Novato',min:0,next:80},
    {name:'Intermediário',min:80,next:210},
    {name:'Experiente',min:210,next:null}
  ];
  const SCAM_IDS=new Set([
    'family','family-photo','bank','video','code','delivery','call-tech','relative',
    'account','prize','sms-delivery','sms-bank','sms-prize'
  ]);
  const clamp=n=>Math.max(0,Math.min(MAX_XP,Math.floor(Number(n)||0)));
  const tierFor=xp=>xp>=210?3:xp>=80?2:1;
  function accountInfo(){
    try{
      const user=JSON.parse(localStorage.getItem('educaRememberedUser')||'null');
      const phone=String(user?.phone||'').replace(/\D/g,'');
      if(/^\d{10,11}$/.test(phone))return {key:STORE+':account:'+phone,registered:true,token:/^[a-f0-9]{64}$/.test(user?.levelToken||'')?user.levelToken:''};
    }catch(_){}
    return {key:STORE+':guest',registered:false,token:''};
  }
  function restore(key){
    try{
      const d=JSON.parse(localStorage.getItem(key)||'{}');
      const pending=Array.isArray(d.pending)?d.pending.filter(e=>/^[a-zA-Z0-9_-]{12,80}$/.test(e?.eventId||'')&&['safe','risk'].includes(e?.outcome)):[];
      const confirmed=clamp(d.confirmed??d.xp);
      return {xp:clamp(d.xp),confirmed,pending,synced:false,authRequired:false};
    }catch(_){return {xp:0,confirmed:0,pending:[],synced:false,authRequired:false};}
  }
  let account=accountInfo(),model=restore(account.key);
  let dialog=null, focusBefore=null;
  const syncing=new Set();
  function persist(target=model,key=account.key){
    try{localStorage.setItem(key,JSON.stringify({xp:target.xp,confirmed:target.confirmed,pending:target.pending}));}catch(_){}
  }
  function recalculate(target){
    target.xp=target.pending.reduce((xp,e)=>clamp(xp+(e.outcome==='safe'?20:-15)),target.confirmed);
  }
  function refreshAccount(){
    const next=accountInfo(),changed=next.key!==account.key,tokenChanged=next.token!==account.token;
    if(changed){account=next;model=restore(next.key);closeDialog();updateBadge();}
    else if(tokenChanged){account=next;model.synced=false;model.authRequired=false;}
    return changed||tokenChanged;
  }
  async function sync(){
    refreshAccount();
    const target=model,identity=account;
    if(!identity.registered||!identity.token||typeof window.fetch!=='function'||syncing.has(target))return;
    syncing.add(target);
    const headers={Authorization:'Bearer '+identity.token,'Content-Type':'application/json'};
    try{
      const get=await window.fetch('/api/modo-livre/nivel',{headers,cache:'no-store'});
      if(get.status===401){target.authRequired=true;throw Error('Sessão expirada');}
      if(!get.ok)throw Error('Nível indisponível');
      target.authRequired=false;
      const data=await get.json();if(!data.ok||!Number.isFinite(Number(data.xp)))throw Error('Resposta inválida');
      target.confirmed=clamp(data.xp);recalculate(target);persist(target,identity.key);
      while(target.pending.length&&model===target&&account.token===identity.token){
        const item=target.pending[0];
        const res=await window.fetch('/api/modo-livre/nivel',{method:'POST',headers,body:JSON.stringify(item),cache:'no-store'});
        if(res.status===401){target.authRequired=true;throw Error('Sessão expirada');}
        if(!res.ok)throw Error('Nível indisponível');
        const result=await res.json();if(!result.ok||!Number.isFinite(Number(result.xp)))throw Error('Resposta inválida');
        target.confirmed=clamp(result.xp);target.pending=target.pending.filter(e=>e.eventId!==item.eventId);
        recalculate(target);persist(target,identity.key);
      }
      target.synced=target.pending.length===0;
    }catch(_){target.synced=false;persist(target,identity.key);}
    finally{syncing.delete(target);if(model===target)updateBadge();}
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
  function credit(delta){
    refreshAccount();
    const previous=snapshot(),old=model.xp;
    if(account.registered){
      const eventId=window.crypto?.randomUUID?.()||('event-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
      model.pending.push({eventId,outcome:delta>0?'safe':'risk'});
      model.synced=false;recalculate(model);
    }else{model.xp=clamp(old+delta);model.confirmed=model.xp;}
    persist();
    updateBadge();
    if(account.registered)void sync();
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
    refreshAccount();void sync();
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
    sheet.append(element('p','ed-modo-info','Somente decisões tomadas no Modo Livre mudam seu nível.'));
    sheet.append(element('p','ed-modo-info','Decisão segura: +20 XP. Decisão arriscada: −15 XP. Erros da IA ou da conexão não retiram pontos.'));
    sheet.append(element('p','ed-modo-footnote',!account.registered?'Progresso de visitante neste navegador.':model.synced?'Nível sincronizado com sua conta.':account.token&&!model.authRequired?'Nível salvo nesta conta; sincronização pendente.':'Nível salvo nesta conta neste aparelho. Entre novamente para ativar a sincronização.'));
    if(account.registered&&(!account.token||model.authRequired)){
      const renew=element('button','ed-modo-close-session','Entrar novamente para sincronizar');
      renew.type='button';
      renew.addEventListener('click',()=>{closeDialog();void window.EducaFreeView?.reauthenticateLevel?.();});
      sheet.append(renew);
    }
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
  let resultHandled=false;
  function evaluateSummary(){
    if(phone.dataset.currentView!=='free-summary'){
      resultHandled=false;
      return;
    }
    if(resultHandled||!phone.classList.contains('free-active'))return;
    const scenario=window.EducaFreeMode?.videoState?.();
    if(!SCAM_IDS.has(scenario))return;
    const title=document.getElementById('freeSummaryTitle')?.textContent?.trim();
    if(!['Situação concluída','Atenção à decisão','Você perdeu 15 pontos'].includes(title))return;
    resultHandled=true; // Exatamente uma pontuação por finalização real da conversa.
    const safe=title==='Situação concluída';
    showResult(credit(safe?20:-15));
  }
  if(typeof MutationObserver==='function'){
    new MutationObserver(evaluateSummary).observe(phone,{attributes:true,attributeFilter:['data-current-view','class']});
  }
  updateBadge();
  const accountChanged=()=>{refreshAccount();void sync();};
  window.addEventListener?.('educa:account-change',accountChanged);
  window.addEventListener?.('storage',e=>{if(e.key==='educaRememberedUser')accountChanged();});
  window.addEventListener?.('online',accountChanged);
  window.addEventListener?.('focus',accountChanged);
  if(account.registered)void sync();
  window.EducaWebGamification=Object.freeze({version:'11263',getSnapshot:()=>{refreshAccount();return snapshot();}});
})();