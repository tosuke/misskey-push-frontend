import showNotification from '@/lib/sw/show-notification'
import openUrl from '@/lib/sw/open-url'

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  let promise
  if (self.registration.navigationPreload) {
    promise = self.registration.navigationPreload.enable()
  } else {
    promise = Promise.resolve()
  }
  event.waitUntil(Promise.all([promise, clients.claim()]))
})

self.addEventListener('push', event => {
  const payload = event.data.json()
  console.log('[PUSH]', payload)
  event.waitUntil(showNotification(payload))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action) {
    openUrl(event.action)
  } else {
    openUrl(event.notification.data.url)
  }
})

self.addEventListener('fetch', event =>
  event.waitUntil(
    (async () => {
      const path = new URL(event.request.url).pathname
      if (path.startsWith('/forward/')) {
        const redirectUrl = decodeURIComponent(
          /^\/forward\/(.*)$/.exec(path)[1]
        )
        event.respondWith(
          new Response('', {
            status: 301,
            headers: { location: encodeURI(redirectUrl) }
          })
        )
        return
      }

      if (event.preloadResponse) {
        event.respondWith(
          event.preloadResponse.then(res => {
            if (res) return res
            return fetch(event.request)
          })
        )
      }
    })()
  )
)
