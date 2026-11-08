import { ejecutarLectura } from './ejecutor.mjs'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
const respuesta = (status, error) => new Response(JSON.stringify({ error }), { status, headers: cors })
async function leerCuerpo(req) {
  if (!req.body) return ''
  const lector = req.body.getReader(), partes = [], maximo = 12000
  let bytes = 0
  while (true) {
    const { done, value } = await lector.read()
    if (done) break
    bytes += value.byteLength
    if (bytes > maximo) { await lector.cancel(); return null }
    partes.push(value)
  }
  const combinado = new Uint8Array(bytes); let desplazamiento = 0
  for (const parte of partes) { combinado.set(parte, desplazamiento); desplazamiento += parte.byteLength }
  return new TextDecoder().decode(combinado)
}
export function crearHandler({ obtenerEnv, fetchImpl, conectar, reloj = Date.now }) {
  const limites = new Map()
  return async req => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (req.method !== 'POST') return respuesta(405, 'Método no permitido.')
    const base = obtenerEnv('SUPABASE_URL'), anon = obtenerEnv('SUPABASE_ANON_KEY'), conexionURL = obtenerEnv('SQL_READER_DATABASE_URL')
    if (!base || !anon || !conexionURL) return respuesta(503, 'El ejecutor de lectura no está configurado.')
    const autorizacion = req.headers.get('Authorization') || ''
    if (!/^Bearer\s+\S+$/i.test(autorizacion)) return respuesta(401, 'Autenticación requerida.')
    let conexion
    try {
      const headers = { apikey: anon, Authorization: autorizacion, 'Content-Type': 'application/json' }
      const usuarioRes = await fetchImpl(`${base}/auth/v1/user`, { headers, signal: AbortSignal.timeout(8000) })
      if (!usuarioRes.ok) return respuesta(401, 'Autenticación requerida.')
      const usuario = await usuarioRes.json()
      if (typeof usuario.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usuario.id)) return respuesta(401, 'Autenticación requerida.')
      const cuentaRes = await fetchImpl(`${base}/rest/v1/rpc/mi_cuenta_hotelmanager`, { method: 'POST', headers, body: '{}', signal: AbortSignal.timeout(8000) })
      if (!cuentaRes.ok) return respuesta(403, 'Acceso no autorizado.')
      const cuentas = await cuentaRes.json()
      if (!Array.isArray(cuentas) || cuentas.length !== 1 || cuentas[0].rol_sistema !== 'ADMINISTRADOR' || !cuentas[0].hotel_id) return respuesta(403, 'Acceso no autorizado.')
      const ahora = reloj(), recientes = (limites.get(usuario.id) || []).filter(t => ahora - t < 60000)
      if (recientes.length >= 20) return respuesta(429, 'Demasiadas consultas. Inténtalo más tarde.')
      recientes.push(ahora); limites.set(usuario.id, recientes)
      if (limites.size > 1000) for (const [id, tiempos] of limites) if (tiempos.every(t => ahora - t >= 60000)) limites.delete(id)
      if (Number(req.headers.get('content-length') || 0) > 12000) return respuesta(413, 'Solicitud demasiado larga.')
      const cuerpo = await leerCuerpo(req); if (cuerpo === null) return respuesta(413, 'Solicitud demasiado larga.')
      const entrada = JSON.parse(cuerpo)
      if (!entrada || Object.keys(entrada).some(k => k !== 'sql') || typeof entrada.sql !== 'string') return respuesta(400, 'Solicitud inválida.')
      // Validación repetida dentro del ejecutor, antes de enviar cualquier SQL a PostgreSQL.
      conexion = conectar(conexionURL)
      const resultado = await ejecutarLectura({ conexion, usuario: usuario.id, consulta: entrada.sql })
      const salida = JSON.stringify(resultado)
      if (new TextEncoder().encode(salida).byteLength > 1024 * 1024) return respuesta(413, 'El resultado supera el tamaño permitido.')
      return new Response(salida, { headers: cors })
    } catch (error) {
      if (error?.message?.startsWith('Consulta no admitida')) return respuesta(400, error.message)
      if (error?.code === '57014') return respuesta(408, 'La consulta superó el tiempo permitido.')
      if (['42703','42702','42P01','42803','42883','42601','22012','22P02'].includes(error?.code)) return respuesta(400, 'La consulta no es válida para las vistas autorizadas. Revisa columnas, tipos y agrupaciones.')
      return respuesta(500, 'No se pudo completar la consulta. Verifica la configuración y vuelve a intentarlo.')
    } finally { if (conexion) await conexion.end({ timeout: 1 }).catch(() => {}) }
  }
}
