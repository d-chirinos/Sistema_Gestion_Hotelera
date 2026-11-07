-- Altas administrativas por hotel con reintentos basados en claves naturales.
begin;
create function public.crear_servicio_hotel(p_nombre text,p_precio numeric)
returns table(id_servicio bigint,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_nombre text; v_servicio public.servicio%rowtype;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_nombre:=btrim(p_nombre);
 if v_nombre is null or v_nombre='' or p_precio is null or p_precio='NaN'::numeric or p_precio<0 or p_precio>99999999.99 or p_precio<>trunc(p_precio,2) then raise exception 'Datos inválidos' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('alta-servicio:'||v_hotel::text||':'||lower(v_nombre),90210));
 select s.* into v_servicio from public.servicio s where s.hotel_id_hotel=v_hotel and lower(btrim(s.nombre))=lower(v_nombre) for update;
 if found then
   if v_servicio.precio<>p_precio then raise exception 'Existe un servicio con este nombre; revise el catálogo' using errcode='22023'; end if;
   return query select v_servicio.id_servicio,true; return;
 end if;
 insert into public.servicio(hotel_id_hotel,nombre,precio) values(v_hotel,v_nombre,p_precio) returning * into v_servicio;
 return query select v_servicio.id_servicio,false;
end $$;

create function public.crear_habitacion_hotel(p_numero text,p_tipo bigint,p_piso integer)
returns table(id_habitacion bigint,repetido boolean) language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_numero text; v_habitacion public.habitacion%rowtype;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='ADMINISTRADOR' for share of ce,e;
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 v_numero:=btrim(p_numero);
 if v_numero is null or v_numero='' or p_tipo is null then raise exception 'Datos inválidos' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('alta-habitacion:'||v_hotel::text||':'||lower(v_numero),90210));
 select h.* into v_habitacion from public.habitacion h where h.hotel_id_hotel=v_hotel and lower(btrim(h.numero))=lower(v_numero) for update;
 if found then
   if v_habitacion.tipo_habitacion_id_tipo<>p_tipo or v_habitacion.piso is distinct from p_piso then raise exception 'Existe una habitación con este número; revise el catálogo' using errcode='22023'; end if;
   return query select v_habitacion.id_habitacion,true; return;
 end if;
 -- Se usan solo tipos con tarifa ya establecida para el hotel.
 perform 1 from public.tarifa_habitacion t where t.hotel_id_hotel=v_hotel and t.tipo_habitacion_id_tipo=p_tipo for share;
 if not found then raise exception 'Tipo o tarifa no disponible' using errcode='22023'; end if;
 insert into public.habitacion(hotel_id_hotel,tipo_habitacion_id_tipo,numero,piso,estado) values(v_hotel,p_tipo,v_numero,p_piso,'DISPONIBLE') returning * into v_habitacion;
 return query select v_habitacion.id_habitacion,false;
end $$;
revoke all on function public.crear_servicio_hotel(text,numeric) from public,anon,authenticated;
revoke all on function public.crear_habitacion_hotel(text,bigint,integer) from public,anon,authenticated;
grant execute on function public.crear_servicio_hotel(text,numeric) to authenticated;
grant execute on function public.crear_habitacion_hotel(text,bigint,integer) to authenticated;
commit;
