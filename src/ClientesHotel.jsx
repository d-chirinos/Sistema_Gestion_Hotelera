import { Users, CalendarDays, Check } from 'lucide-react'
import { Indicadores, ListaGestion } from './PanelGestion.jsx'
import { useEffect, useRef, useState } from 'react'
import { Ventana } from './Ventana.jsx'
import { clientesHotel } from './supabase/clientes.js'
import PrimeraReserva from './PrimeraReserva.jsx'
export default function ClientesHotel({ cliente, operativo = false, primeraActiva = false, habitaciones, cotizar, actualizar }) {
  const [estado, setEstado] = useState({ cargando: true }), [detalle, setDetalle] = useState(null), [error, setError] = useState('')
  const [nueva, setNueva] = useState(false)
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
  const filas = (estado.datos ?? []).map(c => ({ ...c, nombre_completo: `${c.nombre} ${c.apellido}` }))
  const cantidad = estado.cargando || estado.error ? '—' : filas.length
  return <section className="rooms-modern-section hm-gestion"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">CLIENTES DEL HOTEL</span><h1>Clientes</h1><p>Clientes con reservas registradas en este hotel. El alta independiente y la conciliación entre hoteles no están disponibles.</p></div></div>
    <Indicadores items={[{ titulo: 'Clientes vinculados', valor: cantidad, icono: Users }, { titulo: 'Reservas en este hotel', valor: estado.datos ? filas.reduce((n, c) => n + Number(c.reservas ?? 0), 0) : '—', icono: CalendarDays, color: 'green' }, { titulo: 'Clientes con más de una reserva', valor: estado.datos ? filas.filter(c => Number(c.reservas) > 1).length : '—', icono: Check, color: 'purple' }]} />
    {primeraActiva && <div className="hm-gestion-actions"><button type="button" className="reservation-new-button" onClick={() => setNueva(true)}>Crear cliente con primera reserva</button></div>}
    {nueva && <Ventana titulo="Cliente nuevo y primera reserva" onCerrar={() => setNueva(false)}><PrimeraReserva cliente={cliente} habitaciones={habitaciones} cotizar={cotizar} actualizar={actualizar} operativo={operativo} /></Ventana>}
    {estado.cargando && <p role="status">Cargando clientes…</p>}{estado.error && <p role="alert">No fue posible consultar clientes.</p>}
    {estado.datos && <ListaGestion titulo="Clientes" columnas={[["id_cliente", "ID cliente"], ["nombre_completo", "Nombre y apellido"], ["reservas", "Reservas en este hotel"]]} filas={filas} id="id_cliente" onDetalle={c => ver(c.id_cliente)} etiquetaDetalle={c => `Ver detalle de ${c.nombre} ${c.apellido}`} />}
    {error && <p role="alert">{error}</p>}{detalle && <Ventana titulo={`Reservas de ${detalle[0].nombre} ${detalle[0].apellido} en este hotel`} onCerrar={() => { version.current++; setDetalle(null) }}><p>Cliente #{detalle[0].id_cliente}</p><ul>{detalle.map(r => <li key={r.id_reserva}>Reserva {r.id_reserva} · Habitación {r.habitacion_numero} · {r.fecha_entrada} a {r.fecha_salida} · {r.estado}</li>)}</ul></Ventana>}
  </section>
}
