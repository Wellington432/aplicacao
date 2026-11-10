'use client'

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { Leaf } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  sizes?: string
  className?: string
}

export default function ProductImage({
  src,
  alt,
  sizes = '100vw',
  className = 'object-cover',
}: ProductImageProps) {
  const normalizedSrc = getImageUrl(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!normalizedSrc || failedSrc === normalizedSrc) {
    return (
      <div
        role="img"
        aria-label={`${alt} (imagem indisponível)`}
        className="absolute inset-0 flex items-center justify-center bg-ink-50"
      >
        <Leaf aria-hidden="true" className="h-5 w-5 text-horta-medium/50" />
      </div>
    )
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={`absolute inset-0 h-full w-full ${className}`}
      onError={() => setFailedSrc(normalizedSrc)}
    />
  )
}
