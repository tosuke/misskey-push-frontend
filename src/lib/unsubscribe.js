import axios from 'axios'

export default async function unsubscribe (username, password, id) {
  const reg = await navigator.serviceWorker.getRegistration()
  if (reg) await reg.unregister()

  await axios
    .post(
      `${process.env.MISSKEY_PUSH_BASE}/unsubscribe`,
      {
        id
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
}
