import { soles } from './utils/moneda.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { claveReserva } from './supabase/clientes.js'
import { crearIntencion } from './supabase/intencion.js'
export default function PrimeraReserva({ cliente, habitaciones, cotizar, actualizar }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', tipo: '', pais: '', documento: '', habitacion: '', entrada: '', salida: '' }), [precio, setPrecio] = useState(null), [pendiente, setPendiente] = useState(null), [listo, setListo] = useState(false), [ocupado, setOcupado] = useState(false), [aviso, setAviso] = useState('')
  const version = useRef(0)
  const servicio = useMemo(() => {
    try { return crearIntencion({ cliente, almacenamiento: window.sessionStorage, bloqueos: navigator.locks, cryptoAPI: crypto, operacion: 'primera_reserva', rpc: 'crear_cliente_y_primera_reserva', idRespuesta: 'id_reserva', generarClave: claveReserva }) }
    catch { return { pendiente: async () => { throw new Error('Almacenamiento no disponible') }, ejecutar: async () => { throw new Error('Almacenamiento no disponible') } } }
  }, [cliente])
  useEffect(() => { const contador = version; let activo = true; servicio.pendiente().then(p => { if (activo) { setPendiente(p); setListo(true) } }).catch(() => { if (activo) setAviso('No fue posible preparar la operación.') }); return () => { activo = false; contador.current++ } }, [servicio])
  function cambiar(campo, valor) { version.current++; setPrecio(null); setAviso(''); setForm(f => ({ ...f, [campo]: valor })) }
  async function obtenerPrecio() {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.tipo.trim() || !form.pais.trim() || !form.documento.trim() || !habitaciones.some(h => String(h.id_habitacion) === form.habitacion) || !form.entrada || !form.salida || form.salida <= form.entrada) { setAviso('Completa los datos, habitación y fechas válidas.'); return }
    const turno = ++version.current; setOcupado(true); setAviso('')
    try { const r = await cotizar(form); if (turno === version.current) setPrecio(r) } catch { if (turno === version.current) setAviso('No se pudo cotizar la reserva.') } finally { if (turno === version.current) setOcupado(false) }
  }
  async function enviar(e) {
    e.preventDefault()
    if (!pendiente && !precio) { setAviso('Cotiza y confirma el precio antes de registrar.'); return }
    if (!window.confirm(pendiente ? '¿Reintentar la misma solicitud pendiente?' : `¿Confirmas registrar el cliente nuevo y la reserva por ${soles(precio.total)}?`)) return
    setOcupado(true); setAviso('')
    try {
      const args = pendiente ? null : { p_nombre: form.nombre.trim(), p_apellido: form.apellido.trim(), p_tipo_documento: form.tipo.trim(), p_pais_documento: form.pais.trim(), p_documento: form.documento.trim(), p_habitacion: form.habitacion, p_entrada: form.entrada, p_salida: form.salida, p_precio_aceptado: String(precio.precio_noche) }
      const r = await servicio.ejecutar(args); setPendiente(null); setForm({ nombre: '', apellido: '', tipo: '', pais: '', documento: '', habitacion: '', entrada: '', salida: '' }); setPrecio(null); setAviso(`Reserva ${r.id_reserva} ${r.repetido ? 'ya registrada' : 'registrada'}.`); actualizar()
    } catch { try { setPendiente(await servicio.pendiente()) } catch { setListo(false) }; setAviso('No se confirmó el resultado. Revisa los datos y, si persiste, solicita conciliación sin volver a registrar con datos distintos.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Cliente nuevo y primera reserva</h2><p>En ensayo usa identidades ficticias. Si los datos coinciden con un registro existente, la solicitud requiere revisión; no se vincula automáticamente.</p></div></div>
    {pendiente && <p role="status">Solicitud pendiente {pendiente.clave}. El reintento conserva los mismos datos en esta pestaña.</p>}
    <form onSubmit={enviar}>{!pendiente && <div className="reservation-form-grid real-cotizador-grid">
      {[['nombre', 'Nombre del cliente nuevo'], ['apellido', 'Apellido del cliente nuevo'], ['tipo', 'Tipo de documento'], ['pais', 'País emisor'], ['documento', 'Documento del cliente nuevo']].map(([campo, titulo]) => <label key={campo} className="reservation-form-field"><span>{titulo}</span><input required disabled={ocupado} value={form[campo]} onChange={e => cambiar(campo, e.target.value)} /></label>)}
      <label className="reservation-form-field"><span>Habitación para primera reserva</span><select required disabled={ocupado} value={form.habitacion} onChange={e => cambiar('habitacion', e.target.value)}><option value="">Selecciona</option>{habitaciones.map(h => <option key={h.id_habitacion} value={h.id_habitacion}>{h.numero}</option>)}</select></label>
      {[['entrada', 'Entrada primera reserva'], ['salida', 'Salida primera reserva']].map(([campo, titulo]) => <label key={campo} className="reservation-form-field"><span>{titulo}</span><input required disabled={ocupado} type="date" value={form[campo]} onChange={e => cambiar(campo, e.target.value)} /></label>)}
    </div>}
    {!pendiente && <button type="button" className="list-clear-button" disabled={!listo || ocupado} onClick={obtenerPrecio}>Cotizar primera reserva</button>}{precio && !pendiente && <p>Tarifa: {soles(precio.precio_noche)} · Noches: {precio.noches} · Total: {soles(precio.total)}. La disponibilidad se valida al confirmar.</p>}
    <button className="reservation-save-button" type="submit" disabled={!listo || ocupado || (!pendiente && !precio)}>{pendiente ? 'Reintentar primera reserva pendiente' : 'Registrar cliente y reserva'}</button></form>{aviso && <p role="status">{aviso}</p>}
  </div>
}
