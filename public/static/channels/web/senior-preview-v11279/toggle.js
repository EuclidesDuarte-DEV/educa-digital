(() => {
  const root=document.documentElement;
  const style=document.getElementById('seniorPreviewStyles');
  const button=document.getElementById('seniorPreviewToggle');
  if(!style||!button)return;
  if(root.dataset.educaPlatform!=='web'||root.classList.contains('educa-mobile-app')||root.classList.contains('educa-mobile-web-parity')){
    style.disabled=true;button.hidden=true;button.style.display='none';return;
  }
  button.hidden=false;button.style.removeProperty('display');
  const key='educaWebSeniorVisualV11280';
  let previous=false;
  try{previous=localStorage.getItem(key)==='original';}catch(_){}
  function apply(original){
    style.disabled=original;
    button.setAttribute('aria-pressed',String(!original));
    button.textContent=original?'Testar visual ampliado':'Voltar ao visual anterior';
  }
  apply(previous);
  button.addEventListener('click',()=>{
    const original=!style.disabled;
    apply(original);
    try{localStorage.setItem(key,original?'original':'ampliado');}catch(_){}
  });
  const content=document.querySelector('#freeIntroView .free-intro-content');
  if(content){content.tabIndex=0;content.setAttribute('role','region');content.setAttribute('aria-label','História do Modo Livre');}
  const code=document.getElementById('returnCode'), message=document.getElementById('returnCodeMessage');
  if(code&&message){code.setAttribute('aria-describedby',message.id);message.setAttribute('role','alert');}
})();
