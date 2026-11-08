import { useEffect, useId, useRef, useState } from 'react'
import { Plus, Pencil, Search, X } from 'lucide-react'
export function Ventana({ titulo, onCerrar, children }) {
  const ref = useRef(null), id = useId()
  useEffect(() => { const nodo = ref.current; nodo.showModal(); return () => { if (nodo.open) nodo.close() } }, [])
  return <dialog ref={ref} className="reservation-modal real-dialog" aria-labelledby={id} onCancel={e => { e.preventDefault(); onCerrar() }}><div className="reservation-modal-header"><h2 id={id}>{titulo}</h2><button type="button" className="reservation-modal-close" aria-label="Cerrar ventana" onClick={onCerrar}><X size={19} aria-hidden="true" /></button></div>{children}</dialog>
}
export default function AccionModal({ titulo, children }) {
  const [abierto, setAbierto] = useState(false)
  const Icono = /editar|actualizar/i.test(titulo) ? Pencil : /consultar|cotizar/i.test(titulo) ? Search : Plus
  return <div className="real-action-launch"><button type="button" className="reservation-new-button" onClick={() => setAbierto(true)}><Icono size={16} aria-hidden="true" />{titulo}</button>{abierto && <Ventana titulo={titulo} onCerrar={() => setAbierto(false)}>{children}</Ventana>}</div>
}
