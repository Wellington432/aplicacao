'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { api, getApiErrorMessage } from '@/lib/api'
import { Categoria, Produto } from '@/lib/types'
import PrimaryButton from '@/components/PrimaryButton'

interface ProdutoFormModalProps {
  categorias: Categoria[]
  produto: Produto | null
  onClose: () => void
  onSaved: () => void
}

export default function ProdutoFormModal({ categorias, produto, onClose, onSaved }: ProdutoFormModalProps) {
  const isEdit = !!produto
  const dialogRef = useRef<HTMLDivElement>(null)

  const [nome, setNome] = useState(produto?.nome ?? '')
  const [preco, setPreco] = useState(produto?.preco ? String(produto.preco) : '')
  const [unidade, setUnidade] = useState(produto?.unidade ?? '')
  const [descricao, setDescricao] = useState(produto?.descricao ?? '')
  const [idCategoria, setIdCategoria] = useState(
    // A listagem devolve a categoria como objeto; sem esse fallback, editar um produto
    // trocava a categoria dele para a primeira da lista sem o admin perceber.
    produto?.id_categoria ?? produto?.categoria?.id ?? categorias[0]?.id ?? ''
  )
  const [estoque, setEstoque] = useState(String(produto?.estoque ?? 0))
  const [banner, setBanner] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    const focusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
    document.body.style.overflow = 'hidden'
    focusableElements()[0]?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const elements = focusableElements()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!first || !last) {
        event.preventDefault()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!isEdit && !banner) {
      setError('Selecione uma imagem para o produto.')
      return
    }

    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('preco', preco)
    formData.append('unidade', unidade)
    formData.append('descricao', descricao)
    formData.append('id_categoria', idCategoria)
    formData.append('estoque', estoque)
    if (banner) formData.append('banner', banner)
    if (isEdit) formData.append('id', produto.id)

    setSaving(true)
    try {
      if (isEdit) {
        await api.put('/atualizaproduto', formData)
      } else {
        await api.post('/novoproduto', formData)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar o produto.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="produto-modal-title"
        className="bg-white rounded-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="produto-modal-title" className="font-bold text-lg text-horta-dark">{isEdit ? 'Editar produto' : 'Novo produto'}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-ink-400 hover:text-ink-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-input bg-brand-red/10 border border-brand-red/25 text-brand-red text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="produto-nome" className="block text-xs font-medium text-ink-500 mb-1">Nome</label>
            <input
              id="produto-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full h-11 rounded-input border border-input-border px-3.5 text-sm outline-none focus:border-horta-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="produto-preco" className="block text-xs font-medium text-ink-500 mb-1">Preço (R$)</label>
              <input
                id="produto-preco"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                type="number"
                step="0.01"
                min="0.01"
                required
                className="w-full h-11 rounded-input border border-input-border px-3.5 text-sm outline-none focus:border-horta-medium"
              />
            </div>
            <div>
              <label htmlFor="produto-unidade" className="block text-xs font-medium text-ink-500 mb-1">Unidade</label>
              <input
                id="produto-unidade"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                placeholder="ex: 1kg, Unidade"
                required
                className="w-full h-11 rounded-input border border-input-border px-3.5 text-sm outline-none focus:border-horta-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="produto-descricao" className="block text-xs font-medium text-ink-500 mb-1">Descrição</label>
            <textarea
              id="produto-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={3}
              className="w-full rounded-input border border-input-border px-3.5 py-2.5 text-sm outline-none focus:border-horta-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="produto-categoria" className="block text-xs font-medium text-ink-500 mb-1">Categoria</label>
              <select
                id="produto-categoria"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
                required
                className="w-full h-11 rounded-input border border-input-border px-3.5 text-sm outline-none focus:border-horta-medium bg-white"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="produto-estoque" className="block text-xs font-medium text-ink-500 mb-1">Estoque</label>
              <input
                id="produto-estoque"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                type="number"
                step="1"
                min="0"
                required
                className="w-full h-11 rounded-input border border-input-border px-3.5 text-sm outline-none focus:border-horta-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="produto-imagem" className="block text-xs font-medium text-ink-500 mb-1">
              Imagem {isEdit && <span className="text-ink-400">(deixe em branco para manter a atual)</span>}
            </label>
            <input
              id="produto-imagem"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-ink-600 file:mr-3 file:h-9 file:px-4 file:rounded-input file:border-0 file:bg-horta-medium/10 file:text-horta-dark file:text-sm file:font-medium"
            />
          </div>

          <PrimaryButton type="submit" loading={saving} className="mt-2">
            {saving ? 'Salvando...' : 'Salvar produto'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  )
}
