"""Diagnóstico local: reproduce dos riesgos que bloquean el despliegue.

Solo ejecutar en un contenedor PostgreSQL desechable, sin red y con el mediador
instalado para pruebas. Crea fixtures falsos; descartar el contenedor después.
No sustituye pruebas con Supabase Auth ni prueba una protección completa.
"""
import json
import os
import subprocess
import sys

env = os.environ.copy()
for key in ('DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH'):
    env.pop(key, None)
if len(sys.argv) != 2: raise SystemExit('Indique un contenedor local desechable sin red')
container=sys.argv[1]
mode=subprocess.check_output(['docker','--host=unix:///var/run/docker.sock','inspect','--format','{{.HostConfig.NetworkMode}}',container],text=True,env=env).strip()
if mode!='none': raise SystemExit('Solo se permite un contenedor sin red')
base=['docker','--host=unix:///var/run/docker.sock','exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1','-At']
def ejecutar(s):
 p=subprocess.run(base,input=s,text=True,capture_output=True,check=True,env=env)
 return p.stdout.strip()
def obj(out):
 lines=[x for x in out.splitlines() if x.startswith('{')]
 if len(lines)!=1: raise RuntimeError('Respuesta inesperada')
 return json.loads(lines[0])
user='00000000-0000-4000-8000-000000000005'
ejecutar("insert into auth.users values ('"+user+"') on conflict do nothing; insert into cuenta_empleado(auth_user_id,empleado_id_empleado,rol_sistema,activo,fecha_vinculacion) values('"+user+"',5,'ADMINISTRADOR',true,now()) on conflict(auth_user_id) do nothing;")
def op(doc,nombre='Ejemplo',apellido='Prueba',pais='TEST'):
 return "jsonb_build_object('nombre','"+nombre+"','apellido','"+apellido+"','tipo_documento','DEMO','pais_emisor','"+pais+"','documento','"+doc+"','habitacion_id',7,'entrada',(current_date+2300)::text,'salida',(current_date+2301)::text,'total',100)"
pre="set local role authenticated; select set_config('request.jwt.claim.sub','"+user+"',true);"
def autorizar(o):
 result=obj(ejecutar('begin; '+pre+'select public.solicitar_autorizacion_reserva('+o+',true); commit;'))
 if result.get('estado')!='AUTORIZADA': raise RuntimeError('No se pudo preparar fixture')
 return result['autorizacion']
def confirmar(t,o,fin='commit'):
 return obj(ejecutar('begin; '+pre+"select public.confirmar_reserva_autorizada('"+t+"',"+o+'); '+fin+';'))
# En un entorno de prueba, un actor que miente sobre la declaración puede
# distinguir una coincidencia conflictiva de una ficha nueva por el resultado.
existente=op('DEMO-CLI-008','Nombre','Distinto','SINTETICO')
nuevo=op('RIESGO-NUEVO','Nombre','Distinto','SINTETICO').replace('current_date+2300','current_date+2310').replace('current_date+2301','current_date+2311')
assert confirmar(autorizar(existente),existente)['estado']=='NO_COMPLETADA'
assert confirmar(autorizar(nuevo),nuevo)['estado']=='COMPLETADA'
# Si un llamador puede forzar ROLLBACK, la confirmación y su auditoría se
# revierten y el mismo token se puede volver a usar.
reuso=op('RIESGO-ROLLBACK').replace('current_date+2300','current_date+2320').replace('current_date+2301','current_date+2321')
token=autorizar(reuso)
assert confirmar(token,reuso,'rollback')['estado']=='COMPLETADA'
assert confirmar(token,reuso)['estado']=='COMPLETADA'
print('RIESGOS REPRODUCIDOS: inferencia por resultado y reutilización tras ROLLBACK; mantener guardia')
