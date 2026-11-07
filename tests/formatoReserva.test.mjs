import test from 'node:test'
import assert from 'node:assert/strict'
import { codigoReserva, formatearFechaReserva, formatearMontoReserva } from '../src/utils/formatoReserva.js'

test('el código conserva el relleno y no trunca identificadores largos', () => {
  assert.equal(codigoReserva(1), 'RES-001')
  assert.equal(codigoReserva(0), 'RES-000')
  assert.equal(codigoReserva(999), 'RES-999')
  assert.equal(codigoReserva(1000), 'RES-1000')
  assert.equal(codigoReserva('07'), 'RES-007')
})

test('la fecha se presenta sin convertir zonas horarias ni validar el calendario', () => {
  assert.equal(formatearFechaReserva('2026-11-06'), '06/11/2026')
  assert.equal(formatearFechaReserva('2024-02-29'), '29/02/2024')
  assert.equal(formatearFechaReserva('2026-02-31'), '31/02/2026')
  assert.equal(formatearFechaReserva(''), '—')
  assert.equal(formatearFechaReserva(null), '—')
  assert.equal(formatearFechaReserva('2026-11'), 'undefined/11/2026')
})

test('el monto conserva dos decimales, signo y tratamiento de valores ausentes', () => {
  assert.equal(formatearMontoReserva(1234.5), 'S/ 1,234.50')
  assert.equal(formatearMontoReserva('12.3'), 'S/ 12.30')
  assert.equal(formatearMontoReserva(-12.5), 'S/ -12.50')
  assert.equal(formatearMontoReserva(0), 'S/ 0.00')
  assert.equal(formatearMontoReserva(null), 'S/ 0.00')
  assert.equal(formatearMontoReserva(''), 'S/ 0.00')
  assert.equal(formatearMontoReserva('no-numero'), 'S/ NaN')
})
