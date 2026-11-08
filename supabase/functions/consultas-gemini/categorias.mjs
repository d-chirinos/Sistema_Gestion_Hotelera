import { parse } from 'pgsql-ast-parser'

const categorias = {
  habitacion: { columna: 'estado', valores: new Set(['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO']) },
  reserva: { columna: 'estado', valores: new Set(['CONFIRMADA', 'COMPLETADA', 'CANCELADA']) },
  pago: { columna: 'tipo_pago', valores: new Set(['ADELANTO', 'ORDINARIO']) },
}

// Solo detecta comparaciones directas en consultas de una única vista. No cambia
// el SQL: en JOIN, CTE y expresiones complejas podría ser ambiguo inferir la columna.
export function mayusculasCategoricasIncorrectas(sql) {
  const [s] = parse(sql)
  if (s?.type !== 'select' || s.from?.length !== 1) return false
  const fuente = s.from[0], nombre = fuente.name
  if (fuente.type !== 'table' || nombre?.schema !== 'hotel_consultas' || fuente.join) return false
  const categoria = categorias[nombre.name]
  if (!categoria) return false
  function revisar(n) {
    if (!n || typeof n !== 'object') return false
    if (n.type === 'binary' && ['=', '!=', '<>'].includes(n.op)) {
      for (const [ref, literal] of [[n.left, n.right], [n.right, n.left]]) {
        const calificador = ref?.table?.name
        if (ref?.type === 'ref' && ref.name === categoria.columna && (!calificador || calificador === (nombre.alias || nombre.name)) && literal?.type === 'string' && categoria.valores.has(literal.value.toUpperCase()) && literal.value !== literal.value.toUpperCase()) return true
      }
    }
    return Object.values(n).some(v => Array.isArray(v) ? v.some(revisar) : revisar(v))
  }
  return revisar(s.where)
}
