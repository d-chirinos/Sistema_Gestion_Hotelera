import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resumirTipos, resumirTarifas } from '../src/utils/indicadoresCatalogo.js'

test('resume tipos y respeta los empates de habitaciones', () => {
  const tipos = [{ id_tipo: 1, nombre: 'Doble', capacidad: 2 }, { id_tipo: 2, nombre: 'Suite', capacidad: 4 }]
  const habitaciones = [{ tipo_habitacion_id_tipo: 1 }, { tipo_habitacion_id_tipo: 2 }]
  assert.deepEqual(resumirTipos(tipos, habitaciones), { registrados: 2, capacidadMaxima: 4, capacidadPromedio: '3', tipoMasHabitaciones: 'Doble, Suite', cantidadMayor: 1 })
  assert.equal(resumirTipos(tipos, []).tipoMasHabitaciones, '—')
  assert.equal(resumirTipos([{ id_tipo: 1, capacidad: null }], []).capacidadPromedio, '—')
  assert.equal(resumirTipos([], []).capacidadMaxima, '—')
})

test('presenta tarifas en PEN y no inventa valores ausentes', () => {
  assert.deepEqual(resumirTarifas([{ precio_noche: '100.00' }, { precio_noche: '150.50' }]), { registrados: 2, minimo: 'S/ 100.00', maximo: 'S/ 150.50', promedio: 'S/ 125.25' })
  assert.equal(resumirTarifas([]).promedio, '—')
  assert.equal(resumirTarifas([{ precio_noche: null }]).minimo, '—')
})
