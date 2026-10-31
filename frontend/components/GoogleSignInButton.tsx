'use client'

import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import GoogleButton from '@/components/GoogleButton'

interface GoogleSignInButtonProps {
  label: string
  /** Recebe o código de autorização do Google, que o backend troca pelo id_token. */
  onSuccess: (code: string) => Promise<void> | void
  onError?: (mensagem?: string) => void
}

const GOOGLE_CONFIGURADO = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

/**
 * Antes o projeto usava o <GoogleLogin /> invisível por cima de um botão falso.
 * Esse componente do Google entra direto na última conta usada ("Continuar como...")
 * e o clique às vezes nem chegava no iframe. Agora usamos o fluxo OAuth "auth-code"
 * em popup com `select_account: true`, que SEMPRE abre a tela
 * "Escolha uma conta" do Google.
 */
function GoogleSignInButtonAtivo({ label, onSuccess, onError }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  const login = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'popup',
    select_account: true,
    onSuccess: async ({ code }) => {
      try {
        await onSuccess(code)
      } finally {
        setLoading(false)
      }
    },
    onError: (err) => {
      setLoading(false)
      onError?.(err.error_description)
    },
    onNonOAuthError: (err) => {
      setLoading(false)
      // Usuário fechou o popup: não é erro, só cancela.
      if (err.type === 'popup_closed') return
      onError?.(
        err.type === 'popup_failed_to_open'
          ? 'O navegador bloqueou o popup do Google. Libere popups para este site.'
          : undefined
      )
    },
  })

  return (
    <GoogleButton
      label={label}
      loading={loading}
      onClick={() => {
        setLoading(true)
        login()
      }}
    />
  )
}

export default function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (!GOOGLE_CONFIGURADO) {
    return (
      <GoogleButton
        label={props.label}
        onClick={() => props.onError?.('Login com Google não configurado (NEXT_PUBLIC_GOOGLE_CLIENT_ID).')}
      />
    )
  }
  return <GoogleSignInButtonAtivo {...props} />
}
