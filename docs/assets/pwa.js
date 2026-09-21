/* Register BizLink PWA service worker */
(function () {
  if (!('serviceWorker' in navigator)) return;

  var swPath = '/bizlink/sw.js';
  // Support both GitHub Pages project URL and local / root
  var path = location.pathname;
  if (path.indexOf('/bizlink') === 0) {
    swPath = '/bizlink/sw.js';
  } else if (path.indexOf('/docs') === 0) {
    swPath = '/docs/sw.js';
  } else {
    // relative to current folder depth
    var depth = path.split('/').filter(Boolean).length;
    // if file is in a subfolder of docs, go up
    if (/\/(customer|dashboard|driver|auth)\//.test(path)) {
      swPath = '../sw.js';
    } else {
      swPath = 'sw.js';
    }
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swPath).then(function (reg) {
      console.log('[BizLink PWA] SW registered', reg.scope);
    }).catch(function (err) {
      // Fallback: try relative sw.js from site root docs
      navigator.serviceWorker.register('sw.js').catch(function () {
        console.warn('[BizLink PWA] SW registration failed', err);
      });
    });
  });

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    var btn = document.getElementById('pwa-install');
    if (btn) btn.hidden = false;
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.id !== 'pwa-install' || !deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      t.hidden = true;
    });
  });
})();
