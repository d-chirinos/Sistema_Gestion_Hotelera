export const CATALOGO = `Esquema previsto hotel_consultas, con filas siempre limitadas al hotel del administrador:
habitacion(id_habitacion bigint PK, tipo_habitacion_id_tipo bigint FK tipo_habitacion.id_tipo, numero text, piso integer, estado text).
tipo_habitacion(id_tipo bigint PK, nombre text, descripcion text, capacidad integer).
tarifa_habitacion(id_tarifa bigint PK, tipo_habitacion_id_tipo bigint FK tipo_habitacion.id_tipo, precio_noche numeric).
servicio(id_servicio bigint PK, nombre text, precio numeric).
cliente(id_cliente bigint PK, nombre text, apellido text): exclusivamente clientes con reservas en el hotel.
reserva(id_reserva bigint PK, cliente_id_cliente bigint FK cliente.id_cliente, habitacion_id_habitacion bigint FK habitacion.id_habitacion, fecha_reserva date, fecha_entrada date, fecha_salida date, estado text, total_estimado numeric).
estadia(id_estadia bigint PK, reserva_id_reserva bigint FK reserva.id_reserva, empleado_id_empleado bigint FK empleado.id_empleado, fecha_checkin date, fecha_checkout date).
pago(id_pago bigint PK, reserva_id_reserva bigint FK reserva.id_reserva, fecha_pago date, tipo_pago text, monto numeric, metodo_pago text).
consumo_servicio(id_consumo bigint PK, estadia_id_estadia bigint FK estadia.id_estadia, servicio_id_servicio bigint FK servicio.id_servicio, cantidad integer, precio_unitario_aplicado numeric). El subtotal se calcula como cantidad * precio_unitario_aplicado.
empleado(id_empleado bigint PK, cargo_id_cargo bigint FK cargo.id_cargo, nombre text, apellido text, fecha_ingreso date).
cargo(id_cargo bigint PK, nombre text): solamente cargos con empleados del hotel.
mantenimiento(id_mantenimiento bigint PK, habitacion_id_habitacion bigint FK habitacion.id_habitacion, empleado_id_empleado bigint FK empleado.id_empleado, fecha_inicio date, fecha_fin date, tipo text, costo numeric).
No hay documentos, correo, teléfono, salarios, cuenta_empleado ni auth.users. Los importes se interpretan en PEN.`
