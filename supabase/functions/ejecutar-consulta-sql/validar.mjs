import { parse, toSql } from 'pgsql-ast-parser'

const vistas = new Set(['habitacion','tipo_habitacion','tarifa_habitacion','servicio','cliente','reserva','estadia','pago','consumo_servicio','empleado','cargo','mantenimiento'])
const funciones = new Set(['count','sum','avg','min','max'])
const operadores = new Set(['=','!=','<>','>','<','>=','<=','+','-','*','/','%','AND','OR','IN','NOT IN','LIKE','NOT LIKE','ILIKE','NOT ILIKE'])
const unarios = new Set(['NOT','-','+','IS NULL','IS NOT NULL'])
const fallo = () => { throw new Error('Consulta no admitida. Usa SELECT de lectura sobre las vistas autorizadas.') }
function claves(obj, permitidas) { if (!obj || typeof obj !== 'object' || Object.keys(obj).some(k => !permitidas.includes(k))) fallo() }
function nombre(n) { claves(n, ['name']); if (typeof n.name !== 'string' || !n.name || n.name.length > 63) fallo() }
function expresion(e, ctes) {
  if (!e || typeof e !== 'object') fallo()
  if (e.type === 'select' || e.type === 'with') return sentencia(e, ctes)
  switch (e.type) {
    case 'ref': claves(e, ['type','name','table']); if (typeof e.name !== 'string' || e.name.length > 63) fallo(); if (e.table) nombre(e.table); break
    case 'string': case 'integer': case 'numeric': case 'boolean': case 'null': claves(e, ['type','value']); break
    case 'binary': claves(e, ['type','left','right','op']); if (!operadores.has(String(e.op).toUpperCase())) fallo(); expresion(e.left, ctes); expresion(e.right, ctes); break
    case 'unary': claves(e, ['type','op','operand']); if (!unarios.has(String(e.op).toUpperCase())) fallo(); expresion(e.operand, ctes); break
    case 'list': claves(e, ['type','expressions']); if (!Array.isArray(e.expressions) || e.expressions.length > 100) fallo(); e.expressions.forEach(x => expresion(x, ctes)); break
    case 'call': claves(e, ['type','function','args']); nombre(e.function); if (!funciones.has(e.function.name.toLowerCase()) || !Array.isArray(e.args) || e.args.length !== 1) fallo(); e.args.forEach(x => expresion(x, ctes)); break
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
  if (s.type !== 'select') fallo()
  claves(s, ['type','columns','from','where','groupBy','having','orderBy','limit','distinct'])
  if (s.distinct && s.distinct !== 'distinct') fallo()
  if (!Array.isArray(s.columns) || !s.columns.length || s.columns.length > 50 || !Array.isArray(s.from) || !s.from.length || s.from.length > 15) fallo()
  for (const col of s.columns) { claves(col, ['expr','alias']); expresion(col.expr, ctes); if (col.alias) nombre(col.alias) }
  for (const f of s.from) {
    if (f.type === 'table') { claves(f, ['type','name','join']); claves(f.name, ['name','schema','alias']); if (typeof f.name.name !== 'string' || !(f.name.schema === 'hotel_consultas' && vistas.has(f.name.name) || !f.name.schema && ctes.has(f.name.name))) fallo() }
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
  if (typeof sql !== 'string' || sql.trim().length < 1 || sql.length > 8000) fallo()
  let sentencias
  try { sentencias = parse(sql) } catch { fallo() }
  if (sentencias.length !== 1) fallo()
  sentencia(sentencias[0])
  return toSql.statement(sentencias[0])
}
