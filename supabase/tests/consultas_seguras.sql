-- SOLO PostgreSQL local aislado con Auth simulado, migraciones y demo cargadas.
-- Estas identidades son fixtures locales, nunca ejecutar este archivo en remoto.
begin;
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000002'),
 ('00000000-0000-4000-8000-000000000003'),
 ('00000000-0000-4000-8000-000000000004'),
 ('00000000-0000-4000-8000-000000000005'),
 ('00000000-0000-4000-8000-000000000006');
insert into public.cuenta_empleado(auth_user_id, empleado_id_empleado, rol_sistema, activo, fecha_vinculacion) values
 ('00000000-0000-4000-8000-000000000001',1,'ADMINISTRADOR',true,now()),
 ('00000000-0000-4000-8000-000000000002',2,'RECEPCIONISTA',true,now()),
 ('00000000-0000-4000-8000-000000000003',3,'MANTENIMIENTO',false,now()),
 ('00000000-0000-4000-8000-000000000005',5,'ADMINISTRADOR',true,now()),
 ('00000000-0000-4000-8000-000000000006',4,'MANTENIMIENTO',true,now());

-- Tipo y tarifa exclusivos del hotel 2 para probar el filtrado del catálogo global.
insert into public.tipo_habitacion(id_tipo,nombre,capacidad) values (9,'Tipo solo hotel 2',1);
insert into public.tarifa_habitacion(id_tarifa,hotel_id_hotel,tipo_habitacion_id_tipo,precio_noche) values (9,2,9,10);

create function pg_temp.comprobar(ok boolean, mensaje text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Fallo: %', mensaje; end if; end $$;
create function pg_temp.denegado(q text, estado text) returns void language plpgsql as $$
begin
  begin execute q; exception when others then
    if sqlstate = estado then return; end if;
    raise exception 'SQLSTATE inesperado: %, esperado %', sqlstate, estado;
  end;
  raise exception 'Se esperaba denegación: %', q;
end $$;
create function pg_temp.comprobar_recurso(recurso text, clave text, esperado bigint[]) returns void language plpgsql as $$
declare obtenido bigint[];
begin
 select coalesce(array_agg((obj->>clave)::bigint order by (obj->>clave)::bigint),array[]::bigint[])
 into obtenido from public.consultar_mi_hotel(recurso) obj;
 if obtenido <> esperado then raise exception 'IDs inesperados en %: %', recurso, obtenido; end if;
end $$;

do $$
declare f regprocedure;
begin
 foreach f in array array['public.mi_cuenta_hotelmanager()'::regprocedure,'public.consultar_mi_hotel(text)'::regprocedure] loop
   if has_function_privilege('anon',f,'execute') or not has_function_privilege('authenticated',f,'execute')
      or not exists(select 1 from pg_proc where oid=f and prosecdef and proconfig @> array['search_path=pg_catalog']) then
     raise exception 'Privilegios o configuración inesperados en %',f;
   end if;
 end loop;
end $$;

-- Comprueba privilegios efectivos, no solo la ausencia de políticas RLS.
do $$ declare r record; begin
 for r in select c.oid::regclass as objeto from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind in ('r','v') loop
   if has_table_privilege('anon',r.objeto,'select,insert,update,delete,truncate,references,trigger')
      or has_table_privilege('authenticated',r.objeto,'select,insert,update,delete,truncate,references,trigger') then
     raise exception 'Privilegios directos inesperados: %',r.objeto;
   end if;
 end loop;
end $$;

set local role anon;
select pg_temp.denegado('select * from public.mi_cuenta_hotelmanager()', '42501');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');
select pg_temp.denegado('select * from public.hotel', '42501');
reset role;

set local role authenticated;
select pg_temp.comprobar((select count(*)=0 from public.mi_cuenta_hotelmanager()),'sin sujeto JWT');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
select pg_temp.comprobar((select count(*)=0 from public.mi_cuenta_hotelmanager()),'usuario sin vínculo');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');
select pg_temp.denegado('select * from public.cliente', '42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select pg_temp.comprobar((select count(*)=0 from public.mi_cuenta_hotelmanager()),'usuario inactivo');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select pg_temp.comprobar((select empleado_id=2 and hotel_id=1 and rol_sistema='RECEPCIONISTA' from public.mi_cuenta_hotelmanager()),'identidad recepción');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');
select pg_temp.denegado($q$insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(1,1,current_date,current_date+1,'CANCELADA',1,current_date)$q$, '42501');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000006',true);
select pg_temp.comprobar((select empleado_id=4 and rol_sistema='MANTENIMIENTO' from public.mi_cuenta_hotelmanager()),'identidad mantenimiento activo');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select pg_temp.comprobar((select empleado_id=1 and hotel_id=1 and rol_sistema='ADMINISTRADOR' from public.mi_cuenta_hotelmanager()),'identidad administrador 1');
select pg_temp.comprobar_recurso('hotel','id_hotel',array[1]);
select pg_temp.comprobar_recurso('tipo_habitacion','id_tipo',array[1,2,3,4]);
select pg_temp.comprobar_recurso('habitacion','id_habitacion',array[1,2,3,4,5,6]);
select pg_temp.comprobar_recurso('tarifa_habitacion','id_tarifa',array[1,2,3,4]);
select pg_temp.comprobar_recurso('servicio','id_servicio',array[1,2,3,4]);
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('cargo')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('cliente')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('empleado')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('reserva')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('estadia')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('mantenimiento')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('pago')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('consumo_servicio')$q$, '22023');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('cuenta_empleado')$q$, '22023');
select pg_temp.denegado('select * from public.cuenta_empleado', '42501');
select pg_temp.denegado($q$update public.pago set monto=1$q$, '42501');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',true);
select pg_temp.comprobar((select empleado_id=5 and hotel_id=2 and rol_sistema='ADMINISTRADOR' from public.mi_cuenta_hotelmanager()),'identidad administrador 2');
select pg_temp.comprobar_recurso('hotel','id_hotel',array[2]);
select pg_temp.comprobar_recurso('tipo_habitacion','id_tipo',array[1,2,3,4,9]);
select pg_temp.comprobar_recurso('habitacion','id_habitacion',array[7,8,9,10,11,12]);
select pg_temp.comprobar_recurso('tarifa_habitacion','id_tarifa',array[5,6,7,8,9]);
select pg_temp.comprobar_recurso('servicio','id_servicio',array[5,6,7,8]);
reset role;
update public.cuenta_empleado set activo = false where empleado_id_empleado = 1;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select pg_temp.comprobar((select count(*)=0 from public.mi_cuenta_hotelmanager()),'administrador desactivado');
select pg_temp.denegado($q$select * from public.consultar_mi_hotel('hotel')$q$, '42501');
reset role;
rollback;
