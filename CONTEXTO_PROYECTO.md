# HotelManager — guía de continuidad para Codex Cloud

> Revisión del repositorio: 6 de noviembre de 2026. Esta guía distingue el estado comprobable del código de pruebas interactivas registradas anteriormente. Los datos y credenciales descritos son ficticios de demostración.

## 1. Objetivo y alcance

HotelManager es una aplicación web académica de gestión hotelera para la asignatura Teoría y Diseño de Base de Datos de la USMP. Presenta un flujo de acceso por perfiles y módulos de operación hotelera sobre datos de muestra en memoria. Sirve como prototipo de interfaz y CRUD; no está conectada a una base de datos ni debe considerarse un sistema de autenticación seguro.

El modelo de referencia del proyecto está en `Documentacion/ModeloLogicoyRelacionalDefinitivoTrabajoFinal.pdf`, con una imagen en `Documentacion/ModeloRelacional.png`. Consultarlos antes de cambiar entidades, atributos o relaciones. El modelo enumera HOTEL, EMPLEADO, CARGO, HABITACION, TIPO_HABITACION, RESERVA, CLIENTE, ESTADIA, MANTENIMIENTO, PAGO, CONSUMO_SERVICIO y SERVICIO.

## 2. Tecnologías y ejecución

- React 19 y React DOM 19, componentes funcionales y hooks; JavaScript con módulos ES.
- Vite 8 y `@vitejs/plugin-react`; ESLint 10 con reglas de React Hooks y React Refresh.
- No hay librería de componentes, router ni cliente de base de datos declarado en `package.json`.
- Requisito práctico: Node.js/npm compatibles con las versiones instaladas; el proyecto no documenta una versión mínima fijada. En Windows puede usarse `npm.cmd` si la política de PowerShell bloquea `npm`.

```sh
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

`vite.config.js` fija la ruta base `/Sistema_Gestion_Hotelera/`; el despliegue debe servir el sitio bajo esa ruta o ajustarla conscientemente. `npm run preview` sirve el build local para inspección. No existe script `test` ni suite automatizada configurada. El README actual conserva el texto plantilla de React/Vite.

## 3. Estructura del repositorio

- `src/main.jsx`: monta `<App />` dentro de `React.StrictMode` e importa CSS global.
- `src/App.jsx`: aplicación, datos de demostración, estados, reglas de acceso, navegación, consultas locales, formularios, validaciones y vistas. Archivo monolítico de alrededor de 4 mil líneas; realizar búsquedas por nombres de módulo/manejador antes de editar.
- `src/App.css`: sistema visual de bienvenida, panel, tablas, formularios, diálogos, estados y animaciones. Reglas acumuladas por módulo.
- `src/index.css`: normalización/tipografía y estilos globales mínimos.
- `src/assets/hotel-background.png`, `hero.png`: imágenes usadas por la interfaz; `react.svg`, `vite.svg` son recursos de plantilla.
- `public/favicon.svg`, `public/icons.svg`: recursos estáticos.
- `index.html`: título, viewport, favicon y punto de montaje.
- `vite.config.js`: plugin React y ruta base de publicación.
- `eslint.config.js`: configuración flat de ESLint.
- `package.json` y `package-lock.json`: dependencias/scripts y versiones resueltas.
- `Documentacion/`: modelo lógico/relacional PDF e imagen.
- `CONTEXTO_PROYECTO.md`: esta guía; `.gitignore` excluye dependencias y build (`node_modules`, `dist`, etc.). `dist/` y `node_modules/` pueden existir localmente pero son artefactos, no fuente.

## 4. Arquitectura y flujo de aplicación

La entrada siempre es `WelcomeScreen`, incluida en `src/App.jsx`. El estado local controla la secuencia de introducción, selección de acceso, formularios y panel. No se usa URL router: la sección activa es estado React y la navegación sustituye la vista dentro del panel. El componente raíz contiene los arreglos de dominio, sus copias `useState`, filtros/orden/paginación, CRUD y detalles. Helpers/componentes compartidos incluyen `SortableHeader`, `DynamicListFilterPanel`, `ListPagination`, `DetailPrimaryKey`, `DetailRelatedRecords` y `useAnimatedModalValue`.

El panel presenta navegación lateral y módulos según el perfil autenticado. La aplicación deriva vistas filtradas por hotel/rol y relaciones entre arreglos mediante claves foráneas. Formularios/modales editan estado React; los listados soportan, según el módulo, búsqueda, filtros avanzados, ordenamiento y paginación. Formularios tienen validación HTML (`required`, rangos y formatos) más validaciones de negocio específicas en manejadores. Detalles muestran datos y filas relacionadas. Hay confirmaciones para operaciones destructivas y mensajes de error/feedback; acciones visibles dependen de permisos.

## 5. Acceso demo y permisos

### Administrador general

Autenticación de frontend independiente del empleado: usuario exacto `admin`, contraseña `123456`. Tiene acceso a módulos administrativos y acciones de eliminación habilitadas por la matriz general, además de reactivar reservas canceladas. No es una cuenta real ni segura; las credenciales están en el bundle cliente.

### Empleados

La forma de acceso usa ID de empleado como usuario y su campo `DOCUMENTO` como contraseña. Registros iniciales: Ana López (1, Recepcionista, `80000001`), Pedro Ramírez (2, Técnico de mantenimiento, `80000002`), Sofía Castro (3, Administrador, `80000003`), Luis Fernández (4, Electricista, `80000004`), Miguel Sánchez (5, Plomero, `80000005`), Jorge Díaz (6, Técnico de climatización, `80000006`), Carmen Vargas (7, Pintor, `80000007`) y Valeria Soto (8, Recepcionista, `80000008`). Todos están asociados al hotel 1, Hotel Los Andes. Estas credenciales se derivan de los datos fuente y son públicas/ficticias.

| Perfil | Módulos/operaciones según `permisosPorCargoEmpleado` |
|---|---|
| Recepcionista | Reservas: ver, registrar, editar y cancelar; Estadías y Clientes: ver/registrar/editar; Habitaciones, Tipos de habitación y Servicios: solo ver; Pagos y Consumos: ver/registrar. |
| Administrador empleado (cargo `Administrador`) | Dashboard y Hoteles: ver; Reservas, Estadías, Habitaciones, Tipos de habitación, Clientes, Servicios, Consumos, Pagos y Mantenimiento: ver/registrar/editar; Empleados y Cargos: solo ver. |
| Personal técnico | Habitaciones: ver; Mantenimiento: ver/registrar/editar. Cargos Técnico de mantenimiento, Electricista, Plomero, Técnico de climatización y Pintor comparten permisos. |
| Administrador general | Acceso administrativo completo en el cliente, incluida eliminación y reactivación exclusiva. No depende del cargo de empleado. |

Ningún empleado tiene permiso de eliminación en su matriz. La restricción solo se aplica en frontend; no existe servidor que autorice operaciones.

## 6. Módulos implementados

El panel contempla Dashboard, Hoteles, Reservas, Estadías, Habitaciones, Tipos de habitación, Clientes, Empleados, Cargos, Servicios, Consumos, Pagos y Mantenimiento. Habitaciones/Tipos y Servicios/Consumos tienen subsecciones relacionadas. Dashboard compone indicadores y listados breves a partir de los datos visibles. Los módulos presentan listados y formularios/detalles acordes con sus entidades; operaciones CRUD reales sobre el estado local no equivalen a persistencia. Empleados/Cargos son de solo lectura para perfiles empleados, pero el administrador general puede gestionarlos.

Las relaciones que la interfaz consulta incluyen hotel-habitaciones/empleados/servicios; empleado-cargo/hotel/estadía/mantenimiento; habitación-hotel/tipo y referencias desde reserva/mantenimiento; reserva-cliente/habitación/estadía; estadía-reserva/empleado/pago/consumos; consumo-servicio. Servicio no se relaciona directamente con estadía. Confirmar siempre con el PDF ante cambios de esquema.

## 7. Reglas y validaciones observables

- Una reserva cancelada se conserva con estado `CANCELADA`; recepción no la edita ni vuelve a cancelar. Administrador general puede reactivarla a `CONFIRMADA`, manteniendo el resto de sus campos. Esa acción vuelve a validar el perfil y el estado al confirmar.
- No se permite eliminar una reserva por la acción de cancelación. El administrador general dispone de controles de eliminación en otros registros, con comprobaciones de dependencias donde están implementadas; no asumir que todos los módulos aplican idéntica política.
- Estadías seleccionan reservas no canceladas, empleado relacionado y fechas; el checkout no puede preceder al check-in (restricción de formulario).
- Relaciones se seleccionan desde entidades existentes para preservar FK. Diversos formularios aplican campos obligatorios, límites, montos positivos/no negativos y reglas de fecha; la validación exacta está en cada `guardar*`/`registrar*` y debe revisarse al ampliar un módulo.
- Los técnicos ven operaciones acotadas al hotel de su sesión. Tipos de habitación se trata como catálogo visible compartido según implementación/criterio del proyecto.
- Clientes filtrados para empleado se derivan principalmente de reservas de su hotel; clientes creados en esa sesión se mantienen en una lista auxiliar para que sigan visibles aunque aún no tengan reserva. Al recargar desaparecen como todos los cambios no persistidos.
- Autenticación, permisos y aislamiento por hotel son lógica de interfaz, no controles de seguridad. No desplegar con datos personales reales.

## 8. Datos y persistencia

Los arreglos `*Iniciales` de `App.jsx` alimentan estados para hoteles, tipos/habitaciones, reservas, clientes, cargos/empleados, mantenimiento, servicios, consumos, estadías y pagos. Los manejadores actualizan dichos estados; no se encontró uso de `localStorage`, `sessionStorage`, API HTTP o base de datos para persistir el dominio. Recargar restaura datos de muestra y pierde altas, ediciones, bajas y cambios de estado. Reiniciar sesión sin recargar puede mantener el estado de la instancia. Fechas y montos se representan con strings/números en objetos JavaScript. Las claves primarias nuevas se generan desde los arreglos presentes; no hay garantía de concurrencia/durabilidad propia de una BD.

## 9. Identidad visual, interacción y responsive

Interfaz en español, con identidad HotelManager, fondos/recursos de hotel, superficies claras, acentos azul petróleo/turquesa, tarjetas, navegación lateral y tablas con acciones. `index.css` fija la familia tipográfica de sistema (Inter si está disponible, luego Segoe UI/Roboto/Arial), colores y controles heredados. `App.css` contiene la mayor parte del diseño; incluye puntos responsive para escritorio, tablet y móvil (anchos frecuentes 1000/900/760/700/650/480/420 px). La presencia de media queries está comprobada en código; no implica que cada tamaño se haya validado visualmente recientemente.

Hay controles con etiquetas/roles ARIA, diálogo modal, anuncios de filtros/errores y botones explícitos; cobertura y gestión completa de foco/teclado no han sido auditadas sistemáticamente.

## 10. Animaciones aprobadas y otras transiciones

Se deben conservar las animaciones aprobadas; esta tarea no modificó archivos de aplicación.

- **Introducción del logotipo/nombre:** `WelcomeScreen` pasa por `intro`, `transition` y `ready`. Dos timers controlan la aparición y avance; en movimiento normal los hitos son 1900 ms y 3000 ms, y con `prefers-reduced-motion` 900 ms y 1350 ms. CSS (`welcome-brand-journey` y reglas cercanas) anima la marca hacia la pantalla de selección.
- **Tarjetas Administrador/Empleado al formulario:** al seleccionar tarjeta se mide su `getBoundingClientRect()`. Web Animations API anima el formulario desde un `translate/scale` calculado respecto de esa tarjeta hasta su ubicación habitual. Dura 600 ms (420 ms con movimiento reducido). Se bloquean interacciones concurrentes durante la transición.
- **Retorno inverso:** usa los fotogramas invertidos de la misma geometría para contraer el formulario hacia su tarjeta; al terminar restaura selección. Los campos escritos se conservan; mensajes temporales/visibilidad de contraseña se limpian según el manejador.
- **Corrección del destello:** antes de cancelar el efecto, el código aplica el fotograma final con `commitStyles()` o un estilo equivalente de respaldo. Las animaciones CSS de entrada de ruta se excluyen de los formularios que usan expansión para que no se reinicien al acabar.
- **Panel, cambio de módulo y modales:** clases/keyframes `hm-panel-enter`, `hm-view-enter/leave` y `hm-surface-enter`; el código coordina salida antes de sustituir la sección y bloquea temporizadores concurrentes. Modales animan backdrop/diálogo y retienen el valor durante cierre. CSS incluye adaptación `prefers-reduced-motion`, habitualmente sustituyendo movimiento por opacidad breve.

### Evidencia de animaciones

La mecánica y duraciones anteriores se verificaron por inspección del código en esta revisión. Pruebas interactivas registradas el 6 de noviembre de 2026 observaron apertura de ambas tarjetas y retorno a bienvenida, con pantallas destino correctas; para la corrección de destello se compararon capturas cercanas al final y estables y no se observó salto. Capturas estáticas no prueban cada fotograma ni descartan destellos más breves que el muestreo. `prefers-reduced-motion` se revisó estáticamente, no se activó manualmente. No rediseñar estas transiciones sin una solicitud explícita.

## 11. Verificaciones y evidencia

### Ejecutadas en esta revisión documental (6 de noviembre de 2026)

- Inspección del árbol fuente/configuración, `package.json`, `vite.config.js`, `index.html`, CSS base, arreglos iniciales, matrices de acceso, navegación, estados y manejadores relevantes en `App.jsx`.
- `npm.cmd run lint`: correcto, ESLint terminó sin errores.
- `npm.cmd run build`: correcto con Vite 8.3.5; generó `dist/` (17 módulos transformados).
- `git diff --check`: sin errores; Git mostró únicamente el aviso de normalización LF/CRLF para este Markdown.
- No se solicitó ni realizó una nueva prueba interactiva de todos los flujos CRUD. La revisión no altera datos porque el almacenamiento es local al navegador.

### Pruebas interactivas previas anotadas

Historial del documento anterior registra pruebas de reactivación de RES-009 por administrador general, ausencia de esa acción para Ana/Sofía, inspección de perfiles técnicos, varias pantallas de módulos y transiciones de módulo/modal. También registra comprobaciones visuales de las transiciones de tarjetas y la corrección del destello. Es evidencia histórica útil pero no repetida en esta sesión. Las capturas eran estáticas, no video; no se revisó sistemáticamente consola, todos los formularios, todos los perfiles o resoluciones. Consultar el historial Git si se necesita atribución/cambios exactos.

## 12. Limitaciones y pendientes

- Sin backend, base de datos, persistencia, API, sesión real ni seguridad de servidor; el login demo y permisos pueden inspeccionarse/modificarse desde el navegador.
- No hay pruebas automatizadas configuradas, router ni capa de servicios/modelo separada. `App.jsx` y `App.css` son grandes y concentran responsabilidades.
- La validación de reglas y protección de referencias no es uniforme por diseño de base de datos; inspeccionar el manejador de cada entidad antes de cambiar reglas.
- El README sigue siendo plantilla. No se verificó despliegue real bajo la ruta base ni disponibilidad de Node mínima. No se han confirmado todas las vistas en móvil/tablet ni accesibilidad completa.
- `dist/` local puede estar presente y no debe confundirse con fuente actual; regenerarlo mediante build cuando sea necesario.

## 13. Estado de desarrollo

Prototipo funcional de frontend con bienvenida animada, accesos demo por perfil, panel, módulos de dominio, relaciones, tablas, filtros y CRUD en memoria. Las transiciones aprobadas de bienvenida y tarjetas, su retorno inverso y el arreglo del destello están implementados y cuentan con evidencia visual previa. La reactivación de reservas para administrador general también está implementada, con evidencia interactiva previa. No hay integración persistente con el modelo relacional. Cambios locales preexistentes pueden existir; revisar `git status` antes de comenzar y preservar trabajo ajeno. No hacer commit/push salvo instrucción expresa.

## 14. Siguientes pasos recomendados

1. Acordar un contrato de backend y mapear fielmente el PDF a migraciones/esquema; definir API, autenticación y autorización reales antes de incorporar datos no ficticios.
2. Separar datos/helpers, servicios, componentes y páginas por módulo gradualmente, manteniendo comportamiento y animaciones aprobadas.
3. Fijar Node/npm compatibles, documentar despliegue con la ruta base y reemplazar el README plantilla.
4. Crear pruebas automatizadas para permisos por cargo, validaciones de fechas/FK, cancelación/reactivación, dependencias CRUD y persistencia.
5. Hacer QA de teclado/lector de pantalla y tamaños móviles; probar explícitamente `prefers-reduced-motion` y transiciones en navegadores objetivo.
6. Mantener esta guía alineada con el código y etiquetar como verificado solo lo que se vuelva a ejecutar/probar.
