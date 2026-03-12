const CACHE_NAME = "kreditor-v1";
// Only cache static assets that never change between deploys
const PRECACHE = ["/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return; // Never cache API routes

  // For Next.js hashed assets (_next/static/*), use cache-first
  // For HTML navigation requests, always go network-first to avoid stale HTML
  const isNavigation = e.request.mode === "navigate";
  const isNextStatic = e.request.url.includes("/_next/static/");

  if (isNavigation) {
    // Always fetch fresh HTML so CSS hashes are never stale
    e.respondWith(fetch(e.request).catch(() => caches.match("/")));
    return;
  }

  e.respondWith(
    caches
      .match(e.request)
      .then((cached) => {
        if (cached && isNextStatic) return cached;
        return fetch(e.request).then((response) => {
          if (isNextStatic && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, response.clone()));
          }
          return response;
        });
      })
  );
});
