import { useEffect, useMemo, useState } from 'react'
import { crearIntencion } from './supabase/intencion.js'

function Inicio({ modulo, cliente, datos, actualizar }) {
  const mantenimiento = modulo === 'mantenimiento'
  const [form, setForm] = useState({ referencia: '', servicio: '', valor: '' })
  const [pendiente, setPendiente] = useState(null)
  const [listo, setListo] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const servicio = useMemo(() => crearIntencion({ cliente, almacenamiento: window.localStorage, bloqueos: navigator.locks, cryptoAPI: crypto, operacion: modulo, rpc: mantenimiento ? 'iniciar_mantenimiento_hotel' : 'registrar_consumo_estadia', idRespuesta: mantenimiento ? 'id_mantenimiento' : 'id_consumo' }), [cliente, modulo, mantenimiento])
  useEffect(() => { let vigente = true; servicio.pendiente().then(p => { if (vigente) { setPendiente(p); setListo(true) } }).catch(() => { if (vigente) setMensaje('No se pudo revisar la operación pendiente.') }); return () => { vigente = false } }, [servicio])
  async function enviar(e) {
    e.preventDefault()
    let args = null
    if (!pendiente) {
      if (!/^[1-9]\d*$/.test(form.referencia)) { setMensaje('Indica un identificador válido.'); return }
      if (mantenimiento) {
        if (!form.valor.trim() || !datos.habitacion.some(h => String(h.id_habitacion) === form.referencia)) { setMensaje('Selecciona una habitación y describe la intervención.'); return }
        args = { p_habitacion: form.referencia, p_tipo: form.valor.trim() }
      } else {
        if (!/^[1-9]\d*$/.test(form.valor) || Number(form.valor) > 2147483647 || !datos.servicio.some(s => String(s.id_servicio) === form.servicio)) { setMensaje('Selecciona un servicio y una cantidad válida.'); return }
        args = { p_estadia: form.referencia, p_servicio: form.servicio, p_cantidad: Number(form.valor), p_precio_esperado: String(datos.servicio.find(s => String(s.id_servicio) === form.servicio).precio) }
      }
    }
    if (!window.confirm(pendiente ? '¿Reintentar la misma operación pendiente?' : `¿Confirmas ${mantenimiento ? 'iniciar el mantenimiento' : 'registrar el consumo'}?`)) return
    setOcupado(true); setMensaje('')
    try {
      const resultado = await servicio.ejecutar(args)
      setPendiente(null); setForm({ referencia: '', servicio: '', valor: '' })
      setMensaje(`${mantenimiento ? 'Intervención' : 'Consumo'} ${resultado[mantenimiento ? 'id_mantenimiento' : 'id_consumo']} registrado${resultado.repetido ? ' previamente' : ''}.`)
      actualizar(mantenimiento)
    } catch {
      try { setPendiente(await servicio.pendiente()) } catch { setListo(false) }
      setMensaje('No se confirmó el resultado. Reintenta la operación pendiente con los mismos datos o solicita conciliación.')
    } finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>{mantenimiento ? 'Iniciar mantenimiento' : 'Registrar consumo'}</h2><p>{mantenimiento ? 'Se revisarán la ocupación y las reservas de la habitación.' : 'El precio vigente se guarda como precio aplicado del consumo.'}</p></div></div>
    {pendiente && <p role="status">Operación pendiente {pendiente.clave}. Al reintentar se usarán los mismos datos.</p>}
    {!pendiente && <form id={`form-${modulo}`} onSubmit={enviar}><div className="reservation-form-grid real-cotizador-grid">
      {mantenimiento ? <label className="reservation-form-field"><span>Habitación de mantenimiento</span><select required value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })}><option value="">Selecciona</option>{datos.habitacion.map(h => <option key={h.id_habitacion} value={h.id_habitacion}>{h.numero}</option>)}</select></label> : <label className="reservation-form-field"><span>ID de estadía para consumo</span><input required inputMode="numeric" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} /></label>}
      {!mantenimiento && <label className="reservation-form-field"><span>Servicio consumido</span><select required value={form.servicio} onChange={e => setForm({ ...form, servicio: e.target.value })}><option value="">Selecciona</option>{datos.servicio.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombre} — {s.precio}</option>)}</select></label>}
      <label className="reservation-form-field"><span>{mantenimiento ? 'Tipo de intervención' : 'Cantidad'}</span><input required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></label>
    </div><button type="submit" className="reservation-save-button" disabled={!listo || ocupado}>{ocupado ? 'Enviando…' : mantenimiento ? 'Iniciar mantenimiento' : 'Registrar consumo'}</button></form>}
    {pendiente && <button type="button" className="reservation-save-button" disabled={!listo || ocupado} onClick={enviar}>Reintentar operación pendiente</button>}
    {mensaje && <p role="status">{mensaje}</p>}
  </div>
}
function Cierre({ cliente, datos, actualizar, permitirLiberar }) {
  const [id, setId] = useState(''), [costo, setCosto] = useState(''), [habitacion, setHabitacion] = useState('')
  const [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  async function operar(e, nombre, args, confirmacion) {
    e.preventDefault()
    if (!window.confirm(confirmacion)) return
    setOcupado(true); setError('')
    try {
      const { data, error: fallo } = await cliente.rpc(nombre, args)
      if (fallo || !Array.isArray(data) || data.length !== 1) throw new Error()
      actualizar(true)
    } catch { setError('No se confirmó la operación. Revisa los datos antes de reintentar; un histórico ambiguo requiere conciliación.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Finalizar intervención y liberar habitación</h2><p>Dos acciones separadas. Finalizar no cambia automáticamente la disponibilidad.</p></div></div>
    <form onSubmit={e => { if (!/^[1-9]\d*$/.test(id) || !/^\d{1,8}(\.\d{1,2})?$/.test(costo)) { e.preventDefault(); setError('Indica un ID y un costo válido.'); return } void operar(e, 'finalizar_mantenimiento_hotel', { p_id: id, p_costo: costo, p_confirmacion: true }, '¿Confirmas que esta intervención está terminada y que el costo indicado es correcto?') }}>
      <label className="reservation-form-field"><span>ID de intervención</span><input required inputMode="numeric" value={id} onChange={e => setId(e.target.value)} /></label><label className="reservation-form-field"><span>Costo confirmado</span><input required inputMode="decimal" value={costo} onChange={e => setCosto(e.target.value)} /></label><button className="reservation-save-button" type="submit" disabled={ocupado}>Finalizar mantenimiento</button></form>
    {permitirLiberar && <form onSubmit={e => { if (!habitacion) { e.preventDefault(); return } void operar(e, 'liberar_habitacion_mantenimiento', { p_habitacion: habitacion }, '¿Confirmas que la habitación puede volver a estar disponible?') }}>
      <label className="reservation-form-field"><span>Habitación a liberar</span><select required value={habitacion} onChange={e => setHabitacion(e.target.value)}><option value="">Selecciona</option>{datos.habitacion.map(h => <option key={h.id_habitacion} value={h.id_habitacion}>{h.numero}</option>)}</select></label><button className="reservation-save-button" type="submit" disabled={ocupado}>Liberar habitación</button></form>}
    {error && <p role="alert">{error}</p>}
  </div>
}
export default function ConsumosMantenimiento({ modulo, cliente, datos, actualizar, refrescar, permitirLiberar }) {
  return <><Inicio modulo={modulo} cliente={cliente} datos={datos} actualizar={completo => completo ? actualizar() : refrescar()} />{modulo === 'mantenimiento' && <Cierre cliente={cliente} datos={datos} actualizar={actualizar} permitirLiberar={permitirLiberar} />}</>
}
