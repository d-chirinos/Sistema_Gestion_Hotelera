import { soles } from './utils/moneda.js'
import { useState } from 'react'
export default function PrecioFormulario({ recurso, datos, cliente, actualizar, seleccionado }) {
  const [id, setId] = useState(seleccionado ? String(recurso === 'tarifa_habitacion' ? seleccionado.id_tarifa : seleccionado.id_servicio) : '')
  const [precio, setPrecio] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const esTarifa = recurso === 'tarifa_habitacion'
  const filas = datos[recurso]
  const seleccion = filas.find(fila => String(esTarifa ? fila.id_tarifa : fila.id_servicio) === id)
  async function guardar(evento) {
    evento.preventDefault()
    if (!seleccion || !/^\d{1,8}(\.\d{1,2})?$/.test(precio) || (esTarifa && Number(precio) <= 0)) { setError('Selecciona un registro y un precio válido.'); return }
    if (!window.confirm('¿Confirmas el nuevo precio? No cambia importes históricos.')) return
    setOcupado(true); setError('')
    try {
      const nombre = esTarifa ? 'actualizar_tarifa_hotel' : 'actualizar_precio_servicio'
      const params = esTarifa ? { p_tipo_id: seleccion.tipo_habitacion_id_tipo, p_precio_anterior: seleccion.precio_noche, p_precio_nuevo: precio } : { p_servicio_id: seleccion.id_servicio, p_precio_anterior: seleccion.precio, p_precio_nuevo: precio }
      const { data, error: fallo } = await cliente.rpc(nombre, params)
      if (fallo || !Array.isArray(data) || data.length !== 1) throw new Error()
      actualizar()
    } catch { setError('No se confirmó el cambio. Actualiza los datos y revisa el precio antes de intentarlo de nuevo.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Actualizar {esTarifa ? 'tarifa' : 'precio de servicio'}</h2><p>El cambio afecta el precio vigente, sin alterar importes históricos.</p></div></div><form onSubmit={guardar}>
    <label className="reservation-form-field"><span>Registro</span><select required value={id} onChange={e => setId(e.target.value)}><option value="">Selecciona</option>{filas.map(fila => { const valor = esTarifa ? fila.id_tarifa : fila.id_servicio; const tipo = datos.tipo_habitacion.find(t => String(t.id_tipo) === String(fila.tipo_habitacion_id_tipo)); return <option key={valor} value={valor}>{esTarifa ? `${tipo?.nombre ?? 'Tipo'} — ${soles(fila.precio_noche)}` : `${fila.nombre} — ${soles(fila.precio)}`}</option> })}</select></label>
    <label className="reservation-form-field"><span>Nuevo precio <span aria-hidden="true">(S/)</span></span><input aria-label="Nuevo precio" placeholder="S/ 0.00" required inputMode="decimal" value={precio} onChange={e => setPrecio(e.target.value)} /></label>
    <button type="submit" className="reservation-save-button" disabled={ocupado}>Guardar precio</button></form>{error && <p role="alert">{error}</p>}</div>
}
