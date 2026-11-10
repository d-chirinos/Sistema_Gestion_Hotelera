import { soles } from './utils/moneda.js'
import { useEffect, useState } from 'react'
import { BedDouble, CalendarDays, Check, CreditCard, Layers3, Wrench, CircleAlert, Building2, MapPin, Globe2, ArrowRight, Inbox } from 'lucide-react'

import { fechaHotel, proximasReservas, pagosRecientes } from './dashboardDatos'

const icono = (Icono, color = 'blue') => <span className={`hm-dash-icon hm-dash-icon--${color}`}><Icono size={20} strokeWidth={2} aria-hidden="true" /></span>
function Estado({ estado, vacio }) {
  if (estado === 'cargando') return <p className="hm-dash-empty" role="status">Cargando…</p>
  if (estado === 'error') return <p className="hm-dash-empty" role="alert">No se pudo cargar la información.</p>
  return <p className="hm-dash-empty"><Inbox size={17} aria-hidden="true" /> {vacio}</p>
}
function Dona({ habitaciones }) {
  const total = habitaciones.length
  const valores = [habitaciones.filter(h => h.estado === 'DISPONIBLE').length, habitaciones.filter(h => h.estado === 'OCUPADA').length, habitaciones.filter(h => h.estado === 'MANTENIMIENTO').length]
  const ocupacion = total ? Math.round(valores[1] * 100 / total) : 0
  const circ = 2 * Math.PI * 66
  let acumulado = 0
  return <div className="hm-dash-donut-layout"><div className="hm-dash-donut"><svg viewBox="0 0 160 160" role="img" aria-label={`${ocupacion}% de ocupación`}><circle cx="80" cy="80" r="66" fill="none" stroke="#e7edf3" strokeWidth="14" />{valores.map((v, i) => { const largo = total ? v * circ / total : 0; const inicio = acumulado; acumulado += largo; return <circle key={i} cx="80" cy="80" r="66" fill="none" stroke={['#4b9b88', '#4a6fa5', '#d9a15a'][i]} strokeWidth="14" strokeDasharray={`${largo} ${circ - largo}`} strokeDashoffset={-inicio} transform="rotate(-90 80 80)" /> })}</svg><div><strong>{ocupacion}%</strong><span>Ocupación</span></div></div><ul className="hm-dash-legend">{['Disponibles', 'Ocupadas', 'En mantenimiento'].map((nombre, i) => <li key={nombre}><span><i style={{ background: ['#4b9b88', '#4a6fa5', '#d9a15a'][i] }} />{nombre}</span><strong>{valores[i]}</strong><span>{total ? Math.round(valores[i] * 100 / total) : 0}%</span></li>)}</ul></div>
}
export default function Dashboard({ datos, cliente, consultarReservas, consultarOperaciones, reservasActivas, operacionesActivas, indicadoresActivos, navegar }) {
  const [reloj, setReloj] = useState(() => new Date())
  const [resumen, setResumen] = useState({ estado: indicadoresActivos ? 'cargando' : 'deshabilitado' })
  const [reservas, setReservas] = useState({ estado: reservasActivas ? 'cargando' : 'deshabilitado', datos: [] })
  const [pagos, setPagos] = useState({ estado: operacionesActivas ? 'cargando' : 'deshabilitado', datos: [] })
  const [mantenimientos, setMantenimientos] = useState({ estado: operacionesActivas ? 'cargando' : 'deshabilitado', datos: [] })
  useEffect(() => { const timer = window.setInterval(() => setReloj(new Date()), 60000); return () => window.clearInterval(timer) }, [])
  useEffect(() => {
    let vigente = true
    if (indicadoresActivos) cliente.rpc('resumen_operativo_mi_hotel').then(({ data, error }) => { if (vigente) setResumen(error || !Array.isArray(data) || data.length !== 1 ? { estado: 'error' } : { estado: 'listo', datos: data[0] }) }).catch(() => { if (vigente) setResumen({ estado: 'error' }) })
    const cargar = (fn, setter) => fn().then(datos => { if (vigente) setter({ estado: 'listo', datos }) }).catch(() => { if (vigente) setter({ estado: 'error', datos: [] }) })
    if (reservasActivas) cargar(consultarReservas, setReservas)
    if (operacionesActivas) { cargar(() => consultarOperaciones('pagos'), setPagos); cargar(() => consultarOperaciones('mantenimiento'), setMantenimientos) }
    return () => { vigente = false }
  }, [cliente, consultarReservas, consultarOperaciones, indicadoresActivos, reservasActivas, operacionesActivas])
  const hotel = datos.hotel[0], habitaciones = datos.habitacion, fecha = fechaHotel(reloj, hotel.zona_horaria)
  const r = resumen.datos, prox = proximasReservas(reservas.datos, fecha?.iso), recientes = pagosRecientes(pagos.datos)
  const habitacionesMant = habitaciones.filter(h => h.estado === 'MANTENIMIENTO')
  const sinFin = mantenimientos.datos.filter(m => m.fecha_fin == null).length
  const valor = campo => resumen.estado === 'listo' ? (r[campo] ?? '—') : resumen.estado === 'cargando' ? '…' : '—'
  const tarjetas = [
    ['Habitaciones disponibles', habitaciones.filter(h => h.estado === 'DISPONIBLE').length, Check, 'green', 'Listas para recibir huéspedes'],
    ['Habitaciones ocupadas', habitaciones.filter(h => h.estado === 'OCUPADA').length, BedDouble, 'purple', 'Estado actual'],
    ['Reservas confirmadas', valor('reservas_confirmadas'), CalendarDays, 'blue', 'Reservas registradas'],
    ['Pagos registrados', valor('pagos_cantidad'), CreditCard, 'purple', 'Operaciones registradas'],
    ['Total de pagos', soles(resumen.estado === 'listo' ? r.pagos_importe : null), Layers3, 'green', 'Importe acumulado'],
  ]
  return <section className="dashboard real-dashboard hm-dashboard premium-dashboard"><div className="premium-dash-hero"><div><span className="premium-kicker"><span /> CENTRO DE OPERACIONES</span><h1>¡Bienvenido a {hotel.nombre}!</h1><p>Una vista clara de tu hotel y de lo que necesita tu atención.</p></div><div className="premium-hero-meta"><span>RESUMEN DEL HOTEL</span><strong>{fecha?.texto ?? 'Zona horaria no disponible'}</strong><small>{hotel.ciudad || 'Ubicación no disponible'} · {hotel.zona_horaria || 'Zona horaria no disponible'}</small></div></div>
    <div className="premium-section-heading"><div><span>Resumen de habitaciones</span><h2>Tu operación, de un vistazo</h2></div><p>Datos disponibles de tu hotel</p></div><div className="premium-kpi-strip">{tarjetas.map(([titulo, numero, Icono, color, detalle]) => <article className="premium-kpi" key={titulo}><span className="premium-kpi-label">{titulo}{icono(Icono, color)}</span><strong>{numero}</strong><small>{detalle}</small></article>)}</div>
    <div className="premium-operation-heading"><div><span>ACTIVIDAD DEL HOTEL</span><h2>El pulso de tu operación</h2></div><div className="premium-operation-totals"><span><strong>{habitaciones.length}</strong> habitaciones</span><span><strong>{habitacionesMant.length}</strong> en mantenimiento</span><span><strong>{valor('consumos_cantidad')}</strong> consumos registrados</span></div></div>
    {resumen.estado === 'error' && <p role="alert" className="hm-dash-warning">No se pudieron cargar los indicadores operativos.</p>}
    <div className="hm-dash-grid hm-dash-grid--top"><article className="hm-dash-panel"><header><div><h2>Estado de habitaciones</h2><p>Distribución según su estado actual</p></div>{icono(BedDouble, 'teal')}</header><Dona habitaciones={habitaciones} /><footer>De {habitaciones.length} habitaciones registradas en total.</footer></article>
      <article className="hm-dash-panel"><header><div><h2>Próximas reservas</h2><p>Huéspedes que llegarán próximamente</p></div>{icono(CalendarDays, 'blue')}</header>{reservas.estado !== 'listo' ? <Estado estado={reservas.estado} vacio="Consulta de reservas no habilitada." /> : !fecha ? <p className="hm-dash-empty">Configura una zona horaria válida para ordenar las próximas reservas.</p> : !prox.length ? <Estado vacio="No hay próximas reservas confirmadas." /> : <ul className="hm-dash-list">{prox.map(r => <li key={r.id_reserva}><span className="hm-dash-day"><strong>{r.fecha_entrada.slice(8, 10)}</strong><small>{r.fecha_entrada.slice(5, 7)}/{r.fecha_entrada.slice(0, 4)}</small></span><span className="hm-dash-list-copy"><strong>{r.cliente_nombre} {r.cliente_apellido}</strong><small>Habitación {r.habitacion_numero} · Reserva {r.id_reserva}</small></span><span className="hm-dash-badge">Confirmada</span></li>)}</ul>}<footer>{reservasActivas && <button type="button" onClick={() => navegar('reservas')}>Ver todas las reservas <ArrowRight size={15} aria-hidden="true" /></button>}</footer></article>
      <article className="hm-dash-panel"><header><div><h2>Últimos pagos registrados</h2><p>Actividad financiera registrada</p></div>{icono(CreditCard, 'green')}</header>{pagos.estado !== 'listo' ? <Estado estado={pagos.estado} vacio="Consulta de pagos no habilitada." /> : !recientes.length ? <Estado vacio="No hay pagos registrados." /> : <ul className="hm-dash-list">{recientes.map(p => <li key={p.id_pago}>{icono(CreditCard, 'green')}<span className="hm-dash-list-copy"><strong>Pago #{p.id_pago}</strong><small>{p.fecha_pago ?? 'Fecha no registrada'} · {p.metodo_pago ?? 'Método no registrado'}</small></span><strong>{soles(p.monto)}</strong></li>)}</ul>}<footer className="hm-dash-total"><span>Total registrado</span><strong>{soles(resumen.estado === 'listo' ? r.pagos_importe : null)}</strong></footer></article></div>
    <div className="hm-dash-grid hm-dash-grid--bottom"><article className="hm-dash-panel"><header><div><h2>Atención requerida</h2><p>Situaciones para consultar</p></div>{icono(CircleAlert, 'orange')}</header>{habitacionesMant.length === 0 && mantenimientos.estado === 'listo' && sinFin === 0 ? <Estado vacio="No hay situaciones registradas para revisar." /> : <div className="hm-dash-alerts">{habitacionesMant.map(h => <div key={h.id_habitacion}>{icono(Wrench, 'orange')}<span><strong>Habitación {h.numero}</strong><small>Estado: mantenimiento{h.piso != null ? ` · Piso ${h.piso}` : ''}</small></span></div>)}{mantenimientos.estado === 'listo' && sinFin > 0 && <div>{icono(CircleAlert, 'orange')}<span><strong>{sinFin} mantenimiento(s) sin fecha de fin</strong><small>Revisar el registro; puede ser histórico.</small></span></div>}{mantenimientos.estado !== 'listo' && <Estado estado={mantenimientos.estado} vacio="Consulta de mantenimiento no habilitada." />}</div>}</article>
      <article className="hm-dash-panel"><header><div><h2>Hotel asignado</h2><p>Datos generales del hotel en tu cuenta</p></div>{icono(Building2, 'teal')}</header><div className="hm-dash-hotel"><strong>{hotel.nombre}</strong><span><MapPin size={15} aria-hidden="true" /> {[hotel.direccion, hotel.ciudad].filter(Boolean).join(', ') || 'Dirección no disponible'}</span><span><Building2 size={15} aria-hidden="true" /> Categoría: {hotel.categoria || 'No disponible'}</span><span><Globe2 size={15} aria-hidden="true" /> Zona horaria: {hotel.zona_horaria || 'No disponible'}</span></div></article>
      <article className="hm-dash-panel"><header><div><h2>Catálogo del hotel</h2><p>Información vigente consultada en Supabase</p></div>{icono(Layers3, 'purple')}</header><div className="hm-dash-catalog"><div>{icono(Layers3, 'green')}<span><strong>{datos.tarifa_habitacion.length}</strong><small>Tarifas registradas</small></span></div><div>{icono(Layers3, 'green')}<span><strong>{datos.servicio.length}</strong><small>Servicios registrados</small></span></div></div></article></div>
    {r && <details className="hm-dash-extra"><summary>Más indicadores operativos</summary><p>Totales históricos expresados en soles peruanos.</p><dl>{[['Reservas completadas', r.reservas_completadas], ['Reservas canceladas', r.reservas_canceladas], ['Estadías sin salida registrada', r.estadias_sin_salida], ['Importe de consumos del hotel', soles(r.consumos_importe)], ['Mantenimientos sin fecha de fin', r.mantenimientos_sin_fin]].map(([nombre, cantidad]) => <div key={nombre}><dt>{nombre}</dt><dd>{cantidad ?? 'No disponible'}</dd></div>)}</dl></details>}
    {r && Number(r.consumos_inconsistentes) > 0 && <p role="alert" className="hm-dash-warning">Hay consumos con hotel de servicio inconsistente que requieren revisión.</p>}
  </section>
}
