'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ProductImage from '@/components/ProductImage'
import { AlertTriangle, Minus, Plus, Trash2, Loader2, MapPin } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { useCart } from '@/contexts/CartContext'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { TipoEntrega } from '@/lib/types'
import PrimaryButton from '@/components/PrimaryButton'
import { useAuth } from '@/contexts/AuthContext'

interface EnderecoForm {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  numero: string
  complemento: string
}

const enderecoVazio: EnderecoForm = {
  cep: '', logradouro: '', bairro: '', cidade: '', estado: '', numero: '', complemento: '',
}

function assinaturaEndereco(endereco: EnderecoForm) {
  return JSON.stringify({ ...endereco, cep: endereco.cep.replace(/\D/g, '') })
}

export default function CarrinhoPage() {
  const { cart, loading, updateItem, removeItem, refresh } = useCart()
  const { user, isHydrated } = useAuth()
  const [error, setError] = useState('')
  const [busyItemId, setBusyItemId] = useState<string | null>(null)
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('RETIRADA')
  const [endereco, setEndereco] = useState<EnderecoForm>(enderecoVazio)
  const [buscaCepLoading, setBuscaCepLoading] = useState(false)
  const [salvandoEndereco, setSalvandoEndereco] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [freteEntrega, setFreteEntrega] = useState<number | null>(null)
  const enderecoSalvoRef = useRef('')

  useEffect(() => {
    api.get<{ freteEntrega: number }>('/config/checkout')
      .then(({ data }) => setFreteEntrega(data.freteEntrega))
      .catch((err) => setError(getApiErrorMessage(err, 'Não foi possível carregar o valor da entrega.')))
  }, [])

  useEffect(() => {
    if (!isHydrated || !user) return
    api.get<EnderecoForm | null>(`/endereco/usuario/${user.id}`)
      .then(({ data }) => {
        if (data) {
          const preenchido = { ...enderecoVazio, ...data }
          enderecoSalvoRef.current = assinaturaEndereco(preenchido)
          setEndereco(preenchido)
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Não foi possível carregar seu endereço.')))
  }, [isHydrated, user])

  useEffect(() => {
    const cep = endereco.cep.replace(/\D/g, '')
    if (cep.length !== 8) {
      setBuscaCepLoading(false)
      return
    }

    let cancelado = false
    setBuscaCepLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await api.get<Omit<EnderecoForm, 'numero' | 'complemento'>>(`/endereco/${cep}`)
        if (cancelado) return
        setEndereco((atual) => ({ ...atual, ...data, numero: atual.numero, complemento: atual.complemento }))
        setError('')
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'CEP não encontrado.'))
      } finally {
        if (!cancelado) setBuscaCepLoading(false)
      }
    }, 450)

    return () => { cancelado = true; window.clearTimeout(timer) }
  }, [endereco.cep])

  const cepValido = endereco.cep.replace(/\D/g, '').length === 8
  const enderecoCompleto = cepValido && !!endereco.logradouro.trim() && !!endereco.bairro.trim()
    && !!endereco.cidade.trim() && !!endereco.estado.trim() && !!endereco.numero.trim()
  const entregaPermitida = endereco.cidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() === 'jales'
    && endereco.estado.trim().toUpperCase() === 'SP'

  async function salvarEndereco() {
    const dados = {
      ...endereco,
      cep: endereco.cep.replace(/\D/g, ''),
    }
    await api.post<EnderecoForm>('/endereco', dados)
    enderecoSalvoRef.current = assinaturaEndereco(dados)
  }

  useEffect(() => {
    if (!enderecoCompleto || buscaCepLoading) return
    if (assinaturaEndereco(endereco) === enderecoSalvoRef.current) return
    const timer = window.setTimeout(async () => {
      setSalvandoEndereco(true)
      try {
        await salvarEndereco()
      } catch (err) {
        setError(getApiErrorMessage(err, 'Não foi possível salvar seu endereço.'))
      } finally {
        setSalvandoEndereco(false)
      }
    }, 700)
    return () => window.clearTimeout(timer)
  // salvarEndereco deliberately reads the newest form state in this effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endereco, enderecoCompleto, buscaCepLoading])

  async function handleQuantityChange(id: string, quantidade: number) {
    if (quantidade < 1) return
    setBusyItemId(id)
    setError('')
    try {
      await updateItem(id, quantidade)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar o item.'))
    } finally {
      setBusyItemId(null)
    }
  }

  async function handleRemove(id: string) {
    setBusyItemId(id)
    setError('')
    try {
      await removeItem(id)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover o item.'))
    } finally {
      setBusyItemId(null)
    }
  }

  async function handleCheckout() {
    if (!cart) return
    if (tipoEntrega === 'ENTREGA') {
      if (!enderecoCompleto) {
        setError('Informe um CEP válido e o número do endereço para entrega.')
        return
      }
      if (!entregaPermitida) {
        setError('Entregas disponíveis apenas para Jales-SP. Fora dessa região, disponibilizamos apenas retirada no local.')
        return
      }
    }
    setCheckoutLoading(true)
    setError('')
    try {
      if (tipoEntrega === 'ENTREGA') await salvarEndereco()
      const { data } = await api.post<{ checkout_url: string }>('/checkout', {
        id_compra: cart.id,
        tipo_entrega: tipoEntrega,
        endereco: tipoEntrega === 'ENTREGA' ? { ...endereco, cep: endereco.cep.replace(/\D/g, '') } : undefined,
      })
      await refresh()
      window.location.href = data.checkout_url
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível iniciar o pagamento.'))
    } finally {
      setCheckoutLoading(false)
    }
  }

  const subtotalCentavos = cart?.itens.reduce(
    (soma, item) => soma + Math.round(Number(item.produto.preco) * 100) * item.quantidade,
    0,
  ) ?? 0
  const subtotal = subtotalCentavos / 100
  const frete = tipoEntrega === 'ENTREGA' && freteEntrega !== null
    ? Math.round(freteEntrega * 100) / 100
    : 0
  const total = subtotal + frete

  return (
    <AppShell title="Meu carrinho">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-input bg-brand-red/10 border border-brand-red/25 text-brand-red text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !cart && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-card border border-card-border animate-pulse" />
          ))}
        </div>
      )}

      {!loading && cart && cart.itens.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Image src="/produce/tomate_folhas.png" alt="" width={370} height={269} className="w-24 h-auto opacity-70" />
          <p className="text-ink-400 text-sm">Seu carrinho está vazio.</p>
        </div>
      )}

      {cart && cart.itens.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-3">
            {cart.itens.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-card border border-card-border shadow-card p-3 flex flex-wrap items-center gap-4"
              >
                <div className="relative w-16 h-16 rounded-input overflow-hidden bg-bg-app shrink-0">
                  <ProductImage src={item.produto.banner} alt={item.produto.nome} sizes="64px" />
                </div>

                <div className="flex-1 min-w-[140px]">
                  <h3 className="font-semibold text-sm text-ink-800 truncate">{item.produto.nome}</h3>
                  <span className="text-xs text-ink-400">{item.produto.unidade}</span>
                  <span className="block font-bold text-horta-dark text-sm mt-0.5">
                    {formatPrice(item.produto.preco)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busyItemId === item.id}
                    onClick={() => handleQuantityChange(item.id, item.quantidade - 1)}
                    aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                    className="w-11 h-11 rounded-full border border-input-border flex items-center justify-center text-ink-500 hover:bg-bg-app disabled:opacity-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className="w-6 text-center text-sm font-medium"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {busyItemId === item.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantidade}
                  </span>
                  <button
                    type="button"
                    disabled={busyItemId === item.id}
                    onClick={() => handleQuantityChange(item.id, item.quantidade + 1)}
                    aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                    className="w-11 h-11 rounded-full border border-input-border flex items-center justify-center text-ink-500 hover:bg-bg-app disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={busyItemId === item.id}
                  onClick={() => handleRemove(item.id)}
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-brand-red hover:bg-brand-red/10 disabled:opacity-50"
                  aria-label={`Remover ${item.produto.nome} do carrinho`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-card border border-card-border shadow-card p-5 space-y-4">
            <h3 className="font-semibold text-ink-800">Entrega</h3>

            <div className="flex gap-2">
              {(['RETIRADA', 'ENTREGA'] as TipoEntrega[]).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoEntrega(tipo)}
                  aria-pressed={tipoEntrega === tipo}
                  className={`flex-1 h-10 rounded-input text-sm font-medium border transition-colors ${
                    tipoEntrega === tipo
                      ? 'bg-horta-dark text-white border-horta-dark'
                      : 'border-input-border text-ink-600 hover:bg-bg-app'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {tipo === 'RETIRADA' ? 'Retirada' : 'Entrega'}
                </button>
              ))}
            </div>

            {tipoEntrega === 'ENTREGA' && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    value={endereco.cep}
                    onChange={(e) => setEndereco((atual) => ({ ...atual, cep: e.target.value, logradouro: '', bairro: '', cidade: '', estado: '' }))}
                    onBlur={(e) => setEndereco((atual) => ({ ...atual, cep: e.target.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2') }))}
                    placeholder="CEP"
                    aria-label="CEP"
                    inputMode="numeric"
                    maxLength={9}
                    className="w-full h-11 rounded-input border border-input-border px-3 text-sm outline-none focus:border-horta-medium"
                  />
                  {buscaCepLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-horta-medium" />}
                </div>
                <input value={endereco.logradouro} onChange={(e) => setEndereco((atual) => ({ ...atual, logradouro: e.target.value }))} placeholder="Rua / Logradouro" aria-label="Rua ou logradouro" className="w-full h-11 rounded-input border border-input-border px-3 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={endereco.numero} onChange={(e) => setEndereco((atual) => ({ ...atual, numero: e.target.value }))} placeholder="Número" aria-label="Número" className="h-11 min-w-0 rounded-input border border-input-border px-3 text-sm outline-none focus:border-horta-medium" />
                  <input value={endereco.complemento} onChange={(e) => setEndereco((atual) => ({ ...atual, complemento: e.target.value }))} placeholder="Complemento" aria-label="Complemento" className="h-11 min-w-0 rounded-input border border-input-border px-3 text-sm outline-none focus:border-horta-medium" />
                </div>
                <input value={endereco.bairro} onChange={(e) => setEndereco((atual) => ({ ...atual, bairro: e.target.value }))} placeholder="Bairro" aria-label="Bairro" className="w-full h-11 rounded-input border border-input-border px-3 text-sm" />
                <div className="grid grid-cols-[1fr_72px] gap-2">
                  <input value={endereco.cidade} onChange={(e) => setEndereco((atual) => ({ ...atual, cidade: e.target.value }))} placeholder="Cidade" aria-label="Cidade" className="h-11 min-w-0 rounded-input border border-input-border px-3 text-sm" />
                  <input value={endereco.estado} onChange={(e) => setEndereco((atual) => ({ ...atual, estado: e.target.value }))} placeholder="UF" aria-label="Estado" className="h-11 min-w-0 rounded-input border border-input-border px-3 text-sm text-center" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-400" aria-live="polite">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {salvandoEndereco ? 'Salvando endereço…' : enderecoCompleto ? 'Endereço salvo automaticamente.' : 'Preencha o CEP e número.'}
                </div>
              </div>
            )}

            {enderecoCompleto && !entregaPermitida && (
              <p className="rounded-input bg-horta-light/40 p-3 text-xs leading-relaxed text-ink-600">
                Entregas disponíveis apenas para Jales-SP. Fora dessa região, disponibilizamos apenas retirada no local.
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-card-border">
              <div className="text-sm text-ink-500">
                <div>Subtotal: {formatPrice(subtotal)}</div>
                {tipoEntrega === 'ENTREGA' && <div>Frete: {frete === 0 ? 'Grátis' : formatPrice(frete)}</div>}
                <strong className="block mt-1 text-ink-700">Total</strong>
              </div>
              <span className="font-bold text-lg text-horta-dark">{formatPrice(total)}</span>
            </div>

            <PrimaryButton onClick={handleCheckout} loading={checkoutLoading} disabled={freteEntrega === null}>
              Finalizar pedido
            </PrimaryButton>
          </div>
        </div>
      )}
    </AppShell>
  )
}
