import { isIP } from 'node:net'
import { crearError } from './diagnosticos.mjs'

// No incluir la URL en las excepciones: puede contener la contraseña del rol.
export function crearConexionLectura(url, postgres) {
  const rechazar = codigo => { throw crearError(codigo, 'Configuración de conexión de lectura no válida.') }
  let destino, usuario
  try { destino = new URL(url) } catch { rechazar('HM_CONFIG_URL') }
  try { usuario = decodeURIComponent(destino.username) } catch { rechazar('HM_CONFIG_USUARIO') }
  const host = destino.hostname.replace(/^\[|\]$/g, '')
  if (!['postgres:', 'postgresql:'].includes(destino.protocol)) rechazar('HM_CONFIG_PROTOCOLO')
  if (!host || isIP(host)) rechazar('HM_CONFIG_HOST')
  if (!/^hotel_consultas_reader(?:\.[a-z0-9]{20})?$/.test(usuario)) rechazar('HM_CONFIG_USUARIO')
  const opciones = [...destino.searchParams.entries()]
  if (opciones.some(([clave, valor]) => clave !== 'sslmode' || !['require', 'verify-full'].includes(valor)) || opciones.length > 1) rechazar('HM_CONFIG_PARAMETROS')
  // El modo explícito prevalece sobre sslmode=require de la URL y verifica CA y hostname.
  try { return postgres(url, { max: 1, prepare: false, connect_timeout: 5, ssl: 'verify-full' }) } catch { rechazar('HM_CONFIG_CLIENTE') }
}
