export function fechaHotel(ahora, zona) {
  if (!zona) return null
  try {
    const partes = new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(ahora)
    const valor = tipo => partes.find(p => p.type === tipo)?.value
    const iso = `${valor('year')}-${valor('month')}-${valor('day')}`
    return { iso, texto: new Intl.DateTimeFormat('es-PE', { timeZone: zona, day: 'numeric', month: 'long', year: 'numeric' }).format(ahora) }
  } catch { return null }
}
export function proximasReservas(reservas, hoy) {
  if (!hoy) return []
  return reservas.filter(r => r.estado === 'CONFIRMADA' && /^\d{4}-\d{2}-\d{2}$/.test(r.fecha_entrada ?? '') && r.fecha_entrada >= hoy).sort((a, b) => a.fecha_entrada.localeCompare(b.fecha_entrada) || String(a.id_reserva).localeCompare(String(b.id_reserva), 'es', { numeric: true })).slice(0, 4)
}
export function pagosRecientes(pagos) {
  return [...pagos].sort((a, b) => String(b.fecha_pago ?? '').localeCompare(String(a.fecha_pago ?? '')) || String(b.fecha_hora_pago ?? '').localeCompare(String(a.fecha_hora_pago ?? '')) || String(b.id_pago).localeCompare(String(a.id_pago), 'es', { numeric: true })).slice(0, 4)
}
