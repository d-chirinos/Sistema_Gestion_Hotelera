-- Solo clientes con vínculo previo al hotel. No resuelve alta global ni primera visita.
begin;
create function public.listar_clientes_mi_hotel()
returns table(id_cliente bigint,nombre text,apellido text,reservas bigint)
language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR';
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 return query select c.id_cliente,c.nombre,c.apellido,count(*) from public.cliente c join public.reserva r on r.cliente_id_cliente=c.id_cliente join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel group by c.id_cliente,c.nombre,c.apellido order by c.id_cliente;
end $$;

create function public.detalle_cliente_mi_hotel(p_cliente bigint)
returns table(id_cliente bigint,nombre text,apellido text,id_reserva bigint,habitacion_numero text,fecha_entrada date,fecha_salida date,estado text)
language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR';
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 return query select c.id_cliente,c.nombre,c.apellido,r.id_reserva,h.numero,r.fecha_entrada,r.fecha_salida,r.estado from public.cliente c join public.reserva r on r.cliente_id_cliente=c.id_cliente join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where c.id_cliente=p_cliente and h.hotel_id_hotel=v_hotel order by r.id_reserva;
end $$;

-- El ID aleatorio se mantiene dentro del rango entero exacto de JavaScript [2^52,2^53).
create function public.crear_reserva_cliente_conocido(p_cliente bigint,p_habitacion bigint,p_entrada date,p_salida date,p_precio_aceptado numeric,p_clave bigint)
returns table(id_reserva text,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_h public.habitacion%rowtype; v_r public.reserva%rowtype; v_precio numeric; v_total numeric; v_zona text; v_hoy date;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 if p_clave is null or p_clave<4503599627370496 or p_clave>=9007199254740992 or p_entrada is null or p_salida is null or not isfinite(p_entrada) or not isfinite(p_salida) or p_salida<=p_entrada or p_precio_aceptado is null or p_precio_aceptado='NaN'::numeric or p_precio_aceptado<=0 or p_precio_aceptado>99999999.99 or p_precio_aceptado<>trunc(p_precio_aceptado,2) then raise exception 'Datos inválidos' using errcode='22023'; end if;
 v_total:=p_precio_aceptado*(p_salida-p_entrada);
 if v_total>99999999.99 then raise exception 'Datos inválidos' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('reserva-conocido:'||p_clave::text,11771));
 select h.* into v_h from public.habitacion h where h.id_habitacion=p_habitacion and h.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'Operación no disponible' using errcode='22023'; end if;
 -- La misma respuesta para ID inexistente y cliente de otro hotel evita búsqueda global.
 if not exists(select 1 from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where r.cliente_id_cliente=p_cliente and h.hotel_id_hotel=v_hotel) then raise exception 'Operación no disponible' using errcode='22023'; end if;
 select r.* into v_r from public.reserva r where r.id_reserva=p_clave;
 if found then
   if v_r.cliente_id_cliente<>p_cliente or v_r.habitacion_id_habitacion<>p_habitacion or v_r.fecha_entrada<>p_entrada or v_r.fecha_salida<>p_salida or v_r.total_estimado<>v_total then raise exception 'Operación no disponible' using errcode='22023'; end if;
   return query select v_r.id_reserva::text,true; return;
 end if;
 select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
 if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Operación no disponible' using errcode='22023'; end if;
 v_hoy:=(clock_timestamp() at time zone v_zona)::date;
 if p_entrada<v_hoy or v_h.estado<>'DISPONIBLE' or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=p_habitacion and m.fecha_fin is null) or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=p_habitacion and e.fecha_checkout is null) then raise exception 'Operación no disponible' using errcode='22023'; end if;
 select t.precio_noche into v_precio from public.tarifa_habitacion t where t.hotel_id_hotel=v_hotel and t.tipo_habitacion_id_tipo=v_h.tipo_habitacion_id_tipo for share;
 if v_precio is null or v_precio<>p_precio_aceptado then raise exception 'Operación no disponible' using errcode='22023'; end if;
 begin
  insert into public.reserva(id_reserva,cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(p_clave,p_cliente,p_habitacion,p_entrada,p_salida,'CONFIRMADA',v_total,v_hoy);
 exception when exclusion_violation or unique_violation then raise exception 'Operación no disponible' using errcode='22023'; end;
 return query select p_clave::text,false;
end $$;
revoke all on function public.listar_clientes_mi_hotel() from public,anon,authenticated;
revoke all on function public.detalle_cliente_mi_hotel(bigint) from public,anon,authenticated;
revoke all on function public.crear_reserva_cliente_conocido(bigint,bigint,date,date,numeric,bigint) from public,anon,authenticated;
grant execute on function public.listar_clientes_mi_hotel() to authenticated;
grant execute on function public.detalle_cliente_mi_hotel(bigint) to authenticated;
grant execute on function public.crear_reserva_cliente_conocido(bigint,bigint,date,date,numeric,bigint) to authenticated;
commit;
