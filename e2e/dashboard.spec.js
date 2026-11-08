import { test, expect } from '@playwright/test'

test('dashboard muestra datos de las RPC del hotel y permite navegar', async ({ page }) => {
  const llamadas = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  const user = { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user }) })
    llamadas.push(url.pathname)
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba', direccion: 'Calle Demo', ciudad: 'Lima', zona_horaria: 'America/Lima' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, numero: '101', piso: 1, estado: 'DISPONIBLE' }, { id_habitacion: 2, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, numero: '102', piso: 1, estado: 'OCUPADA' }, { id_habitacion: 3, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, numero: '103', piso: 1, estado: 'MANTENIMIENTO' }], tarifa_habitacion: [{ id_tarifa: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, precio_noche: 100 }], servicio: [{ id_servicio: 1, hotel_id_hotel: 1, nombre: 'Ejemplo' }], tipo_habitacion: [{ id_tipo: 1, nombre: 'Simple' }] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/resumen_operativo_mi_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ reservas_confirmadas: 2, pagos_cantidad: 2, pagos_importe: '125.00', consumos_cantidad: 1, consumos_inconsistentes: 0 }]) })
    if (url.pathname.endsWith('/listar_reservas_mi_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ id_reserva: 1, cliente_nombre: 'Persona', cliente_apellido: 'Ejemplo', habitacion_numero: '101', fecha_entrada: '2099-02-01', fecha_salida: '2099-02-02', estado: 'CONFIRMADA' }, { id_reserva: 2, cliente_nombre: 'Cancelada', cliente_apellido: 'Ejemplo', habitacion_numero: '102', fecha_entrada: '2099-01-01', estado: 'CANCELADA' }]) })
    if (url.pathname.endsWith('/consultar_operaciones_hotel')) return route.fulfill({ headers, body: JSON.stringify(req.postDataJSON().p_modulo === 'pagos' ? [{ id_pago: 1, fecha_pago: '2026-01-01', metodo_pago: 'SIMULADO', monto: '25.00' }, { id_pago: 2, fecha_pago: '2026-02-01', metodo_pago: 'TARJETA', monto: '100.00' }] : [{ id_mantenimiento: 1, fecha_fin: null }]) })
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  await page.goto('./')
  await page.getByRole('button', { name: /Administrador/ }).click()
  await page.getByLabel('Correo electrónico').fill('test@example.invalid')
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page.getByRole('heading', { name: '¡Bienvenido a Hotel de prueba!' })).toBeVisible()
  await expect(page.getByRole('img', { name: '33% de ocupación' })).toBeVisible()
  await expect(page.getByText('Persona Ejemplo')).toBeVisible()
  await expect(page.getByText('Cancelada Ejemplo')).toHaveCount(0)
  await expect(page.getByText('Pago #2')).toBeVisible()
  await expect(page.getByText('125.00').first()).toBeVisible()
  await expect(page.getByText('1 mantenimiento(s) sin fecha de fin')).toBeVisible()
  await expect(page.getByText('Zona horaria: America/Lima')).toBeVisible()
  expect(await page.getByRole('navigation', { name: 'Menú principal' }).locator('svg').count()).toBeGreaterThanOrEqual(12)
  expect(llamadas.filter(x => x.startsWith('/rest/v1/') && !x.startsWith('/rest/v1/rpc/'))).toEqual([])
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.getByRole('button', { name: /Ver todas las reservas/ }).click()
  await expect(page.getByRole('heading', { name: 'Reservas', exact: true })).toBeVisible()
})
