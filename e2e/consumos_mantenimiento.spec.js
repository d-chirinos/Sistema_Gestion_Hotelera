import { test, expect } from '@playwright/test'

test('reintenta consumo y registra, cierra y libera mantenimiento mediante RPC', async ({ page }) => {
  const solicitudes = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  const user = { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' }
  let idIntervencion = ''
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user }) })
    if (url.pathname === '/auth/v1/user') return route.fulfill({ headers, body: JSON.stringify(user) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, numero: '101' }], tarifa_habitacion: [], servicio: [{ id_servicio: 2, hotel_id_hotel: 1, nombre: 'Desayuno', precio: 20 }], tipo_habitacion: [] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/consultar_operaciones_hotel')) return route.fulfill({ headers, body: '[]' })
    if (url.pathname.includes('/rpc/')) {
      const args = req.postDataJSON(); solicitudes.push([url.pathname, args])
      if (url.pathname.endsWith('/registrar_consumo_estadia')) {
        if (solicitudes.filter(([ruta]) => ruta.endsWith('/registrar_consumo_estadia')).length === 1) return route.abort('failed')
        return route.fulfill({ headers, body: JSON.stringify([{ id_consumo: args.p_clave, repetido: true }]) })
      }
      if (url.pathname.endsWith('/iniciar_mantenimiento_hotel')) { idIntervencion = args.p_clave; return route.fulfill({ headers, body: JSON.stringify([{ id_mantenimiento: args.p_clave, repetido: false }]) }) }
      if (url.pathname.endsWith('/finalizar_mantenimiento_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ id_mantenimiento: args.p_id, repetido: false }]) })
      if (url.pathname.endsWith('/liberar_habitacion_mantenimiento')) return route.fulfill({ headers, body: JSON.stringify([{ id_habitacion: 1, estado: 'DISPONIBLE' }]) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  page.on('dialog', dialog => dialog.accept())
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click()
  await page.getByLabel('Correo electrónico').fill('test@example.invalid')
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  const menu = page.getByRole('navigation', { name: 'Menú principal' })
  await menu.getByRole('button', { name: 'Consumos', exact: true }).click(); await page.getByRole('button', { name: 'Registrar consumo', exact: true }).click()
  await page.getByLabel('ID de estadía para consumo').fill('5')
  await page.getByLabel('Servicio consumido').selectOption('2')
  await page.getByLabel('Cantidad', { exact: true }).fill('2')
  await page.getByRole('dialog').getByRole('button', { name: 'Registrar consumo', exact: true }).click()
  await expect(page.getByText(/Operación pendiente/)).toBeVisible()
  await page.getByRole('button', { name: 'Reintentar operación pendiente' }).click()
  await expect(page.getByText(/Consumo .* registrado previamente/)).toBeVisible()
  const consumos = solicitudes.filter(([ruta]) => ruta.endsWith('/registrar_consumo_estadia'))
  expect(consumos).toHaveLength(2); expect(consumos[0][1]).toEqual(consumos[1][1]); expect(typeof consumos[0][1].p_clave).toBe('string')
  await page.getByRole('button', { name: 'Cerrar ventana' }).click()
  await menu.getByRole('button', { name: 'Mantenimiento', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo mantenimiento' }).click()
  await page.getByLabel('Habitación de mantenimiento').selectOption('1')
  await page.getByLabel('Tipo de intervención').fill('Revisión')
  await page.getByRole('button', { name: 'Iniciar mantenimiento' }).click()
  await expect(page.getByText('Resumen de habitaciones')).toBeVisible()
  await menu.getByRole('button', { name: 'Mantenimiento', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo mantenimiento' }).click()
  await page.getByRole('button', { name: 'Cerrar ventana' }).click(); await page.getByRole('button', { name: 'Finalizar mantenimiento', exact: true }).click(); await page.getByLabel('ID de intervención').fill(idIntervencion)
  await page.getByLabel('Costo confirmado').fill('0')
  await page.getByRole('button', { name: 'Finalizar mantenimiento', exact: true }).last().click()
  await expect(page.getByText('Resumen de habitaciones')).toBeVisible()
  await menu.getByRole('button', { name: 'Mantenimiento', exact: true }).click(); await page.getByRole('button', { name: 'Liberar habitación', exact: true }).click()
  await page.getByLabel('Habitación a liberar').selectOption('1')
  await page.getByRole('button', { name: 'Liberar habitación', exact: true }).last().click()
  await expect(page.getByText('Resumen de habitaciones')).toBeVisible()
  expect(solicitudes.filter(([ruta]) => ruta.endsWith('/finalizar_mantenimiento_hotel'))[0][1].p_id).toBe(idIntervencion)
})
