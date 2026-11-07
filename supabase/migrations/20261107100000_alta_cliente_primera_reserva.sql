-- Flujo académico: inserta únicamente clientes nuevos y crea la primera reserva atómicamente.
-- No reutiliza ni devuelve fichas existentes. No agrega tablas ni altera la unicidad documental.
begin;
create function public.crear_cliente_y_primera_reserva(p_nombre text,p_apellido text,p_tipo_documento text,p_pais_documento text,p_documento text,p_habitacion bigint,p_entrada date,p_salida date,p_precio_aceptado numeric,p_clave bigint)
returns table(id_reserva text,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_h public.habitacion%rowtype; v_r public.reserva%rowtype; v_c public.cliente%rowtype; v_nombre text; v_apellido text; v_tipo text; v_pais text; v_documento text; v_zona text; v_hoy date; v_precio numeric; v_total numeric;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
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
revoke all on function public.crear_cliente_y_primera_reserva(text,text,text,text,text,bigint,date,date,numeric,bigint) from public,anon,authenticated;
grant execute on function public.crear_cliente_y_primera_reserva(text,text,text,text,text,bigint,date,date,numeric,bigint) to authenticated;
commit;
