import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase/cliente.js'
import { crearServicio } from './supabase/servicio.js'
import { crearControlSesion } from './supabase/sesion.js'
import { SECCIONES, resumenHabitaciones } from './supabase/vista.js'
import { crearConsultaReservas, crearCotizadorReservas } from './supabase/reservas.js'
import Reservas from './Reservas.jsx'
import OperacionesLectura from './OperacionesLectura.jsx'
import { crearConsultaOperaciones, MODULOS_OPERATIVOS } from './supabase/operaciones.js'
import './App.css'
import './SupabaseApp.css'

function Marca() {
  return <div className="welcome-brand" aria-label="HotelManager"><span className="welcome-brand-mark" aria-hidden="true"><svg viewBox="0 0 56 56"><path d="M9 48V18L28 7l19 11v30M18 48V31h20v17M17 21h.01M28 21h.01M39 21h.01" /><path d="M5 48h46M28 31v17" /></svg></span><span className="welcome-brand-name">Hotel<span>Manager</span></span></div>
}

function Acceso({ aviso, onEntrar }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  function enviar(evento) {
    evento.preventDefault()
    const clave = password
    setPassword('')
    void onEntrar(email.trim(), clave)
  }
  return <main className="welcome-screen welcome-screen--ready real-login" aria-label="Acceso a HotelManager"><Marca />
    <section className="welcome-access welcome-access--admin" aria-labelledby="welcome-title"><div className="welcome-form-card">
      <div className="welcome-form-heading"><span className="welcome-option-icon welcome-option-icon--admin" aria-hidden="true">♙</span><div><p className="welcome-form-eyebrow">GESTIÓN HOTELERA</p><h1 id="welcome-title">Bienvenido a HotelManager</h1></div></div>
      <form className="welcome-login-form" onSubmit={enviar}><p className="welcome-form-description">Ingresa con tu cuenta autorizada para consultar tu hotel.</p>
        <label className="welcome-input-field"><span>Correo electrónico</span><input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="welcome-input-field"><span>Contraseña</span><input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {aviso && <p className="welcome-form-error" role="alert">{aviso}</p>}
        <button type="submit" className="welcome-submit-button">Iniciar sesión</button>
      </form><p className="welcome-form-footnote">El acceso requiere una cuenta autorizada por la administración.</p>
    </div></section>
  </main>
}

function Tarjetas({ habitaciones }) {
  return <div className="room-summary rooms-modern-summary">{resumenHabitaciones(habitaciones).map(item => <article className={`room-summary-card reservation-stat ${item.clase}`} key={item.titulo}><div className="reservation-stat-top"><span>{item.titulo}</span><span className="reservation-stat-icon" aria-hidden="true">{item.icono}</span></div><h2>{item.valor}</h2><small>{item.detalle}</small></article>)}</div>
}

const TABLAS = {
  habitacion: { titulo: 'Listado de habitaciones', descripcion: 'Consulta el número, tipo, piso y estado de cada habitación.', id: 'id_habitacion', columnas: [['numero', 'Número'], ['tipo', 'Tipo de habitación'], ['piso', 'Piso'], ['estado', 'Estado']] },
  tipo_habitacion: { titulo: 'Tipos de habitación', descripcion: 'Características y capacidad de los tipos disponibles en tu hotel.', id: 'id_tipo', columnas: [['nombre', 'Nombre del tipo'], ['descripcion', 'Descripción'], ['capacidad', 'Capacidad']] },
  tarifa_habitacion: { titulo: 'Tarifas por tipo', descripcion: 'Precio vigente por noche para cada tipo de habitación de tu hotel.', id: 'id_tarifa', columnas: [['tipo', 'Tipo de habitación'], ['precio_noche', 'Precio por noche']] },
  servicio: { titulo: 'Servicios del hotel', descripcion: 'Consulta los servicios y precios registrados para tu hotel.', id: 'id_servicio', columnas: [['nombre', 'Servicio'], ['precio', 'Precio']] },
}

function TablaLectura({ recurso, datos }) {
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState({ campo: '', direccion: 'asc' })
  const tabla = TABLAS[recurso]
  const tipos = new Map(datos.tipo_habitacion.map(tipo => [String(tipo.id_tipo), tipo.nombre]))
  const filas = datos[recurso].map(fila => ({ ...fila, tipo: tipos.get(String(fila.tipo_habitacion_id_tipo)) ?? 'No disponible' }))
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filtradas = filas.filter(fila => tabla.columnas.some(([campo]) => String(fila[campo] ?? '').toLocaleLowerCase('es').includes(texto)))
  if (orden.campo) filtradas.sort((a, b) => String(a[orden.campo] ?? '').localeCompare(String(b[orden.campo] ?? ''), 'es', { numeric: true }) * (orden.direccion === 'asc' ? 1 : -1))
  function ordenar(campo) { setOrden(prev => ({ campo, direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc' })) }
  return <div className="room-list reservations-list rooms-modern-list real-list"><div className="room-list-header reservations-list-header"><div><h2>{tabla.titulo}</h2><p>{tabla.descripcion}</p></div><span className="reservations-total-pill">{filtradas.length} resultados</span></div>
    <div className="room-filters reservations-filters list-filter-row dynamic-filter-search-row"><label className="reservation-search"><span aria-hidden="true">⌕</span><input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder={`Buscar en ${tabla.titulo.toLowerCase()}...`} aria-label={`Buscar en ${tabla.titulo.toLowerCase()}`} /></label><button type="button" className="list-clear-button" onClick={() => setBusqueda('')}>Limpiar búsqueda</button></div>
    <div className="table-container reservations-table-container rooms-modern-table-container"><table className="rooms-table rooms-modern-table"><thead><tr>{tabla.columnas.map(([campo, etiqueta]) => <th key={campo} aria-sort={orden.campo === campo ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'}><button type="button" className="table-sort-button" onClick={() => ordenar(campo)}>{etiqueta}<span aria-hidden="true">{orden.campo === campo ? (orden.direccion === 'asc' ? '▲' : '▼') : '↕'}</span></button></th>)}</tr></thead><tbody>{filtradas.map(fila => <tr key={fila[tabla.id]}>{tabla.columnas.map(([campo]) => <td key={campo}>{campo === 'estado' ? <span className={`room-status-modern ${String(fila.estado ?? '').toLowerCase()}`}><span className="room-status-dot" />{fila.estado}</span> : campo === 'tipo' ? <span className="room-type-label">{fila[campo]}</span> : campo === 'numero' ? <span className="room-number-code">{fila[campo]}</span> : fila[campo] ?? '—'}</td>)}</tr>)}{!filtradas.length && <tr><td colSpan={tabla.columnas.length} className="empty-message">No se encontraron registros.</td></tr>}</tbody></table></div>
    <div className="reservations-list-footer"><span>Mostrando {filtradas.length} de {filas.length} registros</span><span>Consulta de solo lectura</span></div>
  </div>
}

function InfoHotel({ hotel }) {
  const campos = [['Dirección', hotel.direccion], ['Ciudad', hotel.ciudad], ['País', hotel.pais], ['Teléfono', hotel.telefono], ['Correo', hotel.email], ['Categoría', hotel.categoria], ['Zona horaria', hotel.zona_horaria]]
  return <article className="dashboard-panel real-hotel-panel"><div className="panel-heading"><div><h2>{hotel.nombre}</h2><p>Datos generales del hotel asignado a tu cuenta.</p></div><span className="panel-icon" aria-hidden="true">⌂</span></div><dl className="real-hotel-grid">{campos.map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor || 'No disponible'}</dd></div>)}</dl></article>
}

function DatosHotel({ estado, onSalir }) {
  const [seccion, setSeccion] = useState('dashboard')
  const [subseccion, setSubseccion] = useState('habitacion')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { datos, cuenta } = estado
  const operacionesActivas = import.meta.env.VITE_OPERACIONES_LECTURA === 'true'
  const consultarOperaciones = useMemo(() => crearConsultaOperaciones(supabase), [])
  const reservasActivas = import.meta.env.VITE_RESERVAS_LECTURA === 'true'
  const consultarReservas = useMemo(() => crearConsultaReservas(supabase), [])
  const cotizarReserva = useMemo(() => crearCotizadorReservas(supabase), [])
  const secciones = SECCIONES.map(item => item.id === 'reservas' ? { ...item, disponible: reservasActivas } : MODULOS_OPERATIVOS.includes(item.id) ? { ...item, disponible: operacionesActivas } : item)
  const hotel = datos.hotel[0]
  const seleccion = secciones.find(item => item.id === seccion)
  function navegar(id) { setSeccion(id); setMenuAbierto(false); if (id === 'habitacion') setSubseccion('habitacion') }
  return <div className="app real-app"><aside className={`sidebar real-sidebar${menuAbierto ? ' is-open' : ''}`} id="menu-principal"><h2 className="logo">Hotel<span>Manager</span></h2><p className="menu-title">MENÚ PRINCIPAL</p><nav aria-label="Menú principal">{secciones.map(item => <button key={item.id} type="button" className={seccion === item.id ? 'active' : ''} aria-current={seccion === item.id ? 'page' : undefined} onClick={() => navegar(item.id)}>{item.titulo}{!item.disponible && <span className="real-pending-label">Pendiente</span>}</button>)}</nav><div className="sidebar-footer">Sistema de gestión hotelera<br /><span>Solo lectura</span></div></aside>
    <main className="main-content"><header className="topbar real-topbar"><div className="real-topbar-title"><button type="button" className="real-menu-toggle" aria-controls="menu-principal" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)}>☰ <span>Menú</span></button><div><h2>{seleccion.titulo}</h2><p>Panel de gestión hotelera</p></div></div><div className="real-topbar-actions"><div className="user"><div className="avatar">A</div><span>Administrador <small>Hotel {cuenta.hotel_id}</small></span></div><button type="button" className="real-logout" onClick={onSalir}>Cerrar sesión</button></div></header>
      <div className="real-source">Conectado a Supabase · {hotel.nombre} · Solo lectura</div>
      {seccion === 'dashboard' && <section className="dashboard real-dashboard"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">PANEL ADMINISTRATIVO</span><h1>Bienvenido a {hotel.nombre}</h1><p>Consulta la información de tu hotel desde un solo lugar.</p></div><div className="reservations-heading-note"><span className="reservations-note-icon">⌂</span><div><strong>Hotel {cuenta.hotel_id}</strong><span>Información disponible</span></div></div></div><div className="dashboard-section-title"><div><h2>Resumen de habitaciones</h2><p>Estado actual de las habitaciones registradas.</p></div></div><Tarjetas habitaciones={datos.habitacion} /><InfoHotel hotel={hotel} /></section>}
      {seccion === 'hotel' && <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Mi hotel</h1><p>Información general de tu establecimiento.</p></div></div><InfoHotel hotel={hotel} /></section>}
      {seccion === 'habitacion' && <section className="rooms-section rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de habitaciones</h1><p>Consulta las habitaciones y tarifas de {hotel.nombre}.</p></div><div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{datos.habitacion.length} registros</strong><span>Habitaciones del hotel</span></div></div></div><div className="rooms-subnav" role="tablist" aria-label="Secciones de habitaciones">{[['habitacion', 'Habitaciones'], ['tipo_habitacion', 'Tipos de habitación'], ['tarifa_habitacion', 'Tarifas']].map(([id, label]) => <button type="button" role="tab" aria-selected={subseccion === id} className={subseccion === id ? 'active' : ''} onClick={() => setSubseccion(id)} key={id}>{label}</button>)}</div>{subseccion === 'habitacion' && <Tarjetas habitaciones={datos.habitacion} />}<TablaLectura key={subseccion} recurso={subseccion} datos={datos} /></section>}
      {seccion === 'servicio' && <section className="rooms-section rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Servicios</h1><p>Consulta los servicios disponibles en {hotel.nombre}.</p></div></div><TablaLectura recurso="servicio" datos={datos} /></section>}
      {seccion === 'reservas' && reservasActivas && <Reservas consultar={consultarReservas} cotizar={cotizarReserva} habitaciones={datos.habitacion} />}
      {operacionesActivas && MODULOS_OPERATIVOS.includes(seccion) && <OperacionesLectura key={seccion} modulo={seccion} consultar={consultarOperaciones} />}
      {!seleccion.disponible && <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">MÓDULO PENDIENTE</span><h1>{seleccion.titulo}</h1><p>Este módulo estará disponible cuando se implementen sus consultas y permisos.</p></div></div><div className="dashboard-panel real-pending"><span aria-hidden="true">◷</span><h2>Próximamente</h2><p>Esta sección aún no tiene datos ni operaciones habilitadas.</p></div></section>}
    </main>
  </div>
}

export default function SupabaseApp() {
  const servicio = useMemo(() => supabase ? crearServicio(supabase) : null, [])
  const [estado, setEstado] = useState({ estado: 'cargando' })
  const control = useMemo(() => servicio ? crearControlSesion(servicio, setEstado) : null, [servicio])
  useEffect(() => {
    if (!control) return undefined
    control.iniciar()
    return () => control.detener()
  }, [control])
  if (!control) return <main className="hm-login-page"><section className="hm-login-card"><h1>Configuración pendiente</h1><p>Configura la URL y la clave publicable de Supabase en las variables de entorno antes de iniciar la aplicación.</p></section></main>
  if (estado.estado === 'login') return <Acceso aviso={estado.aviso} onEntrar={control.entrar} />
  if (estado.estado === 'listo') return <DatosHotel estado={estado} onSalir={() => void control.salir()} />
  if (['sin-vinculo', 'sin-permiso', 'error', 'error-cierre'].includes(estado.estado)) return <main className="hm-login-page"><section className="hm-login-card"><h1>{estado.estado === 'error' || estado.estado === 'error-cierre' ? 'No se pudo completar la solicitud' : 'Acceso no disponible'}</h1><p role="alert">{estado.aviso || (estado.estado === 'sin-vinculo' ? 'Tu cuenta no tiene una vinculación activa. Contacta a la administración.' : 'Tu rol aún no tiene consultas habilitadas.')}</p><div className="hm-actions">{estado.estado === 'error' && <button type="button" onClick={control.reintentar}>Reintentar</button>}<button type="button" className="hm-outline" onClick={() => void control.salir()}>Cerrar sesión</button></div></section></main>
  return <main className="hm-login-page"><p role="status">{estado.estado === 'cerrando' ? 'Cerrando sesión…' : estado.estado === 'ingresando' ? 'Iniciando sesión…' : 'Verificando acceso…'}</p></main>
}
