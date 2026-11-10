export function getImageUrl(source: string | null | undefined): string | null {
  const imageUrl = source?.trim()
  if (!imageUrl) return null

  if (/^https?:\/\//i.test(imageUrl)) return imageUrl

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '')
  if (!apiBase) return null

  const baseUrl = new URL(apiBase)
  baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, '')}/`
  const relativePath = imageUrl.replace(/^\/+/, '')
  return new URL(relativePath, baseUrl).toString()
}
