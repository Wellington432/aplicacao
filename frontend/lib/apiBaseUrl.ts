const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function getApiBaseUrl(): string {
  const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333')

  if (
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    LOCAL_HOSTS.has(apiUrl.hostname) &&
    !LOCAL_HOSTS.has(window.location.hostname)
  ) {
    apiUrl.hostname = window.location.hostname
  }

  return apiUrl.toString().replace(/\/+$/, '')
}
