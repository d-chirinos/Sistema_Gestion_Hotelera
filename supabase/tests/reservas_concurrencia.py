"""Solo para un contenedor PostgreSQL desechable sin red ya preparado con los fixtures.

Uso: python supabase/tests/reservas_concurrencia.py NOMBRE_CONTENEDOR
Prueba la restricción EXCLUDE con escrituras directas del propietario en un
contenedor local desechable, no una RPC. Descarte el contenedor al terminar.
"""
import subprocess
import sys
import os

if len(sys.argv) != 2:
    raise SystemExit('Indique un contenedor PostgreSQL local desechable sin red')
container = sys.argv[1]
env = os.environ.copy()
for name in ('DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH'):
    env.pop(name, None)
mode = subprocess.check_output(['docker', '--host=unix:///var/run/docker.sock', 'inspect', '--format', '{{.HostConfig.NetworkMode}}', container], text=True, env=env).strip()
if mode != 'none':
    raise SystemExit('Solo se permite un contenedor sin red')
base = ['docker', '--host=unix:///var/run/docker.sock', 'exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-At']
alta = ("insert into public.reserva(cliente_id_cliente,habitacion_id_habitacion,fecha_entrada,fecha_salida,estado,total_estimado,fecha_reserva) "
        "values(1,1,current_date+2000,current_date+2001,'CONFIRMADA',100,current_date);")
primera = subprocess.Popen(base, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
primera.stdin.write('begin; '+alta+'\n\\echo LISTA_PRIMERA\nselect pg_sleep(2); commit;\n')
primera.stdin.close()
while True:
    line = primera.stdout.readline()
    if not line:
        raise SystemExit('La primera transacción terminó antes de adquirir el bloqueo')
    if line.strip() == 'LISTA_PRIMERA':
        break
segunda = subprocess.run(base, input='begin; '+alta+' commit;', text=True, capture_output=True, env=env)
primera.wait(timeout=10)
if primera.returncode != 0:
    raise SystemExit('Falló la primera transacción: '+primera.stderr.read())
if segunda.returncode == 0 or '23P01' not in segunda.stderr:
    raise SystemExit('La segunda transacción no fue rechazada por superposición: '+segunda.stderr)
consulta = subprocess.run(base, input='select count(*) from public.reserva where habitacion_id_habitacion=1 and fecha_entrada=current_date+2000;', text=True, capture_output=True, check=True, env=env)
if consulta.stdout.strip() != '1':
    raise SystemExit('No quedó exactamente una reserva confirmada')
print('OK: solicitudes concurrentes; una confirmada y una rechazada por solapamiento')
