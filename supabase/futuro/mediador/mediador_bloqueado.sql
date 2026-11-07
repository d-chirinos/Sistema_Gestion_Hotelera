-- PROPUESTA FUTURA: revisar y autorizar antes de aplicar. No carga datos.
-- La aplicación del archivo habilitaría las dos RPC para administradores activos.
begin;
-- INICIO_GUARDIA_MEDIADOR_NO_DESPLEGAR
-- La auditoría y los límites transaccionales no sobreviven a un ROLLBACK del
-- llamador. Falta revisar la puerta de entrada y controles independientes.
do $guardia$ begin
  raise exception 'Mediador bloqueado: faltan controles independientes de auditoría y enumeración';
end $guardia$;
-- FIN_GUARDIA_MEDIADOR_NO_DESPLEGAR
create extension if not exists pgcrypto with schema extensions;
do $$ begin
  if to_regprocedure('extensions.digest(text,text)') is null or to_regprocedure('extensions.hmac(text,text,text)') is null then
    raise exception 'pgcrypto debe estar disponible en el esquema extensions';
  end if;
end $$;
create schema hotelmanager_privado;
revoke all on schema hotelmanager_privado from public, anon, authenticated;

create table hotelmanager_privado.autorizacion_reserva (
  id bigint generated always as identity primary key,
  token_hash bytea not null unique,
  operacion_hmac bytea not null,
  auth_user_id uuid not null,
  empleado_id bigint not null,
  hotel_id bigint not null,
  creada_en timestamptz not null,
  vence_en timestamptz not null,
  consumida_en timestamptz,
  check (vence_en > creada_en)
);
create table hotelmanager_privado.auditoria_reserva (
  id bigint generated always as identity primary key,
  fecha timestamptz not null,
  auth_user_id uuid not null,
  empleado_id bigint,
  hotel_id bigint,
  autorizacion_id bigint,
  accion text not null check (accion in ('SOLICITUD','CONFIRMACION','LIMITE_SOLICITUD','LIMITE_CONFIRMACION')),
  resultado text not null check (resultado in ('AUTORIZADA','COMPLETADA','NO_COMPLETADA','LIMITADA')),
  verificacion_declarada boolean not null default false
);
create index auditoria_reserva_limite_idx on hotelmanager_privado.auditoria_reserva(auth_user_id, accion, fecha);
revoke all on all tables in schema hotelmanager_privado from public, anon, authenticated;
revoke all on all sequences in schema hotelmanager_privado from public, anon, authenticated;

-- No devuelve datos de la base. Una salida vacía indica solicitud inválida.
create function hotelmanager_privado.leer_operacion(p jsonb)
returns table (nombre text, apellido text, tipo_documento text, pais_emisor text, documento text,
               habitacion_id bigint, entrada date, salida date, total numeric)
language plpgsql immutable set search_path = pg_catalog
as $$
declare n integer;
begin
  if p is null or jsonb_typeof(p) <> 'object' or octet_length(p::text) > 4096 then return; end if;
  select count(*) into n from jsonb_object_keys(p);
  if n<>9 or not (p ?& array['nombre','apellido','tipo_documento','pais_emisor','documento','habitacion_id','entrada','salida','total']) then return; end if;
  if exists (select 1 from jsonb_each(p) x where x.value='null'::jsonb or jsonb_typeof(x.value) not in ('string','number')) then return; end if;
  if jsonb_typeof(p->'nombre')<>'string' or jsonb_typeof(p->'apellido')<>'string'
     or jsonb_typeof(p->'tipo_documento')<>'string' or jsonb_typeof(p->'pais_emisor')<>'string'
     or jsonb_typeof(p->'documento')<>'string' or jsonb_typeof(p->'entrada')<>'string'
     or jsonb_typeof(p->'salida')<>'string' or (p->>'entrada') !~ '^\d{4}-\d{2}-\d{2}$'
     or (p->>'salida') !~ '^\d{4}-\d{2}-\d{2}$' then return; end if;
  nombre:=btrim(p->>'nombre'); apellido:=btrim(p->>'apellido');
  tipo_documento:=btrim(p->>'tipo_documento'); pais_emisor:=btrim(p->>'pais_emisor'); documento:=btrim(p->>'documento');
  habitacion_id:=(p->>'habitacion_id')::bigint; entrada:=(p->>'entrada')::date; salida:=(p->>'salida')::date; total:=(p->>'total')::numeric;
  if nombre='' or apellido='' or tipo_documento='' or pais_emisor='' or documento=''
     or not isfinite(entrada) or not isfinite(salida) or salida<=entrada
     or total='NaN'::numeric or total<0 or total<>trunc(total,2) or total>99999999.99 then return; end if;
  return next;
exception when others then return;
end;
$$;
revoke all on function hotelmanager_privado.leer_operacion(jsonb) from public, anon, authenticated;

-- Una declaración es una afirmación del operador, no una constatación del sistema.
create function public.solicitar_autorizacion_reserva(p_operacion jsonb, p_verificacion_presencial boolean)
returns jsonb language plpgsql volatile security definer set search_path = pg_catalog
as $$
declare
  v_user uuid := auth.uid(); v_emp bigint; v_hotel bigint; v_now timestamptz := clock_timestamp();
  v_op record; v_precio numeric; v_cuenta bigint; v_id bigint; v_token uuid;
begin
  if v_user is null then return jsonb_build_object('estado','NO_COMPLETADA'); end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 72103));
  v_now:=clock_timestamp();
  select count(*) into v_cuenta from hotelmanager_privado.auditoria_reserva a
   where a.auth_user_id=v_user and a.accion='SOLICITUD' and a.fecha>v_now-interval '10 minutes';
  if v_cuenta>=5 then
    if not exists(select 1 from hotelmanager_privado.auditoria_reserva a where a.auth_user_id=v_user and a.accion='LIMITE_SOLICITUD' and a.fecha>v_now-interval '10 minutes') then
      insert into hotelmanager_privado.auditoria_reserva(fecha,auth_user_id,accion,resultado) values(v_now,v_user,'LIMITE_SOLICITUD','LIMITADA');
    end if;
    return jsonb_build_object('estado','NO_COMPLETADA');
  end if;
  select e.id_empleado,e.hotel_id_hotel into v_emp,v_hotel
  from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=v_user and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  select * into v_op from hotelmanager_privado.leer_operacion(p_operacion);
  if v_hotel is not null and v_op.habitacion_id is not null and p_verificacion_presencial is true then
    select t.precio_noche into v_precio from public.habitacion h join public.tarifa_habitacion t
      on t.hotel_id_hotel=h.hotel_id_hotel and t.tipo_habitacion_id_tipo=h.tipo_habitacion_id_tipo
    where h.id_habitacion=v_op.habitacion_id and h.hotel_id_hotel=v_hotel;
  end if;
  if v_precio is null or v_precio*(v_op.salida-v_op.entrada)<>v_op.total then
    insert into hotelmanager_privado.auditoria_reserva(fecha,auth_user_id,empleado_id,hotel_id,accion,resultado,verificacion_declarada)
    values(v_now,v_user,v_emp,v_hotel,'SOLICITUD','NO_COMPLETADA',coalesce(p_verificacion_presencial,false));
    return jsonb_build_object('estado','NO_COMPLETADA');
  end if;
  v_token:=gen_random_uuid();
  insert into hotelmanager_privado.autorizacion_reserva(token_hash,operacion_hmac,auth_user_id,empleado_id,hotel_id,creada_en,vence_en)
  values(extensions.digest(v_token::text,'sha256'),extensions.hmac(p_operacion::text,v_token::text,'sha256'),v_user,v_emp,v_hotel,v_now,v_now+interval '5 minutes') returning id into v_id;
  insert into hotelmanager_privado.auditoria_reserva(fecha,auth_user_id,empleado_id,hotel_id,autorizacion_id,accion,resultado,verificacion_declarada)
  values(v_now,v_user,v_emp,v_hotel,v_id,'SOLICITUD','AUTORIZADA',true);
  return jsonb_build_object('estado','AUTORIZADA','autorizacion',v_token,'vence_en',v_now+interval '5 minutes');
end;
$$;

create function public.confirmar_reserva_autorizada(p_autorizacion uuid, p_operacion jsonb)
returns jsonb language plpgsql volatile security definer set search_path = pg_catalog
as $$
declare
  v_user uuid := auth.uid(); v_emp bigint; v_hotel bigint; v_now timestamptz := clock_timestamp();
  v_cuenta bigint; v_auth hotelmanager_privado.autorizacion_reserva%rowtype; v_op record;
  v_precio numeric; v_tipo bigint; v_zona text; v_cliente bigint; v_nombre text; v_apellido text;
  v_reserva bigint; v_resultado text := 'NO_COMPLETADA';
begin
  if v_user is null then return jsonb_build_object('estado','NO_COMPLETADA'); end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 72103));
  v_now:=clock_timestamp();
  select count(*) into v_cuenta from hotelmanager_privado.auditoria_reserva a
    where a.auth_user_id=v_user and a.accion='CONFIRMACION' and a.fecha>v_now-interval '10 minutes';
  if v_cuenta>=10 then
    if not exists(select 1 from hotelmanager_privado.auditoria_reserva a where a.auth_user_id=v_user and a.accion='LIMITE_CONFIRMACION' and a.fecha>v_now-interval '10 minutes') then
      insert into hotelmanager_privado.auditoria_reserva(fecha,auth_user_id,accion,resultado) values(v_now,v_user,'LIMITE_CONFIRMACION','LIMITADA');
    end if;
    return jsonb_build_object('estado','NO_COMPLETADA');
  end if;
  select e.id_empleado,e.hotel_id_hotel into v_emp,v_hotel
  from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado
  where ce.auth_user_id=v_user and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
  if p_autorizacion is not null and v_hotel is not null then
    select * into v_auth from hotelmanager_privado.autorizacion_reserva a
    where a.token_hash=extensions.digest(p_autorizacion::text,'sha256') for update;
  end if;
  v_now:=clock_timestamp();
  if v_auth.id is null or v_auth.auth_user_id<>v_user or v_auth.empleado_id<>v_emp or v_auth.hotel_id<>v_hotel
     or v_auth.consumida_en is not null or v_auth.vence_en<=v_now
     or p_operacion is null or octet_length(p_operacion::text)>4096
     or v_auth.operacion_hmac<>extensions.hmac(p_operacion::text,p_autorizacion::text,'sha256') then
    insert into hotelmanager_privado.auditoria_reserva(fecha,auth_user_id,empleado_id,hotel_id,accion,resultado)
    values(v_now,v_user,v_emp,v_hotel,'CONFIRMACION','NO_COMPLETADA');
    return jsonb_build_object('estado','NO_COMPLETADA');
  end if;
  update hotelmanager_privado.autorizacion_reserva set consumida_en=v_now where id=v_auth.id;
  -- El consumo y la auditoría quedan fuera del subbloque que revierte el negocio.
  begin
    select * into v_op from hotelmanager_privado.leer_operacion(p_operacion);
    if v_op.habitacion_id is null then raise exception 'Operación inválida'; end if;
    select h.tipo_habitacion_id_tipo into v_tipo from public.habitacion h
    where h.id_habitacion=v_op.habitacion_id and h.hotel_id_hotel=v_hotel for update;
    if not found then raise exception 'Operación inválida'; end if;
    select t.precio_noche into v_precio from public.tarifa_habitacion t
    where t.hotel_id_hotel=v_hotel and t.tipo_habitacion_id_tipo=v_tipo for share;
    if not found or v_precio*(v_op.salida-v_op.entrada)<>v_op.total then raise exception 'Operación inválida'; end if;
    select h.zona_horaria into v_zona from public.hotel h where h.id_hotel=v_hotel for share;
    if v_zona is null or not exists(select 1 from pg_catalog.pg_timezone_names z where z.name=v_zona) then raise exception 'Operación inválida'; end if;
    -- Un documento con componentes históricos desconocidos requiere revisión.
    if exists(select 1 from public.cliente c where lower(btrim(c.documento))=lower(v_op.documento)
              and (c.tipo_documento is null or c.pais_emisor_documento is null)) then raise exception 'Revisión administrativa'; end if;
    select c.id_cliente,c.nombre,c.apellido into v_cliente,v_nombre,v_apellido from public.cliente c
    where lower(btrim(c.tipo_documento))=lower(v_op.tipo_documento)
      and lower(btrim(c.pais_emisor_documento))=lower(v_op.pais_emisor)
      and lower(btrim(c.documento))=lower(v_op.documento) for key share;
    if v_cliente is null then
      insert into public.cliente(nombre,apellido,tipo_documento,pais_emisor_documento,documento)
      values(v_op.nombre,v_op.apellido,v_op.tipo_documento,v_op.pais_emisor,v_op.documento)
      on conflict (lower(btrim(tipo_documento)),lower(btrim(pais_emisor_documento)),lower(btrim(documento))) do nothing
      returning cliente.id_cliente,cliente.nombre,cliente.apellido into v_cliente,v_nombre,v_apellido;
      if v_cliente is null then
        select c.id_cliente,c.nombre,c.apellido into v_cliente,v_nombre,v_apellido from public.cliente c
        where lower(btrim(c.tipo_documento))=lower(v_op.tipo_documento)
          and lower(btrim(c.pais_emisor_documento))=lower(v_op.pais_emisor)
          and lower(btrim(c.documento))=lower(v_op.documento) for key share;
      end if;
    end if;
    -- No asociar una ficha con nombre distinto ni revelar sus valores.
    if v_cliente is null or lower(btrim(v_nombre))<>lower(v_op.nombre) or lower(btrim(v_apellido))<>lower(v_op.apellido) then
      raise exception 'Revisión administrativa';
    end if;
    insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva)
    values(v_cliente,v_op.habitacion_id,v_op.entrada,v_op.salida,'CONFIRMADA',v_op.total,(v_now at time zone v_zona)::date)
    returning reserva.id_reserva into v_reserva;
    v_resultado:='COMPLETADA';
  exception when others then
    -- Incluye superposición y conciliación; la respuesta no revela la causa.
    v_resultado:='NO_COMPLETADA'; v_reserva:=null;
  end;
  insert into hotelmanager_privado.auditoria_reserva(fecha,auth_user_id,empleado_id,hotel_id,autorizacion_id,accion,resultado)
  values(v_now,v_user,v_emp,v_hotel,v_auth.id,'CONFIRMACION',v_resultado);
  if v_resultado='COMPLETADA' then return jsonb_build_object('estado',v_resultado,'reserva_id',v_reserva); end if;
  return jsonb_build_object('estado','NO_COMPLETADA');
end;
$$;
revoke all on function public.solicitar_autorizacion_reserva(jsonb,boolean) from public, anon, authenticated;
revoke all on function public.confirmar_reserva_autorizada(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.solicitar_autorizacion_reserva(jsonb,boolean) to authenticated;
grant execute on function public.confirmar_reserva_autorizada(uuid,jsonb) to authenticated;
commit;
