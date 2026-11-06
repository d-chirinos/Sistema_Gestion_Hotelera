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

### Estado de verificación de este documento

No se ejecutaron build, lint ni pruebas de navegador al redactarlo. Las observaciones de código y Git se hicieron estáticamente. Por ello, no se afirma aquí que el estado actual compile; se recomienda ejecutar `npm run build`, `npm run lint` y `git diff --check` después de revisar los cambios locales pendientes.

## 7. Errores y funcionalidades pendientes

- No hay autenticación real ni persistencia. Las credenciales temporales están expuestas en el frontend; no aptas para producción.
- No hay aplicación de permisos confiable en servidor/base de datos ni aislamiento RLS por hotel.
- La prueba actual no verificó empíricamente exclusión entre varios hoteles: los arreglos demo inspeccionados contienen únicamente Hotel Los Andes.
- Las pruebas completas de escritura del entorno de Sofía en todos los módulos se solicitaron anteriormente, pero no hay en el historial disponible una confirmación fiable de que todas se hayan completado. Mantenerlas como pendientes salvo evidencia nueva.
- En este momento no se ha vuelto a probar visualmente la aplicación ni el flujo de reactivación tras crear el documento.
- La documentación `README.md` sigue siendo el texto genérico del template React + Vite, no una guía funcional de HotelManager.

## 8. Últimos cambios y estado local

La inspección actual de `git diff` muestra cambios locales sin commit en `src/App.jsx`. Incluyen, al menos, la matriz y navegación del Administrador empleado, filtrado por hotel en varias vistas/selectores y la acción/modal/manejadores independientes de reactivación de reservas. La reactivación es el cambio funcional más reciente trabajado. No atribuir todos los cambios del archivo a una sola tarea: el diff reúne trabajo previo acumulado.

No se modificaron datos demo durante la tarea de reactivación. La prueba de reactivación se realizó sobre estado en memoria y se perdió al recargar, restaurando los arreglos iniciales.

## 9. Estado de Git

Estado inspeccionado el 6 de noviembre de 2026:

- Branch actual: `main`, siguiendo `origin/main`.
- Último commit observado: `8f09a22 Implementar y validar entorno de tecnico de mantenimiento`.
- Archivo modificado localmente: `src/App.jsx`.
- Diferencia registrada en la inspección: 103 inserciones y 40 eliminaciones en `src/App.jsx` (puede cambiar con el trabajo posterior).
- No se hizo commit ni push para esta documentación.
- Este documento se crea como archivo nuevo sin seguimiento hasta que Git lo registre.

## 10. Próximos pasos recomendados

1. Revisar este contexto y el diff actual de `src/App.jsx` antes de tocar código; preservar todos los cambios existentes.
2. Ejecutar `npm run build`, `npm run lint` y `git diff --check` para establecer el estado técnico actual.
3. Completar auditorías funcionales pendientes sin escribir datos salvo que se confirme primero un método seguro de restauración.
4. Probar la reactivación con Administrador general y verificar que los perfiles empleados no reciban esa acción; recargar reinicializa el estado demo.
5. Mantener actualizado este documento al cerrar tareas importantes: cambios/archivos, pruebas reales, pendientes y estado de Git.
6. Antes de integrar Supabase, definir autenticación separada del propietario, vínculo cuenta–EMPLEADO y permisos centralizados; aplicar autorización y aislamiento por hotel con políticas RLS y controles del lado servidor.

## Fuente y límites de este documento

Este resumen combina lectura de `src/App.jsx`, `package.json`, estructura visible del proyecto y el historial de esta conversación. No reemplaza el modelo PDF ni una auditoría completa de cada módulo. Los resultados de pruebas anteriores se presentan como antecedentes reportados y no como pruebas repetidas en la sesión de creación de este archivo.
