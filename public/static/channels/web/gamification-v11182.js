/* V111.82 — SOMENTE WEB: gamificação opcional e local do Modo Livre.
 * Não altera o motor compartilhado, IA, D1 ou canais Android/iOS.
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
  function restore(){
    try{
      const d=JSON.parse(localStorage.getItem(STORE)||'{}');
      return {xp:clamp(d.xp)};
    }catch(_){return {xp:0};}
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
  function credit(delta){
    const previous=snapshot(),old=model.xp;
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
    sheet.append(element('p','ed-modo-info','Somente decisões tomadas no Modo Livre mudam seu nível.'));
    sheet.append(element('p','ed-modo-info','Decisão segura: +20 XP. Decisão arriscada: −15 XP. Erros da IA ou da conexão não retiram pontos.'));
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
  window.EducaWebGamification=Object.freeze({version:'11183',getSnapshot:snapshot});
})();