import { Search, Eye, Pencil, Ban, CalendarDays, Check, BedDouble, X, Filter, Plus } from 'lucide-react'
import { soles } from './utils/moneda.js'
import SaldoReserva from './SaldoReserva.jsx'
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
    {resultado && <div className="reservation-balance-preview" role="status"><span>{resultado.noches} noche(s) · Tarifa por noche: {soles(resultado.precio_noche)}</span><strong>Total: {soles(resultado.total)}</strong></div>}
  </div>
}

const CAMPOS = { estado: 'Estado', cliente: 'Cliente', habitacion_numero: 'Habitación', fecha_reserva: 'Fecha de reserva', fecha_entrada: 'Fecha de entrada', fecha_salida: 'Fecha de salida' }
const valorCampo = (r, campo) => campo === 'cliente' ? `${r.cliente_nombre ?? ''} ${r.cliente_apellido ?? ''}` : String(r[campo] ?? '')

export default function Reservas({ consultar, cotizar, habitaciones, cliente, escrituraConocidos, primeraActiva, operativo, saldosActivos }) {
  const [estado, setEstado] = useState({ estado: 'cargando' }), [busqueda, setBusqueda] = useState(''), [detalle, setDetalle] = useState(null), [pagina, setPagina] = useState(1)
  const [orden, setOrden] = useState({ campo: '', direccion: 1 }), [intento, setIntento] = useState(0), [mostrar, setMostrar] = useState(false), [filtros, setFiltros] = useState([])
  const [atributo, setAtributo] = useState('estado'), [condicion, setCondicion] = useState('igual'), [valor, setValor] = useState(''), [nueva, setNueva] = useState(false), [tipoNueva, setTipoNueva] = useState('')
  useEffect(() => { let vigente = true; consultar().then(datos => { if (vigente) setEstado({ estado: 'listo', datos }) }).catch(() => { if (vigente) setEstado({ estado: 'error' }) }); return () => { vigente = false } }, [consultar, intento])
  const reiniciar = () => { setEstado({ estado: 'cargando' }); setIntento(i => i + 1) }
  const texto = busqueda.trim().toLocaleLowerCase('es'), datos = estado.datos ?? []
  const filas = datos.filter(r => [r.id_reserva, r.cliente_nombre, r.cliente_apellido, `${r.cliente_nombre ?? ''} ${r.cliente_apellido ?? ''}`, r.habitacion_numero].some(v => String(v ?? '').toLocaleLowerCase('es').includes(texto)) && filtros.every(f => { const actual = valorCampo(r, f.campo).toLocaleLowerCase('es'), esperado = f.valor.toLocaleLowerCase('es'); return f.condicion === 'contiene' ? actual.includes(esperado) : actual === esperado }))
  if (orden.campo) filas.sort((a, b) => valorCampo(a, orden.campo).localeCompare(valorCampo(b, orden.campo), 'es', { numeric: true }) * orden.direccion)
  function ordenar(campo) { setPagina(1); setOrden(prev => ({ campo, direccion: prev.campo === campo ? -prev.direccion : 1 })) }
  function agregar() { if (!valor.trim()) return; setFiltros(f => [...f, { campo: atributo, condicion, valor: valor.trim() }]); setValor(''); setPagina(1) }
  const paginas = Math.max(1, Math.ceil(filas.length / 5)), actual = Math.min(pagina, paginas)
  const estadisticas = [['Total de reservas', datos.length, CalendarDays, 'blue', 'Registros almacenados'], ['Confirmadas', datos.filter(r => r.estado === 'CONFIRMADA').length, Check, 'green', 'Reservas confirmadas'], ['Completadas', datos.filter(r => r.estado === 'COMPLETADA').length, BedDouble, 'purple', 'Reservas completadas'], ['Canceladas', datos.filter(r => r.estado === 'CANCELADA').length, X, 'orange', 'Reservas canceladas']]
  const columnas = [['id_reserva','ID Reserva'],['cliente','Cliente'],['habitacion_numero','Habitación'],['fecha_reserva','Fecha de reserva'],['fecha_entrada','Fecha de entrada'],['fecha_salida','Fecha de salida'],['estado','Estado'],['total_estimado','Total']]
  return <section className="rooms-section reservations-section hm-reservas">
    <div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de reservas</h1><p>Consulta y administra las reservas del hotel.</p></div><div className="reservations-heading-note"><CalendarDays size={20} /><div><strong>{estado.estado === 'listo' ? datos.length : '—'} registros</strong><span>Reservas del hotel</span></div></div></div>
    <div className="hm-res-stats">{estadisticas.map(([titulo, n, Icono, color, descripcion]) => <article key={titulo} className={`hm-res-stat hm-res-stat--${color}`}><span className={`hm-dash-icon hm-dash-icon--${color}`}><Icono size={21} aria-hidden="true" /></span><div><strong>{titulo}</strong><b>{estado.estado === 'listo' ? n : '—'}</b><small>{descripcion}</small></div></article>)}</div>
    <div className="hm-res-actions"><button type="button" className="reservation-new-button" disabled={!primeraActiva && !escrituraConocidos} title={!primeraActiva && !escrituraConocidos ? 'La creación no está habilitada' : undefined} onClick={() => { setTipoNueva(''); setNueva(true) }}><Plus size={17} /> Nueva reserva</button><AccionModal titulo="Cotizar reserva"><Cotizador habitaciones={habitaciones} cotizar={cotizar} /></AccionModal>{saldosActivos ? <AccionModal titulo="Consultar saldo de reserva"><SaldoReserva cliente={cliente} /></AccionModal> : <button type="button" disabled title="Consulta de saldo no habilitada">Consultar saldo</button>}</div>
    {nueva && <Ventana titulo="Nueva reserva" onCerrar={() => setNueva(false)}><div className="hm-res-choice">{primeraActiva && <button type="button" className="list-clear-button" onClick={() => setTipoNueva('primera')}>Nuevo cliente y primera reserva</button>}{escrituraConocidos && <button type="button" className="list-clear-button" onClick={() => setTipoNueva('conocido')}>Nueva reserva de cliente vinculado</button>}</div>{tipoNueva === 'primera' && <PrimeraReserva cliente={cliente} habitaciones={habitaciones} cotizar={cotizar} actualizar={reiniciar} operativo={operativo} />}{tipoNueva === 'conocido' && <ReservaConocida cliente={cliente} habitaciones={habitaciones} cotizar={cotizar} actualizar={reiniciar} operativo={operativo} />}</Ventana>}
    {estado.estado === 'cargando' && <p role="status">Cargando reservas…</p>}{estado.estado === 'error' && <div role="alert"><p>No se pudieron consultar las reservas. Verifica tu sesión e inténtalo de nuevo.</p><button type="button" onClick={reiniciar}>Reintentar</button></div>}
    {estado.estado === 'listo' && <><div className="hm-res-filter"><div className="hm-res-search"><label className="reservation-search"><Search size={17} /><input type="search" aria-label="Buscar reservas" placeholder="Buscar por cliente, habitación o ID de reserva..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} /></label><button type="button" className="list-clear-button" onClick={() => setMostrar(!mostrar)}><Filter size={16} /> {mostrar ? 'Ocultar filtros' : 'Mostrar filtros'}</button></div>{mostrar && <div className="hm-res-filter-grid"><div><strong>Filtrar por</strong><small>Selecciona un atributo y agrega un criterio.</small></div><label>Atributo<select value={atributo} onChange={e => { setAtributo(e.target.value); setValor('') }}>{Object.entries(CAMPOS).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select></label><label>Condición<select value={condicion} onChange={e => setCondicion(e.target.value)}><option value="igual">Igual a</option><option value="contiene">Contiene</option></select></label><label>Valor{atributo === 'estado' ? <select value={valor} onChange={e => setValor(e.target.value)}><option value="">Selecciona</option><option value="CONFIRMADA">Confirmada</option><option value="COMPLETADA">Completada</option><option value="CANCELADA">Cancelada</option></select> : <input type={atributo.startsWith('fecha_') ? 'date' : 'text'} value={valor} onChange={e => setValor(e.target.value)} />}</label><button type="button" className="reservation-new-button" onClick={agregar} disabled={!valor.trim()}><Plus size={16} /> Agregar filtro</button></div>}<div className="hm-res-chips">{filtros.map((f, i) => <button type="button" key={`${f.campo}-${i}`} onClick={() => { setFiltros(fs => fs.filter((_, indice) => indice !== i)); setPagina(1) }} aria-label={`Quitar filtro ${CAMPOS[f.campo]} ${f.valor}`}>{CAMPOS[f.campo]}: {f.valor} ×</button>)}{(filtros.length > 0 || busqueda) && <button type="button" className="list-clear-button" onClick={() => { setFiltros([]); setBusqueda(''); setPagina(1) }}>Limpiar filtros</button>}</div></div>
    <div className="room-list reservations-list hm-res-table"><div className="table-container reservations-table-container"><table className="rooms-table reservations-table real-reservas-table"><thead><tr>{columnas.map(([campo, titulo]) => <th key={campo} aria-sort={orden.campo === campo ? (orden.direccion === 1 ? 'ascending' : 'descending') : 'none'}><button type="button" className="table-sort-button" onClick={() => ordenar(campo)}>{titulo} ↕</button></th>)}<th>Adelanto</th><th>Acciones</th></tr></thead><tbody>{filas.slice((actual - 1) * 5, actual * 5).map(r => <tr key={r.id_reserva}><td>#{r.id_reserva}</td><td>{valorCampo(r, 'cliente')}</td><td>{r.habitacion_numero}</td><td>{fecha(r.fecha_reserva)}</td><td>{fecha(r.fecha_entrada)}</td><td>{fecha(r.fecha_salida)}</td><td><span className={`hm-res-status hm-res-status--${String(r.estado).toLowerCase()}`}>{r.estado}</span></td><td>{soles(r.total_estimado)}</td><td>{soles(r.adelanto)}</td><td><span className="hm-res-row-actions"><button type="button" onClick={() => setDetalle(r)} aria-label={`Ver detalle de reserva ${r.id_reserva}`} title="Ver detalle"><Eye size={16} /></button><button type="button" disabled title="Edición no implementada" aria-label="Editar reserva no disponible"><Pencil size={16} /></button><button type="button" disabled title="Cancelación no implementada" aria-label="Cancelar reserva no disponible"><Ban size={16} /></button></span></td></tr>)}{filas.length === 0 && <tr><td colSpan="10" className="empty-message">No se encontraron reservas.</td></tr>}</tbody></table></div><div className="reservations-list-footer"><span>{filas.length} de {datos.length} reservas · Página {actual} de {paginas}</span><span className="hm-res-pages"><button type="button" disabled={actual === 1} onClick={() => setPagina(actual - 1)}>Anterior</button>{Array.from({ length: paginas }, (_, i) => <button type="button" key={i} aria-current={actual === i + 1 ? 'page' : undefined} onClick={() => setPagina(i + 1)}>{i + 1}</button>)}<button type="button" disabled={actual === paginas} onClick={() => setPagina(actual + 1)}>Siguiente</button></span></div></div></>}
    {detalle && <Ventana titulo={`Detalle de reserva ${detalle.id_reserva}`} onCerrar={() => setDetalle(null)}><dl className="real-hotel-grid">{[['Cliente', valorCampo(detalle, 'cliente')], ['ID cliente', detalle.cliente_id_cliente], ['Habitación', detalle.habitacion_numero], ['ID habitación', detalle.habitacion_id_habitacion], ['Fecha de reserva', fecha(detalle.fecha_reserva)], ['Entrada', fecha(detalle.fecha_entrada)], ['Salida', fecha(detalle.fecha_salida)], ['Estado', detalle.estado], ['Total acordado', soles(detalle.total_estimado)], ['Adelanto', soles(detalle.adelanto)]].map(([titulo, valor]) => <div key={titulo}><dt>{titulo}</dt><dd>{valor ?? 'No registrado'}</dd></div>)}</dl></Ventana>}
  </section>
}
