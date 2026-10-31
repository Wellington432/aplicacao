'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Categoria } from '@/lib/types'

function imageForCategoria(nome: string): string {
  const n = nome.toLowerCase()
  if (n.includes('hortal') || n.includes('verdura') || n.includes('folha')) return '/produce/icon-folha.png'
  if (n.includes('fruta')) return '/produce/icon-fruta.png'
  if (n.includes('tempero') || n.includes('erva') || n.includes('grão') || n.includes('grao')) return '/produce/icon-graos.png'
  if (n.includes('ovo')) return '/produce/icon-ovos.png'
  return '/produce/icon-caixa.png'
}

interface CategoryGridProps {
  categorias: Categoria[]
  loading: boolean
  activeId?: string
  onSelect: (id: string | undefined) => void
  limit?: number
}

function CardSkeleton() {
  return (
    <div className="flex w-full max-w-[180px] flex-col items-center gap-2">
      <div className="w-full aspect-square rounded-card bg-ink-100 animate-pulse" />
      <div className="h-3 w-14 rounded bg-ink-100 animate-pulse" />
    </div>
  )
}

export default function CategoryGrid({ categorias, loading, activeId, onSelect, limit }: CategoryGridProps) {
  const categoriasVisiveis = limit ? categorias.slice(0, limit) : categorias

  return (
    <section>
      <div className="flex items-center justify-between mb-5 lg:mb-6">
        <h2 className="font-bold text-lg text-ink-800">Categorias</h2>
        <Link href="/categorias" className="text-horta-dark text-sm font-medium hover:underline">
          Ver todas
        </Link>
      </div>

      <div className="category-grid">
        {loading &&
          [...Array(5)].map((_, i) => <CardSkeleton key={i} />)}

        {!loading && categorias.length === 0 && (
          <p className="col-span-full text-sm text-ink-400">Nenhuma categoria cadastrada ainda.</p>
        )}

        {!loading &&
          categoriasVisiveis.map((categoria) => {
            const iconSrc = imageForCategoria(categoria.nome)
            const active = activeId === categoria.id
            return (
              <button
                key={categoria.id}
                type="button"
                onClick={() => onSelect(active ? undefined : categoria.id)}
                aria-pressed={active}
                className="group flex w-full max-w-[180px] flex-col items-center gap-2 animate-rise-in"
                style={{ animationDelay: `${categorias.indexOf(categoria) * 50}ms` }}
              >
                <div
                  className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-card border bg-white p-3 shadow-card transition-colors ${
                    active ? 'border-horta-medium bg-horta-medium/5' : 'border-card-border'
                  }`}
                >
                  <Image src={iconSrc} alt="" fill sizes="180px" className="object-contain p-3" />
                </div>
                <span
                  className={`line-clamp-2 min-h-8 text-center text-xs font-medium leading-tight ${
                    active ? 'text-horta-dark' : 'text-ink-600'
                  }`}
                >
                  {categoria.nome}
                </span>
              </button>
            )
          })}
      </div>
    </section>
  )
}
