import { useEffect, useId, useRef, useState } from 'react'
export function Ventana({ titulo, onCerrar, children }) {
  const ref = useRef(null), id = useId()
  useEffect(() => { const nodo = ref.current; nodo.showModal(); return () => { if (nodo.open) nodo.close() } }, [])
  return <dialog ref={ref} className="reservation-modal real-dialog" aria-labelledby={id} onCancel={e => { e.preventDefault(); onCerrar() }}><div className="reservation-modal-header"><h2 id={id}>{titulo}</h2><button type="button" className="reservation-modal-close" aria-label="Cerrar ventana" onClick={onCerrar}>×</button></div>{children}</dialog>
}
export default function AccionModal({ titulo, children }) {
  const [abierto, setAbierto] = useState(false)
  return <div className="real-action-launch"><button type="button" className="reservation-new-button" onClick={() => setAbierto(true)}>{titulo}</button>{abierto && <Ventana titulo={titulo} onCerrar={() => setAbierto(false)}>{children}</Ventana>}</div>
}
