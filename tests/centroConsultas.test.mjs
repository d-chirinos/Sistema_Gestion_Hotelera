import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONSULTAS, CATALOGO } from '../src/consultas/catalogo.js'
import { resultadosCSV } from '../src/consultas/csv.js'
import { crearConsultaIA } from '../src/consultas/servicio.js'

test('biblioteca incluye categorías y señala el esquema propuesto', () => {
  assert.ok(CONSULTAS.length >= 15)
  assert.deepEqual(new Set(CONSULTAS.map(c => c.categoria)), new Set(['Básicas', 'JOIN', 'Agregación', 'Avanzadas']))
  assert.ok(CONSULTAS.every(c => c.sql.includes('hotel_consultas.') && c.explicacion))
  assert.match(CATALOGO, /cuenta_empleado/)
})

test('CSV escapa valores, preserva cabeceras y neutraliza fórmulas', () => {
  const csv = resultadosCSV(['nombre', 'valor'], [{ nombre: 'Texto, "prueba"', valor: '=HYPERLINK(1)' }, { nombre: null, valor: 10 }])
  assert.match(csv, /"Texto, ""prueba""","'=HYPERLINK\(1\)"/)
  assert.match(csv, /"","10"/)
})

test('invoca Gemini solo con la intención válida y rechaza errores', async () => {
  const llamadas = []
  const cliente = { functions: { invoke: async (nombre, opciones) => { llamadas.push({ nombre, opciones }); return { data: { sql: 'SELECT 1', explicacion: 'Explicación' } } } } }
  const ia = crearConsultaIA(cliente)
  assert.equal((await ia('generar', 'Reservas por estado')).sql, 'SELECT 1')
  assert.equal(llamadas[0].nombre, 'consultas-gemini')
  await assert.rejects(() => ia('ejecutar', 'DELETE FROM reserva'))
  await assert.rejects(() => ia('generar', 'x'))
  await assert.rejects(() => crearConsultaIA({ functions: { invoke: async () => ({ error: true }) } })('explicar', 'SELECT 1'))
})
