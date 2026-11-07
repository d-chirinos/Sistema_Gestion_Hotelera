-- Indicadores y gestión administrativa por hotel. No modifica filas al instalarse.
begin;
create function public.resumen_operativo_mi_hotel()
returns table(reservas_confirmadas bigint,reservas_completadas bigint,reservas_canceladas bigint,estadias_sin_salida bigint,pagos_cantidad bigint,pagos_importe text,consumos_cantidad bigint,consumos_importe text,consumos_inconsistentes bigint,mantenimientos_sin_fin bigint)
language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR';
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 return query
 select
 (select count(*) from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel and r.estado='CONFIRMADA'),
 (select count(*) from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel and r.estado='COMPLETADA'),
 (select count(*) from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel and r.estado='CANCELADA'),
 (select count(*) from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel and e.fecha_checkout is null),
 (select count(*) from public.pago p join public.reserva r on r.id_reserva=p.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel),
 (select coalesce(sum(p.monto),0)::text from public.pago p join public.reserva r on r.id_reserva=p.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel),
 (select count(*) from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion join public.servicio s on s.id_servicio=c.servicio_id_servicio and s.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=v_hotel),
 (select coalesce(sum(c.cantidad*c.precio_unitario_aplicado),0)::text from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion join public.servicio s on s.id_servicio=c.servicio_id_servicio and s.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=v_hotel),
 (select count(*) from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion join public.servicio s on s.id_servicio=c.servicio_id_servicio where h.hotel_id_hotel=v_hotel and s.hotel_id_hotel<>v_hotel),
 (select count(*) from public.mantenimiento m join public.habitacion h on h.id_habitacion=m.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel and m.fecha_fin is null);
end $$;

create function public.saldo_informativo_reserva(p_reserva bigint)
returns table(reserva_id bigint,estado text,alojamiento text,consumos text,pagos text,saldo text,completo boolean)
language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_r public.reserva%rowtype; v_consumos numeric; v_pagos numeric; v_completo boolean;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR';
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 select r.* into v_r from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where r.id_reserva=p_reserva and h.hotel_id_hotel=v_hotel;
 if not found then raise exception 'Reserva no disponible' using errcode='22023'; end if;
 select not exists(select 1 from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia join public.servicio s on s.id_servicio=c.servicio_id_servicio where e.reserva_id_reserva=v_r.id_reserva and s.hotel_id_hotel<>v_hotel) into v_completo;
 select coalesce(sum(c.cantidad*c.precio_unitario_aplicado),0) into v_consumos from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia join public.servicio s on s.id_servicio=c.servicio_id_servicio where e.reserva_id_reserva=v_r.id_reserva and s.hotel_id_hotel=v_hotel;
 select coalesce(sum(p.monto),0) into v_pagos from public.pago p where p.reserva_id_reserva=v_r.id_reserva;
 return query select v_r.id_reserva,v_r.estado,v_r.total_estimado::text,case when v_completo then v_consumos::text else null end,v_pagos::text,case when v_completo and v_r.estado<>'CANCELADA' then (v_r.total_estimado+v_consumos-v_pagos)::text else null end,v_completo;
end $$;

create function public.registrar_empleado_hotel(p_nombre text,p_apellido text,p_documento text,p_cargo bigint,p_fecha_ingreso date)
returns table(id_empleado bigint,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_nombre text; v_apellido text; v_documento text; v_empleado public.empleado%rowtype; v_count bigint;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_nombre:=btrim(p_nombre); v_apellido:=btrim(p_apellido); v_documento:=btrim(p_documento);
 if v_nombre is null or v_nombre='' or v_apellido is null or v_apellido='' or v_documento is null or v_documento='' or p_cargo is null or p_fecha_ingreso is null or not isfinite(p_fecha_ingreso) then raise exception 'Datos inválidos' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('empleado:'||v_hotel::text||':'||lower(v_documento),88915));
 select count(*) into v_count from public.empleado e where e.hotel_id_hotel=v_hotel and lower(btrim(e.documento))=lower(v_documento);
 if v_count>1 then raise exception 'Registro requiere conciliación' using errcode='22023'; end if;
 if v_count=1 then
  select e.* into v_empleado from public.empleado e where e.hotel_id_hotel=v_hotel and lower(btrim(e.documento))=lower(v_documento) for update;
  if v_empleado.nombre<>v_nombre or v_empleado.apellido<>v_apellido or v_empleado.cargo_id_cargo<>p_cargo or v_empleado.fecha_ingreso<>p_fecha_ingreso then raise exception 'Registro requiere conciliación' using errcode='22023'; end if;
  return query select v_empleado.id_empleado,true; return;
 end if;
 -- El catálogo de cargos es global: usar únicamente cargos ya empleados en el propio hotel.
 if not exists(select 1 from public.empleado e where e.hotel_id_hotel=v_hotel and e.cargo_id_cargo=p_cargo) then raise exception 'Cargo no disponible' using errcode='22023'; end if;
 insert into public.empleado(hotel_id_hotel,cargo_id_cargo,nombre,apellido,documento,fecha_ingreso) values(v_hotel,p_cargo,v_nombre,v_apellido,v_documento,p_fecha_ingreso) returning * into v_empleado;
 return query select v_empleado.id_empleado,false;
end $$;

create function public.actualizar_habitacion_sin_historial(p_id bigint,p_numero_anterior text,p_tipo_anterior bigint,p_piso_anterior integer,p_numero text,p_tipo bigint,p_piso integer)
returns table(id_habitacion bigint) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_h public.habitacion%rowtype; v_numero text;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_numero:=btrim(p_numero);
 if p_numero_anterior is null or p_tipo_anterior is null or v_numero is null or v_numero='' or p_tipo is null then raise exception 'Datos inválidos' using errcode='22023'; end if;
 select h.* into v_h from public.habitacion h where h.id_habitacion=p_id and h.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'Habitación no disponible' using errcode='22023'; end if;
 if v_h.numero<>p_numero_anterior or v_h.tipo_habitacion_id_tipo<>p_tipo_anterior or v_h.piso is distinct from p_piso_anterior then raise exception 'La habitación ha cambiado; actualice los datos' using errcode='40001'; end if;
 if v_h.estado<>'DISPONIBLE' or exists(select 1 from public.reserva r where r.habitacion_id_habitacion=p_id) or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=p_id) then raise exception 'Habitación con historial requiere revisión' using errcode='22023'; end if;
 perform 1 from public.tarifa_habitacion t where t.hotel_id_hotel=v_hotel and t.tipo_habitacion_id_tipo=p_tipo for share;
 if not found then raise exception 'Tipo o tarifa no disponible' using errcode='22023'; end if;
 update public.habitacion h set numero=v_numero,tipo_habitacion_id_tipo=p_tipo,piso=p_piso where h.id_habitacion=p_id;
 return query select p_id;
end $$;
create function public.actualizar_empleado_sin_historial(p_id bigint,p_nombre_anterior text,p_apellido_anterior text,p_documento_anterior text,p_cargo_anterior bigint,p_fecha_anterior date,p_nombre text,p_apellido text,p_documento text,p_cargo bigint,p_fecha date)
returns table(id_empleado bigint) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_actor bigint; v_e public.empleado%rowtype; v_anterior text; v_nuevo text; v_nombre text; v_apellido text;
begin
 select e.hotel_id_hotel,e.id_empleado into v_hotel,v_actor from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_anterior:=lower(btrim(p_documento_anterior)); v_nuevo:=lower(btrim(p_documento)); v_nombre:=btrim(p_nombre); v_apellido:=btrim(p_apellido);
 if p_id is null or p_id=v_actor or p_nombre_anterior is null or p_apellido_anterior is null or p_cargo_anterior is null or p_fecha_anterior is null or v_anterior is null or v_anterior='' or v_nuevo is null or v_nuevo='' or v_nombre is null or v_nombre='' or v_apellido is null or v_apellido='' or p_cargo is null or p_fecha is null or not isfinite(p_fecha) then raise exception 'Datos inválidos' using errcode='22023'; end if;
 -- Evita bloquear cuentas activas ajenas; se vuelve a comprobar bajo bloqueo de empleado.
 if exists(select 1 from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where e.id_empleado=p_id and e.hotel_id_hotel=v_hotel) then raise exception 'Empleado con cuenta o historial requiere revisión' using errcode='22023'; end if;
 -- Mismo orden que el alta, con ambas claves ordenadas para evitar ciclos entre ediciones.
 perform pg_advisory_xact_lock(hashtextextended('empleado:'||v_hotel::text||':'||least(v_anterior,v_nuevo),88915));
 if v_anterior<>v_nuevo then perform pg_advisory_xact_lock(hashtextextended('empleado:'||v_hotel::text||':'||greatest(v_anterior,v_nuevo),88915)); end if;
 select e.* into v_e from public.empleado e where e.id_empleado=p_id and e.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'Empleado no disponible' using errcode='22023'; end if;
 if v_e.nombre<>p_nombre_anterior or v_e.apellido<>p_apellido_anterior or lower(btrim(v_e.documento))<>v_anterior or v_e.cargo_id_cargo<>p_cargo_anterior or v_e.fecha_ingreso<>p_fecha_anterior then raise exception 'Los datos han cambiado; actualice la consulta' using errcode='40001'; end if;
 if exists(select 1 from public.cuenta_empleado ce where ce.empleado_id_empleado=p_id) or exists(select 1 from public.estadia e where e.empleado_id_empleado=p_id) or exists(select 1 from public.mantenimiento m where m.empleado_id_empleado=p_id) then raise exception 'Empleado con cuenta o historial requiere revisión' using errcode='22023'; end if;
 if not exists(select 1 from public.empleado e where e.hotel_id_hotel=v_hotel and e.cargo_id_cargo=p_cargo) then raise exception 'Cargo no disponible' using errcode='22023'; end if;
 if exists(select 1 from public.empleado e where e.hotel_id_hotel=v_hotel and e.id_empleado<>p_id and lower(btrim(e.documento))=v_nuevo) then raise exception 'Registro requiere conciliación' using errcode='22023'; end if;
 update public.empleado e set nombre=v_nombre,apellido=v_apellido,documento=btrim(p_documento),cargo_id_cargo=p_cargo,fecha_ingreso=p_fecha where e.id_empleado=p_id;
 return query select p_id;
end $$;
revoke all on function public.actualizar_empleado_sin_historial(bigint,text,text,text,bigint,date,text,text,text,bigint,date) from public,anon,authenticated;
grant execute on function public.actualizar_empleado_sin_historial(bigint,text,text,text,bigint,date,text,text,text,bigint,date) to authenticated;
revoke all on function public.resumen_operativo_mi_hotel() from public,anon,authenticated;
revoke all on function public.saldo_informativo_reserva(bigint) from public,anon,authenticated;
revoke all on function public.registrar_empleado_hotel(text,text,text,bigint,date) from public,anon,authenticated;
revoke all on function public.actualizar_habitacion_sin_historial(bigint,text,bigint,integer,text,bigint,integer) from public,anon,authenticated;
grant execute on function public.resumen_operativo_mi_hotel() to authenticated;
grant execute on function public.saldo_informativo_reserva(bigint) to authenticated;
grant execute on function public.registrar_empleado_hotel(text,text,text,bigint,date) to authenticated;
grant execute on function public.actualizar_habitacion_sin_historial(bigint,text,bigint,integer,text,bigint,integer) to authenticated;
commit;
