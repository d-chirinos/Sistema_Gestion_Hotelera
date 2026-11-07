import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cargosIniciales, clientesIniciales, consumosServiciosIniciales, empleadosIniciales,
  estadiasIniciales, habitacionesIniciales, hotelesIniciales, mantenimientosIniciales,
  pagosIniciales, reservasIniciales, serviciosIniciales, tiposHabitacionIniciales,
} from '../src/data/datosDemostracion.js'

const contiene = (registros, campo, valor) => registros.some(registro => registro[campo] === valor)

test('los datos de demostración conservan las referencias entre registros', () => {
  for (const habitacion of habitacionesIniciales) {
    assert.ok(contiene(hotelesIniciales, 'id_hotel', habitacion.hotel_id_hotel))
    assert.ok(contiene(tiposHabitacionIniciales, 'id_tipo', habitacion.tipo_habitacion_id_tipo))
  }
  for (const empleado of empleadosIniciales) {
    assert.ok(contiene(hotelesIniciales, 'id_hotel', empleado.hotel_id_hotel))
    assert.ok(contiene(cargosIniciales, 'id_cargo', empleado.cargo_id_cargo))
  }
  for (const reserva of reservasIniciales) {
    assert.ok(contiene(clientesIniciales, 'id', reserva.cliente_id_cliente))
    assert.ok(contiene(habitacionesIniciales, 'id', reserva.habitacion_id_habitacion))
  }
  for (const estadia of estadiasIniciales) {
    assert.ok(contiene(reservasIniciales, 'id_reserva', estadia.reserva_id_reserva))
    assert.ok(contiene(empleadosIniciales, 'id', estadia.empleado_id_empleado))
  }
  for (const mantenimiento of mantenimientosIniciales) {
    assert.ok(contiene(habitacionesIniciales, 'id', mantenimiento.habitacion_id_habitacion))
    assert.ok(contiene(empleadosIniciales, 'id', mantenimiento.empleado_id_empleado))
  }
  for (const servicio of serviciosIniciales) assert.ok(contiene(hotelesIniciales, 'id_hotel', servicio.hotel_id_hotel))
  for (const consumo of consumosServiciosIniciales) {
    assert.ok(contiene(estadiasIniciales, 'id_estadia', consumo.estadia_id_estadia))
    assert.ok(contiene(serviciosIniciales, 'id', consumo.servicio_id_servicio))
  }
  for (const pago of pagosIniciales) assert.ok(contiene(estadiasIniciales, 'id_estadia', pago.estadia_id_estadia))
})

test('se conservan los registros de muestra y el acceso de recepción documentado', () => {
  assert.deepEqual(
    [hotelesIniciales, tiposHabitacionIniciales, habitacionesIniciales, reservasIniciales,
      clientesIniciales, cargosIniciales, empleadosIniciales, mantenimientosIniciales,
      serviciosIniciales, consumosServiciosIniciales, estadiasIniciales, pagosIniciales].map(items => items.length),
    [1, 4, 6, 9, 6, 7, 8, 5, 4, 3, 3, 3],
  )
  const ana = empleadosIniciales.find(empleado => empleado.id === 1)
  assert.equal(ana.documento, '80000001')
  assert.equal(cargosIniciales.find(cargo => cargo.id_cargo === ana.cargo_id_cargo)?.nombre, 'Recepcionista')
})
