/* BizLink PWA — mobile-friendly service worker + install */
(function () {
  function resolveSwUrl() {
    var path = location.pathname || '';
    // GitHub Pages project site: /bizlink/...
    if (path.indexOf('/bizlink/') === 0 || path === '/bizlink') {
      return '/bizlink/sw.js';
    }
    if (/\/(customer|dashboard|driver|auth)\//.test(path)) {
      return new URL('../sw.js', location.href).href;
    }
    return new URL('sw.js', location.href).href;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      var swUrl = resolveSwUrl();
      navigator.serviceWorker.register(swUrl).then(function (reg) {
        console.log('[BizLink PWA] registered', reg.scope);
      }).catch(function (err) {
        console.warn('[BizLink PWA] register failed', err);
      });
    });
  }

  // iOS: already in standalone?
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isStandalone) {
    document.documentElement.classList.add('pwa-standalone');
  }

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    var btn = document.getElementById('pwa-install');
    if (btn) btn.hidden = false;
  });

  document.addEventListener('click', function (e) {
    var t = e.target && (e.target.id === 'pwa-install' ? e.target : e.target.closest && e.target.closest('#pwa-install'));
    if (!t || !deferredPrompt) return;
    e.preventDefault();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      t.hidden = true;
    });
  });

  // Show iOS add-to-home tip if no beforeinstallprompt (Safari)
  window.addEventListener('load', function () {
    if (isStandalone) return;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS) return;
    var tip = document.getElementById('ios-install-tip');
    if (tip) tip.hidden = false;
  });
})();
