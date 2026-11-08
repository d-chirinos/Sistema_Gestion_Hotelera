import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearConexionLectura } from '../supabase/functions/ejecutar-consulta-sql/conexion.mjs'

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
