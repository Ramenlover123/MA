/* 間 Ma — Service Worker.
   Hält die App offline vorrätig. Speichert NUR die App-Dateien,
   niemals deine Einträge — die liegen weiter ausschließlich in
   localStorage und werden von diesem Skript nicht angefasst.

   Wenn du index.html änderst: die Zahl in CACHE unten hochzählen
   (v1 -> v2 ...). Dann holt sich das Handy beim nächsten Öffnen mit
   Internet die neue Version. */

const CACHE = 'ima-v16';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

// Beim Installieren: App-Dateien einsammeln.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Beim Aktivieren: alte Cache-Versionen wegräumen.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Beim Laden: erst Netz versuchen (frische Version), sonst aus dem Cache.
// So bekommst du online immer den neuesten Stand und offline trotzdem alles.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        // erfolgreiche Antwort in den Cache spiegeln
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || caches.match('./index.html'))
      )
  );
});
