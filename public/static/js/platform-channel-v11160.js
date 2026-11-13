/* V111.60 — separação explícita de canais sem dividir o backend.
 * Código compartilhado é servido pela Cloudflare a Web, Android e iOS.
 * Recursos específicos vivem apenas em /static/channels/<plataforma>/.
 */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  const installed = document.documentElement.classList.contains('educa-mobile-app');
  const requested = String(q.get('platform') || '').toLowerCase();
  const androidNative = navigator.userAgent.includes('EducaNativeAndroid/');
  const appleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const androidDevice = /Android/i.test(navigator.userAgent);
  let platform = 'web';
  // Parâmetro explícito só seleciona a interface; nunca altera permissões.
  if (installed) {
    if (androidNative) platform = 'android';
    else if (['android','ios'].includes(requested)) platform = requested;
    else if (appleDevice) platform = 'ios';
    else if (androidDevice) platform = 'android';
  }
  document.documentElement.dataset.educaPlatform = platform;
  document.documentElement.classList.add('educa-platform-' + platform);
  const base = '/static/channels/' + platform + '/';
  const version = '11160';
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = base + 'overrides.css?v=' + version;
  document.head.appendChild(sheet);
  const script = document.createElement('script');
  script.src = base + 'overrides.js?v=' + version;
  script.defer = true;
  document.head.appendChild(script);
  window.EducaReleaseChannel = Object.freeze({
    platform,
    sharedVersion: '11160',
    versionUrl: '/static/release-channels.json',
    // Esta URL apenas mostra versões; nunca grava no banco ou instala binários.
    info: () => fetch('/static/release-channels.json', {cache:'no-store'})
      .then(res => { if (!res.ok) throw Error('Versões indisponíveis'); return res.json(); })
  });
})();
