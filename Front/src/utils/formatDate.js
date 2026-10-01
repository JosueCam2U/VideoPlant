export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'hace unos segundos'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 2592000) return `hace ${Math.floor(diff / 86400)} d`
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatViews(n) {
  n = Number(n) || 0
  if (n < 1000) return `${n} vistas`
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)} K vistas`
  return `${(n / 1_000_000).toFixed(1)} M vistas`
}

export default formatDate