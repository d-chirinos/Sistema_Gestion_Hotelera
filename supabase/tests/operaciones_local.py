"""Pruebas destructivas SOLO en contenedor PostgreSQL descartable, vacío y sin red.

Uso: python3 supabase/tests/operaciones_local.py NOMBRE_CONTENEDOR
Requiere etiqueta hotelmanager.prueba=operaciones-descartable. Crea datos ficticios.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import time

env = os.environ.copy()
for key in ('DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH'):
    env.pop(key, None)
docker = ['docker', '--host=unix:///var/run/docker.sock']
if len(sys.argv) != 2:
    raise SystemExit('Indique el contenedor local descartable')
container = sys.argv[1]
info = json.loads(subprocess.check_output(docker + ['inspect', container], text=True, env=env))[0]
if info['HostConfig']['NetworkMode'] != 'none' or (info['Config'].get('Labels') or {}).get('hotelmanager.prueba') != 'operaciones-descartable':
    raise SystemExit('Se requiere contenedor sin red y etiquetado operaciones-descartable')
base = docker + ['exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At']
def sql(text, ok=True):
    proc = subprocess.run(base, input=text, text=True, capture_output=True, env=env)
    if (proc.returncode == 0) != ok:
        raise AssertionError(f'Resultado inesperado: {proc.stderr}')
    return proc.stdout.strip(), proc.stderr

def sesion(user, consulta, ok=True):
    return sql("begin; set local role authenticated; select set_config('request.jwt.claim.sub','" + user + "',true); " + consulta + '; rollback;', ok)

ids = [f'00000000-0000-4000-8000-{n:012d}' for n in range(1, 6)]
if sql("select not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','v','m','f')) and not exists(select 1 from pg_namespace where nspname in ('auth','extensions'))")[0] != 't':
    raise SystemExit('La base no está vacía')
sql("create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create schema extensions;")
for f in ('supabase/migrations/20261107000000_hotelmanager_estructura_inicial.sql', 'supabase/migrations/20261107010000_consultas_seguras.sql', 'supabase/migrations/20261107020000_reservas_seguras.sql', 'supabase/demo/datos_academicos_sinteticos.sql'):
    sql(Path(f).read_text())
sql('insert into auth.users values ' + ','.join("('" + u + "')" for u in ids) + "; insert into public.cuenta_empleado values " + ','.join(f"('{ids[n-1]}',{emp},'{rol}',{activo},now())" for n, emp, rol, activo in [(1, 1, 'ADMINISTRADOR', 'true'), (2, 2, 'RECEPCIONISTA', 'true'), (3, 3, 'ADMINISTRADOR', 'false'), (5, 5, 'ADMINISTRADOR', 'true')]))
tables = ['hotel', 'cargo', 'tipo_habitacion', 'cliente', 'empleado', 'habitacion', 'tarifa_habitacion', 'servicio', 'reserva', 'estadia', 'mantenimiento', 'pago', 'consumo_servicio', 'cuenta_empleado']
def snapshot():
    return [json.loads(sql(f"select coalesce(jsonb_agg(x order by x::text),'[]'::jsonb) from (select to_jsonb(t) x from public.{t} t) z")[0]) for t in tables]
before = snapshot()
assert sum(map(len, before[:-1])) == 106 and len(before[-1]) == 4
for f in ('supabase/migrations/20261107030000_operaciones_lectura.sql','supabase/migrations/20261107040000_pagos_y_precios.sql','supabase/migrations/20261107050000_estadias_seguras.sql','supabase/migrations/20261107060000_consumos_mantenimiento.sql','supabase/migrations/20261107070000_altas_administrativas.sql','supabase/migrations/20261107080000_indicadores_y_gestion.sql','supabase/migrations/20261107090000_clientes_y_reservas_hotel.sql','supabase/migrations/20261107100000_alta_cliente_primera_reserva.sql'):
    sql(Path(f).read_text())
assert snapshot() == before, 'La migración cambió registros existentes'
assert sql("select has_function_privilege('anon','public.consultar_operaciones_hotel(text)','EXECUTE'), has_function_privilege('authenticated','public.consultar_operaciones_hotel(text)','EXECUTE'), has_table_privilege('authenticated','public.pago','INSERT')")[0] == 'f|t|f'
for firma in ('public.registrar_pago_reserva(bigint,numeric,text,uuid)', 'public.actualizar_tarifa_hotel(bigint,numeric,numeric)', 'public.actualizar_precio_servicio(bigint,numeric,numeric)', 'public.registrar_checkin(bigint)', 'public.registrar_checkout(bigint)'):
    assert sql(f"select has_function_privilege('anon','{firma}','EXECUTE'),has_function_privilege('authenticated','{firma}','EXECUTE')")[0] == 'f|t'
for user in ids[1:4]:
    for command in ("select * from public.consultar_operaciones_hotel('pagos')", "select * from public.registrar_pago_reserva(1,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000001')", "select * from public.actualizar_tarifa_hotel(1,100,101)", "select * from public.registrar_checkin(7)", "select * from public.registrar_checkout(5)"):
        sesion(user, command, False)
sql("set role anon; select * from public.consultar_operaciones_hotel('pagos')", False)
sesion(ids[0], 'select * from public.pago', False)
sesion(ids[0], "select * from public.consultar_operaciones_hotel('clientes')", False)
for recurso, counts in {'estadias':(3,3),'pagos':(6,6),'consumos':(4,4),'mantenimiento':(2,2),'empleados':(4,4),'cargos':(4,4)}.items():
    for user, count in zip((ids[0],ids[4]),counts):
        out, _ = sesion(user, f"select count(*) from public.consultar_operaciones_hotel('{recurso}')")
        assert f'\n{count}\n' in out, (recurso,out)
esperados = {
    'estadias': ('id_estadia', '1,2,5', '3,4,6'),
    'pagos': ('id_pago', '1,2,3,4,9,10', '5,6,7,8,11,12'),
    'consumos': ('id_consumo', '1,2,3,7', '4,5,6,8'),
    'mantenimiento': ('id_mantenimiento', '1,3', '2,4'),
}
for recurso, (campo, primero, segundo) in esperados.items():
    for user, esperado in ((ids[0], primero), (ids[4], segundo)):
        out, _ = sesion(user, f"select string_agg(x->>'{campo}',',' order by (x->>'{campo}')::bigint) from public.consultar_operaciones_hotel('{recurso}') x")
        assert f'\n{esperado}\n' in out, (recurso, out)
out, _ = sesion(ids[0], "select string_agg(x->>'id_empleado',',' order by x->>'id_empleado') from public.consultar_operaciones_hotel('empleados') x")
assert '\n1,2,3,4\n' in out
out, _ = sesion(ids[4], "select string_agg(x->>'id_empleado',',' order by x->>'id_empleado') from public.consultar_operaciones_hotel('empleados') x")
assert '\n5,6,7,8\n' in out
for command in ("select * from public.registrar_pago_reserva(3,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000001')", "select * from public.registrar_pago_reserva(1,-1,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000001')", "select * from public.registrar_pago_reserva(12,1,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000001')", "select * from public.actualizar_precio_servicio(5,0,1)", "select * from public.actualizar_tarifa_hotel(1,100,0)"):
    sesion(ids[0],command,False)
key='aaaaaaaa-0000-4000-8000-000000000001'
out, _ = sesion(ids[0], f"select tipo_pago,repetido from public.registrar_pago_reserva(1,10,'EFECTIVO','{key}'); select tipo_pago,repetido from public.registrar_pago_reserva(1,10,'EFECTIVO','{key}')")
assert 'ORDINARIO|f' in out and 'ORDINARIO|t' in out
sesion(ids[0],f"select * from public.registrar_pago_reserva(1,10,'EFECTIVO','{key}'); select * from public.registrar_pago_reserva(1,11,'EFECTIVO','{key}')",False)
out,_=sesion(ids[0], "select tipo_pago from public.registrar_pago_reserva(7,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000002')")
assert 'ADELANTO' in out
sesion(ids[0], "select * from public.actualizar_tarifa_hotel(1,100,101); select * from public.actualizar_tarifa_hotel(1,100,102)",False)
sesion(ids[0], "select * from public.actualizar_tarifa_hotel(1,100,101)")
sesion(ids[0], "select * from public.actualizar_precio_servicio(1,0,1)")
# Un check-in histórico sin instante requiere conciliación; toda la transacción se revierte.
sql("begin; update public.estadia set fecha_hora_checkin=null where reserva_id_reserva=1; set local role authenticated; select set_config('request.jwt.claim.sub','" + ids[0] + "',true); select * from public.registrar_pago_reserva(1,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000004'); rollback", False)
# Fechas históricas contradictorias no se reclasifican automáticamente.
_, error_futuro = sql("begin; update public.estadia set fecha_hora_checkin=clock_timestamp()+interval '1 day' where reserva_id_reserva=5; set local role authenticated; select set_config('request.jwt.claim.sub','" + ids[0] + "',true); select * from public.registrar_pago_reserva(5,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000006'); rollback", False)
assert 'requiere conciliación' in error_futuro
# Ni un error tras el registro deja un pago parcial.
sesion(ids[0], "select * from public.registrar_pago_reserva(7,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000005'); select 1/0", False)
# Ocupación completa de una reserva artificial en una única transacción que se revierte.
sql("""begin;
insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99001,1,1,'TEST-99001','DISPONIBLE');
insert into public.reserva(id_reserva,cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(99001,1,99001,(clock_timestamp() at time zone 'America/Lima')::date,(clock_timestamp() at time zone 'America/Lima')::date+1,'CONFIRMADA',100,(clock_timestamp() at time zone 'America/Lima')::date);
set local role authenticated; select set_config('request.jwt.claim.sub','""" + ids[0] + """',true);
select id_estadia as estadia_test from public.registrar_checkin(99001) \\gset
reset role;
do $$begin if (select estado from public.habitacion where id_habitacion=99001)<>'OCUPADA' or not exists(select 1 from public.estadia where reserva_id_reserva=99001 and empleado_id_empleado=1) then raise exception 'check-in inconsistente'; end if; end$$;
set local role authenticated; select pg_sleep(0.01); select * from public.registrar_checkout(:estadia_test);
reset role;
do $$begin if (select estado from public.habitacion where id_habitacion=99001)<>'DISPONIBLE' or (select estado from public.reserva where id_reserva=99001)<>'COMPLETADA' or (select total_estimado from public.reserva where id_reserva=99001)<>100 then raise exception 'check-out inconsistente'; end if; end$$;
rollback;""")
sesion(ids[0], 'select * from public.registrar_checkin(3)', False)
sesion(ids[0], 'select * from public.registrar_checkout(6)', False)
sql("begin; update public.estadia set fecha_hora_checkin=null where id_estadia=5; set local role authenticated; select set_config('request.jwt.claim.sub','" + ids[0] + "',true); select * from public.registrar_checkout(5); rollback", False)
# Un mantenimiento histórico ambiguo no se interpreta como abierto ni se modifica; se bloquea check-in.
sql("""begin;
insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99003,1,1,'TEST-99003','DISPONIBLE');
insert into public.mantenimiento(id_mantenimiento,habitacion_id_habitacion,empleado_id_empleado,fecha_inicio,tipo) values(99003,99003,1,current_date,'Histórico de prueba');
insert into public.reserva(id_reserva,cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(99003,1,99003,(clock_timestamp() at time zone 'America/Lima')::date,(clock_timestamp() at time zone 'America/Lima')::date+1,'CONFIRMADA',100,current_date);
set local role authenticated; select set_config('request.jwt.claim.sub','""" + ids[0] + """',true); select * from public.registrar_checkin(99003); rollback;""",False)
# Consumo y mantenimiento nuevos usan IDs aleatorios como identificadores idempotentes.
for firma in ('public.registrar_consumo_estadia(bigint,bigint,integer,numeric,bigint)', 'public.iniciar_mantenimiento_hotel(bigint,text,bigint)', 'public.finalizar_mantenimiento_hotel(bigint,numeric,boolean)', 'public.liberar_habitacion_mantenimiento(bigint)'):
    assert sql(f"select has_function_privilege('anon','{firma}','EXECUTE'),has_function_privilege('authenticated','{firma}','EXECUTE')")[0]=='f|t'
for user in ids[1:4]:
    sesion(user, 'select * from public.registrar_consumo_estadia(5,2,1,20,2305843009213694001)', False)
    sesion(user, "select * from public.iniciar_mantenimiento_hotel(1,'Prueba',2305843009213694002)", False)
    sesion(user, 'select * from public.finalizar_mantenimiento_hotel(2305843009213694002,0,true)', False)
    sesion(user, 'select * from public.liberar_habitacion_mantenimiento(1)', False)
for command in ('select * from public.registrar_consumo_estadia(6,2,1,20,2305843009213694001)', 'select * from public.registrar_consumo_estadia(5,6,1,20,2305843009213694001)', 'select * from public.registrar_consumo_estadia(5,2,0,20,2305843009213694001)', 'select * from public.registrar_consumo_estadia(1,2,1,20,2305843009213694001)', "select * from public.iniciar_mantenimiento_hotel(7,'Prueba',2305843009213694002)", 'select * from public.finalizar_mantenimiento_hotel(1,0,true)'):
    sesion(ids[0], command, False)
_,err_precio = sesion(ids[0], 'select * from public.registrar_consumo_estadia(5,2,2,19,2305843009213694001)', False)
assert 'precio ha cambiado' in err_precio
sesion(ids[0], 'select * from public.registrar_consumo_estadia(5,2,2,20,2305843009213694001); select 1/0', False)
out,_=sesion(ids[0], 'select repetido from public.registrar_consumo_estadia(5,2,2,20,2305843009213694001); select repetido from public.registrar_consumo_estadia(5,2,2,20,2305843009213694001)')
assert '\nf\n' in out and '\nt\n' in out
sesion(ids[0], 'select * from public.registrar_consumo_estadia(5,2,2,20,2305843009213694001); select * from public.registrar_consumo_estadia(5,2,3,20,2305843009213694001)', False)
# Con una reserva confirmada futura no se inicia una intervención de duración desconocida.
_,err_reserva=sql("""begin;
insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99006,1,1,'TEST-99006','DISPONIBLE');
insert into public.reserva(id_reserva,cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(99006,1,99006,(clock_timestamp() at time zone 'America/Lima')::date+30,(clock_timestamp() at time zone 'America/Lima')::date+31,'CONFIRMADA',100,current_date);
set local role authenticated; select set_config('request.jwt.claim.sub','""" + ids[0] + """',true); select * from public.iniciar_mantenimiento_hotel(99006,'Prueba',2305843009213694006); rollback;""",False)
assert 'requiere revisión' in err_reserva
sql("""begin;
insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99004,1,1,'TEST-99004','DISPONIBLE');
set local role authenticated; select set_config('request.jwt.claim.sub','""" + ids[0] + """',true);
select * from public.iniciar_mantenimiento_hotel(99004,'Prueba',2305843009213694002);
select * from public.iniciar_mantenimiento_hotel(99004,'Prueba',2305843009213694002);
select * from public.finalizar_mantenimiento_hotel(2305843009213694002,12,true);
select * from public.finalizar_mantenimiento_hotel(2305843009213694002,12,true);
reset role;
do $$begin if (select estado from public.habitacion where id_habitacion=99004)<>'MANTENIMIENTO' then raise exception 'No debe liberarse automáticamente'; end if; end$$;
set local role authenticated; select * from public.liberar_habitacion_mantenimiento(99004);
reset role;
do $$begin if (select estado from public.habitacion where id_habitacion=99004)<>'DISPONIBLE' then raise exception 'Liberación inconsistente'; end if; end$$;
rollback;""")
# Altas de catálogo: un reintento no duplica y nunca modifica el registro existente.
for firma in ('public.crear_servicio_hotel(text,numeric)', 'public.crear_habitacion_hotel(text,bigint,integer)'):
    assert sql(f"select has_function_privilege('anon','{firma}','EXECUTE'),has_function_privilege('authenticated','{firma}','EXECUTE')")[0] == 'f|t'
for user in ids[1:4]:
    sesion(user, "select * from public.crear_servicio_hotel('Prueba local',10)", False)
    sesion(user, "select * from public.crear_habitacion_hotel('Prueba local',1,1)", False)
for command in ("select * from public.crear_servicio_hotel(' ',10)", "select * from public.crear_servicio_hotel('Prueba local',-1)", "select * from public.crear_servicio_hotel('Prueba local',1.111)", "select * from public.crear_habitacion_hotel('Prueba local',999999,1)"):
    sesion(ids[0],command,False)
out,_=sesion(ids[0], "select repetido from public.crear_servicio_hotel(' Servicio local ',12); select repetido from public.crear_servicio_hotel('servicio local',12)")
assert '\nf\n' in out and '\nt\n' in out
out,_=sesion(ids[0], "select repetido from public.crear_habitacion_hotel(' H-LOCAL ',1,1); select repetido from public.crear_habitacion_hotel('h-local',1,1)")
assert '\nf\n' in out and '\nt\n' in out
sesion(ids[0], "select * from public.crear_servicio_hotel('Servicio local',12); select * from public.crear_servicio_hotel('Servicio local',13)", False)
sesion(ids[0], "select * from public.crear_habitacion_hotel('H-LOCAL',1,1); select * from public.crear_habitacion_hotel('H-LOCAL',1,2)", False)
sesion(ids[0], "select * from public.crear_servicio_hotel('Servicio local',12); select 1/0", False)
# El mismo nombre puede existir en dos hoteles sin mezclar registros.
sql("""begin; set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_servicio_hotel('Servicio compartido',12); select set_config('request.jwt.claim.sub','"""+ids[4]+"""',true); select * from public.crear_servicio_hotel('Servicio compartido',15); reset role; do $$begin if (select count(*) from public.servicio where lower(btrim(nombre))='servicio compartido')<>2 then raise exception 'Hoteles mezclados'; end if; end$$; rollback;""")
# Una tarifa de otro hotel no autoriza un tipo ajeno al propio.
sql("""begin; insert into public.tipo_habitacion(id_tipo,nombre,capacidad) values(99001,'Tipo local de prueba',1);
insert into public.tarifa_habitacion(hotel_id_hotel,tipo_habitacion_id_tipo,precio_noche) values(2,99001,10);
set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_habitacion_hotel('Prueba',99001,1); rollback;""",False)
# Indicadores y saldos se limitan al hotel y no dan acceso a identidades de otros hoteles.
for firma in ('public.resumen_operativo_mi_hotel()', 'public.saldo_informativo_reserva(bigint)', 'public.registrar_empleado_hotel(text,text,text,bigint,date)', 'public.actualizar_empleado_sin_historial(bigint,text,text,text,bigint,date,text,text,text,bigint,date)', 'public.actualizar_habitacion_sin_historial(bigint,text,bigint,integer,text,bigint,integer)'):
    assert sql(f"select has_function_privilege('anon','{firma}','EXECUTE'),has_function_privilege('authenticated','{firma}','EXECUTE')")[0]=='f|t'
for user in ids[1:4]:
    for c in ('select * from public.resumen_operativo_mi_hotel()', 'select * from public.saldo_informativo_reserva(1)', "select * from public.registrar_empleado_hotel('Persona','Prueba','DOC-LOCAL',1,'2026-01-01')", "select * from public.actualizar_empleado_sin_historial(5,'Nombre','Apellido','DOC',1,'2026-01-01','Nuevo','Apellido','DOC',1,'2026-01-01')", "select * from public.actualizar_habitacion_sin_historial(1,'D-001',1,1,'D-002',1,1)"):
        sesion(user,c,False)
sesion(ids[0], 'select * from public.saldo_informativo_reserva(3)', False)
out,_=sesion(ids[0], 'select reservas_confirmadas+reservas_completadas+reservas_canceladas from public.resumen_operativo_mi_hotel()')
assert '\n9\n' in out
out,_=sesion(ids[4], 'select reservas_confirmadas+reservas_completadas+reservas_canceladas from public.resumen_operativo_mi_hotel()')
assert '\n9\n' in out
out,_=sesion(ids[0], "select completo, saldo is not null from public.saldo_informativo_reserva(1)")
assert '\nt|t\n' in out
out,_=sesion(ids[0], 'select saldo is null from public.saldo_informativo_reserva(12)')
assert '\nt\n' in out
# Una referencia histórica a un servicio de otro hotel no se convierte en saldo aparentemente completo.
sql("""begin; update public.consumo_servicio set servicio_id_servicio=5 where id_consumo=1; set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); do $$ begin if not exists(select 1 from public.saldo_informativo_reserva(1) where not completo and saldo is null and consumos is null) then raise exception 'Saldo inconsistente'; end if; end $$; rollback;""")
out,_=sesion(ids[0], "select repetido from public.registrar_empleado_hotel('Nombre local','Apellido local','DOC-PRUEBA',1,'2026-01-01'); select repetido from public.registrar_empleado_hotel('Nombre local','Apellido local','doc-prueba',1,'2026-01-01')")
assert '\nf\n' in out and '\nt\n' in out
sesion(ids[0], "select * from public.registrar_empleado_hotel('Nombre local','Apellido local','DOC-PRUEBA',1,'2026-01-01'); select * from public.registrar_empleado_hotel('Distinto','Apellido local','DOC-PRUEBA',1,'2026-01-01')", False)
sesion(ids[0], "select * from public.registrar_empleado_hotel('Nombre local','Apellido local','DOC-PRUEBA',999999,'2026-01-01')", False)
sesion(ids[0], "select * from public.registrar_empleado_hotel('Nombre local','Apellido local','DOC-PRUEBA',1,'2026-01-01'); select 1/0", False)
# Dos documentos históricos iguales se mantienen intactos y exigen conciliación.
_,err_duplicado=sql("""begin; insert into public.empleado(hotel_id_hotel,cargo_id_cargo,nombre,apellido,documento,fecha_ingreso) values(1,1,'Uno','Prueba','DOC-DUP','2026-01-01'),(1,1,'Dos','Prueba','DOC-DUP','2026-01-01'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.registrar_empleado_hotel('Uno','Prueba','DOC-DUP',1,'2026-01-01'); rollback;""",False)
assert 'conciliación' in err_duplicado
# Edición de empleado requiere versión anterior, documento y ausencia de cuenta o historial.
sesion(ids[0], "select * from public.actualizar_empleado_sin_historial(5,'Nombre','Apellido','DOC',1,'2026-01-01','Nuevo','Apellido','DOC',1,'2026-01-01')",False)
sql("""begin; insert into public.empleado(id_empleado,hotel_id_hotel,cargo_id_cargo,nombre,apellido,documento,fecha_ingreso) values(99012,1,1,'Nombre','Apellido','DOC-ANTES','2026-01-01'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.actualizar_empleado_sin_historial(99012,'Nombre','Apellido','DOC-ANTES',1,'2026-01-01','Nuevo','Apellido','DOC-NUEVO',1,'2026-01-02'); reset role; do $$begin if not exists(select 1 from public.empleado where id_empleado=99012 and nombre='Nuevo' and documento='DOC-NUEVO') then raise exception 'Empleado inconsistente'; end if; end$$; rollback;""")
_,err_cuenta=sql("""begin; insert into public.empleado(id_empleado,hotel_id_hotel,cargo_id_cargo,nombre,apellido,documento,fecha_ingreso) values(99013,1,1,'Nombre','Apellido','DOC-CUENTA','2026-01-01'); insert into public.cuenta_empleado values('"""+ids[3]+"""',99013,'RECEPCIONISTA',true,now()); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.actualizar_empleado_sin_historial(99013,'Nombre','Apellido','DOC-CUENTA',1,'2026-01-01','Nuevo','Apellido','DOC-NUEVO',1,'2026-01-02'); rollback;""",False)
assert 'cuenta o historial' in err_cuenta
_,err_autor=sql("""begin; insert into public.empleado(id_empleado,hotel_id_hotel,cargo_id_cargo,nombre,apellido,documento,fecha_ingreso) values(99014,1,1,'Nombre','Apellido','DOC-AUTOR','2026-01-01'); insert into public.mantenimiento(habitacion_id_habitacion,empleado_id_empleado,fecha_inicio,tipo) values(1,99014,current_date,'Prueba'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.actualizar_empleado_sin_historial(99014,'Nombre','Apellido','DOC-AUTOR',1,'2026-01-01','Nuevo','Apellido','DOC-NUEVO',1,'2026-01-02'); rollback;""",False)
assert 'cuenta o historial' in err_autor
# Solo una habitación sin referencias históricas puede modificarse.
sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,piso,estado) values(99010,1,1,'TEST-99010',1,'DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.actualizar_habitacion_sin_historial(99010,'TEST-99010',1,1,'TEST-NUEVO',1,2); reset role; do $$begin if not exists(select 1 from public.habitacion where id_habitacion=99010 and numero='TEST-NUEVO' and piso=2) then raise exception 'Actualización inconsistente'; end if; end$$; rollback;""")
_,err_hist=sesion(ids[0], "select * from public.actualizar_habitacion_sin_historial(1,'D-001',1,1,'TEST-NUEVO',1,2)",False)
assert 'historial requiere revisión' in err_hist
# Clientes y detalle nunca revelan vínculos exclusivos de otro hotel.
for firma in ('public.listar_clientes_mi_hotel()', 'public.detalle_cliente_mi_hotel(bigint)', 'public.crear_reserva_cliente_conocido(bigint,bigint,date,date,numeric,bigint)'):
    assert sql(f"select has_function_privilege('anon','{firma}','EXECUTE'),has_function_privilege('authenticated','{firma}','EXECUTE')")[0]=='f|t'
for user in ids[1:4]:
    sesion(user,'select * from public.listar_clientes_mi_hotel()',False)
    sesion(user,'select * from public.detalle_cliente_mi_hotel(1)',False)
    sesion(user,'select * from public.crear_reserva_cliente_conocido(1,1,current_date+300,current_date+302,100,4503599627370501)',False)
out,_=sesion(ids[0], 'select count(*) from public.detalle_cliente_mi_hotel(8)')
assert '\n0\n' in out
out,_=sesion(ids[0], 'select count(*) from public.detalle_cliente_mi_hotel(999999)')
assert '\n0\n' in out
out,_=sesion(ids[0], 'select count(*) from public.detalle_cliente_mi_hotel(1)')
assert '\n1\n' in out
# Una habitación de prueba permite verificar creación, repetición, tarifa y rollback.
sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99022,1,1,'TEST-99022','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_reserva_cliente_conocido(1,99022,current_date+300,current_date+302,100,4503599627370501); select * from public.crear_reserva_cliente_conocido(1,99022,current_date+300,current_date+302,100,4503599627370501); reset role; do $$begin if not exists(select 1 from public.reserva where id_reserva=4503599627370501 and total_estimado=200 and estado='CONFIRMADA') then raise exception 'Importe o reserva inconsistente'; end if; end$$; rollback;""")
# Cambiar la tarifa después de reservar no altera el importe y el reintento conserva el resultado.
sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99025,1,1,'TEST-99025','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_reserva_cliente_conocido(1,99025,current_date+300,current_date+302,100,4503599627370507); select * from public.actualizar_tarifa_hotel(1,100,120); select * from public.crear_reserva_cliente_conocido(1,99025,current_date+300,current_date+302,100,4503599627370507); reset role; do $$begin if (select total_estimado from public.reserva where id_reserva=4503599627370507)<>200 then raise exception 'Importe histórico alterado'; end if; end$$; rollback;""")
_,err_datos=sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99026,1,1,'TEST-99026','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_reserva_cliente_conocido(1,99026,current_date+300,current_date+302,100,4503599627370508); select * from public.crear_reserva_cliente_conocido(1,99026,current_date+300,current_date+303,100,4503599627370508); rollback;""",False)
assert 'Operación no disponible' in err_datos
# El cliente exclusivo de otro hotel y el ID inexistente reciben el mismo error genérico.
_,ajeno=sesion(ids[0], 'select * from public.crear_reserva_cliente_conocido(8,1,current_date+300,current_date+302,100,4503599627370502)',False)
_,ausente=sesion(ids[0], 'select * from public.crear_reserva_cliente_conocido(999999,1,current_date+300,current_date+302,100,4503599627370502)',False)
assert 'Operación no disponible' in ajeno and 'Operación no disponible' in ausente
sesion(ids[0], 'select * from public.crear_reserva_cliente_conocido(1,7,current_date+300,current_date+302,100,4503599627370502)',False)
sesion(ids[0], 'select * from public.crear_reserva_cliente_conocido(1,1,current_date+302,current_date+300,100,4503599627370502)',False)
sesion(ids[0], 'select * from public.crear_reserva_cliente_conocido(1,1,current_date+300,current_date+302,-1,4503599627370502)',False)
sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99023,1,1,'TEST-99023','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_reserva_cliente_conocido(1,99023,current_date+300,current_date+302,100,4503599627370503); select 1/0; rollback;""",False)
# Un cliente nuevo y su primera reserva se crean o revierten conjuntamente.
firma='public.crear_cliente_y_primera_reserva(text,text,text,text,text,bigint,date,date,numeric,bigint)'
assert sql(f"select has_function_privilege('anon','{firma}','EXECUTE'),has_function_privilege('authenticated','{firma}','EXECUTE')")[0]=='f|t'
for user in ids[1:4]:
    sesion(user,"select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-NUEVO',1,current_date+500,current_date+502,100,4503599627370601)",False)
sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99031,1,1,'TEST-99031','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-NUEVO-1',99031,current_date+500,current_date+502,100,4503599627370601); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-NUEVO-1',99031,current_date+500,current_date+502,100,4503599627370601); reset role; do $$begin if (select count(*) from public.cliente where documento='DEMO-NUEVO-1')<>1 or not exists(select 1 from public.reserva where id_reserva=4503599627370601 and total_estimado=200) then raise exception 'Alta inconsistente'; end if; end$$; rollback;""")
# Cambiar los datos con la misma clave no reutiliza ni modifica el cliente.
_,err_clave=sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99036,1,1,'TEST-99036','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-CLAVE',99036,current_date+500,current_date+502,100,4503599627370609); select * from public.crear_cliente_y_primera_reserva('Distinto','Local','DEMO','SINTETICO','DEMO-CLAVE',99036,current_date+500,current_date+502,100,4503599627370609); rollback;""",False)
assert 'No se pudo completar la solicitud; revise los datos' in err_clave
# Un documento del propio hotel tampoco se vincula automáticamente.
_,err_propio=sesion(ids[0],"select * from public.crear_cliente_y_primera_reserva('Valeria','Quispe Salazar','DEMO','SINTETICO','DEMO-CLI-001',1,current_date+500,current_date+502,100,4503599627370610)",False)
assert 'No se pudo completar la solicitud; revise los datos' in err_propio
_,err_duplicado=sesion(ids[0],"select * from public.crear_cliente_y_primera_reserva('Otro','Nombre','DEMO','SINTETICO','DEMO-CLI-008',1,current_date+500,current_date+502,100,4503599627370602)",False)
assert 'No se pudo completar la solicitud; revise los datos' in err_duplicado and 'duplicate key' not in err_duplicado
_,err_historico=sql("""begin; insert into public.cliente(nombre,apellido,documento) values('Histórico','Prueba','DEMO-AMBIGUO'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-AMBIGUO',1,current_date+500,current_date+502,100,4503599627370602); rollback;""",False)
assert 'No se pudo completar la solicitud; revise los datos' in err_historico
sesion(ids[0],"select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-NUEVO',7,current_date+500,current_date+502,100,4503599627370602)",False)
sesion(ids[0],"select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-NUEVO',1,current_date+502,current_date+500,100,4503599627370602)",False)
sql("""begin; insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99032,1,1,'TEST-99032','DISPONIBLE'); set local role authenticated; select set_config('request.jwt.claim.sub','"""+ids[0]+"""',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-ROLLBACK',99032,current_date+500,current_date+502,100,4503599627370603); select 1/0; rollback;""",False)
assert snapshot() == before, 'Las pruebas transaccionales modificaron datos'
# Dos clientes concurrentes, misma clave y solicitud. Ambas respuestas deben corresponder al mismo pago.
cmd = f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select id_pago,repetido from public.registrar_pago_reserva(7,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000003'); select pg_sleep(1); commit;"
results=[]
def run(): results.append(sql(cmd)[0])
a=threading.Thread(target=run); b=threading.Thread(target=run); a.start(); time.sleep(.15); b.start(); a.join(); b.join()
assert len(results)==2 and any('|f' in x for x in results) and any('|t' in x for x in results), results
assert sql("select count(*) from public.pago where clave_idempotencia='aaaaaaaa-0000-4000-8000-000000000003'")[0] == '1'
# Dos check-in simultáneos para una misma reserva nunca crean dos estadías.
sql("insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99002,1,1,'TEST-99002','DISPONIBLE'); insert into public.reserva(id_reserva,cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) values(99002,1,99002,(clock_timestamp() at time zone 'America/Lima')::date,(clock_timestamp() at time zone 'America/Lima')::date+1,'CONFIRMADA',100,(clock_timestamp() at time zone 'America/Lima')::date)")
comando = f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.registrar_checkin(99002); select pg_sleep(0.8); commit;"
resultados=[]
def competir(comando):
    p=subprocess.run(base,input=comando,text=True,capture_output=True,env=env)
    resultados.append(p.returncode)
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
assert sql("select count(*) from public.estadia where reserva_id_reserva=99002")[0]=='1'
estadia=sql("select id_estadia from public.estadia where reserva_id_reserva=99002")[0]
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.registrar_checkout({estadia}); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
assert sql("select estado from public.habitacion where id_habitacion=99002")[0]=='DISPONIBLE'
assert sql("select estado from public.reserva where id_reserva=99002")[0]=='COMPLETADA'
# Reintentos concurrentes del consumo conservan el mismo precio y una única fila.
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.registrar_consumo_estadia(5,2,2,20,2305843009213694003); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.consumo_servicio where id_consumo=2305843009213694003")[0]=='1'
assert sql("select precio_unitario_aplicado from public.consumo_servicio where id_consumo=2305843009213694003")[0]=='20.00'
out,_=sesion(ids[0], "select jsonb_typeof(x->'id_consumo') from public.consultar_operaciones_hotel('consumos') x where x->>'id_consumo'='2305843009213694003'")
assert '\nstring\n' in out
# Inicio simultáneo con la misma clave produce una sola intervención.
sql("insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99005,1,1,'TEST-99005','DISPONIBLE')")
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.iniciar_mantenimiento_hotel(99005,'Prueba',2305843009213694004); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.mantenimiento where id_mantenimiento=2305843009213694004")[0]=='1'
assert sql("select estado from public.habitacion where id_habitacion=99005")[0]=='MANTENIMIENTO'
# Dos altas concurrentes del mismo servicio se serializan por hotel y nombre normalizado.
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_servicio_hotel('Servicio concurrente',12); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.servicio where hotel_id_hotel=1 and lower(btrim(nombre))='servicio concurrente'")[0]=='1'
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_habitacion_hotel('H-CONCURRENTE',1,1); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.habitacion where hotel_id_hotel=1 and lower(btrim(numero))='h-concurrente'")[0]=='1'
# Las altas de empleados con el mismo documento se serializan en el propio hotel.
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.registrar_empleado_hotel('Nombre local','Apellido local','DOC-CONCURRENTE',1,'2026-01-01'); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.empleado where hotel_id_hotel=1 and lower(btrim(documento))='doc-concurrente'")[0]=='1'
# Dos ediciones con la misma versión anterior no se sobrescriben mutuamente.
sql("insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,piso,estado) values(99011,1,1,'TEST-99011',1,'DISPONIBLE')")
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.actualizar_habitacion_sin_historial(99011,'TEST-99011',1,1,'TEST-EDITADA',1,2); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
# Dos ediciones del mismo empleado no sobrescriben una versión anterior.
sql("insert into public.empleado(id_empleado,hotel_id_hotel,cargo_id_cargo,nombre,apellido,documento,fecha_ingreso) values(99015,1,1,'Nombre','Apellido','DOC-ORIGINAL','2026-01-01')")
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.actualizar_empleado_sin_historial(99015,'Nombre','Apellido','DOC-ORIGINAL',1,'2026-01-01','Nuevo','Apellido','DOC-NUEVO',1,'2026-01-02'); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
# El mismo ID se reintenta sin duplicados; IDs distintos para fechas superpuestas compiten.
sql("insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99024,1,1,'TEST-99024','DISPONIBLE')")
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_reserva_cliente_conocido(1,99024,current_date+400,current_date+402,100,4503599627370504); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.reserva where id_reserva=4503599627370504")[0]=='1'
resultados.clear()
base_res=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_reserva_cliente_conocido(1,99024,current_date+410,current_date+412,100,"
cmd1=base_res+"4503599627370505); select pg_sleep(0.8); commit;"
cmd2=base_res+"4503599627370506); commit;"
a=threading.Thread(target=competir,args=(cmd1,)); b=threading.Thread(target=competir,args=(cmd2,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
# Un mismo documento concurrente no genera dos clientes ni dos reservas.
sql("insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99033,1,1,'TEST-99033','DISPONIBLE'),(99034,1,1,'TEST-99034','DISPONIBLE')")
resultados.clear()
pref=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-CONCURRENTE',"
cmd1=pref+"99033,current_date+500,current_date+502,100,4503599627370604); select pg_sleep(0.8); commit;"
cmd2=pref+"99034,current_date+500,current_date+502,100,4503599627370605); commit;"
a=threading.Thread(target=competir,args=(cmd1,)); b=threading.Thread(target=competir,args=(cmd2,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
assert sql("select count(*) from public.cliente where documento='DEMO-CONCURRENTE'")[0]=='1'
assert sql("select count(*) from public.reserva where id_reserva in (4503599627370604,4503599627370605)")[0]=='1'
# Mismo ID y mismos datos concurrentes devuelven una sola creación.
resultados.clear()
comando=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO','DEMO-MISMO',99034,current_date+510,current_date+512,100,4503599627370606); select pg_sleep(0.8); commit;"
a=threading.Thread(target=competir,args=(comando,)); b=threading.Thread(target=competir,args=(comando,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,0], resultados
assert sql("select count(*) from public.cliente where documento='DEMO-MISMO'")[0]=='1'
# Clientes diferentes que compiten por la misma habitación no dejan un cliente huérfano.
sql("insert into public.habitacion(id_habitacion,hotel_id_hotel,tipo_habitacion_id_tipo,numero,estado) values(99035,1,1,'TEST-99035','DISPONIBLE')")
resultados.clear()
pref=f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select * from public.crear_cliente_y_primera_reserva('Prueba','Local','DEMO','SINTETICO',"
cmd1=pref+"'DEMO-CHOQUE-1',99035,current_date+520,current_date+522,100,4503599627370607); select pg_sleep(0.8); commit;"
cmd2=pref+"'DEMO-CHOQUE-2',99035,current_date+520,current_date+522,100,4503599627370608); commit;"
a=threading.Thread(target=competir,args=(cmd1,)); b=threading.Thread(target=competir,args=(cmd2,)); a.start(); time.sleep(.1); b.start(); a.join(); b.join()
assert sorted(resultados)==[0,3], resultados
assert sql("select count(*) from public.cliente where documento in ('DEMO-CHOQUE-1','DEMO-CHOQUE-2')")[0]=='1'
assert sql("select count(*) from public.reserva where id_reserva in (4503599627370607,4503599627370608)")[0]=='1'
print('OK: migraciones, clientes, primera reserva, aislamiento, roles, rollback y concurrencia')
