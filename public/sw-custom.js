const CACHE_NAME = 'kasirin-v1'

const STATIC_ASSETS = [
    '/kasir',
    '/kasir/history',
    '/offline',
    '/manifest.json',
]

// Install — cache halaman utama
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate — hapus cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    )
    self.clients.claim()
})

// Fetch — NetworkFirst untuk API, CacheFirst untuk aset
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET
    if (request.method !== 'GET') return

    // Skip chrome-extension
    if (url.protocol === 'chrome-extension:') return

    // Supabase API — StaleWhileRevalidate
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(request)
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response.ok) cache.put(request, response.clone())
                        return response
                    })
                    .catch(() => cached)

                return cached || fetchPromise
            })
        )
        return
    }

    // Halaman & aset — NetworkFirst dengan fallback cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                }
                return response
            })
            .catch(async () => {
                const cached = await caches.match(request)
                if (cached) return cached

                // Fallback ke halaman offline
                if (request.destination === 'document') {
                    return caches.match('/offline')
                }
            })
    )
})