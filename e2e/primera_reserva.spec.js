import { test, expect } from '@playwright/test'
test('registra cliente ficticio con primera reserva y recupera respuesta perdida en la misma pestaña', async ({ page }) => {
  const intentos = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  const user = { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user }) })
    if (url.pathname === '/auth/v1/user') return route.fulfill({ headers, body: JSON.stringify(user) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, numero: '101' }], tarifa_habitacion: [], servicio: [], tipo_habitacion: [] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/listar_reservas_mi_hotel')) return route.fulfill({ headers, body: '[]' })
    if (url.pathname.endsWith('/cotizar_reserva')) return route.fulfill({ headers, body: JSON.stringify([{ precio_noche: 100, noches: 2, total: 200 }]) })
    if (url.pathname.endsWith('/crear_cliente_y_primera_reserva')) {
      intentos.push(req.postDataJSON())
      if (intentos.length === 1) return route.abort('failed')
      return route.fulfill({ headers, body: JSON.stringify([{ id_reserva: intentos[1].p_clave, repetido: true }]) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  page.on('dialog', dialog => dialog.accept())
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click(); await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  const menu = page.getByRole('navigation', { name: 'Menú principal' })
  await menu.getByRole('button', { name: 'Reservas', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo cliente y primera reserva' }).click()
  await page.getByLabel('Nombre del cliente nuevo').fill('Persona'); await page.getByLabel('Apellido del cliente nuevo').fill('Ficticia')
  await page.getByLabel('Tipo de documento').fill('DEMO'); await page.getByLabel('País emisor').fill('SINTETICO'); await page.getByLabel('Documento del cliente nuevo').fill('DEMO-ENSAYO-001')
  await page.getByLabel('Habitación para primera reserva').selectOption('1'); await page.getByLabel('Entrada primera reserva').fill('2027-03-01'); await page.getByLabel('Salida primera reserva').fill('2027-03-03')
  await page.getByRole('button', { name: 'Cotizar primera reserva' }).click(); await expect(page.getByText(/Tarifa: 100/)).toBeVisible()
  await page.getByRole('button', { name: 'Registrar cliente y reserva' }).click(); await expect(page.getByText(/Solicitud pendiente/)).toBeVisible()
  const persistencia = await page.evaluate(() => ({ sesion: Object.keys(sessionStorage).some(k => k.startsWith('hotelmanager-intencion:primera_reserva:')), local: Object.keys(localStorage).some(k => k.startsWith('hotelmanager-intencion:primera_reserva:')) }))
  expect(persistencia).toEqual({ sesion: true, local: false })
  await page.reload(); await menu.getByRole('button', { name: 'Reservas', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo cliente y primera reserva' }).click(); await expect(page.getByText(/Solicitud pendiente/)).toBeVisible()
  await page.getByRole('button', { name: 'Reintentar primera reserva pendiente' }).click(); await expect(page.getByText(/ya registrada/)).toBeVisible()
  expect(intentos).toHaveLength(2); expect(intentos[0]).toEqual(intentos[1]); expect(Number.isSafeInteger(Number(intentos[0].p_clave))).toBe(true)
})
