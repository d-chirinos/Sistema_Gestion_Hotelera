# HotelManager — contexto del proyecto

> Documento de continuidad basado en el código actualmente visible, el historial de trabajo de esta conversación y el estado de Git inspeccionado el 6 de noviembre de 2026. Cuando una afirmación procede de una prueba anterior y no se repitió en esta revisión, se identifica como tal.

## 1. Objetivo y descripción

HotelManager es una aplicación académica de gestión hotelera para la asignatura Teoría y Diseño de Base de Datos de la USMP. Su interfaz permite administrar hoteles, reservas, habitaciones, clientes, empleados, cargos, servicios, consumos, estadías, pagos y mantenimientos. La aplicación usa datos ficticios de demostración y todavía no está conectada a una base de datos real.

El modelo lógico y relacional definitivo está referenciado en `Documentacion/ModeloLogicoyRelacionalDefinitivoTrabajoFinal.pdf`; la captura disponible es `Documentacion/ModeloRelacional.png`. Para cambios de datos, tablas y relaciones, esos documentos son la fuente de verdad. Las doce entidades acordadas son HOTEL, EMPLEADO, CARGO, HABITACION, TIPO_HABITACION, RESERVA, CLIENTE, ESTADIA, MANTENIMIENTO, PAGO, CONSUMO_SERVICIO y SERVICIO.

## 2. Arquitectura y tecnologías

- React 19 con componentes funcionales y hooks (`useState`, `useEffect`).
- Vite 8 como servidor de desarrollo y herramienta de compilación.
- JavaScript con módulos ES; ESLint para análisis estático.
- No se observan dependencias de UI o enrutamiento adicionales en `package.json`.
- La mayor parte de la aplicación está concentrada en `src/App.jsx`; los estilos están principalmente en `src/App.css`, con estilos base en `src/index.css`.
- `src/main.jsx` monta la aplicación. Los recursos visuales incluyen `src/assets/hotel-background.png` y `src/assets/hero.png`.
- Los datos demo se definen como arreglos iniciales en `App.jsx` y se copian a estados React. No se encontró persistencia de dominio en localStorage/sessionStorage en el código inspeccionado. Al recargar, los cambios en memoria se pierden y los arreglos iniciales vuelven a ser la base.
- Los CRUD son manejadores locales que actualizan esos estados; no hay persistencia remota ni conexión configurada a Supabase u Oracle.

## 3. Perfiles y permisos

### Administrador general

El panel administrativo completo se muestra tras la autenticación demo independiente. Las credenciales `admin` / `123456` están configuradas temporalmente en el frontend y no constituyen autenticación segura de producción. Este acceso no se deriva de ningún empleado. Puede gestionar módulos administrativos, incluidos empleados y cargos; la reactivación de reservas se reserva a este perfil.

### Recepcionista

Permisos definidos en código: Reservas (ver, registrar, editar y cancelar); Estadías y Clientes (ver, registrar, editar); Habitaciones, Tipos de habitación y Servicios (solo ver); Pagos y Consumos (ver y registrar). Sin eliminación. Una reserva cancelada queda solo para consulta por este perfil.

### Administrador empleado (cargo exacto `Administrador`)

Matriz actual: Dashboard y Hoteles solo consulta; Reservas, Estadías, Habitaciones, Tipos de habitación, Clientes, Servicios, Consumos, Pagos y Mantenimiento permiten ver, registrar y editar; Empleados y Cargos solo consulta. Sin eliminación, administración de cuentas/permisos ni reactivación de reservas. El acceso está separado del Administrador general.

### Personal técnico

Técnico de mantenimiento, Electricista, Plomero, Técnico de climatización y Pintor comparten la matriz del técnico: Habitaciones solo consulta; Mantenimiento permite consulta, registro y edición; los demás módulos están restringidos. Sin eliminación.

### Identificación demo

La validación temporal de empleados usa ID de empleado como usuario y el campo DOCUMENTO como contraseña. El código contiene a Ana López (ID 1, Recepcionista), Pedro Ramírez (ID 2, Técnico de mantenimiento), Sofía Castro (ID 3, Administrador empleado), Luis Fernández (ID 4, Electricista), Miguel Sánchez (ID 5, Plomero), Jorge Díaz (ID 6, Técnico de climatización), Carmen Vargas (ID 7, Pintor) y Valeria Soto (ID 8, Recepcionista). Los registros iniciales asignan a todos al hotel ID 1, Hotel Los Andes. Estas credenciales son únicamente datos demo; no deben usarse como mecanismo de seguridad real.

La matriz vive en `permisosPorCargoEmpleado` y sus objetos asociados en `src/App.jsx`. La visibilidad del menú y los controles de operaciones se derivan de la sesión y la matriz; la protección es del frontend y no sustituye controles de servidor/base de datos.

## 4. Módulos y capacidades

El código contempla Dashboard, Hoteles, Reservas, Estadías, Habitaciones, Tipos de habitación, Clientes, Empleados, Cargos, Servicios, Consumos, Pagos y Mantenimiento. Las entidades administrativas y operativas tienen listados, búsqueda/filtros acumulables, ordenamiento y paginación en los módulos donde fueron implementados. Los CRUD disponen de formularios y detalles; existen comprobaciones de dependencias para varias eliminaciones. Los detalles incluyen tarjetas de datos propios/relacionados y el componente compartido `DetailRelatedRecords` para tablas asociadas.

Relaciones destacadas en la implementación y contexto aprobado: HOTEL con HABITACION, EMPLEADO y SERVICIO; EMPLEADO con CARGO, HOTEL, ESTADIA y MANTENIMIENTO; HABITACION con TIPO_HABITACION y HOTEL, y con RESERVA/MANTENIMIENTO mediante sus FK; RESERVA con CLIENTE y HABITACION, y ESTADIA con RESERVA; ESTADIA con EMPLEADO, PAGO y CONSUMO_SERVICIO; SERVICIO con CONSUMO_SERVICIO. SERVICIO no tiene relación directa con ESTADIA. Verificar siempre contra el PDF antes de alterar el modelo.

La navegación y el contenido se controlan desde el estado de `App.jsx`; los módulos comparten componentes/helpers para filtros, encabezados ordenables y tablas de registros relacionados. El acceso inicial presenta bienvenida, selección de tipo de acceso, formularios demo y confirmación de identidad del empleado.

## 5. Reglas de negocio y restricciones conocidas

- Una reserva cancelada se conserva; no se elimina por cancelarla.
- Recepcionista puede cancelar reservas según su matriz. Una reserva cancelada no se edita ni se vuelve a cancelar desde el perfil.
- La reactivación cambia únicamente `estado` de `CANCELADA` a `CONFIRMADA`, conserva el registro y sus demás campos, y es exclusiva del Administrador general.
- La autorización de reactivación verifica `adminAuthenticated` y ausencia de `employeeSession`, tanto al mostrar la acción como al abrir/confirmar; el manejador vuelve a comprobar que la reserva exista y siga cancelada.
- Ningún empleado puede eliminar registros. Los permisos de empleados no contemplan gestión de cuentas ni capacidad de otorgarse permisos.
- Técnicos solo trabajan con datos del hotel de su sesión. Los filtros se derivan de relaciones existentes; TIPO_HABITACION es catálogo compartido según el criterio aprobado.
- Ana puede ver clientes con reservas en su hotel y, durante la sesión, clientes recién creados aunque aún no tengan reserva. Esa visibilidad temporal no persiste tras recargar si no hay una reserva relacionada.
- Los hoteles, empleados y otros datos iniciales deben conservar PK/FK existentes; no inventar entidades, campos o reglas no respaldadas por el modelo.
- La autenticación y permisos implementados en cliente son simulados y manipulables; antes de producción deben imponerse también del lado servidor mediante autenticación y políticas RLS.

## 6. Pruebas realizadas y resultados conocidos

### Verificaciones anteriores registradas en esta conversación

- La funcionalidad de reactivación se compiló y se revisó con lint y `git diff --check` durante su implementación anterior (según el reporte de esa tarea; no se repitieron esos comandos al crear este documento).
- Prueba interactiva previa: Administrador general reactivó RES-009, que pasó de CANCELADA a CONFIRMADA conservando ID 9 y los demás valores observados. La fila permaneció en el listado.
- Tras recargar para cambiar de perfil, los datos React volvieron a sus valores iniciales y RES-009 regresó a CANCELADA. Esto confirma el carácter temporal de aquella modificación en memoria.
- Prueba interactiva previa con Ana: no se ofreció reactivación; las reservas canceladas quedaron en consulta y las activas conservaron opciones de edición/cancelación conforme al perfil.
- Prueba interactiva previa con Sofía: no se ofreció reactivación ni acción de cancelación en el detalle/listado revisado.
- Auditorías anteriores de técnicos informaron acceso limitado a Habitaciones y Mantenimiento; no se repitieron en esta tarea.

### Verificaciones de la renovación visual (6 de noviembre de 2026)

- Revisión visual real en Chrome de bienvenida, acceso de Administrador general, Dashboard administrativo, Hoteles, Reservas, listado de Mantenimiento, detalle de Mantenimiento y formulario de alta de Mantenimiento (abierto, sin guardar).
- No se alteraron ni guardaron registros durante esa revisión. Chrome quedó en el formulario «Registrar mantenimiento», abierto y sin guardar, al detenerse el acceso.
- `npm.cmd run build`: correcto.
- `npm.cmd run lint`: correcto, sin salida de errores.
- `git diff --check`: correcto; Git solo mostró avisos de conversión LF/CRLF.
- La revisión de Chrome se detuvo después de que Computer Use reportara: `Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy.` No se intentaron mecanismos alternativos.
- La revisión visual fue en escritorio (captura aproximada de 1942 × 1385). No se verificaron tablet/móvil en navegador ni los demás perfiles en esta sesión.

## 7. Errores y funcionalidades pendientes

- No hay autenticación real ni persistencia. Las credenciales temporales están expuestas en el frontend; no aptas para producción.
- No hay aplicación de permisos confiable en servidor/base de datos ni aislamiento RLS por hotel.
- La prueba actual no verificó empíricamente exclusión entre varios hoteles: los arreglos demo inspeccionados contienen únicamente Hotel Los Andes.
- Las pruebas completas de escritura del entorno de Sofía en todos los módulos se solicitaron anteriormente, pero no hay en el historial disponible una confirmación fiable de que todas se hayan completado. Mantenerlas como pendientes salvo evidencia nueva.
- La auditoría visual integral aún no está completa: faltan capturas/verificación en Chrome de los demás módulos, submódulos y perfiles empleados (Sofía, Recepcionista y los cinco cargos técnicos).
- Las media queries de tablet/móvil se revisaron estáticamente, pero no se pudieron validar visualmente a 768 × 1024 ni 390 × 844.
- El flujo de reactivación no se repitió en esta renovación; las pruebas anteriores están documentadas arriba.
- La documentación `README.md` sigue siendo el texto genérico del template React + Vite, no una guía funcional de HotelManager.

## 8. Últimos cambios realizados

Renovación UI/UX parcial, sin cambiar reglas de negocio, datos, permisos, relaciones ni operaciones CRUD:

- `src/App.css`: refinamiento de los tokens de color, bordes, radios y sombras; consolidación de estilos compartidos para navegación, encabezados, indicadores, paneles, filtros, tablas, botones y modales; foco visible y estados deshabilitados; tratamiento responsive para sidebar, paneles, tablas/modal y paginación; animaciones reducidas con `prefers-reduced-motion`.
- `src/index.css`: tipografía de sistema sin fuentes externas, jerarquía base, color de texto y selección accesible.
- `src/App.jsx`: microcopy de la bienvenida actualizado para reflejar el acceso demo existente; encabezado y descripción correctos al cambiar a Cargos; conteo singular/plural en el contador compartido de detalles y en los contadores de Cargos/Hoteles; texto superior más contextual.
- `index.html`: idioma del documento cambiado a español (`lang="es"`).
- No se guardaron ni alteraron datos demo y no se modificaron permisos o CRUD.

## 9. Estado de Git

Estado inspeccionado el 6 de noviembre de 2026 antes de la renovación:

- Branch actual: `main`, siguiendo `origin/main`.
- Último commit observado antes de esta tarea: `2053829 Actualiza funcionalidades y permisos de HotelManager`.
- La rama estaba limpia (`main...origin/main`) al iniciar la renovación.
- Estado después de la renovación: modificaciones sin commit en `index.html`, `src/App.css`, `src/App.jsx`, `src/index.css` y este documento.
- No se hizo commit ni push.

## 10. Próximos pasos recomendados

1. Recorrer el resto de módulos y submódulos en Chrome con cada perfil una vez que la herramienta vuelva a verificar la URL; no guardar formularios durante la revisión visual.
2. Validar en navegador las resoluciones 1366 × 768, 1920 × 1080, 768 × 1024 y 390 × 844; build/lint/diff-check de esta iteración ya pasaron.
3. Atender cualquier regresión visual concreta observada, conservando permisos, operaciones, datos y relaciones.
4. Mantener actualizado este documento con archivos, verificaciones y estado de Git; no hacer commit/push sin instrucción.
5. Antes de integrar Supabase, definir autenticación separada del propietario, vínculo cuenta–EMPLEADO y permisos centralizados; aplicar autorización y aislamiento por hotel con políticas RLS y controles del lado servidor.

## Fuente y límites de este documento

Este resumen combina lectura de `src/App.jsx`, `package.json`, estructura visible del proyecto y el historial de esta conversación. No reemplaza el modelo PDF ni una auditoría completa de cada módulo. Los resultados de pruebas anteriores se presentan como antecedentes reportados y no como pruebas repetidas en la sesión de creación de este archivo.

## Continuación de la renovación visual (6 de noviembre de 2026)

### Alcance revisado en navegador

Computer Use permitió verificar la URL `http://localhost:5173/Sistema_Gestion_Hotelera/` y recorrer las siguientes vistas del Administrador general en escritorio: bienvenida, formulario de acceso, Dashboard, Hoteles, Reservas, Estadías, Habitaciones, Tipos de habitación, Clientes, Empleados, Cargos, Consumos, Servicios, Pagos y Mantenimiento. También se abrieron el detalle y el formulario de registro de Mantenimiento; ambos se cerraron sin guardar.

En las capturas de escritorio observadas, los listados comparten fondos fotográficos tenues, paneles blancos, encabezados y filtros alineados, tarjetas estadísticas, botones por acción y encabezados de tabla consistentes. El detalle y el formulario de Mantenimiento conservaron la legibilidad y el orden visual.

### Corrección visual realizada

- En Estadías se observó una barra horizontal innecesaria incluso en una ventana amplia. La tabla reutilizaba `.reservations-table`, cuyo ancho mínimo general es 1580 px aunque Estadías muestra cuatro columnas. Se agregó la clase local `estadias-table` y un ancho mínimo de 760 px. Tras la actualización en caliente, la captura de escritorio mostró la tabla completa sin barra horizontal; el ancho mínimo conserva desplazamiento cuando la pantalla sea estrecha.
- Archivos de esta corrección: `src/App.jsx` y `src/App.css`.

### Límites y pruebas pendientes

- Al recargar para salir del Administrador general, Computer Use detuvo la automatización con: `Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy.` La regla de la herramienta exige detener las acciones de UI tras ese mensaje. No se intentaron métodos alternativos.
- Por esa interrupción, no se inspeccionaron visualmente los perfiles de Sofía, Ana, Pedro ni los técnicos restantes en esta continuación. Tampoco se recorrieron modales, formularios o detalles de todos los módulos; solo se inspeccionó el detalle/formulario de Mantenimiento.
- Las capturas de esta sesión corresponden a escritorio amplio (aprox. 1942 × 1385). No se probaron visualmente resoluciones de tablet o móvil; su adaptación solo se examinó estáticamente en las media queries.
- No se revisó la consola del navegador porque la automatización se detuvo antes de esa comprobación.
- No se guardaron formularios ni se alteraron registros. El estado final de la pantalla tras el último intento de recarga no pudo verificarse.

### Verificaciones técnicas de esta continuación

- `npm.cmd run build`: correcto.
- `npm.cmd run lint`: correcto, sin avisos.
- `git diff --check`: correcto; Git informó avisos LF/CRLF en archivos modificados, sin errores de whitespace.

### Estado de Git

- Branch: `main`, siguiendo `origin/main`.
- Modificaciones locales sin commit: `CONTEXTO_PROYECTO.md`, `index.html`, `src/App.css`, `src/App.jsx` y `src/index.css`.
- No se realizaron commits ni pushes. La compilación no añadió archivos rastreados a `dist`.

## Validación final de acabado (6 de noviembre de 2026)

- Se leyó este contexto y se confirmó el estado local antes de continuar. No se revirtieron cambios ni se modificaron permisos, reglas, datos o CRUD.
- Revisión estática de `src/App.jsx` confirmó que Recepcionista, Administrador empleado y los cinco cargos técnicos reutilizan la matriz de permisos, la navegación condicionada y los componentes visuales comunes. Esta inspección no sustituye la revisión interactiva de sus pantallas.
- Computer Use encontró Chrome abierto, pero informó `Browsers: Error: The browser access host is unavailable`. No se intentó otro mecanismo de navegación ni se realizaron interacciones. Quedaron pendientes las capturas por perfil, la revisión de consola y las comprobaciones visuales responsive.
- Se revisaron estáticamente los breakpoints de 900, 760, 650 y 390 px: navegación que se apila, filtros dinámicos en una columna, estadísticas y detalles adaptables, formularios en una columna en móvil, modales tipo panel inferior y soporte de movimiento reducido. No se midieron ni validaron visualmente resoluciones de escritorio/tablet/móvil en esta continuación.
- No se encontró otra corrección visual concreta y comprobable en el código que justificara cambiar estilos sin una observación visual correspondiente. Se conserva el ajuste localizado de la tabla de Estadías registrado arriba.
- Verificaciones de esta fase: `npm.cmd run build` correcto, `npm.cmd run lint` correcto y `git diff --check` correcto; Git solo mostró avisos LF/CRLF.
- Branch `main`; permanecen las modificaciones locales en `CONTEXTO_PROYECTO.md`, `index.html`, `src/App.css`, `src/App.jsx` y `src/index.css`. Sin commit ni push.

## Recuperación de animaciones y transiciones (6 de noviembre de 2026)

- Se consultó el historial de `src/App.css` en el commit `798f0e9`. El diseño anterior ya contemplaba una entrada centrada, una pausa hasta los 1.9 segundos y el cambio a una posición lateral, pero la transformación final eliminaba `translate(-50%, -50%)`. Ese cambio de anclaje podía hacer que el logo pareciera aparecer directamente en su destino.
- `src/App.css`: la marca completa (símbolo y nombre como un solo contenedor) ahora recorre una animación CSS de 3 segundos: crece y gana opacidad en el centro, permanece hasta el 62 % y luego se desplaza continuamente a la posición final. En escritorio termina arriba a la izquierda; en pantallas de hasta 760 px termina centrada arriba. La pantalla de bienvenida conserva su apariencia y las tarjetas empiezan a aparecer durante el desplazamiento.
- `src/App.jsx`: la secuencia normal inicia en `intro` y programa los estados `transition` y `ready` a 1.9 s y 3 s. El modo de movimiento reducido usa una temporización más breve en vez de saltar al estado final.
- `src/App.css`: se armonizó la aparición breve de modales y avisos mediante opacidad y desplazamientos pequeños; se mantuvieron las transiciones existentes para botones, pestañas y navegación. El modo de movimiento reducido acorta el recorrido de bienvenida y elimina las animaciones accesorias de modales y avisos.
- Límite: los modales se desmontan inmediatamente al cerrarse desde sus estados React, por lo que esta intervención suaviza la apertura y los avisos, pero no introduce una fase de salida que pudiera cambiar el ciclo de vida común de todos los modales.
- Computer Use detectó la ventana `HotelManager - Google Chrome`, pero la inspección del navegador falló con `Browsers: Error: The browser access host is unavailable`. No se interactuó con la aplicación y no se pudo verificar visualmente la secuencia ni sus variantes responsive.
- Validaciones: `npm.cmd run build` correcto; `npm.cmd run lint` correcto; `git diff --check` correcto, con avisos informativos LF/CRLF en archivos locales.
- Estado Git: branch `main` siguiendo `origin/main`; continúan las modificaciones locales preexistentes en `CONTEXTO_PROYECTO.md`, `index.html`, `src/App.css`, `src/App.jsx` y `src/index.css`. No se hizo commit ni push.

## Transiciones globales de la interfaz (6 de noviembre de 2026)

- Se conservaron sin cambios la secuencia de bienvenida (`welcome-brand-journey`), sus temporizadores de fase y la adaptación de movimiento reducido ya documentados.
- `src/App.jsx`: al validar acceso de Administrador general o al continuar desde la identidad confirmada del empleado, se activa una entrada breve del panel. Todos los módulos cambian dentro de un contenedor con `key` por sección, que permite una transición de entrada al navegar.
- `src/App.jsx`: los estados de formularios, detalles y confirmaciones usan una salida diferida compartida de 240 ms. Durante la salida el panel se marca `inert`, bloqueando interacciones duplicadas; al terminar se aplican las actualizaciones de cierre y las aperturas que lleguen durante ese intervalo. Si el sistema prefiere movimiento reducido, la demora se anula. La limpieza de temporizadores ocurre al desmontar la aplicación.
- `src/App.css`: se añadieron tokens de duración/curva, entrada sutil del panel, transición de vistas, entrada de superficies condicionales bajo las pestañas de Habitaciones/Tipos, Empleados/Cargos y Consumos/Servicios, salida de backdrop y diálogos, y duraciones homogéneas para controles de pestaña, paginación y acciones de modal. La preferencia `prefers-reduced-motion` anula las nuevas animaciones. No se cambiaron permisos, validaciones, datos ni operaciones de dominio.
- Revisión estática: los formularios de acceso ya disponían de animaciones de cambio de ruta y los modales compartidos disponían de entrada. El cambio nuevo aborda específicamente la entrada al entorno/módulo y el desmontaje inmediato de los modales al cerrar.
- No se encontró un botón ni una acción actual de cierre de sesión en el encabezado/sidebar de `src/App.jsx`; por tanto no se añadió una capacidad nueva. No se probó un flujo de cierre de sesión.
- Browser/Computer Use no estuvo disponible: aunque Chrome fue detectado, el host de acceso devolvió `Browsers: Error: The browser access host is unavailable`. No hubo comprobación visual o interactiva de acceso, navegación, modales, notificaciones ni tamaños responsive.
- Verificaciones ejecutadas: `npm.cmd run build` correcto; `npm.cmd run lint` correcto; `git diff --check` sin errores (solo avisos informativos LF/CRLF).
- Archivos modificados en esta tarea: `src/App.jsx`, `src/App.css` y este documento. Se conservaron sin descartar los cambios locales preexistentes; no se hizo commit ni push.

### Diagnóstico adicional del recorrido (6 de noviembre de 2026)

- La única ruta del código que colocaba la marca directamente en el lateral era la detección de `prefers-reduced-motion: reduce`: React inicializaba la fase como `ready`, y CSS anulaba la animación con `animation: none` y fijaba la posición final. La inspección de Chrome no estuvo disponible, así que no se pudo confirmar si la preferencia estaba activa en la máquina del usuario.
- Se corrigió esa ruta: la marca inicia ahora en `intro` en ambos modos. Si el sistema solicita movimiento reducido, se conserva el recorrido centrado y lateral con duración de 1.35 s; el modo normal mantiene los 3 s. La pausa/movimiento reducido quedan coordinados con la aparición de la pantalla de bienvenida.
- Revisión estática confirmó que `WelcomeScreen` se monta desde el render raíz con los estados iniciales de autenticación falsos; al recargar se recrea la fase inicial. Cambiar la pantalla interna de acceso no reinicia la fase.
- No se pudo comprobar visualmente que Chrome reproduzca el movimiento en la sesión del usuario. `cua.getState()` detectó Chrome pero reportó `Browsers: Error: The browser access host is unavailable`; no se intentaron otras vías.
- Validación de esta corrección: `npm.cmd run build`, `npm.cmd run lint` y `git diff --check` finalizaron correctamente. Git reportó avisos LF/CRLF sin errores de whitespace.

## Corrección y comprobación real de transiciones (6 de noviembre de 2026)

- Diagnóstico: la transición de módulos anterior se aplicaba a un contenedor persistente y la clave React estaba en su hijo, de modo que la animación de entrada no volvía a ejecutarse al cambiar de módulo. Además, `hm-view-enter` solo cambiaba opacidad y el desplazamiento de 16 px faltaba; por eso el efecto era difícil de percibir. Los cierres de formularios/detalles también desmontaban el estado inmediatamente.
- `src/App.jsx`: la clave ahora está en el contenedor de vista. La navegación inicia una salida breve (120 ms), bloquea interacción duplicada durante esa salida y luego cambia el módulo, disparando la entrada de la vista nueva. Se respetan los módulos permitidos y `prefers-reduced-motion`. El cierre común de modales mantiene su contenido durante 300 ms, ejecuta la salida y después aplica los estados pendientes; una apertura solicitada durante el cierre se aplica al terminar. Entrada a los paneles administrativos y operativos usa una clase temporal.
- `src/App.css`: la vista entra con opacidad y desplazamiento vertical de 16 px durante 300 ms; la salida usa un desplazamiento corto y fundido. El tiempo de salida del modal queda sincronizado a 300 ms con el estado de React. Las pestañas continúan usando una entrada de opacidad para no crear un nuevo containing block en contenedores que albergan modales fijos. Se conserva `prefers-reduced-motion` y no se tocó la animación de marca de bienvenida.
- Pruebas reales en Chrome (ventana `HotelManager - Google Chrome`, URL local): tras recargar se vio la bienvenida; se abrió el formulario de Administrador, se validó `admin` / `123456` y apareció el Dashboard. Se navegó Dashboard → Reservas → Habitaciones y se observó cada vista. Se abrió y cerró el formulario «Registrar habitación» sin guardar. Se abrió y cerró el detalle de RES-003. Luego se recargó, se validó Ana López (`1` / `80000001`), se confirmó su identidad y se ingresó al entorno de Recepcionista, donde se observó Reservas con su identidad y Hotel Los Andes. No se guardaron ni modificaron registros.
- Los screenshots muestran las pantallas de origen/destino y los modales abiertos/cerrados. No fue posible grabar una secuencia de video ni medir fotogramas intermedios; el estado final visible después de cada interacción fue correcto. No se probaron escritura CRUD, confirmación de cancelación/eliminación, notificaciones ni los otros cargos técnicos. No se inspeccionó la consola de Chrome. No se cambió el ajuste del sistema para probar `prefers-reduced-motion`; su rama se verificó estáticamente.
- Después del ajuste final de `hm-view-enter`, se repitió en la sesión de Ana el cambio Reservas ↔ Habitaciones y las vistas terminaron en su destino correcto. Computer Use entrega capturas estáticas que ya muestran el estado final; no permite confirmar fotograma a fotograma la percepción del movimiento. Una primera activación no cambió la vista; al refrescar el árbol accesible y repetir la selección, el cambio funcionó. La sesión quedó en Habitaciones, sin formularios abiertos ni datos guardados.
- Verificaciones: `npm.cmd run build` correcto; `npm.cmd run lint` correcto; `git diff --check` sin errores. Git emitió solamente avisos de normalización LF/CRLF.
- Estado Git: rama `main`; se conservaron los cambios locales en `CONTEXTO_PROYECTO.md`, `index.html`, `src/App.css`, `src/App.jsx` y `src/index.css`. En esta corrección se editaron `src/App.jsx`, `src/App.css` y este documento. No se hizo commit ni push.

## Diagnóstico y validación adicional de transiciones (6 de noviembre de 2026)

- Causa identificada en el código: la salida de módulo era breve (120 ms en una iteración anterior) y la entrada usaba principalmente opacidad y un desplazamiento de 16 px; en una captura tomada al final de la acción casi no se percibía. La navegación ya desmontaba la vista anterior antes de montar la nueva, por lo que no se superponían ambas vistas, pero la amplitud/duración visual eran modestas. Los modales que usan `useAnimatedModalValue` conservan el estado durante el tiempo de salida y luego lo desmontan; el cierre comparte una demora sincronizada con CSS.
- `src/App.jsx`: la salida de módulos ahora dura 150 ms en movimiento normal y la vista entrante ejecuta 350 ms; se impide que clics repetidos creen temporizadores de navegación concurrentes. La entrada al panel dura 450 ms. El cierre modal dura 300 ms y, bajo `prefers-reduced-motion`, el cambio secuencial de módulo y cierre utilizan una breve transición de opacidad en lugar de movimiento.
- `src/App.css`: el desplazamiento de entrada de módulo/panel se amplió a 28 px, el de salida a 18 px, y la apertura/cierre del diálogo usa 24/22 px más una escala discreta. Los tokens centralizan 350 ms para entrada de módulo, 150 ms para salida, 450 ms para panel y 300 ms para modal. Se añadió salida por opacidad para el modo de movimiento reducido; la animación de bienvenida permaneció intacta.
- Verificación real en Chrome local mediante Browser/Computer Use disponible (`@oai/sky`): acceso `admin`/`123456` y Dashboard; se observó una captura intermedia de entrada del panel con contenido atenuado, seguida por el Dashboard estable. Se recorrió Reservas → Habitaciones; una captura inmediata mostró la fase de salida de Reservas y la siguiente el destino. Se abrió el formulario de reserva sin guardar y se cerró con «Cancelar»; se abrió/cerró el detalle de habitación 101. Se abrió una confirmación de eliminación bloqueada para habitación 102 (2 reservas y 1 mantenimiento relacionados) y se cerró con «Cerrar», sin borrar ningún dato. Las capturas intermedias mostraron opacidad y movimiento del diálogo; el contenido volvió a estar estable después de las transiciones.
- No se introdujeron ni guardaron datos. No se confirmó ninguna cancelación o eliminación.
- Limitaciones: la captura de pantalla es estática y no constituye grabación de video ni medición de fotogramas. Intentar abrir DevTools para inspeccionar estilos computados falló con `foreground window did not report a process id`; por ello no se midieron los valores computados ni se revisó la consola. No se comprobó visualmente el toast, la rama `prefers-reduced-motion`, las pestañas ni todos los perfiles, y no se midieron pantallas tablet/móvil.
- Validaciones ejecutadas: `npm.cmd run build` correcto; `npm.cmd run lint` correcto; `git diff --check` sin errores (solo avisos LF/CRLF).
- Estado de Git al finalizar: branch `main` siguiendo `origin/main`; cambios locales sin commit en `CONTEXTO_PROYECTO.md`, `index.html`, `src/App.css`, `src/App.jsx` y `src/index.css`. No se hizo commit ni push.

## Expansión de acceso desde las tarjetas de bienvenida (6 de noviembre de 2026)

- `src/App.jsx`: cada opción de acceso guarda el rectángulo real de su tarjeta con `getBoundingClientRect()`. El formulario se anima con Web Animations API desde un `translate/scale` calculado a partir de ese rectángulo hasta su geometría normal; el retorno invierte los mismos fotogramas para volver al origen. Durante el recorrido se bloquean interacciones repetidas y el contenedor de acceso queda inerte. La duración es 600 ms, o 420 ms cuando `prefers-reduced-motion` está activo.
- `src/App.css`: el formulario usa origen de transformación superior izquierdo para que la escala y el desplazamiento coincidan con la tarjeta. No se modificó la animación inicial del logotipo ni el diseño actual de tarjetas o formularios.
- Para conservar lo que el usuario haya escrito mientras cambia entre la bienvenida y el acceso, el retorno ya no borra los campos de credenciales; sí limpia mensajes temporales y oculta el texto de contraseña.
- Prueba visual en Chrome local (`http://localhost:5173/Sistema_Gestion_Hotelera/`): se observó la expansión de Administrador desde la tarjeta izquierda y de Empleado desde la tarjeta derecha; ambos formularios llegaron a su presentación centrada actual. En las dos rutas se pulsó «Volver a la bienvenida» y se confirmó que la selección reapareció. Las capturas estáticas mostraron claramente el estado intermedio de expansión de ambas opciones. La captura del retorno no permitió distinguir con claridad un fotograma de contracción intermedio, aunque sí se confirmó el retorno visual completo tras la transición. No se introdujeron credenciales ni se alteraron datos.
- No se midieron estilos computados ni se grabó video. La preferencia `prefers-reduced-motion` no se activó manualmente; su duración se verificó por inspección del código.
- Validaciones: `npm.cmd run build` correcto; `npm.cmd run lint` correcto; `git diff --check` correcto, con avisos informativos de normalización LF/CRLF.
- Estado Git: branch `main`; se conservaron modificaciones locales preexistentes. No se hizo commit ni push.

## Corrección del destello en la expansión de acceso (6 de noviembre de 2026)

- Causa identificada: al terminar la expansión, quitar la clase de transición volvía a habilitar la animación CSS de entrada de la ruta del formulario (`welcome-route-enter`), reiniciando opacidad y desplazamiento sobre el formulario que ya estaba en su sitio. En la salida, `animation.cancel()` retiraba el efecto WAAPI antes de que React sustituyera la pantalla, lo que podía exponer por un instante el estilo base del formulario.
- `src/App.css`: la animación de entrada por ruta ya no se aplica a los formularios de Administrador y Empleado que usan expansión desde tarjeta; se conserva para la pantalla de identidad verificada. La aparición inicial de la bienvenida se limita a la vista de selección, evitando reactivar una animación de ruta al terminar el acceso.
- `src/App.jsx`: antes de retirar el efecto WAAPI, ahora se termina y se copia su fotograma final al estilo presentado (`commitStyles`). Si el navegador no admite esa operación, se aplica el mismo transform y opacidad finales directamente al elemento. Luego React aplica el estado destino; así el formulario no vuelve a su estilo base entre la animación y el render.
- Se conservaron el origen medido, la duración de 600 ms (420 ms con movimiento reducido), la curva, dimensiones y valores del formulario.
- Verificación visual en Chrome local: Administrador y Empleado se abrieron y regresaron a la bienvenida. Se capturó cada formulario cerca del final de la expansión y se comparó con una captura posterior estable; en ambos casos mantuvo posición, escala y opacidad, sin reiniciar la animación de ruta. Las contracciones terminaron en la pantalla de selección sin que el formulario reapareciera. Las capturas estáticas no permiten grabar cada fotograma ni certificar ausencia de un destello de duración inferior a la captura, pero no se observó un salto en los estados de destino.
- No se ingresaron credenciales ni se alteraron registros. No se verificó manualmente la rama `prefers-reduced-motion` ni se grabó video.
- Verificaciones técnicas: `npm.cmd run build` correcto; `npm.cmd run lint` correcto; `git diff --check` correcto, con avisos informativos de normalización LF/CRLF.
- Estado de Git: branch `main`; cambios locales preexistentes conservados; sin commit ni push.
