import { useState } from 'react'

export default function EstadiaFormulario({ cliente, actualizar }) {
  const [reserva, setReserva] = useState('')
  const [estadia, setEstadia] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  async function ejecutar(evento, operacion, id) {
    evento.preventDefault()
    if (!/^[1-9]\d*$/.test(id)) { setError('Indica un identificador válido.'); return }
    if (!window.confirm(`¿Confirmas el ${operacion === 'registrar_checkin' ? 'check-in' : 'check-out'}?`)) return
    setOcupado(true); setError('')
    try {
      const parametros = operacion === 'registrar_checkin' ? { p_reserva_id: id } : { p_estadia_id: id }
      const { data, error: fallo } = await cliente.rpc(operacion, parametros)
      if (fallo || !Array.isArray(data) || data.length !== 1) throw new Error()
      actualizar()
    } catch { setError('No se confirmó la operación. Consulta nuevamente la estadía y la habitación antes de reintentar; los casos históricos requieren revisión.') }
    finally { setOcupado(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Registrar entrada o salida</h2><p>El servidor registra el instante local y valida la reserva, la habitación y la cuenta.</p></div></div>
    <form onSubmit={e => ejecutar(e, 'registrar_checkin', reserva)}><label className="reservation-form-field"><span>ID de reserva para check-in</span><input required inputMode="numeric" value={reserva} onChange={e => setReserva(e.target.value)} /></label><button type="submit" className="reservation-save-button" disabled={ocupado}>Registrar check-in</button></form>
    <form onSubmit={e => ejecutar(e, 'registrar_checkout', estadia)}><label className="reservation-form-field"><span>ID de estadía para check-out</span><input required inputMode="numeric" value={estadia} onChange={e => setEstadia(e.target.value)} /></label><button type="submit" className="reservation-save-button" disabled={ocupado}>Registrar check-out</button></form>
    {error && <p role="alert">{error}</p>}
  </div>
}
