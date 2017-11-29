const serverPublicKey =
  'BHAkPVB-yaCG7rGhjEseCXElpKE9LOSK2gkpV7-8qOCRHFqrm-caQ_v1pvSMDGp9Rhv1aBy4da6j36jLMQrJ1Cw'
const defaultTitle = 'title'

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

self.addEventListener('message', event => {
  switch (event.data) {
    case 'subscribe':
      event.waitUntil(subscribe())
      break
  }
})

self.addEventListener('push', event => {
  const payload = event.data.json()
  console.log(payload)
  return event.waitUntil(showNotification(payload))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action) {
    console.log('action', event.action)
    openURL(event.action)
  } else if (event.notification.data.url) {
    openURL(event.notification.data.url)
  }
})

self.addEventListener('pushsubscriptionchange', event => {
  console.log('subscription expired')
  const PushManager = self.registration.pushManager
  event.waitUntil(subscribe())
})

self.addEventListener('fetch', event => {
  const path = new URL(event.request.url).pathname
  if (path.startsWith('/forward/')) {
    const redirectUrl = decodeURIComponent(/^\/forward\/(.*)$/.exec(path)[1])
    event.respondWith(
      new Response('', {
        status: 301,
        headers: { location: encodeURI(redirectUrl) }
      })
    )
  }
})

function showNotification (payload) {
  const tag = `misskey-push-${Date.now()}`
  const notification = {
    tag,
    icon: `${payload.usr.avatar}?thumbnail`,
    ...(() => {
      switch (payload.typ) {
        case 'like':
          return {
            title: `liked by @${payload.usr.nameId}`,
            body: payload.post.text,
            data: {
              url: resolvePost(payload.post)
            }
          }
          break
        case 'repost':
          return {
            title: `reposted by @${payload.usr.nameId}`,
            body: payload.post.text,
            data: {
              url: resolvePost(payload.post)
            }
          }
          break
        case 'mention':
          return {
            title: `mentioned by @${payload.usr.nameId}`,
            body: payload.post.text,
            data: {
              url: `https://misskey.link/${payload.usr.nameId}/${
                payload.post.id
              }`
            }
          }
          break
        case 'follow':
          return {
            title: `followed by @${payload.usr.nameId}`,
            data: {
              url: `https://misskey.link/${payload.usr.nameId}`
            }
          }
          break
      }
    })()
  }

  const promise = self.registration.showNotification(
    notification.title,
    notification
  )
  if (payload.post && payload.post.files.length) {
    return resolveFile(payload.post.files[0]).then(file => {
      self.registration.showNotification(notification.title, {
        ...notification,
        image: file.url
      })
    })
  }

  if (payload.typ === 'follow') {
    return getUser(payload.usr.id).then(user => {
      console.log(user.account.comment)
      self.registration.showNotification(notification.title, {
        ...notification,
        body: user.account.comment
      })
    })
  }

  return promise
}

function resolveFile (id, size = null) {
  return fetch(`https://api.misskey.link/v1/files/${id}`)
    .then(r => r.json())
    .then(r => {
      const path = r.file.serverPath
      const mime = r.file.mimeType
      if (size) {
        return {
          url: `https://delta.contents.stream/${path}?size=${size}`,
          mime
        }
      } else {
        return {
          url: `https://delta.contents.stream/${r.file.serverPath}`,
          mime
        }
      }
    })
}

function getUser (id) {
  return fetch(`https://api.misskey.link/v1/accounts/${id}`).then(r => r.json())
}

function resolvePost (post) {
  return `https://misskey.link/${post.usr.nameId}/${post.id}`
}

function openURL (url) {
  clients.openWindow(`${location.origin}/forward/${encodeURIComponent(url)}`)
}

function subscribe () {
  return self.registration.pushManager.getSubscription().then(subscription => {
    if (!subscription) {
      return self.registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeBase64URL(serverPublicKey)
        })
        .then(subscription => {
          const endpoint = subscription.endpoint
          const p256dhKey = encodeBase64URL(subscription.getKey('p256dh'))
          const authKey = encodeBase64URL(subscription.getKey('auth'))
          const contentEncoding = (() => {
            if ('supportedContentEncodings' in PushManager) {
              return PushManager.supportedContentEncodings.includes('aes128gcm')
                ? 'aes128gcm'
                : 'aesgcm'
            } else {
              return 'aesgcm'
            }
          })()
          console.log({ endpoint, p256dhKey, authKey, contentEncoding })
        })
    } else {
      console.log('already subscribed')
      const endpoint = subscription.endpoint
      const p256dhKey = encodeBase64URL(subscription.getKey('p256dh'))
      const authKey = encodeBase64URL(subscription.getKey('auth'))
      const contentEncoding = (() => {
        if ('supportedContentEncodings' in PushManager) {
          return PushManager.supportedContentEncodings.includes('aes128gcm')
            ? 'aes128gcm'
            : 'aesgcm'
        } else {
          return 'aesgcm'
        }
      })()
      console.log({ endpoint, p256dhKey, authKey, contentEncoding })
    }
  })
}

function encodeBase64URL (buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function decodeBase64URL (base64url) {
  const padding = '='.repeat((4 - base64url.length % 4) % 4)
  const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw.split('').map(a => a.charCodeAt(0)))
}
