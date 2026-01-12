// Import Workbox from a CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);

  // Precache all the assets in the build folder.
  // The manifest is injected by the build process (e.g., Vite PWA plugin).
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache strategy for API calls (NetworkFirst)
  // This is for the ticket data, as specified in the E2E test.
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/rest/v1/bookings'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days, as per AC-26.1-1
        }),
      ],
    })
  );

  // Cache strategy for static assets (CacheFirst)
  // JS, CSS, images, fonts
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'static-assets-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Fallback for offline navigation if needed
  workbox.routing.setCatchHandler(({ event }) => {
    if (event.request.destination === 'document') {
      // You can return a specific offline fallback page here if you have one
      // return caches.match('/offline.html');
    }
    return Response.error();
  });

} else {
  console.log(`Workbox didn't load`);
}