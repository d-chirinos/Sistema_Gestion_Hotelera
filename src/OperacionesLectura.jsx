import { useEffect, useState } from 'react'
import PagoFormulario from './PagoFormulario.jsx'
import EstadiaFormulario from './EstadiaFormulario.jsx'
import ConsumosMantenimiento from './ConsumosMantenimiento.jsx'

const MODULOS = {
  estadias: { titulo: 'Estadías', id: 'id_estadia', columnas: [['id_estadia', 'Estadía'], ['reserva_id_reserva', 'Reserva'], ['habitacion_numero', 'Habitación'], ['empleado_id_empleado', 'Empleado'], ['fecha_checkin', 'Entrada'], ['fecha_checkout', 'Salida']] },
  pagos: { titulo: 'Pagos', id: 'id_pago', columnas: [['id_pago', 'Pago'], ['reserva_id_reserva', 'Reserva'], ['fecha_pago', 'Fecha'], ['tipo_pago', 'Tipo'], ['monto', 'Importe'], ['metodo_pago', 'Método']] },
  consumos: { titulo: 'Consumos', id: 'id_consumo', columnas: [['id_consumo', 'Consumo'], ['estadia_id_estadia', 'Estadía'], ['servicio', 'Servicio'], ['cantidad', 'Cantidad'], ['precio_unitario_aplicado', 'Precio aplicado'], ['subtotal', 'Subtotal']] },
  mantenimiento: { titulo: 'Mantenimiento', id: 'id_mantenimiento', columnas: [['id_mantenimiento', 'Mantenimiento'], ['habitacion_numero', 'Habitación'], ['empleado_id_empleado', 'Empleado'], ['fecha_inicio', 'Inicio'], ['fecha_fin', 'Fin'], ['tipo', 'Tipo'], ['costo', 'Costo']] },
  empleados: { titulo: 'Empleados', id: 'id_empleado', columnas: [['id_empleado', 'ID'], ['nombre', 'Nombre'], ['apellido', 'Apellido'], ['cargo', 'Cargo'], ['fecha_ingreso', 'Ingreso']] },
  cargos: { titulo: 'Cargos', id: 'id_cargo', columnas: [['id_cargo', 'ID'], ['nombre', 'Cargo']] },
}
export default function OperacionesLectura({ modulo, consultar, pagos, pagosActivos, estadiasActivas, operacionesEscritura, cliente, actualizar, datos }) {
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState({ cargando: true, datos: [] })
  useEffect(() => {
    let vigente = true
    consultar(modulo).then(datos => { if (vigente) setEstado({ datos }) }).catch(() => { if (vigente) setEstado({ error: true, datos: [] }) })
    return () => { vigente = false }
  }, [modulo, consultar, version])
  const config = MODULOS[modulo]
  return <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">CONSULTA DEL HOTEL</span><h1>{config.titulo}</h1><p>Información autorizada del hotel asignado.</p></div></div>
    {operacionesEscritura && ['consumos', 'mantenimiento'].includes(modulo) && <ConsumosMantenimiento modulo={modulo} cliente={cliente} datos={datos} actualizar={actualizar} refrescar={() => setVersion(v => v + 1)} />}
    {modulo === 'estadias' && estadiasActivas && <EstadiaFormulario cliente={cliente} actualizar={actualizar} />}
    {modulo === 'pagos' && pagosActivos && <PagoFormulario pagos={pagos} alGuardar={() => setVersion(v => v + 1)} />}
    {estado.cargando && <p role="status">Cargando información…</p>}
    {estado.error && <p role="alert">No se pudo consultar la información. Comprueba tu sesión y vuelve a intentarlo.</p>}
    {!estado.cargando && !estado.error && <div className="room-list reservations-list rooms-modern-list real-list"><div className="room-list-header"><h2>{config.titulo}</h2><span>{estado.datos.length} registros</span></div><div className="table-container reservations-table-container"><table className="rooms-table rooms-modern-table"><thead><tr>{config.columnas.map(([campo, titulo]) => <th key={campo}>{titulo}</th>)}</tr></thead><tbody>{estado.datos.map(fila => <tr key={fila[config.id]}>{config.columnas.map(([campo]) => <td key={campo}>{fila[campo] ?? 'No registrado'}</td>)}</tr>)}{!estado.datos.length && <tr><td colSpan={config.columnas.length}>No hay registros disponibles.</td></tr>}</tbody></table></div><div className="reservations-list-footer">Consulta de solo lectura</div></div>}
  </section>
}
