-- Escrituras administrativas protegidas; ejecutar solo tras revisión y pruebas.
begin;
create function public.registrar_pago_reserva(p_reserva_id bigint,p_monto numeric,p_metodo text,p_clave uuid)
returns table(id_pago bigint,tipo_pago text,fecha_pago date,fecha_hora_pago timestamptz,monto numeric,metodo_pago text,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog
as $$
declare v_hotel bigint; v_habitacion bigint; v_zona text; v_instante timestamptz; v_checkin timestamptz;
        v_tipo text; v_estado text; v_pago public.pago%rowtype; v_metodo text;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  v_metodo:=btrim(p_metodo);
  if p_clave is null or p_monto is null or p_monto='NaN'::numeric or p_monto<=0 or p_monto>99999999.99 or p_monto<>trunc(p_monto,2) or v_metodo is null or v_metodo='' then
    raise exception 'Datos de pago inválidos' using errcode='22023'; end if;
  -- La misma clave se serializa antes de tocar la reserva y nunca se cambia en un reintento.
  perform pg_advisory_xact_lock(hashtextextended('pago:'||p_clave::text, 72104));
  select h.id_habitacion into v_habitacion from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion
  where r.id_reserva=p_reserva_id and h.hotel_id_hotel=v_hotel;
  if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
  perform 1 from public.habitacion h where h.id_habitacion=v_habitacion and h.hotel_id_hotel=v_hotel for update;
  if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
  select r.estado into v_estado from public.reserva r where r.id_reserva=p_reserva_id and r.habitacion_id_habitacion=v_habitacion for update;
  if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
  select p.* into v_pago from public.pago p where p.clave_idempotencia=p_clave;
  if found then
    if v_pago.reserva_id_reserva<>p_reserva_id or v_pago.monto<>p_monto or v_pago.metodo_pago<>v_metodo then
      raise exception 'No se pudo completar la solicitud' using errcode='22023'; end if;
    return query select v_pago.id_pago,v_pago.tipo_pago,v_pago.fecha_pago,v_pago.fecha_hora_pago,v_pago.monto,v_pago.metodo_pago,true; return;
  end if;
  if v_estado='CANCELADA' then raise exception 'Reserva cancelada requiere revisión administrativa' using errcode='22023'; end if;
  select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
  if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then
    raise exception 'Zona horaria no disponible' using errcode='22023'; end if;
  select e.fecha_hora_checkin into v_checkin from public.estadia e where e.reserva_id_reserva=p_reserva_id for update;
  if (found and v_checkin is null) or (not found and v_estado='COMPLETADA') then raise exception 'El check-in histórico requiere conciliación' using errcode='22023'; end if;
  v_instante:=clock_timestamp();
  v_tipo:=case when v_checkin is null or v_instante<v_checkin then 'ADELANTO' else 'ORDINARIO' end;
  insert into public.pago(reserva_id_reserva,fecha_pago,fecha_hora_pago,tipo_pago,monto,metodo_pago,clave_idempotencia)
  values(p_reserva_id,(v_instante at time zone v_zona)::date,v_instante,v_tipo,p_monto,v_metodo,p_clave) returning * into v_pago;
  return query select v_pago.id_pago,v_pago.tipo_pago,v_pago.fecha_pago,v_pago.fecha_hora_pago,v_pago.monto,v_pago.metodo_pago,false;
end;
$$;

-- Actualizaciones con comparación optimista para no sobrescribir un cambio reciente.
create function public.actualizar_tarifa_hotel(p_tipo_id bigint,p_precio_anterior numeric,p_precio_nuevo numeric)
returns table(id_tarifa bigint,precio_noche numeric) language plpgsql volatile security definer set search_path=pg_catalog
as $$
declare v_hotel bigint; v_tarifa public.tarifa_habitacion%rowtype;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  if p_precio_anterior is null or p_precio_nuevo is null or p_precio_nuevo='NaN'::numeric or p_precio_nuevo<=0 or p_precio_nuevo>99999999.99 or p_precio_nuevo<>trunc(p_precio_nuevo,2) then raise exception 'Precio inválido' using errcode='22023'; end if;
  select t.* into v_tarifa from public.tarifa_habitacion t where t.hotel_id_hotel=v_hotel and t.tipo_habitacion_id_tipo=p_tipo_id for update;
  if not found then raise exception 'Tarifa no disponible' using errcode='22023'; end if;
  if v_tarifa.precio_noche<>p_precio_anterior then raise exception 'La tarifa ha cambiado; actualice los datos' using errcode='40001'; end if;
  update public.tarifa_habitacion t set precio_noche=p_precio_nuevo where t.id_tarifa=v_tarifa.id_tarifa returning t.* into v_tarifa;
  return query select v_tarifa.id_tarifa,v_tarifa.precio_noche;
end;
$$;

create function public.actualizar_precio_servicio(p_servicio_id bigint,p_precio_anterior numeric,p_precio_nuevo numeric)
returns table(id_servicio bigint,precio numeric) language plpgsql volatile security definer set search_path=pg_catalog
as $$
declare v_hotel bigint; v_servicio public.servicio%rowtype;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  if p_precio_anterior is null or p_precio_nuevo is null or p_precio_nuevo='NaN'::numeric or p_precio_nuevo<0 or p_precio_nuevo>99999999.99 or p_precio_nuevo<>trunc(p_precio_nuevo,2) then raise exception 'Precio inválido' using errcode='22023'; end if;
  select s.* into v_servicio from public.servicio s where s.id_servicio=p_servicio_id and s.hotel_id_hotel=v_hotel for update;
  if not found then raise exception 'Servicio no disponible' using errcode='22023'; end if;
  if v_servicio.precio<>p_precio_anterior then raise exception 'El precio ha cambiado; actualice los datos' using errcode='40001'; end if;
  update public.servicio s set precio=p_precio_nuevo where s.id_servicio=v_servicio.id_servicio returning s.* into v_servicio;
  return query select v_servicio.id_servicio,v_servicio.precio;
end;
$$;
revoke all on function public.registrar_pago_reserva(bigint,numeric,text,uuid) from public,anon,authenticated;
revoke all on function public.actualizar_tarifa_hotel(bigint,numeric,numeric) from public,anon,authenticated;
revoke all on function public.actualizar_precio_servicio(bigint,numeric,numeric) from public,anon,authenticated;
grant execute on function public.registrar_pago_reserva(bigint,numeric,text,uuid) to authenticated;
grant execute on function public.actualizar_tarifa_hotel(bigint,numeric,numeric) to authenticated;
grant execute on function public.actualizar_precio_servicio(bigint,numeric,numeric) to authenticated;
commit;
