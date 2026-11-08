import { soles } from './moneda.js'
const MONEDA = new Set(['precio', 'precio_noche', 'monto', 'subtotal', 'precio_unitario_aplicado', 'costo'])
export function mostrarCampo(campo, valor) {
  if (valor == null || valor === '') return 'No registrado'
  if (MONEDA.has(campo)) return soles(valor)
  if (campo.startsWith('fecha_') && /^\d{4}-\d{2}-\d{2}$/.test(String(valor))) return String(valor).split('-').reverse().join('/')
  return String(valor)
}
