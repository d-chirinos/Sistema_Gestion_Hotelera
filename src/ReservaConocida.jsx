import { soles } from './utils/moneda.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { clientesHotel, claveReserva } from './supabase/clientes.js'
import { crearIntencion } from './supabase/intencion.js'
export default function ReservaConocida({ cliente, habitaciones, cotizar, actualizar, operativo = false }) {
  const [clientes, setClientes] = useState([]), [pendiente, setPendiente] = useState(null), [listo, setListo] = useState(false), [form, setForm] = useState({ cliente: '', habitacion: '', entrada: '', salida: '' }), [precio, setPrecio] = useState(null), [ocupado, setOcupado] = useState(false), [aviso, setAviso] = useState('')
  const version = useRef(0)
  const servicio = useMemo(() => {
    try { return crearIntencion({ cliente, almacenamiento: window.localStorage, bloqueos: navigator.locks, cryptoAPI: crypto, operacion: 'reserva_conocida', rpc: 'crear_reserva_cliente_conocido', idRespuesta: 'id_reserva', generarClave: claveReserva }) }
    catch { return { pendiente: async () => { throw new Error('Almacenamiento no disponible') }, ejecutar: async () => { throw new Error('Almacenamiento no disponible') } } }
  }, [cliente])
  useEffect(() => { const contador = version; let activo = true; Promise.all([clientesHotel(cliente, operativo), servicio.pendiente()]).then(([c, p]) => { if (activo) { setClientes(c); setPendiente(p); setListo(true) } }).catch(() => { if (activo) setAviso('No fue posible preparar la operación.') }); return () => { activo = false; contador.current++ } }, [cliente, servicio, operativo])
  function cambiar(campo, valor) { version.current++; setOcupado(false); setPrecio(null); setAviso(''); setForm(f => ({ ...f, [campo]: valor })) }
  async function cotizarFormulario() {
    if (!clientes.some(c => String(c.id_cliente) === form.cliente) || !habitaciones.some(h => String(h.id_habitacion) === form.habitacion) || !form.entrada || !form.salida || form.salida <= form.entrada) { setAviso('Revisa el cliente, la habitación y las fechas.'); return }
    const turno = ++version.current; setOcupado(true); setAviso('')
    try { const r = await cotizar(form); if (turno === version.current) setPrecio(r) } catch { if (turno === version.current) setAviso('No se pudo cotizar la reserva.') } finally { if (turno === version.current) setOcupado(false) }
  }
  async function enviar(e) {
    e.preventDefault()
    if (!pendiente && !precio) { setAviso('Cotiza y confirma el precio antes de reservar.'); return }
    if (!window.confirm(pendiente ? '¿Reintentar la misma reserva pendiente?' : `¿Confirmas la reserva por ${soles(precio.total)}?`)) return
    setOcupado(true); setAviso('')
    try {
      const args = pendiente ? null : { p_cliente: form.cliente, p_habitacion: form.habitacion, p_entrada: form.entrada, p_salida: form.salida, p_precio_aceptado: String(precio.precio_noche) }
      const r = await servicio.ejecutar(args); setPendiente(null); setAviso(`Reserva ${r.id_reserva} ${r.repetido ? 'ya registrada' : 'registrada'}.`); actualizar()
    } catch { try { setPendiente(await servicio.pendiente()) } catch { setListo(false) }; setAviso('No se confirmó el resultado. Reintenta la misma operación o solicita conciliación.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Nueva reserva de cliente vinculado</h2><p>Solo clientes que ya tienen una reserva en este hotel. El alta y la primera visita permanecen bloqueadas.</p></div></div>
    {pendiente && <p role="status">Reserva pendiente {pendiente.clave}; el reintento conserva los mismos datos.</p>}
    <form onSubmit={enviar}>{!pendiente && <div className="reservation-form-grid real-cotizador-grid"><label className="reservation-form-field"><span>Cliente vinculado</span><select required disabled={ocupado} value={form.cliente} onChange={e => cambiar('cliente', e.target.value)}><option value="">Selecciona</option>{clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>)}</select></label><label className="reservation-form-field"><span>Habitación para reserva</span><select required disabled={ocupado} value={form.habitacion} onChange={e => cambiar('habitacion', e.target.value)}><option value="">Selecciona</option>{habitaciones.map(h => <option key={h.id_habitacion} value={h.id_habitacion}>{h.numero}</option>)}</select></label>{[['entrada', 'Entrada de reserva'], ['salida', 'Salida de reserva']].map(([campo, titulo]) => <label className="reservation-form-field" key={campo}><span>{titulo}</span><input type="date" required disabled={ocupado} value={form[campo]} onChange={e => cambiar(campo, e.target.value)} /></label>)}</div>}
    {!pendiente && <button type="button" className="list-clear-button" disabled={!listo || ocupado} onClick={cotizarFormulario}>Cotizar nueva reserva</button>}{precio && !pendiente && <p>Tarifa: {soles(precio.precio_noche)} · Noches: {precio.noches} · Total: {soles(precio.total)}. La disponibilidad se validará al confirmar.</p>}
    <button type="submit" className="reservation-save-button" disabled={!listo || ocupado || (!pendiente && !precio)}>{pendiente ? 'Reintentar reserva pendiente' : 'Confirmar reserva'}</button></form>{aviso && <p role="status">{aviso}</p>}
  </div>
}
