/* V112.15 — somente Web. No iPhone Safari, o mockup pode ser mais alto que
 * a área visível do navegador; traga a composição à vista sem alterar o app nativo.
 */
(()=>{
'use strict';
if(document.documentElement.dataset.educaPlatform!=='web')return;
const phone=document.getElementById('phoneScreen');
const compose=document.getElementById('freeOriginalComposer');
const input=document.getElementById('freeOriginalInput');
const wallpaper=document.getElementById('chatWallpaper');
if(!phone||!compose||!input||!wallpaper)return;
const isPhotoChat=()=>matchMedia('(max-width:640px)').matches &&
 !document.fullscreenElement&&!document.documentElement.classList.contains('educa-fullscreen-active') &&
 phone.classList.contains('free-active') && phone.dataset.currentView==='chat' &&
 window.EducaFreeMode?.currentScenario?.()==='family-photo';
function ensureVisible(){
 if(!isPhotoChat()||compose.hidden)return;
 const rect=compose.getBoundingClientRect();
 const viewport=window.visualViewport;
 const viewBottom=(viewport?viewport.offsetTop+viewport.height:window.innerHeight)-12;
 if(rect.bottom>viewBottom) {
  window.scrollBy({top:Math.ceil(rect.bottom-viewBottom+12),behavior:'instant'});
 }
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(ensureVisible));}
new MutationObserver(()=>{
 if(isPhotoChat()){
  // O scroll interno mostra a mensagem recente; o scroll externo revela o campo.
  wallpaper.scrollTop=wallpaper.scrollHeight;
  schedule();
 }
}).observe(phone,{attributes:true,attributeFilter:['data-current-view']});
input.addEventListener('focus',()=>{
 schedule();
 setTimeout(ensureVisible,140);
});
window.visualViewport?.addEventListener('resize',()=>{
 if(document.activeElement===input)schedule();
});
window.visualViewport?.addEventListener('scroll',()=>{
 if(document.activeElement===input)schedule();
});
window.EducaWebPhotoScroll=Object.freeze({ensureVisible});
})();