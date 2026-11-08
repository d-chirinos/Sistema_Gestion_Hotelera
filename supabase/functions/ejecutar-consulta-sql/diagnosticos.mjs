// Solo se emiten etiquetas y códigos de esta lista. Nunca se registran excepciones,
// mensajes, causas, identificadores, consultas, resultados ni configuración.
const codigos = new Map([
  ['HM_CONFIG_CONEXION', 'configuracion_conexion'],
  ['HM_CONFIG_INCOMPLETA', 'configuracion_incompleta'],
  ['HM_AUTH_RECHAZADA', 'supabase_auth'],
  ['HM_AUTH_SERVICIO', 'supabase_auth_servicio'],
  ['HM_CUENTA_RPC', 'autorizacion_servicio'],
  ['HM_CUENTA_NO_AUTORIZADA', 'autorizacion_cuenta'],
  ['HM_ROL_INSEGURO', 'rol_postgresql'],
  ['HM_IDENTIDAD_INVALIDA', 'identidad'],
  ['ERR_TLS_CERT_ALTNAME_INVALID', 'tls_nombre'],
  ['CERT_HAS_EXPIRED', 'tls_certificado'],
  ['CERT_NOT_YET_VALID', 'tls_certificado'], ['CERT_UNTRUSTED', 'tls_certificado'],
  ['UNABLE_TO_GET_ISSUER_CERT', 'tls_certificado'], ['CERT_SIGNATURE_FAILURE', 'tls_certificado'],
  ['DEPTH_ZERO_SELF_SIGNED_CERT', 'tls_certificado'],
  ['SELF_SIGNED_CERT_IN_CHAIN', 'tls_certificado'],
  ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'tls_certificado'],
  ['UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'tls_certificado'],
  ['ERR_SSL_WRONG_VERSION_NUMBER', 'tls_negociacion'],
  ['ERR_SSL_SSLV3_ALERT_HANDSHAKE_FAILURE', 'tls_negociacion'],
  ['ERR_SSL_TLSV1_ALERT_UNKNOWN_CA', 'tls_negociacion'],
  ['ENOTFOUND', 'dns'], ['EAI_AGAIN', 'dns'],
  ['ECONNREFUSED', 'red'], ['ECONNRESET', 'red'], ['EHOSTUNREACH', 'red'], ['ENETUNREACH', 'red'],
  ['ETIMEDOUT', 'tiempo_agotado'], ['CONNECT_TIMEOUT', 'tiempo_agotado'],
  ['CONNECTION_CLOSED', 'red'], ['CONNECTION_ENDED', 'red'], ['CONNECTION_DESTROYED', 'red'],
  ['UNSAFE_TRANSACTION', 'transaccion_postgresql'],
  ['28P01', 'autenticacion_postgresql'], ['28000', 'autenticacion_postgresql'],
  ['SASL_SIGNATURE_MISMATCH', 'autenticacion_postgresql'],
  ['3D000', 'base_de_datos'], ['42501', 'permisos_postgresql'],
  ['53300', 'limite_postgresql'], ['57P03', 'postgresql_no_disponible'],
  ['57P01', 'postgresql_no_disponible'], ['57014', 'tiempo_agotado'],
  ['42703', 'sql_invalido'], ['42702', 'sql_invalido'], ['42P01', 'sql_invalido'],
  ['42803', 'sql_invalido'], ['42883', 'sql_invalido'], ['42601', 'sql_invalido'],
  ['22012', 'sql_invalido'], ['22P02', 'sql_invalido'], ['XX000', 'postgresql_interno'],
])
const etapas = new Set(['configuracion', 'auth_usuario', 'auth_cuenta', 'solicitud', 'validacion_sql', 'configuracion_conexion', 'conexion_postgresql', 'verificacion_rol', 'contexto_identidad', 'ejecucion_sql', 'resultado', 'cierre_conexion'])

export function clasificarError(error, etapa) {
  const pendientes = [error], vistos = new Set()
  for (let i = 0; pendientes.length && i < 8; i++) {
    const actual = pendientes.shift()
    if (!actual || vistos.has(actual)) continue
    vistos.add(actual)
    try {
      const codigo = typeof actual.code === 'string' ? actual.code : ''
      if (codigos.has(codigo)) return { categoria: codigos.get(codigo), codigo }
      if (actual.cause) pendientes.push(actual.cause)
      if (Array.isArray(actual.errors)) pendientes.push(...actual.errors.slice(0, 4))
    } catch { /* el objeto de error no es confiable */ }
  }
  const porEtapa = { validacion_sql: 'sql_no_admitido', configuracion_conexion: 'configuracion_conexion', contexto_identidad: 'contexto_identidad', verificacion_rol: 'verificacion_rol', ejecucion_sql: 'ejecucion_sql', conexion_postgresql: 'conexion_postgresql', auth_usuario: 'supabase_auth', auth_cuenta: 'autorizacion_cuenta', solicitud: 'solicitud', resultado: 'resultado', cierre_conexion: 'cierre_conexion' }
  return { categoria: porEtapa[etapa] || 'no_identificado', codigo: 'NO_IDENTIFICADO' }
}

export function crearDiagnostico(etapa, error, evento = 'error') {
  const etapaSegura = etapas.has(etapa) ? etapa : 'configuracion'
  const eventoSeguro = evento === 'cierre_error' ? evento : 'error'
  return { evento: `ejecutar_consulta_sql.${eventoSeguro}`, etapa: etapaSegura, ...clasificarError(error, etapaSegura) }
}

export function crearError(codigo, mensaje) {
  const error = new Error(mensaje)
  error.code = codigo
  return error
}
