#!/usr/bin/env bash
# Crea y destruye únicamente un PostgreSQL de prueba sin contraseñas ni conexión a Supabase.
set -euo pipefail
cd "$(dirname "$0")/../.."
nombre="hm-centro-prueba-$$"
trap 'docker rm -f "$nombre" >/dev/null 2>&1 || true' EXIT
docker run -d --rm --pull=never --name "$nombre" --network bridge --tmpfs /var/lib/postgresql/data:rw,size=256m -p 127.0.0.1::5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:15 >/dev/null
for _ in {1..80}; do
  if docker exec "$nombre" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 0.25
done
docker exec "$nombre" pg_isready -U postgres >/dev/null
puerto="$(docker port "$nombre" 5432/tcp | sed 's/.*://')"
docker exec -i "$nombre" psql -U postgres -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE SCHEMA extensions;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
SQL
docker exec -i "$nombre" psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/migrations/20261107000000_hotelmanager_estructura_inicial.sql
docker exec -i "$nombre" psql -U postgres -v ON_ERROR_STOP=1 -q -o /dev/null < supabase/demo/datos_academicos_sinteticos.sql
docker exec -i "$nombre" psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/migrations/20261107130000_centro_consultas.sql
docker exec -i "$nombre" psql -U postgres -v ON_ERROR_STOP=1 -q <<'SQL'
INSERT INTO auth.users(id) VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002'),('00000000-0000-4000-8000-000000000003'),('00000000-0000-4000-8000-000000000004');
INSERT INTO public.cuenta_empleado(auth_user_id,empleado_id_empleado,rol_sistema,activo,fecha_vinculacion) VALUES ('00000000-0000-4000-8000-000000000001',1,'ADMINISTRADOR',true,now()),('00000000-0000-4000-8000-000000000002',5,'ADMINISTRADOR',true,now()),('00000000-0000-4000-8000-000000000003',2,'ADMINISTRADOR',false,now()),('00000000-0000-4000-8000-000000000004',3,'RECEPCIONISTA',true,now());
SQL
HM_SQL_TEST_URL="postgres://hotel_consultas_reader@127.0.0.1:$puerto/postgres" node --test tests/ejecutorSQL.test.mjs
