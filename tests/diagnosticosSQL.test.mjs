import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearHandler } from '../supabase/functions/ejecutar-consulta-sql/handler.mjs'
import { crearConexionLectura } from '../supabase/functions/ejecutar-consulta-sql/conexion.mjs'
import { crearDiagnostico } from '../supabase/functions/ejecutar-consulta-sql/diagnosticos.mjs'

const sensible = 'SENTINELA_CLAVE_TOKEN_SQL_PERSONA'
const usuario = '00000000-0000-4000-8000-000000000001'
const fallo = codigo => Object.assign(new Error(`mensaje ${sensible}`), { code: codigo, detail: sensible, query: sensible, host: sensible })
const crearPeticion = () => new Request('https://local.invalid', { method: 'POST', headers: { Authorization: `Bearer ${sensible}` }, body: JSON.stringify({ sql: `SELECT '${sensible}' FROM hotel_consultas.habitacion LIMIT 5` }) })
function armar({ conectar, fetchImpl } = {}) {
  const registros = []
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: sensible, SQL_READER_DATABASE_URL: sensible }
  const h = crearHandler({ obtenerEnv: n => vars[n], fetchImpl: fetchImpl || (async url => url.endsWith('/auth/v1/user') ? Response.json({ id: usuario }) : Response.json([{ rol_sistema: 'ADMINISTRADOR', hotel_id: 1 }])), conectar, registrar: entrada => registros.push(entrada) })
  return { h, registros }
}
function conexionSimulada({ errorInicio, errorRol, errorContexto, errorSQL, rol, errorCierre } = {}) {
  return {
    async begin(_, callback) {
      if (errorInicio) throw errorInicio
      let llamadas = 0
      const tx = async () => {
        llamadas++
        if (llamadas === 1) {
          if (errorRol) throw errorRol
          return [rol || { usuario: 'hotel_consultas_reader', sesion: 'hotel_consultas_reader', rolsuper: false, rolbypassrls: false, rolcreatedb: false, rolcreaterole: false, rolinherit: false, rolreplication: false }]
        }
        if (errorContexto) throw errorContexto
        return []
      }
      tx.unsafe = () => ({ values: async () => { if (errorSQL) throw errorSQL; return Object.assign([], { columns: [] }) } })
      return callback(tx)
    },
    async end() { if (errorCierre) throw errorCierre },
  }
}

test('clasifica errores con una lista cerrada sin incluir campos o causas sensibles', () => {
  assert.deepEqual(crearDiagnostico('conexion_postgresql', { cause: fallo('ERR_TLS_CERT_ALTNAME_INVALID') }), { evento: 'ejecutar_consulta_sql.error', etapa: 'conexion_postgresql', categoria: 'tls_nombre', codigo: 'ERR_TLS_CERT_ALTNAME_INVALID' })
  for (const error of [fallo(sensible), fallo('XX000'), { cause: { cause: fallo('28P01') } }]) {
    const resultado = JSON.stringify(crearDiagnostico('conexion_postgresql', error))
    assert.equal(resultado.includes(sensible), false)
  }
  assert.equal(crearDiagnostico('etapa atacante', fallo(sensible), sensible).etapa, 'configuracion')
})

test('el 500 se clasifica por etapa sin exponer datos en registros ni respuesta', async () => {
  for (const [opciones, etapa, categoria, codigo] of [
    [{ errorInicio: fallo('DEPTH_ZERO_SELF_SIGNED_CERT') }, 'conexion_postgresql', 'tls_certificado', 'DEPTH_ZERO_SELF_SIGNED_CERT'],
    [{ errorInicio: fallo('ENOTFOUND') }, 'conexion_postgresql', 'dns', 'ENOTFOUND'],
    [{ errorInicio: fallo('28P01') }, 'conexion_postgresql', 'autenticacion_postgresql', '28P01'],
    [{ rol: { usuario: 'otro', sesion: 'otro' } }, 'verificacion_rol', 'rol_postgresql', 'HM_ROL_INSEGURO'],
    [{ errorContexto: fallo('42501') }, 'contexto_identidad', 'permisos_postgresql', '42501'],
    [{ errorSQL: fallo('XX000') }, 'ejecucion_sql', 'postgresql_interno', 'XX000'],
    [{ errorSQL: fallo(sensible) }, 'ejecucion_sql', 'ejecucion_sql', 'NO_IDENTIFICADO'],
  ]) {
    const { h, registros } = armar({ conectar: () => conexionSimulada(opciones) })
    const respuesta = await h(crearPeticion())
    assert.equal(respuesta.status, 500)
    assert.deepEqual(registros, [{ evento: 'ejecutar_consulta_sql.error', etapa, categoria, codigo }])
    assert.equal(JSON.stringify(registros).includes(sensible), false)
    assert.equal((await respuesta.text()).includes(sensible), false)
  }
})

test('diagnostica configuración y autenticación sin registrar valores o identidad', async () => {
  const { h, registros } = armar({ conectar: valor => crearConexionLectura(valor, () => {}) })
  assert.equal((await h(crearPeticion())).status, 500)
  assert.equal(registros[0].codigo, 'HM_CONFIG_URL')
  const denegada = armar({ conectar: () => { throw Error('no debe conectar') }, fetchImpl: async () => new Response(null, { status: 401 }) })
  assert.equal((await denegada.h(crearPeticion())).status, 401)
  assert.equal(denegada.registros[0].categoria, 'supabase_auth')
  assert.equal(JSON.stringify([...registros, ...denegada.registros]).includes(sensible), false)
})

test('errores SQL y de cierre mantienen respuestas seguras y diagnósticos separados', async () => {
  const invalida = armar({ conectar: () => conexionSimulada({ errorSQL: fallo('42703') }) })
  assert.equal((await invalida.h(crearPeticion())).status, 400)
  assert.equal(invalida.registros[0].categoria, 'sql_invalido')
  const cierre = armar({ conectar: () => conexionSimulada({ errorCierre: fallo('ECONNRESET') }) })
  assert.equal((await cierre.h(crearPeticion())).status, 200)
  assert.equal(cierre.registros[0].evento, 'ejecutar_consulta_sql.cierre_error')
  assert.equal(JSON.stringify(cierre.registros).includes(sensible), false)
})

test('diferencia fallos del servicio Auth y de la RPC de cuenta', async () => {
  const auth = armar({ conectar: () => { throw Error('no debe conectar') }, fetchImpl: async () => new Response(null, { status: 503 }) })
  assert.equal((await auth.h(crearPeticion())).status, 401)
  assert.equal(auth.registros[0].codigo, 'HM_AUTH_SERVICIO')
  const cuenta = armar({ conectar: () => { throw Error('no debe conectar') }, fetchImpl: async url => url.endsWith('/auth/v1/user') ? Response.json({ id: usuario }) : new Response(null, { status: 500 }) })
  assert.equal((await cuenta.h(crearPeticion())).status, 403)
  assert.equal(cuenta.registros[0].codigo, 'HM_CUENTA_RPC')
  assert.equal(JSON.stringify([...auth.registros, ...cuenta.registros]).includes(sensible), false)
})

test('encuentra códigos conocidos en errores agregados sin registrar sus mensajes', () => {
  const error = new AggregateError([fallo(sensible), fallo('ECONNREFUSED')], sensible)
  const registro = crearDiagnostico('conexion_postgresql', error)
  assert.equal(registro.codigo, 'ECONNREFUSED')
  assert.equal(JSON.stringify(registro).includes(sensible), false)
})

test('un fallo del registro no cambia la respuesta de la función', async () => {
  const vars = { SUPABASE_URL: 'https://local.invalid', SUPABASE_ANON_KEY: sensible, SQL_READER_DATABASE_URL: sensible }
  const h = crearHandler({ obtenerEnv: n => vars[n], fetchImpl: async () => new Response(null, { status: 401 }), conectar: () => { throw Error('no debe conectar') }, registrar: () => { throw Error(sensible) } })
  const respuesta = await h(crearPeticion())
  assert.equal(respuesta.status, 401)
  assert.equal((await respuesta.text()).includes(sensible), false)
})
