/* V111.60 — comportamento específico de Android. */
(() => {
  if(document.documentElement.dataset.educaPlatform !== 'android') return;
  window.EducaAndroidChannel = Object.freeze({name:'android'});
})();
