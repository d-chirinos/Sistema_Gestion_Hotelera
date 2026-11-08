import { test, expect } from '@playwright/test'

test('ejecuta desde editor, muestra filas, barras, CSV y errores simulados', async ({ page }) => {
  const solicitudes = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' } }) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const datos = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [], tipo_habitacion: [], tarifa_habitacion: [], servicio: [] }
      return route.fulfill({ headers, body: JSON.stringify(datos[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/functions/v1/ejecutar-consulta-sql')) {
      const body = req.postDataJSON(); solicitudes.push(body)
      if (body.sql.includes('DELETE')) return route.fulfill({ status: 400, headers, body: JSON.stringify({ error: 'Consulta no admitida.' }) })
      return route.fulfill({ headers, body: JSON.stringify({ columnas: ['estado', 'cantidad'], filas: [['CONFIRMADA', '6'], ['CANCELADA', '1']], duracion_ms: 12, truncado: false, sql_ejecutado: body.sql }) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click(); await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('button', { name: 'Consultas SQL' }).click()
  await page.getByRole('tab', { name: 'Consultas preparadas' }).click(); await page.getByRole('button', { name: 'Cargar en editor' }).first().click()
  const consulta = await page.getByLabel('Consulta PostgreSQL de lectura').inputValue()
  await page.getByRole('button', { name: 'Ejecutar consulta' }).click()
  await expect(page.getByText('CONFIRMADA', { exact: true })).toBeVisible(); await expect(page.getByText('2 filas · 12 ms')).toBeVisible()
  await page.getByRole('button', { name: 'Barras' }).click(); await expect(page.getByLabel('Gráfico de cantidad')).toBeVisible()
  const descarga = page.waitForEvent('download'); await page.getByRole('button', { name: 'Exportar CSV' }).click(); expect((await descarga).suggestedFilename()).toBe('hotelmanager-consulta.csv')
  await page.getByLabel('Consulta PostgreSQL de lectura').fill('DELETE FROM hotel_consultas.reserva'); await page.getByRole('button', { name: 'Ejecutar consulta' }).click(); await expect(page.getByText('Consulta no admitida.')).toBeVisible()
  expect(solicitudes[0]).toEqual({ sql: consulta }); expect(Object.keys(solicitudes[0])).toEqual(['sql'])
})
