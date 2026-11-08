import { test, expect } from '@playwright/test'
test('indicadores, saldo y gestión administrativa usan RPC sin escoger hotel', async ({ page }) => {
  const llamadas = []
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' }
  const user = { id: 'test-user', email: 'test@example.invalid', aud: 'authenticated' }
  await page.route('https://demo.invalid/**', async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') return route.fulfill({ headers, body: JSON.stringify({ access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.test', refresh_token: 'prueba-local', expires_in: 3600, token_type: 'bearer', user }) })
    if (url.pathname.endsWith('/mi_cuenta_hotelmanager')) return route.fulfill({ headers, body: JSON.stringify([{ empleado_id: 1, hotel_id: 1, rol_sistema: 'ADMINISTRADOR' }]) })
    if (url.pathname.endsWith('/consultar_mi_hotel')) {
      const data = { hotel: [{ id_hotel: 1, nombre: 'Hotel de prueba' }], habitacion: [{ id_habitacion: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, numero: '101', piso: 1, estado: 'DISPONIBLE' }], tarifa_habitacion: [{ id_tarifa: 1, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, precio_noche: 100 }], servicio: [], tipo_habitacion: [{ id_tipo: 1, nombre: 'Simple' }] }
      return route.fulfill({ headers, body: JSON.stringify(data[req.postDataJSON().p_recurso]) })
    }
    if (url.pathname.endsWith('/resumen_operativo_mi_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ reservas_confirmadas: 4, reservas_completadas: 2, reservas_canceladas: 3, estadias_sin_salida: 1, pagos_cantidad: 2, pagos_importe: '100.00', consumos_cantidad: 1, consumos_importe: '20.00', consumos_inconsistentes: 0, mantenimientos_sin_fin: 1 }]) })
    if (url.pathname.endsWith('/listar_reservas_mi_hotel')) return route.fulfill({ headers, body: '[]' })
    if (url.pathname.endsWith('/consultar_operaciones_hotel')) return route.fulfill({ headers, body: JSON.stringify(req.postDataJSON().p_modulo === 'cargos' ? [{ id_cargo: 1, nombre: 'Recepción' }] : req.postDataJSON().p_modulo === 'empleados' ? [{ id_empleado: 7, nombre: 'Persona', apellido: 'Prueba', cargo_id_cargo: 1, cargo: 'Recepción', fecha_ingreso: '2026-01-01' }] : []) })
    if (url.pathname.includes('/rpc/')) {
      const args = req.postDataJSON(); llamadas.push([url.pathname, args])
      if (url.pathname.endsWith('/saldo_informativo_reserva')) { if (args.p_reserva === '2') await new Promise(resolve => setTimeout(resolve, 500)); return route.fulfill({ headers, body: JSON.stringify([{ alojamiento: '200.00', consumos: '20.00', pagos: '100.00', saldo: '120.00', completo: true }]) }) }
      if (url.pathname.endsWith('/actualizar_empleado_sin_historial')) return route.fulfill({ headers, body: JSON.stringify([{ id_empleado: 7 }]) })
      if (url.pathname.endsWith('/registrar_empleado_hotel')) return route.fulfill({ headers, body: JSON.stringify([{ id_empleado: 9, repetido: false }]) })
      if (url.pathname.endsWith('/actualizar_habitacion_sin_historial')) return route.fulfill({ headers, body: JSON.stringify([{ id_habitacion: 1 }]) })
    }
    return route.fulfill({ status: 404, headers, body: '{}' })
  })
  page.on('dialog', dialog => dialog.accept())
  await page.goto('./'); await page.getByRole('button', { name: /Administrador/ }).click(); await page.getByLabel('Correo electrónico').fill('test@example.invalid'); await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local'); await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Atención requerida' })).toBeVisible()
  const menu = page.getByRole('navigation', { name: 'Menú principal' })
  await menu.getByRole('button', { name: 'Reservas', exact: true }).click()
  await page.getByRole('button', { name: 'Consultar saldo de reserva' }).click()
  await page.getByLabel('ID de reserva para saldo').fill('1'); await page.getByRole('button', { name: 'Consultar saldo', exact: true }).click()
  await expect(page.getByText('Saldo: S/ 120.00')).toBeVisible()
  await page.getByLabel('ID de reserva para saldo').fill('2'); await page.getByRole('button', { name: 'Consultar saldo', exact: true }).click()
  await page.getByLabel('ID de reserva para saldo').fill('3'); await page.waitForTimeout(700)
  await expect(page.getByText('Saldo: S/ 120.00')).toHaveCount(0)
  await page.getByRole('button', { name: 'Cerrar ventana' }).click()
  await menu.getByRole('button', { name: 'Empleados', exact: true }).click(); await page.getByRole('button', { name: 'Nuevo empleado' }).click()
  await page.getByLabel('Nombre', { exact: true }).fill('Persona'); await page.getByLabel('Apellido', { exact: true }).fill('Prueba'); await page.getByLabel('Documento', { exact: true }).fill('DOC-DEMO')
  const alta = page.locator('form').filter({ has: page.getByRole('button', { name: 'Registrar empleado' }) }); await alta.getByLabel('Cargo del hotel').selectOption('1'); await alta.getByLabel('Fecha de ingreso').fill('2026-01-01'); await page.getByRole('button', { name: 'Registrar empleado' }).click()
  await expect(page.getByText('Empleado registrado sin cuenta de acceso.')).toBeVisible()
  await menu.getByRole('button', { name: 'Empleados', exact: true }).click()
  await page.getByRole('button', { name: 'Editar empleado' }).click()
  await page.getByLabel('Empleado a modificar').selectOption('7'); await page.getByLabel('Nuevo nombre').fill('Persona nueva'); await page.getByLabel('Documento actual').fill('DOC-DEMO'); await page.getByLabel('Nuevo documento').fill('DOC-DEMO'); await page.getByRole('button', { name: 'Actualizar empleado' }).click()
  await expect(page.getByText('Empleado actualizado sin modificar cuentas de acceso.')).toBeVisible()
  await menu.getByRole('button', { name: 'Habitaciones', exact: true }).click()
  await page.getByRole('button', { name: 'Editar habitación' }).click()
  await page.getByLabel('Habitación a modificar').selectOption('1'); await page.getByLabel('Nuevo número').fill('102'); await page.getByRole('button', { name: 'Actualizar habitación' }).click()
  await expect(page.getByText('Habitación actualizada.')).toBeVisible()
  expect(llamadas).toHaveLength(5)
  expect(llamadas.every(([, args]) => !Object.keys(args).some(k => k.includes('hotel')))).toBe(true)
})
