'use client'

import { googleLogout } from '@react-oauth/google'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, getStoredAuth, setStoredAuth, clearStoredAuth, StoredAuth } from '@/lib/api'

interface AuthContextData {
  user: StoredAuth | null
  isAuthenticated: boolean
  isHydrated: boolean
  signIn: (email: string, senha: string) => Promise<void>
  signUp: (nome: string, email: string, senha: string) => Promise<void>
  signInWithGoogle: (code: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredAuth | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setUser(getStoredAuth())
    setIsHydrated(true)
  }, [])

  async function signIn(email: string, senha: string) {
    const { data } = await api.post<StoredAuth>('/sessao', { email, senha })
    setStoredAuth(data)
    setUser(data)
  }

  async function signUp(nome: string, email: string, senha: string) {
    await api.post('/novousuario', { nome, email, senha })
    await signIn(email, senha)
  }

  async function signInWithGoogle(code: string) {
    const { data } = await api.post<StoredAuth>('/sessao/google', { code })
    setStoredAuth(data)
    setUser(data)
  }

  function signOut() {
    clearStoredAuth()
    setUser(null)
    // Desliga o auto-login do Google, para a próxima entrada pedir a conta de novo.
    googleLogout()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isHydrated, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
