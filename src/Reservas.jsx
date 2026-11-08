import { useEffect, useRef, useState } from 'react'
import ReservaConocida from './ReservaConocida.jsx'
import PrimeraReserva from './PrimeraReserva.jsx'
import AccionModal, { Ventana } from './Ventana.jsx'

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

export default function Reservas({ consultar, cotizar, habitaciones, cliente, escrituraConocidos, primeraActiva, operativo }) {
  const [estado, setEstado] = useState({ estado: 'cargando' })
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [filtroEstado, setFiltroEstado] = useState(''), [orden, setOrden] = useState({ campo: '', direccion: 1 })
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    let vigente = true
    consultar().then(datos => { if (vigente) setEstado({ estado: 'listo', datos }) })
      .catch(() => { if (vigente) setEstado({ estado: 'error' }) })
    return () => { vigente = false }
  }, [consultar, intento])
  const reiniciar = () => { setEstado({ estado: 'cargando' }); setIntento(i => i + 1) }
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filas = estado.estado === 'listo' ? estado.datos.filter(r => (!filtroEstado || r.estado === filtroEstado) && [r.id_reserva, r.cliente_nombre, r.cliente_apellido, r.habitacion_numero, r.estado].some(v => String(v ?? '').toLocaleLowerCase('es').includes(texto))) : []
  if (orden.campo) filas.sort((a, b) => String(a[orden.campo] ?? '').localeCompare(String(b[orden.campo] ?? ''), 'es', { numeric: true }) * orden.direccion)
  function ordenar(campo) { setPagina(1); setOrden(prev => ({ campo, direccion: prev.campo === campo ? -prev.direccion : 1 })) }
  const paginas = Math.max(1, Math.ceil(filas.length / 10))
  const paginaActual = Math.min(pagina, paginas)
  return <section className="rooms-section reservations-section">
    <div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de reservas</h1><p>Consulta las reservas registradas para tu hotel.</p></div></div>
    <AccionModal titulo="Cotizar reserva"><Cotizador habitaciones={habitaciones} cotizar={cotizar} /></AccionModal>
    {primeraActiva && <AccionModal titulo="Nuevo cliente y primera reserva"><PrimeraReserva cliente={cliente} habitaciones={habitaciones} cotizar={cotizar} actualizar={reiniciar} operativo={operativo} /></AccionModal>}
    {escrituraConocidos && <AccionModal titulo="Nueva reserva de cliente vinculado"><ReservaConocida cliente={cliente} habitaciones={habitaciones} cotizar={cotizar} actualizar={reiniciar} operativo={operativo} /></AccionModal>}
    <div className="room-list reservations-list"><div className="room-list-header reservations-list-header"><div><h2>Listado de reservas</h2><p>La información corresponde al hotel de tu cuenta.</p></div><div className="reservations-header-actions"><span className="reservations-total-pill">{estado.estado === 'listo' ? filas.length : '—'} resultados</span>{!escrituraConocidos && !primeraActiva && <button type="button" className="reservation-new-button" disabled title="La creación aún no está habilitada">＋ Nueva reserva</button>}</div></div>
      {estado.estado === 'cargando' && <p role="status">Cargando reservas…</p>}
      {estado.estado === 'error' && <div role="alert"><p>No se pudieron consultar las reservas. Verifica tu sesión e inténtalo de nuevo.</p><button type="button" className="list-clear-button" onClick={reiniciar}>Reintentar</button></div>}
      {estado.estado === 'listo' && <><div className="room-filters reservations-filters list-filter-row"><label className="reservation-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar reservas" placeholder="Buscar por cliente, habitación o estado..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} /></label><label>Estado <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }}><option value="">Todos</option><option value="CONFIRMADA">Confirmada</option><option value="COMPLETADA">Completada</option><option value="CANCELADA">Cancelada</option></select></label><button type="button" className="list-clear-button" onClick={() => { setBusqueda(''); setFiltroEstado(''); setPagina(1) }}>Limpiar filtros</button></div>
        <div className="table-container reservations-table-container"><table className="rooms-table reservations-table real-reservas-table"><thead><tr>{[['id_reserva','Reserva'],['cliente_nombre','Cliente'],['habitacion_numero','Habitación'],['fecha_entrada','Entrada'],['fecha_salida','Salida'],['estado','Estado'],['total_estimado','Total acordado']].map(([campo, titulo]) => <th key={campo} aria-sort={orden.campo === campo ? (orden.direccion === 1 ? 'ascending' : 'descending') : 'none'}><button type="button" className="table-sort-button" onClick={() => ordenar(campo)}>{titulo} ↕</button></th>)}<th>Acciones</th></tr></thead><tbody>{filas.slice((paginaActual - 1) * 10, paginaActual * 10).map(r => <tr key={r.id_reserva}><td>#{r.id_reserva}</td><td>{r.cliente_nombre} {r.cliente_apellido}</td><td>{r.habitacion_numero}</td><td>{fecha(r.fecha_entrada)}</td><td>{fecha(r.fecha_salida)}</td><td>{r.estado}</td><td>{r.total_estimado}</td><td><button type="button" onClick={() => setDetalle(r)} aria-label={`Ver detalle de reserva ${r.id_reserva}`}>Ver detalle</button></td></tr>)}{filas.length === 0 && <tr><td colSpan="8" className="empty-message">No se encontraron reservas.</td></tr>}</tbody></table></div>
        <div className="reservations-list-footer"><span>{filas.length} de {estado.datos.length} reservas · Página {paginaActual} de {paginas}</span><span><button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button> <button type="button" disabled={paginaActual === paginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button></span></div></>}
    </div>
    {detalle && <Ventana titulo={`Detalle de reserva ${detalle.id_reserva}`} onCerrar={() => setDetalle(null)}><dl className="real-hotel-grid">{[['Cliente', `${detalle.cliente_nombre} ${detalle.cliente_apellido}`], ['ID cliente', detalle.cliente_id_cliente], ['Habitación', detalle.habitacion_numero], ['ID habitación', detalle.habitacion_id_habitacion], ['Entrada', fecha(detalle.fecha_entrada)], ['Salida', fecha(detalle.fecha_salida)], ['Estado', detalle.estado], ['Total acordado', detalle.total_estimado]].map(([titulo, valor]) => <div key={titulo}><dt>{titulo}</dt><dd>{valor ?? 'No registrado'}</dd></div>)}</dl></Ventana>}
  </section>
}
