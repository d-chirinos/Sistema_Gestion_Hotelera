import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearConexionLectura } from '../supabase/functions/ejecutar-consulta-sql/conexion.mjs'
import { crearDiagnostico } from '../supabase/functions/ejecutar-consulta-sql/diagnosticos.mjs'

test('acepta usuario de Session Pooler y exige verificación TLS sin prepared statements', () => {
  let recibida
  const url = 'postgresql://hotel_consultas_reader.knajohmderwpowlnmopy:clave-ficticia@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require'
  const resultado = crearConexionLectura(url, (cadena, opciones) => { recibida = { cadena, opciones }; return 'conexion' })
  assert.equal(resultado, 'conexion')
  assert.equal(recibida.cadena, url)
  assert.deepEqual(recibida.opciones, { max: 1, prepare: false, connect_timeout: 5, ssl: 'verify-full' })
  const especial = 'postgresql://hotel_consultas_reader.knajohmderwpowlnmopy:ensayo%40%23%3A@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full'
  assert.equal(crearConexionLectura(especial, cadena => cadena), especial)
})

test('clasifica cada validación y el fallo síncrono del cliente sin revelar valores', () => {
  const casos = [
    ['secreto-no-url', 'HM_CONFIG_URL'],
    ['https://hotel_consultas_reader:clave-ficticia@localhost/postgres', 'HM_CONFIG_PROTOCOLO'],
    ['postgresql://hotel_consultas_reader:clave-ficticia@127.0.0.1/postgres', 'HM_CONFIG_HOST'],
    ['postgresql://hotel_consultas_reader.otro:clave-ficticia@localhost/postgres', 'HM_CONFIG_USUARIO'],
    ['postgresql://hotel_consultas_reader%ZZ:clave-ficticia@localhost/postgres', 'HM_CONFIG_USUARIO'],
    ['postgresql://hotel_consultas_reader:clave-ficticia@localhost/postgres?sslmode=disable', 'HM_CONFIG_PARAMETROS'],
    ['postgresql://hotel_consultas_reader:clave-ficticia@localhost/postgres?sslmode=verify-full&sslmode=require', 'HM_CONFIG_PARAMETROS'],
    ['postgresql://hotel_consultas_reader:clave-ficticia@localhost/postgres?sslrootcert=secreto', 'HM_CONFIG_PARAMETROS'],
    ['postgresql://hotel_consultas_reader:clave-ficticia@localhost/postgres', 'HM_CONFIG_CLIENTE'],
  ]
  for (const [url, codigo] of casos) {
    assert.throws(() => crearConexionLectura(url, () => { throw new Error(`fuga ${url}`) }), error => {
      assert.equal(error.code, codigo)
      assert.deepEqual(crearDiagnostico('configuracion_conexion', error), { evento: 'ejecutar_consulta_sql.error', etapa: 'configuracion_conexion', categoria: 'configuracion_conexion', codigo })
      assert.equal(JSON.stringify(error).includes('clave-ficticia'), false)
      assert.equal(error.message.includes('clave-ficticia'), false)
      return true
    })
  }
})

test('rechaza IP, rol distinto y parámetros que debiliten la conexión sin revelar la URL', () => {
  for (const url of [
    'postgresql://hotel_consultas_reader:clave-ficticia@127.0.0.1:5432/postgres',
    'postgresql://hotel_consultas_reader:clave-ficticia@[::1]:5432/postgres',
    'postgresql://postgres:clave-ficticia@localhost:5432/postgres',
    'postgresql://hotel_consultas_reader:clave-ficticia@localhost:5432/postgres?sslmode=disable',
    'postgresql://hotel_consultas_reader:clave-ficticia@localhost:5432/postgres?options=x',
  ]) {
    assert.throws(() => crearConexionLectura(url, () => { throw new Error('No se debe conectar') }), e => e.message === 'Configuración de conexión de lectura no válida.' && !e.message.includes('clave-ficticia'))
  }
})
