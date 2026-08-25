const CACHE_NAME = 'ringgit-catering-static-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png'];
const STATIC_ASSET_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.svg',
    '.ico',
    '.avif',
    '.woff',
    '.woff2',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Jangan gagalkan install kalau salah satu aset belum tersedia.
            await Promise.allSettled(
                PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
            );
        })(),
    );

    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys();

            await Promise.all(
                cacheKeys
                    .filter((key) => key.startsWith('ringgit-catering-static-'))
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)),
            );

            await self.clients.claim();
        })(),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    // Navigasi selalu ambil dari jaringan supaya halaman ber-autentikasi tidak
    // pernah disajikan basi. Cache hanya dipakai sebagai jaring pengaman offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    return await fetch(request);
                } catch {
                    const cache = await caches.open(CACHE_NAME);
                    const offlinePage = await cache.match(OFFLINE_URL);

                    return (
                        offlinePage ??
                        new Response(
                            '<h1>Tidak ada koneksi</h1>',
                            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
                        )
                    );
                }
            })(),
        );

        return;
    }

    const shouldCache =
        request.destination === 'image' ||
        request.destination === 'font' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        STATIC_ASSET_EXTENSIONS.some((extension) =>
            url.pathname.endsWith(extension),
        ) ||
        url.pathname.startsWith('/storage/') ||
        url.pathname.startsWith('/images/');

    if (!shouldCache) {
        return;
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(request);
            const networkResponsePromise = fetch(request)
                .then((response) => {
                    if (response.ok) {
                        void cache.put(request, response.clone());
                    }

                    return response;
                })
                .catch(() => null);

            event.waitUntil(networkResponsePromise);

            if (cachedResponse) {
                return cachedResponse;
            }

            const networkResponse = await networkResponsePromise;

            if (networkResponse) {
                return networkResponse;
            }

            return new Response('', {
                status: 504,
                statusText: 'Gateway Timeout',
            });
        })(),
    );
});
