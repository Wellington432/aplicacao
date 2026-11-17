'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, FolderTree, Pencil, Plus, Upload, X } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import { api, getApiErrorMessage } from '@/lib/api'
import { Categoria } from '@/lib/types'
import PrimaryButton from '@/components/PrimaryButton'
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIconKey,
  getCategoryIconSrc,
  normalizeCategoryNameForComparison,
} from '@/lib/categoryIcons'

const MAX_ICON_SIZE = 1024 * 1024
const ALLOWED_ICON_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [nome, setNome] = useState('')
  const [iconKey, setIconKey] = useState<string | null>(null)
  const [hasUserProvidedName, setHasUserProvidedName] = useState(false)
  const [customIconSelected, setCustomIconSelected] = useState(false)
  const [uploadedIcon, setUploadedIcon] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState('')
  const [removeCurrentIcon, setRemoveCurrentIcon] = useState(false)
  const [previousIconKeyForUpload, setPreviousIconKeyForUpload] = useState<string | null>(null)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)
  const iconInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!uploadedIcon) {
      setUploadPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(uploadedIcon)
    setUploadPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [uploadedIcon])

  function limparFormulario() {
    setNome('')
    setIconKey(null)
    setHasUserProvidedName(false)
    setCustomIconSelected(false)
    setUploadedIcon(null)
    setRemoveCurrentIcon(false)
    setPreviousIconKeyForUpload(null)
    setEditing(null)
  }

  function iniciarEdicao(categoria: Categoria) {
    const savedIconKey = CATEGORY_ICON_OPTIONS.some((option) => option.key === categoria.iconKey)
      ? categoria.iconKey ?? null
      : null
    setEditing(categoria)
    setNome(categoria.nome)
    setHasUserProvidedName(true)
    setIconKey(categoria.iconUrl ? null : savedIconKey ?? getCategoryIconKey(categoria.nome) ?? null)
    setCustomIconSelected(Boolean(categoria.iconUrl))
    setUploadedIcon(null)
    setRemoveCurrentIcon(false)
    setPreviousIconKeyForUpload(null)
    setNotice('')
    setError('')
  }

  function selecionarIcone(option: (typeof CATEGORY_ICON_OPTIONS)[number]) {
    if (!hasUserProvidedName) setNome(option.defaultName)
    setIconKey(option.key)
    setCustomIconSelected(false)
    setUploadedIcon(null)
    setRemoveCurrentIcon(Boolean(editing?.iconUrl))
    setPreviousIconKeyForUpload(null)
  }

  function handleIconUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_ICON_TYPES.has(file.type)) {
      setError('Formato inválido. Envie um arquivo PNG, JPG, WEBP ou SVG.')
      return
    }
    if (file.size > MAX_ICON_SIZE) {
      setError('O ícone deve ter no máximo 1 MB.')
      return
    }

    setError('')
    setPreviousIconKeyForUpload(iconKey)
    setUploadedIcon(file)
    setCustomIconSelected(true)
    setIconKey(null)
    setRemoveCurrentIcon(Boolean(editing?.iconUrl))
  }

  function removerIconeEnviado() {
    const restoredIconKey = editing?.iconUrl
      ? null
      : previousIconKeyForUpload ?? getCategoryIconKey(nome) ?? null
    setUploadedIcon(null)
    setCustomIconSelected(false)
    setIconKey(restoredIconKey)
    setRemoveCurrentIcon(Boolean(editing?.iconUrl))
    setPreviousIconKeyForUpload(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    const normalizedName = normalizeCategoryNameForComparison(nome)
    if (!normalizedName) {
      setError('Informe o nome da categoria.')
      return
    }

    const duplicate = categorias.find(
      (categoria) =>
        categoria.id !== editing?.id &&
        normalizeCategoryNameForComparison(categoria.nome) === normalizedName,
    )
    if (duplicate) {
      setError(`Já existe uma categoria chamada "${duplicate.nome}".`)
      return
    }

    setSaving(true)
    try {
      let cleanupWarning: string | undefined
      if (editing) {
        if (uploadedIcon) {
          const formData = new FormData()
          formData.append('id', editing.id)
          formData.append('nome', nome.trim())
          formData.append('icon', uploadedIcon)
          const { data } = await api.put<Categoria & { warning?: string }>('/atualizacategoria', formData)
          cleanupWarning = data.warning
        } else {
          const { data } = await api.put<Categoria & { warning?: string }>('/atualizacategoria', {
            id: editing.id,
            nome: nome.trim(),
            iconKey,
            removeIcon: removeCurrentIcon,
          })
          cleanupWarning = data.warning
        }
      } else {
        if (uploadedIcon) {
          const formData = new FormData()
          formData.append('nome', nome.trim())
          formData.append('icon', uploadedIcon)
          await api.post('/novacategoria', formData)
        } else {
          await api.post('/novacategoria', { nome: nome.trim(), iconKey })
        }
      }
      limparFormulario()
      await carregar()
      if (cleanupWarning) setNotice(cleanupWarning)
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
      {notice && (
        <p role="status" className="p-3 rounded-input bg-horta-medium/10 border border-horta-medium/25 text-horta-dark text-sm">
          {notice}
        </p>
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
              setHasUserProvidedName(Boolean(nextName.trim()))
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
              const selected = !customIconSelected && iconKey === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-label={`Usar ícone ${option.defaultName}`}
                  aria-pressed={selected}
                  onClick={() => selecionarIcone(option)}
                  className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-input border p-2 transition-colors ${
                    selected
                      ? 'border-horta-medium bg-horta-medium/10 ring-2 ring-horta-medium'
                      : 'border-input-border hover:bg-bg-app'
                  }`}
                >
                  <Image src={option.src} alt="" width={40} height={40} sizes="40px" className="h-10 w-10 object-contain" />
                  <span className="text-center text-[10px] leading-tight text-ink-600">{option.defaultName}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleIconUpload}
              className="sr-only"
              tabIndex={-1}
              aria-label="Enviar imagem de ícone"
            />
            <button
              type="button"
              aria-pressed={customIconSelected}
              onClick={() => iconInputRef.current?.click()}
              className={`inline-flex h-10 items-center gap-2 rounded-input border px-3 text-xs font-medium transition-colors ${
                customIconSelected
                  ? 'border-horta-medium bg-horta-medium/10 text-horta-dark'
                  : 'border-input-border text-ink-600 hover:bg-bg-app'
              }`}
            >
              <Upload className="h-4 w-4" />
              Enviar meu próprio ícone
            </button>
            <span className="text-xs text-ink-400">PNG, JPG, WEBP ou SVG · até 1 MB</span>
          </div>

          {customIconSelected && (
            <div className="flex items-start gap-3">
              <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-card border border-card-border bg-white">
                <Image
                  src={uploadPreview || editing?.iconUrl || getCategoryIconSrc(nome, iconKey)}
                  alt="Prévia do ícone da categoria"
                  fill
                  sizes="128px"
                  unoptimized={Boolean(uploadPreview)}
                  className="object-contain p-3"
                />
              </div>
              <button
                type="button"
                onClick={removerIconeEnviado}
                className="inline-flex h-9 items-center gap-1.5 rounded-input border border-input-border px-3 text-xs font-medium text-ink-600 hover:bg-bg-app"
              >
                <X className="h-4 w-4" />
                Remover ícone enviado
              </button>
            </div>
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
          <PrimaryButton type="submit" loading={saving} disabled={!nome.trim()} className="w-full sm:w-auto px-5 h-11">
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
                src={getCategoryIconSrc(categoria.nome, categoria.iconKey, categoria.iconUrl)}
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
