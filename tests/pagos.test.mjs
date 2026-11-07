import test from 'node:test'
import assert from 'node:assert/strict'
import { crearPagos } from '../src/supabase/pagos.js'
function fixture() {
  const datos = new Map(), llamadas = []
  let error = true
  const storage = { getItem: key => datos.get(key) ?? null, setItem: (key, value) => datos.set(key, value), removeItem: key => datos.delete(key) }
  const cliente = { auth: { getUser: async () => ({ data: { user: { id: 'usuario-prueba' } } }) }, rpc: async (nombre, params) => { llamadas.push([nombre, params]); return error ? { error: {} } : { data: [{ id_pago: 10, repetido: true }] } } }
  const pagos = crearPagos({ cliente, almacenamiento: storage, bloqueos: { request: async (_nombre, _opciones, fn) => fn({}) }, uuid: () => 'uuid-prueba' })
  return { pagos, llamadas, datos, habilitar: () => { error = false } }
}
test('una respuesta perdida conserva la intención y reutiliza exactamente la clave', async () => {
  const f = fixture(), form = { reserva: '1', monto: '10.5', metodo: ' Efectivo ' }
  await assert.rejects(f.pagos.registrar(form))
  assert.equal((await f.pagos.pendiente()).clave, 'uuid-prueba')
  await assert.rejects(f.pagos.registrar({ ...form, monto: '11' }))
  f.habilitar()
  const resultado = await f.pagos.registrar(null)
  assert.equal(resultado.id_pago, 10)
  assert.deepEqual(f.llamadas[0], f.llamadas[1])
  assert.equal(await f.pagos.pendiente(), null)
})
test('rechaza datos incorrectos y no envía si no puede persistir la intención', async () => {
  const f = fixture()
  await assert.rejects(f.pagos.registrar({ reserva: '1', monto: '-2', metodo: 'Efectivo' }))
  assert.equal(f.llamadas.length, 0)
  const cliente = { auth: { getUser: async () => ({ data: { user: { id: 'test' } } }) }, rpc: () => { throw Error('no debe enviarse') } }
  const pagos = crearPagos({ cliente, almacenamiento: { getItem: () => null, setItem: () => { throw Error('bloqueado') } }, bloqueos: { request: async (_n, _opciones, fn) => fn({}) }, uuid: () => 'u' })
  await assert.rejects(pagos.registrar({ reserva: '1', monto: '2', metodo: 'Efectivo' }))
})

test('rechaza un segundo envío cuando otra pestaña tiene el bloqueo', async () => {
  let llamadas = 0
  const cliente = { auth: { getUser: async () => ({ data: { user: { id: 'test' } } }) }, rpc: () => { llamadas++; throw Error('no debe enviarse') } }
  const pagos = crearPagos({ cliente, almacenamiento: { getItem: () => null }, bloqueos: { request: async (_n, opciones, fn) => { assert.equal(opciones.ifAvailable, true); return fn(null) } }, uuid: () => 'u' })
  await assert.rejects(pagos.registrar({ reserva: '1', monto: '2', metodo: 'Efectivo' }))
  assert.equal(llamadas, 0)
})
