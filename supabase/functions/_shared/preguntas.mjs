export const PREGUNTAS = [
  '¿Cuántas habitaciones disponibles hay?',
  '¿Cuántas reservas tiene cada estado?',
  '¿Qué tipo de habitación tiene más habitaciones?',
  '¿Cuáles son los servicios con mayor consumo?',
  '¿Cuánto suman los pagos registrados por reserva?',
  '¿Qué empleados tienen asignado cada cargo?',
  '¿Cuál es el promedio de las tarifas por noche?',
  'Visualizar el nombre y apellido del empleado, tipo de mantenimiento, número y piso de habitación realizadas a la fecha.',
  'Visualizar nombre de servicio y cantidad de los check-in del 2026.',
  'Visualizar la cantidad de días que cada cliente reserva con anterioridad a la fecha que va a usar el hotel.',
]
export const normalizarPregunta = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
// Este filtro reduce el envío accidental de identificadores; no identifica todos los nombres.
export function preguntaGenerica(texto) {
  if (typeof texto !== 'string' || texto.trim().length < 3 || texto.length > 500) return null
  const normal = normalizarPregunta(texto)
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(texto) || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(texto) || /\d{7,}/.test(texto)) return null
  if (/\b(documento|dni|pasaporte|telefono|direccion|correo|email|identificada|identificado)\b/.test(normal)) return null
  if (/\b(?:de|del|cliente|empleado)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/u.test(texto)) return null
  if (!/\b(hotel\w*|habitacion\w*|cuarto\w*|reserv\w*|client\w*|huesped\w*|estadia\w*|alojamiento\w*|hospedaje\w*|tarifa\w*|servicio\w*|consumo\w*|pago\w*|adelanto\w*|emplead\w*|cargo\w*|mantenimiento\w*|check[ -]?in|check[ -]?out)\b/.test(normal)) return null
  return texto.trim()
}
