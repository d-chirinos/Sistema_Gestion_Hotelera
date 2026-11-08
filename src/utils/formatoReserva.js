import { soles } from './moneda.js'

export const codigoReserva = (id) => `RES-${String(id).padStart(3, '0')}`

// Presenta las fechas ISO (AAAA-MM-DD) sin alterar el día por zonas horarias.
export const formatearFechaReserva = (fecha) => {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

export const formatearMontoReserva = (monto) =>
  soles(monto || 0)
