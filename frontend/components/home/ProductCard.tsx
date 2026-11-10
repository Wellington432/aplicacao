'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check, Loader2, Leaf } from 'lucide-react'
import { Produto } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/contexts/CartContext'
import { getApiErrorMessage } from '@/lib/api'

export function ProductCardSkeleton() {
  return (
    <div className="flex min-h-[240px] w-full max-w-[304px] flex-col gap-2 rounded-card border border-card-border bg-white p-3 shadow-card sm:min-h-[320px]">
      <div className="w-full aspect-square rounded-input bg-ink-100 animate-pulse" />
      <div className="h-10 w-3/4 rounded bg-ink-100 animate-pulse" />
      <div className="h-3 w-1/3 rounded bg-ink-100 animate-pulse" />
      <div className="mt-auto h-9 w-1/2 rounded bg-ink-100 animate-pulse" />
    </div>
  )
}

export default function ProductCard({ produto }: { produto: Produto }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const semEstoque = produto.estoque <= 0

  async function handleAdd() {
    if (semEstoque) return
    setAdding(true)
    setError('')
    try {
      await addItem(produto.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível adicionar ao carrinho.'))
      setTimeout(() => setError(''), 2500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="group relative flex min-h-[240px] w-full max-w-[304px] flex-col rounded-card border border-card-border bg-white p-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg sm:min-h-[320px]">
      <div className="relative w-full aspect-square rounded-input overflow-hidden bg-bg-app">
        {produto.banner ? (
          <Image
            src={produto.banner}
            alt={produto.nome}
            fill
            sizes="(max-width: 639px) 40vw, (max-width: 1023px) 30vw, 280px"
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              backgroundImage:
                'radial-gradient(rgb(var(--palette-horta-light-rgb) / 0.1) 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px',
            }}
          >
            <Leaf className="w-8 h-8 text-horta-medium/40" />
          </div>
        )}
      </div>

      <h3 className="mt-3 min-h-10 text-sm font-semibold text-ink-800 line-clamp-2">{produto.nome}</h3>
      <span className="text-xs text-ink-400">{produto.unidade}</span>
      <div className="mt-auto flex min-h-10 items-center justify-between gap-2 pt-2">
        <div className="min-w-0">
          <span className="block truncate font-bold text-horta-dark">{formatPrice(produto.preco)}</span>
          {semEstoque && <span className="text-[11px] font-semibold text-brand-red">Esgotado</span>}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || semEstoque}
          title={semEstoque ? 'Sem estoque' : undefined}
          aria-label={
            semEstoque
              ? `${produto.nome} sem estoque`
              : added
                ? `${produto.nome} adicionado ao carrinho`
                : `Adicionar ${produto.nome} ao carrinho`
          }
          aria-live="polite"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-horta-medium text-white shadow-md transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-horta-dark active:scale-95 disabled:cursor-not-allowed disabled:bg-ink-300 disabled:opacity-70"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : added ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && (
        <div role="alert" className="absolute inset-x-2 -bottom-2 translate-y-full text-[11px] text-brand-red bg-brand-red/10 border border-brand-red/25 rounded-md px-2 py-1 text-center z-10">
          {error}
        </div>
      )}
    </div>
  )
}
