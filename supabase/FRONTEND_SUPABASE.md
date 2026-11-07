# Primera conexión React con Supabase

La pantalla activa usa Supabase Auth y las RPC `mi_cuenta_hotelmanager()` y `consultar_mi_hotel(text)` de la segunda migración. El prototipo anterior y sus datos locales permanecen en el repositorio, pero ya no son el punto de entrada ni se presentan como datos de Supabase. Esta versión no ofrece acciones de escritura. Las identidades sin vínculo activo no ven pantallas privadas; los roles distintos de ADMINISTRADOR pueden identificarse pero todavía no tienen consultas habilitadas.

## Preparar una prueba en Windows

Una vez que esta implementación esté disponible en tu copia de la rama y revisada:

1. Desde la raíz del proyecto, ejecuta `npm ci` con Node.js compatible con el proyecto y comprueba `npm test`.
2. Copia `.env.example` a `.env.local`. En el Dashboard del proyecto correcto, consulta la URL y la clave **publishable** (o la antigua clave `anon`) y colócalas en `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. No escribas valores en el repositorio ni los compartas en chat. El archivo `.env.local` está ignorado por Git. Las variables `VITE_` se incluyen en el navegador y no son secretas; jamás uses `service_role`, `sb_secret_`, tokens personales o contraseñas como variables de la aplicación. La validación local rechaza claves secretas conocidas y JWT cuyo rol no sea `anon`, pero la protección real corresponde a RLS, RPC y los permisos del servidor.
3. Ejecuta `npm run dev` y abre en el navegador la URL local que muestra Vite. Usa la cuenta Auth existente en el formulario; introduce la contraseña directamente en el navegador. No habilites registro público ni crees otro usuario para esta prueba. Comprueba que aparezcan el hotel y sus habitaciones, tipos, tarifas y servicios; no deben aparecer módulos de escritura ni datos del prototipo antiguo.
4. Cierra la sesión y verifica que ya no aparecen datos privados. Para validar cuenta sin vínculo, inactiva o expiración, usa un entorno de pruebas autorizado y no cambies la cuenta administradora existente. No es necesario enviar credenciales a Codex.

El SDK guarda la sesión en el almacenamiento local del navegador para recuperarla al recargar; usa un equipo y perfil de navegador de confianza y cierra sesión al terminar. La interfaz no utiliza `service_role`, pero la seguridad depende de mantener las políticas y permisos del servidor revisados. Las consultas leen en páginas de 200 filas; revisa que el límite máximo de filas de la API sea al menos 200. Las RPC actuales no definen un orden estable, por lo que, con datos que cambien durante varias páginas, podría haber omisiones o repeticiones; en ese caso se necesita paginación ordenada en el servidor antes de usar grandes volúmenes. Esta etapa no proporciona actualización en tiempo real.

## Pruebas

`npm test` incluye pruebas con servicios simulados de autenticación, vínculo, rol, consultas, errores, expiración y carrera con cierre de sesión. `npm run lint` y `npm run build` comprueban el código y la compilación. Una prueba local de navegador interceptó las solicitudes a Supabase y simuló las respuestas; no sustituye la validación en un proyecto de pruebas real autorizado.
