"""Solo para un contenedor PostgreSQL desechable sin red con fixtures simulados.

Uso: python supabase/futuro/mediador/tests/mediador_concurrencia.py CONTENEDOR
Inserta filas ficticias en la base local; descartar el contenedor al terminar.
"""
import json
import os
import subprocess
import sys

env = os.environ.copy()
for key in ('DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH'):
    env.pop(key, None)
if len(sys.argv) != 2: raise SystemExit('Indique un contenedor local desechable sin red')
container = sys.argv[1]
mode = subprocess.check_output(['docker','--host=unix:///var/run/docker.sock','inspect','--format','{{.HostConfig.NetworkMode}}',container],text=True,env=env).strip()
if mode != 'none': raise SystemExit('Solo se permite un contenedor local sin red')
base = ['docker','--host=unix:///var/run/docker.sock','exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1','-At']

def ejecutar(s):
    p = subprocess.run(base,input=s,text=True,capture_output=True,check=True,env=env)
    return p.stdout.strip()

def sql_op(doc,habitacion,dias,precio):
    return ("jsonb_build_object('nombre','Ejemplo','apellido','Prueba','tipo_documento','DEMO',"
            "'pais_emisor','TEST','documento','"+doc+"','habitacion_id',"+str(habitacion)+","
            "'entrada',(current_date+"+str(dias)+")::text,'salida',(current_date+"+str(dias+1)+")::text,'total',"+str(precio)+")")

def prefijo(user):
    return "set local role authenticated; select set_config('request.jwt.claim.sub','"+user+"',true);"

def resultado(out):
    lineas = [line for line in out.splitlines() if line.startswith('{')]
    if len(lineas) != 1: raise RuntimeError('Respuesta de prueba inesperada')
    return json.loads(lineas[0])

def autorizar(user,op):
    out=ejecutar('begin; '+prefijo(user)+'select public.solicitar_autorizacion_reserva('+op+',true); commit;')
    obj=resultado(out)
    if obj.get('estado')!='AUTORIZADA': raise RuntimeError('No se creó la autorización de prueba')
    return obj['autorizacion']

def confirmar(user,token,op):
    return prefijo(user)+"select public.confirmar_reserva_autorizada('"+token+"',"+op+");"

def carrera(user1,token1,op1,user2,token2,op2):
    p1=subprocess.Popen(base,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,env=env)
    p1.stdin.write('begin; '+confirmar(user1,token1,op1)+'\n\\echo LISTA\nselect pg_sleep(2); commit;\n')
    p1.stdin.close(); prev=[]
    while True:
        line=p1.stdout.readline()
        if not line: raise RuntimeError('Falló la primera transacción antes del punto de sincronización')
        if line.strip()=='LISTA': break
        prev.append(line)
    p2=subprocess.run(base,input='begin; '+confirmar(user2,token2,op2)+' commit;',text=True,capture_output=True,env=env)
    p1.wait(timeout=10)
    if p1.returncode or p2.returncode: raise RuntimeError('Falló una transacción de prueba: '+p1.stderr.read()+p2.stderr)
    return resultado(''.join(prev)),resultado(p2.stdout)

u1='00000000-0000-4000-8000-000000000001';u2='00000000-0000-4000-8000-000000000005';u3='00000000-0000-4000-8000-000000000004'
ejecutar("insert into auth.users values ('"+u2+"'),('"+u3+"'); insert into cuenta_empleado values ('"+u2+"',5,'ADMINISTRADOR',true,now()),('"+u3+"',4,'ADMINISTRADOR',true,now());")
# Dos operadores en el mismo hotel compiten por la misma habitación y fechas.
op1=sql_op('ROOM-A',1,2000,100);op2=sql_op('ROOM-B',1,2000,100)
a,b=carrera(u1,autorizar(u1,op1),op1,u3,autorizar(u3,op2),op2)
assert sorted([a['estado'],b['estado']])==['COMPLETADA','NO_COMPLETADA']
assert ejecutar('select count(*) from reserva where habitacion_id_habitacion=1 and fecha_entrada=current_date+2000;')=='1'
assert ejecutar("select count(*) from cliente where documento in ('ROOM-A','ROOM-B');")=='1'
# Dos hoteles registran el mismo cliente global al mismo tiempo.
op1=sql_op('GLOBAL-RACE',1,2010,100);op2=sql_op('GLOBAL-RACE',7,2010,100)
a,b=carrera(u1,autorizar(u1,op1),op1,u2,autorizar(u2,op2),op2)
assert a['estado']=='COMPLETADA' and b['estado']=='COMPLETADA'
assert ejecutar("select count(*) from cliente where documento='GLOBAL-RACE';")=='1'
assert ejecutar("select count(*) from reserva r join cliente c on c.id_cliente=r.cliente_id_cliente where c.documento='GLOBAL-RACE';")=='2'
# Dos usos simultáneos del mismo token no crean dos reservas.
op=sql_op('TOKEN-RACE',2,2020,150);token=autorizar(u1,op)
a,b=carrera(u1,token,op,u1,token,op)
assert sorted([a['estado'],b['estado']])==['COMPLETADA','NO_COMPLETADA']
assert ejecutar("select count(*) from reserva r join cliente c on c.id_cliente=r.cliente_id_cliente where c.documento='TOKEN-RACE';")=='1'
print('OK: concurrencia de habitación, cliente global y autorización de un solo uso')
