export function crearConsultaIA(cliente) {
  return async (modo, texto) => {
    if (!['generar', 'explicar'].includes(modo) || typeof texto !== 'string' || texto.trim().length < 3 || texto.length > 4000) throw new Error('Introduce un texto de entre 3 y 4000 caracteres.')
    const { data, error } = await cliente.functions.invoke('consultas-gemini', { body: { modo, texto: texto.trim() } })
    if (error || !data || typeof data.explicacion !== 'string' || (modo === 'generar' && typeof data.sql !== 'string')) throw new Error('No fue posible consultar Gemini. Verifica la configuración o vuelve a intentarlo.')
    return data
  }
}

export function crearEjecutorSQL(cliente) {
  return async sql => {
    if (typeof sql !== 'string' || !sql.trim() || sql.length > 8000) throw new Error('Introduce una consulta de hasta 8000 caracteres.')
    const { data, error } = await cliente.functions.invoke('ejecutar-consulta-sql', { body: { sql } })
    if (error) {
      let detalle
      try { detalle = await error.context?.json() } catch { /* respuesta no disponible */ }
      throw new Error(typeof detalle?.error === 'string' ? detalle.error : 'No se pudo ejecutar la consulta. Comprueba la configuración y vuelve a intentarlo.')
    }
    if (!data || !Array.isArray(data.columnas) || !data.columnas.every(c => typeof c === 'string') || !Array.isArray(data.filas) || data.filas.length > 200 || !data.filas.every(f => Array.isArray(f) && f.length === data.columnas.length) || typeof data.sql_ejecutado !== 'string') throw new Error('Respuesta de consulta inválida.')
    return data
  }
}
