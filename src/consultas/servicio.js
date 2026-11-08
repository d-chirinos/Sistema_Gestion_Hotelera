export function crearConsultaIA(cliente) {
  return async (modo, texto) => {
    if (!['generar', 'explicar'].includes(modo) || typeof texto !== 'string' || texto.trim().length < 3 || texto.length > 4000) throw new Error('Introduce un texto de entre 3 y 4000 caracteres.')
    const { data, error } = await cliente.functions.invoke('consultas-gemini', { body: { modo, texto: texto.trim() } })
    if (error || !data || typeof data.explicacion !== 'string' || (modo === 'generar' && typeof data.sql !== 'string')) throw new Error('No fue posible consultar Gemini. Verifica la configuración o vuelve a intentarlo.')
    return data
  }
}
