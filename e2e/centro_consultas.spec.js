import { test, expect } from '@playwright/test'
test('el administrador revisa ejemplos y Gemini simulado sin ejecutar SQL', async ({ page }) => {
  const rutas = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    rutas.push(url.pathname)
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' } }) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const datos = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [], tipo_habitacion: [], tarifa_habitacion: [], servicio: [] }
      return route.fulfill({ headers, body: JSON.stringify(datos[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/functions/v1/consultas-gemini')) return route.fulfill({ headers, body: JSON.stringify({ sql: 'SELECT estado FROM hotel_consultas.reserva', explicacion: 'Consulta simulada para la prueba.' }) })
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click()
  await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('button', { name: 'Consultas SQL' }).click()
  await expect(page.getByRole('button', { name: 'Ejecutar consulta' })).toBeDisabled()
  await page.getByRole('tab', { name: 'Consultas preparadas' }).click(); await page.getByRole('button', { name: 'Cargar en editor' }).first().click()
  await expect(page.getByLabel('Consulta PostgreSQL de lectura')).toHaveValue(/hotel_consultas.habitacion/)
  await page.getByRole('tab', { name: 'Consultar con IA' }).click(); await page.getByLabel('Pregunta en español').fill('¿Cuántas reservas tiene cada estado?'); await page.getByRole('button', { name: 'Generar SQL' }).click()
  await expect(page.getByText('Consulta simulada para la prueba.')).toBeVisible()
  await expect(page.getByLabel('Consulta PostgreSQL de lectura')).toHaveValue('SELECT estado FROM hotel_consultas.reserva')
  await expect(page.getByRole('button', { name: 'Ejecutar consulta' })).toBeDisabled()
  await page.getByRole('button', { name: 'Explicar con IA' }).click()
  await expect(page.getByText('Contenido generado por IA; no garantiza que el SQL sea correcto.')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(rutas.filter(p => p.includes('/functions/v1/consultas-gemini'))).toHaveLength(2)
  expect(rutas.some(p => /ejecutar.*sql|query.*sql/.test(p))).toBe(false)
})
