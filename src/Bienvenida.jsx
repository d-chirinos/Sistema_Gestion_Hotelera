import { useEffect, useLayoutEffect, useRef, useState } from 'react'

function Icono({ tipo }) {
  return tipo === 'admin' ? <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 40V15l16-8 16 8v25M17 40V26h14v14M15 18h.01M24 18h.01M33 18h.01" /><path d="M5 40h38" /></svg> : <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="16" r="8" /><path d="M9 41c1.6-8.1 7-12 15-12s13.4 3.9 15 12" /></svg>
}
export default function Bienvenida({ aviso, onEntrar }) {
  const [fase, setFase] = useState('intro'), [pantalla, setPantalla] = useState('selection'), [transicion, setTransicion] = useState(null)
  const [correo, setCorreo] = useState(''), [clave, setClave] = useState(''), [mostrar, setMostrar] = useState(false)
  const origen = useRef(null), tarjeta = useRef(null)
  useEffect(() => {
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const a = window.setTimeout(() => setFase('transition'), reducido ? 900 : 1900)
    const b = window.setTimeout(() => setFase('ready'), reducido ? 1350 : 3000)
    return () => { window.clearTimeout(a); window.clearTimeout(b) }
  }, [])
  useLayoutEffect(() => {
    const nodo = tarjeta.current, rect = origen.current
    if (!transicion || !nodo || !rect) return undefined
    const destino = nodo.getBoundingClientRect()
    const transformacion = destino.width && destino.height ? `translate(${rect.left - destino.left}px, ${rect.top - destino.top}px) scale(${rect.width / destino.width}, ${rect.height / destino.height})` : 'none'
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const cuadros = transicion === 'opening' ? [{ transform: transformacion, opacity: 0.24 }, { transform: 'none', opacity: 1 }] : [{ transform: 'none', opacity: 1 }, { transform: transformacion, opacity: 0.24 }]
    const duracion = reducido ? 420 : 600
    const animacion = nodo.animate(cuadros, { duration: duracion, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'both' })
    let terminado = false
    const finalizar = () => { if (terminado) return; terminado = true; if (transicion === 'closing') { setPantalla('selection'); setClave(''); setMostrar(false) } setTransicion(null) }
    animacion.onfinish = finalizar
    const timer = window.setTimeout(finalizar, duracion + 100)
    return () => { window.clearTimeout(timer); animacion.onfinish = null; animacion.cancel() }
  }, [transicion, pantalla])
  function abrir(tipo, evento) { if (transicion) return; origen.current = evento.currentTarget.getBoundingClientRect(); setPantalla(tipo); setTransicion('opening') }
  function enviar(e) { e.preventDefault(); const password = clave; setClave(''); void onEntrar(correo.trim(), password) }
  return <main className={`welcome-screen welcome-screen--${fase}${transicion ? ' welcome-screen--access-transitioning' : ''}`} aria-label={pantalla === 'selection' ? 'Bienvenida a HotelManager' : `Acceso de ${pantalla === 'admin' ? 'administrador' : 'empleado'}`}>
    <div className="welcome-brand" aria-label="HotelManager"><span className="welcome-brand-mark" aria-hidden="true"><svg viewBox="0 0 56 56"><path d="M9 48V18L28 7l19 11v30M18 48V31h20v17M17 21h.01M28 21h.01M39 21h.01" /><path d="M5 48h46M28 31v17" /></svg></span><span className="welcome-brand-name">Hotel<span>Manager</span></span></div>
    {fase !== 'intro' && <section className={`welcome-access welcome-access--${pantalla}${transicion ? ` welcome-access--origin-${transicion}` : ''}`} key={pantalla} aria-labelledby="welcome-title" inert={Boolean(transicion)}>
      {pantalla === 'selection' ? <><div className="navy-access-heading"><span className="navy-access-mark" aria-hidden="true">H</span><p className="welcome-eyebrow">PLATAFORMA DE GESTIÓN HOTELERA</p><h1 id="welcome-title">Bienvenido a HotelManager</h1><p className="welcome-subtitle">Todo lo que tu hotel necesita, en un mismo lugar.</p><div className="access-features"><span>Reservas</span><span>Habitaciones</span><span>Operación diaria</span></div></div><div className="access-roles"><p className="access-roles-label">SELECCIONA TU ACCESO</p><div className="welcome-options">{[['admin', 'Administrador', 'Gestiona el hotel y supervisa sus operaciones.'], ['employee', 'Empleado', 'Accede a las herramientas de tu función.']].map(([tipo, titulo, descripcion]) => <button key={tipo} type="button" className="welcome-option" onClick={e => abrir(tipo, e)} disabled={Boolean(transicion)}><span className={`welcome-option-icon welcome-option-icon--${tipo}`}><Icono tipo={tipo} /></span><span className="welcome-option-copy"><strong>{titulo}</strong><span>{descripcion}</span></span><span className="welcome-option-action">Ingresar <span aria-hidden="true">→</span></span></button>)}</div><p className="welcome-note"><span aria-hidden="true">◆</span> Acceso para cuentas autorizadas</p></div></> : <div ref={tarjeta} className="welcome-form-card welcome-form-card--origin"><button type="button" className="welcome-back-button" onClick={() => !transicion && setTransicion('closing')} disabled={Boolean(transicion)}>← Volver a la bienvenida</button><div className="welcome-form-heading"><span className={`welcome-option-icon welcome-option-icon--${pantalla}`}><Icono tipo={pantalla} /></span><div><p className="welcome-form-eyebrow">ACCESO {pantalla === 'employee' ? 'DE EMPLEADO' : 'DE ADMINISTRADOR'}</p><h1 id="welcome-title">{pantalla === 'employee' ? 'Iniciar sesión como empleado' : 'Iniciar sesión como administrador'}</h1></div></div><form className="welcome-login-form" onSubmit={enviar}><p className="welcome-form-description">Ingresa el correo y la contraseña de tu cuenta autorizada.</p><label className="welcome-input-field"><span>Correo electrónico</span><input type="email" autoComplete="username" required value={correo} onChange={e => setCorreo(e.target.value)} /></label><div className="welcome-input-field"><label htmlFor="acceso-clave">Contraseña</label><span className="welcome-password-control"><input id="acceso-clave" type={mostrar ? 'text' : 'password'} autoComplete="current-password" required value={clave} onChange={e => setClave(e.target.value)} /><button type="button" className="welcome-password-toggle" aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrar} onClick={() => setMostrar(!mostrar)}>{mostrar ? 'Ocultar' : 'Mostrar'}</button></span></div>{aviso && <p className="welcome-form-error" role="alert">{aviso}</p>}<button type="submit" className="welcome-submit-button">Iniciar sesión</button><p className="welcome-form-footnote">Los permisos se determinan con la cuenta y el hotel asignados.</p></form></div>}
    </section>}
  </main>
}
