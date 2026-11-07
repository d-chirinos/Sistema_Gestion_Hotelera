export function esClavePublica(clave) {
  if (typeof clave !== 'string') return false
  if (clave.startsWith('sb_publishable_')) return true
  // Las claves anon antiguas son JWT; descartar explícitamente JWT privilegiados.
  try {
    const partes = clave.split('.')
    if (partes.length !== 3) return false
    const contenido = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(contenido)).role === 'anon'
  } catch { return false }
}
