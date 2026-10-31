'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ReactNode } from 'react'
import { Bell, ShoppingCart } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

interface MobileHeaderProps {
  search: string
  onSearchChange: (v: string) => void
  onFilterClick?: () => void
  filterActive?: boolean
  hasActiveFilters?: boolean
  filterPanel?: ReactNode
}

export default function MobileHeader({
  search,
  onSearchChange,
  onFilterClick,
  filterActive,
  hasActiveFilters,
  filterPanel,
}: MobileHeaderProps) {
  const { user } = useAuth()
  const { itemCount } = useCart()

  return (
    <header className="lg:hidden rounded-b-card-lg bg-horta-dark px-4 pb-5 pt-4 shadow-card">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div aria-hidden="true" />
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5">
            <span className="relative block w-6 aspect-[4/3]">
              <Image src="/logo-icon.png" alt="" fill sizes="24px" className="object-contain" />
            </span>
          </span>
          <span className="text-sm font-bold leading-tight text-white">FeiraEtec</span>
        </Link>

        <div className="flex items-center justify-self-end gap-1">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
          </button>
          <Link
            href="/carrinho"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-red text-white text-[9px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/perfil"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white font-semibold text-sm text-horta-dark transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Meu perfil"
          >
            {user?.nome?.charAt(0).toUpperCase() ?? '?'}
          </Link>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-base font-bold text-white">Olá, {user?.nome?.split(' ')[0] ?? 'Cliente'}!</p>
        <p className="mt-1 text-xs leading-snug text-white/75">
          Produtos fresquinhos direto da nossa unidade rural 🌿
        </p>
      </div>

      <div className="relative">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onFilterClick={onFilterClick}
          filterActive={filterActive}
          hasActiveFilters={hasActiveFilters}
          className="mx-auto mt-4 max-w-2xl"
        />
        {filterActive && filterPanel && (
          <div className="absolute inset-x-0 top-full mt-2 z-40">{filterPanel}</div>
        )}
      </div>
    </header>
  )
}
