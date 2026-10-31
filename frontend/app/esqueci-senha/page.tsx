'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import Logo from '@/components/Logo'
import FormInput from '@/components/FormInput'
import PrimaryButton from '@/components/PrimaryButton'
import DecorativeStrip from '@/components/DecorativeStrip'
import { api, getApiErrorMessage } from '@/lib/api'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function solicitarRecuperacao(event: FormEvent) {
    event.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await api.post('/senha/recuperar', { email })
      setEnviado(true)
    } catch (error) {
      setErro(getApiErrorMessage(error, 'Não foi possível solicitar a recuperação.'))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-app">
      <a href="#auth-main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <main id="auth-main-content" tabIndex={-1} className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="auth-panel w-full max-w-[420px]">
          <Logo variant="full" className="mb-8" />
          <div className="text-center">
            <Mail className="w-10 h-10 text-horta-medium mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-horta-dark">Recuperação de senha</h1>
            <p className="text-ink-500 text-sm mt-3 leading-relaxed">
              Informe o e-mail da sua conta para receber um link de redefinição.
            </p>
          </div>

          {enviado ? (
            <p role="status" className="mt-6 p-4 rounded-input bg-horta-medium/10 text-horta-dark text-sm text-center">
              Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha. Verifique também a caixa de spam.
            </p>
          ) : (
            <form onSubmit={solicitarRecuperacao} className="mt-6 space-y-4">
              {erro && <p role="alert" className="p-3 rounded-input bg-brand-red/10 border border-brand-red/25 text-brand-red text-sm text-center">{erro}</p>}
              <FormInput
                icon={Mail}
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <PrimaryButton type="submit" loading={carregando}>Enviar link</PrimaryButton>
            </form>
          )}

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-horta-dark font-semibold mt-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </main>
      <DecorativeStrip />
    </div>
  )
}
