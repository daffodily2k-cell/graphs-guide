/* Bump VERSION on every release: the new worker installs quietly, then the app offers an "Update" button. */
const VERSION = 'v1.0.0', CACHE = 'graph-guide-' + VERSION;
const FILES = ['./', 'index.html', 'styles.css', 'parser.js', 'analyze.js', 'guide.js', 'history.js', 'graph.js', 'pwa.js', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'libs/math.min.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(new Request(f, { cache: 'reload' })))))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('graph-guide-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
