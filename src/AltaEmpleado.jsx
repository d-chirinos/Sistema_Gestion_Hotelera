import { useEffect, useState } from 'react'
export default function AltaEmpleado({ cliente, consultar, actualizar }) {
  const [cargos, setCargos] = useState([]), [listo, setListo] = useState(false), [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  const [f, setF] = useState({ nombre: '', apellido: '', documento: '', cargo: '', fecha: '' })
  useEffect(() => { let vigente = true; consultar('cargos').then(d => { if (vigente) { setCargos(d); setListo(true) } }).catch(() => { if (vigente) setError('No fue posible consultar los cargos del hotel.') }); return () => { vigente = false } }, [consultar])
  async function enviar(e) {
    e.preventDefault()
    if (!f.nombre.trim() || !f.apellido.trim() || !f.documento.trim() || !cargos.some(c => String(c.id_cargo) === f.cargo) || !/^\d{4}-\d{2}-\d{2}$/.test(f.fecha)) { setError('Completa los datos y el cargo del hotel.'); return }
    if (!window.confirm('¿Confirmas el alta del empleado en este hotel? No se creará una cuenta de acceso.')) return
    setOcupado(true); setError('')
    try {
      const { data, error: fallo } = await cliente.rpc('registrar_empleado_hotel', { p_nombre: f.nombre.trim(), p_apellido: f.apellido.trim(), p_documento: f.documento.trim(), p_cargo: f.cargo, p_fecha_ingreso: f.fecha })
      if (fallo || !Array.isArray(data) || data.length !== 1 || typeof data[0].repetido !== 'boolean') throw new Error()
      actualizar(data[0].repetido ? 'El empleado ya estaba registrado con esos datos.' : 'Empleado registrado sin cuenta de acceso.')
    } catch { setError('No se confirmó el registro. Revisa si ya existe y solicita conciliación si los datos difieren; no vuelvas a enviar datos distintos sin comprobar el resultado.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Registrar empleado</h2><p>Se registra en el hotel asignado. El alta no crea una cuenta de acceso.</p></div></div><form onSubmit={enviar}><div className="reservation-form-grid real-cotizador-grid">
    {[['nombre', 'Nombre'], ['apellido', 'Apellido'], ['documento', 'Documento']].map(([campo, etiqueta]) => <label className="reservation-form-field" key={campo}><span>{etiqueta}</span><input required value={f[campo]} onChange={e => setF({ ...f, [campo]: e.target.value })} /></label>)}
    <label className="reservation-form-field"><span>Cargo del hotel</span><select required value={f.cargo} onChange={e => setF({ ...f, cargo: e.target.value })}><option value="">Selecciona</option>{cargos.map(c => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}</select></label>
    <label className="reservation-form-field"><span>Fecha de ingreso</span><input required type="date" value={f.fecha} onChange={e => setF({ ...f, fecha: e.target.value })} /></label></div>
    <button className="reservation-save-button" type="submit" disabled={!listo || ocupado}>Registrar empleado</button></form>{error && <p role="alert">{error}</p>}</div>
}
