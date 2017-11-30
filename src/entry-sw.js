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
  showNotification(payload).catch(e => console.error(e))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action) {
    openUrl(event.action)
  } else {
    openUrl(event.notification.data.url)
  }
})

self.addEventListener('fetch', async event => {
  const path = new URL(event.request.url).pathname
  if (path.startsWith('/forward/')) {
    const redirectUrl = decodeURIComponent(/^\/forward\/(.*)$/.exec(path)[1])
    event.respondWith(
      new Response('', {
        status: 301,
        headers: { location: encodeURI(redirectUrl) }
      })
    )
    return
  }

  if (event.preloadResponse) {
    const res = await event.preloadResponse
    if (res) return event.respondWith(res)
  }
})
