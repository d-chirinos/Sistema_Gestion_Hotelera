import { soles } from './utils/moneda.js'
import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import PagoFormulario from './PagoFormulario.jsx'
import EstadiaFormulario from './EstadiaFormulario.jsx'
import ConsumosMantenimiento from './ConsumosMantenimiento.jsx'
import AltaEmpleado from './AltaEmpleado.jsx'
import EditarEmpleado from './EditarEmpleado.jsx'
import AccionModal, { Ventana } from './Ventana.jsx'

const MODULOS = {
  estadias: { titulo: 'Estadías', id: 'id_estadia', columnas: [['id_estadia', 'Estadía'], ['reserva_id_reserva', 'Reserva'], ['habitacion_numero', 'Habitación'], ['empleado_id_empleado', 'Empleado'], ['fecha_checkin', 'Entrada'], ['fecha_checkout', 'Salida']] },
  pagos: { titulo: 'Pagos', id: 'id_pago', columnas: [['id_pago', 'Pago'], ['reserva_id_reserva', 'Reserva'], ['fecha_pago', 'Fecha'], ['tipo_pago', 'Tipo'], ['monto', 'Importe'], ['metodo_pago', 'Método']] },
  consumos: { titulo: 'Consumos', id: 'id_consumo', columnas: [['id_consumo', 'Consumo'], ['estadia_id_estadia', 'Estadía'], ['servicio', 'Servicio'], ['cantidad', 'Cantidad'], ['precio_unitario_aplicado', 'Precio aplicado'], ['subtotal', 'Subtotal']] },
  mantenimiento: { titulo: 'Mantenimiento', id: 'id_mantenimiento', columnas: [['id_mantenimiento', 'Mantenimiento'], ['habitacion_numero', 'Habitación'], ['empleado_id_empleado', 'Empleado'], ['fecha_inicio', 'Inicio'], ['fecha_fin', 'Fin'], ['tipo', 'Tipo'], ['costo', 'Costo']] },
  empleados: { titulo: 'Empleados', id: 'id_empleado', columnas: [['id_empleado', 'ID'], ['nombre', 'Nombre'], ['apellido', 'Apellido'], ['cargo', 'Cargo'], ['fecha_ingreso', 'Ingreso']] },
  cargos: { titulo: 'Cargos', id: 'id_cargo', columnas: [['id_cargo', 'ID'], ['nombre', 'Cargo']] },
}
export default function OperacionesLectura({ modulo, consultar, pagos, pagosActivos, estadiasActivas, operacionesEscritura, permitirLiberar, rolSistema, gestionActiva, cliente, actualizar, datos }) {
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState(''), [orden, setOrden] = useState(''), [pagina, setPagina] = useState(1), [detalle, setDetalle] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, datos: [] })
  useEffect(() => {
    let vigente = true
    consultar(modulo).then(datos => { if (vigente) setEstado({ datos }) }).catch(() => { if (vigente) setEstado({ error: true, datos: [] }) })
    return () => { vigente = false }
  }, [modulo, consultar, version])
  const base = MODULOS[modulo]
  const config = modulo === 'mantenimiento' && rolSistema === 'MANTENIMIENTO' ? { ...base, columnas: base.columnas.filter(([campo]) => campo !== 'costo') } : base
  const texto = busqueda.trim().toLocaleLowerCase('es')
  const filtradas = (estado.datos ?? []).filter(fila => config.columnas.some(([campo]) => String(fila[campo] ?? '').toLocaleLowerCase('es').includes(texto)))
  if (orden) filtradas.sort((a, b) => String(a[orden] ?? '').localeCompare(String(b[orden] ?? ''), 'es', { numeric: true }))
  const paginas = Math.max(1, Math.ceil(filtradas.length / 10)), actual = Math.min(pagina, paginas)
  return <section className="rooms-modern-section"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">CONSULTA DEL HOTEL</span><h1>{config.titulo}</h1><p>Información autorizada del hotel asignado.</p></div></div>
    {modulo === 'empleados' && gestionActiva && <AccionModal titulo="Nuevo empleado"><AltaEmpleado cliente={cliente} consultar={consultar} actualizar={actualizar} /></AccionModal>}
    {modulo === 'empleados' && gestionActiva && !estado.cargando && !estado.error && <AccionModal titulo="Editar empleado"><EditarEmpleado cliente={cliente} empleados={estado.datos} consultar={consultar} actualizar={actualizar} /></AccionModal>}
    {operacionesEscritura && ['consumos', 'mantenimiento'].includes(modulo) && <AccionModal titulo={modulo === 'consumos' ? 'Registrar consumo' : 'Gestionar mantenimiento'}><ConsumosMantenimiento modulo={modulo} cliente={cliente} datos={datos} permitirLiberar={permitirLiberar} actualizar={actualizar} refrescar={() => setVersion(v => v + 1)} /></AccionModal>}
    {modulo === 'estadias' && estadiasActivas && <AccionModal titulo="Gestionar estadía"><EstadiaFormulario cliente={cliente} actualizar={actualizar} /></AccionModal>}
    {modulo === 'pagos' && pagosActivos && <AccionModal titulo="Nuevo pago"><PagoFormulario pagos={pagos} alGuardar={() => setVersion(v => v + 1)} /></AccionModal>}
    {estado.cargando && <p role="status">Cargando información…</p>}
    {estado.error && <p role="alert">No se pudo consultar la información. Comprueba tu sesión y vuelve a intentarlo.</p>}
    {!estado.cargando && !estado.error && <div className="room-list reservations-list rooms-modern-list real-list"><div className="room-list-header"><h2>{config.titulo}</h2><span>{filtradas.length} registros</span></div><label className="reservation-search"><span>Buscar en {config.titulo.toLowerCase()}</span><input type="search" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} /></label><div className="table-container reservations-table-container"><table className="rooms-table rooms-modern-table"><thead><tr>{config.columnas.map(([campo, titulo]) => <th key={campo}><button type="button" className="table-sort-button" onClick={() => { setOrden(campo); setPagina(1) }}>{titulo} ↕</button></th>)}<th>Acciones</th></tr></thead><tbody>{filtradas.slice((actual - 1) * 10, actual * 10).map(fila => <tr key={fila[config.id]}>{config.columnas.map(([campo]) => <td key={campo}>{['monto', 'precio_unitario_aplicado', 'subtotal', 'costo'].includes(campo) ? soles(fila[campo]) : fila[campo] ?? 'No registrado'}</td>)}<td><button type="button" onClick={() => setDetalle(fila)} aria-label={`Ver detalle ${config.titulo} ${fila[config.id]}`}><Eye size={15} aria-hidden="true" /> Ver detalle</button></td></tr>)}{!filtradas.length && <tr><td colSpan={config.columnas.length + 1}>No hay registros disponibles.</td></tr>}</tbody></table></div><div className="reservations-list-footer"><span>Página {actual} de {paginas} · Consulta de solo lectura</span><span><button type="button" disabled={actual === 1} onClick={() => setPagina(actual - 1)}>Anterior</button> <button type="button" disabled={actual === paginas} onClick={() => setPagina(actual + 1)}>Siguiente</button></span></div></div>}
    {detalle && <Ventana titulo={`Detalle de ${config.titulo}`} onCerrar={() => setDetalle(null)}><dl className="real-hotel-grid">{config.columnas.map(([campo, etiqueta]) => <div key={campo}><dt>{etiqueta}</dt><dd>{['monto', 'precio_unitario_aplicado', 'subtotal', 'costo'].includes(campo) ? soles(detalle[campo]) : detalle[campo] ?? 'No registrado'}</dd></div>)}</dl></Ventana>}
  </section>
}
