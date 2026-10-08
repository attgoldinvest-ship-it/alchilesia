// Service Worker de NiroAcademy — instalabilidad + offline básico + push real.
// Versión del caché subida a propósito — fuerza a los dispositivos ya
// instalados a tomar esta versión nueva del SW (y de este archivo) en su
// próxima apertura, en vez de seguir sirviendo una copia vieja cacheada.
const CACHE = "cc-v2";
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first para navegación (siempre la última versión si hay internet),
// cache-first para el resto (íconos, estáticos) — offline básico razonable.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((r) => r || caches.match(request)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok && new URL(request.url).origin === self.location.origin) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copia));
          }
          return res;
        })
    )
  );
});

// Push real: el payload lo manda quien envíe la notificación (ver
// src/lib/push.js) — { title, body, url }.
self.addEventListener("push", (event) => {
  let datos = { title: "NiroAcademy", body: "Tienes algo pendiente." };
  try {
    if (event.data) datos = { ...datos, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(datos.title, {
      body: datos.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: datos.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existente = clientsArr.find((c) => c.url.includes(self.location.origin));
      if (existente) return existente.focus();
      return self.clients.openWindow(url);
    })
  );
});
