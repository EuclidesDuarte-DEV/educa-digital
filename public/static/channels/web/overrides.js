/* V111.60 — comportamento exclusivo da Web.
 * Não modificar recursos compartilhados em mudanças marcadas [web]. */
(() => {
  if(document.documentElement.dataset.educaPlatform !== 'web') return;
  window.EducaWebChannel = Object.freeze({name:'web'});
})();
