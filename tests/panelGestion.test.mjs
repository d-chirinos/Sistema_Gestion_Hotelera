import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mostrarCampo } from '../src/utils/mostrarCampo.js'

test('presenta fechas y montos sin inventar valores ausentes', () => {
  assert.equal(mostrarCampo('fecha_pago', '2026-11-08'), '08/11/2026')
  assert.equal(mostrarCampo('monto', '1250.50'), 'S/ 1,250.50')
  assert.equal(mostrarCampo('costo', null), 'No registrado')
  assert.equal(mostrarCampo('cantidad', 0), '0')
})
