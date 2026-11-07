# Indicadores y gestión del hotel

La migración `20261107080000_indicadores_y_gestion.sql` requiere las ocho migraciones anteriores. No modifica filas al instalarse. Sus RPC verifican `auth.uid()`, cuenta activa, rol ADMINISTRADOR y hotel; usan `SECURITY DEFINER` con `search_path` fijo. Concede EXECUTE solo a `authenticated`, sin permisos directos sobre tablas. Al aplicar la migración, **las dos RPC de escritura pueden invocarse por API aunque las opciones de React estén desactivadas**.

## Indicadores y saldo

`resumen_operativo_mi_hotel()` devuelve conteos por estado de reserva, estadías sin fecha de salida, pagos registrados, consumos del propio hotel y mantenimientos sin fecha de fin. Los importes son sumas históricas registradas, serializadas como texto para evitar pérdida de precisión. No existe moneda en el modelo: no se deben presentar como una moneda definida. Un mantenimiento sin fin o una estadía sin salida registrados pueden ser históricos ambiguos: no se afirma que estén activos. Los consumos cuyo servicio corresponda a otro hotel se cuentan como inconsistencias y se excluyen del importe, con aviso en React.

`saldo_informativo_reserva(id)` solo acepta reservas del hotel propio. Calcula alojamiento pactado + consumos del hotel − pagos registrados, sin suponer descuentos, tasas, penalidades, reembolsos o una moneda. Un saldo negativo solo indica que los pagos registrados exceden esos importes; no implica que exista un reembolso aprobado. Si la reserva está cancelada o hay consumos con servicio de otro hotel, el saldo es NULL; en el último caso se oculta también el subtotal de consumos y se indica que requiere revisión. Estos resultados son informativos y no son una liquidación financiera.

Activar `VITE_INDICADORES_HOTEL=true` para el panel y `VITE_SALDOS_LECTURA=true` para la consulta en Reservas solo tras verificar la migración en el proyecto activo. Para ver Reservas también se requiere `VITE_RESERVAS_LECTURA=true`.

## Alta de empleado

`registrar_empleado_hotel` crea un empleado en el hotel del administrador con nombre, apellido, documento, fecha de ingreso y un cargo ya utilizado en ese hotel. **No crea ni modifica usuarios Auth, cuentas o roles**. No se consultan documentos de empleados de otros hoteles. Para proteger reintentos se serializa el documento normalizado dentro del hotel: si existe uno con los mismos datos devuelve ese registro; si hay varios o sus datos difieren, rechaza y requiere conciliación. Esto no crea una restricción UNIQUE sobre documento y no impone unicidad global; una escritura privilegiada fuera de la RPC puede evitar esta coordinación. El formulario no guarda el documento en almacenamiento local. Ante respuesta perdida, comprobar el resultado antes de enviar datos distintos.

## Modificar empleado sin historial

`actualizar_empleado_sin_historial` permite corregir datos de un empleado del hotel solo si no tiene cuenta Auth vinculada ni aparece como autor en estadías o mantenimientos. El administrador introduce el documento actual para una comparación sin exponerlo en la lista. El servidor compara la versión anterior, serializa documentos por hotel y evita duplicados dentro de ese hotel; también limita el cargo a los ya empleados allí. No cambia hotel, cuenta o rol. El documento se transmite a la RPC pero no se guarda en el navegador. Empleados con cuenta o historial requieren otro procedimiento; el modelo no conserva versiones anteriores de sus datos.

## Modificar habitación

`actualizar_habitacion_sin_historial` admite cambios de número, tipo y piso solo para una habitación DISPONIBLE del hotel sin ninguna reserva ni mantenimiento asociados. El tipo debe tener tarifa en el mismo hotel. Una comparación de la versión anterior y el bloqueo de fila rechazan cambios concurrentes; la unicidad de número se conserva. Una habitación con historial necesita otro procedimiento y revisión, pues el modelo no guarda una instantánea histórica de número, piso o tipo.

Activar `VITE_GESTION_HOTEL=true` solo después de aplicar y verificar la migración; el alta de empleados también requiere `VITE_OPERACIONES_LECTURA=true`. Ambas opciones están desactivadas por defecto. No eliminar o transferir empleados con historial ni cambiar cuentas Auth mediante estas RPC.

## Pendiente

El mediador de clientes y reservas sigue bloqueado por enumeración y auditoría reversible. La creación y modificación de tipos y cargos globales necesita autorización y reglas para sus efectos en todos los hoteles; el rol actual no es global. La edición de empleados con historial, cuentas o cambios de hotel, cancelaciones, reembolsos o correcciones financieras necesitan reglas históricas o comerciales aprobadas. La igualdad de importe no demuestra que dos pagos o consumos sean duplicados; las claves de idempotencia protegen los reintentos previstos, no todos los errores operativos.

Las pruebas PostgreSQL están en `tests/operaciones_local.py` y requieren un contenedor desechable sin red según `OPERACIONES_HOTEL.md`. Las pruebas de navegador simulan el backend; aún debe comprobarse la integración de la migración en un Supabase de ensayo.
