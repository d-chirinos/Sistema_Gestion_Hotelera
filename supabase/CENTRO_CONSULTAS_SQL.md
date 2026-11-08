# Centro de Consultas SQL: prototipo bloqueado de ejecución

## Estado actual

El módulo es visible únicamente para administradores. Permite escribir y copiar SQL, revisar 16 ejemplos y preparar una explicación o propuesta de Gemini. El botón **Ejecutar consulta está permanentemente deshabilitado**: no hay ejecutor, validación PostgreSQL, datos de consulta, exportación real ni gráficos de resultados. Las vistas `hotel_consultas.*` del catálogo son una **propuesta**, no existen todavía. Los 16 ejemplos pasaron una prueba de sintaxis y referencias en PostgreSQL 15 aislado con datos sintéticos y vistas temporales de prueba; pueden requerir ajustes al construir las vistas definitivas. No se ha creado ninguna migración.

La prueba utilizó un contenedor PostgreSQL local sin red y vistas temporales sobre tablas locales, con privilegios de prueba. No verifica aislamiento por hotel, tiempo de espera ni permisos del ejecutor. Deno no está disponible en este entorno. Los componentes de tabla, gráfico de barras y CSV están preparados para resultados futuros, pero sin backend no se pueden utilizar. No hay gráficos de líneas o dona ni resaltado de sintaxis. No se ha conectado a ningún proyecto remoto.

## Por qué no se habilitó SQL arbitrario

Las tablas hoteleras no conceden lectura directa a `authenticated`, y las RPC actuales solo exponen operaciones concretas. La ejecución de SQL libre mediante `SECURITY DEFINER` heredaría privilegios peligrosos; filtrar por prefijos `SELECT` no impide CTE con escritura, múltiples sentencias, funciones con efectos secundarios o acceso a objetos ajenos. Las RPC actuales tampoco permiten interpretar SQL PostgreSQL: simularlo en React daría resultados o semántica incorrectos.

Una posible solución a implementar y probar en un entorno aislado es un ejecutor separado con un rol sin escritura ni acceso a tablas base, vistas con aislamiento por identidad/hotel demostrado en servidor, autorización de administrador, validación mediante analizador PostgreSQL y lista cerrada de objetos y funciones, una transacción de solo lectura, límite de filas, duración y longitud, y control de frecuencia. Antes de implementarla deben verificarse las capacidades reales del proyecto Supabase para roles, conexiones y contexto de identidad; no basta confiar en un `WHERE` escrito por el usuario, la IA o un parámetro de hotel sin autenticar. También debe comprobarse que el rol no pueda llamar funciones `SECURITY DEFINER`, modificar el contexto o acceder a otros esquemas. Ninguno de estos controles está implementado ni probado aquí.

## Gemini: integración preparada, desactivada

`supabase/functions/consultas-gemini` es una Edge Function propuesta que no ejecuta SQL. Comprueba el token con Supabase Auth y consulta `mi_cuenta_hotelmanager()` con el token del usuario: solo continúa para una cuenta administrativa activa. Usa `GEMINI_API_KEY` exclusivamente en el servidor y `GEMINI_MODEL` como nombre configurable, sin fijar un modelo o activar facturación. No se enviaron solicitudes reales a Gemini. La función y su verificación en Deno/Supabase deben revisarse antes de desplegarlas.

Para evitar enviar datos personales, la generación acepta únicamente siete preguntas genéricas cerradas. Para explicar SQL, se omiten literales y números y se aceptan únicamente identificadores del catálogo; rechaza comentarios, identificadores entre comillas y SQL fuera de ese subconjunto. Estas restricciones también limitan consultas legítimas. El catálogo compartido contiene nombres y relaciones propuestos, nunca registros de clientes ni resultados. Una respuesta de IA es texto no confiable; no se valida ni se ejecuta, y no garantiza corrección.

Existe un límite básico de seis solicitudes por minuto y usuario **por instancia** de la Edge Function: no es un límite global ni persistente. Se requiere un control compartido antes de depender de él como protección frente a abuso.

Tras una revisión y una autorización posteriores, en HotelManager-Pruebas habría que desplegar la función con verificación JWT habilitada, configurar en el gestor de secretos de Supabase `GEMINI_API_KEY` y `GEMINI_MODEL` con un modelo disponible para la cuota del usuario, verificar primero autenticación y permisos, y solo entonces activar `VITE_CENTRO_SQL_IA=true` en la configuración local de Vite. La función usa también las variables de ejecución de Supabase `SUPABASE_URL` y `SUPABASE_ANON_KEY`; nunca se necesita `service_role` en React. No colocar secretos en `.env.example`, Git ni variables `VITE_`. El soporte efectivo de modelo y cuota depende de Google y deberá comprobarlo el usuario en su cuenta.

Para completar el módulo después se necesitan las vistas y el ejecutor seguro, pruebas reales de escritura rechazada, funciones peligrosas, sentencias múltiples, rol, hoteles, límites y concurrencia, conectar resultados auténticos y probar CSV y gráficos. Solo tras superar esas pruebas podrían revisarse migraciones y un despliegue en el proyecto de ensayo.
