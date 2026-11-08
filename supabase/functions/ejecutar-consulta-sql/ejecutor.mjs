import { validarSQL } from './validar.mjs'
import { crearError } from './diagnosticos.mjs'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function ejecutarLectura({ conexion, usuario, consulta, reloj = () => performance.now(), marcarEtapa = () => {} }) {
  if (!UUID.test(usuario)) throw crearError('HM_IDENTIDAD_INVALIDA', 'Identidad no válida.')
  marcarEtapa('validacion_sql')
  const canonica = validarSQL(consulta)
  const sqlEjecutado = `SELECT * FROM (${canonica}) AS resultado LIMIT 201`
  const inicio = reloj()
  marcarEtapa('conexion_postgresql')
  const salida = await conexion.begin('read only', async tx => {
    marcarEtapa('verificacion_rol')
    const roles = await tx`select current_user as usuario, session_user as sesion, r.rolsuper, r.rolbypassrls, r.rolcreatedb, r.rolcreaterole, r.rolinherit, r.rolreplication from pg_catalog.pg_roles r where r.rolname=current_user`
    const rol = roles[0]
    if (!rol || rol.usuario !== 'hotel_consultas_reader' || rol.sesion !== 'hotel_consultas_reader' || rol.rolsuper || rol.rolbypassrls || rol.rolcreatedb || rol.rolcreaterole || rol.rolinherit || rol.rolreplication) throw crearError('HM_ROL_INSEGURO', 'El rol de lectura no está configurado de forma segura.')
    marcarEtapa('contexto_identidad')
    await tx`select pg_catalog.set_config('statement_timeout','3000',true), pg_catalog.set_config('lock_timeout','1000',true), pg_catalog.set_config('search_path','pg_catalog,hotel_consultas',true), pg_catalog.set_config('request.jwt.claim.sub',${usuario},true), pg_catalog.set_config('request.jwt.claims',${JSON.stringify({ sub: usuario, role: 'authenticated' })},true)`
    marcarEtapa('ejecucion_sql')
    const datos = await tx.unsafe(sqlEjecutado).values()
    return { columnas: datos.columns.map(c => c.name), filas: Array.from(datos.slice(0, 200)), truncado: datos.length > 200 }
  })
  return { ...salida, duracion_ms: Math.max(0, Math.round(reloj() - inicio)), sql_ejecutado: sqlEjecutado }
}
