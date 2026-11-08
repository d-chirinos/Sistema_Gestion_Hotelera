import { test, expect } from '@playwright/test'
for (const rol of ['RECEPCIONISTA', 'MANTENIMIENTO']) {
  test(`${rol} usa solo la operación autorizada`, async ({ page }) => {
    const user = { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' }, llamadas = []
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
    await page.route('https://demo.invalid/**', async route => {
      const req = route.request(), path = new URL(req.url()).pathname
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
      llamadas.push(path)
      if (path === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user }) })
      if (path === '/auth/v1/user') return route.fulfill({ headers, body: JSON.stringify(user) })
      if (path.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 2, hotel_id: 1, rol_sistema: rol }]) })
      if (path.endsWith('/mi_perfil_operativo')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 2, hotel_id: 1, rol_sistema: rol, nombre: 'Persona', apellido: 'Prueba', cargo: rol }]) })
      if (path.endsWith('/consultar_operativo')) {
        const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, numero: '101', estado: 'DISPONIBLE' }], tipo_habitacion: [], tarifa_habitacion: [], servicio: [], mantenimiento: [], pagos: [] }
        return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_modulo] ?? []) })
      }
      if (path.endsWith('/registrar_pago_reserva')) return route.fulfill({ headers, body: JSON.stringify([{ id_pago: 11, repetido: false }]) })
      if (path.endsWith('/iniciar_mantenimiento_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ id_mantenimiento: req.postDataJSON().p_clave, repetido: false }]) })
      return route.fulfill({ status: 404, headers, body: '{}' })
    })
    page.on('dialog', d => d.accept())
    await page.goto('./'); await page.getByRole('button', { name: /Empleado/ }).click(); await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    const menu = page.getByRole('navigation', { name: 'Menú principal' })
    if (rol === 'RECEPCIONISTA') {
      await menu.getByRole('button', { name: 'Pagos', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo pago' }).click()
      await page.getByLabel('Reserva', { exact: true }).fill('1'); await page.getByLabel('Importe', { exact: true }).fill('10'); await page.getByLabel('Método de pago').fill('SIMULADO'); await page.getByRole('button', { name: 'Registrar pago', exact: true }).click()
      await expect(page.getByText('Pago 11 registrado.')).toBeVisible()
      expect(llamadas.some(x => x.endsWith('/registrar_pago_reserva'))).toBe(true)
    } else {
      await menu.getByRole('button', { name: 'Mantenimiento', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo mantenimiento' }).click()
      await expect(page.getByRole('button', { name: 'Liberar habitación' })).toHaveCount(0)
      await page.getByLabel('Habitación de mantenimiento').selectOption('1'); await page.getByLabel('Tipo de intervención').fill('Revisión'); await page.getByRole('button', { name: 'Iniciar mantenimiento' }).click()
      await expect(page.getByText('Operación completada. Información actualizada.')).toBeVisible()
      expect(llamadas.some(x => x.endsWith('/iniciar_mantenimiento_hotel'))).toBe(true)
    }
    expect(llamadas.some(x => /actualizar_tarifa|liberar_habitacion/.test(x))).toBe(false)
  })
}
