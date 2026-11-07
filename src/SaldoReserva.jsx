import { useEffect, useRef, useState } from 'react'
export default function SaldoReserva({ cliente }) {
  const [id, setId] = useState(''), [estado, setEstado] = useState({})
  const version = useRef(0)
  useEffect(() => () => { version.current += 1 }, [])
  async function consultar(e) {
    e.preventDefault()
    if (!/^[1-9]\d*$/.test(id)) { setEstado({ error: true }); return }
    const consulta = ++version.current
    setEstado({ cargando: true })
    try {
      const { data, error } = await cliente.rpc('saldo_informativo_reserva', { p_reserva: id })
      if (error || !Array.isArray(data) || data.length !== 1) throw new Error()
      if (consulta === version.current) setEstado({ datos: data[0], reserva: id })
    } catch { if (consulta === version.current) setEstado({ error: true }) }
  }
  return <div className="room-list reservations-list real-list"><div className="room-list-header"><div><h2>Saldo informativo de reserva</h2><p>Alojamiento pactado más consumos registrados menos pagos registrados. No incluye reembolsos, penalidades ni moneda.</p></div></div>
    <form onSubmit={consultar}><label className="reservation-form-field"><span>ID de reserva para saldo</span><input required inputMode="numeric" value={id} onChange={e => { version.current += 1; setId(e.target.value); setEstado({}) }} /></label><button type="submit" className="reservation-save-button" disabled={estado.cargando}>Consultar saldo</button></form>
    {estado.error && <p role="alert">No se pudo consultar el saldo. Comprueba la reserva y tu sesión.</p>}
    {estado.datos && <div role="status"><p>Reserva: {estado.reserva}</p><p>Alojamiento: {estado.datos.alojamiento} · Consumos: {estado.datos.consumos ?? 'requiere revisión'} · Pagos: {estado.datos.pagos}</p><p>Saldo: {estado.datos.saldo ?? 'no disponible; requiere revisión'}</p></div>}
  </div>
}
