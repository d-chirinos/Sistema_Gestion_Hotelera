import { test, expect } from '@playwright/test'

test('consulta módulos al navegar sin peticiones de escritura', async ({ page }) => {
  const llamadas = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    llamadas.push([url.pathname, req.postDataJSON?.()])
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' } }) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, numero: '101' }], tarifa_habitacion: [], servicio: [], tipo_habitacion: [] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/consultar_operaciones_hotel')) {
      const data = { pagos: [{ id_pago: 1, reserva_id_reserva: 1, monto: 100, tipo_pago: 'ADELANTO' }], empleados: [{ id_empleado: 1, nombre: 'Paola', apellido: 'Prueba', cargo: 'Administración' }], estadias: [], consumos: [], mantenimiento: [], cargos: [] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_modulo]) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  await page.goto('./')
  await page.getByLabel('Correo electrónico').fill('test@example.invalid')
  await page.getByLabel('Contraseña').fill('prueba-local')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  const menu = page.getByRole('navigation', { name: 'Menú principal' })
  for (const [modulo, texto] of [['Pagos', 'ADELANTO'], ['Empleados', 'Paola'], ['Estadías', 'No hay registros disponibles.'], ['Consumos', 'No hay registros disponibles.'], ['Mantenimiento', 'No hay registros disponibles.'], ['Cargos', 'No hay registros disponibles.']]) {
    await menu.getByRole('button', { name: modulo, exact: true }).click()
    await expect(page.getByText(texto)).toBeVisible()
  }
  const consultas = llamadas.filter(([ruta]) => ruta.endsWith('/consultar_operaciones_hotel'))
  expect(new Set(consultas.map(([, args]) => args.p_modulo))).toEqual(new Set(['pagos', 'empleados', 'estadias', 'consumos', 'mantenimiento', 'cargos']))
  expect(consultas.every(([, args]) => Object.keys(args).join() === 'p_modulo')).toBe(true)
  expect(llamadas.some(([ruta]) => /registrar_pago|actualizar_tarifa|actualizar_precio|registrar_reserva/.test(ruta))).toBe(false)
})
