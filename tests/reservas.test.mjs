import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearConsultaReservas, crearCotizadorReservas } from '../src/supabase/reservas.js'

test('lista reservas únicamente con la RPC protegida y pagina', async () => {
  const llamadas = []
  const cliente = { rpc(nombre, parametros) {
    llamadas.push([nombre, parametros])
    return { range: async (inicio) => ({ data: inicio === 0 ? Array.from({ length: 200 }, (_, i) => ({ id_reserva: i })) : [{ id_reserva: 200 }], error: null }) }
  } }
  const datos = await crearConsultaReservas(cliente)()
  assert.equal(datos.length, 201)
  assert.deepEqual(llamadas, [['listar_reservas_mi_hotel', undefined], ['listar_reservas_mi_hotel', undefined]])
})

test('los errores o datos inválidos no producen una lista parcial', async () => {
  const fallo = crearConsultaReservas({ rpc: () => ({ range: async () => ({ data: null, error: { status: 401 } }) }) })
  await assert.rejects(fallo(), e => e.status === 401)
  const respuestaInvalida = crearConsultaReservas({ rpc: () => ({ range: async () => ({ data: {}, error: null }) }) })
  await assert.rejects(respuestaInvalida(), /inválida/)
})


test('cotiza mediante RPC con habitación y fechas, sin seleccionar hotel ni escribir', async () => {
  const llamadas = []
  const cotizar = crearCotizadorReservas({ rpc: async (nombre, parametros) => {
    llamadas.push([nombre, parametros])
    return { data: [{ precio_noche: 100, noches: 2, total: 200 }], error: null }
  } })
  assert.equal((await cotizar({ habitacion: '1', entrada: '2027-01-01', salida: '2027-01-03' })).total, 200)
  assert.deepEqual(llamadas, [['cotizar_reserva', { p_habitacion_id: '1', p_entrada: '2027-01-01', p_salida: '2027-01-03' }]])
  const falla = crearCotizadorReservas({ rpc: async () => ({ data: [], error: null }) })
  await assert.rejects(falla({}), /inválida/)
})
