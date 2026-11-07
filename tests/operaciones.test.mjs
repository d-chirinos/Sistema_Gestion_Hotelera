import test from 'node:test'
import assert from 'node:assert/strict'
import { crearConsultaOperaciones, MODULOS_OPERATIVOS } from '../src/supabase/operaciones.js'

test('consulta solo módulos admitidos mediante RPC sin elegir otro hotel', async () => {
  const calls = []
  const consulta = crearConsultaOperaciones({ rpc: (nombre, args) => { calls.push([nombre, args]); return { range: async () => ({ data: [{ id: 1 }], error: null }) } } })
  for (const modulo of MODULOS_OPERATIVOS) assert.equal((await consulta(modulo)).length, 1)
  assert.equal(calls.length, 6)
  assert.ok(calls.every(([nombre, args]) => nombre === 'consultar_operaciones_hotel' && Object.keys(args).join() === 'p_modulo'))
  await assert.rejects(consulta('clientes'))
  assert.equal(calls.length, 6)
})

test('propaga errores de consulta y pagina resultados', async () => {
  let llamadas = 0
  const consulta = crearConsultaOperaciones({ rpc: () => ({ range: async () => ({ data: ++llamadas === 1 ? Array(200).fill({ id: 1 }) : [], error: null }) }) })
  assert.equal((await consulta('pagos')).length, 200)
  assert.equal(llamadas, 2)
  await assert.rejects(crearConsultaOperaciones({ rpc: () => ({ range: async () => ({ data: null, error: {} }) }) })('pagos'))
})
