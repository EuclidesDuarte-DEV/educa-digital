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
  // A paridade traz todos os estilos e interações Web, mantendo o canal físico do app.
  const nativeOrInstalled = installed || androidNative ||
    (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) ||
    navigator.standalone === true;
  const mobileParity = q.get('experience') === 'web' &&
    (['android','ios'].includes(requested) || nativeOrInstalled);
  const appleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const androidDevice = /Android/i.test(navigator.userAgent);
  let platform = 'web';
  // Parâmetro explícito só seleciona a interface; nunca altera permissões.
  if (installed || mobileParity) {
    if (androidNative) platform = 'android';
    else if (['android','ios'].includes(requested)) platform = requested;
    else if (appleDevice) platform = 'ios';
    else if (androidDevice) platform = 'android';
  }
  const renderPlatform = mobileParity ? 'web' : platform;
  document.documentElement.dataset.educaPlatform = renderPlatform;
  if (mobileParity) {
    document.documentElement.dataset.educaNativePlatform = platform;
    document.documentElement.classList.add('educa-mobile-web-parity');
  }
  document.documentElement.classList.add('educa-platform-' + platform);
  if (platform !== 'web' && /EducaNative(?:Android|IOS)\/1\.1\b/.test(navigator.userAgent)) {
    document.documentElement.classList.add('educa-native-insets');
  }
  // A sincronização é COMPLETA: incluir CSS/JS do canal Web (ícones,
  // acessibilidade, trilhas, feedback, diálogo, gamificação e eventos livres)
  // além das folhas Web já carregadas no HTML. Não altera permissões nativas.
  if (mobileParity && platform !== 'web') {
    const webSheet = document.createElement('link');
    webSheet.rel = 'stylesheet';
    webSheet.href = '/static/channels/web/overrides.css?v=11190&fix=11208&touch=11255';
    document.head.appendChild(webSheet);
    const webScript = document.createElement('script');
    webScript.src = '/static/channels/web/overrides.js?v=11190&fix=11212';
    webScript.defer = true;
    document.head.appendChild(webScript);
  }
  const base = '/static/channels/' + platform + '/';
  const version = platform === 'web' ? '11190' : '11222';
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = base + 'overrides.css?v=' + version + (platform === 'web' ? '&fix=11208&touch=11255' : '');
  document.head.appendChild(sheet);
  const script = document.createElement('script');
  script.src = base + 'overrides.js?v=' + version + (platform === 'web' ? '&fix=11212' : '');
  script.defer = true;
  document.head.appendChild(script);
  window.EducaReleaseChannel = Object.freeze({
    platform,
    renderPlatform,
    sharedVersion: '11222',
    versionUrl: '/static/release-channels.json',
    // Esta URL apenas mostra versões; nunca grava no banco ou instala binários.
    info: () => fetch('/static/release-channels.json', {cache:'no-store'})
      .then(res => { if (!res.ok) throw Error('Versões indisponíveis'); return res.json(); })
  });
})();
