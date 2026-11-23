/* V112.22 — Android usa o mesmo layout de treinamento da Web,
 * preservando APIs e permissões próprias ao aplicativo. */
(() => {
  const root=document.documentElement;
  if(root.dataset.educaNativePlatform!=='android' && root.dataset.educaPlatform!=='android') return;
  window.EducaAndroidChannel=Object.freeze({name:'android',visualParity:root.dataset.educaPlatform==='web'});
})();
