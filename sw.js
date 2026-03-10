// Fear & Loathing Trail v19 — Service Worker
const CACHE = 'flt-v19-cache-v1';
const ASSETS = ['./index.html', './manifest.json'];

async function generateIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.22;
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(size-r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size-r);
  ctx.quadraticCurveTo(size, size, size-r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size-r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'white'; ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(size*0.22, size*0.52);
  ctx.lineTo(size*0.44, size*0.72);
  ctx.lineTo(size*0.78, size*0.30);
  ctx.stroke();
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new Response(blob, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' } });
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(err => console.warn('[SW]', err)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const { pathname } = new URL(e.request.url);
  if (pathname.endsWith('icon-192.png')) { e.respondWith(generateIcon(192)); return; }
  if (pathname.endsWith('icon-512.png')) { e.respondWith(generateIcon(512)); return; }
  if (e.request.url.includes('peerjs.com') || e.request.url.includes('unpkg.com')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
