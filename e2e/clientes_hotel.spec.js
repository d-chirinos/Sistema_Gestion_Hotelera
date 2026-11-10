import { test, expect } from '@playwright/test'
test('consulta clientes del hotel y reintenta una reserva del cliente vinculado', async ({ page }) => {
  const reservas = [], llamadas = []
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
    if (url.pathname.endsWith('/listar_clientes_mi_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ id_cliente: 1, nombre: 'Persona', apellido: 'Prueba', reservas: 1 }]) })
    if (url.pathname.endsWith('/detalle_cliente_mi_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ id_cliente: 1, nombre: 'Persona', apellido: 'Prueba', id_reserva: 1, habitacion_numero: '101', fecha_entrada: '2027-01-01', fecha_salida: '2027-01-02', estado: 'COMPLETADA' }]) })
    if (url.pathname.endsWith('/listar_reservas_mi_hotel')) return route.fulfill({ headers, body: '[]' })
    if (url.pathname.endsWith('/cotizar_reserva')) return route.fulfill({ headers, body: JSON.stringify([{ precio_noche: 100, noches: 2, total: 200 }]) })
    if (url.pathname.endsWith('/crear_reserva_cliente_conocido')) {
      reservas.push(req.postDataJSON())
      if (reservas.length === 1) return route.abort('failed')
      return route.fulfill({ headers, body: JSON.stringify([{ id_reserva: reservas[1].p_clave, repetido: true }]) })
    }
    llamadas.push(url.pathname)
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  page.on('dialog', d => d.accept())
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click(); await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  const menu = page.getByRole('navigation', { name: 'Menú principal' })
  await menu.getByRole('button', { name: 'Clientes', exact: true }).click()
  await expect(menu.getByRole('button', { name: 'Clientes', exact: true })).not.toContainText('Pendiente')
  await page.getByLabel('Buscar en clientes').fill('Persona')
  await page.getByRole('button', { name: 'Ver detalle de Persona Prueba' }).click()
  await expect(page.getByText(/Reservas de Persona Prueba/)).toBeVisible()
  await expect(page.getByText(/2027-01-01 a 2027-01-02/)).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar ventana' }).click()
  await page.getByRole('button', { name: 'Crear cliente con primera reserva' }).click()
  await expect(page.getByLabel('Nombre del cliente nuevo')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar ventana' }).click()
  await menu.getByRole('button', { name: 'Reservas', exact: true }).click()
  await page.getByRole('button', { name: 'Nueva reserva', exact: true }).click(); await page.getByRole('button', { name: 'Nueva reserva de cliente vinculado' }).click()
  await page.getByRole('dialog').getByLabel('Cliente vinculado').selectOption('1'); await page.getByLabel('Habitación para reserva').selectOption('1'); await page.getByLabel('Entrada de reserva').fill('2027-03-01'); await page.getByLabel('Salida de reserva').fill('2027-03-03')
  await page.getByRole('button', { name: 'Cotizar nueva reserva' }).click(); await expect(page.getByText(/Tarifa: S\/ 100/)).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar reserva' }).click(); await expect(page.getByText(/Reserva pendiente/)).toBeVisible()
  await page.getByRole('button', { name: 'Reintentar reserva pendiente' }).click(); await expect(page.getByText(/ya registrada/)).toBeVisible()
  expect(reservas).toHaveLength(2); expect(reservas[0]).toEqual(reservas[1]); expect(Number.isSafeInteger(Number(reservas[0].p_clave))).toBe(true)
  expect(llamadas.some(x => /cliente.*crear|confirmar_reserva_autorizada/.test(x))).toBe(false)
})
