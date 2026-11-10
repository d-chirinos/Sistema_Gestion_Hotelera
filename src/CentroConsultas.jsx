import { useRef, useState } from 'react'
import { Database, Play, Clipboard, FileDown, Sparkles, Info } from 'lucide-react'
import { CONSULTAS } from './consultas/catalogo.js'
import { PREGUNTAS, preguntaGenerica } from '../supabase/functions/_shared/preguntas.mjs'
import { resultadosCSV } from './consultas/csv.js'
import { crearConsultaIA, crearEjecutorSQL } from './consultas/servicio.js'

function Resultados({ resultado }) {
  const [vista, setVista] = useState('tabla')
  if (!resultado) return null
  const { columnas, filas, duracion_ms, truncado, sql_ejecutado } = resultado
  const numerica = columnas.findIndex((_, i) => filas.length && filas.every(f => f[i] !== null && f[i] !== '' && Number.isFinite(Number(f[i])) && Number(f[i]) >= 0))
  function descargar() {
    const blob = new Blob([resultadosCSV(columnas, filas)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob), enlace = document.createElement('a')
    enlace.href = url; enlace.download = 'hotelmanager-consulta.csv'; enlace.click(); URL.revokeObjectURL(url)
  }
  const maximo = numerica >= 0 ? Math.max(...filas.map(f => Number(f[numerica])), 1) : 1
  return <section className="hm-sql-panel"><div className="hm-sql-result-head"><h2>Resultados</h2><span>{filas.length} filas · {duracion_ms} ms{truncado ? ' · Se muestran las primeras 200 filas' : ''}</span><button type="button" className="list-clear-button" onClick={descargar}><FileDown size={16} /> Exportar CSV</button></div>{numerica >= 0 && <div className="hm-sql-tabs"><button type="button" onClick={() => setVista('tabla')}>Tabla</button><button type="button" onClick={() => setVista('barras')}>Barras</button></div>}{vista === 'barras' && numerica >= 0 ? <div className="hm-sql-chart" aria-label={`Gráfico de ${columnas[numerica]}`}>{filas.slice(0, 50).map((fila, i) => <div key={i}><span>{String(fila[numerica === 0 ? 1 : 0] ?? i + 1)}</span><i style={{ width: `${Number(fila[numerica]) / maximo * 100}%` }} /><strong>{String(fila[numerica])}</strong></div>)}</div> : <div className="table-container"><table className="rooms-table"><thead><tr>{columnas.map((c, i) => <th key={i}>{c}</th>)}</tr></thead><tbody>{filas.map((fila, i) => <tr key={i}>{fila.map((valor, j) => <td key={j}>{valor == null ? <em>NULL</em> : typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}</td>)}</tr>)}</tbody></table>{!filas.length && <p>No se encontraron filas.</p>}</div>}<details><summary>SQL ejecutado por PostgreSQL</summary><pre>{sql_ejecutado}</pre></details></section>

}

export default function CentroConsultas({ cliente }) {
  const [pestana, setPestana] = useState('manual'), [sql, setSql] = useState(''), [pregunta, setPregunta] = useState(''), [explicacion, setExplicacion] = useState(''), [explicacionIA, setExplicacionIA] = useState(false), [resultado, setResultado] = useState(null), [ocupado, setOcupado] = useState(false), [mensaje, setMensaje] = useState('')
  const version = useRef(0)
  const ejecucionHabilitada = import.meta.env.VITE_CENTRO_SQL_EJECUCION === 'true'
  const iaHabilitada = import.meta.env.VITE_CENTRO_SQL_IA === 'true'
  async function pedirIA(modo) {
    setMensaje(''); setOcupado(true)
    try {
      const respuesta = await crearConsultaIA(cliente)(modo, modo === 'generar' ? pregunta : sql)
      if (modo === 'generar') { cambiarSql(respuesta.sql) }
      setExplicacion(respuesta.explicacion); setExplicacionIA(true)
    } catch (error) { setMensaje(error.message) } finally { setOcupado(false) }
  }
  async function ejecutar() {
    const turno = ++version.current
    setMensaje(''); setResultado(null); setOcupado(true)
    try { const datos = await crearEjecutorSQL(cliente)(sql); if (version.current === turno) setResultado(datos) }
    catch (error) { if (version.current === turno) setMensaje(error.message) }
    finally { if (version.current === turno) setOcupado(false) }
  }
  function cambiarSql(valor) { version.current += 1; setOcupado(false); setSql(valor); setResultado(null) }
  async function copiar() { try { await navigator.clipboard.writeText(sql); setMensaje('SQL copiado.') } catch { setMensaje('No se pudo copiar el SQL.') } }
  return <section className="hm-gestion hm-sql"><div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">HERRAMIENTAS ACADÉMICAS</span><h1>Centro de Consultas SQL</h1><p>Explora consultas de lectura sobre el modelo de HotelManager.</p></div><Database size={28} aria-hidden="true" /></div>
    {!ejecucionHabilitada && <div className="hm-sql-notice" role="status"><Info size={19} /> El ejecutor SQL está deshabilitado hasta instalar y verificar las vistas y la función de lectura.</div>}
    <div className="hm-sql-tabs" role="tablist" aria-label="Modalidades de consulta">{[['manual', 'SQL manual'], ['predefinidas', 'Consultas preparadas'], ['ia', 'Consultar con IA']].map(([id, nombre]) => <button type="button" role="tab" aria-selected={pestana === id} className={pestana === id ? 'active' : ''} key={id} onClick={() => setPestana(id)}>{nombre}</button>)}</div>
    {pestana === 'predefinidas' && <section className="hm-sql-panel"><h2>Biblioteca de consultas</h2><p>Selecciona un ejemplo para editarlo y ejecutarlo sobre las vistas autorizadas cuando estén instaladas.</p>{['Básicas', 'JOIN', 'Agregación', 'Avanzadas'].map(grupo => <div key={grupo}><h3>{grupo}</h3><div className="hm-sql-examples">{CONSULTAS.filter(c => c.categoria === grupo).map(c => <article key={c.titulo}><h4>{c.titulo}</h4><p>{c.explicacion}</p><small>{c.conceptos}</small><pre>{c.sql}</pre><button type="button" className="list-clear-button" onClick={() => { cambiarSql(c.sql); setExplicacion(c.explicacion); setExplicacionIA(false); setResultado(null); setPestana('manual') }}>Cargar en editor</button></article>)}</div></div>)}</section>}
    {pestana === 'ia' && <section className="hm-sql-panel"><h2><Sparkles size={20} /> Consultar con Gemini</h2><p>Escribe una pregunta sobre el hotel. Puedes incluir fechas y cantidades, pero no nombres ni otros datos personales. Revisa la respuesta antes de ejecutarla.</p><label>Pregunta en español<textarea maxLength={500} value={pregunta} onChange={e => setPregunta(e.target.value)} placeholder="¿Cuántas reservas hay por estado?" /></label><label>Ejemplos<select value="" onChange={e => setPregunta(e.target.value)}><option value="">Selecciona un ejemplo</option>{PREGUNTAS.map(p => <option key={p} value={p}>{p}</option>)}</select></label>{pregunta && !preguntaGenerica(pregunta) && <p>Formula una pregunta sobre el hotel sin nombres, documentos ni otros datos personales.</p>}<div className="hm-sql-actions"><button type="button" className="reservation-new-button" disabled={!iaHabilitada || ocupado || !preguntaGenerica(pregunta)} onClick={() => pedirIA('generar')}>Generar SQL</button></div>{!iaHabilitada && <p>Gemini no está habilitado. Requiere desplegar la Edge Function y configurar el secreto en el servidor.</p>}</section>}
    {pestana !== 'predefinidas' && <section className="hm-sql-panel"><h2>Editor SQL</h2><label htmlFor="hm-sql-editor">Consulta PostgreSQL de lectura</label><div className="hm-sql-editor"><div aria-hidden="true">{sql.split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea id="hm-sql-editor" spellCheck="false" maxLength={8000} value={sql} onChange={e => { cambiarSql(e.target.value) }} placeholder="SELECT ..." /></div><div className="hm-sql-actions"><button type="button" className="reservation-new-button" disabled={!ejecucionHabilitada || !sql.trim() || ocupado} title={!ejecucionHabilitada ? "El ejecutor de lectura no está habilitado" : undefined} onClick={ejecutar}><Play size={16} /> Ejecutar consulta</button><button type="button" className="list-clear-button" onClick={() => { cambiarSql(''); setExplicacion('') }}>Limpiar</button><button type="button" className="list-clear-button" disabled={!sql} onClick={copiar}><Clipboard size={16} /> Copiar SQL</button><button type="button" className="list-clear-button" disabled={!iaHabilitada || !sql || ocupado} onClick={() => pedirIA('explicar')}><Sparkles size={16} /> Explicar con IA</button></div><p>No envíes información personal en el SQL o en la pregunta. La IA no valida ni ejecuta la consulta.</p></section>}
    {ocupado && <p role="status">Procesando solicitud…</p>}{mensaje && <p role="status">{mensaje}</p>}{explicacion && <section className="hm-sql-panel"><h2>Explicación</h2><p>{explicacion}</p>{explicacionIA && <small>Contenido generado por IA; no garantiza que el SQL sea correcto.</small>}</section>}
    <Resultados resultado={resultado} />
  </section>
}
