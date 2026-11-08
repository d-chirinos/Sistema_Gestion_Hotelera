import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearHandler } from '../supabase/functions/consultas-gemini/handler.mjs'
const configurar = (rol = 'ADMINISTRADOR') => {
  const llamadas = []
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: 'anon-ficticia', GEMINI_API_KEY: 'clave-ficticia', GEMINI_MODEL: 'modelo-ficticio' }
  const handler = crearHandler({ obtenerEnv: n => vars[n], reloj: () => 1000, fetchImpl: async (url, options) => {
    llamadas.push({ url, options })
    if (url.endsWith('/auth/v1/user')) return Response.json({ id: 'uid-test' })
    if (url.endsWith('/mi_cuenta_hotelmanager')) return Response.json(rol ? [{ rol_sistema: rol, hotel_id: 1 }] : [])
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ sql: 'SELECT 1', explicacion: 'Prueba' }) }] } }] })
  } })
  const pedir = body => handler(new Request('https://local.invalid', { method: 'POST', headers: { Authorization: 'Bearer ficticio' }, body: JSON.stringify(body) }))
  return { pedir, llamadas }
}

test('verifica rol activo antes de consultar el proveedor', async () => {
  for (const rol of [null, 'RECEPCIONISTA', 'MANTENIMIENTO']) {
    const { pedir, llamadas } = configurar(rol)
    const r = await pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene cada estado?' })
    assert.equal(r.status, 403)
    assert.equal(llamadas.some(x => x.url.includes('googleapis')), false)
  }
})

test('solo genera texto, limita solicitudes y no reenvía literales de SQL', async () => {
  const { pedir, llamadas } = configurar()
  assert.equal((await pedir({ modo: 'generar', texto: 'Datos de una persona' })).status, 400)
  const r = await pedir({ modo: 'explicar', texto: "SELECT estado FROM reserva WHERE estado = 'CONFIRMADA'" })
  assert.equal(r.status, 200)
  const proveedor = llamadas.find(x => x.url.includes('googleapis'))
  assert.ok(!proveedor.options.body.includes('CONFIRMADA'))
  assert.ok(!proveedor.options.body.includes('clave-ficticia'))
  for (let i = 0; i < 4; i++) assert.equal((await pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene cada estado?' })).status, 200)
  assert.equal((await pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene cada estado?' })).status, 429)
  assert.equal(llamadas.some(x => /ejecutar|consulta_sql/.test(x.url)), false)
})

test('bloquea texto personal y SQL fuera de la lista cerrada', async () => {
  const { pedir, llamadas } = configurar()
  assert.equal((await pedir({ modo: 'generar', texto: 'Reservas de una persona identificada' })).status, 400)
  assert.equal((await pedir({ modo: 'explicar', texto: 'SELECT nombre FROM cliente -- información privada' })).status, 400)
  assert.equal((await pedir({ modo: 'explicar', texto: 'SELECT nombre FROM cliente WHERE nombre = "identidad"' })).status, 400)
  assert.equal((await pedir({ modo: 'explicar', texto: 'SELECT nombre FROM cliente WHERE nombre = 你' })).status, 400)
  assert.equal(llamadas.some(x => x.url.includes('googleapis')), false)
})

test('rechaza peticiones anónimas antes de contactar servicios', async () => {
  const llamadas = []
  const handler = crearHandler({ obtenerEnv: () => 'valor-ficticio', fetchImpl: async url => { llamadas.push(url); return new Response(null, { status: 500 }) } })
  const respuesta = await handler(new Request('https://local.invalid', { method: 'POST', body: '{}' }))
  assert.equal(respuesta.status, 401)
  assert.equal(llamadas.length, 0)
})

test('admite preguntas genéricas variadas y rechaza identificadores personales', async () => {
  const { pedir, llamadas } = configurar()
  assert.equal((await pedir({ modo: 'generar', texto: 'Mostrar el total de pagos por estado de reserva' })).status, 200)
  assert.equal((await pedir({ modo: 'generar', texto: 'Mostrar reservas de Paola Mendoza' })).status, 400)
  assert.equal((await pedir({ modo: 'generar', texto: 'Mostrar reserva 123456' })).status, 400)
  assert.equal(llamadas.filter(x => x.url.includes('googleapis')).length, 1)
})
