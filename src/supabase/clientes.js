export async function clientesHotel(cliente, operativo = false) {
  const filas = []
  for (let pagina = 0; pagina < 100; pagina++) {
    const { data, error } = await cliente.rpc(operativo ? 'consultar_operativo' : 'listar_clientes_mi_hotel', operativo ? { p_modulo: 'clientes' } : undefined).range(pagina * 200, pagina * 200 + 199)
    if (error || !Array.isArray(data)) throw new Error('No fue posible consultar clientes')
    filas.push(...data)
    if (data.length < 200) return filas
  }
  throw new Error('Se excedió el límite de consulta')
}
export function claveReserva(cryptoAPI) {
  const partes = cryptoAPI.getRandomValues(new Uint32Array(2))
  return ((1n << 52n) + (((BigInt(partes[0]) << 32n) | BigInt(partes[1])) & ((1n << 52n) - 1n))).toString()
}
