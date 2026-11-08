import { isIP } from 'node:net'

// No incluir la URL en las excepciones: puede contener la contraseña del rol.
export function crearConexionLectura(url, postgres) {
  try {
    const destino = new URL(url)
    const usuario = decodeURIComponent(destino.username)
    const host = destino.hostname.replace(/^\[|\]$/g, '')
    if (!['postgres:', 'postgresql:'].includes(destino.protocol) || !host || isIP(host) || !/^hotel_consultas_reader(?:\.[a-z0-9]{20})?$/.test(usuario)) throw new Error()
    const opciones = [...destino.searchParams.entries()]
    if (opciones.some(([clave, valor]) => clave !== 'sslmode' || !['require', 'verify-full'].includes(valor)) || opciones.length > 1) throw new Error()
    // El modo explícito prevalece sobre sslmode=require de la URL y verifica CA y hostname.
    return postgres(url, { max: 1, prepare: false, connect_timeout: 5, ssl: 'verify-full' })
  } catch {
    throw new Error('Configuración de conexión de lectura no válida.')
  }
}
