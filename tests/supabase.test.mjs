import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearServicio, RECURSOS } from '../src/supabase/servicio.js'
import { crearControlSesion } from '../src/supabase/sesion.js'
import { esClavePublica } from '../src/supabase/configuracion.js'

const tick = () => new Promise(resolve => setTimeout(resolve, 5))
const sesion = { user: { id: 'user-test' } }
const cuenta = { empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }
const datos = { hotel: [{ id_hotel: 1 }], habitacion: [], tipo_habitacion: [], tarifa_habitacion: [], servicio: [] }
function simulador(opciones = {}) {
  let callback
  const estados = []
  const llamadas = []
  const auth = {
    onAuthStateChange(fn) { callback = fn; return { data: { subscription: { unsubscribe() {} } } } },
    async getSession() { return { data: { session: opciones.inicial ?? null }, error: null } },
    async signInWithPassword(credenciales) {
      llamadas.push(credenciales)
      if (opciones.loginError) return { error: { message: 'credencial privada' } }
      callback('SIGNED_IN', sesion)
      return { data: { session: sesion }, error: null }
    },
    async signOut() { if (opciones.logoutError) return { error: new Error('fallo') }; callback('SIGNED_OUT', null); return { error: null } },
  }
  const servicio = { auth, cuenta: opciones.cuenta ?? (async () => cuenta), recursos: opciones.recursos ?? (async () => datos) }
  const control = crearControlSesion(servicio, x => estados.push(x))
  return { control, estados, llamadas, evento: (e, s) => callback(e, s) }
}

test('autenticación, consulta autorizada y cierre limpian la pantalla', async () => {
  const s = simulador(); s.control.iniciar(); await tick()
  assert.equal(s.estados.at(-1).estado, 'login')
  await s.control.entrar('persona@example.invalid', 'temporal'); await tick(); await tick()
  assert.equal(s.estados.at(-1).estado, 'listo')
  assert.equal(s.estados.at(-1).cuenta.hotel_id, 1)
  assert.deepEqual(s.llamadas[0], { email: 'persona@example.invalid', password: 'temporal' })
  await s.control.salir(); await tick()
  assert.equal(s.estados.at(-1).estado, 'login')
  assert.equal(s.estados.at(-1).datos, undefined)
  s.control.detener()
})

test('cuentas sin vínculo o de rol no autorizado no consultan recursos', async () => {
  for (const [perfil, esperado] of [[null, 'sin-vinculo'], [{ ...cuenta, rol_sistema: 'RECEPCIONISTA' }, 'sin-permiso']]) {
    let consultas = 0
    const s = simulador({ inicial: sesion, cuenta: async () => perfil, recursos: async () => { consultas++; return datos } })
    s.control.iniciar(); await tick(); await tick()
    assert.equal(s.estados.at(-1).estado, esperado); assert.equal(consultas, 0); s.control.detener()
  }
})

test('credenciales inválidas, error de consulta y sesión expirada se presentan sin filtrar detalles', async () => {
  const invalido = simulador({ loginError: true }); invalido.control.iniciar(); await tick()
  await invalido.control.entrar('a@example.invalid', 'clave'); assert.equal(invalido.estados.at(-1).estado, 'login')
  assert.doesNotMatch(invalido.estados.at(-1).aviso, /credencial privada/); invalido.control.detener()
  const error = simulador({ inicial: sesion, recursos: async () => { throw new Error('detalle interno') } }); error.control.iniciar(); await tick(); await tick()
  assert.equal(error.estados.at(-1).estado, 'error'); assert.doesNotMatch(error.estados.at(-1).aviso, /detalle interno/); error.control.detener()
  const vencida = simulador({ inicial: sesion, cuenta: async () => { throw { status: 401 } } }); vencida.control.iniciar(); await tick(); await tick()
  assert.equal(vencida.estados.at(-1).estado, 'login'); assert.match(vencida.estados.at(-1).aviso, /sesión terminó/); vencida.control.detener()
})

test('resultado tardío no recupera datos tras cierre o cambio de sesión', async () => {
  let resolver
  const pendiente = new Promise(r => { resolver = r })
  const s = simulador({ inicial: sesion, recursos: () => pendiente }); s.control.iniciar(); await tick()
  s.evento('SIGNED_OUT', null); resolver(datos); await tick(); await tick()
  assert.equal(s.estados.at(-1).estado, 'login'); assert.equal(s.estados.at(-1).datos, undefined); s.control.detener()
})

test('rechaza hotel inconsistente y cierre fallido no muestra datos', async () => {
  const s = simulador({ inicial: sesion, recursos: async () => ({ ...datos, hotel: [{ id_hotel: 2 }] }), logoutError: true })
  s.control.iniciar(); await tick(); await tick(); assert.equal(s.estados.at(-1).estado, 'error')
  await s.control.salir(); assert.equal(s.estados.at(-1).estado, 'error-cierre'); assert.equal(s.estados.at(-1).datos, undefined); s.control.detener()
})

test('control se puede montar de nuevo en StrictMode', async () => {
  const s = simulador({ inicial: sesion }); s.control.iniciar(); s.control.detener(); s.control.iniciar(); await tick(); await tick()
  assert.equal(s.estados.at(-1).estado, 'listo'); s.control.detener()
})

test('solo se invocan RPC permitidas y se propagan errores', async () => {
  const llamadas = []
  const client = { auth: {}, rpc(nombre, args) {
    llamadas.push([nombre, args])
    if (nombre === 'mi_cuenta_hotelmanager') return Promise.resolve({ data: [cuenta], error: null })
    return { range: async () => ({ data: args.p_recurso === 'hotel' ? [{ id_hotel: 1 }] : [], error: null }) }
  } }
  const s = crearServicio(client); assert.deepEqual(await s.cuenta(), cuenta)
  assert.deepEqual(await s.recursos(), datos)
  assert.deepEqual(llamadas.slice(1).map(([, x]) => x.p_recurso), RECURSOS)
  const falla = crearServicio({ auth: {}, rpc: () => ({ range: async () => ({ error: { status: 403 } }) }) })
  await assert.rejects(falla.recursos(), e => e.status === 403)
})

test('solo acepta claves publicables o JWT anon heredado', () => {
  const jwt = role => `a.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.c`
  assert.equal(esClavePublica('sb_publishable_demo'), true)
  assert.equal(esClavePublica(jwt('anon')), true)
  assert.equal(esClavePublica(jwt('service_role')), false)
  assert.equal(esClavePublica('sb_secret_test'), false)
  assert.equal(esClavePublica('otro'), false)
})

test('consulta páginas adicionales y falla de forma cerrada si una página falla', async () => {
  const rangos = []
  const servicio = crearServicio({ auth: {}, rpc: (_nombre, args) => ({ range: async (desde, hasta) => {
    rangos.push([args.p_recurso, desde, hasta])
    if (args.p_recurso === 'habitacion' && desde === 0) return { data: Array.from({ length: 200 }, (_, id) => ({ id })), error: null }
    if (args.p_recurso === 'habitacion' && desde === 200) return { data: [{ id: 200 }], error: null }
    return { data: [], error: null }
  } }) })
  const resultado = await servicio.recursos()
  assert.equal(resultado.habitacion.length, 201)
  assert.ok(rangos.some(([recurso, desde]) => recurso === 'habitacion' && desde === 200))
  const fallaPagina = crearServicio({ auth: {}, rpc: (_nombre, args) => ({ range: async desde => {
    if (args.p_recurso === 'habitacion' && desde === 0) return { data: Array.from({ length: 200 }, (_, id) => ({ id })), error: null }
    if (args.p_recurso === 'habitacion') return { data: null, error: { status: 503 } }
    return { data: [], error: null }
  } }) })
  await assert.rejects(fallaPagina.recursos(), e => e.status === 503)
})

test('la interfaz no recibe datos si una fila pertenece a otro hotel', async () => {
  const s = simulador({ inicial: sesion, recursos: async () => ({ ...datos, habitacion: [{ id_habitacion: 99, hotel_id_hotel: 2 }] }) })
  s.control.iniciar(); await tick(); await tick()
  assert.equal(s.estados.at(-1).estado, 'error')
  assert.equal(s.estados.at(-1).datos, undefined)
  s.control.detener()
})

test('el acceso operativo requiere perfil coherente y se habilita solo por configuración', async () => {
  for (const coincide of [true, false]) {
    const estados = [], cuentaOperativa = { empleado_id: 2, hotel_id: 1, rol_sistema: 'RECEPCIONISTA' }
    const servicio = { auth: { onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } } }, async getSession() { return { data: { session: sesion } } } }, cuenta: async () => cuentaOperativa, perfilOperativo: async () => ({ ...cuentaOperativa, hotel_id: coincide ? 1 : 2, cargo: 'Recepción' }), recursos: async () => datos }
    const control = crearControlSesion(servicio, x => estados.push(x), { accesoEmpleados: true }); control.iniciar(); await tick(); await tick()
    assert.equal(estados.at(-1).estado, coincide ? 'listo' : 'error'); control.detener()
  }
})

test('el catálogo de mantenimiento no solicita tarifas ni servicios', async () => {
  const llamadas = []
  const servicio = crearServicio({ auth: {}, rpc: (nombre, args) => ({ range: async () => { llamadas.push([nombre, args.p_modulo]); return { data: args.p_modulo === 'hotel' ? [{ id_hotel: 1 }] : [], error: null } } }) })
  const resultado = await servicio.recursos({ rol_sistema: 'MANTENIMIENTO' })
  assert.deepEqual(resultado.tarifa_habitacion, []); assert.deepEqual(resultado.servicio, [])
  assert.deepEqual(llamadas.map(x => x[1]).sort(), ['habitacion', 'hotel', 'tipo_habitacion'].sort())
  assert.ok(llamadas.every(x => x[0] === 'consultar_operativo'))
})
