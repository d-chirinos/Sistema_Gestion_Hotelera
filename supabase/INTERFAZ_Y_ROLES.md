# Interfaz unificada y acceso operativo

`src/main.jsx` monta una única aplicación conectada a Supabase. `src/App.jsx` y sus datos antiguos permanecen como referencia del prototipo, pero no se usan como fuente de datos del sistema conectado. La bienvenida recupera las fases, iconos, selección Administrador/Empleado y transiciones del diseño original; ambos formularios usan correo y contraseña de Supabase Auth. El botón elegido no concede permisos: el servidor determina cuenta, hotel y rol. No se usan las credenciales simuladas del prototipo.

## Roles y migraciones

El modelo distingue el **cargo laboral** de `empleado` del **rol de sistema** de `cuenta_empleado`. El cargo se muestra en el perfil. Los permisos se determinan por el rol asignado explícitamente a la cuenta activa, no por comparar el nombre de un cargo: así un cambio de texto de cargo no concede privilegios. Un técnico, electricista u otro empleado operativo requiere que un administrador vincule su propia cuenta Auth existente con rol `MANTENIMIENTO`; no se crean usuarios ni cuentas automáticamente. No existe administrador global.

- `20261107110000_acceso_operativo_lectura.sql` requiere las migraciones anteriores hasta 100. Agrega perfil y consultas por hotel para `RECEPCIONISTA` y `MANTENIMIENTO`. Recepción consulta habitaciones, tipos, tarifas, servicios, reservas, clientes vinculados, estadías, pagos y consumos; mantenimiento consulta habitaciones, tipos y mantenimientos. No devuelve documentos o salarios. El perfil y cada RPC vuelven a validar Auth, cuenta activa, rol y hotel.
- `20261107120000_escrituras_operativas.sql` depende de 110 y las migraciones anteriores. Conserva los cuerpos de las RPC existentes y amplía sus guardias: recepción puede crear las reservas ya implementadas, registrar pagos, consumos y check-in; puede registrar check-out cuando sea el empleado que hizo el check-in. Un ADMINISTRADOR puede registrar la excepción. Mantenimiento puede iniciar y finalizar intervenciones de su hotel. Liberar habitación, administrar tarifas o servicios y modificar catálogos permanecen reservados al administrador. No se agregan permisos directos a tablas.

**Aplicar 120 habilita inmediatamente esas RPC a los roles indicados vía API, aunque React esté desactivado.** Las banderas de interfaz no son controles de seguridad. La selección de acceso tampoco determina el rol: una cuenta solo puede realizar las operaciones autorizadas en el servidor.

`VITE_ACCESO_EMPLEADOS=false` y `VITE_ESCRITURA_EMPLEADOS=false` por defecto. Tras desplegar y verificar 110 en ensayo se puede activar la primera. Tras desplegar y probar 120 se puede activar la segunda, además de las banderas de cada módulo (`VITE_RESERVAS_LECTURA`, `VITE_CLIENTES_HOTEL`, `VITE_OPERACIONES_LECTURA` y las opciones específicas de escritura). Reiniciar Vite. Una cuenta no vinculada o inactiva no obtiene acceso; si el perfil no coincide con empleado, rol y hotel de la cuenta, la interfaz falla cerrada.

## Interfaz y límites

Las acciones existentes se presentan en ventanas modales con los estilos de reservas del prototipo. Se recuperan detalles de habitaciones, tipos, tarifas, servicios, reservas, clientes y tablas operativas con campos ya autorizados, además de búsqueda, ordenación y paginación en varias listas. Los datos se obtienen mediante las RPC; no se presentan los arreglos demo como datos remotos.

No todas las interacciones originales están implementadas: faltan algunos filtros avanzados y acciones de edición/cancelación/eliminación. No hay borrados indiscriminados. La conciliación de clientes existentes de otro hotel sigue sin resolverse; el alta académica nueva rechaza coincidencias sin vincular automáticamente. Las opciones pendientes no deben mostrarse como operaciones guardadas.

Las pruebas automatizadas usan PostgreSQL local aislado y respuestas Auth simuladas. No se ha ejecutado SQL contra HotelManager ni HotelManager-Pruebas durante esta tarea. Para desplegar, comprobar la referencia del proyecto de ensayo y revisar `supabase migration list --remote` y `supabase db push --dry-run --remote`; la vista previa incluirá todas las migraciones pendientes, no solo 110 y 120. Aplicar únicamente tras revisión y autorización. El proyecto principal requiere autorización explícita independiente.
