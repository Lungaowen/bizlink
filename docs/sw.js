/* BizLink PWA service worker — caches app shell for offline use */
var CACHE = 'bizlink-v1';
var PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/styles.css',
  './assets/app.js',
  './assets/flow.js',
  './assets/store.js',
  './assets/users.js',
  './icons/icon.svg',
  './marketplace.html',
  './customer/index.html',
  './customer/checkout.html',
  './customer/track.html',
  './customer/orders.html',
  './dashboard/orders.html',
  './dashboard/deliveries.html',
  './driver/index.html',
  './driver/active.html',
  './auth/login.html',
  './auth/register.html'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE.map(function (url) {
        return new Request(url, { cache: 'reload' });
      })).catch(function () {
        // Ignore individual failures (missing optional pages)
        return Promise.all(
          PRECACHE.map(function (url) {
            return cache.add(url).catch(function () { return null; });
          })
        );
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.ok && req.url.indexOf(self.location.origin) === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        return cached || caches.match('./index.html');
      });
      return cached || network;
    })
  );
});
