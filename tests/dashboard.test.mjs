import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fechaHotel, proximasReservas, pagosRecientes } from '../src/dashboardDatos.js'

test('el día del hotel usa su zona horaria y no inventa una zona inválida', () => {
  const instante = new Date('2026-11-08T02:00:00Z')
  assert.equal(fechaHotel(instante, 'America/Lima').iso, '2026-11-07')
  assert.equal(fechaHotel(instante, 'America/Mexico_City').iso, '2026-11-07')
  assert.equal(fechaHotel(instante, 'zona inválida'), null)
})

test('próximas reservas incluye solo confirmadas futuras y ordena por fecha', () => {
  const reservas = [
    { id_reserva: 2, estado: 'CONFIRMADA', fecha_entrada: '2026-11-12' },
    { id_reserva: 3, estado: 'CANCELADA', fecha_entrada: '2026-11-08' },
    { id_reserva: 4, estado: 'CONFIRMADA', fecha_entrada: '2026-11-01' },
    { id_reserva: 1, estado: 'CONFIRMADA', fecha_entrada: '2026-11-08' },
  ]
  assert.deepEqual(proximasReservas(reservas, '2026-11-08').map(r => r.id_reserva), [1, 2])
  assert.deepEqual(proximasReservas(reservas, null), [])
})

test('ordena pagos sin mutar el resultado original', () => {
  const pagos = [{ id_pago: 1, fecha_pago: '2026-01-01' }, { id_pago: 2, fecha_pago: '2026-02-01' }]
  assert.deepEqual(pagosRecientes(pagos).map(p => p.id_pago), [2, 1])
  assert.equal(pagos[0].id_pago, 1)
})
