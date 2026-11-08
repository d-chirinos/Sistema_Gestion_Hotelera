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
import { Database, CircleCheck, Pencil, BedDouble, Check, Wrench, Layers3, CircleDollarSign } from 'lucide-react'
import { Indicadores, ListaGestion } from './PanelGestion.jsx'
import { mostrarCampo } from './utils/mostrarCampo.js'
import EditarHabitacion from './EditarHabitacion.jsx'
import { crearPagos } from './supabase/pagos.js'
import { crearConsultaOperaciones, MODULOS_OPERATIVOS } from './supabase/operaciones.js'
import './App.css'
import './SupabaseApp.css'

function Tarjetas({ habitaciones }) {
  const iconos = [BedDouble, Check, BedDouble, Wrench], colores = ['blue', 'green', 'purple', 'orange']
  return <Indicadores items={resumenHabitaciones(habitaciones).map((item, i) => ({ titulo: item.titulo, valor: item.valor, detalle: item.detalle, icono: iconos[i], color: colores[i] }))} />
}

const TABLAS = {
  habitacion: { titulo: 'Listado de habitaciones', descripcion: 'Consulta el número, tipo, piso y estado de cada habitación.', id: 'id_habitacion', columnas: [['numero', 'Número'], ['tipo', 'Tipo de habitación'], ['piso', 'Piso'], ['estado', 'Estado']] },
  tipo_habitacion: { titulo: 'Tipos de habitación', descripcion: 'Características y capacidad de los tipos disponibles en tu hotel.', id: 'id_tipo', columnas: [['nombre', 'Nombre del tipo'], ['descripcion', 'Descripción'], ['capacidad', 'Capacidad']] },
  tarifa_habitacion: { titulo: 'Tarifas por tipo', descripcion: 'Precio vigente por noche para cada tipo de habitación de tu hotel.', id: 'id_tarifa', columnas: [['tipo', 'Tipo de habitación'], ['precio_noche', 'Precio por noche']] },
  servicio: { titulo: 'Servicios del hotel', descripcion: 'Consulta los servicios y precios registrados para tu hotel.', id: 'id_servicio', columnas: [['nombre', 'Servicio'], ['precio', 'Precio']] },
}

function TablaLectura({ recurso, datos, gestionActiva, preciosActivos, cliente, actualizar }) {
  const [detalle, setDetalle] = useState(null), [editar, setEditar] = useState(null)
  const tabla = TABLAS[recurso], tipos = new Map(datos.tipo_habitacion.map(tipo => [String(tipo.id_tipo), tipo.nombre]))
  const filas = datos[recurso].map(fila => ({ ...fila, tipo: tipos.get(String(fila.tipo_habitacion_id_tipo)) ?? 'No disponible', cantidad_habitaciones: datos.habitacion.filter(h => String(h.tipo_habitacion_id_tipo) === String(fila.id_tipo)).length }))
  const columnas = recurso === 'tipo_habitacion' ? [...tabla.columnas, ['cantidad_habitaciones', 'Habitaciones']] : tabla.columnas
  return <><ListaGestion titulo={tabla.titulo} columnas={columnas} filas={filas} id={tabla.id} onDetalle={setDetalle} etiquetaDetalle={fila => `Ver detalle de ${fila.numero ?? fila.nombre ?? fila.id_tarifa}`} acciones={fila => (recurso === 'habitacion' && gestionActiva || ['servicio', 'tarifa_habitacion'].includes(recurso) && preciosActivos) ? <button type="button" title={recurso === 'habitacion' && fila.estado !== 'DISPONIBLE' ? 'Solo habitaciones disponibles; el servidor verifica el historial' : 'Editar'} disabled={recurso === 'habitacion' && fila.estado !== 'DISPONIBLE'} aria-label={`Editar ${recurso === 'habitacion' ? 'habitación' : recurso === 'tarifa_habitacion' ? 'tarifa' : 'servicio'} ${fila[tabla.id]}`} onClick={() => setEditar(fila)}><Pencil size={16} /></button> : null} />
    {detalle && <Ventana titulo="Detalle del registro" onCerrar={() => setDetalle(null)}><dl className="real-hotel-grid"><div><dt>Identificador</dt><dd>{detalle[tabla.id]}</dd></div>{detalle.hotel_id_hotel != null && <div><dt>ID hotel</dt><dd>{detalle.hotel_id_hotel}</dd></div>}{detalle.tipo_habitacion_id_tipo != null && <div><dt>ID tipo</dt><dd>{detalle.tipo_habitacion_id_tipo}</dd></div>}{columnas.map(([campo, etiqueta]) => <div key={campo}><dt>{etiqueta}</dt><dd>{mostrarCampo(campo, detalle[campo])}</dd></div>)}</dl></Ventana>}
    {editar && <Ventana titulo={recurso === 'habitacion' ? 'Editar habitación' : 'Actualizar precio'} onCerrar={() => setEditar(null)}>{recurso === 'habitacion' ? <EditarHabitacion datos={datos} cliente={cliente} actualizar={actualizar} seleccionado={editar} /> : <PrecioFormulario recurso={recurso} datos={datos} cliente={cliente} actualizar={actualizar} seleccionado={editar} />}</Ventana>}
  </>
}

function InfoHotel({ hotel, datos, navegar, permitirServicios }) {
  const grupos = [['Información general', [['Hotel', hotel.nombre], ['Categoría', hotel.categoria]]], ['Ubicación', [['Dirección', hotel.direccion], ['Ciudad', hotel.ciudad], ['País', hotel.pais], ['Zona horaria', hotel.zona_horaria]]], ['Contacto', [['Teléfono', hotel.telefono], ['Correo', hotel.email]]]]
  return <><div className="hm-hotel-cards">{grupos.map(([titulo, campos]) => <article key={titulo}><h2>{titulo}</h2><dl>{campos.map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor || 'No disponible'}</dd></div>)}</dl></article>)}</div><Indicadores items={[{ titulo: 'Habitaciones registradas', valor: datos.habitacion.length, icono: BedDouble }, { titulo: 'Tipos de habitación', valor: datos.tipo_habitacion.length, icono: Layers3, color: 'purple' }, { titulo: 'Tarifas', valor: datos.tarifa_habitacion.length, icono: CircleDollarSign, color: 'green' }, { titulo: 'Servicios', valor: datos.servicio.length, icono: Layers3, color: 'orange' }]} /><div className="hm-hotel-links"><button type="button" className="reservation-new-button" onClick={() => navegar('habitacion')}>Ver habitaciones</button>{permitirServicios && <button type="button" className="list-clear-button" onClick={() => navegar('servicio')}>Ver servicios</button>}</div></>
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
      {seccion === 'hotel' && <section className="rooms-modern-section hm-gestion"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Mi hotel</h1><p>Información general de tu establecimiento.</p></div></div><InfoHotel hotel={hotel} datos={datos} navegar={navegar} permitirServicios={secciones.some(x => x.id === 'servicio')} /></section>}
      {seccion === 'habitacion' && <section className="rooms-section rooms-modern-section hm-gestion"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de habitaciones</h1><p>Consulta las habitaciones y tarifas de {hotel.nombre}.</p></div><div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{datos.habitacion.length} registros</strong><span>Habitaciones del hotel</span></div></div></div><div className="rooms-subnav" role="tablist" aria-label="Secciones de habitaciones">{[['habitacion', 'Habitaciones'], ['tipo_habitacion', 'Tipos de habitación'], ...(cuenta.rol_sistema === 'MANTENIMIENTO' ? [] : [['tarifa_habitacion', 'Tarifas']])].map(([id, label]) => <button type="button" role="tab" aria-selected={subseccion === id} className={subseccion === id ? 'active' : ''} onClick={() => setSubseccion(id)} key={id}>{label}</button>)}</div>{subseccion === 'habitacion' && <Tarjetas habitaciones={datos.habitacion} />}{altasActivas && subseccion === 'habitacion' && <AccionModal titulo="Nueva habitación"><AltaCatalogo recurso="habitacion" datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}<TablaLectura key={subseccion} recurso={subseccion} datos={datos} gestionActiva={gestionActiva} preciosActivos={preciosActivos} cliente={supabase} actualizar={onActualizar} /></section>}
      {seccion === 'servicio' && <section className="rooms-section rooms-modern-section hm-gestion"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Servicios</h1><p>Consulta los servicios disponibles en {hotel.nombre}.</p></div></div>{altasActivas && <AccionModal titulo="Nuevo servicio"><AltaCatalogo recurso="servicio" datos={datos} cliente={supabase} actualizar={onActualizar} /></AccionModal>}<Indicadores items={[{ titulo: 'Servicios registrados', valor: datos.servicio.length, icono: Layers3 }, { titulo: 'Con precio mayor que cero', valor: datos.servicio.filter(x => Number(x.precio) > 0).length, icono: CircleDollarSign, color: 'green' }, { titulo: 'Servicios gratuitos', valor: datos.servicio.filter(x => Number(x.precio) === 0 && x.precio != null).length, icono: Check, color: 'purple' }]} /><TablaLectura recurso="servicio" datos={datos} preciosActivos={preciosActivos} cliente={supabase} actualizar={onActualizar} /></section>}
      {seccion === 'reservas' && reservasActivas && <><Reservas consultar={consultarReservas} cotizar={cotizarReserva} habitaciones={datos.habitacion} cliente={supabase} escrituraConocidos={reservasConocidos} primeraActiva={primeraActiva} operativo={operativo} saldosActivos={saldosActivos} /></>}
      {seccion === 'clientes' && clientesActivos && <ClientesHotel cliente={supabase} operativo={operativo} primeraActiva={primeraActiva && reservasActivas} navegar={navegar} />}
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
