import { useEffect, useRef, useState } from 'react'

const fecha = valor => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor ?? '')) return '—'
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

function Cotizador({ habitaciones, cotizar }) {
  const [form, setForm] = useState({ habitacion: '', entrada: '', salida: '' })
  const [resultado, setResultado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const version = useRef(0)
  useEffect(() => () => { version.current += 1 }, [])
  function actualizar(campo, valor) {
    version.current += 1
    setCargando(false)
    setResultado(null)
    setMensaje('')
    setForm(actual => ({ ...actual, [campo]: valor }))
  }
  async function enviar(evento) {
    evento.preventDefault()
    setResultado(null)
    if (!form.habitacion || !form.entrada || !form.salida || form.salida <= form.entrada) {
      setMensaje('Selecciona una habitación y una salida posterior a la entrada.')
      return
    }
    const turno = ++version.current
    setMensaje('')
    setCargando(true)
    try {
      const precio = await cotizar(form)
      if (version.current === turno) setResultado(precio)
    } catch {
      if (version.current === turno) setMensaje('No se pudo obtener la cotización. Revisa los datos o inténtalo de nuevo.')
    } finally {
      if (version.current === turno) setCargando(false)
    }
  }
  return <div className="room-list reservations-list real-cotizador"><div className="room-list-header reservations-list-header"><div><h2>Cotizar alojamiento</h2><p>Consulta la tarifa vigente para una habitación de tu hotel.</p></div></div>
    <form onSubmit={enviar}><div className="reservation-form-grid real-cotizador-grid">
      <label className="reservation-form-field"><span>Habitación</span><select required value={form.habitacion} onChange={e => actualizar('habitacion', e.target.value)}><option value="">Selecciona una habitación</option>{habitaciones.map(h => <option key={h.id_habitacion} value={h.id_habitacion}>{h.numero}</option>)}</select></label>
      <label className="reservation-form-field"><span>Fecha de entrada</span><input type="date" required value={form.entrada} onChange={e => actualizar('entrada', e.target.value)} /></label>
      <label className="reservation-form-field"><span>Fecha de salida</span><input type="date" required value={form.salida} onChange={e => actualizar('salida', e.target.value)} /></label>
    </div><div className="real-cotizador-acciones"><button className="reservation-save-button" type="submit" disabled={cargando}>{cargando ? 'Consultando…' : 'Cotizar'}</button><span>La cotización no reserva la habitación ni congela la tarifa.</span></div></form>
    {mensaje && <p role="alert" className="reservation-form-error">{mensaje}</p>}
    {resultado && <div className="reservation-balance-preview" role="status"><span>{resultado.noches} noche(s) · Tarifa por noche: {resultado.precio_noche}</span><strong>Total: {resultado.total}</strong></div>}
  </div>
}

export default function Reservas({ consultar, cotizar, habitaciones }) {
  const [estado, setEstado] = useState({ estado: 'cargando' })
  const [busqueda, setBusqueda] = useState('')
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    let vigente = true
    consultar().then(datos => { if (vigente) setEstado({ estado: 'listo', datos }) })
      .catch(() => { if (vigente) setEstado({ estado: 'error' }) })
    return () => { vigente = false }
  }, [consultar, intento])
  const reiniciar = () => { setEstado({ estado: 'cargando' }); setIntento(i => i + 1) }
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filas = estado.estado === 'listo' ? estado.datos.filter(r => [r.id_reserva, r.cliente_nombre, r.cliente_apellido, r.habitacion_numero, r.estado].some(v => String(v ?? '').toLocaleLowerCase('es').includes(texto))) : []
  return <section className="rooms-section reservations-section">
    <div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de reservas</h1><p>Consulta las reservas registradas para tu hotel.</p></div></div>
    <Cotizador habitaciones={habitaciones} cotizar={cotizar} />
    <div className="room-list reservations-list"><div className="room-list-header reservations-list-header"><div><h2>Listado de reservas</h2><p>La información corresponde al hotel de tu cuenta.</p></div><div className="reservations-header-actions"><span className="reservations-total-pill">{estado.estado === 'listo' ? filas.length : '—'} resultados</span><button type="button" className="reservation-new-button" disabled title="La creación aún no está habilitada">＋ Nueva reserva</button></div></div>
      {estado.estado === 'cargando' && <p role="status">Cargando reservas…</p>}
      {estado.estado === 'error' && <div role="alert"><p>No se pudieron consultar las reservas. Verifica tu sesión e inténtalo de nuevo.</p><button type="button" className="list-clear-button" onClick={reiniciar}>Reintentar</button></div>}
      {estado.estado === 'listo' && <><div className="room-filters reservations-filters list-filter-row"><label className="reservation-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar reservas" placeholder="Buscar por cliente, habitación o estado..." value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label><button type="button" className="list-clear-button" onClick={() => setBusqueda('')}>Limpiar búsqueda</button></div>
        <div className="table-container reservations-table-container"><table className="rooms-table reservations-table real-reservas-table"><thead><tr><th>Reserva</th><th>Cliente</th><th>Habitación</th><th>Entrada</th><th>Salida</th><th>Estado</th><th>Total acordado</th></tr></thead><tbody>{filas.map(r => <tr key={r.id_reserva}><td>#{r.id_reserva}</td><td>{r.cliente_nombre} {r.cliente_apellido}</td><td>{r.habitacion_numero}</td><td>{fecha(r.fecha_entrada)}</td><td>{fecha(r.fecha_salida)}</td><td>{r.estado}</td><td>{r.total_estimado}</td></tr>)}{filas.length === 0 && <tr><td colSpan="7" className="empty-message">No se encontraron reservas.</td></tr>}</tbody></table></div>
        <div className="reservations-list-footer"><span>Mostrando {filas.length} de {estado.datos.length} reservas</span><span>Consulta de solo lectura</span></div></>}
    </div>
  </section>
}
