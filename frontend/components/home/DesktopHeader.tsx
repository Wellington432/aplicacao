'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { Bell, ShoppingCart, ChevronDown, LogOut, UserCircle, LayoutDashboard } from 'lucide-react'
import Logo from '@/components/Logo'
import SearchBar from '@/components/SearchBar'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

interface DesktopHeaderProps {
  search: string
  onSearchChange: (v: string) => void
  onFilterClick?: () => void
  filterActive?: boolean
  hasActiveFilters?: boolean
  filterPanel?: ReactNode
}

export default function DesktopHeader({
  search,
  onSearchChange,
  onFilterClick,
  filterActive,
  hasActiveFilters,
  filterPanel,
}: DesktopHeaderProps) {
  const { user, signOut } = useAuth()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 hidden h-20 border-b border-card-border bg-white lg:block">
      <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-[minmax(0,1fr)_minmax(280px,480px)_minmax(0,1fr)] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="w-fit justify-self-start rounded-xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-horta-medium focus-visible:ring-offset-4">
          <Logo variant="compact" />
        </Link>

        <div className="relative flex min-w-0 justify-center">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onFilterClick={onFilterClick}
            filterActive={filterActive}
            hasActiveFilters={hasActiveFilters}
            className="w-full max-w-[480px]"
          />
          {filterActive && filterPanel && (
            <div className="absolute right-0 top-full mt-2 z-40 w-80">{filterPanel}</div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-self-end gap-1 xl:gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-bg-app hover:text-horta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-horta-medium"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            href="/carrinho"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-bg-app hover:text-horta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-horta-medium"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex min-h-10 items-center gap-2 rounded-full border border-card-border py-1 pl-1 pr-2 transition-colors hover:border-horta-medium/30 hover:bg-bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-horta-medium xl:min-h-11 xl:pr-3"
              aria-expanded={menuOpen}
              aria-label={`Menu da conta de ${user?.nome?.split(' ')[0] ?? 'Cliente'}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-horta-dark font-semibold text-sm text-white">
                {user?.nome?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <span className="hidden whitespace-nowrap text-sm font-medium text-ink-700 xl:inline">Olá, {user?.nome?.split(' ')[0] ?? 'Cliente'}!</span>
              <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-card-lg border border-card-border shadow-card-lg py-2 overflow-hidden animate-rise-in">
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-bg-app transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle className="w-4 h-4" />
                  Meu perfil
                </Link>
                {user?.tipo === 'ADM' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-bg-app transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Painel admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand-red hover:bg-brand-red/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
