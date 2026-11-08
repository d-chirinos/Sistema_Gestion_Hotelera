import { test, expect } from '@playwright/test'

async function configurarSupabase(page, { vinculo = true, hotelAjeno = false, muchas = false } = {}) {
  const solicitudes = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request()
    const url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    solicitudes.push({ path: url.pathname, method: req.method(), body: req.postData() })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' } }) })
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/rest/v1/rpc/mi_cuenta_hotelmanager') return route.fulfill({ headers, body: JSON.stringify(vinculo ? [{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }] : []) })
    if (url.pathname === '/rest/v1/rpc/consultar_mi_hotel') {
      const { p_recurso } = req.postDataJSON()
      const data = {
        hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba', ciudad: 'Lima', pais: 'Perú', zona_horaria: 'America/Lima' }],
        habitacion: muchas ? Array.from({ length: 12 }, (_, i) => ({ id_habitacion: i + 1, hotel_id_hotel: 1, numero: String(101 + i), tipo_habitacion_id_tipo: 1, estado: 'DISPONIBLE', piso: 1 })) : [{ id_habitacion: 1, hotel_id_hotel: hotelAjeno ? 2 : 1, numero: '101', tipo_habitacion_id_tipo: 1, estado: 'DISPONIBLE', piso: 1 }],
        tipo_habitacion: [{ id_tipo: 1, nombre: 'Doble', descripcion: 'Dos personas', capacidad: 2 }],
        tarifa_habitacion: [{ id_tarifa: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, precio_noche: 100 }],
        servicio: [{ id_servicio: 1, hotel_id_hotel: 1, nombre: 'Desayuno', precio: 15 }],
      }
      if (!(p_recurso in data)) throw new Error(`Recurso inesperado: ${p_recurso}`)
      return route.fulfill({ headers, body: JSON.stringify(data[p_recurso]) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  return solicitudes
}

async function entrar(page) {
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click()
  await page.getByLabel('Correo electrónico').fill('test@example.invalid')
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
}

test('administrador navega los datos autorizados y módulos pendientes sin escrituras', async ({ page }) => {
  const solicitudes = await configurarSupabase(page)
  await entrar(page)
  await expect(page.getByRole('heading', { name: 'Bienvenido a Hotel de prueba' })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'Menú principal' })
  await nav.getByRole('button', { name: 'Mi hotel' }).click()
  await expect(page.getByText('America/Lima')).toBeVisible()
  await nav.getByRole('button', { name: 'Habitaciones', exact: true }).click()
  await expect(page.getByText('101', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Ver detalle de 101' }).click()
  await expect(page.getByRole('dialog', { name: 'Detalle del registro' })).toBeVisible()
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Registrar habitación' })).toHaveCount(0)
  await page.getByRole('tab', { name: 'Tipos de habitación' }).click()
  await expect(page.getByText('Dos personas')).toBeVisible()
  await expect(page.locator('article').filter({ hasText: 'Capacidad máxima' }).locator('b')).toHaveText('2')
  await expect(page.locator('article').filter({ hasText: 'Capacidad promedio' }).locator('b')).toHaveText('2')
  await expect(page.locator('article').filter({ hasText: 'Tipo con más habitaciones' }).locator('b')).toHaveText('Doble')
  await page.getByRole('tab', { name: 'Tarifas' }).click()
  await expect(page.locator('article').filter({ hasText: 'Precio mínimo por noche' }).locator('b')).toHaveText('S/ 100.00')
  await expect(page.locator('article').filter({ hasText: 'Precio máximo por noche' }).locator('b')).toHaveText('S/ 100.00')
  await expect(page.locator('article').filter({ hasText: 'Precio promedio por noche' }).locator('b')).toHaveText('S/ 100.00')
  await expect(page.locator('table').getByText('S/ 100.00', { exact: true })).toBeVisible()
  await nav.getByRole('button', { name: 'Servicios' }).click()
  await expect(page.getByText('Desayuno')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Registrar servicio' })).toHaveCount(0)
  await nav.getByRole('button', { name: /Reservas/ }).click()
  await expect(page.getByRole('heading', { name: 'Próximamente' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Nueva|Editar|Eliminar|Registrar/i })).toHaveCount(0)
  expect(solicitudes.filter(x => x.path.startsWith('/rest/')).every(x => x.path.startsWith('/rest/v1/rpc/') && x.method === 'POST')).toBe(true)
  expect(solicitudes.some(x => x.path.endsWith('/listar_reservas_mi_hotel'))).toBe(false)
  const recursos = solicitudes.filter(x => x.path.endsWith('/consultar_mi_hotel')).map(x => JSON.parse(x.body))
  expect(recursos.map(x => x.p_recurso).sort()).toEqual(['habitacion', 'hotel', 'servicio', 'tarifa_habitacion', 'tipo_habitacion'].sort())
  expect(recursos.every(x => Object.keys(x).length === 1)).toBe(true)
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('button', { name: /Administrador/ })).toBeVisible()
  await expect(page.getByText('Hotel de prueba')).toHaveCount(0)
})

test('una cuenta sin vínculo no obtiene consultas hoteleras', async ({ page }) => {
  const solicitudes = await configurarSupabase(page, { vinculo: false })
  await entrar(page)
  await expect(page.getByRole('heading', { name: 'Acceso no disponible' })).toBeVisible()
  expect(solicitudes.some(x => x.path.endsWith('/consultar_mi_hotel'))).toBe(false)
})

test('una respuesta accidental de otro hotel no se presenta', async ({ page }) => {
  await configurarSupabase(page, { hotelAjeno: true })
  await entrar(page)
  await expect(page.getByRole('heading', { name: 'No se pudo completar la solicitud' })).toBeVisible()
  await expect(page.getByText('101', { exact: true })).toHaveCount(0)
})

test('el menú y las tablas se pueden usar en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await configurarSupabase(page)
  await entrar(page)
  await expect(page.getByRole('heading', { name: 'Bienvenido a Hotel de prueba' })).toBeVisible()
  await page.getByRole('button', { name: /Menú/ }).click()
  await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('button', { name: 'Habitaciones', exact: true }).click()
  await expect(page.getByText('101', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Menú/ })).toHaveAttribute('aria-expanded', 'false')
  await page.getByRole('tab', { name: 'Tipos de habitación' }).click()
  await expect(page.getByText('Capacidad máxima')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('tab', { name: 'Tarifas' }).click()
  await expect(page.getByText('Precio promedio por noche')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('recupera la sesión al recargar y la elimina al cerrar', async ({ page }) => {
  await configurarSupabase(page)
  await entrar(page)
  await expect(page.getByRole('heading', { name: 'Bienvenido a Hotel de prueba' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bienvenido a Hotel de prueba' })).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: /Administrador/ })).toBeVisible()
  await expect(page.getByText('Hotel de prueba')).toHaveCount(0)
})


test('el catálogo pagina y filtra datos reales recibidos', async ({ page }) => {
  await configurarSupabase(page, { muchas: true }); await entrar(page)
  await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('button', { name: 'Habitaciones', exact: true }).click()
  await expect(page.getByText('Página 1 de 2')).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click()
  await expect(page.getByText('112', { exact: true })).toBeVisible()
  await page.getByLabel('Buscar en listado de habitaciones').fill('101')
  await expect(page.getByText('101', { exact: true })).toBeVisible()
  await expect(page.getByText('Página 1 de 1')).toBeVisible()
})
