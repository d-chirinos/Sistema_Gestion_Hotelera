-- Lecturas operativas por rol de sistema y hotel. No habilita escrituras.
begin;
create function public.mi_perfil_operativo()
returns table(empleado_id bigint,hotel_id bigint,rol_sistema text,nombre text,apellido text,cargo text)
language sql stable security definer set search_path=pg_catalog as $$
 select e.id_empleado,e.hotel_id_hotel,ce.rol_sistema,e.nombre,e.apellido,c.nombre from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado join public.cargo c on c.id_cargo=e.cargo_id_cargo where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('RECEPCIONISTA','MANTENIMIENTO')
$$;
create function public.consultar_operativo(p_modulo text)
returns setof jsonb language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_rol text;
begin
 select e.hotel_id_hotel,ce.rol_sistema into v_hotel,v_rol from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema in ('RECEPCIONISTA','MANTENIMIENTO');
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 if not (p_modulo in ('hotel','habitacion','tipo_habitacion') or (v_rol='RECEPCIONISTA' and p_modulo in ('tarifa_habitacion','servicio','reservas','clientes','estadias','pagos','consumos')) or (v_rol='MANTENIMIENTO' and p_modulo='mantenimiento')) then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 case p_modulo
 when 'hotel' then return query select to_jsonb(x) from (select h.id_hotel,h.nombre,h.direccion,h.ciudad,h.pais,h.telefono,h.email,h.categoria,h.zona_horaria from public.hotel h where h.id_hotel=v_hotel) x;
 when 'habitacion' then return query select to_jsonb(x) from (select h.id_habitacion,h.hotel_id_hotel,h.tipo_habitacion_id_tipo,h.numero,h.piso,h.estado from public.habitacion h where h.hotel_id_hotel=v_hotel order by h.id_habitacion) x;
 when 'tipo_habitacion' then return query select to_jsonb(x) from (select t.id_tipo,t.nombre,t.descripcion,t.capacidad from public.tipo_habitacion t where exists(select 1 from public.habitacion h where h.tipo_habitacion_id_tipo=t.id_tipo and h.hotel_id_hotel=v_hotel) or (v_rol='RECEPCIONISTA' and exists(select 1 from public.tarifa_habitacion f where f.tipo_habitacion_id_tipo=t.id_tipo and f.hotel_id_hotel=v_hotel)) order by t.id_tipo) x;
 when 'tarifa_habitacion' then return query select to_jsonb(x) from (select t.id_tarifa,t.hotel_id_hotel,t.tipo_habitacion_id_tipo,t.precio_noche from public.tarifa_habitacion t where t.hotel_id_hotel=v_hotel order by t.id_tarifa) x;
 when 'servicio' then return query select to_jsonb(x) from (select s.id_servicio,s.hotel_id_hotel,s.nombre,s.precio from public.servicio s where s.hotel_id_hotel=v_hotel order by s.id_servicio) x;
 when 'reservas' then return query select to_jsonb(x) from (select r.id_reserva,c.id_cliente as cliente_id_cliente,c.nombre as cliente_nombre,c.apellido as cliente_apellido,h.id_habitacion as habitacion_id_habitacion,h.numero as habitacion_numero,r.fecha_entrada,r.fecha_salida,r.estado,r.total_estimado,r.fecha_reserva from public.reserva r join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion join public.cliente c on c.id_cliente=r.cliente_id_cliente where h.hotel_id_hotel=v_hotel order by r.fecha_entrada desc,r.id_reserva desc) x;
 when 'clientes' then return query select to_jsonb(x) from (select c.id_cliente,c.nombre,c.apellido,count(*) as reservas from public.cliente c join public.reserva r on r.cliente_id_cliente=c.id_cliente join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel group by c.id_cliente,c.nombre,c.apellido order by c.id_cliente) x;
 when 'estadias' then return query select to_jsonb(x) from (select e.id_estadia,e.reserva_id_reserva,h.numero as habitacion_numero,emp.id_empleado as empleado_id_empleado,e.fecha_checkin,e.fecha_hora_checkin,e.fecha_checkout,e.fecha_hora_checkout from public.estadia e join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion left join public.empleado emp on emp.id_empleado=e.empleado_id_empleado and emp.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=v_hotel order by e.id_estadia) x;
 when 'pagos' then return query select to_jsonb(x) from (select p.id_pago,p.reserva_id_reserva,p.fecha_pago,p.fecha_hora_pago,p.tipo_pago,p.monto,p.metodo_pago from public.pago p join public.reserva r on r.id_reserva=p.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where h.hotel_id_hotel=v_hotel order by p.id_pago) x;
 when 'consumos' then return query select to_jsonb(x) from (select c.id_consumo::text as id_consumo,c.estadia_id_estadia,s.nombre as servicio,c.cantidad,c.precio_unitario_aplicado,c.cantidad*c.precio_unitario_aplicado as subtotal from public.consumo_servicio c join public.estadia e on e.id_estadia=c.estadia_id_estadia join public.reserva r on r.id_reserva=e.reserva_id_reserva join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion join public.servicio s on s.id_servicio=c.servicio_id_servicio and s.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=v_hotel order by c.id_consumo) x;
 when 'mantenimiento' then return query select to_jsonb(x) from (select m.id_mantenimiento::text as id_mantenimiento,h.numero as habitacion_numero,emp.id_empleado as empleado_id_empleado,m.fecha_inicio,m.fecha_fin,m.tipo from public.mantenimiento m join public.habitacion h on h.id_habitacion=m.habitacion_id_habitacion left join public.empleado emp on emp.id_empleado=m.empleado_id_empleado and emp.hotel_id_hotel=h.hotel_id_hotel where h.hotel_id_hotel=v_hotel order by m.id_mantenimiento) x;
 end case;
end $$;
create function public.detalle_cliente_operativo(p_cliente bigint)
returns table(id_cliente bigint,nombre text,apellido text,id_reserva bigint,habitacion_numero text,fecha_entrada date,fecha_salida date,estado text)
language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='RECEPCIONISTA';
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 return query select c.id_cliente,c.nombre,c.apellido,r.id_reserva,h.numero,r.fecha_entrada,r.fecha_salida,r.estado from public.cliente c join public.reserva r on r.cliente_id_cliente=c.id_cliente join public.habitacion h on h.id_habitacion=r.habitacion_id_habitacion where c.id_cliente=p_cliente and h.hotel_id_hotel=v_hotel order by r.id_reserva;
end $$;
create function public.cotizar_operativo(p_habitacion_id bigint,p_entrada date,p_salida date)
returns table(precio_noche numeric,noches integer,total numeric) language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_hotel bigint; v_precio numeric;
begin
 select e.hotel_id_hotel into v_hotel from public.cuenta_empleado ce join public.empleado e on e.id_empleado=ce.empleado_id_empleado where ce.auth_user_id=auth.uid() and ce.activo and ce.rol_sistema='RECEPCIONISTA';
 if v_hotel is null then raise exception 'Acceso no autorizado' using errcode='42501'; end if;
 if p_entrada is null or p_salida is null or not isfinite(p_entrada) or not isfinite(p_salida) or p_salida<=p_entrada then raise exception 'Fechas inválidas' using errcode='22023'; end if;
 select t.precio_noche into v_precio from public.habitacion h join public.tarifa_habitacion t on t.hotel_id_hotel=h.hotel_id_hotel and t.tipo_habitacion_id_tipo=h.tipo_habitacion_id_tipo where h.id_habitacion=p_habitacion_id and h.hotel_id_hotel=v_hotel;
 if v_precio is null or v_precio*(p_salida-p_entrada)>99999999.99 then raise exception 'Habitación o tarifa no disponible' using errcode='22023'; end if;
 return query select v_precio,p_salida-p_entrada,v_precio*(p_salida-p_entrada);
end $$;
revoke all on function public.mi_perfil_operativo() from public,anon,authenticated;
revoke all on function public.consultar_operativo(text) from public,anon,authenticated;
revoke all on function public.detalle_cliente_operativo(bigint) from public,anon,authenticated;
revoke all on function public.cotizar_operativo(bigint,date,date) from public,anon,authenticated;
grant execute on function public.mi_perfil_operativo() to authenticated;
grant execute on function public.consultar_operativo(text) to authenticated;
grant execute on function public.detalle_cliente_operativo(bigint) to authenticated;
grant execute on function public.cotizar_operativo(bigint,date,date) to authenticated;
commit;
