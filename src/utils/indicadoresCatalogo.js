import { soles } from './moneda.js'

const numeroValido = valor => valor !== null && valor !== undefined && String(valor).trim() !== '' && Number.isFinite(Number(valor))
const promedio = valores => valores.reduce((total, valor) => total + valor, 0) / valores.length

export function resumirTipos(tipos, habitaciones) {
  const capacidades = tipos.map(t => t.capacidad).filter(numeroValido).map(Number)
  const completas = capacidades.length === tipos.length && capacidades.length > 0
  const cuenta = tipos.map(tipo => ({ nombre: tipo.nombre, cantidad: tipo.id_tipo == null ? 0 : habitaciones.filter(h => h.tipo_habitacion_id_tipo != null && String(h.tipo_habitacion_id_tipo) === String(tipo.id_tipo)).length }))
  const mayor = Math.max(0, ...cuenta.map(t => t.cantidad))
  const lideres = cuenta.filter(t => t.cantidad === mayor && typeof t.nombre === 'string' && t.nombre.trim())
  return {
    registrados: tipos.length,
    capacidadMaxima: completas ? Math.max(...capacidades) : '—',
    capacidadPromedio: completas ? new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(promedio(capacidades)) : '—',
    tipoMasHabitaciones: mayor > 0 && lideres.length ? lideres.map(t => t.nombre).join(', ') : '—',
    cantidadMayor: mayor > 0 && lideres.length ? mayor : null,
  }
}

export function resumirTarifas(tarifas) {
  const precios = tarifas.map(t => t.precio_noche).filter(numeroValido).map(Number)
  const completas = precios.length === tarifas.length && precios.length > 0
  return {
    registrados: tarifas.length,
    minimo: completas ? soles(Math.min(...precios)) : '—',
    maximo: completas ? soles(Math.max(...precios)) : '—',
    promedio: completas ? soles(promedio(precios)) : '—',
  }
}
