import { test, expect } from '@playwright/test'

test('crea servicios y habitaciones solo mediante RPC y permite recuperar una respuesta perdida', async ({ page }) => {
  const llamadas = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  const user = { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user }) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, numero: '101' }], tarifa_habitacion: [{ id_tarifa: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, precio_noche: 100 }], servicio: [], tipo_habitacion: [{ id_tipo: 1, nombre: 'Simple' }] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/crear_servicio_hotel')) {
      llamadas.push([url.pathname, req.postDataJSON()])
      if (llamadas.length === 1) return route.abort('failed')
      return route.fulfill({ headers, body: JSON.stringify([{ id_servicio: 9, repetido: true }]) })
    }
    if (url.pathname.endsWith('/crear_habitacion_hotel')) { llamadas.push([url.pathname, req.postDataJSON()]); return route.fulfill({ headers, body: JSON.stringify([{ id_habitacion: 9, repetido: false }]) }) }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  page.on('dialog', dialog => dialog.accept())
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click()
  await page.getByLabel('Correo electrónico').fill('test@example.invalid')
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  const menu = page.getByRole('navigation', { name: 'Menú principal' })
  await menu.getByRole('button', { name: 'Servicios', exact: true }).click()
  await page.getByRole('button', { name: 'Nuevo servicio' }).click()
  await page.getByLabel('Nombre del servicio').fill('Transporte')
  await page.getByLabel('Precio inicial').fill('10')
  await page.getByRole('button', { name: 'Registrar servicio' }).click()
  await expect(page.getByRole('alert')).toContainText('No se confirmó')
  await page.getByRole('button', { name: 'Registrar servicio' }).click()
  await expect(page.getByText('Resumen de habitaciones')).toBeVisible()
  expect(llamadas[0][1]).toEqual(llamadas[1][1])
  await menu.getByRole('button', { name: 'Habitaciones', exact: true }).click()
  await page.getByRole('button', { name: 'Nueva habitación' }).click()
  await page.getByLabel('Número de habitación').fill('200')
  await page.getByLabel('Tipo con tarifa del hotel').selectOption('1')
  await page.getByLabel('Piso opcional').fill('2')
  await page.getByRole('button', { name: 'Registrar habitación' }).click()
  await expect(page.getByText('Resumen de habitaciones')).toBeVisible()
  expect(llamadas[2][1]).toEqual({ p_numero: '200', p_tipo: '1', p_piso: 2 })
})
