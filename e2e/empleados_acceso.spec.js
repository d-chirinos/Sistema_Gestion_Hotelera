import { test, expect } from '@playwright/test'
async function simular(page, rol) {
  const llamadas = [], headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    llamadas.push(path)
    if (path === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' } }) })
    if (path.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 2, hotel_id: 1, rol_sistema: rol }]) })
    if (path.endsWith('/mi_perfil_operativo')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 2, hotel_id: 1, rol_sistema: rol, nombre: 'Persona', apellido: 'Prueba', cargo: rol === 'RECEPCIONISTA' ? 'Recepcionista' : 'Técnico' }]) })
    if (path.endsWith('/consultar_operativo')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, numero: '101', estado: 'DISPONIBLE' }], tipo_habitacion: [], tarifa_habitacion: [], servicio: [], mantenimiento: [], reservas: [], clientes: [], estadias: [], pagos: [], consumos: [] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_modulo] ?? []) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  return llamadas
}
for (const rol of ['RECEPCIONISTA', 'MANTENIMIENTO']) {
  test(`${rol} entra con Auth y solo ve sus módulos sin escrituras`, async ({ page }) => {
    const llamadas = await simular(page, rol)
    await page.goto('./')
    await expect(page.getByRole('button', { name: /Empleado/ })).toBeVisible()
    await page.getByRole('button', { name: /Empleado/ }).click()
    await expect(page.getByRole('heading', { name: 'Iniciar sesión como empleado' })).toBeVisible()
    await page.getByRole('button', { name: /Volver a la bienvenida/ }).click()
    await page.getByRole('button', { name: /Empleado/ }).click()
    await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page.getByText('Persona Prueba')).toBeVisible()
    await page.reload()
    await expect(page.getByText('Persona Prueba')).toBeVisible()
    const menu = page.getByRole('navigation', { name: 'Menú principal' })
    await expect(menu.getByRole('button', { name: 'Habitaciones', exact: true })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Empleados', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Nueva habitación' })).toHaveCount(0)
    if (rol === 'RECEPCIONISTA') {
      await menu.getByRole('button', { name: 'Pagos', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Nuevo pago' })).toHaveCount(0)
      await expect(menu.getByRole('button', { name: 'Mantenimiento', exact: true })).toHaveCount(0)
    } else {
      await menu.getByRole('button', { name: 'Mantenimiento', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Gestionar mantenimiento' })).toHaveCount(0)
      await expect(menu.getByRole('button', { name: 'Pagos', exact: true })).toHaveCount(0)
    }
    expect(llamadas.some(x => /registrar_pago|crear_reserva|iniciar_mantenimiento/.test(x))).toBe(false)
  })
}
