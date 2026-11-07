-- SOLO PostgreSQL desechable sin red, con Auth simulado, migraciones y demo.
-- Nunca ejecutar este archivo en Supabase remoto; los fixtures son ficticios.
begin;
insert into auth.users(id) values ('00000000-0000-4000-8000-000000000002'), ('00000000-0000-4000-8000-000000000003'), ('00000000-0000-4000-8000-000000000004'), ('00000000-0000-4000-8000-000000000005');
insert into public.cuenta_empleado(auth_user_id,empleado_id_empleado,rol_sistema,activo,fecha_vinculacion) values
 ('00000000-0000-4000-8000-000000000002',2,'RECEPCIONISTA',true,now()),
 ('00000000-0000-4000-8000-000000000003',3,'MANTENIMIENTO',false,now()),
 ('00000000-0000-4000-8000-000000000005',5,'ADMINISTRADOR',true,now());
create function pg_temp.check_ok(ok boolean, m text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception 'Fallo: %',m; end if; end $$;
create function pg_temp.rechaza(q text, e text) returns void language plpgsql as $$ begin begin execute q; exception when others then if sqlstate=e then return; end if; raise exception 'Estado %, esperado %',sqlstate,e; end; raise exception 'Se esperaba %',e; end $$;
create function pg_temp.op(doc text, room bigint, inicio integer, monto numeric, nom text default 'Ejemplo', ape text default 'Prueba') returns jsonb language sql as $$
 select jsonb_build_object('nombre',nom,'apellido',ape,'tipo_documento','DEMO','pais_emisor','TEST','documento',doc,'habitacion_id',room,'entrada',(current_date+inicio)::text,'salida',(current_date+inicio+1)::text,'total',monto)
$$;
create temp table pruebas(k text primary key, token uuid, op jsonb) on commit drop;
grant all on pruebas to authenticated;

do $$ declare f regprocedure; begin
 foreach f in array array['public.solicitar_autorizacion_reserva(jsonb,boolean)'::regprocedure,'public.confirmar_reserva_autorizada(uuid,jsonb)'::regprocedure] loop
  if has_function_privilege('anon',f,'execute') or not has_function_privilege('authenticated',f,'execute') or not exists(select 1 from pg_proc where oid=f and prosecdef and proconfig @> array['search_path=pg_catalog']) then raise exception 'Permisos inseguros: %',f; end if;
 end loop;
 if has_schema_privilege('authenticated','hotelmanager_privado','usage') or has_schema_privilege('anon','hotelmanager_privado','usage') then raise exception 'Esquema privado accesible'; end if;
end $$;
set local role anon;
select pg_temp.rechaza($q$select public.solicitar_autorizacion_reserva('{}',true)$q$,'42501');
select pg_temp.rechaza($q$select public.confirmar_reserva_autorizada(null,'{}')$q$,'42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(pg_temp.op('A',1,300,100),true)->>'estado'='NO_COMPLETADA','sin vínculo');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(pg_temp.op('A',1,300,100),true)->>'estado'='NO_COMPLETADA','cuenta inactiva');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(pg_temp.op('A',1,300,100),true)->>'estado'='NO_COMPLETADA','rol sin permiso');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select pg_temp.rechaza('select * from public.cliente','42501');
select pg_temp.rechaza($q$insert into public.cliente(nombre,apellido,documento) values('A','B','C')$q$,'42501');
select pg_temp.rechaza('select * from hotelmanager_privado.autorizacion_reserva','42501');
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(pg_temp.op('A',1,300,100),false)->>'estado'='NO_COMPLETADA','sin declaración');
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(pg_temp.op('A',7,300,100),true)->>'estado'='NO_COMPLETADA','habitación ajena');
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(jsonb_set(pg_temp.op('A',1,300,100),'{salida}',to_jsonb((current_date+300)::text)),true)->>'estado'='NO_COMPLETADA','fechas inválidas');
select pg_temp.check_ok(public.solicitar_autorizacion_reserva(pg_temp.op('A',1,300,99),true)->>'estado'='NO_COMPLETADA','importe incorrecto');
reset role;
-- Reinicio exclusivo del fixture local para comprobar independientemente cada caso de límite.
delete from hotelmanager_privado.auditoria_reserva;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
-- Cliente nuevo: operación idéntica, autorización vinculada y de uso único.
do $$ declare op jsonb:=pg_temp.op('NEW-001',1,301,100); a jsonb; c jsonb; t uuid; begin
 a:=public.solicitar_autorizacion_reserva(op,true); if a->>'estado'<>'AUTORIZADA' then raise exception 'No se autorizó'; end if; t:=(a->>'autorizacion')::uuid;
 c:=public.confirmar_reserva_autorizada(t,jsonb_set(op,'{total}','99')); if c->>'estado'<>'NO_COMPLETADA' then raise exception 'Cambio no rechazado'; end if;
 c:=public.confirmar_reserva_autorizada(t,op); if c->>'estado'<>'COMPLETADA' then raise exception 'Alta nueva falló: %',c; end if;
 c:=public.confirmar_reserva_autorizada(t,op); if c->>'estado'<>'NO_COMPLETADA' then raise exception 'Reutilización'; end if;
end $$;
reset role;
select pg_temp.check_ok((select count(*)=1 from public.cliente where documento='NEW-001'),'cliente nuevo único');
select pg_temp.check_ok((select count(*)=1 from public.reserva r join public.cliente c on c.id_cliente=r.cliente_id_cliente where c.documento='NEW-001' and r.estado='CONFIRMADA' and r.total_estimado=100),'reserva pactada');
select pg_temp.check_ok((select count(*)=1 from hotelmanager_privado.auditoria_reserva where accion='SOLICITUD' and resultado='AUTORIZADA' and verificacion_declarada),'declaración auditada');
select pg_temp.check_ok(not exists(select 1 from hotelmanager_privado.auditoria_reserva a where to_jsonb(a)::text like '%NEW-001%'),'auditoría sin documento');
update public.tarifa_habitacion set precio_noche=120 where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
select pg_temp.check_ok((select r.total_estimado=100 from public.reserva r join public.cliente c on c.id_cliente=r.cliente_id_cliente where c.documento='NEW-001'),'precio histórico');
update public.tarifa_habitacion set precio_noche=100 where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
delete from hotelmanager_privado.auditoria_reserva;
-- Cliente conocido solo por hotel 2 puede reservar en hotel 1 sin mostrar su ficha.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare op jsonb:=jsonb_set(pg_temp.op('DEMO-CLI-008',1,310,100,'Emiliano','Luna Ortega'),'{pais_emisor}','"SINTETICO"'); a jsonb; c jsonb; begin
 a:=public.solicitar_autorizacion_reserva(op,true); c:=public.confirmar_reserva_autorizada((a->>'autorizacion')::uuid,op);
 if c->>'estado'<>'COMPLETADA' then raise exception 'No se reutilizó cliente global: %',c; end if;
end $$;
reset role;
select pg_temp.check_ok((select count(*)=1 from public.cliente where documento='DEMO-CLI-008'),'sin duplicar global');
select pg_temp.check_ok(exists(select 1 from public.reserva r join public.cliente c on c.id_cliente=r.cliente_id_cliente where c.documento='DEMO-CLI-008' and r.habitacion_id_habitacion=1 and r.fecha_entrada=current_date+310),'primera reserva en hotel 1');
delete from hotelmanager_privado.auditoria_reserva;
-- Documento repetido con coincidencia normalizada y datos diferentes: resultado genérico.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare op jsonb:=pg_temp.op(' new-001 ',2,320,150,'Otro','Nombre'); a jsonb; c jsonb; begin
 a:=public.solicitar_autorizacion_reserva(op,true); c:=public.confirmar_reserva_autorizada((a->>'autorizacion')::uuid,op);
 if c <> '{"estado":"NO_COMPLETADA"}'::jsonb then raise exception 'Debe requerir revisión genérica'; end if;
end $$;
reset role;
select pg_temp.check_ok((select count(*)=1 and min(nombre)='Ejemplo' from public.cliente where lower(btrim(documento))='new-001'),'ficha no modificada');
delete from hotelmanager_privado.auditoria_reserva;
-- Fallo por solapamiento revierte el cliente nuevo, pero conserva consumo y auditoría.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare op jsonb:=pg_temp.op('SOLAPE-001',1,301,100); a jsonb; c jsonb; begin
 a:=public.solicitar_autorizacion_reserva(op,true); c:=public.confirmar_reserva_autorizada((a->>'autorizacion')::uuid,op);
 if c->>'estado'<>'NO_COMPLETADA' then raise exception 'No rechazó solape'; end if;
 insert into pruebas values('solape',(a->>'autorizacion')::uuid,op);
end $$;
reset role;
select pg_temp.check_ok(not exists(select 1 from public.cliente where documento='SOLAPE-001'),'cliente parcial revertido');
select pg_temp.check_ok(exists(select 1 from hotelmanager_privado.autorizacion_reserva where consumida_en is not null and token_hash=extensions.digest((select token::text from pruebas where k='solape'),'sha256')),'consumo persiste tras fallo');
select pg_temp.check_ok(exists(select 1 from hotelmanager_privado.auditoria_reserva where accion='CONFIRMACION' and resultado='NO_COMPLETADA'),'fallo auditado');
delete from hotelmanager_privado.auditoria_reserva;
-- Autorización vencida y apropiación por otro hotel.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare op jsonb:=pg_temp.op('EXPIRE-001',1,330,100); a jsonb; begin a:=public.solicitar_autorizacion_reserva(op,true); insert into pruebas values('vencida',(a->>'autorizacion')::uuid,op); end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',true);
select pg_temp.check_ok((select public.confirmar_reserva_autorizada(token,op)->>'estado'='NO_COMPLETADA' from pruebas where k='vencida'),'token de otro hotel/operador');
reset role;
update hotelmanager_privado.autorizacion_reserva set vence_en=creada_en+interval '1 microsecond' where token_hash=extensions.digest((select token::text from pruebas where k='vencida'),'sha256');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select pg_temp.check_ok((select public.confirmar_reserva_autorizada(token,op)->>'estado'='NO_COMPLETADA' from pruebas where k='vencida'),'token vencido');
reset role;
delete from hotelmanager_privado.auditoria_reserva;
-- Un historial incompleto provoca revisión genérica y no se modifica.
insert into public.cliente(nombre,apellido,tipo_documento,pais_emisor_documento,documento) values('Histórico','Prueba',null,null,'HIST-DEMO');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare op jsonb:=pg_temp.op('HIST-DEMO',1,336,100); a jsonb; c jsonb; begin
 a:=public.solicitar_autorizacion_reserva(op,true); c:=public.confirmar_reserva_autorizada((a->>'autorizacion')::uuid,op);
 if c <> '{"estado":"NO_COMPLETADA"}'::jsonb then raise exception 'Histórico ambiguo no rechazado'; end if;
end $$;
reset role;
select pg_temp.check_ok((select count(*)=1 and bool_and(tipo_documento is null and pais_emisor_documento is null) from public.cliente where documento='HIST-DEMO'),'histórico conservado');
delete from hotelmanager_privado.auditoria_reserva;
-- Cambio de tarifa después de autorizar: no se crea cliente ni reserva.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare op jsonb:=pg_temp.op('TARIFA-NUEVA',1,337,100); a jsonb; begin
 a:=public.solicitar_autorizacion_reserva(op,true); insert into pruebas values('tarifa',(a->>'autorizacion')::uuid,op);
end $$;
reset role;
update public.tarifa_habitacion set precio_noche=120 where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
set local role authenticated;
select pg_temp.check_ok((select public.confirmar_reserva_autorizada(token,op)->>'estado'='NO_COMPLETADA' from pruebas where k='tarifa'),'tarifa modificada');
reset role;
select pg_temp.check_ok(not exists(select 1 from public.cliente where documento='TARIFA-NUEVA'),'tarifa no creó cliente');
update public.tarifa_habitacion set precio_noche=100 where hotel_id_hotel=1 and tipo_habitacion_id_tipo=1;
delete from hotelmanager_privado.auditoria_reserva;
-- Límite de confirmaciones inválidas para el mismo operador.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare i integer; r jsonb; begin
 for i in 1..13 loop r:=public.confirmar_reserva_autorizada('00000000-0000-4000-8000-000000000099',pg_temp.op('NO-EXISTE',1,339,100)); if r->>'estado'<>'NO_COMPLETADA' then raise exception 'Confirmación inválida aceptada'; end if; end loop;
end $$;
reset role;
select pg_temp.check_ok((select count(*)=10 from hotelmanager_privado.auditoria_reserva where accion='CONFIRMACION'),'diez confirmaciones');
select pg_temp.check_ok((select count(*)=1 from hotelmanager_privado.auditoria_reserva where accion='LIMITE_CONFIRMACION'),'bloqueo de confirmaciones agrupado');
delete from hotelmanager_privado.auditoria_reserva;
-- Límite por operador, con una sola marca de bloqueo por ventana.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ declare i integer; r jsonb; begin
 for i in 1..5 loop r:=public.solicitar_autorizacion_reserva(pg_temp.op('RATE-'||i,1,340+i,100),true); if r->>'estado'<>'AUTORIZADA' then raise exception 'Límite prematuro'; end if; end loop;
 for i in 1..3 loop r:=public.solicitar_autorizacion_reserva(pg_temp.op('RATE-X',1,350,100),true); if r->>'estado'<>'NO_COMPLETADA' then raise exception 'Límite no aplicado'; end if; end loop;
end $$;
reset role;
select pg_temp.check_ok((select count(*)=5 from hotelmanager_privado.auditoria_reserva where accion='SOLICITUD'),'cinco intentos');
select pg_temp.check_ok((select count(*)=1 from hotelmanager_privado.auditoria_reserva where accion='LIMITE_SOLICITUD'),'bloqueos agregados');
rollback;
