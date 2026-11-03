const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

function forceHttpsUnlessLocal(url: URL): URL {
  if (url.protocol === 'http:' && !LOCAL_HOSTS.has(url.hostname)) {
    url.protocol = 'https:'
  }
  return url
}

export function normalizeImageUrl(source: string | null | undefined): string | null {
  const imageUrl = source?.trim()
  if (!imageUrl) return null

  if (imageUrl.startsWith('/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '')
    if (!apiBase) return imageUrl

    const baseUrl = forceHttpsUnlessLocal(new URL(apiBase))
    return `${baseUrl.toString().replace(/\/+$/, '')}${imageUrl}`
  }

  if (imageUrl.startsWith('http://')) {
    return forceHttpsUnlessLocal(new URL(imageUrl)).toString()
  }

  return imageUrl
}
