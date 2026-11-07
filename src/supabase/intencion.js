// Identificadores aleatorios de 61 bits en un rango alto; siempre viajan como texto.
export function identificadorOperacion(cryptoAPI) {
  const partes = cryptoAPI.getRandomValues(new Uint32Array(2))
  return ((1n << 61n) + (((BigInt(partes[0]) << 32n) | BigInt(partes[1])) & ((1n << 61n) - 1n))).toString()
}
export function crearIntencion({ cliente, almacenamiento, bloqueos, cryptoAPI, operacion, rpc, idRespuesta, generarClave = identificadorOperacion }) {
  const prefijo = `hotelmanager-intencion:${operacion}:`
  async function usuario() {
    const { data, error } = await cliente.auth.getUser()
    if (error || !data?.user?.id) throw new Error('Sesión no disponible')
    return data.user.id
  }
  function leer(id) {
    const texto = almacenamiento.getItem(prefijo + id)
    if (!texto) return null
    try {
      const dato = JSON.parse(texto)
      if (!dato || !/^\d+$/.test(dato.clave) || !dato.parametros || typeof dato.parametros !== 'object') throw new Error()
      return dato
    } catch { throw new Error('La operación pendiente requiere revisión') }
  }
  async function pendiente() { return leer(await usuario()) }
  async function ejecutar(parametros) {
    if (!bloqueos?.request || !cryptoAPI?.getRandomValues) throw new Error('El navegador no permite reintentos seguros')
    const id = await usuario()
    return bloqueos.request(prefijo + id, { ifAvailable: true }, async lock => {
      if (!lock || await usuario() !== id) throw new Error('Operación no disponible')
      const llave = prefijo + id
      let actual = leer(id)
      if (!actual) {
        if (!parametros) throw new Error('No hay operación pendiente')
        actual = { clave: generarClave(cryptoAPI), parametros }
        almacenamiento.setItem(llave, JSON.stringify(actual))
      } else if (parametros && JSON.stringify(parametros) !== JSON.stringify(actual.parametros)) throw new Error('Hay una operación pendiente')
      if (await usuario() !== id) throw new Error('La sesión cambió')
      const { data, error } = await cliente.rpc(rpc, { ...actual.parametros, p_clave: actual.clave })
      if (error || !Array.isArray(data) || data.length !== 1 || data[0]?.[idRespuesta] !== actual.clave || typeof data[0]?.repetido !== 'boolean') throw new Error('Resultado no confirmado')
      almacenamiento.removeItem(llave)
      return data[0]
    })
  }
  return { pendiente, ejecutar }
}
