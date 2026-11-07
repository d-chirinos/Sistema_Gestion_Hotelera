// Una intención pendiente por cuenta y navegador; no se guarda ninguna credencial.
const prefijo = 'hotelmanager-pago-pendiente:'
export function crearPagos({ cliente, almacenamiento, bloqueos, uuid }) {
  async function identidad() {
    const { data, error } = await cliente.auth.getUser()
    if (error || !data?.user?.id) throw new Error('No se pudo verificar la sesión')
    return data.user.id
  }
  function leerPendiente(usuario) {
    const texto = almacenamiento.getItem(prefijo + usuario)
    if (!texto) return null
    try {
      const valor = JSON.parse(texto)
      if (!valor || typeof valor.clave !== 'string' || typeof valor.reserva !== 'string' || typeof valor.monto !== 'string' || typeof valor.metodo !== 'string') throw new Error()
      return valor
    } catch { throw new Error('El pago pendiente requiere revisión en este navegador') }
  }
  async function pendiente() { return leerPendiente(await identidad()) }
  async function registrar(form) {
    if (!bloqueos?.request || typeof uuid !== 'function') throw new Error('El navegador no permite reintentos seguros')
    const usuario = await identidad()
    return bloqueos.request(prefijo + usuario, { ifAvailable: true }, async bloqueo => {
      if (!bloqueo) throw new Error('Ya hay un pago en curso en otra pestaña')
      if (await identidad() !== usuario) throw new Error('La sesión cambió')
      const key = prefijo + usuario
      let actual = leerPendiente(usuario)
      if (!actual) {
        if (!form || !/^[1-9]\d*$/.test(form.reserva) || !/^\d{1,8}(\.\d{1,2})?$/.test(form.monto) || Number(form.monto) <= 0 || !form.metodo.trim()) throw new Error('Datos de pago inválidos')
        actual = { reserva: form.reserva, monto: Number(form.monto).toFixed(2), metodo: form.metodo.trim(), clave: uuid() }
        // Si no es posible persistir la clave, no se envía la operación.
        almacenamiento.setItem(key, JSON.stringify(actual))
      } else if (form && (form.reserva !== actual.reserva || Number(form.monto).toFixed(2) !== actual.monto || form.metodo.trim() !== actual.metodo)) {
        throw new Error('Hay un pago pendiente de resolver')
      }
      if (await identidad() !== usuario) throw new Error('La sesión cambió')
      const { data, error } = await cliente.rpc('registrar_pago_reserva', { p_reserva_id: actual.reserva, p_monto: actual.monto, p_metodo: actual.metodo, p_clave: actual.clave })
      if (error || !Array.isArray(data) || data.length !== 1 || !data[0]?.id_pago || typeof data[0].repetido !== 'boolean') throw new Error('Resultado no confirmado. Reintenta el pago pendiente.')
      almacenamiento.removeItem(key)
      return data[0]
    })
  }
  return { pendiente, registrar }
}
