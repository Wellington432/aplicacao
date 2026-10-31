import Image from 'next/image'

export default function CrateIllustration() {
  return (
    <div className="relative aspect-[669/547] w-full overflow-hidden rounded-card-lg shadow-card">
      <Image
        src="/produce/caixa_hortifruti.png"
        alt="Caixa de hortifrúti fresco"
        fill
        sizes="(max-width: 1023px) 160px, 224px"
        priority
        className="object-cover"
      />
    </div>
  )
}
