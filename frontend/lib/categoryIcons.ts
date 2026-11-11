export function getCategoryIconSrc(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalized.includes('hortal') || normalized.includes('verdura') || normalized.includes('folha')) {
    return '/produce/icon-folha.png'
  }
  if (normalized.includes('fruta')) return '/produce/icon-fruta.png'
  if (normalized.includes('legume') || normalized.includes('cenoura') || normalized.includes('vegetal')) {
    return '/produce/cenouras.png'
  }
  if (
    normalized.includes('proteina') ||
    normalized.includes('ovo') ||
    normalized.includes('carne') ||
    normalized.includes('animal')
  ) {
    return '/produce/icon-ovos.png'
  }
  if (normalized.includes('tempero') || normalized.includes('erva') || normalized.includes('grao')) {
    return '/produce/icon-graos.png'
  }

  return '/produce/icon-folha.png'
}
