export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const formatDuration = (d) => {
  const days = Math.floor(d / 86400)
  const hours = Math.floor(d / 3600) % 24
  const minutes = Math.floor(d / 60) % 60
  const seconds = Math.floor(d % 60)
  const f = [hours, minutes, seconds]
    .map((v) => v.toString())
    .map((v) => (v.length !== 2 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':')

  return `${days > 0 ? days + ':' : ''}${f}`
}
