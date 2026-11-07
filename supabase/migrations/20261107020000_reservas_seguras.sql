-- Propuesta: no aplicar hasta revisar y probar en un entorno autorizado.
begin;
-- Evita asumir que una función de escritura preexistente tiene permisos seguros.
do $$ begin
  if to_regprocedure('public.registrar_reserva_confirmada(bigint,bigint,date,date,numeric)') is not null then
    raise exception 'Existe una función de escritura preexistente; revisar su acceso antes de continuar';
  end if;
end $$;

create function public.listar_reservas_mi_hotel()
returns table (
  id_reserva bigint, cliente_id_cliente bigint, cliente_nombre text, cliente_apellido text,
  habitacion_id_habitacion bigint, habitacion_numero text, fecha_entrada date,
  fecha_salida date, estado text, total_estimado numeric, fecha_reserva date
)
language plpgsql stable security definer
set search_path = pg_catalog
as $$
declare v_hotel bigint;
begin
  select e.hotel_id_hotel into v_hotel
  from public.cuenta_empleado ce join public.empleado e on e.id_empleado = ce.empleado_id_empleado
  where ce.auth_user_id = auth.uid() and ce.activo and ce.rol_sistema = 'ADMINISTRADOR';
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode = '42501'; end if;
  return query
  select r.id_reserva, c.id_cliente, c.nombre, c.apellido, h.id_habitacion, h.numero,
         r.fecha_entrada, r.fecha_salida, r.estado, r.total_estimado, r.fecha_reserva
  from public.reserva r
  join public.habitacion h on h.id_habitacion = r.habitacion_id_habitacion
  join public.cliente c on c.id_cliente = r.cliente_id_cliente
  where h.hotel_id_hotel = v_hotel
  order by r.fecha_entrada desc, r.id_reserva desc;
end;
$$;

-- Cotización informativa; no garantiza disponibilidad ni congela la tarifa.
create function public.cotizar_reserva(p_habitacion_id bigint, p_entrada date, p_salida date)
returns table (precio_noche numeric, noches integer, total numeric)
language plpgsql stable security definer
set search_path = pg_catalog
as $$
declare v_hotel bigint; v_precio numeric;
begin
  select e.hotel_id_hotel into v_hotel
  from public.cuenta_empleado ce join public.empleado e on e.id_empleado = ce.empleado_id_empleado
  where ce.auth_user_id = auth.uid() and ce.activo and ce.rol_sistema = 'ADMINISTRADOR';
  if v_hotel is null then raise exception 'Acceso no autorizado' using errcode = '42501'; end if;
  if p_entrada is null or p_salida is null or not isfinite(p_entrada) or not isfinite(p_salida) or p_salida <= p_entrada then
    raise exception 'Fechas de reserva inválidas' using errcode = '22023';
  end if;
  select t.precio_noche into v_precio
  from public.habitacion h join public.tarifa_habitacion t
    on t.hotel_id_hotel = h.hotel_id_hotel and t.tipo_habitacion_id_tipo = h.tipo_habitacion_id_tipo
  where h.id_habitacion = p_habitacion_id and h.hotel_id_hotel = v_hotel;
  if v_precio is null then raise exception 'Habitación o tarifa no disponible' using errcode = '22023'; end if;
  if v_precio * (p_salida - p_entrada) > 99999999.99 then
    raise exception 'Importe fuera del rango permitido' using errcode = '22023';
  end if;
  return query select v_precio, p_salida - p_entrada, v_precio * (p_salida - p_entrada);
end;
$$;

revoke all on function public.listar_reservas_mi_hotel() from public, anon, authenticated;
revoke all on function public.cotizar_reserva(bigint, date, date) from public, anon, authenticated;
grant execute on function public.listar_reservas_mi_hotel() to authenticated;
grant execute on function public.cotizar_reserva(bigint, date, date) to authenticated;
commit;
