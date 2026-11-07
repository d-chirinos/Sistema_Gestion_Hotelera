# Reservas: lectura y cotización para revisión

`migrations/20261107020000_reservas_seguras.sql` prepara exclusivamente las funciones de lectura y cotización. No crea ni concede una RPC de escritura, no cambia tablas ni inserta o actualiza datos. Comprueba además que no exista una función `registrar_reserva_confirmada(bigint,bigint,date,date,numeric)` preexistente; si existe, cancela la migración para revisar sus permisos. Esta comprobación no detecta otras sobrecargas o vías de escritura: deben revisarse por separado antes del despliegue.

## Primera etapa

- `listar_reservas_mi_hotel()` obtiene el hotel de `auth.uid()` → cuenta activa → empleado y devuelve solo reservas de habitaciones de ese hotel, con ID y nombre/apellido del cliente, número de habitación, fechas, estado y total. Incluye canceladas. No acepta hotel como argumento ni expone documentos o pagos. Los nombres son datos personales; revisar su exposición al administrador antes del despliegue.
- `cotizar_reserva(habitación, entrada, salida)` calcula tarifa vigente × noches para una habitación del propio hotel. Es informativa: **no bloquea el precio ni garantiza disponibilidad**. Las fechas deben existir, ser finitas y tener salida posterior a entrada. El total debe caber en `NUMERIC(10,2)`. No impone reglas nuevas sobre fechas pasadas, descuentos o condiciones comerciales.
- Ambas funciones exigen una vinculación activa de ADMINISTRADOR, utilizan `SECURITY DEFINER`, `search_path=pg_catalog` y referencias de esquema explícitas. Se concede `EXECUTE` solo a `authenticated`; la validación de identidad y hotel ocurre dentro de las funciones. Los privilegios de tablas, políticas RLS, funciones previas, roles heredados y propietarios requieren revisión independiente; no se conceden escrituras.
- La función de cotización devuelve el mismo error para una habitación inexistente, ajena o sin tarifa, sin devolver datos de otro hotel. El listado se restringe a las reservas del hotel actual. No se añade ningún parámetro para seleccionar otro hotel.

## React y activación

El módulo conserva el diseño e incluye listado, búsqueda, cotización informativa y estados de carga/error. `VITE_RESERVAS_LECTURA` ausente o en `false` mantiene la sección pendiente y evita llamar a la RPC nueva. Después de desplegar y probar las RPC en un entorno autorizado, `VITE_RESERVAS_LECTURA=true` en `.env.local` habilitaría el listado y la cotización de solo lectura; reiniciar Vite. El botón **Nueva reserva** continúa deshabilitado y el frontend no implementa una llamada de escritura. La bandera es pública y no sustituye la autorización del servidor. La cotización usa solo las habitaciones del hotel recibido; la RPC comprueba nuevamente su pertenencia en el servidor.

## Etapa futura: clientes globales y registro

El diseño propuesto está en [`futuro/CLIENTES_Y_RESERVAS.md`](futuro/CLIENTES_Y_RESERVAS.md). `CLIENTE` sigue siendo global: no se requiere una reserva anterior en el hotel y no se agregan tablas ni columnas. Antes de implementar el alta y la confirmación hay que definir la verificación de identidad/consentimiento y el tratamiento de colisiones de documentos sin permitir enumerar o divulgar fichas ajenas. No se ha creado una función de registro ni se ha decidido un mecanismo definitivo de verificación o reglas comerciales nuevas.

La restricción `EXCLUDE` ya aplicada sigue impidiendo solapamientos `[entrada, salida)` entre reservas CONFIRMADA o COMPLETADA; no impide fechas consecutivas ni bloquea por reservas canceladas. Su concurrencia se prueba independientemente en una base local. También queda pendiente coordinar las futuras operaciones de reserva con mantenimiento y ocupación, así como definir la aceptación del precio, gestión de reintentos y tratamiento de históricos antes de habilitar escritura.

## Pruebas y despliegue

`tests/reservas_seguras.sql` es solo para una base PostgreSQL desechable sin red, con Auth simulado, las dos migraciones previas, los datos demo, una cuenta administradora simulada y esta primera migración. Sus fixtures se revierten. Verifica permisos, ausencia de la función de escritura, roles, fechas y separación entre hoteles. `tests/reservas_concurrencia.py` usa un contenedor PostgreSQL local explícito con red `none` y realiza inserciones directas como propietario para probar la restricción `EXCLUDE`; **no prueba una RPC futura** y debe descartarse el contenedor después. Nunca ejecutar estos fixtures en Supabase remoto.

`futuro/tests/reservas_escritura_pendiente.sql` conserva escenarios provisionales de la etapa anterior. No es una migración ni prueba ejecutable contra esta primera etapa; debe revisarse cuando exista una implementación aprobada. En PostgreSQL aislado se compararon las 106 filas y la cuenta administradora antes y después de la migración de lectura. Para React se pueden ejecutar `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e` y `npm run test:e2e:reservas` con Chromium de Playwright; las pruebas de navegador simulan las RPC.

Antes de desplegar, revisar la migración, sus permisos efectivos y propiedad, el historial remoto, las funciones existentes y los datos de destino; probar Auth, JWT y PostgREST en un proyecto de pruebas autorizado. Obtener autorización explícita antes de ejecutar cualquier migración en el proyecto remoto.
