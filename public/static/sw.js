/* V110.3: cache de frontend atualizado. Não guarda respostas de APIs ou dados privados. */
// V111.47: educa-cf11147-phone-only-responsive-a11y (cache anterior).
// Cache anterior: educa-cf11156-lia-voice-viewport.
// Preserva a trilha da V111.55 (educa-cf11155-bank-spotlight).
// V111.57: modelo de conversa Gemma 4 e prosódia Kokoro revisada.
const CACHE = 'educa-cf11223-lia-stable-navigation-v11243';
const SHELL = ['/', '/?app=1', '/static/manifest.webmanifest', '/static/css/app.css', '/static/css/home-responsive-v11238.css', '/static/js/home-responsive-v11238.js', '/static/css/learning-cards-v11236.css', '/static/css/accessibility.css', '/static/css/responsive-v11147.css', '/static/css/responsive-v11148.css', '/static/css/responsive-v11149.css', '/static/css/fullscreen-v11150.css', '/static/css/phone-entry-v11151.css', '/static/css/responsive-v11154.css', '/static/css/responsive-v11172.css', '/static/css/responsive-v11173.css', '/static/css/responsive-v11174.css', '/static/css/responsive-v11175.css', '/static/css/lia-call-v11156.css', '/static/css/mobile-app-v11158.css', '/static/js/accessibility.js', '/static/js/accessibility-external.js', '/static/css/onboarding.css', '/static/js/onboarding.js', '/static/css/android-system.css', '/static/js/training.js', '/static/js/android-system.js', '/static/js/mobile-app-v11158.js', '/static/js/platform-channel-v11160.js', '/static/release-channels.json', '/static/channels/web/overrides.css', '/static/channels/web/overrides.js', '/static/channels/android/overrides.css', '/static/channels/android/overrides.js', '/static/channels/ios/overrides.css', '/static/channels/ios/overrides.js', '/static/js/free-mode.js', '/static/css/free-mode.css', '/static/css/web-real.css', '/static/js/web-real.js', '/static/img/logo.png', '/static/js/free-video.js', '/static/js/lia-kokoro-browser.js', '/static/js/lia-kokoro-worker.js', '/static/js/lia-female-voice.js', '/static/css/lia-female-voice.css', '/static/css/lia-fotorreal.css', '/static/img/lia-lovable-poster.jpg', '/static/css/free-video.css', '/static/css/lia-zoom-v11230.css', '/lia-ao-vivo.html', '/static/js/lia-ao-vivo.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(names => Promise.all(names
      .filter(name => name.startsWith('educa-') && name !== CACHE)
      .map(name => caches.delete(name)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Nunca armazenar respostas de conta, código ou dados personalizados.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  // Não colocar clipes de voz/vídeo no CacheStorage nem duplicar mídia em
  // memória. As respostas Range/áudio continuam sob controle do navegador.
  if (event.request.headers.has('Range') || ['video','audio'].includes(event.request.destination) ||
      url.pathname.startsWith('/static/videos/') || url.pathname.startsWith('/static/audio/')) return;
  const isShell = event.request.mode === 'navigate' ||
    (url.pathname.startsWith('/static/') &&
     ['script','style','image','font','worker',''].includes(event.request.destination));
  if (!isShell) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && response.status === 200) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
    }
    return response;
  }).catch(async () => {
    const cached=await caches.match(event.request);
    // Nunca substituir /html/ ou uma atividade pela Home '/' em silêncio:
    // isso parecia um F5 e perdia o contexto da LIA quando a rede oscilava.
    return cached || Response.error();
  }));
});
