import { test } from 'node:test'
import assert from 'node:assert/strict'
import { soles } from '../src/utils/moneda.js'

test('presenta importes en PEN sin interpretar datos ausentes como cero', () => {
  assert.equal(soles('1250.50'), 'S/ 1,250.50')
  assert.equal(soles(0), 'S/ 0.00')
  assert.equal(soles('-42.25'), '-S/ 42.25')
  assert.equal(soles(null), '—')
  assert.equal(soles(''), '—')
  assert.equal(soles('inválido'), '—')
})
