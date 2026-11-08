-- Extensión de escritura por rol; conserva los cuerpos y restricciones existentes.

begin;

create or replace function public.registrar_pago_reserva(p_reserva_id bigint,p_monto numeric,p_metodo text,p_clave uuid)
returns table(id_pago bigint,tipo_pago text,fecha_pago date,fecha_hora_pago timestamptz,monto numeric,metodo_pago text,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog
as $$
declare v_hotel bigint; v_habitacion bigint; v_zona text; v_instante timestamptz; v_checkin timestamptz;
        v_tipo text; v_estado text; v_fecha_checkin date; v_pago public.pago%rowtype; v_metodo text;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','RECEPCIONISTA') for share of ce,e;
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
  select e.fecha_hora_checkin,e.fecha_checkin into v_checkin,v_fecha_checkin from public.estadia e where e.reserva_id_reserva=p_reserva_id for update;
  if (found and v_checkin is null) or (not found and v_estado='COMPLETADA') then raise exception 'El check-in histórico requiere conciliación' using errcode='22023'; end if;
  v_instante:=clock_timestamp();
  if v_checkin is not null and (v_checkin > v_instante or (v_checkin at time zone v_zona)::date <> v_fecha_checkin) then raise exception 'El check-in histórico requiere conciliación' using errcode='22023'; end if;
  v_tipo:=case when v_checkin is null or v_instante<v_checkin then 'ADELANTO' else 'ORDINARIO' end;
  insert into public.pago(reserva_id_reserva,fecha_pago,fecha_hora_pago,tipo_pago,monto,metodo_pago,clave_idempotencia)
  values(p_reserva_id,(v_instante at time zone v_zona)::date,v_instante,v_tipo,p_monto,v_metodo,p_clave) returning * into v_pago;
  return query select v_pago.id_pago,v_pago.tipo_pago,v_pago.fecha_pago,v_pago.fecha_hora_pago,v_pago.monto,v_pago.metodo_pago,false;
end;
$$;

create or replace function public.registrar_checkin(p_reserva_id bigint)
returns table(id_estadia bigint, fecha_hora_checkin timestamptz)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_empleado bigint; v_habitacion bigint; v_estado text; v_reserva public.reserva%rowtype; v_zona text; v_ahora timestamptz; v_estadia public.estadia%rowtype;
begin
  select e.hotel_id_hotel,e.id_empleado into v_hotel,v_empleado from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
    where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','RECEPCIONISTA') for share of ce,e;
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

create or replace function public.registrar_checkout(p_estadia_id bigint)
returns table(id_estadia bigint, fecha_hora_checkout timestamptz)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_rol text; v_empleado bigint; v_hotel bigint; v_habitacion bigint; v_reserva_id bigint; v_estado text; v_reserva_estado text; v_estadia public.estadia%rowtype; v_zona text; v_ahora timestamptz;
begin
  select e.hotel_id_hotel,ce.rol_sistema,e.id_empleado into v_hotel,v_rol,v_empleado from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
    where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','RECEPCIONISTA') for share of ce,e;
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
  select h.id_habitacion,r.id_reserva into v_habitacion,v_reserva_id from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where e.id_estadia=p_estadia_id and h.hotel_id_hotel=v_hotel;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  select h.estado into v_estado from public.habitacion h where h.id_habitacion=v_habitacion and h.hotel_id_hotel=v_hotel for update;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  select r.estado into v_reserva_estado from public.reserva r where r.id_reserva=v_reserva_id and r.habitacion_id_habitacion=v_habitacion for update;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  select e.* into v_estadia from public.estadia e where e.id_estadia=p_estadia_id and e.reserva_id_reserva=v_reserva_id for update;
  if not found then raise exception 'Estadía no disponible' using errcode='22023'; end if;
  if v_rol='RECEPCIONISTA' and v_estadia.empleado_id_empleado is distinct from v_empleado then raise exception 'La estadía requiere revisión administrativa' using errcode='42501'; end if;
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

create or replace function public.registrar_consumo_estadia(p_estadia bigint,p_servicio bigint,p_cantidad integer,p_precio_esperado numeric,p_clave bigint)
returns table(id_consumo text,precio_unitario_aplicado numeric,subtotal numeric,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_habitacion bigint; v_reserva bigint; v_estado_h text; v_estado_r text; v_zona text; v_estadia public.estadia%rowtype; v_servicio public.servicio%rowtype; v_consumo public.consumo_servicio%rowtype;
begin
  select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','RECEPCIONISTA') for share of ce,e;
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

create or replace function public.crear_reserva_cliente_conocido(p_cliente bigint,p_habitacion bigint,p_entrada date,p_salida date,p_precio_aceptado numeric,p_clave bigint)
returns table(id_reserva text,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_h public.habitacion%rowtype; v_r public.reserva%rowtype; v_precio numeric; v_total numeric; v_zona text; v_hoy date;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','RECEPCIONISTA') for share of ce,e;
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

create or replace function public.crear_cliente_y_primera_reserva(p_nombre text,p_apellido text,p_tipo_documento text,p_pais_documento text,p_documento text,p_habitacion bigint,p_entrada date,p_salida date,p_precio_aceptado numeric,p_clave bigint)
returns table(id_reserva text,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_h public.habitacion%rowtype; v_r public.reserva%rowtype; v_c public.cliente%rowtype; v_nombre text; v_apellido text; v_tipo text; v_pais text; v_documento text; v_zona text; v_hoy date; v_precio numeric; v_total numeric;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','RECEPCIONISTA') for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_nombre:=btrim(p_nombre); v_apellido:=btrim(p_apellido); v_tipo:=btrim(p_tipo_documento); v_pais:=btrim(p_pais_documento); v_documento:=btrim(p_documento);
 if v_nombre is null or v_nombre='' or v_apellido is null or v_apellido='' or v_tipo is null or v_tipo='' or v_pais is null or v_pais='' or v_documento is null or v_documento='' or p_clave is null or p_clave<4503599627370496 or p_clave>=9007199254740992 or p_entrada is null or p_salida is null or not isfinite(p_entrada) or not isfinite(p_salida) or p_salida<=p_entrada or p_precio_aceptado is null or p_precio_aceptado='NaN'::numeric or p_precio_aceptado<=0 or p_precio_aceptado>99999999.99 or p_precio_aceptado<>trunc(p_precio_aceptado,2) then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 v_total:=p_precio_aceptado*(p_salida-p_entrada);
 if v_total>99999999.99 then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 -- Serializar la clave y el número documental sin almacenar datos adicionales.
 perform pg_advisory_xact_lock(hashtextextended('primera-reserva:'||p_clave::text,11771));
 perform pg_advisory_xact_lock(hashtextextended('documento-cliente:'||lower(v_documento),11771));
 select h.* into v_h from public.habitacion h where h.id_habitacion=p_habitacion and h.hotel_id_hotel=v_hotel for update;
 if not found then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 select r.* into v_r from public.reserva r where r.id_reserva=p_clave;
 if found then
  select c.* into v_c from public.cliente c where c.id_cliente=v_r.cliente_id_cliente;
  if not found or v_r.habitacion_id_habitacion<>p_habitacion or v_r.fecha_entrada<>p_entrada or v_r.fecha_salida<>p_salida or v_r.total_estimado<>v_total or v_c.nombre<>v_nombre or v_c.apellido<>v_apellido or lower(btrim(v_c.tipo_documento)) is distinct from lower(v_tipo) or lower(btrim(v_c.pais_emisor_documento)) is distinct from lower(v_pais) or lower(btrim(v_c.documento))<>lower(v_documento) then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
  return query select v_r.id_reserva::text,true; return;
 end if;
 select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
 if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 v_hoy:=(clock_timestamp() at time zone v_zona)::date;
 if p_entrada<v_hoy or v_h.estado<>'DISPONIBLE' or exists(select 1 from public.mantenimiento m where m.habitacion_id_habitacion=p_habitacion and m.fecha_fin is null) or exists(select 1 from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva where r.habitacion_id_habitacion=p_habitacion and e.fecha_checkout is null) then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 select t.precio_noche into v_precio from public.tarifa_habitacion t where t.hotel_id_hotel=v_hotel and t.tipo_habitacion_id_tipo=v_h.tipo_habitacion_id_tipo for share;
 if v_precio is null or v_precio<>p_precio_aceptado then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 -- Coincidencias completas o históricas compatibles exigen conciliación, sin revelar fichas.
 if exists(select 1 from public.cliente c where lower(btrim(c.documento))=lower(v_documento) and (c.tipo_documento is null or lower(btrim(c.tipo_documento))=lower(v_tipo)) and (c.pais_emisor_documento is null or lower(btrim(c.pais_emisor_documento))=lower(v_pais))) then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end if;
 begin
  insert into public.cliente(nombre,apellido,tipo_documento,pais_emisor_documento,documento) values(v_nombre,v_apellido,v_tipo,v_pais,v_documento) returning * into v_c;
  insert into public.reserva(id_reserva,cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(p_clave,v_c.id_cliente,p_habitacion,p_entrada,p_salida,'CONFIRMADA',v_total,v_hoy);
 exception when unique_violation or exclusion_violation then raise exception 'No se pudo completar la solicitud; revise los datos' using errcode='22023'; end;
 return query select p_clave::text,false;
end $$;

create or replace function public.iniciar_mantenimiento_hotel(p_habitacion bigint,p_tipo text,p_clave bigint)
returns table(id_mantenimiento text,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_empleado bigint; v_estado text; v_tipo text; v_zona text; v_hoy date; v_m public.mantenimiento%rowtype;
begin
 select e.hotel_id_hotel,e.id_empleado into v_hotel,v_empleado from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','MANTENIMIENTO') for share of ce,e;
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

create or replace function public.finalizar_mantenimiento_hotel(p_id bigint,p_costo numeric,p_confirmacion boolean)
returns table(id_mantenimiento text,fecha_fin date,repetido boolean)
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_habitacion bigint; v_estado text; v_zona text; v_hoy date; v_m public.mantenimiento%rowtype;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('ADMINISTRADOR','MANTENIMIENTO') for share of ce,e;
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

revoke all on function public.registrar_pago_reserva(bigint,numeric,text,uuid) from public,anon,authenticated;
grant execute on function public.registrar_pago_reserva(bigint,numeric,text,uuid) to authenticated;
revoke all on function public.registrar_checkin(bigint) from public,anon,authenticated;
grant execute on function public.registrar_checkin(bigint) to authenticated;
revoke all on function public.registrar_checkout(bigint) from public,anon,authenticated;
grant execute on function public.registrar_checkout(bigint) to authenticated;
revoke all on function public.registrar_consumo_estadia(bigint,bigint,integer,numeric,bigint) from public,anon,authenticated;
grant execute on function public.registrar_consumo_estadia(bigint,bigint,integer,numeric,bigint) to authenticated;
revoke all on function public.crear_reserva_cliente_conocido(bigint,bigint,date,date,numeric,bigint) from public,anon,authenticated;
grant execute on function public.crear_reserva_cliente_conocido(bigint,bigint,date,date,numeric,bigint) to authenticated;
revoke all on function public.crear_cliente_y_primera_reserva(text,text,text,text,text,bigint,date,date,numeric,bigint) from public,anon,authenticated;
grant execute on function public.crear_cliente_y_primera_reserva(text,text,text,text,text,bigint,date,date,numeric,bigint) to authenticated;
revoke all on function public.iniciar_mantenimiento_hotel(bigint,text,bigint) from public,anon,authenticated;
grant execute on function public.iniciar_mantenimiento_hotel(bigint,text,bigint) to authenticated;
revoke all on function public.finalizar_mantenimiento_hotel(bigint,numeric,boolean) from public,anon,authenticated;
grant execute on function public.finalizar_mantenimiento_hotel(bigint,numeric,boolean) to authenticated;
commit;
