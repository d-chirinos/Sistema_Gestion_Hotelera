# Centro de Consultas SQL

La migración `20261107130000_centro_consultas.sql` crea doce vistas de lectura con `security_barrier` y el rol `hotel_consultas_reader` (LOGIN, NOINHERIT, sin privilegios administrativos ni BYPASSRLS). No modifica las tablas ni los datos históricos. Las vistas solo devuelven filas del hotel del administrador activo identificado por `auth.uid()`. Los clientes globales se limitan a aquellos con reservas en ese hotel; las vistas excluyen documentos, correos, salarios, cuentas de acceso y usuarios de Auth. Los consumos con servicio de otro hotel se excluyen. Ninguna vista se concede a `anon` ni a `authenticated`.

## Ejecución y restricciones

React envía únicamente el SQL a la Edge Function `ejecutar-consulta-sql`. Esta valida el token con Supabase Auth y comprueba de nuevo `mi_cuenta_hotelmanager()`. No acepta un hotel ni un UUID del navegador. Se conecta exclusivamente con `hotel_consultas_reader`, verifica que `current_user` y `session_user` sean ese rol y que no tenga atributos privilegiados, inicia una transacción `READ ONLY`, fija el identificador verificado en el contexto local y consulta las vistas. La contraseña y la cadena de conexión se mantienen como secreto de la función, nunca en React o Git. Se admite la conexión directa o Session Pooler si, tras autenticar, tanto `current_user` como `session_user` son `hotel_consultas_reader`; no usar `postgres`, `service_role` ni un pooler que cambie esa identidad. La conexión exige un nombre DNS y TLS con verificación de CA y nombre (`verify-full`), incluso si la URL indica `sslmode=require`. Las IP literales se rechazan porque la biblioteca no comprobó correctamente su identidad TLS en las pruebas locales.

`pgsql-ast-parser` analiza una única sentencia, valida el árbol con una lista cerrada y PostgreSQL ejecuta el SQL serializado desde ese árbol, mostrado junto al resultado. Se admite `SELECT`, `WITH` no recursivo, subconsultas, `INNER JOIN`, `LEFT JOIN`, filtros, orden, agrupación, `HAVING` y `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COALESCE`, `DISTINCT` en agregados, `BETWEEN` y `EXTRACT` de `YEAR`, `MONTH` o `DAY`. Solo se admiten las doce vistas de `hotel_consultas`: los nombres sin esquema se califican en el árbol salvo referencias a CTE. Se admiten literales DATE ISO; no se permiten otros casts, funciones arbitrarias, escrituras, `FOR UPDATE`, `OFFSET`, SQL múltiple ni esquemas arbitrarios. Hay un límite de 8000 caracteres, 200 filas (se detecta truncamiento), 1 MiB de respuesta, tres segundos por sentencia y un segundo para bloqueos. El límite de 20 peticiones por minuto es **por instancia**, no un control distribuido. La pantalla se activa solo con `VITE_CENTRO_SQL_EJECUCION=true` tras verificar el despliegue.

El rol de base de datos confía en el contexto de identidad que le asigna la función. **Quien obtenga su credencial podría conectarse y alterar ese contexto**: el secreto debe permanecer exclusivamente en la función y no concederse a usuarios ni al navegador. La seguridad del SQL arbitrario depende de combinar la lista cerrada del parser, la serialización, los permisos del rol, las vistas y la transacción de lectura; no debe exponerse la conexión como API general.

## Pruebas locales

Con Docker y la imagen local `postgres:15`, ejecutar `npm ci` y después `bash supabase/tests/centro_consultas_local.sh`. El script crea un contenedor temporal en loopback con autenticación de prueba sin contraseña, carga la estructura y los datos sintéticos locales, aplica la migración y lo elimina al finalizar. Prueba las 16 consultas, usuarios de dos hoteles y usuarios sin vínculo, inactivos y recepción; también rechazo de escritura, funciones peligrosas, múltiples sentencias y tablas base, límite de filas y timeout. No conecta a Supabase. Las pruebas de navegador usan servicios simulados.

## Despliegue posterior en HotelManager-Pruebas

El usuario confirmó que la migración ya está instalada en HotelManager-Pruebas y que el rol autentica mediante Session Pooler; no es necesario reaplicarla ni cambiar su contraseña. Para otros entornos, la migración requiere permiso para crear roles y no contiene contraseña. En el proyecto de ensayo, configurar el secreto siguiendo la sección de Session Pooler, desplegar posteriormente `ejecutar-consulta-sql` con JWT habilitado y verificar roles, aislamiento entre hoteles, consultas, límites y certificado. Solo entonces activar `VITE_CENTRO_SQL_EJECUCION=true` en Windows. Aunque el rol ya fue comprobado con psql por el usuario, quedan por probar desde la Edge Function el certificado, la conectividad, los resultados y el aislamiento; no se ha ejecutado SQL remoto aquí.

Gemini sigue siendo independiente y se activa con `VITE_CENTRO_SQL_IA=true` después de desplegar y revisar `consultas-gemini`, configurando `GEMINI_API_KEY` y `GEMINI_MODEL` como secretos de servidor. La generación admite preguntas libres del dominio hotelero, incluidas fechas y cantidades. Rechaza correos, identificadores largos y algunas expresiones personales, pero no detecta todos los nombres ni datos privados: no incluyas información personal en la pregunta. La IA no ejecuta SQL: el usuario lo revisa y la misma función de lectura vuelve a validarlo. La explicación filtra literales y usa un subconjunto restringido de identificadores.

## Configuración de Session Pooler en HotelManager-Pruebas

La compatibilidad es **condicionada** a que el runtime de Edge pueda resolver y alcanzar el pooler y confiar en su cadena de certificados. Las pruebas locales usan PgBouncer en modo sesión, no el servicio Supavisor alojado; el usuario confirmó por separado la identidad de los roles y la ausencia de lectura directa de tablas mediante psql.

1. En el proyecto de ensayo `knajohmderwpowlnmopy`, abrir el administrador de secretos de Edge Functions de Supabase y crear el secreto llamado exactamente `SQL_READER_DATABASE_URL`. No usar la URL del proyecto principal.
2. Como valor del secreto, utilizar esta estructura, sustituyendo el marcador por la contraseña del rol **codificada para una URL** (por ejemplo, caracteres reservados como `@`, `:`, `/`, `#` y `%` deben representarse mediante percent-encoding):

   `postgresql://hotel_consultas_reader.knajohmderwpowlnmopy:<CONTRASEÑA_CODIFICADA>@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full`

   El marcador es explicativo y no debe conservarse literalmente. La contraseña se introduce solo en el administrador de secretos; no se pega en el chat, en comandos, en archivos del repositorio ni en variables `VITE_`. El host debe mantenerse como nombre DNS, no reemplazarse por una IP.
3. No añadir `sslrootcert`, `options` ni otros parámetros a esa URL: la función solo admite `sslmode=require` o `sslmode=verify-full` y siempre exige verificación completa mediante la CA confiable del runtime. El usuario debe ser el rol de lectura, con el sufijo del proyecto para el pooler.
4. Cuando se autorice el despliegue posterior, desplegar la versión nueva de `ejecutar-consulta-sql` en el proyecto de ensayo. Mantener `VITE_CENTRO_SQL_EJECUCION=false` hasta comprobar desde la aplicación autenticada que las consultas devuelven únicamente el hotel propio y que los rechazos siguen funcionando.
5. Si falla TLS, revisar la cadena de certificados y la conectividad del runtime de Supabase. No sustituir `verify-full` por un modo que omita la comprobación del certificado. La comprobación con el Session Pooler real solo puede hacerse después del despliegue autorizado.

Para repetir la prueba aislada en Linux se requieren Node.js, OpenSSL, PostgreSQL con `initdb`/`pg_ctl`, PgBouncer y, opcionalmente, Deno. Ejecutar `PG_BIN=<directorio-bin-de-postgresql> PGBOUNCER_BIN=<ruta-a-pgbouncer> bash supabase/tests/centro_pooler_local.sh`. Puede indicarse `DENO_BIN=<ruta-a-deno>` para comprobar también el runtime Deno. El script crea una CA y una base temporales, sin claves reales, y las elimina al terminar. La prueba de nombre TLS incorrecto utiliza IPv6 de loopback (`ip6-localhost`).

Para comprobar las 16 consultas y las restricciones del ejecutor en PostgreSQL aislado sin pooler, ejecutar `bash supabase/tests/centro_consultas_local.sh` con Docker y la imagen local `postgres:15`. El entorno se crea desde cero con la estructura, la carga académica sintética y la migración 130; se destruye al terminar. La preparación del entorno desechable requiere su propietario local, sin contraseñas reales; las consultas evaluadas se ejecutan exclusivamente como `hotel_consultas_reader`. Las cantidades esperadas en los tests corresponden a la carga sintética original, no a una garantía sobre los datos actuales de un proyecto remoto. Esta prueba no reemplaza la comprobación de TLS y del Session Pooler real.

Gemini recibe el catálogo con los valores establecidos por CHECK para `habitacion.estado`, `reserva.estado` y `pago.tipo_pago`. Los métodos de pago y tipos de mantenimiento son texto libre, no listas cerradas. Antes de mostrar SQL generado se aplica el mismo validador del ejecutor. Una comprobación adicional rechaza comparaciones directas con mayúsculas incorrectas en consultas sencillas sobre una sola vista; no reescribe SQL ni cubre todas las expresiones, JOIN o CTE. Revisa siempre los literales antes de ejecutar. La detección de pertenencia al dominio y de datos personales es limitada: puede rechazar preguntas pertinentes y no detecta todos los datos personales. No introduzcas nombres, documentos, teléfonos, correos ni otros datos personales.

## Diagnóstico seguro de la Edge Function

La versión con diagnósticos escribe eventos JSON `ejecutar_consulta_sql.error` en los logs de `ejecutar-consulta-sql`. Cada evento contiene únicamente `evento`, `etapa`, `categoria` y `codigo`, elegidos de listas internas. No se registran excepciones completas, mensajes del proveedor, SQL, datos de resultados, UUID, JWT, contraseñas ni cadenas de conexión. `ejecutar_consulta_sql.cierre_error` indica un fallo al cerrar la conexión y no implica por sí solo que la consulta haya fallado. El navegador sigue recibiendo mensajes genéricos.

Después de actualizar la función en el proyecto de pruebas, reproducir una consulta y abrir sus registros de Edge Functions alrededor de la hora de la solicitud POST. Buscar `ejecutar_consulta_sql.error` y revisar:

| Etapa o categoría | Significado y comprobación posterior |
| --- | --- |
| `configuracion` / `HM_CONFIG_INCOMPLETA` | Falta una variable requerida; revisar los nombres de los secretos sin copiar sus valores. |
| `configuracion_conexion` / `HM_CONFIG_CONEXION` | Código de versiones anteriores: agrupaba las validaciones de la URL y los fallos síncronos al inicializar el cliente. Por sí solo no distingue la causa. |
| `configuracion_conexion` / `HM_CONFIG_URL` | La cadena no se puede interpretar como URL. |
| `configuracion_conexion` / `HM_CONFIG_PROTOCOLO` | El protocolo no es `postgres:` ni `postgresql:`. |
| `configuracion_conexion` / `HM_CONFIG_HOST` | Falta el host o es una dirección IP literal; se exige un nombre DNS. |
| `configuracion_conexion` / `HM_CONFIG_USUARIO` | El usuario no se puede decodificar o no coincide con el rol lector y su sufijo opcional de 20 caracteres. |
| `configuracion_conexion` / `HM_CONFIG_PARAMETROS` | Hay parámetros no admitidos, más de un parámetro, o un valor de `sslmode` distinto de `require` o `verify-full`. |
| `configuracion_conexion` / `HM_CONFIG_CLIENTE` | El cliente PostgreSQL rechazó la configuración durante su inicialización síncrona; este código no identifica la causa concreta. |
| `auth_usuario` o `auth_cuenta` | Problema al validar Auth o la vinculación administrativa. `HM_AUTH_SERVICIO` y `HM_CUENTA_RPC` indican fallos de servicio distintos de una credencial o cuenta rechazada. |
| `conexion_postgresql` / `tls_certificado` o `tls_nombre` | Falló la confianza de la cadena TLS o la coincidencia del nombre; comprobar DNS y CA sin desactivar la validación. |
| `conexion_postgresql` / `dns`, `red` o `tiempo_agotado` | Falló la resolución, la conexión de red o el plazo de conexión. |
| `autenticacion_postgresql` (`28P01`, `28000` o `SASL_SIGNATURE_MISMATCH`) | PostgreSQL o el pooler rechazó la autenticación; comprobar el usuario y el secreto sin mostrarlos. |
| `verificacion_rol` / `HM_ROL_INSEGURO` | La identidad o los atributos de la conexión no cumplen el rol de lectura requerido. No se registra el rol recibido. |
| `contexto_identidad` | La función estaba fijando el contexto transaccional cuando ocurrió el fallo; la categoría y el código pueden indicar red o permisos. |
| `permisos_postgresql` (`42501`) | PostgreSQL denegó una operación; la etapa precisa si ocurrió al comprobar el rol, fijar contexto o consultar. |
| `ejecucion_sql` / `sql_invalido` o `tiempo_agotado` | El fallo ocurrió al ejecutar o validar la consulta; revisar columnas y límites sin copiar información sensible a los logs. |
| `postgresql_interno` (`XX000`) o `NO_IDENTIFICADO` | El código no permite determinar por sí solo la causa. No se registran mensajes del proveedor, que podrían contener credenciales o datos. |

Las categorías y códigos seguros del evento pueden compartirse para analizar el fallo; no compartir el valor del secreto, la URL, el token ni logs completos sin revisarlos. Estos diagnósticos no cambian TLS, los permisos ni las vistas.

## Ejercicios de fechas

El editor acepta `CURRENT_DATE`, literales `DATE` con fecha ISO y restas de fechas. No admite funciones arbitrarias ni otros tipos de cast. Los tres enunciados del profesor están disponibles como ejemplos de preguntas. En las pruebas: el primer ejercicio selecciona mantenimientos iniciados hasta `CURRENT_DATE` (fecha de la sesión PostgreSQL, que puede diferir del día local del hotel); el segundo suma unidades de consumo por servicio para estadías con check-in en 2026; el tercero calcula `fecha_entrada - fecha_reserva` por reserva. Gemini puede elegir otra interpretación, que el usuario debe revisar.

Si Gemini devuelve un bloque Markdown completo se retira el cerco y se valida el SQL. Si devuelve una consulta incompatible para uno de esos tres enunciados exactos, la función ofrece una consulta de respaldo predefinida y señala explícitamente su origen y supuestos. No vuelve a llamar a Gemini y la consulta debe revisarse antes de ejecutarla. Para otras preguntas se informa que hay que reformular; no se devuelve SQL incompatible. `EXTRACT` de año, mes o día, `BETWEEN`, agregaciones con `DISTINCT`, `COALESCE` y vistas sin esquema están admitidas en el subconjunto acotado. El ejecutor conserva su validación independiente.

Para Clientes, `VITE_CLIENTES_HOTEL=true` activa la lectura existente tras instalar y verificar la migración 090 (y 110 para usuarios operativos). Para crear cliente y primera reserva también deben estar activados `VITE_RESERVAS_LECTURA=true` y `VITE_PRIMERA_RESERVA=true`, con las migraciones correspondientes verificadas y un rol autorizado. La conciliación de clientes existentes entre hoteles sigue pendiente.

Los rechazos de Gemini emiten únicamente `evento` y `regla` de una lista cerrada en los logs de la función. No se registran consultas, literales, nombres, JWT ni credenciales. Los códigos distinguen sintaxis, sentencia, objeto, función, expresión, fecha, estructura, longitud y múltiples sentencias; no identifican valores concretos.
