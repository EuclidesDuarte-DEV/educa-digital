/* V112.38 — medir somente a geometria externa, sem redimensionar o motor de treino. */
(() => {
 const root=document.documentElement;
 const header=document.querySelector('.home-simple-header');
 const preview=document.querySelector('#inicio .phone-preview-wrap');
 if(!header||!preview)return;
 const extras=[...preview.children].filter(e=>e.matches('.preview-badge,.pretest-step-bar,.phone-tools'));
 let pending=false;
 function measure(){
  pending=false;
  const visible=el=>el.getClientRects().length&&getComputedStyle(el).display!=='none';
  const set=(name,n)=>{const value=Math.ceil(n)+'px';if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value);};
  set('--home-header-height',header.getBoundingClientRect().height);
  set('--home-preview-extras',extras.filter(visible).reduce((n,e)=>{const s=getComputedStyle(e);return n+e.getBoundingClientRect().height+(parseFloat(s.marginTop)||0)+(parseFloat(s.marginBottom)||0)+6;},0));
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(measure);}}
 if(window.ResizeObserver){const o=new ResizeObserver(schedule);[header,...extras].forEach(e=>o.observe(e));}
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('educa:accessibility-change',schedule);
 measure();
})();
