// No se habilitan escrituras desde el cliente en esta etapa.
export function crearConsultaReservas(client) {
  return async function listarReservas() {
    const filas = []
    const tamano = 200
    for (let pagina = 0; pagina < 100; pagina += 1) {
      const { data, error } = await client.rpc('listar_reservas_mi_hotel').range(pagina * tamano, (pagina + 1) * tamano - 1)
      if (error) throw error
      if (!Array.isArray(data)) throw new Error('Respuesta de reservas inválida')
      filas.push(...data)
      if (data.length < tamano) return filas
    }
    throw new Error('La consulta excede el límite de seguridad')
  }
}

export function crearCotizadorReservas(client) {
  return async function cotizar({ habitacion, entrada, salida }) {
    const { data, error } = await client.rpc('cotizar_reserva', {
      p_habitacion_id: habitacion,
      p_entrada: entrada,
      p_salida: salida,
    })
    if (error) throw error
    if (!Array.isArray(data) || data.length !== 1) throw new Error('Respuesta de cotización inválida')
    return data[0]
  }
}
