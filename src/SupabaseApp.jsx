import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase/cliente.js'
import { crearServicio } from './supabase/servicio.js'
import { crearControlSesion } from './supabase/sesion.js'
import { SECCIONES, resumenHabitaciones } from './supabase/vista.js'
import { crearConsultaReservas, crearCotizadorReservas } from './supabase/reservas.js'
import Reservas from './Reservas.jsx'
import Bienvenida from './Bienvenida.jsx'
import AccionModal, { Ventana } from './Ventana.jsx'
import ClientesHotel from './ClientesHotel.jsx'
import OperacionesLectura from './OperacionesLectura.jsx'
import PrecioFormulario from './PrecioFormulario.jsx'
import AltaCatalogo from './AltaCatalogo.jsx'
import Dashboard from './Dashboard.jsx'
import { ICONOS_MODULO } from './iconos.js'
import { Search, Eye, Database, CircleCheck } from 'lucide-react'
import SaldoReserva from './SaldoReserva.jsx'
import EditarHabitacion from './EditarHabitacion.jsx'
import { crearPagos } from './supabase/pagos.js'
import { crearConsultaOperaciones, MODULOS_OPERATIVOS } from './supabase/operaciones.js'
import './App.css'
import './SupabaseApp.css'

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
  const [detalle, setDetalle] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [orden, setOrden] = useState({ campo: '', direccion: 'asc' })
  const tabla = TABLAS[recurso]
  const tipos = new Map(datos.tipo_habitacion.map(tipo => [String(tipo.id_tipo), tipo.nombre]))
  const filas = datos[recurso].map(fila => ({ ...fila, tipo: tipos.get(String(fila.tipo_habitacion_id_tipo)) ?? 'No disponible' }))
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filtradas = filas.filter(fila => tabla.columnas.some(([campo]) => String(fila[campo] ?? '').toLocaleLowerCase('es').includes(texto)))
  if (orden.campo) filtradas.sort((a, b) => String(a[orden.campo] ?? '').localeCompare(String(b[orden.campo] ?? ''), 'es', { numeric: true }) * (orden.direccion === 'asc' ? 1 : -1))
  const paginas = Math.max(1, Math.ceil(filtradas.length / 10))
  const paginaActual = Math.min(pagina, paginas)
  function ordenar(campo) { setPagina(1); setOrden(prev => ({ campo, direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc' })) }
  return <div className="room-list reservations-list rooms-modern-list real-list"><div className="room-list-header reservations-list-header"><div><h2>{tabla.titulo}</h2><p>{tabla.descripcion}</p></div><span className="reservations-total-pill">{filtradas.length} resultados</span></div>
    <div className="room-filters reservations-filters list-filter-row dynamic-filter-search-row"><label className="reservation-search"><Search size={16} aria-hidden="true" /><input type="search" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} placeholder={`Buscar en ${tabla.titulo.toLowerCase()}...`} aria-label={`Buscar en ${tabla.titulo.toLowerCase()}`} /></label><button type="button" className="list-clear-button" onClick={() => setBusqueda('')}>Limpiar búsqueda</button></div>
    <div className="table-container reservations-table-container rooms-modern-table-container"><table className="rooms-table rooms-modern-table"><thead><tr>{tabla.columnas.map(([campo, etiqueta]) => <th key={campo} aria-sort={orden.campo === campo ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'}><button type="button" className="table-sort-button" onClick={() => ordenar(campo)}>{etiqueta}<span aria-hidden="true">{orden.campo === campo ? (orden.direccion === 'asc' ? '▲' : '▼') : '↕'}</span></button></th>)}<th>Acciones</th></tr></thead><tbody>{filtradas.slice((paginaActual - 1) * 10, paginaActual * 10).map(fila => <tr key={fila[tabla.id]}>{tabla.columnas.map(([campo]) => <td key={campo}>{campo === 'estado' ? <span className={`room-status-modern ${String(fila.estado ?? '').toLowerCase()}`}><span className="room-status-dot" />{fila.estado}</span> : campo === 'tipo' ? <span className="room-type-label">{fila[campo]}</span> : campo === 'numero' ? <span className="room-number-code">{fila[campo]}</span> : fila[campo] ?? '—'}</td>)}<td><button type="button" onClick={() => setDetalle(fila)} aria-label={`Ver detalle de ${fila.numero ?? fila.nombre ?? fila.id_tarifa}`}><Eye size={15} aria-hidden="true" /> Ver detalle</button></td></tr>)}{!filtradas.length && <tr><td colSpan={tabla.columnas.length + 1} className="empty-message">No se encontraron registros.</td></tr>}</tbody></table></div>
    {detalle && <Ventana titulo="Detalle del registro" onCerrar={() => setDetalle(null)}><dl className="real-hotel-grid"><div><dt>Identificador</dt><dd>{detalle[tabla.id]}</dd></div>{detalle.hotel_id_hotel != null && <div><dt>ID hotel</dt><dd>{detalle.hotel_id_hotel}</dd></div>}{detalle.tipo_habitacion_id_tipo != null && <div><dt>ID tipo</dt><dd>{detalle.tipo_habitacion_id_tipo}</dd></div>}{tabla.columnas.map(([campo, etiqueta]) => <div key={campo}><dt>{etiqueta}</dt><dd>{detalle[campo] ?? 'No registrado'}</dd></div>)}</dl></Ventana>}
    <div className="reservations-list-footer"><span>{filtradas.length} de {filas.length} registros · Página {paginaActual} de {paginas}</span><span><button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button> <button type="button" disabled={paginaActual === paginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button></span></div>
  </div>
}

function InfoHotel({ hotel }) {
  const campos = [['Dirección', hotel.direccion], ['Ciudad', hotel.ciudad], ['País', hotel.pais], ['Teléfono', hotel.telefono], ['Correo', hotel.email], ['Categoría', hotel.categoria], ['Zona horaria', hotel.zona_horaria]]
  return <article className="dashboard-panel real-hotel-panel"><div className="panel-heading"><div><h2>{hotel.nombre}</h2><p>Datos generales del hotel asignado a tu cuenta.</p></div><span className="panel-icon" aria-hidden="true">⌂</span></div><dl className="real-hotel-grid">{campos.map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor || 'No disponible'}</dd></div>)}</dl></article>
}

function DatosHotel({ estado, onSalir, onActualizar, avisoActualizacion, cerrarAviso }) {
  const [seccion, setSeccion] = useState(estado.cuenta.rol_sistema === 'ADMINISTRADOR' ? 'dashboard' : 'habitacion')
  const [subseccion, setSubseccion] = useState('habitacion')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { datos, cuenta } = estado
  const administrador = cuenta.rol_sistema === 'ADMINISTRADOR'
  const operativo = !administrador
  const escrituraEmpleados = import.meta.env.VITE_ESCRITURA_EMPLEADOS === 'true'
  const recepcionEscribe = administrador || (escrituraEmpleados && cuenta.rol_sistema === 'RECEPCIONISTA')
  const mantenimientoEscribe = administrador || (escrituraEmpleados && cuenta.rol_sistema === 'MANTENIMIENTO')
  const primeraActiva = recepcionEscribe && import.meta.env.VITE_PRIMERA_RESERVA === 'true'
  const clientesActivos = import.meta.env.VITE_CLIENTES_HOTEL === 'true'
  const reservasConocidos = recepcionEscribe && import.meta.env.VITE_RESERVAS_CONOCIDOS === 'true'
  const indicadoresActivos = administrador && import.meta.env.VITE_INDICADORES_HOTEL === 'true'
  const saldosActivos = administrador && import.meta.env.VITE_SALDOS_LECTURA === 'true'
  const gestionActiva = administrador && import.meta.env.VITE_GESTION_HOTEL === 'true'
  const altasActivas = administrador && import.meta.env.VITE_ALTAS_CATALOGO === 'true'
  const operacionesEscritura = (recepcionEscribe || mantenimientoEscribe) && import.meta.env.VITE_OPERACIONES_ESCRITURA === 'true'
  const estadiasActivas = recepcionEscribe && import.meta.env.VITE_ESTADIAS_ESCRITURA === 'true'
  const preciosActivos = administrador && import.meta.env.VITE_PRECIOS_ESCRITURA === 'true'
  const pagosActivos = recepcionEscribe && import.meta.env.VITE_PAGOS_ESCRITURA === 'true'
  const pagos = useMemo(() => pagosActivos ? crearPagos({ cliente: supabase, almacenamiento: window.localStorage, bloqueos: navigator.locks, uuid: () => crypto.randomUUID() }) : null, [pagosActivos])
  const operacionesActivas = import.meta.env.VITE_OPERACIONES_LECTURA === 'true'
  const consultarOperaciones = useMemo(() => crearConsultaOperaciones(supabase, operativo), [operativo])
  const reservasActivas = import.meta.env.VITE_RESERVAS_LECTURA === 'true'
  const consultarReservas = useMemo(() => crearConsultaReservas(supabase, operativo), [operativo])
  const cotizarReserva = useMemo(() => crearCotizadorReservas(supabase, operativo), [operativo])
  const permitidas = administrador ? null : cuenta.rol_sistema === 'RECEPCIONISTA' ? ['habitacion', 'servicio', 'reservas', 'clientes', 'estadias', 'pagos', 'consumos'] : ['habitacion', 'mantenimiento']
  const secciones = SECCIONES.filter(item => !permitidas || permitidas.includes(item.id)).map(item => item.id === 'reservas' ? { ...item, disponible: reservasActivas } : item.id === 'clientes' ? { ...item, disponible: clientesActivos } : MODULOS_OPERATIVOS.includes(item.id) ? { ...item, disponible: operacionesActivas } : item)
  const hotel = datos.hotel[0]
  const seleccion = secciones.find(item => item.id === seccion)
  function navegar(id) { setSeccion(id); setMenuAbierto(false); if (id === 'habitacion') setSubseccion('habitacion') }
  return <div className="app real-app"><aside className={`sidebar real-sidebar${menuAbierto ? ' is-open' : ''}`} id="menu-principal"><h2 className="logo">Hotel<span>Manager</span></h2><p className="menu-title">MENÚ PRINCIPAL</p><nav aria-label="Menú principal">{secciones.map(item => { const Icono = ICONOS_MODULO[item.id]; return <button key={item.id} type="button" className={seccion === item.id ? 'active' : ''} aria-current={seccion === item.id ? 'page' : undefined} onClick={() => navegar(item.id)}><span className="hm-nav-label"><Icono size={19} strokeWidth={1.9} aria-hidden="true" />{item.titulo}</span>{!item.disponible && <span className="real-pending-label">Pendiente</span>}</button>})}</nav><div className="sidebar-footer">Sistema de gestión hotelera<br /><span>{pagosActivos || estadiasActivas || preciosActivos || operacionesEscritura || altasActivas || gestionActiva || reservasConocidos || primeraActiva ? 'Operaciones habilitadas' : 'Solo lectura'}</span></div></aside>
    <main className="main-content"><header className="topbar real-topbar"><div className="real-topbar-title"><button type="button" className="real-menu-toggle" aria-controls="menu-principal" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)}>☰ <span>Menú</span></button><div className="hm-module-heading">{(() => { const Icono = ICONOS_MODULO[seccion]; return <Icono size={22} aria-hidden="true" /> })()}<div><h2>{seleccion.titulo}</h2><p>Panel de gestión hotelera</p></div></div></div><div className="real-topbar-actions"><div className="user"><div className="avatar">A</div><span>{administrador ? 'Administrador' : `${cuenta.nombre} ${cuenta.apellido}`} <small>{administrador ? `Hotel ${cuenta.hotel_id}` : `${cuenta.cargo} · Hotel ${cuenta.hotel_id}`}</small></span></div><button type="button" className="real-logout" onClick={onSalir}>Cerrar sesión</button></div></header>
      {avisoActualizacion && <div className="dashboard-panel" role="status">{avisoActualizacion} <button type="button" onClick={cerrarAviso}>Cerrar aviso</button></div>}
      <div className="real-source"><span><Database size={16} aria-hidden="true" /> Conectado a Supabase · {hotel.nombre} · {pagosActivos || estadiasActivas || preciosActivos || operacionesEscritura || altasActivas || gestionActiva || reservasConocidos || primeraActiva ? 'Operaciones habilitadas' : 'Solo lectura'}</span><CircleCheck size={16} aria-hidden="true" /></div>
      {seccion === 'dashboard' && <Dashboard datos={datos} cliente={supabase} consultarReservas={consultarReservas} consultarOperaciones={consultarOperaciones} reservasActivas={reservasActivas} operacionesActivas={operacionesActivas} indicadoresActivos={indicadoresActivos} navegar={navegar} />}
      {seccion === 'hotel' && <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Mi hotel</h1><p>Información general de tu establecimiento.</p></div></div><InfoHotel hotel={hotel} /></section>}
      {seccion === 'habitacion' && <section className="rooms-section rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de habitaciones</h1><p>Consulta las habitaciones y tarifas de {hotel.nombre}.</p></div><div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{datos.habitacion.length} registros</strong><span>Habitaciones del hotel</span></div></div></div><div className="rooms-subnav" role="tablist" aria-label="Secciones de habitaciones">{[['habitacion', 'Habitaciones'], ['tipo_habitacion', 'Tipos de habitación'], ...(cuenta.rol_sistema === 'MANTENIMIENTO' ? [] : [['tarifa_habitacion', 'Tarifas']])].map(([id, label]) => <button type="button" role="tab" aria-selected={subseccion === id} className={subseccion === id ? 'active' : ''} onClick={() => setSubseccion(id)} key={id}>{label}</button>)}</div>{subseccion === 'habitacion' && <Tarjetas habitaciones={datos.habitacion} />}{altasActivas && subseccion === 'habitacion' && <AccionModal titulo="Nueva habitación"><AltaCatalogo recurso="habitacion" datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}{gestionActiva && subseccion === 'habitacion' && <AccionModal titulo="Editar habitación"><EditarHabitacion datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}{preciosActivos && subseccion === 'tarifa_habitacion' && <AccionModal titulo="Actualizar tarifa"><PrecioFormulario recurso={subseccion} datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}<TablaLectura key={subseccion} recurso={subseccion} datos={datos} /></section>}
      {seccion === 'servicio' && <section className="rooms-section rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Servicios</h1><p>Consulta los servicios disponibles en {hotel.nombre}.</p></div></div>{altasActivas && <AccionModal titulo="Nuevo servicio"><AltaCatalogo recurso="servicio" datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}{preciosActivos && <AccionModal titulo="Actualizar precio de servicio"><PrecioFormulario recurso="servicio" datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}<TablaLectura recurso="servicio" datos={datos} /></section>}
      {seccion === 'reservas' && reservasActivas && <><Reservas consultar={consultarReservas} cotizar={cotizarReserva} habitaciones={datos.habitacion} cliente={supabase} escrituraConocidos={reservasConocidos} primeraActiva={primeraActiva} operativo={operativo} />{saldosActivos && <AccionModal titulo="Consultar saldo de reserva"><SaldoReserva cliente={supabase} /></AccionModal>}</>}
      {seccion === 'clientes' && clientesActivos && <ClientesHotel cliente={supabase} operativo={operativo} />}
      {operacionesActivas && MODULOS_OPERATIVOS.includes(seccion) && <OperacionesLectura key={seccion} modulo={seccion} consultar={consultarOperaciones} pagos={pagos} pagosActivos={pagosActivos} estadiasActivas={estadiasActivas} operacionesEscritura={operacionesEscritura} permitirLiberar={administrador} rolSistema={cuenta.rol_sistema} gestionActiva={gestionActiva} cliente={supabase} datos={datos} actualizar={onActualizar} />}
      {!seleccion.disponible && <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">MÓDULO PENDIENTE</span><h1>{seleccion.titulo}</h1><p>Este módulo estará disponible cuando se implementen sus consultas y permisos.</p></div></div><div className="dashboard-panel real-pending"><span aria-hidden="true">◷</span><h2>Próximamente</h2><p>Esta sección aún no tiene datos ni operaciones habilitadas.</p></div></section>}
    </main>
  </div>
}

export default function SupabaseApp() {
  const servicio = useMemo(() => supabase ? crearServicio(supabase) : null, [])
  const [estado, setEstado] = useState({ estado: 'cargando' })
  const [avisoActualizacion, setAvisoActualizacion] = useState('')
  const control = useMemo(() => servicio ? crearControlSesion(servicio, setEstado, { accesoEmpleados: import.meta.env.VITE_ACCESO_EMPLEADOS === 'true' }) : null, [servicio])
  useEffect(() => {
    if (!control) return undefined
    control.iniciar()
    return () => control.detener()
  }, [control])
  if (!control) return <main className="hm-login-page"><section className="hm-login-card"><h1>Configuración pendiente</h1><p>Configura la URL y la clave publicable de Supabase en las variables de entorno antes de iniciar la aplicación.</p></section></main>
  if (estado.estado === 'login') return <Bienvenida aviso={estado.aviso} onEntrar={control.entrar} />
  if (estado.estado === 'listo') return <DatosHotel estado={estado} onSalir={() => { setAvisoActualizacion(''); void control.salir() }} onActualizar={mensaje => { setAvisoActualizacion(mensaje || 'Operación completada. Información actualizada.'); control.reintentar() }} avisoActualizacion={avisoActualizacion} cerrarAviso={() => setAvisoActualizacion('')} />
  if (['sin-vinculo', 'sin-permiso', 'error', 'error-cierre'].includes(estado.estado)) return <main className="hm-login-page"><section className="hm-login-card"><h1>{estado.estado === 'error' || estado.estado === 'error-cierre' ? 'No se pudo completar la solicitud' : 'Acceso no disponible'}</h1><p role="alert">{estado.aviso || (estado.estado === 'sin-vinculo' ? 'Tu cuenta no tiene una vinculación activa. Contacta a la administración.' : 'Tu rol aún no tiene consultas habilitadas.')}</p><div className="hm-actions">{estado.estado === 'error' && <button type="button" onClick={control.reintentar}>Reintentar</button>}<button type="button" className="hm-outline" onClick={() => void control.salir()}>Cerrar sesión</button></div></section></main>
  return <main className="hm-login-page"><p role="status">{estado.estado === 'cerrando' ? 'Cerrando sesión…' : estado.estado === 'ingresando' ? 'Iniciando sesión…' : 'Verificando acceso…'}</p></main>
}
