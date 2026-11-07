-- SOLO base local desechable con Auth simulado y datos demo, nunca remoto.
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
 if to_regprocedure('public.registrar_reserva_confirmada(bigint,bigint,date,date,numeric)') is not null then
  raise exception 'La función de escritura no debe existir en esta prueba'; end if;
 foreach f in array array['public.listar_reservas_mi_hotel()'::regprocedure, 'public.cotizar_reserva(bigint,date,date)'::regprocedure] loop
  if has_function_privilege('anon',f,'execute') or not has_function_privilege('authenticated',f,'execute') or not exists(select 1 from pg_proc where oid=f and prosecdef and proconfig @> array['search_path=pg_catalog']) then raise exception 'Privilegios inseguros para %',f; end if;
 end loop;
end $$;
set local role anon;
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date+1)','42501');
select pg_temp.rechaza('select * from public.reserva','42501');
reset role;
set local role authenticated;
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date+1)','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date+1)','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select pg_temp.rechaza('select * from public.listar_reservas_mi_hotel()','42501');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date+1)','42501');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select pg_temp.check_ok((select array_agg(id_reserva order by id_reserva)=array[1,2,5,7,8,9,10,11,12]::bigint[] from public.listar_reservas_mi_hotel()),'reservas hotel 1');
select pg_temp.check_ok((select total=300 and precio_noche=100 and noches=3 from public.cotizar_reserva(1,current_date+100,current_date+103)),'cotización hotel 1');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date,current_date)','22023');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,null,current_date)','22023');
select pg_temp.rechaza($q$select * from public.cotizar_reserva(1,date 'infinity',date 'infinity')$q$,'22023');
select pg_temp.rechaza('select * from public.cotizar_reserva(7,current_date+100,current_date+101)','22023');
select pg_temp.rechaza('select * from public.cotizar_reserva(999,current_date+100,current_date+101)','22023');
select pg_temp.rechaza('select * from public.reserva','42501');
select pg_temp.rechaza('insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(1,1,current_date,current_date+1,''CANCELADA'',1,current_date)','42501');
reset role;
delete from public.tarifa_habitacion where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
set local role authenticated;
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date+100,current_date+101)','22023');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',true);
select pg_temp.check_ok((select array_agg(id_reserva order by id_reserva)=array[3,4,6,13,14,15,16,17,18]::bigint[] from public.listar_reservas_mi_hotel()),'reservas hotel 2');
select pg_temp.rechaza('select * from public.cotizar_reserva(1,current_date+100,current_date+101)','22023');
select pg_temp.check_ok((select total=100 from public.cotizar_reserva(7,current_date+100,current_date+101)),'cotización hotel 2');
reset role;
rollback;
