import { useState } from 'react'

export default function AltaCatalogo({ recurso, datos, cliente, actualizar }) {
  const servicio = recurso === 'servicio'
  const [nombre, setNombre] = useState(''), [precio, setPrecio] = useState(''), [tipo, setTipo] = useState(''), [piso, setPiso] = useState('')
  const [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  async function enviar(e) {
    e.preventDefault()
    const valido = nombre.trim() && (servicio ? /^\d{1,8}(\.\d{1,2})?$/.test(precio) : /^[1-9]\d*$/.test(tipo) && (piso === '' || /^-?\d{1,9}$/.test(piso)))
    if (!valido) { setError('Revisa los campos indicados.'); return }
    if (!window.confirm(`¿Confirmas registrar ${servicio ? 'este servicio' : 'esta habitación'} en tu hotel?`)) return
    setOcupado(true); setError('')
    try {
      const rpc = servicio ? 'crear_servicio_hotel' : 'crear_habitacion_hotel'
      const args = servicio ? { p_nombre: nombre.trim(), p_precio: precio } : { p_numero: nombre.trim(), p_tipo: tipo, p_piso: piso === '' ? null : Number(piso) }
      const { data, error: fallo } = await cliente.rpc(rpc, args)
      if (fallo || !Array.isArray(data) || data.length !== 1 || typeof data[0].repetido !== 'boolean') throw new Error()
      actualizar(data[0].repetido ? 'El registro ya existía con los mismos datos.' : 'Registro completado.')
    } catch { setError('No se confirmó el registro. Actualiza el catálogo y revisa si ya existe antes de reintentar con los mismos datos.') }
    finally { setOcupado(false) }
  }
  const tipos = datos.tipo_habitacion.filter(t => datos.tarifa_habitacion.some(tarifa => String(tarifa.tipo_habitacion_id_tipo) === String(t.id_tipo)))
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>{servicio ? 'Registrar servicio' : 'Registrar habitación'}</h2><p>Alta en el hotel asignado a tu cuenta.</p></div></div><form onSubmit={enviar}>
    <label className="reservation-form-field"><span>{servicio ? 'Nombre del servicio' : 'Número de habitación'}</span><input required value={nombre} onChange={e => setNombre(e.target.value)} /></label>
    {servicio ? <label className="reservation-form-field"><span>Precio inicial</span><input required inputMode="decimal" value={precio} onChange={e => setPrecio(e.target.value)} /></label> : <><label className="reservation-form-field"><span>Tipo con tarifa del hotel</span><select required value={tipo} onChange={e => setTipo(e.target.value)}><option value="">Selecciona</option>{tipos.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}</select></label><label className="reservation-form-field"><span>Piso opcional</span><input inputMode="numeric" value={piso} onChange={e => setPiso(e.target.value)} /></label></>}
    <button type="submit" className="reservation-save-button" disabled={ocupado}>{ocupado ? 'Registrando…' : servicio ? 'Registrar servicio' : 'Registrar habitación'}</button></form>{error && <p role="alert">{error}</p>}</div>
}
