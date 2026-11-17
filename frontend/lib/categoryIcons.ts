export const CATEGORY_ICON_OPTIONS = [
  { key: 'folhas', label: 'Hortaliças', src: '/produce/icon-folha.png' },
  { key: 'frutas', label: 'Frutas', src: '/produce/icon-fruta.png' },
  { key: 'legumes', label: 'Legumes', src: '/produce/cenouras.png' },
  { key: 'doces', label: 'Doces', src: '/category-icons/doces.svg' },
  { key: 'laticinios', label: 'Laticínios', src: '/category-icons/laticinios.svg' },
  { key: 'paes-bolos', label: 'Pães e Bolos', src: '/category-icons/paes-bolos.svg' },
  { key: 'mel', label: 'Mel', src: '/category-icons/mel.svg' },
  { key: 'geleias-conservas', label: 'Geleias e Conservas', src: '/category-icons/geleias-conservas.svg' },
  { key: 'temperos-ervas', label: 'Temperos e Ervas', src: '/category-icons/temperos-ervas.svg' },
  { key: 'graos-cereais', label: 'Grãos e Cereais', src: '/category-icons/graos-cereais.svg' },
  { key: 'bebidas-sucos', label: 'Bebidas e Sucos', src: '/category-icons/bebidas-sucos.svg' },
  { key: 'carnes', label: 'Carnes', src: '/category-icons/carnes.svg' },
  { key: 'peixes', label: 'Peixes', src: '/category-icons/peixes.svg' },
  { key: 'ovos', label: 'Ovos', src: '/category-icons/ovos.svg' },
] as const

export type CategoryIconKey = (typeof CATEGORY_ICON_OPTIONS)[number]['key']

const aliases: Record<CategoryIconKey, string[]> = {
  folhas: ['hortalica', 'verdura', 'folha'],
  frutas: ['fruta'],
  legumes: ['legume', 'cenoura', 'vegetal'],
  doces: ['doce', 'doces caseiros', 'sobremesa', 'bolo', 'brigadeiro', 'doce de leite'],
  laticinios: ['laticinio', 'leite', 'queijo'],
  'paes-bolos': ['pao', 'paes', 'pães e bolos', 'padaria', 'panificado'],
  mel: ['mel', 'apicultura'],
  'geleias-conservas': ['geleia', 'conserva', 'compota', 'picles'],
  'temperos-ervas': ['tempero', 'erva', 'especiaria'],
  'graos-cereais': ['grao', 'cereal', 'semente'],
  'bebidas-sucos': ['bebida', 'suco', 'refresco'],
  carnes: ['carne', 'proteina animal', 'frango', 'linguica'],
  peixes: ['peixe', 'pescado', 'frutos do mar'],
  ovos: ['ovo', 'proteina', 'animal'],
}

function singularize(token: string): string {
  if (token === 'paes') return 'pao'
  if (token.endsWith('oes') && token.length > 4) return `${token.slice(0, -3)}ao`
  if (token.endsWith('ais') && token.length > 4) return `${token.slice(0, -3)}al`
  if (token.endsWith('eis') && token.length > 4) return `${token.slice(0, -3)}el`
  if (token.endsWith('s') && token.length > 3) return token.slice(0, -1)
  return token
}

function normalizeCategoryName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(singularize)
    .join(' ')
}

function matchesAlias(name: string, alias: string): boolean {
  const normalizedName = ` ${normalizeCategoryName(name)} `
  const normalizedAlias = ` ${normalizeCategoryName(alias)} `
  return normalizedName.includes(normalizedAlias)
}

export function getCategoryIconKey(name: string): CategoryIconKey | undefined {
  const orderedAliases = Object.entries(aliases)
    .flatMap(([key, values]) => values.map((alias) => ({ key: key as CategoryIconKey, alias })))
    .sort((a, b) => normalizeCategoryName(b.alias).length - normalizeCategoryName(a.alias).length)

  return orderedAliases.find(({ alias }) => matchesAlias(name, alias))?.key
}

export function getCategoryIconSrc(name: string, iconKey?: string | null): string {
  const selectedIcon = CATEGORY_ICON_OPTIONS.find((option) => option.key === iconKey)
    ?? CATEGORY_ICON_OPTIONS.find((option) => option.key === getCategoryIconKey(name))

  return selectedIcon?.src ?? '/produce/icon-folha.png'
}
