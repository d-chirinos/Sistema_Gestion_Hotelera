export const RECURSOS = ['hotel', 'habitacion', 'tipo_habitacion', 'tarifa_habitacion', 'servicio']

export function crearServicio(client) {
  return {
    auth: client.auth,
    async cuenta() {
      const { data, error } = await client.rpc('mi_cuenta_hotelmanager')
      if (error) throw error
      if (!Array.isArray(data) || data.length > 1) throw new Error('Respuesta de identidad inválida')
      return data[0] ?? null
    },
    async perfilOperativo() {
      const { data, error } = await client.rpc('mi_perfil_operativo')
      if (error) throw error
      if (!Array.isArray(data) || data.length !== 1) throw new Error('Perfil no disponible')
      return data[0]
    },
    async recursos(cuenta) {
      const operativo = cuenta?.rol_sistema && cuenta.rol_sistema !== 'ADMINISTRADOR'
      const autorizados = cuenta?.rol_sistema === 'MANTENIMIENTO' ? ['hotel', 'habitacion', 'tipo_habitacion'] : RECURSOS
      const resultados = await Promise.all(RECURSOS.map(async recurso => {
        if (operativo && !autorizados.includes(recurso)) return [recurso, []]
        const filas = []
        const tamano = 200
        for (let pagina = 0; pagina < 100; pagina += 1) {
          const { data, error } = await client.rpc(operativo ? 'consultar_operativo' : 'consultar_mi_hotel', operativo ? { p_modulo: recurso } : { p_recurso: recurso })
            .range(pagina * tamano, (pagina + 1) * tamano - 1)
          if (error) throw error
          if (!Array.isArray(data)) throw new Error('Respuesta de consulta inválida')
          filas.push(...data)
          if (data.length < tamano) return [recurso, filas]
        }
        throw new Error('La consulta excede el límite de seguridad')
      }))
      return Object.fromEntries(resultados)
    },
  }
}
