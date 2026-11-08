// Uso exclusivo con un PostgreSQL temporal aislado creado por centro_pooler_local.sh.
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
const db = postgres(process.env.HM_POOLER_SETUP_URL, { max: 1, prepare: false })
try {
  await db.unsafe("CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA extensions; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;").simple()
  for (const archivo of ['supabase/migrations/20261107000000_hotelmanager_estructura_inicial.sql', 'supabase/demo/datos_academicos_sinteticos.sql', 'supabase/migrations/20261107130000_centro_consultas.sql']) await db.unsafe(readFileSync(archivo, 'utf8')).simple()
  await db.unsafe("INSERT INTO auth.users(id) VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002'); INSERT INTO public.cuenta_empleado(auth_user_id,empleado_id_empleado,rol_sistema,activo,fecha_vinculacion) VALUES ('00000000-0000-4000-8000-000000000001',1,'ADMINISTRADOR',true,now()),('00000000-0000-4000-8000-000000000002',5,'ADMINISTRADOR',true,now());").simple()
} finally { await db.end() }
