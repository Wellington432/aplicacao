'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, Pencil, Plus, FolderTree } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import { api, getApiErrorMessage } from '@/lib/api'
import { Categoria } from '@/lib/types'
import PrimaryButton from '@/components/PrimaryButton'
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIconKey,
  getCategoryIconSrc,
} from '@/lib/categoryIcons'

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nome, setNome] = useState('')
  const [iconKey, setIconKey] = useState<string | null>(null)
  const [manualIconSelection, setManualIconSelection] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)

  async function carregar() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get<Categoria[]>('/listcategoria')
      setCategorias(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as categorias.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function limparFormulario() {
    setNome('')
    setIconKey(null)
    setManualIconSelection(false)
    setEditing(null)
  }

  function iniciarEdicao(categoria: Categoria) {
    const savedIconKey = CATEGORY_ICON_OPTIONS.some((option) => option.key === categoria.iconKey)
      ? categoria.iconKey ?? null
      : null
    setEditing(categoria)
    setNome(categoria.nome)
    setIconKey(savedIconKey ?? getCategoryIconKey(categoria.nome) ?? null)
    setManualIconSelection(Boolean(savedIconKey))
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!iconKey) {
      setError('Selecione um ícone para a categoria.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await api.put('/atualizacategoria', { id: editing.id, nome, iconKey })
      } else {
        await api.post('/novacategoria', { nome, iconKey })
      }
      limparFormulario()
      await carregar()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar a categoria.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell title="Categorias">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-input bg-brand-red/10 border border-brand-red/25 text-brand-red text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-card border border-card-border shadow-card p-5 space-y-4 max-w-lg">
        <div>
          <label htmlFor="nova-categoria" className="block text-xs font-medium text-ink-500 mb-1">
            {editing ? 'Editar categoria' : 'Nova categoria'}
          </label>
          <input
            id="nova-categoria"
            value={nome}
            onChange={(e) => {
              const nextName = e.target.value
              setNome(nextName)
              if (!manualIconSelection) setIconKey(getCategoryIconKey(nextName) ?? null)
            }}
            required
            placeholder="ex: Hortaliças"
            className="w-full h-11 rounded-input border border-input-border px-3.5 text-sm outline-none focus:border-horta-medium"
          />
        </div>

        <fieldset>
          <legend className="block text-xs font-medium text-ink-500 mb-2">Ícone</legend>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {CATEGORY_ICON_OPTIONS.map((option) => {
              const selected = iconKey === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-label={`Usar ícone ${option.label}`}
                  aria-pressed={selected}
                  onClick={() => {
                    setIconKey(option.key)
                    setManualIconSelection(true)
                  }}
                  className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-input border p-2 transition-colors ${
                    selected
                      ? 'border-horta-medium bg-horta-medium/10 ring-2 ring-horta-medium'
                      : 'border-input-border hover:bg-bg-app'
                  }`}
                >
                  <Image src={option.src} alt="" width={40} height={40} sizes="40px" className="h-10 w-10 object-contain" />
                  <span className="text-center text-[10px] leading-tight text-ink-600">{option.label}</span>
                </button>
              )
            })}
          </div>
          {!iconKey && (
            <p className="mt-2 text-xs text-ink-400">
              Digite um nome conhecido para sugerir um ícone ou escolha um acima.
            </p>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {editing && (
            <button
              type="button"
              onClick={limparFormulario}
              className="h-11 px-4 rounded-input border border-input-border text-sm font-medium text-ink-600 hover:bg-bg-app"
            >
              Cancelar
            </button>
          )}
          <PrimaryButton type="submit" loading={saving} className="w-full sm:w-auto px-5 h-11">
            {editing ? 'Salvar alterações' : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar
              </>
            )}
          </PrimaryButton>
        </div>
      </form>

      {loading && (
        <div className="space-y-2 max-w-lg">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white rounded-card border border-card-border animate-pulse" />
          ))}
        </div>
      )}

      {!loading && categorias.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FolderTree className="w-10 h-10 text-ink-300" />
          <p className="text-ink-400 text-sm">Nenhuma categoria cadastrada ainda.</p>
        </div>
      )}

      {!loading && categorias.length > 0 && (
        <div className="bg-white rounded-card border border-card-border shadow-card divide-y divide-card-border max-w-lg">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="px-4 py-3 flex items-center gap-3">
              <Image
                src={getCategoryIconSrc(categoria.nome, categoria.iconKey)}
                alt=""
                width={20}
                height={20}
                sizes="20px"
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0 flex-1 text-sm text-ink-700">{categoria.nome}</span>
              <button
                type="button"
                onClick={() => iniciarEdicao(categoria)}
                aria-label={`Editar categoria ${categoria.nome}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-bg-app"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
