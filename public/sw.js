const CACHE = 'fox-wolf-farm-v1'
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add('/'))
      .then(() => self.skipWaiting()),
  )
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (
    req.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/.netlify/')
  )
    return
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      if (req.mode === 'navigate') {
        try {
          const response = await fetch(req)
          if (response.ok) await cache.put('/', response.clone())
          return response
        } catch {
          return (
            (await cache.match('/')) ||
            new Response('请联网打开一次，以准备离线农场。', {
              status: 503,
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            })
          )
        }
      }
      const cached = await cache.match(req)
      if (cached) return cached
      try {
        const response = await fetch(req)
        if (response.ok) await cache.put(req, response.clone())
        return response
      } catch {
        return new Response('', { status: 503 })
      }
    })(),
  )
})
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_ASSETS' && Array.isArray(event.data.urls))
    event.waitUntil(
      caches.open(CACHE).then(async (cache) => {
        const urls = event.data.urls.filter(
          (url) =>
            typeof url === 'string' &&
            new URL(url, self.location.origin).origin === self.location.origin,
        )
        await Promise.allSettled(urls.map((url) => cache.add(url)))
      }),
    )
})
