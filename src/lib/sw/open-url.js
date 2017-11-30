export default function openURL (url) {
  clients.openWindow(`${location.origin}/forward/${encodeURIComponent(url)}`)
}
