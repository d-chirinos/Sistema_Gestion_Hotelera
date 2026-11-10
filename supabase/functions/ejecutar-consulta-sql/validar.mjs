import { parse, toSql } from 'pgsql-ast-parser'

const vistas = new Set(['habitacion','tipo_habitacion','tarifa_habitacion','servicio','cliente','reserva','estadia','pago','consumo_servicio','empleado','cargo','mantenimiento'])
const funciones = new Set(['count','sum','avg','min','max'])
const operadores = new Set(['=','!=','<>','>','<','>=','<=','+','-','*','/','%','AND','OR','IN','NOT IN','LIKE','NOT LIKE','ILIKE','NOT ILIKE'])
const unarios = new Set(['NOT','-','+','IS NULL','IS NOT NULL'])
const fallo = (codigo = 'HM_SQL_EXPRESION') => { const error = new Error('Consulta no admitida. Usa SELECT de lectura sobre las vistas autorizadas.'); error.code = codigo; throw error }
function claves(obj, permitidas) { if (!obj || typeof obj !== 'object' || Object.keys(obj).some(k => !permitidas.includes(k))) fallo('HM_SQL_ESTRUCTURA') }
function nombre(n) { claves(n, ['name']); if (typeof n.name !== 'string' || !n.name || n.name.length > 63) fallo() }
function expresion(e, ctes) {
  if (!e || typeof e !== 'object') fallo()
  if (e.type === 'select' || e.type === 'with') return sentencia(e, ctes)
  switch (e.type) {
    case 'extract': claves(e, ['type','field','from']); nombre(e.field); if (!['year','month','day'].includes(e.field.name.toLowerCase())) fallo('HM_SQL_FECHA'); expresion(e.from, ctes); break
    case 'ternary': claves(e, ['type','op','value','lo','hi']); if (!['BETWEEN', 'NOT BETWEEN'].includes(String(e.op).toUpperCase())) fallo('HM_SQL_OPERADOR'); expresion(e.value, ctes); expresion(e.lo, ctes); expresion(e.hi, ctes); break
    case 'keyword': claves(e, ['type','keyword']); if (e.keyword !== 'current_date') fallo('HM_SQL_EXPRESION'); break
    case 'cast': claves(e, ['type','operand','to']); claves(e.to, ['name']); if (e.to.name !== 'date' || e.operand?.type !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.operand.value)) fallo('HM_SQL_FECHA'); expresion(e.operand, ctes); break
    case 'ref': claves(e, ['type','name','table']); if (typeof e.name !== 'string' || e.name.length > 63) fallo(); if (e.table) nombre(e.table); break
    case 'string': case 'integer': case 'numeric': case 'boolean': case 'null': claves(e, ['type','value']); break
    case 'binary': claves(e, ['type','left','right','op']); if (!operadores.has(String(e.op).toUpperCase())) fallo('HM_SQL_OPERADOR'); expresion(e.left, ctes); expresion(e.right, ctes); break
    case 'unary': claves(e, ['type','op','operand']); if (!unarios.has(String(e.op).toUpperCase())) fallo('HM_SQL_OPERADOR'); expresion(e.operand, ctes); break
    case 'list': claves(e, ['type','expressions']); if (!Array.isArray(e.expressions) || e.expressions.length > 100) fallo(); e.expressions.forEach(x => expresion(x, ctes)); break
    case 'call': { claves(e, ['type','function','args','distinct']); nombre(e.function); const fn = e.function.name.toLowerCase(); if (!Array.isArray(e.args) || (funciones.has(fn) ? e.args.length !== 1 : fn !== 'coalesce' || e.args.length < 2 || e.args.length > 10) || (e.distinct && (e.distinct !== 'distinct' || !funciones.has(fn)))) fallo('HM_SQL_FUNCION'); e.args.forEach(x => expresion(x, ctes)); break }
    default: fallo()
  }
}
function sentencia(s, ctes = new Set()) {
  if (!s || typeof s !== 'object') fallo()
  if (s.type === 'with') {
    claves(s, ['type','bind','in']); if (!Array.isArray(s.bind) || s.bind.length > 10) fallo()
    const contexto = new Set(ctes)
    for (const b of s.bind) { claves(b, ['alias','statement']); nombre(b.alias); sentencia(b.statement, contexto); contexto.add(b.alias.name) }
    return sentencia(s.in, contexto)
  }
  if (s.type !== 'select') fallo('HM_SQL_SENTENCIA')
  claves(s, ['type','columns','from','where','groupBy','having','orderBy','limit','distinct'])
  if (s.distinct && s.distinct !== 'distinct') fallo()
  if (!Array.isArray(s.columns) || !s.columns.length || s.columns.length > 50 || !Array.isArray(s.from) || !s.from.length || s.from.length > 15) fallo()
  for (const col of s.columns) { claves(col, ['expr','alias']); expresion(col.expr, ctes); if (col.alias) nombre(col.alias) }
  for (const f of s.from) {
    if (f.type === 'table') { claves(f, ['type','name','join']); claves(f.name, ['name','schema','alias']); if (typeof f.name.name !== 'string') fallo('HM_SQL_OBJETO'); if (!f.name.schema && !ctes.has(f.name.name) && vistas.has(f.name.name)) f.name.schema = 'hotel_consultas'; if (!(f.name.schema === 'hotel_consultas' && vistas.has(f.name.name) || !f.name.schema && ctes.has(f.name.name))) fallo('HM_SQL_OBJETO') }
    else if (f.type === 'statement') { claves(f, ['type','statement','alias','join']); sentencia(f.statement, ctes) }
    else fallo()
    if (f.join) { claves(f.join, ['type','on']); if (!['INNER JOIN','LEFT JOIN'].includes(f.join.type) || !f.join.on) fallo(); expresion(f.join.on, ctes) }
  }
  if (s.where) expresion(s.where, ctes)
  if (s.having) expresion(s.having, ctes)
  if (s.groupBy) { if (!Array.isArray(s.groupBy)) fallo(); s.groupBy.forEach(x => expresion(x, ctes)) }
  if (s.orderBy) { if (!Array.isArray(s.orderBy)) fallo(); s.orderBy.forEach(x => { claves(x, ['by','order','nulls']); expresion(x.by, ctes) }) }
  if (s.limit) { claves(s.limit, ['limit']); if (!s.limit.limit || s.limit.limit.type !== 'integer' || s.limit.limit.value < 0 || s.limit.limit.value > 1000) fallo(); expresion(s.limit.limit, ctes) }
}
export function validarSQL(sql) {
  if (typeof sql !== 'string' || sql.trim().length < 1 || sql.length > 8000) fallo('HM_SQL_LONGITUD')
  let sentencias
  try { sentencias = parse(sql) } catch { fallo('HM_SQL_SINTAXIS') }
  if (sentencias.length !== 1) fallo('HM_SQL_MULTIPLE')
  sentencia(sentencias[0])
  return toSql.statement(sentencias[0])
}
