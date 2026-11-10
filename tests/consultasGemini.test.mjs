import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearHandler } from '../supabase/functions/consultas-gemini/handler.mjs'
import { preguntaGenerica } from '../supabase/functions/_shared/preguntas.mjs'
import { CATALOGO } from '../supabase/functions/_shared/catalogo.mjs'
import { readFileSync } from 'node:fs'
import { PREGUNTAS } from '../supabase/functions/_shared/preguntas.mjs'
import { validarSQL } from '../supabase/functions/ejecutar-consulta-sql/validar.mjs'
const configurar = (rol = 'ADMINISTRADOR', sql = 'SELECT numero FROM hotel_consultas.habitacion') => {
  const llamadas = []
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: 'anon-ficticia', GEMINI_API_KEY: 'clave-ficticia', GEMINI_MODEL: 'modelo-ficticio' }
  const handler = crearHandler({ obtenerEnv: n => vars[n], reloj: () => 1000, fetchImpl: async (url, options) => {
    llamadas.push({ url, options })
    if (url.endsWith('/auth/v1/user')) return Response.json({ id: 'uid-test' })
    if (url.endsWith('/mi_cuenta_hotelmanager')) return Response.json(rol ? [{ rol_sistema: rol, hotel_id: 1 }] : [])
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ sql, explicacion: 'Prueba' }) }] } }] })
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
  const r = await pedir({ modo: 'explicar', texto: "SELECT estado FROM reserva WHERE estado = 'dato_confidencial_ficticio'" })
  assert.equal(r.status, 200)
  const proveedor = llamadas.find(x => x.url.includes('googleapis'))
  assert.ok(!proveedor.options.body.includes('dato_confidencial_ficticio'))
  assert.ok(!proveedor.options.body.includes('clave-ficticia'))
  for (let i = 0; i < 4; i++) assert.equal((await pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene cada estado?' })).status, 200)
  assert.equal((await pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene cada estado?' })).status, 429)
  assert.equal(llamadas.some(x => /ejecutar|consulta_sql/.test(x.url)), false)
})

test('acepta formulaciones naturales y exige vocabulario hotelero sin identificadores personales', () => {
  for (const texto of ['¿Cuántas habitaciones disponibles tiene mi hotel?', '¿Cuáles son los cuartos libres de nuestro hotel?', 'Muéstrame la ocupación actual de nuestras habitaciones', '¿Podrías indicar cuántos huéspedes tienen reservas confirmadas?', 'Necesito saber los adelantos registrados por reserva', 'Dame un resumen de los mantenimientos realizados']) assert.ok(preguntaGenerica(texto), texto)
  for (const texto of ['Reservas de Paola Mendoza', 'Habitaciones del cliente 12345678', 'Reservas de ana@example.invalid', 'Mostrar la dirección del cliente', 'Nombre de Juan Pérez en las reservas', 'Cómo está mi cuenta bancaria']) assert.equal(preguntaGenerica(texto), null, texto)
})

test('el catálogo conserva los valores CHECK reales y distingue los campos libres', () => {
  const migracion = readFileSync(new URL('../supabase/migrations/20261107000000_hotelmanager_estructura_inicial.sql', import.meta.url), 'utf8')
  for (const valores of ["'DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO'", "'CONFIRMADA', 'COMPLETADA', 'CANCELADA'", "'ADELANTO', 'ORDINARIO'"]) {
    assert.ok(migracion.includes(valores))
    assert.ok(CATALOGO.includes(valores))
  }
  assert.match(CATALOGO, /metodo_pago y mantenimiento\.tipo son texto libre/)
})

test('envía categorías reales al proveedor y rechaza SQL generado fuera del validador', async () => {
  const valido = configurar('ADMINISTRADOR', "SELECT COUNT(*) FROM hotel_consultas.habitacion WHERE estado = 'DISPONIBLE'")
  const respuesta = await valido.pedir({ modo: 'generar', texto: '¿Cuántas habitaciones disponibles tiene mi hotel?' })
  assert.equal(respuesta.status, 200)
  assert.match((await respuesta.json()).sql, /'DISPONIBLE'/)
  const prompt = JSON.parse(valido.llamadas.find(x => x.url.includes('googleapis')).options.body).contents[0].parts[0].text
  assert.ok(prompt.includes("'DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO'"))
  for (const sql of ['DELETE FROM public.reserva', 'SELECT * FROM public.cliente', 'SELECT pg_sleep(1) FROM hotel_consultas.reserva', 'SELECT * FROM hotel_consultas.reserva; DROP TABLE public.reserva']) {
    const noPermitido = configurar('ADMINISTRADOR', sql)
    assert.equal((await noPermitido.pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene el hotel?' })).status, 502)
  }
  for (const sql of ["SELECT COUNT(*) FROM hotel_consultas.habitacion WHERE estado = 'disponible'", "SELECT * FROM hotel_consultas.reserva r WHERE r.estado = 'Confirmada'", "SELECT * FROM hotel_consultas.pago WHERE 'adelanto' = tipo_pago"]) {
    const incorrecta = configurar('ADMINISTRADOR', sql)
    assert.equal((await incorrecta.pedir({ modo: 'generar', texto: '¿Cuántas reservas tiene el hotel?' })).status, 502)
  }
  const textoLibre = configurar('ADMINISTRADOR', "SELECT nombre FROM hotel_consultas.servicio WHERE nombre = 'disponible'")
  assert.equal((await textoLibre.pedir({ modo: 'generar', texto: '¿Cuántos servicios tiene el hotel?' })).status, 200)
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
  assert.equal((await pedir({ modo: 'generar', texto: 'Mostrar reservas con importes mayores a 100 en 2026' })).status, 200)
  assert.equal(llamadas.filter(x => x.url.includes('googleapis')).length, 2)
})

test('acepta los enunciados académicos y preserva el año enviado al proveedor simulado', async () => {
  const casos = [
    ['Visualizar el nombre y apellido del empleado, tipo de mantenimiento, número y piso de habitación realizadas a la fecha.', 'SELECT e.nombre, e.apellido, m.tipo, h.numero, h.piso FROM hotel_consultas.mantenimiento m JOIN hotel_consultas.empleado e ON e.id_empleado = m.empleado_id_empleado JOIN hotel_consultas.habitacion h ON h.id_habitacion = m.habitacion_id_habitacion WHERE m.fecha_inicio <= CURRENT_DATE'],
    ['Visualizar nombre de servicio y cantidad de los check-in del 2026.', "SELECT s.nombre, SUM(c.cantidad) AS cantidad FROM hotel_consultas.servicio s JOIN hotel_consultas.consumo_servicio c ON c.servicio_id_servicio = s.id_servicio JOIN hotel_consultas.estadia e ON e.id_estadia = c.estadia_id_estadia WHERE e.fecha_checkin >= DATE '2026-01-01' AND e.fecha_checkin < DATE '2027-01-01' GROUP BY s.nombre"],
    ['Visualizar la cantidad de días que cada cliente reserva con anterioridad a la fecha que va a usar el hotel.', 'SELECT c.nombre, c.apellido, r.fecha_entrada - r.fecha_reserva AS dias FROM hotel_consultas.cliente c JOIN hotel_consultas.reserva r ON r.cliente_id_cliente = c.id_cliente'],
  ]
  for (const [texto, sql] of casos) {
    const prueba = configurar('ADMINISTRADOR', sql)
    const respuesta = await prueba.pedir({ modo: 'generar', texto })
    assert.equal(respuesta.status, 200, texto)
    assert.equal((await respuesta.json()).sql, sql)
    if (texto.includes('2026')) assert.ok(prueba.llamadas.find(x => x.url.includes('googleapis')).options.body.includes('2026'))
  }
})

test('explica consultas con fechas sin enviar sus literales al proveedor', async () => {
  const prueba = configurar()
  const respuesta = await prueba.pedir({ modo: 'explicar', texto: "SELECT fecha_inicio FROM hotel_consultas.mantenimiento WHERE fecha_inicio >= DATE '2026-01-01' AND fecha_inicio <= CURRENT_DATE" })
  assert.equal(respuesta.status, 200)
  const solicitud = prueba.llamadas.find(x => x.url.includes('googleapis')).options.body
  assert.equal(solicitud.includes('2026-01-01'), false)
})

test('recupera los tres enunciados sin repetir la llamada y mantiene SQL validado', async () => {
  const variantes = [
    'SELECT e.nombre FROM empleado e JOIN mantenimiento m ON m.empleado_id_empleado = e.id_empleado',
    'SELECT COUNT(DISTINCT id_estadia) FROM hotel_consultas.estadia WHERE EXTRACT(YEAR FROM fecha_checkin) = 2026',
    "SELECT fecha_entrada - fecha_reserva FROM hotel_consultas.reserva WHERE fecha_entrada BETWEEN DATE '2026-01-01' AND DATE '2026-12-31'",
  ]
  for (const [i, sql] of variantes.entries()) {
    const prueba = configurar('ADMINISTRADOR', sql)
    const respuesta = await prueba.pedir({ modo: 'generar', texto: PREGUNTAS[i + 7] })
    assert.equal(respuesta.status, 200)
    const salida = await respuesta.json()
    assert.match(salida.explicacion, /respaldo predefinida/)
    assert.ok(validarSQL(salida.sql))
    assert.equal(prueba.llamadas.filter(x => x.url.includes('googleapis')).length, 1)
  }
})

test('quita únicamente un cerco Markdown completo y no filtra SQL incompatible', async () => {
  const prueba = configurar('ADMINISTRADOR', '```sql\nSELECT numero FROM hotel_consultas.habitacion\n```')
  const respuesta = await prueba.pedir({ modo: 'generar', texto: PREGUNTAS[0] })
  assert.equal(respuesta.status, 200)
  assert.equal((await respuesta.json()).sql, 'SELECT numero FROM hotel_consultas.habitacion')
  const secreta = 'SENTINELA_DATO_PRIVADO'
  const invalida = configurar('ADMINISTRADOR', `SELECT ${secreta} FROM public.cliente`)
  const rechazada = await invalida.pedir({ modo: 'generar', texto: PREGUNTAS[0] })
  assert.equal(rechazada.status, 502)
  assert.doesNotMatch(await rechazada.text(), /SENTINELA_DATO_PRIVADO/)
})
