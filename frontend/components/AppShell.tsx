'use client'

import { useState, ReactNode } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DesktopHeader from '@/components/home/DesktopHeader'
import MobileHeader from '@/components/home/MobileHeader'
import Sidebar from '@/components/home/Sidebar'
import BottomTabBar from '@/components/home/BottomTabBar'
import Footer from '@/components/home/Footer'
import { useSidebar } from '@/contexts/SidebarContext'

interface AppShellProps {
  children: ReactNode
  title?: string
}

function AppShellContent({ children, title }: AppShellProps) {
  const [search, setSearch] = useState('')
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-bg-app pb-20 lg:pb-0">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <DesktopHeader search={search} onSearchChange={setSearch} />
      <MobileHeader search={search} onSearchChange={setSearch} />

      <div
        className="store-layout mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-10"
        data-sidebar-collapsed={collapsed}
      >
        <Sidebar />

        <main id="main-content" tabIndex={-1} className="flex min-w-0 flex-col gap-6 py-6 lg:py-8">
          {title && <h1 className="text-h1 font-bold text-horta-dark">{title}</h1>}
          {children}
          <Footer />
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}

export default function AppShell(props: AppShellProps) {
  return (
    <AuthGuard>
      <AppShellContent {...props} />
    </AuthGuard>
  )
}
