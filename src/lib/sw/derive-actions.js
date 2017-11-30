import getUrls from 'get-urls'
import open from '@/assets/open.png'

export default function deriveActions (text) {
  const urls = getUrls(text)
  if (urls.size === 0) {
    return {}
  }

  const url = Array.from(urls.values())[0]
  return {
    actions: [
      {
        action: url,
        title: 'open url',
        icon: open
      }
    ]
  }
}
