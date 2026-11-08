import { Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Ventana } from './Ventana.jsx'
import { clientesHotel } from './supabase/clientes.js'
export default function ClientesHotel({ cliente, operativo = false }) {
  const [estado, setEstado] = useState({ cargando: true }), [busqueda, setBusqueda] = useState(''), [detalle, setDetalle] = useState(null), [error, setError] = useState('')
  const [pagina, setPagina] = useState(1)
  const version = useRef(0)
  useEffect(() => { const contador = version; let vigente = true; clientesHotel(cliente, operativo).then(datos => { if (vigente) setEstado({ datos }) }).catch(() => { if (vigente) setEstado({ error: true }) }); return () => { vigente = false; contador.current++ } }, [cliente, operativo])
  async function ver(id) {
    const turno = ++version.current; setDetalle(null); setError('')
    try {
      const { data, error: fallo } = await cliente.rpc(operativo ? 'detalle_cliente_operativo' : 'detalle_cliente_mi_hotel', { p_cliente: id })
      if (fallo || !Array.isArray(data) || !data.length) throw new Error()
      if (turno === version.current) setDetalle(data)
    } catch { if (turno === version.current) setError('No fue posible consultar el detalle.') }
  }
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filas = (estado.datos ?? []).filter(c => `${c.nombre} ${c.apellido}`.toLocaleLowerCase('es').includes(texto))
  const paginas = Math.max(1, Math.ceil(filas.length / 10)), actual = Math.min(pagina, paginas)
  return <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">CLIENTES DEL HOTEL</span><h1>Clientes</h1><p>Clientes con reservas registradas en este hotel. El alta y la primera visita permanecen pendientes.</p></div></div>
    {estado.cargando && <p role="status">Cargando clientes…</p>}{estado.error && <p role="alert">No fue posible consultar clientes.</p>}
    {estado.datos && <div className="room-list reservations-list real-list"><div className="room-list-header"><h2>Listado de clientes vinculados</h2></div><label className="reservation-search"><span>Buscar por nombre</span><input type="search" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} /></label><div className="table-container reservations-table-container"><table className="rooms-table"><thead><tr><th>Nombre</th><th>Reservas en este hotel</th><th>Acción</th></tr></thead><tbody>{filas.slice((actual - 1) * 10, actual * 10).map(c => <tr key={c.id_cliente}><td>{c.nombre} {c.apellido}</td><td>{c.reservas}</td><td><button type="button" onClick={() => ver(c.id_cliente)} aria-label={`Ver detalle de ${c.nombre} ${c.apellido}`}><Eye size={15} aria-hidden="true" /> Ver detalle</button></td></tr>)}{!filas.length && <tr><td colSpan="3">No hay clientes para mostrar.</td></tr>}</tbody></table></div><div className="reservations-list-footer"><span>Página {actual} de {paginas}</span><span><button type="button" disabled={actual === 1} onClick={() => setPagina(actual - 1)}>Anterior</button> <button type="button" disabled={actual === paginas} onClick={() => setPagina(actual + 1)}>Siguiente</button></span></div></div>}
    {error && <p role="alert">{error}</p>}{detalle && <Ventana titulo={`Reservas de ${detalle[0].nombre} ${detalle[0].apellido} en este hotel`} onCerrar={() => { version.current++; setDetalle(null) }}><p>Cliente #{detalle[0].id_cliente}</p><ul>{detalle.map(r => <li key={r.id_reserva}>Reserva {r.id_reserva} · Habitación {r.habitacion_numero} · {r.fecha_entrada} a {r.fecha_salida} · {r.estado}</li>)}</ul></Ventana>}
  </section>
}
