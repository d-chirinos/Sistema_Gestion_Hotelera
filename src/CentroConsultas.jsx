import { useState } from 'react'
import { Database, Play, Clipboard, FileDown, Sparkles, Info } from 'lucide-react'
import { CONSULTAS } from './consultas/catalogo.js'
import { PREGUNTAS } from '../supabase/functions/_shared/preguntas.mjs'
import { resultadosCSV } from './consultas/csv.js'
import { crearConsultaIA } from './consultas/servicio.js'

function Resultados({ resultado }) {
  const [vista, setVista] = useState('tabla')
  if (!resultado) return null
  const { columnas, filas, duracion } = resultado
  const columnaNumerica = columnas.find(c => filas.length && filas.every(f => typeof f[c] === 'number' && Number.isFinite(f[c]) && f[c] >= 0))
  function descargar() {
    const blob = new Blob([resultadosCSV(columnas, filas)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob), enlace = document.createElement('a')
    enlace.href = url; enlace.download = 'hotelmanager-consulta.csv'; enlace.click(); URL.revokeObjectURL(url)
  }
  const maximo = columnaNumerica ? Math.max(...filas.map(f => f[columnaNumerica]), 1) : 1
  return <section className="hm-sql-panel"><div className="hm-sql-result-head"><h2>Resultados</h2><span>{filas.length} filas{duracion != null ? ` · ${duracion} ms` : ''}</span><button type="button" className="list-clear-button" onClick={descargar}><FileDown size={16} /> Exportar CSV</button></div>{columnaNumerica && <div className="hm-sql-tabs"><button type="button" onClick={() => setVista('tabla')}>Tabla</button><button type="button" onClick={() => setVista('barras')}>Barras</button></div>}{vista === 'barras' && columnaNumerica ? <div className="hm-sql-chart" aria-label={`Gráfico de ${columnaNumerica}`}>{filas.slice(0, 50).map((fila, i) => <div key={i}><span>{String(fila[columnas.find(c => c !== columnaNumerica)] ?? i + 1)}</span><i style={{ width: `${fila[columnaNumerica] / maximo * 100}%` }} /><strong>{fila[columnaNumerica]}</strong></div>)}</div> : <div className="table-container"><table className="rooms-table"><thead><tr>{columnas.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{filas.map((fila, i) => <tr key={i}>{columnas.map(c => <td key={c}>{fila[c] == null ? <em>NULL</em> : typeof fila[c] === 'object' ? JSON.stringify(fila[c]) : String(fila[c])}</td>)}</tr>)}</tbody></table>{!filas.length && <p>No se encontraron filas.</p>}</div>}</section>
}

export default function CentroConsultas({ cliente }) {
  const [pestana, setPestana] = useState('manual'), [sql, setSql] = useState(''), [pregunta, setPregunta] = useState(''), [explicacion, setExplicacion] = useState(''), [explicacionIA, setExplicacionIA] = useState(false), [resultado, setResultado] = useState(null), [ocupado, setOcupado] = useState(false), [mensaje, setMensaje] = useState('')
  const iaHabilitada = import.meta.env.VITE_CENTRO_SQL_IA === 'true'
  async function pedirIA(modo) {
    setMensaje(''); setOcupado(true)
    try {
      const respuesta = await crearConsultaIA(cliente)(modo, modo === 'generar' ? pregunta : sql)
      if (modo === 'generar') { setSql(respuesta.sql); setResultado(null) }
      setExplicacion(respuesta.explicacion); setExplicacionIA(true)
    } catch (error) { setMensaje(error.message) } finally { setOcupado(false) }
  }
  async function copiar() { try { await navigator.clipboard.writeText(sql); setMensaje('SQL copiado.') } catch { setMensaje('No se pudo copiar el SQL.') } }
  return <section className="hm-gestion hm-sql"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">HERRAMIENTAS ACADÉMICAS</span><h1>Centro de Consultas SQL</h1><p>Explora consultas de lectura sobre el modelo de HotelManager.</p></div><Database size={28} aria-hidden="true" /></div>
    <div className="hm-sql-notice" role="status"><Info size={19} /> El ejecutor SQL aún no está instalado ni verificado. Los ejemplos utilizan vistas propuestas que todavía no existen; no se ejecuta ninguna consulta.</div>
    <div className="hm-sql-tabs" role="tablist" aria-label="Modalidades de consulta">{[['manual', 'SQL manual'], ['predefinidas', 'Consultas preparadas'], ['ia', 'Consultar con IA']].map(([id, nombre]) => <button type="button" role="tab" aria-selected={pestana === id} className={pestana === id ? 'active' : ''} key={id} onClick={() => setPestana(id)}>{nombre}</button>)}</div>
    {pestana === 'predefinidas' && <section className="hm-sql-panel"><h2>Biblioteca de consultas</h2><p>Selecciona un ejemplo para editarlo. Sus objetos son una propuesta pendiente de despliegue.</p>{['Básicas', 'JOIN', 'Agregación', 'Avanzadas'].map(grupo => <div key={grupo}><h3>{grupo}</h3><div className="hm-sql-examples">{CONSULTAS.filter(c => c.categoria === grupo).map(c => <article key={c.titulo}><h4>{c.titulo}</h4><p>{c.explicacion}</p><small>{c.conceptos}</small><pre>{c.sql}</pre><button type="button" className="list-clear-button" onClick={() => { setSql(c.sql); setExplicacion(c.explicacion); setExplicacionIA(false); setResultado(null); setPestana('manual') }}>Cargar en editor</button></article>)}</div></div>)}</section>}
    {pestana === 'ia' && <section className="hm-sql-panel"><h2><Sparkles size={20} /> Consultar con Gemini</h2><p>Por privacidad, selecciona una pregunta genérica de la lista. La respuesta es generada por IA y debe revisarse.</p><label>Pregunta en español<select value={pregunta} onChange={e => setPregunta(e.target.value)}><option value="">Selecciona una pregunta</option>{PREGUNTAS.map(p => <option key={p} value={p}>{p}</option>)}</select></label><div className="hm-sql-actions"><button type="button" className="reservation-new-button" disabled={!iaHabilitada || ocupado || pregunta.trim().length < 3} onClick={() => pedirIA('generar')}>Generar SQL</button></div>{!iaHabilitada && <p>Gemini no está habilitado. Requiere desplegar la Edge Function y configurar el secreto en el servidor.</p>}</section>}
    {pestana !== 'predefinidas' && <section className="hm-sql-panel"><h2>Editor SQL</h2><label htmlFor="hm-sql-editor">Consulta PostgreSQL de lectura</label><div className="hm-sql-editor"><div aria-hidden="true">{sql.split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea id="hm-sql-editor" spellCheck="false" maxLength={12000} value={sql} onChange={e => { setSql(e.target.value); setResultado(null) }} placeholder="SELECT ..." /></div><div className="hm-sql-actions"><button type="button" className="reservation-new-button" disabled title="El ejecutor de lectura no está instalado"><Play size={16} /> Ejecutar consulta</button><button type="button" className="list-clear-button" onClick={() => { setSql(''); setResultado(null); setExplicacion('') }}>Limpiar</button><button type="button" className="list-clear-button" disabled={!sql} onClick={copiar}><Clipboard size={16} /> Copiar SQL</button><button type="button" className="list-clear-button" disabled={!iaHabilitada || !sql || ocupado} onClick={() => pedirIA('explicar')}><Sparkles size={16} /> Explicar con IA</button></div><p>No envíes información personal en el SQL o en la pregunta. La IA no valida ni ejecuta la consulta.</p></section>}
    {ocupado && <p role="status">Consultando Gemini…</p>}{mensaje && <p role="status">{mensaje}</p>}{explicacion && <section className="hm-sql-panel"><h2>Explicación</h2><p>{explicacion}</p>{explicacionIA && <small>Contenido generado por IA; no garantiza que el SQL sea correcto.</small>}</section>}
    <Resultados resultado={resultado} />
  </section>
}
