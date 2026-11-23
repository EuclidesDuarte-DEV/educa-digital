/* Educa+ V112.22 — iOS: sem o antigo botao flutuante de protecao de chamadas.
   A tela de treinamento nao intercepta chamadas reais.
   O Call Directory nativo permanece opcional, habilitado manualmente no sistema. */
(() => {
  'use strict';
  const root=document.documentElement;
  if(root.dataset.educaNativePlatform!=='ios' && root.dataset.educaPlatform!=='ios')return;
  window.EducaIOSChannel=Object.freeze({
    name:'ios',
    callScreening:'system-settings-only',
    callEventAccess:false,
    floatingCallProtection:false
  });
})();
