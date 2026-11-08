import { test } from 'node:test'
import assert from 'node:assert/strict'
import postgres from 'postgres'
import { CONSULTAS } from '../src/consultas/catalogo.js'
import { validarSQL } from '../supabase/functions/ejecutar-consulta-sql/validar.mjs'
import { ejecutarLectura } from '../supabase/functions/ejecutar-consulta-sql/ejecutor.mjs'

const identidad = '00000000-0000-4000-8000-000000000001'
const otro = '00000000-0000-4000-8000-000000000002'
const sinVinculo = '00000000-0000-4000-8000-000000000099'
const inactivo = '00000000-0000-4000-8000-000000000003'
const recepcion = '00000000-0000-4000-8000-000000000004'
const conexionURL = process.env.HM_SQL_TEST_URL
// Resultados de la carga académica sintética original para el hotel 1.
const filasEsperadas = [4, 6, 4, 4, 9, 6, 4, 2, 3, 4, 9, 3, 4, 2, 2, 3]

test('el analizador acepta las 16 consultas y bloquea sentencias y funciones peligrosas', () => {
  assert.equal(CONSULTAS.length, filasEsperadas.length)
  for (const ejemplo of CONSULTAS) assert.ok(validarSQL(ejemplo.sql).startsWith('SELECT') || validarSQL(ejemplo.sql).startsWith('WITH'))
  for (const q of ["INSERT INTO public.cliente VALUES (1)", "UPDATE public.cliente SET nombre = 'X'", "DELETE FROM hotel_consultas.reserva", 'DROP TABLE public.cliente', "SELECT * FROM hotel_consultas.reserva; SELECT * FROM hotel_consultas.habitacion", "SELECT * FROM hotel_consultas.reserva; DELETE FROM public.reserva", "WITH x AS (DELETE FROM public.reserva RETURNING *) SELECT * FROM x", "SELECT pg_sleep(1) FROM hotel_consultas.reserva", "SELECT set_config('request.jwt.claim.sub','x',true) FROM hotel_consultas.reserva", 'SELECT * FROM pg_catalog.pg_class', 'SELECT * FROM public.cliente', 'SELECT * FROM hotel_consultas.reserva FOR UPDATE', 'SELECT * FROM hotel_consultas.reserva OFFSET 2', 'SELECT * FROM hotel_consultas.reserva LIMIT 1001', 'SELECT ' + 'a'.repeat(8001) + ' FROM hotel_consultas.reserva', "SELECT nextval('x') FROM hotel_consultas.reserva"]) assert.throws(() => validarSQL(q), /no admitida/i, q)
})

test('PostgreSQL local: ejemplos, aislamiento, restricciones y límites', { skip: !conexionURL, timeout: 30000 }, async t => {
  const db = postgres(conexionURL, { max: 1, ssl: false, prepare: false })
  try {
    for (const [indice, ejemplo] of CONSULTAS.entries()) {
      await t.test(`${ejemplo.categoria}: ${ejemplo.titulo}`, async () => {
        const resultado = await ejecutarLectura({ conexion: db, usuario: identidad, consulta: ejemplo.sql })
        assert.ok(resultado.columnas.length > 0)
        assert.equal(resultado.filas.length, filasEsperadas[indice])
        assert.ok(resultado.filas.every(fila => fila.length === resultado.columnas.length))
        if (indice === 8 || indice === 15) assert.deepEqual(Object.fromEntries(resultado.filas), { CANCELADA: '1', COMPLETADA: '2', CONFIRMADA: '6' })
        t.diagnostic(`${ejemplo.categoria}: ${ejemplo.titulo}: ${resultado.filas.length} filas`)
      })
    }
    const vacia = await ejecutarLectura({ conexion: db, usuario: identidad, consulta: "SELECT numero FROM hotel_consultas.habitacion WHERE estado = 'INEXISTENTE'" })
    assert.deepEqual(vacia.columnas, ['numero']); assert.equal(vacia.filas.length, 0)
    const consulta = 'SELECT id_habitacion, numero FROM hotel_consultas.habitacion ORDER BY id_habitacion'
    const hotel1 = await ejecutarLectura({ conexion: db, usuario: identidad, consulta })
    const hotel2 = await ejecutarLectura({ conexion: db, usuario: otro, consulta })
    assert.equal(hotel1.filas.length, 6); assert.equal(hotel2.filas.length, 6); assert.match(hotel1.sql_ejecutado, /LIMIT 201$/)
    assert.notDeepEqual(hotel1.filas, hotel2.filas)
    const clientesAjenos = 'SELECT c.id_cliente FROM hotel_consultas.cliente c WHERE c.id_cliente NOT IN (SELECT r.cliente_id_cliente FROM hotel_consultas.reserva r)'
    assert.equal((await ejecutarLectura({ conexion: db, usuario: identidad, consulta: clientesAjenos })).filas.length, 0)
    assert.equal((await ejecutarLectura({ conexion: db, usuario: otro, consulta: clientesAjenos })).filas.length, 0)
    const simultaneas = await Promise.all([identidad, otro, identidad, otro].map(usuario => ejecutarLectura({ conexion: db, usuario, consulta })))
    assert.deepEqual(simultaneas[0].filas, hotel1.filas); assert.deepEqual(simultaneas[1].filas, hotel2.filas); assert.deepEqual(simultaneas[2].filas, hotel1.filas); assert.deepEqual(simultaneas[3].filas, hotel2.filas)
    for (const usuario of [sinVinculo, inactivo, recepcion]) assert.equal((await ejecutarLectura({ conexion: db, usuario, consulta })).filas.length, 0)
    await assert.rejects(db.unsafe('SELECT * FROM public.cliente'), e => e.code === '42501')
    for (const role of ['anon', 'authenticated']) await assert.rejects(db.unsafe(`SET ROLE ${role}`), e => e.code === '42501')
    await assert.rejects(db.unsafe("UPDATE hotel_consultas.habitacion SET estado='OCUPADA'"))
    const duplicadas = await ejecutarLectura({ conexion: db, usuario: identidad, consulta: 'SELECT a.id_habitacion, a.id_habitacion FROM hotel_consultas.habitacion a LIMIT 1' })
    assert.deepEqual(duplicadas.columnas, ['id_habitacion', 'id_habitacion']); assert.equal(duplicadas.filas[0].length, 2)
    const columnas = 'SELECT a.numero FROM hotel_consultas.habitacion a, hotel_consultas.habitacion b, hotel_consultas.habitacion c'
    const limitada = await ejecutarLectura({ conexion: db, usuario: identidad, consulta: columnas })
    assert.equal(limitada.filas.length, 200); assert.equal(limitada.truncado, true)
    const enorme = 'SELECT count(*) FROM ' + 'abcdefghijkl'.split('').map(x => `hotel_consultas.habitacion ${x}`).join(', ')
    await assert.rejects(ejecutarLectura({ conexion: db, usuario: identidad, consulta: enorme }), e => e.code === '57014')
  } finally { await db.end() }
})

test('Edge Function valida identidad y rol antes de abrir PostgreSQL', async () => {
  const { crearHandler } = await import('../supabase/functions/ejecutar-consulta-sql/handler.mjs')
  let conexiones = 0
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: 'anon-ficticia', SQL_READER_DATABASE_URL: 'url-ficticia' }
  for (const perfil of [null, 'RECEPCIONISTA', 'MANTENIMIENTO']) {
    const h = crearHandler({ obtenerEnv: n => vars[n], conectar: () => { conexiones++; throw Error() }, fetchImpl: async url => url.endsWith('/auth/v1/user') ? Response.json({ id: identidad }) : Response.json(perfil ? [{ rol_sistema: perfil, hotel_id: 1 }] : []) })
    const r = await h(new Request('https://local.invalid', { method: 'POST', headers: { Authorization: 'Bearer ficticio' }, body: JSON.stringify({ sql: 'SELECT * FROM hotel_consultas.habitacion' }) }))
    assert.equal(r.status, 403)
  }
  assert.equal(conexiones, 0)
})

test('Edge Function ejecuta con la identidad verificada y no acepta hotel elegido', { skip: !conexionURL }, async () => {
  const { crearHandler } = await import('../supabase/functions/ejecutar-consulta-sql/handler.mjs')
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: 'anon-ficticia', SQL_READER_DATABASE_URL: conexionURL }
  const h = crearHandler({ obtenerEnv: n => vars[n], conectar: url => postgres(url, { max: 1, ssl: false, prepare: false }), fetchImpl: async url => url.endsWith('/auth/v1/user') ? Response.json({ id: identidad }) : Response.json([{ rol_sistema: 'ADMINISTRADOR', hotel_id: 1 }]) })
  const pedir = body => h(new Request('https://local.invalid', { method: 'POST', headers: { Authorization: 'Bearer ficticio' }, body: JSON.stringify(body) }))
  const r = await pedir({ sql: 'SELECT id_habitacion FROM hotel_consultas.habitacion' })
  assert.equal(r.status, 200); assert.equal((await r.json()).filas.length, 6)
  assert.equal((await pedir({ sql: 'SELECT * FROM hotel_consultas.habitacion', hotel_id: 2 })).status, 400)
  assert.equal((await pedir({ sql: 'SELECT pg_sleep(1) FROM hotel_consultas.habitacion' })).status, 400)
})

test('el ejecutor rechaza solicitudes anónimas sin conectar a PostgreSQL', async () => {
  const { crearHandler } = await import('../supabase/functions/ejecutar-consulta-sql/handler.mjs')
  let invocaciones = 0
  const h = crearHandler({ obtenerEnv: () => 'valor-ficticio', fetchImpl: async () => { invocaciones++; throw Error() }, conectar: () => { invocaciones++; throw Error() } })
  const r = await h(new Request('https://local.invalid', { method: 'POST', body: '{}' }))
  assert.equal(r.status, 401); assert.equal(invocaciones, 0)
})
