/* V111.60 — comportamento específico do iPhone. */
(() => {
  if(document.documentElement.dataset.educaPlatform !== 'ios') return;
  window.EducaIOSChannel = Object.freeze({name:'ios'});
})();
