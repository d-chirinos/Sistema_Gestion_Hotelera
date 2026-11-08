// Lista cerrada: se envían al proveedor únicamente preguntas genéricas conocidas.
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
