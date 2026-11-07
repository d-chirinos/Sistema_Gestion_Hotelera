import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase/cliente.js'
import { crearServicio } from './supabase/servicio.js'
import { crearControlSesion } from './supabase/sesion.js'
import './SupabaseApp.css'

const secciones = {
  habitacion: { titulo: 'Habitaciones', columnas: [['numero', 'Número'], ['piso', 'Piso'], ['tipo', 'Tipo'], ['estado', 'Estado']] },
  tipo_habitacion: { titulo: 'Tipos de habitación', columnas: [['nombre', 'Tipo'], ['descripcion', 'Descripción'], ['capacidad', 'Capacidad']] },
  tarifa_habitacion: { titulo: 'Tarifas', columnas: [['tipo', 'Tipo de habitación'], ['precio_noche', 'Precio por noche']] },
  servicio: { titulo: 'Servicios', columnas: [['nombre', 'Servicio'], ['precio', 'Precio']] },
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
  return <main className="hm-login-page"><section className="hm-login-card">
    <span className="hm-mark">H</span><p className="hm-eyebrow">HOTELMANAGER</p>
    <h1>Bienvenido de nuevo</h1><p>Ingresa para consultar la información de tu hotel.</p>
    {aviso && <p className="hm-alert" role="alert">{aviso}</p>}
    <form onSubmit={enviar}>
      <label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button type="submit">Iniciar sesión</button>
    </form>
    <p className="hm-login-note">El acceso requiere una cuenta autorizada por la administración.</p>
  </section></main>
}

function DatosHotel({ estado, onSalir }) {
  const [seccion, setSeccion] = useState('habitacion')
  const { datos, cuenta } = estado
  const hotel = datos.hotel[0]
  const tipos = new Map(datos.tipo_habitacion.map(tipo => [String(tipo.id_tipo), tipo.nombre]))
  const vista = secciones[seccion]
  const filas = datos[seccion].map(fila => ({ ...fila, tipo: tipos.get(String(fila.tipo_habitacion_id_tipo)) ?? 'No disponible' }))
  const clave = { habitacion: 'id_habitacion', tipo_habitacion: 'id_tipo', tarifa_habitacion: 'id_tarifa', servicio: 'id_servicio' }[seccion]
  return <div className="hm-shell">
    <aside className="hm-side"><div className="hm-brand"><span className="hm-mark small">H</span><strong>HotelManager</strong></div>
      <p className="hm-side-label">MI HOTEL</p><nav aria-label="Secciones del hotel">
        {Object.entries(secciones).map(([id, item]) => <button type="button" className={seccion === id ? 'active' : ''} aria-current={seccion === id ? 'page' : undefined} key={id} onClick={() => setSeccion(id)}>{item.titulo}</button>)}
      </nav><div className="hm-side-footer">Acceso de solo lectura</div>
    </aside>
    <main className="hm-main"><header className="hm-top"><div><p className="hm-eyebrow">PANEL DE ADMINISTRACIÓN</p><h1>{hotel.nombre}</h1></div><button className="hm-outline" type="button" onClick={onSalir}>Cerrar sesión</button></header>
      <p className="hm-source">Datos consultados en Supabase · Hotel {cuenta.hotel_id} · Administrador</p>
      <section className="hm-hotel-card" aria-labelledby="hotel-title"><div><p className="hm-eyebrow">INFORMACIÓN GENERAL</p><h2 id="hotel-title">{hotel.nombre}</h2><p>{[hotel.direccion, hotel.ciudad, hotel.pais].filter(Boolean).join(', ')}</p></div><div className="hm-hotel-meta"><span>Zona horaria<strong>{hotel.zona_horaria || 'No disponible'}</strong></span><span>Contacto<strong>{hotel.email || hotel.telefono || 'No disponible'}</strong></span></div></section>
      <section className="hm-panel" aria-labelledby="list-title"><div className="hm-panel-heading"><div><p className="hm-eyebrow">CONSULTA</p><h2 id="list-title">{vista.titulo}</h2></div><span className="hm-count">{filas.length} registros</span></div>
        {filas.length ? <div className="hm-table-wrap"><table><thead><tr>{vista.columnas.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{filas.map(fila => <tr key={fila[clave]}>{vista.columnas.map(([campo]) => <td key={campo}>{fila[campo] ?? '—'}</td>)}</tr>)}</tbody></table></div> : <p className="hm-empty">No hay registros disponibles.</p>}
      </section><p className="hm-footnote">Las operaciones de registro y modificación aún no están disponibles.</p>
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
