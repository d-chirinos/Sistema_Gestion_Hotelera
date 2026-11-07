-- Funciones de lectura: aplicar únicamente tras revisión y pruebas de permisos.
-- Las tablas permanecen con RLS y sin privilegios directos para la API.
begin;
create function public.mi_cuenta_hotelmanager()
returns table (empleado_id bigint, hotel_id bigint, rol_sistema text)
language sql stable security definer
set search_path = pg_catalog
as $$
  select e.id_empleado, e.hotel_id_hotel, ce.rol_sistema
  from public.cuenta_empleado ce
  join public.empleado e on e.id_empleado = ce.empleado_id_empleado
  where ce.auth_user_id = auth.uid() and ce.activo = true
$$;

create function public.consultar_mi_hotel(p_recurso text)
returns setof jsonb
language plpgsql stable security definer
set search_path = pg_catalog
as $$
declare
  v_hotel bigint;
begin
  select e.hotel_id_hotel into v_hotel
  from public.cuenta_empleado ce
  join public.empleado e on e.id_empleado = ce.empleado_id_empleado
  where ce.auth_user_id = auth.uid()
    and ce.activo = true and ce.rol_sistema = 'ADMINISTRADOR';
  if v_hotel is null then
    raise exception 'Acceso no autorizado' using errcode = '42501';
  end if;
  case p_recurso
    when 'hotel' then
      return query select to_jsonb(fila) from (select h.id_hotel, h.nombre, h.direccion, h.ciudad, h.pais, h.telefono, h.email, h.categoria, h.zona_horaria
        from public.hotel h where h.id_hotel = v_hotel) as fila;
    when 'tipo_habitacion' then
      return query select to_jsonb(fila) from (select t.id_tipo, t.nombre, t.descripcion, t.capacidad
        from public.tipo_habitacion t where exists (select 1 from public.habitacion h where h.tipo_habitacion_id_tipo = t.id_tipo and h.hotel_id_hotel = v_hotel) or exists (select 1 from public.tarifa_habitacion f where f.tipo_habitacion_id_tipo = t.id_tipo and f.hotel_id_hotel = v_hotel)) as fila;
    when 'habitacion' then
      return query select to_jsonb(fila) from (select h.id_habitacion, h.hotel_id_hotel, h.tipo_habitacion_id_tipo, h.numero, h.piso, h.estado
        from public.habitacion h where h.hotel_id_hotel = v_hotel) as fila;
    when 'tarifa_habitacion' then
      return query select to_jsonb(fila) from (select t.id_tarifa, t.hotel_id_hotel, t.tipo_habitacion_id_tipo, t.precio_noche
        from public.tarifa_habitacion t where t.hotel_id_hotel = v_hotel) as fila;
    when 'servicio' then
      return query select to_jsonb(fila) from (select s.id_servicio, s.hotel_id_hotel, s.nombre, s.precio
        from public.servicio s where s.hotel_id_hotel = v_hotel) as fila;
    else
      raise exception 'Recurso no permitido' using errcode = '22023';
  end case;
end;
$$;

-- Ni PUBLIC ni anon reciben ejecución; authenticated solo puede invocar estas funciones.
revoke all on function public.mi_cuenta_hotelmanager() from public, anon, authenticated;
revoke all on function public.consultar_mi_hotel(text) from public, anon, authenticated;
grant execute on function public.mi_cuenta_hotelmanager() to authenticated;
grant execute on function public.consultar_mi_hotel(text) to authenticated;

commit;
