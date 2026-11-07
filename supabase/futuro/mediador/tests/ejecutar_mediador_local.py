"""Prueba el mediador SOLO en un contenedor PostgreSQL desechable y sin red.

Uso: python supabase/futuro/mediador/tests/ejecutar_mediador_local.py CONTENEDOR
Requiere etiqueta hotelmanager.prueba=mediador-descartable y base vacía.
Crea identidades y filas ficticias; descartar el contenedor al terminar.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

env=os.environ.copy()
for key in ('DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH'):
    env.pop(key,None)
if len(sys.argv)!=2: raise SystemExit('Indique un contenedor PostgreSQL local desechable')
container=sys.argv[1]
docker=['docker','--host=unix:///var/run/docker.sock']
info=json.loads(subprocess.check_output(docker+['inspect',container],text=True,env=env))[0]
if info['HostConfig']['NetworkMode']!='none' or (info['Config'].get('Labels') or {}).get('hotelmanager.prueba')!='mediador-descartable':
    raise SystemExit('Se requiere contenedor sin red y con etiqueta mediador-descartable')
base=docker+['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1','-At']
def sql(texto,exito=True):
    p=subprocess.run(base,input=texto,text=True,capture_output=True,env=env)
    if (p.returncode==0)!=exito: raise RuntimeError('Resultado local inesperado: '+p.stderr)
    return p.stdout.strip(),p.stderr
vacio,_=sql("select not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','v','m','f')) and not exists(select 1 from pg_namespace where nspname in ('auth','extensions','hotelmanager_privado'));")
if vacio!='t': raise SystemExit('La base local no está vacía; no se modifica')
sql("create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create schema extensions;")
for f in ['supabase/migrations/20261107000000_hotelmanager_estructura_inicial.sql','supabase/migrations/20261107010000_consultas_seguras.sql','supabase/migrations/20261107020000_reservas_seguras.sql','supabase/demo/datos_academicos_sinteticos.sql']:
    sql(Path(f).read_text())
sql("insert into auth.users values ('00000000-0000-4000-8000-000000000001'); insert into public.cuenta_empleado values ('00000000-0000-4000-8000-000000000001',1,'ADMINISTRADOR',true,now());")
tables=['hotel','cargo','tipo_habitacion','cliente','empleado','habitacion','tarifa_habitacion','servicio','reserva','estadia','mantenimiento','pago','consumo_servicio','cuenta_empleado']
def snapshot():
    return [json.loads(sql(f"select coalesce(jsonb_agg(x order by x::text),'[]'::jsonb) from (select to_jsonb(t) x from public.{t} t) z")[0]) for t in tables]
before=snapshot()
if sum(map(len,before[:-1]))!=106 or len(before[-1])!=1: raise RuntimeError('Fixtures inesperados')
candidate=Path('supabase/futuro/mediador/mediador_bloqueado.sql').read_text()
_,err=sql(candidate,False)
if 'Mediador bloqueado' not in err: raise RuntimeError('La guardia no bloqueó el candidato')
if sql("select to_regnamespace('hotelmanager_privado') is null;")[0]!='t': raise RuntimeError('La guardia dejó objetos')
candidate,count=re.subn(r'-- INICIO_GUARDIA_MEDIADOR_NO_DESPLEGAR.*?-- FIN_GUARDIA_MEDIADOR_NO_DESPLEGAR','-- OMITIDA SOLO EN PRUEBA LOCAL',candidate,flags=re.S)
if count!=1: raise RuntimeError('No se identificó exactamente una guardia')
sql(candidate)
if snapshot()!=before: raise RuntimeError('La instalación local alteró los datos')
sql(Path('supabase/futuro/mediador/tests/mediador_reservas.sql').read_text())
if snapshot()!=before: raise RuntimeError('Las pruebas transaccionales alteraron los datos')
subprocess.run([sys.executable,'supabase/futuro/mediador/tests/mediador_concurrencia.py',container],check=True,env=env)
subprocess.run([sys.executable,'supabase/futuro/mediador/tests/mediador_riesgos_pendientes.py',container],check=True,env=env)
print('Casos funcionales verificados localmente; los riesgos reproducidos mantienen bloqueado el despliegue')
