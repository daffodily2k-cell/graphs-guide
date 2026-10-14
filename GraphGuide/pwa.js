/* Install button + service worker with a user-controlled update banner. */
(function () {
  const $ = id => document.getElementById(id), top = $('topActions');
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  function bar(cls, text, label, onClick, onDismiss) {
    const d = document.createElement('div'); d.className = 'pbar ' + cls; d.setAttribute('role', 'status');
    const p = document.createElement('span'); p.textContent = text; d.appendChild(p);
    if (label) { const b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = label; b.onclick = () => { onClick(); d.remove(); }; d.appendChild(b); }
    const x = document.createElement('button'); x.type = 'button'; x.className = 'pbar-x'; x.textContent = '×'; x.setAttribute('aria-label', 'Dismiss'); x.onclick = () => { d.remove(); if (onDismiss) onDismiss(); }; d.appendChild(x);
    document.body.appendChild(d); return d;
  }

  // Install button (Chrome, Edge, Android) shown when the browser says the app can be installed
  let deferred = null; const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'install-btn'; btn.textContent = 'Install app'; btn.hidden = true; top.appendChild(btn);
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!standalone()) btn.hidden = false; });
  btn.addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; });
  addEventListener('appinstalled', () => { btn.hidden = true; });
  // iPhone/iPad Safari has no install event, so show the manual steps once
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && !standalone() && !store.get('gg_ios_hint')) bar('ios', 'Install: tap the Share button, then "Add to Home Screen".', '', null, () => store.set('gg_ios_hint', '1'));

  // Service worker + updates
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const hadController = !!navigator.serviceWorker.controller; let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadController || reloading) return; reloading = true; location.reload(); });
  navigator.serviceWorker.register('sw.js').then(reg => {
    const offer = w => bar('update', 'A new version is ready.', 'Update', () => w.postMessage({ type: 'SKIP_WAITING' }));
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); }); });
    setInterval(() => reg.update(), 3600000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update(); });
  }).catch(() => {});
})();
