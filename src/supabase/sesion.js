import { validarDatosHotel } from './vista.js'

const errorSesion = error => error?.status === 401 || ['PGRST301', 'PGRST303', 'bad_jwt', 'session_not_found', 'refresh_token_not_found'].includes(error?.code)

// Las solicitudes obsoletas nunca pueden restaurar datos después de un cambio de sesión.
export function crearControlSesion(servicio, publicar, { accesoEmpleados = false } = {}) {
  let version = 0
  let cerrado = false
  let sesionActual = null
  let eventoRecibido = false
  let suscripcion
  let salidaAutomatica = false
  const emitir = estado => { if (!cerrado) publicar(estado) }

  async function cargar(sesion) {
    const ticket = ++version
    sesionActual = sesion
    if (!sesion?.user?.id) { emitir({ estado: 'login' }); return }
    emitir({ estado: 'cargando' })
    try {
      const cuenta = await servicio.cuenta()
      if (cerrado || ticket !== version) return
      if (!cuenta) { emitir({ estado: 'sin-vinculo' }); return }
      let perfil = cuenta
      if (cuenta.rol_sistema !== 'ADMINISTRADOR') {
        if (!accesoEmpleados || !['RECEPCIONISTA', 'MANTENIMIENTO'].includes(cuenta.rol_sistema)) { emitir({ estado: 'sin-permiso', cuenta }); return }
        perfil = await servicio.perfilOperativo()
        if (cerrado || ticket !== version) return
        if (String(perfil.empleado_id) !== String(cuenta.empleado_id) || String(perfil.hotel_id) !== String(cuenta.hotel_id) || perfil.rol_sistema !== cuenta.rol_sistema) throw new Error('Perfil inconsistente')
      }
      const datos = await servicio.recursos(perfil)
      if (cerrado || ticket !== version) return
      if (!validarDatosHotel(datos, cuenta.hotel_id)) throw new Error('Hotel inconsistente')
      emitir({ estado: 'listo', cuenta: perfil, datos })
    } catch (error) {
      if (cerrado || ticket !== version) return
      if (errorSesion(error)) {
        sesionActual = null
        salidaAutomatica = true
        emitir({ estado: 'login', aviso: 'La sesión terminó. Inicia sesión nuevamente.' })
        void servicio.auth.signOut({ scope: 'local' }).catch(() => {})
      } else emitir({ estado: 'error', aviso: 'No fue posible verificar el acceso o cargar los datos. Inténtalo de nuevo.' })
    }
  }

  return {
    iniciar() {
      cerrado = false
      eventoRecibido = false
      emitir({ estado: 'cargando' })
      const { data } = servicio.auth.onAuthStateChange((evento, sesion) => {
        const aviso = evento === 'SIGNED_OUT' && (sesionActual || salidaAutomatica) ? 'La sesión terminó. Inicia sesión nuevamente.' : undefined
        if (evento === 'SIGNED_OUT') salidaAutomatica = false
        eventoRecibido = true
        // El SDK desaconseja esperar otras llamadas de Supabase dentro del callback.
        const turno = ++version
        sesionActual = sesion
        emitir(sesion?.user?.id ? { estado: 'cargando' } : { estado: 'login', aviso })
        setTimeout(() => { if (!cerrado && turno === version && sesion?.user?.id) void cargar(sesion) }, 0)
      })
      suscripcion = data.subscription
      const inicio = version
      void servicio.auth.getSession().then(({ data: resultado, error }) => {
        if (cerrado || eventoRecibido || inicio !== version) return
        if (error) throw error
        void cargar(resultado.session)
      }).catch(() => { if (!cerrado && !eventoRecibido && inicio === version) emitir({ estado: 'error', aviso: 'No fue posible recuperar la sesión.' }) })
    },
    async entrar(email, password) {
      emitir({ estado: 'ingresando' })
      try {
        const { data, error } = await servicio.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (!data.session?.user?.id) throw new Error('Sesión ausente')
        // Algunas implementaciones de prueba no emiten el evento SIGNED_IN.
        if (!sesionActual || sesionActual.user?.id !== data.session.user.id) void cargar(data.session)
      } catch {
        ++version
        emitir({ estado: 'login', aviso: 'No fue posible iniciar sesión. Verifica tus datos e inténtalo de nuevo.' })
      }
    },
    async salir() {
      ++version
      sesionActual = null
      emitir({ estado: 'cerrando' })
      try {
        const { error } = await servicio.auth.signOut({ scope: 'local' })
        if (error) throw error
        emitir({ estado: 'login', aviso: 'Sesión cerrada.' })
      } catch { emitir({ estado: 'error-cierre', aviso: 'No se pudo cerrar la sesión. Inténtalo de nuevo.' }) }
    },
    reintentar() { if (sesionActual) void cargar(sesionActual); else { ++version; emitir({ estado: 'login' }) } },
    detener() { cerrado = true; ++version; suscripcion?.unsubscribe() },
  }
}
