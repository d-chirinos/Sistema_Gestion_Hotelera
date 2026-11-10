import { CATALOGO as esquema } from '../_shared/catalogo.mjs'
import { preguntaGenerica } from '../_shared/preguntas.mjs'
import { validarSQL } from '../ejecutar-consulta-sql/validar.mjs'
import { mayusculasCategoricasIncorrectas } from './categorias.mjs'
import { quitarCercoSQL, respaldoAcademico } from './respaldo.mjs'
// Edge Function de generación y explicación. No ejecuta SQL ni usa service_role.
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
const respuesta = (status, error) => new Response(JSON.stringify({ error }), { status, headers: cors })


const reglasSeguras = new Set(['HM_SQL_EXPRESION', 'HM_SQL_ESTRUCTURA', 'HM_SQL_FECHA', 'HM_SQL_OPERADOR', 'HM_SQL_FUNCION', 'HM_SQL_OBJETO', 'HM_SQL_SENTENCIA', 'HM_SQL_LONGITUD', 'HM_SQL_SINTAXIS', 'HM_SQL_MULTIPLE'])
export function crearHandler({ obtenerEnv, fetchImpl, reloj = Date.now, registrar = entrada => console.error(JSON.stringify(entrada)) }) {
  const limites = new Map()
  return async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return respuesta(405, 'Método no permitido.')
  const base = obtenerEnv('SUPABASE_URL'), anon = obtenerEnv('SUPABASE_ANON_KEY'), key = obtenerEnv('GEMINI_API_KEY'), modelo = obtenerEnv('GEMINI_MODEL')
  if (!base || !anon || !key || !modelo || !/^[a-zA-Z0-9._-]{1,100}$/.test(modelo)) return respuesta(503, 'Gemini no está configurado.')
  const autorizacion = req.headers.get('Authorization') || ''
  if (!/^Bearer\s+\S+$/i.test(autorizacion)) return respuesta(401, 'Autenticación requerida.')
  try {
    const headers = { apikey: anon, Authorization: autorizacion, 'Content-Type': 'application/json' }
    const usuarioRes = await fetchImpl(`${base}/auth/v1/user`, { headers, signal: AbortSignal.timeout(8000) })
    if (!usuarioRes.ok) return respuesta(401, 'Autenticación requerida.')
    const usuario = await usuarioRes.json()
    if (typeof usuario.id !== 'string') return respuesta(401, 'Autenticación requerida.')
    const cuentaRes = await fetchImpl(`${base}/rest/v1/rpc/mi_cuenta_hotelmanager`, { method: 'POST', headers, body: '{}', signal: AbortSignal.timeout(8000) })
    if (!cuentaRes.ok) return respuesta(403, 'Acceso no autorizado.')
    const cuentas = await cuentaRes.json()
    if (!Array.isArray(cuentas) || cuentas.length !== 1 || cuentas[0].rol_sistema !== 'ADMINISTRADOR' || !cuentas[0].hotel_id) return respuesta(403, 'Acceso no autorizado.')
    const ahora = reloj(), recientes = (limites.get(usuario.id) || []).filter(t => ahora - t < 60000)
    if (recientes.length >= 6) return respuesta(429, 'Demasiadas solicitudes. Inténtalo más tarde.')
    recientes.push(ahora); limites.set(usuario.id, recientes)
    if (limites.size > 1000) for (const [id, tiempos] of limites) if (tiempos.every(t => ahora - t >= 60000)) limites.delete(id)
    if (Number(req.headers.get('content-length') || 0) > 12000) return respuesta(413, 'Solicitud demasiado larga.')
    const textoBruto = await req.text()
    if (textoBruto.length > 12000) return respuesta(413, 'Solicitud demasiado larga.')
    const entrada = JSON.parse(textoBruto)
    if (!['generar', 'explicar'].includes(entrada.modo) || typeof entrada.texto !== 'string' || entrada.texto.trim().length < 3 || entrada.texto.length > 4000) return respuesta(400, 'Solicitud inválida.')
    // Evita enviar literalmente constantes de SQL, correos o números largos; no detecta todos los nombres personales.
    if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(entrada.texto) || /\d{7,}/.test(entrada.texto)) return respuesta(400, 'No incluyas datos personales en la consulta.')
    let texto = entrada.texto.trim()
    if (entrada.modo === 'generar') {
      const permitida = preguntaGenerica(texto)
      if (!permitida) return respuesta(400, 'Formula una pregunta sobre el hotel sin nombres, documentos ni otros datos personales.')
      texto = permitida
    }
    if (entrada.modo === 'explicar') {
      if (/\$[a-z_0-9]*\$|--|\/\*|"/i.test(texto)) return respuesta(400, 'Retira comentarios y literales especiales antes de explicar.')
      texto = texto.replace(/'(?:''|[^'])*'/g, "'[literal omitido]'")
      if (texto.includes("'") && texto.replace(/'\[literal omitido\]'/g, '').includes("'")) return respuesta(400, 'No se pudo anonimizar el SQL.')
      texto = texto.replace(/\b\d+(?:\.\d+)?\b/g, '0')
      const permitidos = new Set('extract year month day date current_date select from where join inner left right outer on as group by having order asc desc limit offset with distinct count sum avg min max coalesce null is not and or case when then else end true false in exists between like ilike hotel_consultas habitacion tipo_habitacion tarifa_habitacion servicio cliente reserva estadia pago consumo_servicio empleado cargo mantenimiento id_habitacion tipo_habitacion_id_tipo numero piso estado id_tipo nombre descripcion capacidad id_tarifa precio_noche id_servicio precio id_cliente apellido id_reserva cliente_id_cliente habitacion_id_habitacion fecha_reserva fecha_entrada fecha_salida total_estimado id_estadia reserva_id_reserva empleado_id_empleado fecha_checkin fecha_checkout id_pago fecha_pago tipo_pago monto metodo_pago id_consumo estadia_id_estadia servicio_id_servicio cantidad precio_unitario_aplicado id_empleado cargo_id_cargo fecha_ingreso id_cargo id_mantenimiento fecha_inicio fecha_fin tipo costo subtotal total totales unidades empleados pagos a b c e f h m p r s t x literal omitido'.split(' '))
      if (/[^A-Za-z0-9_\s.,()*+\/=<>!%'\[\]-]/.test(texto)) return respuesta(400, 'El SQL contiene caracteres no admitidos para explicación.')
      const palabras = texto.toLowerCase().match(/[a-z_][a-z_0-9]*/g) || []
      if (palabras.some(p => !permitidos.has(p))) return respuesta(400, 'Usa solo identificadores del catálogo académico para explicar el SQL.')
    }
    const instruccion = entrada.modo === 'generar'
      ? 'Genera una sola consulta PostgreSQL SELECT o WITH de lectura y una explicación académica en español. Si no se puede resolver, devuelve sql como cadena vacía y explica el motivo. No inventes tablas o columnas. Califica las vistas como hotel_consultas.nombre. Devuelve SQL sin bloques Markdown. Usa exactamente los literales CHECK y las mayúsculas del catálogo; no inventes valores de texto libre. Usa solo COUNT, SUM, AVG, MIN, MAX y COALESCE. Se admiten DISTINCT en agregados, BETWEEN, EXTRACT de YEAR, MONTH o DAY, CURRENT_DATE, literales DATE con fecha ISO, resta entre fechas, SELECT, WITH no recursivo, INNER JOIN, LEFT JOIN, WHERE, GROUP BY, HAVING, ORDER BY y LIMIT. No uses OFFSET, funciones adicionales, casts generales ni intervalos. Explica supuestos como el significado de cantidad y que CURRENT_DATE usa la fecha de PostgreSQL.'
      : 'Explica en español el SQL sin afirmar que sea correcto. Explica SELECT, JOIN, WHERE, GROUP BY y orden si aparecen. Los literales fueron omitidos; no los adivines. Devuelve sql como cadena vacía.'
    const prompt = `${instruccion}\nResponde únicamente JSON con las claves sql y explicacion, ambas cadenas. No devuelvas datos ni valores inventados.\n${esquema}\nSolicitud:\n${texto}`
    const gemini = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 2048 } }), signal: AbortSignal.timeout(20000) })
    if (!gemini.ok) return respuesta(502, 'No se pudo obtener una respuesta del proveedor.')
    const payload = await gemini.json(), salida = payload?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')
    if (typeof salida !== 'string' || salida.length > 20000) return respuesta(502, 'Respuesta de IA inválida.')
    const resultado = JSON.parse(salida)
    if (typeof resultado.sql !== 'string' || resultado.sql.length > 12000 || typeof resultado.explicacion !== 'string' || resultado.explicacion.length > 8000) return respuesta(502, 'Respuesta de IA inválida.')
    if (entrada.modo === 'generar' && resultado.sql.trim()) {
      resultado.sql = quitarCercoSQL(resultado.sql)
      try { validarSQL(resultado.sql) } catch (error) {
        try { registrar({ evento: 'consultas_gemini.sql_rechazado', regla: reglasSeguras.has(error?.code) ? error.code : 'HM_SQL_DESCONOCIDA' }) } catch { /* el diagnóstico no cambia la respuesta */ }
        const respaldo = respaldoAcademico(texto)
        if (!respaldo) return respuesta(502, 'La consulta generada no es compatible. Reformula la pregunta usando vistas autorizadas, JOIN y rangos de fechas.')
        validarSQL(respaldo.sql)
        resultado.sql = respaldo.sql; resultado.explicacion = respaldo.explicacion
      }
      if (mayusculasCategoricasIncorrectas(resultado.sql)) return respuesta(502, 'La IA generó un estado con mayúsculas incorrectas. Inténtalo de nuevo.')
    }
    return new Response(JSON.stringify({ sql: resultado.sql, explicacion: resultado.explicacion }), { headers: cors })
  } catch { return respuesta(502, 'No se pudo completar la solicitud.') }
  }
}
