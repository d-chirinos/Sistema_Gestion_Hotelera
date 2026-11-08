export const MODULOS_OPERATIVOS = ['estadias', 'pagos', 'consumos', 'mantenimiento', 'empleados', 'cargos']

export function crearConsultaOperaciones(cliente, operativo = false) {
  return async modulo => {
    if (!MODULOS_OPERATIVOS.includes(modulo)) throw new Error('Módulo no autorizado')
    const filas = []
    for (let inicio = 0; ; inicio += 200) {
      const { data, error } = await cliente.rpc(operativo ? 'consultar_operativo' : 'consultar_operaciones_hotel', { p_modulo: modulo }).range(inicio, inicio + 199)
      if (error || !Array.isArray(data)) throw new Error('No se pudo consultar el módulo')
      filas.push(...data)
      if (data.length < 200) return filas
    }
  }
}
