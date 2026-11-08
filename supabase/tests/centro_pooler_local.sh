#!/usr/bin/env bash
# PostgreSQL y PgBouncer de prueba en loopback. No usa Supabase ni claves reales.
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${PG_BIN:?Indica el directorio con initdb y pg_ctl}"
: "${PGBOUNCER_BIN:?Indica la ruta al ejecutable pgbouncer}"
command -v openssl >/dev/null
carpeta="$(mktemp -d /tmp/hm-pooler-test.XXXXXXXX)"
limpiar() {
  if [[ -f "$carpeta/pooler.pid" ]]; then kill -TERM "$(cat "$carpeta/pooler.pid")" 2>/dev/null || true; fi
  "$PG_BIN/pg_ctl" -D "$carpeta/data" -m fast -w stop >/dev/null 2>&1 || true
  rm -rf "$carpeta"
}
trap limpiar EXIT
puerto_libre() { node --input-type=module -e "import net from 'node:net';const s=net.createServer();s.listen(0,'127.0.0.1',()=>{console.log(s.address().port);s.close()})"; }
pg_puerto="$(puerto_libre)"
pool_puerto="$(puerto_libre)"
while [[ "$pool_puerto" == "$pg_puerto" ]]; do pool_puerto="$(puerto_libre)"; done
"$PG_BIN/initdb" -D "$carpeta/data" --auth=trust --no-locale --encoding=UTF8 -U postgres >/dev/null
"$PG_BIN/pg_ctl" -D "$carpeta/data" -l "$carpeta/postgres.log" -o "-h 127.0.0.1 -p $pg_puerto -k $carpeta -c fsync=off -c shared_buffers=16MB" -w start >/dev/null
HM_POOLER_SETUP_URL="postgresql://postgres@127.0.0.1:$pg_puerto/postgres" node supabase/tests/pooler_setup.mjs
openssl req -x509 -newkey rsa:2048 -nodes -keyout "$carpeta/test.key" -out "$carpeta/test.crt" -days 1 -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost' >/dev/null 2>&1
chmod 600 "$carpeta/test.key"
printf '"hotel_consultas_reader.abcdefghijklmnopqrst" ""\n"hotel_consultas_reader" ""\n"postgres" ""\n' > "$carpeta/userlist.txt"
cat > "$carpeta/pgbouncer.ini" <<CONFIG
[databases]
postgres = host=127.0.0.1 port=$pg_puerto dbname=postgres user=hotel_consultas_reader
privileged = host=127.0.0.1 port=$pg_puerto dbname=postgres user=postgres
[pgbouncer]
listen_addr = 127.0.0.1,::1
listen_port = $pool_puerto
unix_socket_dir = $carpeta
pidfile = $carpeta/pooler.pid
logfile = $carpeta/pooler.log
auth_type = trust
auth_file = $carpeta/userlist.txt
pool_mode = session
client_tls_sslmode = require
client_tls_key_file = $carpeta/test.key
client_tls_cert_file = $carpeta/test.crt
server_tls_sslmode = disable
CONFIG
"$PGBOUNCER_BIN" -d "$carpeta/pgbouncer.ini"
NODE_EXTRA_CA_CERTS="$carpeta/test.crt" NODE_OPTIONS=--dns-result-order=ipv4first HM_POOLER_TEST_URL="postgresql://hotel_consultas_reader.abcdefghijklmnopqrst@localhost:$pool_puerto/postgres?sslmode=require" HM_POOLER_BAD_HOST=ip6-localhost HM_POOLER_PRIVILEGED_DB=privileged node --test tests/sessionPooler.test.mjs
if [[ -n "${DENO_BIN:-}" ]]; then
  HM_POOLER_TEST_URL="postgresql://hotel_consultas_reader.abcdefghijklmnopqrst@localhost:$pool_puerto/postgres?sslmode=require" HM_POOLER_CA_FILE="$carpeta/test.crt" "$DENO_BIN" run -A --config supabase/functions/ejecutar-consulta-sql/deno.json supabase/tests/session_pooler_deno.mjs
fi
