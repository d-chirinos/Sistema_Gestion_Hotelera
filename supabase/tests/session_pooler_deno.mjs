// Prueba local opcional del runtime Deno con CA sintética; no usa credenciales reales.
import postgres from 'postgres'
import { crearConexionLectura } from '../functions/ejecutar-consulta-sql/conexion.mjs'
import { ejecutarLectura } from '../functions/ejecutar-consulta-sql/ejecutor.mjs'

const url = Deno.env.get('HM_POOLER_TEST_URL'), archivoCA = Deno.env.get('HM_POOLER_CA_FILE')
if (!url || !archivoCA || new URL(url).hostname !== 'localhost') throw new Error('La prueba requiere el pooler local y su CA temporal.')
const ca = await Deno.readTextFile(archivoCA)
// Solo la prueba inyecta esta CA de ensayo; producción usa verify-full y las CA del runtime.
const adaptar = (cadena, opciones) => postgres(cadena, { ...opciones, ssl: { ca, rejectUnauthorized: true } })
const db = crearConexionLectura(url, adaptar)
try {
  const resultados = []
  for (const usuario of ['00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002']) {
    resultados.push(await ejecutarLectura({ conexion: db, usuario, consulta: 'SELECT id_habitacion FROM hotel_consultas.habitacion ORDER BY id_habitacion' }))
  }
  if (resultados[0].filas.length !== 6 || resultados[1].filas.length !== 6 || JSON.stringify(resultados[0].filas) === JSON.stringify(resultados[1].filas)) throw new Error('Falló el aislamiento por hotel en Deno.')
} finally { await db.end({ timeout: 1 }) }
for (const [host, fabrica, codigo] of [['localhost', postgres, 'DEPTH_ZERO_SELF_SIGNED_CERT'], ['ip6-localhost', adaptar, 'ERR_TLS_CERT_ALTNAME_INVALID']]) {
  const destino = new URL(url); destino.hostname = host
  const conexion = crearConexionLectura(destino.toString(), fabrica)
  try {
    await conexion`select 1`
    throw new Error('Se aceptó un certificado inválido.')
  } catch (error) {
    if (error.code !== codigo) throw error
  } finally { await conexion.end({ timeout: 1 }) }
}
console.log('Deno: pooler, aislamiento y validación TLS verificados.')
