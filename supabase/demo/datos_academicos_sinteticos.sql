-- DATOS ACADÉMICOS SINTÉTICOS: solo para una base de pruebas vacía.
-- No es migración, no crea usuarios Auth ni cuentas de empleado.
begin;
lock table public.hotel, public.cargo, public.tipo_habitacion, public.cliente, public.empleado, public.habitacion, public.tarifa_habitacion, public.servicio, public.reserva, public.estadia, public.mantenimiento, public.pago, public.consumo_servicio, public.cuenta_empleado in access exclusive mode;
do $$ begin
  if exists (select 1 from public.hotel) or
     exists (select 1 from public.cargo) or
     exists (select 1 from public.tipo_habitacion) or
     exists (select 1 from public.cliente) or
     exists (select 1 from public.empleado) or
     exists (select 1 from public.habitacion) or
     exists (select 1 from public.tarifa_habitacion) or
     exists (select 1 from public.servicio) or
     exists (select 1 from public.reserva) or
     exists (select 1 from public.estadia) or
     exists (select 1 from public.mantenimiento) or
     exists (select 1 from public.pago) or
     exists (select 1 from public.consumo_servicio) or
     exists (select 1 from public.cuenta_empleado) then
    raise exception 'Carga cancelada: el esquema hotelero debe estar vacío';
  end if;
end $$;

insert into public.hotel (id_hotel, nombre, direccion, ciudad, pais, zona_horaria) values
  (1, 'Hotel Sintético Lima', 'Calle Ficticia 001', 'Lima', 'Perú', 'America/Lima'),
  (2, 'Hotel Sintético México', 'Avenida Ficticia 002', 'Ciudad de México', 'México', 'America/Mexico_City');

insert into public.cargo (id_cargo, nombre, salario_base) values
  (1, 'Administración', 2400),
  (2, 'Recepción', 1800),
  (3, 'Mantenimiento', 1700),
  (4, 'Servicios', 1600);

insert into public.tipo_habitacion (id_tipo, nombre, descripcion, capacidad) values
  (1, 'Individual', 'Escenario sintético', 1),
  (2, 'Doble', 'Escenario sintético', 2),
  (3, 'Familiar', 'Escenario sintético', 4),
  (4, 'Suite', 'Escenario sintético', 2);

insert into public.cliente (id_cliente, nombre, apellido, tipo_documento, pais_emisor_documento, documento, email) values
  (1, 'Cliente', 'Sintético 01', 'DEMO', 'SINTETICO', 'DEMO-CLI-001', 'cliente01@example.invalid'),
  (2, 'Cliente', 'Sintético 02', 'DEMO', 'SINTETICO', 'DEMO-CLI-002', 'cliente02@example.invalid'),
  (3, 'Cliente', 'Sintético 03', 'DEMO', 'SINTETICO', 'DEMO-CLI-003', 'cliente03@example.invalid'),
  (4, 'Cliente', 'Sintético 04', 'DEMO', 'SINTETICO', 'DEMO-CLI-004', 'cliente04@example.invalid'),
  (5, 'Cliente', 'Sintético 05', 'DEMO', 'SINTETICO', 'DEMO-CLI-005', 'cliente05@example.invalid'),
  (6, 'Cliente', 'Sintético 06', 'DEMO', 'SINTETICO', 'DEMO-CLI-006', 'cliente06@example.invalid'),
  (7, 'Cliente', 'Sintético 07', 'DEMO', 'SINTETICO', 'DEMO-CLI-007', 'cliente07@example.invalid'),
  (8, 'Cliente', 'Sintético 08', 'DEMO', 'SINTETICO', 'DEMO-CLI-008', 'cliente08@example.invalid'),
  (9, 'Cliente', 'Sintético 09', 'DEMO', 'SINTETICO', 'DEMO-CLI-009', 'cliente09@example.invalid'),
  (10, 'Cliente', 'Sintético 10', 'DEMO', 'SINTETICO', 'DEMO-CLI-010', 'cliente10@example.invalid'),
  (11, 'Cliente', 'Sintético 11', 'DEMO', 'SINTETICO', 'DEMO-CLI-011', 'cliente11@example.invalid'),
  (12, 'Cliente', 'Sintético 12', 'DEMO', 'SINTETICO', 'DEMO-CLI-012', 'cliente12@example.invalid');

insert into public.empleado (id_empleado, hotel_id_hotel, cargo_id_cargo, nombre, apellido, documento, fecha_ingreso) values
  (1, 1, 1, 'Empleado', 'Sintético 01', 'DEMO-EMP-001', date '2020-01-01'),
  (2, 1, 2, 'Empleado', 'Sintético 02', 'DEMO-EMP-002', date '2020-01-01'),
  (3, 1, 3, 'Empleado', 'Sintético 03', 'DEMO-EMP-003', date '2020-01-01'),
  (4, 1, 4, 'Empleado', 'Sintético 04', 'DEMO-EMP-004', date '2020-01-01'),
  (5, 2, 1, 'Empleado', 'Sintético 05', 'DEMO-EMP-005', date '2020-01-01'),
  (6, 2, 2, 'Empleado', 'Sintético 06', 'DEMO-EMP-006', date '2020-01-01'),
  (7, 2, 3, 'Empleado', 'Sintético 07', 'DEMO-EMP-007', date '2020-01-01'),
  (8, 2, 4, 'Empleado', 'Sintético 08', 'DEMO-EMP-008', date '2020-01-01');

insert into public.habitacion (id_habitacion, hotel_id_hotel, tipo_habitacion_id_tipo, numero, piso, estado) values
  (1, 1, 1, 'D-001', 1, 'DISPONIBLE'),
  (2, 1, 2, 'D-002', 1, 'DISPONIBLE'),
  (3, 1, 3, 'D-003', 1, 'OCUPADA'),
  (4, 1, 4, 'D-004', 1, 'DISPONIBLE'),
  (5, 1, 1, 'D-005', 1, 'DISPONIBLE'),
  (6, 1, 2, 'D-006', 1, 'MANTENIMIENTO'),
  (7, 2, 1, 'D-001', 1, 'DISPONIBLE'),
  (8, 2, 2, 'D-002', 1, 'DISPONIBLE'),
  (9, 2, 3, 'D-003', 1, 'OCUPADA'),
  (10, 2, 4, 'D-004', 1, 'DISPONIBLE'),
  (11, 2, 1, 'D-005', 1, 'DISPONIBLE'),
  (12, 2, 2, 'D-006', 1, 'MANTENIMIENTO');

insert into public.tarifa_habitacion (id_tarifa, hotel_id_hotel, tipo_habitacion_id_tipo, precio_noche) values
  (1, 1, 1, 100),
  (2, 1, 2, 150),
  (3, 1, 3, 200),
  (4, 1, 4, 250),
  (5, 2, 1, 100),
  (6, 2, 2, 150),
  (7, 2, 3, 200),
  (8, 2, 4, 250);

insert into public.servicio (id_servicio, hotel_id_hotel, nombre, precio) values
  (1, 1, 'Agua demo', 0),
  (2, 1, 'Lavandería demo', 20),
  (3, 1, 'Desayuno demo', 15),
  (4, 1, 'Traslado demo', 30),
  (5, 2, 'Agua demo', 0),
  (6, 2, 'Lavandería demo', 20),
  (7, 2, 'Desayuno demo', 15),
  (8, 2, 'Traslado demo', 30);

insert into public.reserva (id_reserva, cliente_id_cliente, habitacion_id_habitacion, fecha_entrada, fecha_salida, estado, total_estimado, fecha_reserva) values
  (1, 1, 1, ((current_timestamp at time zone 'America/Lima')::date -40), ((current_timestamp at time zone 'America/Lima')::date -37), 'COMPLETADA', 300, ((current_timestamp at time zone 'America/Lima')::date -50)),
  (2, 2, 2, ((current_timestamp at time zone 'America/Lima')::date -30), ((current_timestamp at time zone 'America/Lima')::date -28), 'COMPLETADA', 300, ((current_timestamp at time zone 'America/Lima')::date -40)),
  (3, 3, 7, ((current_timestamp at time zone 'America/Mexico_City')::date -40), ((current_timestamp at time zone 'America/Mexico_City')::date -37), 'COMPLETADA', 300, ((current_timestamp at time zone 'America/Mexico_City')::date -50)),
  (4, 4, 8, ((current_timestamp at time zone 'America/Mexico_City')::date -30), ((current_timestamp at time zone 'America/Mexico_City')::date -28), 'COMPLETADA', 300, ((current_timestamp at time zone 'America/Mexico_City')::date -40)),
  (5, 5, 3, ((current_timestamp at time zone 'America/Lima')::date -3), ((current_timestamp at time zone 'America/Lima')::date +2), 'CONFIRMADA', 1000, ((current_timestamp at time zone 'America/Lima')::date -13)),
  (6, 6, 9, ((current_timestamp at time zone 'America/Mexico_City')::date -2), ((current_timestamp at time zone 'America/Mexico_City')::date +3), 'CONFIRMADA', 1000, ((current_timestamp at time zone 'America/Mexico_City')::date -12)),
  (7, 2, 1, ((current_timestamp at time zone 'America/Lima')::date +15), ((current_timestamp at time zone 'America/Lima')::date +17), 'CONFIRMADA', 200, ((current_timestamp at time zone 'America/Lima')::date -5)),
  (8, 3, 2, ((current_timestamp at time zone 'America/Lima')::date +15), ((current_timestamp at time zone 'America/Lima')::date +17), 'CONFIRMADA', 300, ((current_timestamp at time zone 'America/Lima')::date -5)),
  (9, 4, 3, ((current_timestamp at time zone 'America/Lima')::date +15), ((current_timestamp at time zone 'America/Lima')::date +17), 'CONFIRMADA', 400, ((current_timestamp at time zone 'America/Lima')::date -5)),
  (10, 5, 4, ((current_timestamp at time zone 'America/Lima')::date +15), ((current_timestamp at time zone 'America/Lima')::date +17), 'CONFIRMADA', 500, ((current_timestamp at time zone 'America/Lima')::date -5)),
  (11, 6, 5, ((current_timestamp at time zone 'America/Lima')::date +15), ((current_timestamp at time zone 'America/Lima')::date +17), 'CONFIRMADA', 200, ((current_timestamp at time zone 'America/Lima')::date -5)),
  (12, 7, 6, ((current_timestamp at time zone 'America/Lima')::date +15), ((current_timestamp at time zone 'America/Lima')::date +17), 'CANCELADA', 300, ((current_timestamp at time zone 'America/Lima')::date -5)),
  (13, 8, 7, ((current_timestamp at time zone 'America/Mexico_City')::date +15), ((current_timestamp at time zone 'America/Mexico_City')::date +17), 'CONFIRMADA', 200, ((current_timestamp at time zone 'America/Mexico_City')::date -5)),
  (14, 9, 8, ((current_timestamp at time zone 'America/Mexico_City')::date +15), ((current_timestamp at time zone 'America/Mexico_City')::date +17), 'CONFIRMADA', 300, ((current_timestamp at time zone 'America/Mexico_City')::date -5)),
  (15, 10, 9, ((current_timestamp at time zone 'America/Mexico_City')::date +15), ((current_timestamp at time zone 'America/Mexico_City')::date +17), 'CONFIRMADA', 400, ((current_timestamp at time zone 'America/Mexico_City')::date -5)),
  (16, 11, 10, ((current_timestamp at time zone 'America/Mexico_City')::date +15), ((current_timestamp at time zone 'America/Mexico_City')::date +17), 'CONFIRMADA', 500, ((current_timestamp at time zone 'America/Mexico_City')::date -5)),
  (17, 12, 11, ((current_timestamp at time zone 'America/Mexico_City')::date +15), ((current_timestamp at time zone 'America/Mexico_City')::date +17), 'CONFIRMADA', 200, ((current_timestamp at time zone 'America/Mexico_City')::date -5)),
  (18, 1, 12, ((current_timestamp at time zone 'America/Mexico_City')::date +15), ((current_timestamp at time zone 'America/Mexico_City')::date +17), 'CANCELADA', 300, ((current_timestamp at time zone 'America/Mexico_City')::date -5));

insert into public.estadia (id_estadia, reserva_id_reserva, empleado_id_empleado, fecha_checkin, fecha_hora_checkin, fecha_checkout, fecha_hora_checkout) values
  (1, 1, 2, ((current_timestamp at time zone 'America/Lima')::date -40), ((((current_timestamp at time zone 'America/Lima')::date -40) + time '10:00') at time zone 'America/Lima'), ((current_timestamp at time zone 'America/Lima')::date -37), ((((current_timestamp at time zone 'America/Lima')::date -37) + time '11:00') at time zone 'America/Lima')),
  (2, 2, 2, ((current_timestamp at time zone 'America/Lima')::date -30), ((((current_timestamp at time zone 'America/Lima')::date -30) + time '10:00') at time zone 'America/Lima'), ((current_timestamp at time zone 'America/Lima')::date -28), ((((current_timestamp at time zone 'America/Lima')::date -28) + time '11:00') at time zone 'America/Lima')),
  (3, 3, 6, ((current_timestamp at time zone 'America/Mexico_City')::date -40), ((((current_timestamp at time zone 'America/Mexico_City')::date -40) + time '10:00') at time zone 'America/Mexico_City'), ((current_timestamp at time zone 'America/Mexico_City')::date -37), ((((current_timestamp at time zone 'America/Mexico_City')::date -37) + time '11:00') at time zone 'America/Mexico_City')),
  (4, 4, 6, ((current_timestamp at time zone 'America/Mexico_City')::date -30), ((((current_timestamp at time zone 'America/Mexico_City')::date -30) + time '10:00') at time zone 'America/Mexico_City'), ((current_timestamp at time zone 'America/Mexico_City')::date -28), ((((current_timestamp at time zone 'America/Mexico_City')::date -28) + time '11:00') at time zone 'America/Mexico_City')),
  (5, 5, 2, ((current_timestamp at time zone 'America/Lima')::date -3), ((((current_timestamp at time zone 'America/Lima')::date -3) + time '10:00') at time zone 'America/Lima'), null, null),
  (6, 6, 6, ((current_timestamp at time zone 'America/Mexico_City')::date -2), ((((current_timestamp at time zone 'America/Mexico_City')::date -2) + time '10:00') at time zone 'America/Mexico_City'), null, null);

insert into public.mantenimiento (id_mantenimiento, habitacion_id_habitacion, empleado_id_empleado, fecha_inicio, fecha_fin, tipo, costo) values
  (1, 4, 3, ((current_timestamp at time zone 'America/Lima')::date -18), ((current_timestamp at time zone 'America/Lima')::date -17), 'Revisión sintética', 50),
  (2, 10, 7, ((current_timestamp at time zone 'America/Mexico_City')::date -18), ((current_timestamp at time zone 'America/Mexico_City')::date -17), 'Revisión sintética', 0),
  (3, 6, 3, ((current_timestamp at time zone 'America/Lima')::date -1), null, 'Mantenimiento sintético en curso', null),
  (4, 12, 7, ((current_timestamp at time zone 'America/Mexico_City')::date -1), null, 'Mantenimiento sintético en curso', null);

insert into public.pago (id_pago, reserva_id_reserva, fecha_pago, fecha_hora_pago, tipo_pago, monto, metodo_pago, clave_idempotencia) values
  (1, 1, ((current_timestamp at time zone 'America/Lima')::date -47), ((((current_timestamp at time zone 'America/Lima')::date -47) + time '12:00') at time zone 'America/Lima'), 'ADELANTO', 50, 'SIMULADO', '00000000-0000-4000-8000-000000000001'),
  (2, 1, ((current_timestamp at time zone 'America/Lima')::date -39), ((((current_timestamp at time zone 'America/Lima')::date -39) + time '12:00') at time zone 'America/Lima'), 'ORDINARIO', 25, 'SIMULADO', '00000000-0000-4000-8000-000000000002'),
  (3, 2, ((current_timestamp at time zone 'America/Lima')::date -37), ((((current_timestamp at time zone 'America/Lima')::date -37) + time '12:00') at time zone 'America/Lima'), 'ADELANTO', 50, 'SIMULADO', '00000000-0000-4000-8000-000000000003'),
  (4, 2, ((current_timestamp at time zone 'America/Lima')::date -29), ((((current_timestamp at time zone 'America/Lima')::date -29) + time '12:00') at time zone 'America/Lima'), 'ORDINARIO', 25, 'SIMULADO', '00000000-0000-4000-8000-000000000004'),
  (5, 3, ((current_timestamp at time zone 'America/Mexico_City')::date -47), ((((current_timestamp at time zone 'America/Mexico_City')::date -47) + time '12:00') at time zone 'America/Mexico_City'), 'ADELANTO', 50, 'SIMULADO', '00000000-0000-4000-8000-000000000005'),
  (6, 3, ((current_timestamp at time zone 'America/Mexico_City')::date -39), ((((current_timestamp at time zone 'America/Mexico_City')::date -39) + time '12:00') at time zone 'America/Mexico_City'), 'ORDINARIO', 25, 'SIMULADO', '00000000-0000-4000-8000-000000000006'),
  (7, 4, ((current_timestamp at time zone 'America/Mexico_City')::date -37), ((((current_timestamp at time zone 'America/Mexico_City')::date -37) + time '12:00') at time zone 'America/Mexico_City'), 'ADELANTO', 50, 'SIMULADO', '00000000-0000-4000-8000-000000000007'),
  (8, 4, ((current_timestamp at time zone 'America/Mexico_City')::date -29), ((((current_timestamp at time zone 'America/Mexico_City')::date -29) + time '12:00') at time zone 'America/Mexico_City'), 'ORDINARIO', 25, 'SIMULADO', '00000000-0000-4000-8000-000000000008'),
  (9, 5, ((current_timestamp at time zone 'America/Lima')::date -10), ((((current_timestamp at time zone 'America/Lima')::date -10) + time '12:00') at time zone 'America/Lima'), 'ADELANTO', 50, 'SIMULADO', '00000000-0000-4000-8000-000000000009'),
  (10, 5, ((current_timestamp at time zone 'America/Lima')::date -2), ((((current_timestamp at time zone 'America/Lima')::date -2) + time '12:00') at time zone 'America/Lima'), 'ORDINARIO', 25, 'SIMULADO', '00000000-0000-4000-8000-000000000010'),
  (11, 6, ((current_timestamp at time zone 'America/Mexico_City')::date -9), ((((current_timestamp at time zone 'America/Mexico_City')::date -9) + time '12:00') at time zone 'America/Mexico_City'), 'ADELANTO', 50, 'SIMULADO', '00000000-0000-4000-8000-000000000011'),
  (12, 6, ((current_timestamp at time zone 'America/Mexico_City')::date -1), ((((current_timestamp at time zone 'America/Mexico_City')::date -1) + time '12:00') at time zone 'America/Mexico_City'), 'ORDINARIO', 25, 'SIMULADO', '00000000-0000-4000-8000-000000000012');

insert into public.consumo_servicio (id_consumo, estadia_id_estadia, servicio_id_servicio, cantidad, precio_unitario_aplicado) values
  (1, 1, 1, 2, 0),
  (2, 1, 2, 1, 20),
  (3, 2, 3, 2, 15),
  (4, 3, 5, 2, 0),
  (5, 3, 6, 1, 20),
  (6, 4, 7, 2, 15),
  (7, 5, 2, 1, 20),
  (8, 6, 6, 1, 20);

select setval(pg_get_serial_sequence('public.hotel', 'id_hotel'), greatest((select last_value from public.hotel_id_hotel_seq), (select max(id_hotel) from public.hotel)), true);
select setval(pg_get_serial_sequence('public.cargo', 'id_cargo'), greatest((select last_value from public.cargo_id_cargo_seq), (select max(id_cargo) from public.cargo)), true);
select setval(pg_get_serial_sequence('public.tipo_habitacion', 'id_tipo'), greatest((select last_value from public.tipo_habitacion_id_tipo_seq), (select max(id_tipo) from public.tipo_habitacion)), true);
select setval(pg_get_serial_sequence('public.cliente', 'id_cliente'), greatest((select last_value from public.cliente_id_cliente_seq), (select max(id_cliente) from public.cliente)), true);
select setval(pg_get_serial_sequence('public.empleado', 'id_empleado'), greatest((select last_value from public.empleado_id_empleado_seq), (select max(id_empleado) from public.empleado)), true);
select setval(pg_get_serial_sequence('public.habitacion', 'id_habitacion'), greatest((select last_value from public.habitacion_id_habitacion_seq), (select max(id_habitacion) from public.habitacion)), true);
select setval(pg_get_serial_sequence('public.tarifa_habitacion', 'id_tarifa'), greatest((select last_value from public.tarifa_habitacion_id_tarifa_seq), (select max(id_tarifa) from public.tarifa_habitacion)), true);
select setval(pg_get_serial_sequence('public.servicio', 'id_servicio'), greatest((select last_value from public.servicio_id_servicio_seq), (select max(id_servicio) from public.servicio)), true);
select setval(pg_get_serial_sequence('public.reserva', 'id_reserva'), greatest((select last_value from public.reserva_id_reserva_seq), (select max(id_reserva) from public.reserva)), true);
select setval(pg_get_serial_sequence('public.estadia', 'id_estadia'), greatest((select last_value from public.estadia_id_estadia_seq), (select max(id_estadia) from public.estadia)), true);
select setval(pg_get_serial_sequence('public.mantenimiento', 'id_mantenimiento'), greatest((select last_value from public.mantenimiento_id_mantenimiento_seq), (select max(id_mantenimiento) from public.mantenimiento)), true);
select setval(pg_get_serial_sequence('public.pago', 'id_pago'), greatest((select last_value from public.pago_id_pago_seq), (select max(id_pago) from public.pago)), true);
select setval(pg_get_serial_sequence('public.consumo_servicio', 'id_consumo'), greatest((select last_value from public.consumo_servicio_id_consumo_seq), (select max(id_consumo) from public.consumo_servicio)), true);
commit;
