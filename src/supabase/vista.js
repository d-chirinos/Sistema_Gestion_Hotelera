export const SECCIONES = [
  { id: 'dashboard', titulo: 'Dashboard', disponible: true },
  { id: 'consultas_sql', titulo: 'Consultas SQL', disponible: true },
  { id: 'hotel', titulo: 'Mi hotel', disponible: true },
  { id: 'reservas', titulo: 'Reservas', disponible: false },
  { id: 'estadias', titulo: 'Estadías', disponible: false },
  { id: 'habitacion', titulo: 'Habitaciones', disponible: true },
  { id: 'clientes', titulo: 'Clientes', disponible: false },
  { id: 'servicio', titulo: 'Servicios', disponible: true },
  { id: 'consumos', titulo: 'Consumos', disponible: false },
  { id: 'pagos', titulo: 'Pagos', disponible: false },
  { id: 'mantenimiento', titulo: 'Mantenimiento', disponible: false },
  { id: 'empleados', titulo: 'Empleados', disponible: false },
  { id: 'cargos', titulo: 'Cargos', disponible: false },
]

export function validarDatosHotel(datos, hotelId) {
  if (!datos || !Array.isArray(datos.hotel) || datos.hotel.length !== 1 || String(datos.hotel[0].id_hotel) !== String(hotelId)) return false
  return ['habitacion', 'tarifa_habitacion', 'servicio'].every(recurso =>
    Array.isArray(datos[recurso]) && datos[recurso].every(fila => fila.hotel_id_hotel != null && String(fila.hotel_id_hotel) === String(hotelId))) && Array.isArray(datos.tipo_habitacion)
}

export function resumenHabitaciones(habitaciones) {
  return [
    { titulo: 'Total de habitaciones', valor: habitaciones.length, icono: '▤', clase: 'reservation-stat-total', detalle: 'Habitaciones registradas' },
    { titulo: 'Disponibles', valor: habitaciones.filter(h => h.estado === 'DISPONIBLE').length, icono: '✓', clase: 'rooms-stat-available', detalle: 'Estado disponible' },
    { titulo: 'Ocupadas', valor: habitaciones.filter(h => h.estado === 'OCUPADA').length, icono: '▣', clase: 'rooms-stat-occupied', detalle: 'Estado ocupado' },
    { titulo: 'En mantenimiento', valor: habitaciones.filter(h => h.estado === 'MANTENIMIENTO').length, icono: '⚒', clase: 'rooms-stat-maintenance', detalle: 'Estado mantenimiento' },
  ]
}
