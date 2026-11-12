/* V111.58: impedir regras legadas do mockup de forçarem bordas e largura
 * fixa no app instalado. No site web convencional não faz nada. */
(() => {
  if (!document.documentElement.classList.contains('educa-mobile-app')) return;
  const observed = [];
  let scheduled = false;
  const rules = [
    ['.site-header', {display:'none'}],
    ['.hero-copy', {display:'none'}],
    ['.preview-badge.training-badge', {display:'none'}],
    ['.pretest-step-bar', {display:'none'}],
    ['.phone-tools', {display:'none'}],
    ['#fullscreenBtn', {display:'none'}],
    ['#focusExpandBtn', {display:'none'}],
    ['#exitFullscreen', {display:'none'}],
    ['.phone-hardware .hardware-button', {display:'none'}],
    ['body > main', {width:'100vw',height:'100dvh',margin:'0',padding:'0',overflow:'hidden'}],
    ['.hero-experience', {position:'fixed',inset:'0',top:'0',left:'0',width:'100vw',height:'100dvh',margin:'0',padding:'0',display:'block',overflow:'hidden'}],
    ['.phone-preview-wrap', {position:'fixed',inset:'0',top:'0',left:'0',width:'100vw',height:'100dvh',margin:'0',padding:'0',display:'block',overflow:'hidden'}],
    ['#phoneStage', {position:'fixed',inset:'0',top:'0',left:'0',width:'100vw',height:'100dvh',minHeight:'0',margin:'0',padding:'0',display:'block',overflow:'hidden',transform:'none'}],
    ['#phoneHardware', {position:'relative',inset:'auto',top:'auto',left:'auto',width:'100vw',minWidth:'0',maxWidth:'none',height:'100dvh',minHeight:'0',maxHeight:'none',aspectRatio:'auto',border:'0',borderRadius:'0',margin:'0',padding:'0',boxShadow:'none',transform:'none'}],
    ['#phoneScreen', {position:'relative',inset:'auto',top:'auto',left:'auto',width:'100vw',minWidth:'0',maxWidth:'none',height:'100dvh',minHeight:'0',maxHeight:'none',aspectRatio:'auto',border:'0',borderRadius:'0',margin:'0',padding:'0',boxShadow:'none',transform:'none',overflow:'hidden'}],
  ];
  function enforce(){
    scheduled=false;
    for(const [selector, props] of rules){
      for(const el of document.querySelectorAll(selector)){
        for(const [key,value] of Object.entries(props)){
          const cssKey=key.replace(/[A-Z]/g, x=>'-'+x.toLowerCase());
          if(el.style.getPropertyValue(cssKey)!==value||el.style.getPropertyPriority(cssKey)!=='important'){
            el.style.setProperty(cssKey,value,'important');
          }
        }
      }
    }
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(enforce);
  }
  function boot(){
    enforce();
    const selectors=rules.map(([s])=>s).join(',');
    for(const el of document.querySelectorAll(selectors)){
      observed.push(el);
    }
    const observer=new MutationObserver(schedule);
    for(const el of observed)observer.observe(el,{attributes:true,attributeFilter:['style']});
    window.addEventListener('resize',schedule,{passive:true});
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
    setTimeout(schedule,450);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
