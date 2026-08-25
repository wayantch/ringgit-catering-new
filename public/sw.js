const CACHE_NAME = 'ringgit-catering-static-v1';
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

self.addEventListener('install', () => {
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

    if (request.mode === 'navigate') {
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
