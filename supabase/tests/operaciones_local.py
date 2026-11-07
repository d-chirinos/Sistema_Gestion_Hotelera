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
for f in ('supabase/migrations/20261107030000_operaciones_lectura.sql','supabase/futuro/20261107040000_pagos_y_precios.sql'):
    sql(Path(f).read_text())
assert snapshot() == before, 'La migración cambió registros existentes'
assert sql("select has_function_privilege('anon','public.consultar_operaciones_hotel(text)','EXECUTE'), has_function_privilege('authenticated','public.consultar_operaciones_hotel(text)','EXECUTE'), has_table_privilege('authenticated','public.pago','INSERT')")[0] == 'f|t|f'
for user in ids[1:4]:
    for command in ("select * from public.consultar_operaciones_hotel('pagos')", "select * from public.registrar_pago_reserva(1,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000001')", "select * from public.actualizar_tarifa_hotel(1,100,101)"):
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
# Ni un error tras el registro deja un pago parcial.
sesion(ids[0], "select * from public.registrar_pago_reserva(7,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000005'); select 1/0", False)
assert snapshot() == before, 'Las pruebas transaccionales modificaron datos'
# Dos clientes concurrentes, misma clave y solicitud. Ambas respuestas deben corresponder al mismo pago.
cmd = f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{ids[0]}',true); select id_pago,repetido from public.registrar_pago_reserva(7,10,'EFECTIVO','aaaaaaaa-0000-4000-8000-000000000003'); select pg_sleep(1); commit;"
results=[]
def run(): results.append(sql(cmd)[0])
a=threading.Thread(target=run); b=threading.Thread(target=run); a.start(); time.sleep(.15); b.start(); a.join(); b.join()
assert len(results)==2 and any('|f' in x for x in results) and any('|t' in x for x in results), results
assert sql("select count(*) from public.pago where clave_idempotencia='aaaaaaaa-0000-4000-8000-000000000003'")[0] == '1'
print('OK: migraciones, aislamiento por hotel, roles, no acceso directo, pagos, tarifas, reintentos y concurrencia')
