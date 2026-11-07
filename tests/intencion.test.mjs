import test from 'node:test'
import assert from 'node:assert/strict'
import { crearIntencion, identificadorOperacion } from '../src/supabase/intencion.js'

test('usa identificadores grandes como texto y los mantiene al reintentar', async () => {
  const almacen = new Map(), llamadas = []
  const almacenamiento = { getItem: k => almacen.get(k) ?? null, setItem: (k, v) => almacen.set(k, v), removeItem: k => almacen.delete(k) }
  const cryptoAPI = { getRandomValues: v => { v[0] = 0xffffffff; v[1] = 0xffffffff; return v } }
  const id = identificadorOperacion(cryptoAPI)
  assert.equal(id, '4611686018427387903')
  let fallo = true
  const cliente = { auth: { getUser: async () => ({ data: { user: { id: 'prueba' } } }) }, rpc: async (_rpc, args) => { llamadas.push(args); return fallo ? { error: {} } : { data: [{ id_consumo: id, repetido: true }] } } }
  const servicio = crearIntencion({ cliente, almacenamiento, bloqueos: { request: async (_k, _o, f) => f({}) }, cryptoAPI, operacion: 'consumo', rpc: 'registrar', idRespuesta: 'id_consumo' })
  await assert.rejects(servicio.ejecutar({ p_estadia: '5', p_cantidad: 2 }))
  await assert.rejects(servicio.ejecutar({ p_estadia: '5', p_cantidad: 3 }))
  assert.equal((await servicio.pendiente()).clave, id)
  fallo = false
  assert.equal((await servicio.ejecutar(null)).id_consumo, id)
  assert.deepEqual(llamadas[0], llamadas[1])
  assert.equal(await servicio.pendiente(), null)
})

test('no envía sin bloqueo del navegador', async () => {
  let llamadas = 0
  const cliente = { auth: { getUser: async () => ({ data: { user: { id: 'prueba' } } }) }, rpc: () => { llamadas++ } }
  const servicio = crearIntencion({ cliente, almacenamiento: {}, bloqueos: null, cryptoAPI: {}, operacion: 'consumo' })
  await assert.rejects(servicio.ejecutar({}))
  assert.equal(llamadas, 0)
})
