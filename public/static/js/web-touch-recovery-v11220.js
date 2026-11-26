/* Educa+ Digital V112.20 — recuperacao segura de toque perdido no celular simulado WEB.
   Alguns navegadores touch podem entregar pointerdown/up sem gerar click
   após scroll, troca rápida de tela ou camadas do sistema. Não executa
   nenhuma ação real, não acessa dados e não altera canais nativos. */
(()=>{
 'use strict';
 if(document.documentElement.dataset.educaPlatform!=='web')return;
 const phone=document.querySelector('#phoneScreen');
 if(!phone)return;
 let gesture=null;
 const eligible=t=>{
  const el=t instanceof Element?t.closest('button,[role="button"]'):null;
  if(!el||!phone.contains(el)||el.disabled||el.getAttribute('aria-disabled')==='true')return null;
  if(el.closest('[hidden],.android-view:not(.is-active)'))return null;
  return el;
 };
 const clear=()=>{gesture=null;};
 phone.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||!e.isPrimary)return;
  const el=eligible(e.target);
  if(!el){clear();return;}
  gesture={el,id:e.pointerId,x:e.clientX,y:e.clientY,
   view:phone.dataset.currentView||'',clicked:false,fallback:false};
 },{capture:true,passive:true});
 // O clique verdadeiro tem prioridade: nao criamos eventos duplicados.
 phone.addEventListener('click',e=>{
  const g=gesture;
  if(!g||!(e.target===g.el||g.el.contains(e.target)))return;
  if(g.fallback&&e.isTrusted){
   // Caso rarissimo: Safari emitiu click depois do fallback; uma so decisao.
   e.preventDefault();e.stopImmediatePropagation();
   return;
  }
  g.clicked=true;
 },true);
 // Um gesto de arrastar nunca vira clique recuperado, mesmo se voltar ao ponto inicial.
 phone.addEventListener('pointermove',e=>{
  const g=gesture;
  if(g&&e.pointerId===g.id&&Math.hypot(e.clientX-g.x,e.clientY-g.y)>10)clear();
 },{capture:true,passive:true});
 phone.addEventListener('scroll',clear,{capture:true,passive:true});
 phone.addEventListener('pointerup',e=>{
  const g=gesture;
  if(!g||e.pointerType!=='touch'||e.pointerId!==g.id)return;
  if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>14){clear();return;}
  if(eligible(e.target)!==g.el){clear();return;}
  // Espera a geracao normal do click. Em navegadores com o gesto perdido
  // usa apenas UMA recuperacao tardia; nao intercepta pointer ou scrolling.
  setTimeout(()=>{
   if(gesture!==g||g.clicked||g.fallback||phone.dataset.currentView!==g.view
      ||eligible(g.el)!==g.el)return;
   const rect=g.el.getBoundingClientRect();
   if(rect.width<4||rect.height<4)return;
   const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
   if(x<0||y<0||x>innerWidth||y>innerHeight)return;
   const hit=document.elementFromPoint(x,y);
   if(hit!==g.el&&!g.el.contains(hit))return;
   g.fallback=true;
   g.el.click();
   g.clicked=true;
   setTimeout(()=>{if(gesture===g)clear();},550);
  },370);
 },{capture:true,passive:true});
 phone.addEventListener('pointercancel',clear,{capture:true,passive:true});
 window.addEventListener('blur',clear);
})();
