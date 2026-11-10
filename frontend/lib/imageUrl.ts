const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

function isLocalNetworkHost(hostname: string): boolean {
  if (LOCAL_HOSTS.has(hostname) || hostname.endsWith('.local')) return true

  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }

  return (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 169 && octets[1] === 254)
  )
}

function forceHttpsUnlessLocal(url: URL): URL {
  if (url.protocol === 'http:' && !isLocalNetworkHost(url.hostname)) {
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
