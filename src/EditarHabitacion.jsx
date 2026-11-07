import { useState } from 'react'
export default function EditarHabitacion({ cliente, datos, actualizar }) {
  const [id, setId] = useState(''), [numero, setNumero] = useState(''), [tipo, setTipo] = useState(''), [piso, setPiso] = useState(''), [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  const actual = datos.habitacion.find(h => String(h.id_habitacion) === id)
  function seleccionar(idNuevo) { const h = datos.habitacion.find(x => String(x.id_habitacion) === idNuevo); setId(idNuevo); setNumero(h?.numero ?? ''); setTipo(h ? String(h.tipo_habitacion_id_tipo) : ''); setPiso(h?.piso == null ? '' : String(h.piso)); setError('') }
  async function enviar(e) {
    e.preventDefault()
    if (!actual || !numero.trim() || !/^[1-9]\d*$/.test(tipo) || (piso !== '' && !/^-?\d{1,9}$/.test(piso))) { setError('Revisa los datos de la habitación.'); return }
    if (!window.confirm('¿Confirmas modificar esta habitación? Solo se permiten habitaciones disponibles sin historial.')) return
    setOcupado(true); setError('')
    try {
      const { data, error: fallo } = await cliente.rpc('actualizar_habitacion_sin_historial', { p_id: actual.id_habitacion, p_numero_anterior: actual.numero, p_tipo_anterior: actual.tipo_habitacion_id_tipo, p_piso_anterior: actual.piso ?? null, p_numero: numero.trim(), p_tipo: tipo, p_piso: piso === '' ? null : Number(piso) })
      if (fallo || !Array.isArray(data) || data.length !== 1) throw new Error()
      actualizar('Habitación actualizada.')
    } catch { setError('No se confirmó el cambio. Comprueba el estado, el historial y los datos actuales antes de reintentar.') }
    finally { setOcupado(false) }
  }
  const tipos = datos.tipo_habitacion.filter(t => datos.tarifa_habitacion.some(f => String(f.tipo_habitacion_id_tipo) === String(t.id_tipo)))
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Modificar habitación sin historial</h2><p>Una habitación con reservas o mantenimiento requiere revisión administrativa.</p></div></div><form onSubmit={enviar}>
    <label className="reservation-form-field"><span>Habitación a modificar</span><select required value={id} onChange={e => seleccionar(e.target.value)}><option value="">Selecciona</option>{datos.habitacion.map(h => <option key={h.id_habitacion} value={h.id_habitacion}>{h.numero}</option>)}</select></label>
    <label className="reservation-form-field"><span>Nuevo número</span><input required value={numero} onChange={e => setNumero(e.target.value)} /></label>
    <label className="reservation-form-field"><span>Nuevo tipo con tarifa</span><select required value={tipo} onChange={e => setTipo(e.target.value)}><option value="">Selecciona</option>{tipos.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}</select></label>
    <label className="reservation-form-field"><span>Nuevo piso</span><input value={piso} onChange={e => setPiso(e.target.value)} inputMode="numeric" /></label><button className="reservation-save-button" disabled={ocupado} type="submit">Actualizar habitación</button></form>{error && <p role="alert">{error}</p>}</div>
}
