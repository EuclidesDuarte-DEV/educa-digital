/* V111.84 — SOMENTE WEB | Modo Livre com novos contatos recorrentes.
   Usa exclusivamente o agendador/roteiro do motor atual; não cria telas,
   transações, notificações nativas, gravações nem serviços externos.
   Evita interromper pessoas que estão lendo, conversando ou em chamada. */
(()=>{
  'use strict';
  if(document.documentElement?.dataset?.educaPlatform!=='web')return;
  const phone=document.getElementById('phoneScreen');
  const notice=document.getElementById('freeEventNotice');
  if(!phone||!notice)return;

  const IDLE_MS=24000;
  const TICK_MS=5000;
  let lastArrival=Date.now();
  let lastActive=false;
  let eventCount=0;
  const active=()=>Boolean(window.EducaFreeMode?.isActive?.())&&phone.classList.contains('free-active');
  function observeArrival(){
    if(!notice.hidden){
      lastArrival=Date.now();
      eventCount+=1;
    }
  }
  if(typeof MutationObserver==='function'){
    new MutationObserver(observeArrival).observe(notice,{attributes:true,attributeFilter:['hidden']});
    new MutationObserver(()=>{
      const running=active();
      if(running!==lastActive){
        lastActive=running;
        lastArrival=Date.now();
      }
    }).observe(phone,{attributes:true,attributeFilter:['class']});
  }
  function tick(){
    const running=active();
    if(running!==lastActive){
      lastActive=running;
      lastArrival=Date.now();
    }
    if(!running||document.hidden||!notice.hidden)return;
    const view=phone.dataset.currentView;
    if(!['home','whatsapp'].includes(view))return;
    // Nunca empilhar alertas enquanto um painel, ligação, videochamada,
    // chat, SMS, exercício ou encerramento estiver aberto.
    if(phone.querySelector?.('.ed-modo-dialog'))return;
    if(Date.now()-lastArrival<IDLE_MS)return;
    lastArrival=Date.now();
    window.EducaFreeMode?.triggerEvent?.();
  }
  const interval=setInterval(tick,TICK_MS);
  window.addEventListener?.('pagehide',()=>clearInterval(interval),{once:true});
  // Diagnóstico sem expor o estado interno da pessoa.
  window.EducaWebEvents=Object.freeze({version:'11184',getEventCount:()=>eventCount});
})();
