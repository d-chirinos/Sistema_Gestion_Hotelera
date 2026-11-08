-- Centro de consultas: vistas filtradas por identidad. Requiere revisión y pruebas antes del despliegue.
begin;
create role hotel_consultas_reader login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create schema hotel_consultas;
revoke all on schema hotel_consultas from public, anon, authenticated;
grant usage on schema hotel_consultas to hotel_consultas_reader;

-- auth.uid() se establece únicamente en la transacción de la Edge Function tras validar el JWT.
-- Las vistas pertenecen al propietario de la migración y no conceden acceso a las tablas base.
create view hotel_consultas.habitacion with (security_barrier=true) as
select h.id_habitacion,h.tipo_habitacion_id_tipo,h.numero,h.piso,h.estado from public.habitacion h
where h.hotel_id_hotel = (select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.tipo_habitacion with (security_barrier=true) as
select t.id_tipo,t.nombre,t.descripcion,t.capacidad from public.tipo_habitacion t
where exists (select 1 from public.habitacion h where h.tipo_habitacion_id_tipo=t.id_tipo and h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR'))
   or exists (select 1 from public.tarifa_habitacion f where f.tipo_habitacion_id_tipo=t.id_tipo and f.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR'));
create view hotel_consultas.tarifa_habitacion with (security_barrier=true) as
select f.id_tarifa,f.tipo_habitacion_id_tipo,f.precio_noche from public.tarifa_habitacion f where f.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.servicio with (security_barrier=true) as
select s.id_servicio,s.nombre,s.precio from public.servicio s where s.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.reserva with (security_barrier=true) as
select r.id_reserva,r.cliente_id_cliente,r.habitacion_id_habitacion,r.fecha_reserva,r.fecha_entrada,r.fecha_salida,r.estado,r.total_estimado from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.cliente with (security_barrier=true) as
select c.id_cliente,c.nombre,c.apellido from public.cliente c where exists (select 1 from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where r.cliente_id_cliente=c.id_cliente and h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR'));
create view hotel_consultas.estadia with (security_barrier=true) as
select s.id_estadia,s.reserva_id_reserva,em.id_empleado as empleado_id_empleado,s.fecha_checkin,s.fecha_checkout from public.estadia s join public.reserva r on r.id_reserva=s.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion left join public.empleado em on em.id_empleado=s.empleado_id_empleado and em.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.pago with (security_barrier=true) as
select p.id_pago,p.reserva_id_reserva,p.fecha_pago,p.tipo_pago,p.monto,p.metodo_pago from public.pago p join public.reserva r on r.id_reserva=p.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.consumo_servicio with (security_barrier=true) as
select c.id_consumo,c.estadia_id_estadia,c.servicio_id_servicio,c.cantidad,c.precio_unitario_aplicado from public.consumo_servicio c join public.estadia s on s.id_estadia=c.estadia_id_estadia join public.reserva r on r.id_reserva=s.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion join public.servicio se on se.id_servicio=c.servicio_id_servicio and se.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.empleado with (security_barrier=true) as
select em.id_empleado,em.cargo_id_cargo,em.nombre,em.apellido,em.fecha_ingreso from public.empleado em where em.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
create view hotel_consultas.cargo with (security_barrier=true) as
select c.id_cargo,c.nombre from public.cargo c where exists (select 1 from public.empleado em where em.cargo_id_cargo=c.id_cargo and em.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR'));
create view hotel_consultas.mantenimiento with (security_barrier=true) as
select m.id_mantenimiento,m.habitacion_id_habitacion,em.id_empleado as empleado_id_empleado,m.fecha_inicio,m.fecha_fin,m.tipo,m.costo from public.mantenimiento m join public.habitacion h on h.id_habitacion=m.habitacion_id_habitacion left join public.empleado em on em.id_empleado=m.empleado_id_empleado and em.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=(select e.hotel_id_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR');
revoke all on all tables in schema hotel_consultas from public, anon, authenticated;
grant select on all tables in schema hotel_consultas to hotel_consultas_reader;
commit;
