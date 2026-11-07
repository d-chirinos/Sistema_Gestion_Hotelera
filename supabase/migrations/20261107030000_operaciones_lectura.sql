-- Lecturas administrativas por hotel; sin permisos directos a tablas.
begin;
create function public.consultar_operaciones_hotel(p_modulo text)
returns setof jsonb language plpgsql stable security definer
set search_path = pg_catalog
as $$
declare v_hotel bigint;
begin
  select e.hotel_id_hotel into v_hotel
  from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR';
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  case p_modulo
    when 'estadias' then
      return query select to_jsonb(x) from (
        select e.id_estadia,e.reserva_id_reserva,h.numero as habitacion_numero,
               emp.id_empleado as empleado_id_empleado,e.fecha_checkin,e.fecha_hora_checkin,e.fecha_checkout,e.fecha_hora_checkout
        from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva
        join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion
        left join public.empleado emp on emp.id_empleado=e.empleado_id_empleado and emp.hotel_id_hotel=h.hotel_id_hotel
        where h.hotel_id_hotel=v_hotel order by e.id_estadia) x;
    when 'pagos' then
      return query select to_jsonb(x) from (
        select p.id_pago,p.reserva_id_reserva,p.fecha_pago,p.fecha_hora_pago,p.tipo_pago,p.monto,p.metodo_pago
        from public.pago p join public.reserva r on r.id_reserva=p.reserva_id_reserva
        join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion
        where h.hotel_id_hotel=v_hotel order by p.id_pago) x;
    when 'consumos' then
      return query select to_jsonb(x) from (
        select c.id_consumo,c.estadia_id_estadia,s.nombre as servicio,c.cantidad,c.precio_unitario_aplicado,
               c.cantidad*c.precio_unitario_aplicado as subtotal
        from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia
        join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion
        join public.servicio s on s.id_servicio=c.servicio_id_servicio and s.hotel_id_hotel=h.hotel_id_hotel
        where h.hotel_id_hotel=v_hotel order by c.id_consumo) x;
    when 'mantenimiento' then
      return query select to_jsonb(x) from (
        select m.id_mantenimiento,h.numero as habitacion_numero,emp.id_empleado as empleado_id_empleado,
               m.fecha_inicio,m.fecha_fin,m.tipo,m.costo
        from public.mantenimiento m join public.habitacion h on h.id_habitacion=m.habitacion_id_habitacion
        left join public.empleado emp on emp.id_empleado=m.empleado_id_empleado and emp.hotel_id_hotel=h.hotel_id_hotel
        where h.hotel_id_hotel=v_hotel order by m.id_mantenimiento) x;
    when 'empleados' then
      return query select to_jsonb(x) from (
        select e.id_empleado,e.nombre,e.apellido,e.cargo_id_cargo,c.nombre as cargo,e.fecha_ingreso
        from public.empleado e join public.cargo c on c.id_cargo=e.cargo_id_cargo
        where e.hotel_id_hotel=v_hotel order by e.id_empleado) x;
    when 'cargos' then
      return query select to_jsonb(x) from (
        select c.id_cargo,c.nombre from public.cargo c
        where exists(select 1 from public.empleado e where e.cargo_id_cargo=c.id_cargo and e.hotel_id_hotel=v_hotel)
        order by c.id_cargo) x;
    else raise exception 'Recurso no permitido' using errcode='22023';
  end case;
end;
$$;
revoke all on function public.consultar_operaciones_hotel(text) from public, anon, authenticated;
grant execute on function public.consultar_operaciones_hotel(text) to authenticated;
commit;
