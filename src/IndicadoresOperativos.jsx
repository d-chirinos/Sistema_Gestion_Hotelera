import { useEffect, useState } from 'react'

export default function IndicadoresOperativos({ cliente }) {
  const [estado, setEstado] = useState({ cargando: true })
  useEffect(() => {
    let vigente = true
    cliente.rpc('resumen_operativo_mi_hotel').then(({ data, error }) => {
      if (!vigente) return
      if (error || !Array.isArray(data) || data.length !== 1) setEstado({ error: true })
      else setEstado({ datos: data[0] })
    }).catch(() => { if (vigente) setEstado({ error: true }) })
    return () => { vigente = false }
  }, [cliente])
  if (estado.cargando) return <p role="status">Cargando indicadores operativos…</p>
  if (estado.error) return <p role="alert">No fue posible cargar los indicadores operativos.</p>
  const d = estado.datos
  const campos = [['Reservas confirmadas', d.reservas_confirmadas], ['Reservas completadas', d.reservas_completadas], ['Reservas canceladas', d.reservas_canceladas], ['Estadías sin salida registrada', d.estadias_sin_salida], ['Pagos registrados', d.pagos_cantidad], ['Importe de pagos', d.pagos_importe], ['Consumos registrados del hotel', d.consumos_cantidad], ['Importe de consumos del hotel', d.consumos_importe], ['Mantenimientos sin fecha de fin', d.mantenimientos_sin_fin]]
  return <article className="dashboard-panel real-hotel-panel"><div className="panel-heading"><div><h2>Operaciones del hotel</h2><p>Totales históricos registrados; la moneda no está definida en el modelo. Un fin sin registrar requiere revisión.</p></div></div><dl className="real-hotel-grid">{campos.map(([titulo, valor]) => <div key={titulo}><dt>{titulo}</dt><dd>{valor ?? 'No disponible'}</dd></div>)}</dl>{Number(d.consumos_inconsistentes) > 0 && <p role="alert">Hay {d.consumos_inconsistentes} consumos con hotel de servicio inconsistente, excluidos de los importes.</p>}</article>
}
