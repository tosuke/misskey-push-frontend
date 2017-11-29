import axios from 'axios'

export default async function subscribe (username, password) {
  const permissionState = await Notification.requestPermission()
  if (permissionState !== 'granted') {
    throw new Error('cannot-get-permission')
  }

  if (!navigator.serviceWorker) {
    throw new Error('cannot-use-serviceworker')
  }

  await navigator.serviceWorker.register('./sw.js')
  const reg = await navigator.serviceWorker.ready

  if (!reg.pushManager) {
    throw new Error('cannot-use-push-api')
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeBase64URL(process.env.VAPID_PUBLIC_KEY)
  })

  const endpoint = subscription.endpoint
  const p256dhKey = encodeBase64URL(subscription.getKey('p256dh'))
  const authKey = encodeBase64URL(subscription.getKey('auth'))

  const { id } = await axios
    .post(
      `${process.env.MISSKEY_PUSH_BASE}/subscribe`,
      {
        endpoint,
        p256dhKey,
        authKey
      },
      {
        auth: {
          username,
          password
        }
      }
    )
    .then(r => r.data)
    .catch(e => {
      console.error(e)
      console.log(e.response)
      if (e.response) {
        const { message } = e.response.data
        if (message === 'auth-failure') {
          throw new Error(message)
        }
      }
      throw new Error('something-happend')
    })
  return id
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
