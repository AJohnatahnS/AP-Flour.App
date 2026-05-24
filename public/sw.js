self.__AP_FLOUR_CACHE_VERSION__ = "ap-flour-v1";

const appShellUrls = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(self.__AP_FLOUR_CACHE_VERSION__)
      .then((cache) => cache.addAll(appShellUrls)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== self.__AP_FLOUR_CACHE_VERSION__)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();

          caches
            .open(self.__AP_FLOUR_CACHE_VERSION__)
            .then((cache) => cache.put("/", responseToCache));

          return response;
        })
        .catch(() => caches.match("/")),
    );

    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        const responseToCache = response.clone();

        caches
          .open(self.__AP_FLOUR_CACHE_VERSION__)
          .then((cache) => cache.put(event.request, responseToCache));

        return response;
      });
    }),
  );
});
