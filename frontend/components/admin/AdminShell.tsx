'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, FolderTree, Wallet, ArrowLeft, LogOut } from 'lucide-react'
import AdminGuard from '@/components/AdminGuard'
import Logo from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

const NAV_ITEMS = [
  { href: '/admin', label: 'Relatório', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: FolderTree },
  { href: '/admin/pagamentos', label: 'Pagamentos', icon: Wallet },
]

function AdminShellContent({ children, title }: { children: ReactNode; title: string }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="flex-1 bg-bg-app lg:flex">
      <a href="#admin-main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <aside className="shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-card-border p-3 sm:p-5 flex flex-col gap-3 lg:w-64 lg:gap-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo variant="compact" />
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <Link
              href="/"
              aria-label="Voltar à loja"
              className="flex h-10 w-10 items-center justify-center rounded-input text-ink-500 hover:bg-bg-app"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sair"
              className="flex h-10 w-10 items-center justify-center rounded-input text-brand-red hover:bg-brand-red/10"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <nav aria-label="Navegação administrativa" className="grid grid-cols-2 gap-1 lg:flex lg:flex-1 lg:flex-col">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-w-0 items-center gap-2 px-2 py-2.5 sm:px-4 sm:py-3 rounded-input text-xs sm:text-sm font-medium transition-colors lg:gap-3 ${
                  active ? 'bg-horta-medium/10 text-horta-dark' : 'text-ink-500 hover:bg-bg-app'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center justify-center gap-6 border-t border-card-border pt-3 lg:flex lg:flex-col lg:items-stretch lg:justify-start lg:gap-1 lg:pt-4">
          <Link
            href="/"
            aria-label="Voltar à loja"
            className="flex items-center gap-3 px-4 py-3 rounded-input text-sm font-medium text-ink-500 hover:bg-bg-app transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            <span className="hidden lg:inline">Voltar à loja</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sair"
            className="flex items-center gap-3 px-4 py-3 rounded-input text-sm font-medium text-brand-red hover:bg-brand-red/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="hidden lg:inline">Sair</span>
          </button>
        </div>
      </aside>

      <main id="admin-main-content" tabIndex={-1} className="mx-auto flex w-full max-w-site min-w-0 flex-1 flex-col gap-6 p-5 sm:p-8">
        <h1 className="text-h1 font-bold text-horta-dark">{title}</h1>
        {children}
      </main>
    </div>
  )
}

export default function AdminShell(props: { children: ReactNode; title: string }) {
  return (
    <AdminGuard>
      <AdminShellContent {...props} />
    </AdminGuard>
  )
}
