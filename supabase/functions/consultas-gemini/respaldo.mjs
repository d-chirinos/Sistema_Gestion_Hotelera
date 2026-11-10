import { PREGUNTAS, normalizarPregunta } from '../_shared/preguntas.mjs'

// Solo se usan cuando la pregunta coincide con un enunciado completo conocido.
// No se interpolan datos del usuario en estas consultas.
const ejercicios = [
  {
    pregunta: PREGUNTAS[7],
    sql: 'SELECT e.nombre, e.apellido, m.tipo, h.numero, h.piso FROM hotel_consultas.mantenimiento m JOIN hotel_consultas.empleado e ON e.id_empleado = m.empleado_id_empleado JOIN hotel_consultas.habitacion h ON h.id_habitacion = m.habitacion_id_habitacion WHERE m.fecha_inicio <= CURRENT_DATE',
    explicacion: 'Consulta de respaldo predefinida: relaciona mantenimientos con su empleado y habitación. Incluye registros iniciados hasta CURRENT_DATE, la fecha de la sesión PostgreSQL, que puede diferir de la fecha local del hotel.',
  },
  {
    pregunta: PREGUNTAS[8],
    sql: "SELECT s.nombre, SUM(c.cantidad) AS cantidad FROM hotel_consultas.servicio s JOIN hotel_consultas.consumo_servicio c ON c.servicio_id_servicio = s.id_servicio JOIN hotel_consultas.estadia e ON e.id_estadia = c.estadia_id_estadia WHERE e.fecha_checkin >= DATE '2026-01-01' AND e.fecha_checkin < DATE '2027-01-01' GROUP BY s.nombre",
    explicacion: 'Consulta de respaldo predefinida: relaciona servicios, consumos y estadías con check-in en 2026. Interpreta cantidad como la suma de unidades consumidas por servicio, no como el número de check-ins.',
  },
  {
    pregunta: PREGUNTAS[9],
    sql: 'SELECT c.nombre, c.apellido, r.id_reserva, r.fecha_entrada - r.fecha_reserva AS dias FROM hotel_consultas.cliente c JOIN hotel_consultas.reserva r ON r.cliente_id_cliente = c.id_cliente',
    explicacion: 'Consulta de respaldo predefinida: muestra una fila por reserva y resta fecha de reserva de fecha de entrada para calcular los días de anticipación. Un valor nulo indica que falta alguna fecha.',
  },
]
const clave = texto => normalizarPregunta(texto).replace(/[¿?¡!.,]/g, '').replace(/\s+/g, ' ').trim()
export function respaldoAcademico(texto) {
  const ejercicio = ejercicios.find(item => clave(item.pregunta) === clave(texto))
  return ejercicio ? { sql: ejercicio.sql, explicacion: ejercicio.explicacion } : null
}
export function quitarCercoSQL(sql) {
  const coincidencia = sql.trim().match(/^```(?:sql|postgresql)?[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/i)
  return coincidencia ? coincidencia[1].trim() : sql
}
