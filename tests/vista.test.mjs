import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SECCIONES, resumenHabitaciones, validarDatosHotel } from '../src/supabase/vista.js'

const hotel = { hotel: [{ id_hotel: 1 }], habitacion: [{ hotel_id_hotel: 1, estado: 'DISPONIBLE' }], tarifa_habitacion: [{ hotel_id_hotel: 1 }], servicio: [{ hotel_id_hotel: 1 }], tipo_habitacion: [] }

test('el menú solo habilita las secciones con RPC aprobada', () => {
  assert.deepEqual(SECCIONES.filter(s => s.disponible).map(s => s.id), ['dashboard', 'consultas_sql', 'hotel', 'habitacion', 'servicio'])
  for (const id of ['reservas', 'clientes', 'pagos', 'estadias', 'empleados', 'mantenimiento', 'consumos', 'cargos']) assert.equal(SECCIONES.find(s => s.id === id).disponible, false)
})

test('el resumen cuenta solo los estados recibidos', () => {
  assert.deepEqual(resumenHabitaciones([{ estado: 'DISPONIBLE' }, { estado: 'OCUPADA' }, { estado: 'MANTENIMIENTO' }]).map(x => x.valor), [3, 1, 1, 1])
})

test('una respuesta de otro hotel no se muestra, aun si llega por error', () => {
  assert.equal(validarDatosHotel(hotel, 1), true)
  for (const recurso of ['habitacion', 'tarifa_habitacion', 'servicio']) assert.equal(validarDatosHotel({ ...hotel, [recurso]: [{ hotel_id_hotel: 2 }] }, 1), false)
  assert.equal(validarDatosHotel({ ...hotel, hotel: [{ id_hotel: 2 }] }, 1), false)
  assert.equal(validarDatosHotel({ ...hotel, habitacion: [{}] }, 1), false)
})
