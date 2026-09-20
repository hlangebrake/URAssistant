// Bump this release when publishing changed app files. An update becomes active
// after all old app windows close, so one session never mixes two app releases.
const CACHE_PREFIX = "unterrichtsassistent-shell-";
const CACHE_NAME = CACHE_PREFIX + "20260920-workspace-5";
const SHELL_PAGES = ["./index.html", "./auth.html"];
const EXTRA_ASSETS = [
  "./manifest.webmanifest", "./icon.png", "./apple-touch-icon.png",
  "./apple-touch-icon-167x167.png", "./apple-touch-icon-152x152.png",
  "./src/data/kc-mathematik-sek-1-sek-2.json", "./src/data/kc-informatik-sek-2.json"
];

function canonicalUrl(value) {
  const url = new URL(value, self.registration.scope);
  url.search = "";
  url.hash = "";
  return url.href;
}

function referencedAssets(html) {
  const assets = [];
  const tags = String(html).match(/<(?:script|link)\b[^>]*>/gi) || [];
  tags.forEach(function (tag) {
    const match = tag.match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i);
    if (match) {
      const url = new URL(match[1], self.registration.scope);
      if (url.origin === self.location.origin) assets.push(url.href);
    }
  });
  return assets;
}

self.addEventListener("install", function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(CACHE_NAME);
    const assets = new Set(EXTRA_ASSETS.map(canonicalUrl));
    try {
      for (const page of SHELL_PAGES) {
        const response = await fetch(new Request(new URL(page, self.registration.scope), { cache: "reload" }));
        if (!response.ok) throw new Error("App-Seite nicht verfügbar: " + page);
        referencedAssets(await response.clone().text()).forEach(function (url) { assets.add(url); });
        await cache.put(canonicalUrl(page), response);
      }
      await Promise.all(Array.from(assets).map(async function (asset) {
        const response = await fetch(new Request(asset, { cache: "reload" }));
        if (!response.ok) throw new Error("App-Datei nicht verfügbar: " + asset);
        await cache.put(canonicalUrl(asset), response);
      }));
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  }()));
});

self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    const names = await caches.keys();
    await Promise.all(names.filter(function (name) {
      return name !== CACHE_NAME && (name.indexOf(CACHE_PREFIX) === 0 || name.indexOf("unterrichtsassistent-allinone-") === 0);
    }).map(function (name) { return caches.delete(name); }));
    await self.clients.claim();
  }()));
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith((async function () {
    const scopeUrl = new URL(self.registration.scope);
    const requestedUrl = url.pathname === scopeUrl.pathname ? canonicalUrl("./index.html") : canonicalUrl(url.href);
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(requestedUrl);
    // Auth remains auth even with ?mode=unlock. Never substitute index for auth.
    return cached || fetch(request);
  }()));
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "OFFLINE_STATUS" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ ready: true, version: CACHE_NAME });
  }
});
