'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { normalizeImageUrl } from '@/lib/imageUrl'

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
  const normalizedSrc = normalizeImageUrl(src)
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
    <Image
      src={normalizedSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setFailedSrc(normalizedSrc)}
    />
  )
}
