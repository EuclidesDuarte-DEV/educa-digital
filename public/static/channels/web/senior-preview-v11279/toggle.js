(() => {
  const style=document.getElementById('seniorPreviewStyles');
  const button=document.getElementById('seniorPreviewToggle');
  if(!style||!button)return;
  button.addEventListener('click',()=>{
    style.disabled=!style.disabled;
    button.setAttribute('aria-pressed',String(!style.disabled));
    button.textContent=style.disabled?'Testar visual ampliado':'Voltar ao visual anterior';
  });
})();
