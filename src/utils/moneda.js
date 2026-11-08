const formato = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Solo presentación: no modifica los valores enviados a las RPC.
export function soles(valor, ausente = '—') {
  if (valor === null || valor === undefined || (typeof valor === 'string' && !valor.trim()) || !Number.isFinite(Number(valor))) return ausente
  return formato.format(Number(valor)).replace(/\u00a0/g, ' ')
}
