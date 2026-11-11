/* V110.3: cache de frontend atualizado. Não guarda respostas de APIs ou dados privados. */
// V111.47: educa-cf11147-phone-only-responsive-a11y (cache anterior).
// Preserva a trilha da V111.55 (educa-cf11155-bank-spotlight).
const CACHE = 'educa-cf11156-lia-voice-viewport';
const SHELL = ['/', '/static/css/app.css', '/static/css/accessibility.css', '/static/css/responsive-v11147.css', '/static/css/responsive-v11148.css', '/static/css/responsive-v11149.css', '/static/css/fullscreen-v11150.css', '/static/css/phone-entry-v11151.css', '/static/css/responsive-v11154.css', '/static/css/lia-call-v11156.css', '/static/js/accessibility.js', '/static/js/accessibility-external.js', '/static/css/onboarding.css', '/static/js/onboarding.js', '/static/css/android-system.css', '/static/js/training.js', '/static/js/android-system.js', '/static/js/free-mode.js', '/static/css/free-mode.css', '/static/css/web-real.css', '/static/js/web-real.js', '/static/img/logo.png', '/static/js/free-video.js', '/static/js/lia-kokoro-browser.js', '/static/js/lia-kokoro-worker.js', '/static/js/lia-female-voice.js', '/static/css/lia-female-voice.css', '/static/css/lia-fotorreal.css', '/static/img/lia-lovable-poster.jpg', '/static/css/free-video.css', '/lia-ao-vivo.html', '/static/js/lia-ao-vivo.js'];
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
  const isShell = event.request.mode === 'navigate' || url.pathname.startsWith('/static/');
  if (!isShell) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
    }
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === 'navigate' ? caches.match('/') : Response.error())));
});
