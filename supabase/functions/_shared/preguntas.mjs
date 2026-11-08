export const PREGUNTAS = [
  '¿Cuántas habitaciones disponibles hay?',
  '¿Cuántas reservas tiene cada estado?',
  '¿Qué tipo de habitación tiene más habitaciones?',
  '¿Cuáles son los servicios con mayor consumo?',
  '¿Cuánto suman los pagos registrados por reserva?',
  '¿Qué empleados tienen asignado cada cargo?',
  '¿Cuál es el promedio de las tarifas por noche?',
]
export const normalizarPregunta = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').replace(/[¿?¡!.,]/g, '').replace(/\s+/g, ' ').trim()
// Vocabulario genérico: evita enviar nombres, documentos, direcciones o valores introducidos por usuarios.
const palabras = new Set('a al agrupada agrupadas agrupado agrupados agrupa agrupar agrupen al alojamiento ambito año anuales antes apellido aqui asi asignada asignadas asignado asignados asociados asociadas asociados autorizada autorizadas autorizado autorizados promedio bajo buscar cada calcular calcula cancelada canceladas cancelado cancelados cantidad cargo cargos checkin checkout cliente clientes como comparacion comparar completada completadas completado completados con confirmado confirmada confirmadas confirmados conocer consumo consumos contadas contados contar cuantos cuantas cuanta cuanto cuales cual cuantos de del departamento disponibles disponible distribucion donde durante el ella empleado empleados en entrada entradas entre es estan estado estados estadia estadias estos esta estas este fecha fechas fin fueron ha han hay habitacion habitaciones hasta hotel hoteles importe importes ingreso ingresos intervencion intervenciones la las listado listada listadas listados listar los mas mayor mayores menor menores menos mes meses mostrar muestra muestre nombre nombres noche noches numero numeros ocupada ocupadas ocupado ocupados ordinario ordinarios orden ordenada ordenadas ordenado ordenados ordenar pagos pago para pendientes por precio precios promedio que registrada registradas registrado registrados relacion relacionadas relacionados responsables responsable reserva reservas resultado resumen salida salidas se servicio servicios sin son su sus suma sumar suman tarifa tarifas tenga tengan tienen tiene tipo tipos total totales todo todas todos una un y yo quiero ver necesito cuentame indicame dime dame indicame obtener obtiene obtenerse lista listar mayor media minimo maximo arriba abajo ascendentes descendentes agrupados'.split(' '))
export function preguntaGenerica(texto) {
  if (typeof texto !== 'string' || texto.length < 3 || texto.length > 500) return null
  const normal = normalizarPregunta(texto)
  if (!/^[a-z\s]+$/.test(normal)) return null
  const tokens = normal.split(' ')
  if (tokens.length < 3 || tokens.length > 80 || tokens.some(t => !palabras.has(t))) return null
  return normal
}
