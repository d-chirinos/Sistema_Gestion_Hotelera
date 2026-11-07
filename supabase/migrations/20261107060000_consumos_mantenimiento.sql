-- Operaciones con identificadores aleatorios en el rango [2^61,2^62), sin cambiar el modelo.
begin;
create function public.registrar_consumo_estadia(p_estadia bigint,p_servicio bigint,p_cantidad integer,p_precio_esperado numeric,p_clave bigint)
returns table(id_consumo text,precio_unitario_aplicado numeric,subtotal numeric,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_habitacion bigint; v_reserva bigint; v_estado_h text; v_estado_r text; v_zona text; v_estadia public.estadia%rowtype; v_servicio public.servicio%rowtype; v_consumo public.consumo_servicio%rowtype;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  if p_clave is null or p_clave<2305843009213693952 or p_clave>=4611686018427387904 or p_cantidad is null or p_cantidad<1 or p_precio_esperado is null or p_precio_esperado='NaN'::numeric or p_precio_esperado<0 or p_precio_esperado>99999999.99 or p_precio_esperado<>trunc(p_precio_esperado,2) then raise exception 'Datos inválidos' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('consumo:'||p_clave::text, 79018));
  select h.id_habitacion,r.id_reserva into v_habitacion,v_reserva from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where e.id_estadia=p_estadia and h.hotel_id_hotel=v_hotel;
  if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
  select h.estado into v_estado_h from public.habitacion h where h.id_habitacion=v_habitacion and h.hotel_id_hotel=v_hotel for update;
  if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
  select r.estado into v_estado_r from public.reserva r where r.id_reserva=v_reserva and r.habitacion_id_habitacion=v_habitacion for update;
  if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
  select e.* into v_estadia from public.estadia e where e.id_estadia=p_estadia and e.reserva_id_reserva=v_reserva for update;
  if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
  select s.* into v_servicio from public.servicio s where s.id_servicio=p_servicio and s.hotel_id_hotel=v_hotel for share;
  if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
  select c.* into v_consumo from public.consumo_servicio c where c.id_consumo=p_clave;
  if found then
    if v_consumo.estadia_id_estadia<>p_estadia or v_consumo.servicio_id_servicio<>p_servicio or v_consumo.cantidad<>p_cantidad or v_consumo.precio_unitario_aplicado<>p_precio_esperado then raise exception 'Operación no disponible' using errcode='22023'; end if;
    return query select v_consumo.id_consumo::text,v_consumo.precio_unitario_aplicado,v_consumo.precio_unitario_aplicado*v_consumo.cantidad,true; return;
  end if;
  if v_servicio.precio<>p_precio_esperado then raise exception 'El precio ha cambiado; actualice los datos' using errcode='40001'; end if;
  select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
  if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Zona horaria no disponible' using errcode='22023'; end if;
  if v_estadia.fecha_checkout is not null or v_estadia.fecha_hora_checkout is not null or v_estadia.fecha_hora_checkin is null or v_estadia.fecha_hora_checkin>clock_timestamp() or (v_estadia.fecha_hora_checkin at time zone v_zona)::date<>v_estadia.fecha_checkin or v_estadia.empleado_id_empleado is null or not exists(select 1 from public.empleado emp where emp.id_empleado=v_estadia.empleado_id_empleado and emp.hotel_id_hotel=v_hotel) or v_estado_h<>'OCUPADA' or v_estado_r<>'CONFIRMADA' or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=v_habitacion and m.fecha_fin is null) or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=v_habitacion and e.fecha_checkout is null and e.id_estadia<>p_estadia) then raise exception 'La estadía requiere revisión' using errcode='22023'; end if;
  insert into public.consumo_servicio(id_consumo,estadia_id_estadia,servicio_id_servicio,cantidad,precio_unitario_aplicado) values(p_clave,p_estadia,p_servicio,p_cantidad,v_servicio.precio) returning * into v_consumo;
  return query select v_consumo.id_consumo::text,v_consumo.precio_unitario_aplicado,v_consumo.precio_unitario_aplicado*v_consumo.cantidad,false;
end $$;

create function public.iniciar_mantenimiento_hotel(p_habitacion bigint,p_tipo text,p_clave bigint)
returns table(id_mantenimiento text,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_empleado bigint; v_estado text; v_tipo text; v_zona text; v_hoy date; v_m public.mantenimiento%rowtype;
begin
 select e.hotel_id_hotel,e.id_empleado into v_hotel,v_empleado from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_tipo:=btrim(p_tipo);
 if p_clave is null or p_clave<2305843009213693952 or p_clave>=4611686018427387904 or v_tipo is null or v_tipo='' then raise exception 'Datos inválidos' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('mantenimiento:'||p_clave::text,79018));
 select h.estado into v_estado from public.habitacion h where h.id_habitacion=p_habitacion and h.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'Habitación no disponible' using errcode='22023'; end if;
 select m.* into v_m from public.mantenimiento m where m.id_mantenimiento=p_clave;
 if found then
  if v_m.habitacion_id_habitacion<>p_habitacion or v_m.empleado_id_empleado<>v_empleado or v_m.tipo<>v_tipo then raise exception 'Operación no disponible' using errcode='22023'; end if;
  return query select v_m.id_mantenimiento::text,true; return;
 end if;
 select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
 if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Zona horaria no disponible' using errcode='22023'; end if;
 v_hoy:=(clock_timestamp() at time zone v_zona)::date;
 if v_estado<>'DISPONIBLE' or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=p_habitacion and m.fecha_fin is null) or exists(select 1 from public.reserva r where r.habitacion_id_habitacion=p_habitacion and r.estado='CONFIRMADA' and r.fecha_salida>v_hoy) or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=p_habitacion and e.fecha_checkout is null) then raise exception 'Habitación requiere revisión' using errcode='22023'; end if;
 insert into public.mantenimiento(id_mantenimiento,habitacion_id_habitacion,empleado_id_empleado,fecha_inicio,tipo) values(p_clave,p_habitacion,v_empleado,v_hoy,v_tipo) returning * into v_m;
 update public.habitacion set estado='MANTENIMIENTO' where id_habitacion=p_habitacion;
 return query select v_m.id_mantenimiento::text,false;
end $$;

create function public.finalizar_mantenimiento_hotel(p_id bigint,p_costo numeric,p_confirmacion boolean)
returns table(id_mantenimiento text,fecha_fin date,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_habitacion bigint; v_estado text; v_zona text; v_hoy date; v_m public.mantenimiento%rowtype;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 if p_confirmacion is distinct from true or p_id is null or p_id<2305843009213693952 or p_id>=4611686018427387904 or p_costo is null or p_costo='NaN'::numeric or p_costo<0 or p_costo>99999999.99 or p_costo<>trunc(p_costo,2) then raise exception 'Datos inválidos' using errcode='22023'; end if;
 select h.id_habitacion into v_habitacion from public.mantenimiento m join public.habitacion h on h.id_habitacion=m.habitacion_id_habitacion where m.id_mantenimiento=p_id and h.hotel_id_hotel=v_hotel;
 if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
 select h.estado into v_estado from public.habitacion h where h.id_habitacion=v_habitacion and h.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
 select m.* into v_m from public.mantenimiento m where m.id_mantenimiento=p_id and m.habitacion_id_habitacion=v_habitacion for update;
 if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
 if v_m.fecha_fin is not null then
   if v_m.costo is distinct from p_costo then raise exception 'Operación no disponible' using errcode='22023'; end if;
   return query select v_m.id_mantenimiento::text,v_m.fecha_fin,true; return;
 end if;
 if v_estado<>'MANTENIMIENTO' or v_m.costo is not null then raise exception 'La intervención requiere revisión' using errcode='22023'; end if;
 select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
 if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Zona horaria no disponible' using errcode='22023'; end if;
 v_hoy:=(clock_timestamp() at time zone v_zona)::date;
 if v_hoy<v_m.fecha_inicio then raise exception 'Fechas requieren revisión' using errcode='22023'; end if;
 update public.mantenimiento m set fecha_fin=v_hoy,costo=p_costo where m.id_mantenimiento=p_id returning m.* into v_m;
 return query select v_m.id_mantenimiento::text,v_m.fecha_fin,false;
end $$;

create function public.liberar_habitacion_mantenimiento(p_habitacion bigint)
returns table(id_habitacion bigint,estado text)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_estado text;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 select h.estado into v_estado from public.habitacion h where h.id_habitacion=p_habitacion and h.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'Habitación no disponible' using errcode='22023'; end if;
 if v_estado<>'MANTENIMIENTO' or not exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=p_habitacion and m.fecha_fin is not null and m.costo is not null) or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=p_habitacion and m.fecha_fin is null) or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=p_habitacion and e.fecha_checkout is null) then raise exception 'Habitación requiere revisión' using errcode='22023'; end if;
 update public.habitacion h set estado='DISPONIBLE' where h.id_habitacion=p_habitacion;
 return query select p_habitacion,'DISPONIBLE'::text;
end $$;
revoke all on function public.registrar_consumo_estadia(bigint,bigint,integer,numeric,bigint) from public,anon,authenticated;
revoke all on function public.iniciar_mantenimiento_hotel(bigint,text,bigint) from public,anon,authenticated;
revoke all on function public.finalizar_mantenimiento_hotel(bigint,numeric,boolean) from public,anon,authenticated;
revoke all on function public.liberar_habitacion_mantenimiento(bigint) from public,anon,authenticated;
grant execute on function public.registrar_consumo_estadia(bigint,bigint,integer,numeric,bigint) to authenticated;
grant execute on function public.iniciar_mantenimiento_hotel(bigint,text,bigint) to authenticated;
grant execute on function public.finalizar_mantenimiento_hotel(bigint,numeric,boolean) to authenticated;
grant execute on function public.liberar_habitacion_mantenimiento(bigint) to authenticated;
-- Identificadores grandes se serializan como texto para no perder precisión en JavaScript.
create or replace function public.consultar_operaciones_hotel(p_modulo text)
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
        select c.id_consumo::text as id_consumo,c.estadia_id_estadia,s.nombre as servicio,c.cantidad,c.precio_unitario_aplicado,
               c.cantidad*c.precio_unitario_aplicado as subtotal
        from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia
        join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion
        join public.servicio s on s.id_servicio=c.servicio_id_servicio and s.hotel_id_hotel=h.hotel_id_hotel
        where h.hotel_id_hotel=v_hotel order by c.id_consumo) x;
    when 'mantenimiento' then
      return query select to_jsonb(x) from (
        select m.id_mantenimiento::text as id_mantenimiento,h.numero as habitacion_numero,emp.id_empleado as empleado_id_empleado,
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
commit;
