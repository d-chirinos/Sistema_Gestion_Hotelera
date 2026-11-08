// Mitiga fórmulas activas en hojas de cálculo y conserva el dato dentro de una celda.
export function resultadosCSV(columnas, filas) {
  const celda = valor => {
    let texto = valor == null ? '' : typeof valor === 'object' ? JSON.stringify(valor) : String(valor)
    if ((/^[\s]*[=+@-]/.test(texto) || (texto.length > 0 && texto.charCodeAt(0) < 32))) texto = "'" + texto
    return '"' + texto.replaceAll('"', '""') + '"'
  }
  return '\ufeff' + [columnas.map(celda).join(','), ...filas.map(fila => columnas.map((c, i) => celda(Array.isArray(fila) ? fila[i] : fila[c])).join(','))].join('\r\n')
}
