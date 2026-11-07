-- Operaciones para situaciones inequívocas; los históricos ambiguos se dejan sin cambios.
begin;
create function public.registrar_checkin(p_reserva_id bigint)
returns table(id_estadia bigint, fecha_hora_checkin timestamptz)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_empleado bigint; v_habitacion bigint; v_estado text; v_reserva public.reserva%rowtype; v_zona text; v_ahora timestamptz; v_estadia public.estadia%rowtype;
begin
  select e.hotel_id_hotel,e.id_empleado into v_hotel,v_empleado from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
    where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  select h.id_habitacion into v_habitacion from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where r.id_reserva=p_reserva_id and h.hotel_id_hotel=v_hotel;
  if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
  select h.estado into v_estado from public.habitacion h where h.id_habitacion=v_habitacion and h.hotel_id_hotel=v_hotel for update;
  if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
  select r.* into v_reserva from public.reserva r where r.id_reserva=p_reserva_id and r.habitacion_id_habitacion=v_habitacion for update;
  if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
  if v_reserva.estado<>'CONFIRMADA' or v_estado<>'DISPONIBLE' or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=v_habitacion and m.fecha_fin is null) or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=v_habitacion and e.fecha_checkout is null) or exists(select 1 from public.estadia e where e.reserva_id_reserva=p_reserva_id) then
    raise exception 'La reserva o habitación requiere revisión' using errcode='22023'; end if;
  select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
  if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Zona horaria no disponible' using errcode='22023'; end if;
  v_ahora:=clock_timestamp();
  -- Las excepciones a las fechas pactadas quedan fuera de esta operación ordinaria.
  if (v_ahora at time zone v_zona)::date < v_reserva.fecha_entrada or (v_ahora at time zone v_zona)::date >= v_reserva.fecha_salida then raise exception 'Fechas de reserva requieren revisión' using errcode='22023'; end if;
  insert into public.estadia(reserva_id_reserva,empleado_id_empleado,fecha_checkin,fecha_hora_checkin) values(p_reserva_id,v_empleado,(v_ahora at time zone v_zona)::date,v_ahora) returning * into v_estadia;
  update public.habitacion set estado='OCUPADA' where id_habitacion=v_habitacion;
  return query select v_estadia.id_estadia,v_estadia.fecha_hora_checkin;
end $$;

create function public.registrar_checkout(p_estadia_id bigint)
returns table(id_estadia bigint, fecha_hora_checkout timestamptz)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_habitacion bigint; v_reserva_id bigint; v_estado text; v_reserva_estado text; v_estadia public.estadia%rowtype; v_zona text; v_ahora timestamptz;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
    where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  select h.id_habitacion,r.id_reserva into v_habitacion,v_reserva_id from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where e.id_estadia=p_estadia_id and h.hotel_id_hotel=v_hotel;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  select h.estado into v_estado from public.habitacion h where h.id_habitacion=v_habitacion and h.hotel_id_hotel=v_hotel for update;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  select r.estado into v_reserva_estado from public.reserva r where r.id_reserva=v_reserva_id and r.habitacion_id_habitacion=v_habitacion for update;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  select e.* into v_estadia from public.estadia e where e.id_estadia=p_estadia_id and e.reserva_id_reserva=v_reserva_id for update;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  if v_estadia.fecha_checkout is not null or v_estadia.fecha_hora_checkout is not null or v_estadia.fecha_hora_checkin is null or v_estadia.empleado_id_empleado is null or not exists(select 1 from public.empleado emp where emp.id_empleado=v_estadia.empleado_id_empleado and emp.hotel_id_hotel=v_hotel) or v_estado<>'OCUPADA' or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=v_habitacion and m.fecha_fin is null) or v_reserva_estado<>'CONFIRMADA' or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=v_habitacion and e.fecha_checkout is null and e.id_estadia<>p_estadia_id) then
    raise exception 'La estadía requiere revisión administrativa' using errcode='22023'; end if;
  select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
  if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Zona horaria no disponible' using errcode='22023'; end if;
  v_ahora:=clock_timestamp();
  if v_ahora<=v_estadia.fecha_hora_checkin or (v_ahora at time zone v_zona)::date < v_estadia.fecha_checkin or (v_estadia.fecha_hora_checkin at time zone v_zona)::date<>v_estadia.fecha_checkin then raise exception 'Fechas de estadía requieren revisión' using errcode='22023'; end if;
  update public.estadia e set fecha_checkout=(v_ahora at time zone v_zona)::date,fecha_hora_checkout=v_ahora where e.id_estadia=p_estadia_id returning e.* into v_estadia;
  update public.reserva set estado='COMPLETADA' where id_reserva=v_reserva_id;
  update public.habitacion set estado='DISPONIBLE' where id_habitacion=v_habitacion;
  return query select v_estadia.id_estadia,v_estadia.fecha_hora_checkout;
end $$;
revoke all on function public.registrar_checkin(bigint) from public,anon,authenticated;
revoke all on function public.registrar_checkout(bigint) from public,anon,authenticated;
grant execute on function public.registrar_checkin(bigint) to authenticated;
grant execute on function public.registrar_checkout(bigint) to authenticated;
commit;
