/* V102: cache atualizado após publicação (somente interface pública e recursos locais). */
const CACHE = 'educa-cf102-static-v1';
const SHELL = ['/', '/static/css/app.css', '/static/js/training.js', '/static/img/logo.png'];
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
