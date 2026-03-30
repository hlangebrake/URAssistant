const CACHE_NAME = "unterrichtsassistent-allinone-v3";
const APP_SHELL_URL = "./index.html";
const PRECACHE_URLS = [
  APP_SHELL_URL,
  "./service-worker.js",
  "./manifest.webmanifest",
  "./icon.png",
  "./apple-touch-icon.png",
  "./apple-touch-icon-167x167.png",
  "./apple-touch-icon-152x152.png"
];

function isNetworkFirstRequest(request) {
  const requestUrl = new URL(request.url);
  const pathName = String(requestUrl.pathname || "").toLowerCase();

  return request.mode === "navigate"
    || pathName.endsWith(".html")
    || pathName.endsWith(".js")
    || pathName.endsWith(".css");
}

function updateCache(cacheKey, request, response) {
  if (!response || !response.ok) {
    return Promise.resolve();
  }

  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.put(cacheKey, response.clone());
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }

          return Promise.resolve(false);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (request.method !== "GET" || !isSameOrigin) {
    return;
  }

  if (isNetworkFirstRequest(request)) {
    event.respondWith(
      fetch(request).then(function (response) {
        const cacheKey = request.mode === "navigate" ? APP_SHELL_URL : request;

        event.waitUntil(updateCache(cacheKey, request, response));

        return response;
      }).catch(function () {
        const cacheKey = request.mode === "navigate" ? APP_SHELL_URL : request;
        return caches.match(cacheKey, { ignoreSearch: true });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(function (response) {
        if (!response || !response.ok) {
          return response;
        }

        const responseClone = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then(function (cache) {
            return cache.put(request, responseClone);
          })
        );

        return response;
      });
    })
  );
});
