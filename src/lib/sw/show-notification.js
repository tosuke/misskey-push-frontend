import badge from '@/assets/misskey.png'
import deriveActions from '@/lib/sw/derive-actions'

export default async function showNotification (params) {
  switch (params.typ) {
    case 'like':
      await normalPush('liked', params)
      break
    case 'repost':
      await normalPush('reposted', params)
      break
    case 'mention':
      await normalPush('mentioned', params)
      break
    case 'follow':
      await follow(params)
      break
    case 'talk-user-message':
      await talkUserMessage(params)
      break
  }
}

async function normalPush (verb, params) {
  const title = `${verb} by ${params.usr.name}(@${params.usr.nameId})`
  const filesNum = params.post.files.length
  const body = `${params.post.text}${
    filesNum > 0 ? ` (${filesNum} image${filesNum > 1 ? 's' : ''})` : ''
  }`
  const url = `${process.env.MISSKEY_WEB_BASE}/${params.post.usr.nameId}/${
    params.post.id
  }`

  const notification = {
    icon: `${params.usr.avatar}?thumbnail`,
    badge,
    tag: genTag(),
    title,
    body,
    url,
    ...deriveActions(params.post.text)
  }

  await show(notification)

  const file = await resolveFiles(params.post.files)
  if (file) await show({ ...notification, image: file })
}

async function follow (params) {
  const title = `followed by ${params.usr.name}(@${params.usr.nameId})`
  const body = ''
  const url = `${process.env.MISSKEY_WEB_BASE}/${params.post.usr.nameId}`

  const notification = {
    icon: `${params.usr.avatar}?thumbnail`,
    badge,
    tag: genTag(),
    title,
    body,
    url
  }

  await show(notification)

  const user = await resolveUser(params.usr.id)
  await show({ ...notification, body: user.comment || '' })
}

async function talkUserMessage (params) {
  const title = `message from ${params.usr.name}(@${params.usr.nameId})`
  const body = params.mes.text
  const url = process.env.MISSKEY_WEB_BASE

  const notification = {
    icon: `${params.usr.avatar}?thumbnail`,
    badge,
    tag: genTag(),
    title,
    body,
    url,
    ...deriveActions(params.mes.text)
  }

  await show(notification)

  if (params.mes.file) {
    const file = await resolveFiles([params.mes.file])
    if (file) await show({ ...notification, image: file })
  }
}

function show (params) {
  return self.registration.showNotification(params.title, {
    ...params,
    data: { url: params.url }
  })
}

function genTag () {
  return `misskey-push-${Date.now()}`
}

async function resolveFiles (ids) {
  const files = await Promise.all(
    ids.map(id =>
      fetch(`${process.env.MISSKEY_API_BASE}/files/${id}`)
        .then(r => r.json())
        .then(
          r => `${process.env.MISSKEY_FILE_BASE}/${r.file.serverPath}?size=640`
        )
    )
  )
  const images = files.filter(file =>
    /\.(png|jpe?g|gif|svg)(\?.*)$/i.test(file)
  )
  return images.length > 0 ? images[0] : null
}

async function resolveUser (id) {
  const { account } = await fetch(
    `${process.env.MISSKEY_API_BASE}/accounts/${id}`
  ).then(r => r.json())
  return account
}
