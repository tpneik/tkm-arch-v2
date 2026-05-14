/* ─────────────────────────────────────────────────
   Service Worker — Image Cache (stale-while-revalidate)
   
   Strategy:
   • Image requests → stale-while-revalidate
     1. Return cached version instantly (if available)
     2. ALWAYS fetch fresh from network in background
     3. Update cache with the new response
     → Next page load shows the updated image
   • All other requests → pass through to network (let Next.js handle)
   
   Cache: "tkm-image-cache-v1"
   ───────────────────────────────────────────────── */

const CACHE_NAME = "tkm-image-cache-v1";

/** @param {string} url */
function isImageRequest(url) {
  // Match Next.js optimized images (/_next/image?url=...)
  if (url.includes("/_next/image")) {
    return true;
  }
  // Match common image extensions
  if (/\.(jpe?g|png|gif|webp|avif|svg|ico|bmp|tiff?)(\?.*)?$/i.test(url)) {
    return true;
  }
  // Match known CDN hosts (R2, Unsplash)
  if (
    url.includes("r2.dev") ||
    url.includes("unsplash.com") ||
    url.includes("googleusercontent.com")
  ) {
    return true;
  }
  return false;
}

/* ── Install ── */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("tkm-image-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
    })()
  );
});

/* ── Fetch — stale-while-revalidate for images ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isImageRequest(request.url)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      // Always revalidate in background (whether cached or not)
      const networkPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            // Update cache with fresh response
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null); // Swallow network errors

      if (cached) {
        // Return cache immediately, refresh happens in background
        event.waitUntil(networkPromise);
        return cached;
      }

      // No cache — must wait for network
      const networkResponse = await networkPromise;
      if (networkResponse) return networkResponse;

      // Offline + no cache → transparent pixel fallback
      return new Response(
        new Uint8Array([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80,
          0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04,
          0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01,
          0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
        ]),
        { headers: { "Content-Type": "image/gif" } }
      );
    })()
  );
});
