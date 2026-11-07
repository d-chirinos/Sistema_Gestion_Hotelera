-- PENDIENTE: especificación provisional de pruebas de escritura futura.
-- NO ejecutar hasta diseñar e implementar el flujo aprobado de identificación de
-- clientes globales. No es migración, seed ni prueba de la etapa de lectura.
-- Algunas expectativas (por ejemplo, igualdad exacta con la tarifa) requieren
-- aprobación funcional antes de convertirse en criterios definitivos.
-- SOLO PostgreSQL local desechable con Auth simulado y datos demo. No ejecutar en remoto.
begin;
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000002'),
 ('00000000-0000-4000-8000-000000000003'),
 ('00000000-0000-4000-8000-000000000004'),
 ('00000000-0000-4000-8000-000000000005');
insert into public.cuenta_empleado(auth_user_id, empleado_id_empleado, rol_sistema, activo, fecha_vinculacion) values
 ('00000000-0000-4000-8000-000000000002',2,'RECEPCIONISTA',true,now()),
 ('00000000-0000-4000-8000-000000000003',3,'MANTENIMIENTO',false,now()),
 ('00000000-0000-4000-8000-000000000005',5,'ADMINISTRADOR',true,now());
create function pg_temp.check_ok(ok boolean, mensaje text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception 'Fallo: %',mensaje; end if; end $$;
create function pg_temp.rechaza(q text, estado text) returns void language plpgsql as $$ begin
  begin execute q; exception when others then if sqlstate=estado then return; end if; raise exception 'SQLSTATE %, esperado %',sqlstate,estado; end;
  raise exception 'Se esperaba error %: %',estado,q;
end $$;

do $$ declare f regprocedure; begin
 foreach f in array array['public.listar_reservas_mi_hotel()'::regprocedure, 'public.cotizar_reserva(bigint,date,date)'::regprocedure, 'public.registrar_reserva_confirmada(bigint,bigint,date,date,numeric)'::regprocedure] loop
  if has_function_privilege('anon',f,'execute') or not has_function_privilege('authenticated',f,'execute') or not exists(select 1 from pg_proc where oid=f and prosecdef and proconfig @> array['search_path=pg_catalog']) then raise exception 'Privilegios inseguros para %',f; end if;
 end loop;
end $$;
set local role anon;
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date+1)','42501');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date,current_date+1,100)','42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date,current_date+1,100)','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date,current_date+1,100)','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date,current_date+1,100)','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select pg_temp.check_ok((select array_agg(id_reserva order by id_reserva)=array[1,2,5,7,8,9,10,11,12]::bigint[] from public.listar_reservas_mi_hotel()),'reservas del hotel 1');
select pg_temp.check_ok((select total=300 and precio_noche=100 and noches=3 from public.cotizar_reserva(1,current_date+100,current_date+103)),'cotización');
reset role;
update public.hotel set zona_horaria = null where id_hotel=1;
set local role authenticated;
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+100,current_date+101,100)','22023');
reset role;
update public.hotel set zona_horaria = 'America/Lima' where id_hotel=1;
delete from public.tarifa_habitacion where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
set local role authenticated;
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+100,current_date+101,100)','22023');
reset role;
insert into public.tarifa_habitacion(id_tarifa,hotel_id_hotel,tipo_habitacion_id_tipo,precio_noche) values(1,1,1,100);
set local role authenticated;

select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date)','22023');
select pg_temp.rechaza($q$select * from public.cotizar_reserva(1,date 'infinity',date 'infinity')$q$,'22023');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,null,current_date+1,100)','22023');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date,current_date+1,100.001)','22023');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+101,current_date+100,100)','22023');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,7,current_date+100,current_date+101,100)','22023');
select pg_temp.rechaza('select * from public.cotizar_reserva(7,current_date+100,current_date+101)','22023');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(999,1,current_date+100,current_date+101,100)','22023');
-- PENDIENTE: probar cliente global existente sin reserva previa en el hotel.
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+100,current_date+103,299)','22023');
select pg_temp.rechaza('insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(1,1,current_date,current_date+1,''CANCELADA'',1,current_date)','42501');
select pg_temp.check_ok((select total_estimado=300 from public.registrar_reserva_confirmada(1,1,current_date+100,current_date+103,300)),'reserva confirmada');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+101,current_date+102,100)','23P01');
select pg_temp.check_ok((select total_estimado=200 from public.registrar_reserva_confirmada(1,1,current_date+103,current_date+105,200)),'reservas consecutivas');
reset role;
insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva)
values(1,1,current_date+120,current_date+121,'CANCELADA',100,current_date);
set local role authenticated;
select pg_temp.check_ok((select total_estimado=100 from public.registrar_reserva_confirmada(1,1,current_date+120,current_date+121,100)),'cancelada no bloquea');
reset role;
insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva)
values(1,1,current_date-200,current_date-198,'COMPLETADA',200,current_date-201);
set local role authenticated;
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date-199,current_date-198,100)','23P01');


reset role;
update public.tarifa_habitacion set precio_noche=120 where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
set local role authenticated;
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+110,current_date+111,100)','22023');
select pg_temp.check_ok((select total_estimado=300 and fecha_reserva=(current_timestamp at time zone 'America/Lima')::date from public.listar_reservas_mi_hotel() where fecha_entrada=current_date+100 and habitacion_id_habitacion=1),'total pactado y fecha local');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',true);
select pg_temp.check_ok((select array_agg(id_reserva order by id_reserva)=array[3,4,6,13,14,15,16,17,18]::bigint[] from public.listar_reservas_mi_hotel()),'reservas del hotel 2');
select pg_temp.rechaza('select * from public.registrar_reserva_confirmada(1,1,current_date+110,current_date+111,120)','22023');
reset role;
rollback;
