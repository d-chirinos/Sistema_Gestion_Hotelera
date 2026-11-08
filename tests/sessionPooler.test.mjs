import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import postgres from 'postgres'
import { crearConexionLectura } from '../supabase/functions/ejecutar-consulta-sql/conexion.mjs'
import { ejecutarLectura } from '../supabase/functions/ejecutar-consulta-sql/ejecutor.mjs'
import { crearHandler } from '../supabase/functions/ejecutar-consulta-sql/handler.mjs'
import { CONSULTAS } from '../src/consultas/catalogo.js'

const url = process.env.HM_POOLER_TEST_URL
const u1 = '00000000-0000-4000-8000-000000000001', u2 = '00000000-0000-4000-8000-000000000002'

test('Session Pooler local: TLS, rol, aislamiento y 16 consultas', { skip: !url, timeout: 30000 }, async () => {
  const db = crearConexionLectura(url, postgres)
  try {
    for (const ejemplo of CONSULTAS) assert.ok(Array.isArray((await ejecutarLectura({ conexion: db, usuario: u1, consulta: ejemplo.sql })).filas), ejemplo.titulo)
    const consulta = 'SELECT id_habitacion FROM hotel_consultas.habitacion ORDER BY id_habitacion'
    const resultados = await Promise.all([u1, u2, u1, u2].map(usuario => ejecutarLectura({ conexion: db, usuario, consulta })))
    assert.equal(resultados[0].filas.length, 6); assert.equal(resultados[1].filas.length, 6)
    assert.notDeepEqual(resultados[0].filas, resultados[1].filas)
    assert.deepEqual(resultados[0].filas, resultados[2].filas); assert.deepEqual(resultados[1].filas, resultados[3].filas)
    const roles = await db`select current_user, session_user, current_setting('request.jwt.claim.sub', true) as sub`
    assert.equal(roles[0].current_user, 'hotel_consultas_reader'); assert.equal(roles[0].session_user, 'hotel_consultas_reader')
    assert.ok(roles[0].sub == null || roles[0].sub === '')
    await assert.rejects(db.unsafe('SELECT * FROM public.habitacion'), e => e.code === '42501')
    await assert.rejects(db.begin('read only', async tx => { const modo = await tx`show transaction_read_only`; assert.equal(modo[0].transaction_read_only, 'on'); await tx.unsafe('CREATE TEMP TABLE solo_prueba(id integer)') }), e => e.code === '25006')
    await assert.rejects(ejecutarLectura({ conexion: db, usuario: u1, consulta: 'SELECT pg_sleep(1) FROM hotel_consultas.habitacion' }))
  } finally { await db.end({ timeout: 1 }) }
})

test('la función usa identidad verificada a través del pooler', { skip: !url }, async () => {
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: 'anon-ficticia', SQL_READER_DATABASE_URL: url }
  const h = crearHandler({ obtenerEnv: n => vars[n], conectar: valor => crearConexionLectura(valor, postgres), fetchImpl: async enlace => enlace.endsWith('/auth/v1/user') ? Response.json({ id: u1 }) : Response.json([{ rol_sistema: 'ADMINISTRADOR', hotel_id: 1 }]) })
  const r = await h(new Request('https://local.invalid', { method: 'POST', headers: { Authorization: 'Bearer ficticio' }, body: JSON.stringify({ sql: 'SELECT id_habitacion FROM hotel_consultas.habitacion' }) }))
  assert.equal(r.status, 200); assert.equal((await r.json()).filas.length, 6)
})

test('el pooler rechaza certificado no confiable y nombre incorrecto', { skip: !url }, async () => {
  const entorno = { ...process.env }; delete entorno.NODE_EXTRA_CA_CERTS
  const codigo = `import postgres from 'postgres';import {crearConexionLectura} from './supabase/functions/ejecutar-consulta-sql/conexion.mjs';const db=crearConexionLectura(process.env.HM_POOLER_TEST_URL,postgres);try{await db\`select 1\`;process.exitCode=1}catch(e){if(e.code!=='DEPTH_ZERO_SELF_SIGNED_CERT')process.exitCode=2}finally{await db.end({timeout:1})}`
  const hijo = spawnSync(process.execPath, ['--input-type=module', '-e', codigo], { cwd: process.cwd(), env: entorno, encoding: 'utf8', timeout: 10000 })
  assert.equal(hijo.status, 0, 'El certificado no confiable debe rechazarse')
  if (process.env.HM_POOLER_BAD_HOST) {
    const erronea = new URL(url); erronea.hostname = process.env.HM_POOLER_BAD_HOST
    const db = crearConexionLectura(erronea.toString(), postgres)
    try { await assert.rejects(db`select 1`, e => e.code === 'ERR_TLS_CERT_ALTNAME_INVALID') } finally { await db.end({ timeout: 1 }) }
  }
})


test('la función rechaza un pooler que cambie el usuario de sesión', { skip: !url || !process.env.HM_POOLER_PRIVILEGED_DB }, async () => {
  const destino = new URL(url); destino.pathname = `/${process.env.HM_POOLER_PRIVILEGED_DB}`
  const db = crearConexionLectura(destino.toString(), postgres)
  try { await assert.rejects(ejecutarLectura({ conexion: db, usuario: u1, consulta: 'SELECT * FROM hotel_consultas.habitacion' }), /rol de lectura/) } finally { await db.end({ timeout: 1 }) }
})
