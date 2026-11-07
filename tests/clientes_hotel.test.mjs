import test from 'node:test'
import assert from 'node:assert/strict'
import { claveReserva, clientesHotel } from '../src/supabase/clientes.js'
test('la clave de reserva es un entero exacto en JavaScript', () => {
  const cryptoAPI = { getRandomValues: a => { a[0] = 0xffffffff; a[1] = 0xffffffff; return a } }
  const id = claveReserva(cryptoAPI)
  assert.equal(id, '9007199254740991')
  assert.equal(String(Number(id)), id)
})
test('la consulta solo usa la RPC acotada y rechaza respuestas incompletas', async () => {
  const llamadas = []
  const cliente = { rpc: nombre => { llamadas.push(nombre); return { range: async () => ({ data: [{ id_cliente: 1 }], error: null }) } } }
  assert.equal((await clientesHotel(cliente)).length, 1)
  assert.deepEqual(llamadas, ['listar_clientes_mi_hotel'])
  await assert.rejects(clientesHotel({ rpc: () => ({ range: async () => ({ data: null, error: {} }) }) }))
})
