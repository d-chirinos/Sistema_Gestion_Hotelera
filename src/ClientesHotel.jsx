import { useEffect, useRef, useState } from 'react'
import { clientesHotel } from './supabase/clientes.js'
export default function ClientesHotel({ cliente }) {
  const [estado, setEstado] = useState({ cargando: true }), [busqueda, setBusqueda] = useState(''), [detalle, setDetalle] = useState(null), [error, setError] = useState('')
  const version = useRef(0)
  useEffect(() => { const contador = version; let vigente = true; clientesHotel(cliente).then(datos => { if (vigente) setEstado({ datos }) }).catch(() => { if (vigente) setEstado({ error: true }) }); return () => { vigente = false; contador.current++ } }, [cliente])
  async function ver(id) {
    const turno = ++version.current; setDetalle(null); setError('')
    try {
      const { data, error: fallo } = await cliente.rpc('detalle_cliente_mi_hotel', { p_cliente: id })
      if (fallo || !Array.isArray(data) || !data.length) throw new Error()
      if (turno === version.current) setDetalle(data)
    } catch { if (turno === version.current) setError('No fue posible consultar el detalle.') }
  }
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filas = (estado.datos ?? []).filter(c => `${c.nombre} ${c.apellido}`.toLocaleLowerCase('es').includes(texto))
  return <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">CLIENTES DEL HOTEL</span><h1>Clientes</h1><p>Clientes con reservas registradas en este hotel. El alta y la primera visita permanecen pendientes.</p></div></div>
    {estado.cargando && <p role="status">Cargando clientes…</p>}{estado.error && <p role="alert">No fue posible consultar clientes.</p>}
    {estado.datos && <div className="room-list reservations-list real-list"><div className="room-list-header"><h2>Listado de clientes vinculados</h2></div><label className="reservation-search"><span>Buscar por nombre</span><input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label><div className="table-container reservations-table-container"><table className="rooms-table"><thead><tr><th>Nombre</th><th>Reservas en este hotel</th><th>Acción</th></tr></thead><tbody>{filas.map(c => <tr key={c.id_cliente}><td>{c.nombre} {c.apellido}</td><td>{c.reservas}</td><td><button type="button" onClick={() => ver(c.id_cliente)} aria-label={`Ver detalle de ${c.nombre} ${c.apellido}`}>Ver detalle</button></td></tr>)}{!filas.length && <tr><td colSpan="3">No hay clientes para mostrar.</td></tr>}</tbody></table></div></div>}
    {error && <p role="alert">{error}</p>}{detalle && <article className="dashboard-panel"><h2>Reservas de {detalle[0].nombre} {detalle[0].apellido} en este hotel</h2><ul>{detalle.map(r => <li key={r.id_reserva}>Reserva {r.id_reserva} · Habitación {r.habitacion_numero} · {r.fecha_entrada} a {r.fecha_salida} · {r.estado}</li>)}</ul><button type="button" onClick={() => { version.current++; setDetalle(null) }}>Cerrar detalle</button></article>}
  </section>
}
