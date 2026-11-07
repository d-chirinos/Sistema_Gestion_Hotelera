import { useEffect, useState } from 'react'
export default function EditarEmpleado({ cliente, empleados, consultar, actualizar }) {
  const [cargos, setCargos] = useState([]), [id, setId] = useState(''), [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  const [f, setF] = useState({ nombre: '', apellido: '', documentoAnterior: '', documento: '', cargo: '', fecha: '' })
  const actual = empleados.find(e => String(e.id_empleado) === id)
  useEffect(() => { let vigente = true; consultar('cargos').then(d => { if (vigente) setCargos(d) }).catch(() => { if (vigente) setError('No fue posible consultar los cargos del hotel.') }); return () => { vigente = false } }, [consultar])
  function seleccionar(valor) { const e = empleados.find(x => String(x.id_empleado) === valor); setId(valor); setF({ nombre: e?.nombre ?? '', apellido: e?.apellido ?? '', documentoAnterior: '', documento: '', cargo: e ? String(e.cargo_id_cargo) : '', fecha: e?.fecha_ingreso ?? '' }); setError('') }
  async function enviar(e) {
    e.preventDefault()
    if (!actual || !f.nombre.trim() || !f.apellido.trim() || !f.documentoAnterior.trim() || !f.documento.trim() || !cargos.some(c => String(c.id_cargo) === f.cargo) || !/^\d{4}-\d{2}-\d{2}$/.test(f.fecha)) { setError('Completa los datos solicitados.'); return }
    if (!window.confirm('¿Confirmas modificar este empleado sin cuenta ni historial?')) return
    setOcupado(true); setError('')
    try {
      const { data, error: fallo } = await cliente.rpc('actualizar_empleado_sin_historial', { p_id: actual.id_empleado, p_nombre_anterior: actual.nombre, p_apellido_anterior: actual.apellido, p_documento_anterior: f.documentoAnterior.trim(), p_cargo_anterior: actual.cargo_id_cargo, p_fecha_anterior: actual.fecha_ingreso, p_nombre: f.nombre.trim(), p_apellido: f.apellido.trim(), p_documento: f.documento.trim(), p_cargo: f.cargo, p_fecha: f.fecha })
      if (fallo || !Array.isArray(data) || data.length !== 1) throw new Error()
      actualizar('Empleado actualizado sin modificar cuentas de acceso.')
    } catch { setError('No se confirmó el cambio. Verifica el documento, la cuenta y el historial antes de volver a intentarlo.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Modificar empleado sin historial</h2><p>Solo empleados sin cuenta, estadías ni mantenimientos. Introduce el documento actual sin mostrar fichas personales.</p></div></div><form onSubmit={enviar}><div className="reservation-form-grid real-cotizador-grid">
    <label className="reservation-form-field"><span>Empleado a modificar</span><select required value={id} onChange={e => seleccionar(e.target.value)}><option value="">Selecciona</option>{empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>)}</select></label>
    {[['nombre', 'Nuevo nombre'], ['apellido', 'Nuevo apellido'], ['documentoAnterior', 'Documento actual'], ['documento', 'Nuevo documento']].map(([campo, etiqueta]) => <label className="reservation-form-field" key={campo}><span>{etiqueta}</span><input required value={f[campo]} onChange={e => setF({ ...f, [campo]: e.target.value })} /></label>)}
    <label className="reservation-form-field"><span>Nuevo cargo del hotel</span><select required value={f.cargo} onChange={e => setF({ ...f, cargo: e.target.value })}><option value="">Selecciona</option>{cargos.map(c => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}</select></label>
    <label className="reservation-form-field"><span>Nueva fecha de ingreso</span><input type="date" required value={f.fecha} onChange={e => setF({ ...f, fecha: e.target.value })} /></label></div>
    <button className="reservation-save-button" type="submit" disabled={ocupado}>Actualizar empleado</button></form>{error && <p role="alert">{error}</p>}</div>
}
