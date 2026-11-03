'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import Logo from '@/components/Logo'
import FormInput from '@/components/FormInput'
import PrimaryButton from '@/components/PrimaryButton'
import DecorativeStrip from '@/components/DecorativeStrip'
import { api, getApiErrorMessage } from '@/lib/api'

export default function RedefinirSenhaPage() {
  const [token, setToken] = useState('')
  const [tokenCarregado, setTokenCarregado] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [concluido, setConcluido] = useState(false)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '')
    setTokenCarregado(true)
  }, [])

  async function redefinirSenha(event: FormEvent) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    try {
      const { data } = await api.post('/senha/redefinir', { token, senha })
      setMensagem(data.message)
      setConcluido(true)
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível redefinir a senha.'))
    } finally {
      setCarregando(false)
    }
  }

  const linkInvalido = tokenCarregado && !token

  return (
    <div className="flex flex-1 flex-col bg-bg-app">
      <a href="#auth-main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <main id="auth-main-content" tabIndex={-1} className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="auth-panel w-full max-w-[420px]">
          <Logo variant="full" className="mb-8" />
          <h1 className="text-2xl font-bold text-horta-dark text-center">Criar nova senha</h1>

          {linkInvalido ? (
            <p role="alert" className="mt-4 p-4 rounded-input bg-brand-red/10 text-brand-red text-sm text-center">
              Este link está incompleto. Solicite uma nova recuperação de senha.
            </p>
          ) : concluido ? (
            <p role="status" className="mt-4 p-4 rounded-input bg-horta-medium/10 text-horta-dark text-sm text-center">
              {mensagem}
            </p>
          ) : (
            <form onSubmit={redefinirSenha} className="mt-6 space-y-4">
              <p className="text-ink-500 text-sm text-center">Escolha uma senha com pelo menos 8 caracteres.</p>
              {erro && <p role="alert" className="p-3 rounded-input bg-brand-red/10 border border-brand-red/25 text-brand-red text-sm text-center">{erro}</p>}
              <FormInput
                icon={Lock}
                type="password"
                placeholder="Nova senha"
                autoComplete="new-password"
                minLength={8}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
              <FormInput
                icon={Lock}
                type="password"
                placeholder="Confirme a nova senha"
                autoComplete="new-password"
                minLength={8}
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                required
              />
              <PrimaryButton type="submit" loading={carregando} disabled={!tokenCarregado || !token}>
                Redefinir senha
              </PrimaryButton>
            </form>
          )}

          <Link
            href={linkInvalido || erro ? '/esqueci-senha' : '/login'}
            className="inline-flex items-center gap-2 text-horta-dark font-semibold mt-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {linkInvalido || erro ? 'Solicitar outro link' : 'Voltar para o login'}
          </Link>
        </div>
      </main>
      <DecorativeStrip />
    </div>
  )
}