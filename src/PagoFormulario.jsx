import { useEffect, useState } from 'react'

export default function PagoFormulario({ pagos, alGuardar }) {
  const [pendiente, setPendiente] = useState(null)
  const [listo, setListo] = useState(false)
  const [form, setForm] = useState({ reserva: '', monto: '', metodo: '' })
  const [aviso, setAviso] = useState('')
  const [cargando, setCargando] = useState(false)
  useEffect(() => {
    let activo = true
    pagos.pendiente().then(valor => { if (activo) { setPendiente(valor); setListo(true) } }).catch(() => { if (activo) setAviso('No se pudo verificar si hay un pago pendiente.') })
    return () => { activo = false }
  }, [pagos])
  async function enviar(evento) {
    evento.preventDefault()
    if (!window.confirm(pendiente ? '¿Reintentar la misma operación pendiente?' : '¿Confirmas que el pago ya se recibió y deseas registrarlo?')) return
    setCargando(true); setAviso('')
    try {
      const resultado = await pagos.registrar(pendiente ? null : form)
      setPendiente(null); setForm({ reserva: '', monto: '', metodo: '' })
      setAviso(`Pago ${resultado.id_pago} registrado${resultado.repetido ? ' previamente' : ''}.`)
      alGuardar()
    } catch {
      try { setPendiente(await pagos.pendiente()) } catch { setListo(false) }
      setAviso('No se confirmó el resultado. Si hay una operación pendiente, reinténtala sin cambiar sus datos.')
    } finally { setCargando(false) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Registrar pago recibido</h2><p>Se registra el pago asociado a una reserva de este hotel; no se procesa una transacción bancaria.</p></div></div>
    {pendiente && <p role="status">Pago pendiente de confirmar: reserva {pendiente.reserva}, importe {pendiente.monto}, método {pendiente.metodo}. Solo puede reintentarse con los mismos datos.</p>}
    <form onSubmit={enviar}><div className="reservation-form-grid real-cotizador-grid">
      <label className="reservation-form-field"><span>Reserva</span><input required inputMode="numeric" value={pendiente?.reserva ?? form.reserva} disabled={!!pendiente || cargando} onChange={e => setForm({ ...form, reserva: e.target.value })} /></label>
      <label className="reservation-form-field"><span>Importe</span><input required inputMode="decimal" value={pendiente?.monto ?? form.monto} disabled={!!pendiente || cargando} onChange={e => setForm({ ...form, monto: e.target.value })} /></label>
      <label className="reservation-form-field"><span>Método de pago</span><input required value={pendiente?.metodo ?? form.metodo} disabled={!!pendiente || cargando} onChange={e => setForm({ ...form, metodo: e.target.value })} /></label>
    </div><div className="real-cotizador-acciones"><button className="reservation-save-button" disabled={!listo || cargando} type="submit">{cargando ? 'Registrando…' : pendiente ? 'Reintentar pago pendiente' : 'Registrar pago'}</button></div></form>
    {aviso && <p role="status">{aviso}</p>}
  </div>
}
