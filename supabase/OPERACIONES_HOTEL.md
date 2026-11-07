# Estado actualizado

Para la nueva implementación de escrituras y su orden de revisión, consulta [ESCRITURAS_SEGURAS.md](ESCRITURAS_SEGURAS.md). La información histórica sobre el prototipo financiero que aparece a continuación describe la etapa anterior; la migración 040 y la interfaz están ahora preparadas en la rama.

# Operaciones del hotel: avance local, pendiente de despliegue

La migración nueva de lectura y el SQL futuro de escritura son independientes de las tres migraciones ya aplicadas. No modifican datos al instalarse. Deben revisarse y probarse en un proyecto de ensayo antes de autorizar su aplicación. Las funciones son `SECURITY DEFINER`, usan `search_path = pg_catalog`, invocan `auth.uid()`, verifican la cuenta activa ADMINISTRADOR y obtienen el hotel de su empleado. Solo `authenticated` recibe `EXECUTE`; `anon` y `PUBLIC` no lo reciben. No se conceden accesos directos a las tablas.

## 20261107030000_operaciones_lectura.sql

`consultar_operaciones_hotel(text)` permite consultar estadías, pagos, consumos, mantenimiento, empleados y cargos empleados en el hotel propio. Se seleccionan campos explícitos; no se muestran documentos, correo personal ni salarios. Los pagos son visibles solo al administrador del hotel correspondiente. Los consumos se vinculan también con el hotel del servicio y su subtotal se calcula en la consulta. Empleados relacionados con otro hotel no se divulgan en estadías ni mantenimiento. Un cargo global aparece solo si lo tiene un empleado del hotel. Un dato histórico NULL se muestra como no registrado; una fecha de fin NULL no prueba por sí sola que exista mantenimiento activo.

La pantalla usa la RPC solo cuando se abre cada módulo. `VITE_OPERACIONES_LECTURA=false` es el valor predeterminado; cambiarlo a `true` requiere haber desplegado y comprobado primero la migración y reiniciar/reconstruir Vite. La interfaz continúa sin escrituras. La paginación es por rangos: si los registros cambian durante una consulta multipágina, la lista no constituye una instantánea transaccional.

## futuro/20261107040000_pagos_y_precios.sql

**Atención: este archivo está fuera de migrations y no se aplicará mediante db push. Convertirlo en migración y aplicarlo habilitaría sus tres RPC de escritura para administradores autenticados mediante la API, aunque React no muestre botones.** Requiere revisión, pruebas y autorización explícita de despliegue.

- `registrar_pago_reserva(reserva, monto, método, UUID)`: solo reserva del hotel propio. El servidor define hora, fecha local y tipo. Pago antes de check-in: ADELANTO; desde el instante real de check-in: ORDINARIO. Una reserva cancelada, un check-in histórico sin hora o una reserva completada sin estadía requieren conciliación y se bloquean provisionalmente. No se procesan tarjetas ni transferencias: se registra únicamente un pago ya realizado.
- Una misma clave UUID con idénticos parámetros devuelve el mismo pago; parámetros diferentes se rechazan. Un bloqueo transaccional serializa llamadas concurrentes. El cliente deberá generar una clave aleatoria por operación y conservarla para todos los reintentos, incluso tras una respuesta perdida. Todavía no hay interfaz para garantizarlo.
- `actualizar_tarifa_hotel(tipo, precio_anterior, precio_nuevo)` y `actualizar_precio_servicio(servicio, precio_anterior, precio_nuevo)` solo afectan al hotel propio y rechazan cambios concurrentes mediante comparación optimista. No alteran importes pactados en reservas ni precios aplicados en consumos anteriores.

Las escrituras devuelven errores sin detallar registros de otro hotel. No hay anulaciones, devoluciones, conciliación de pagos, reglas de saldo máximo, procesador de pagos ni auditoría de intentos fallidos. El pago almacenado es evidencia del registro, no una auditoría independiente a prueba de rollback. Los saldos y reservas canceladas requieren decisiones específicas; ninguna prueba afirma resolverlas. Las RPC administrativas no sustituyen autorización laboral ni protección de la cuenta. Desplegar las RPC no habilita registro de reservas.

## Funcionalidades bloqueadas

- **Reservas/clientes**: el prototipo de mediador se conserva en `futuro/mediador/` con guardia. La enumeración y la auditoría reversible siguen sin resolver. No incluirlo en `migrations` ni retirar la guardia.
- **Check-in/check-out**: falta acordar el tratamiento de reservas canceladas, horarios imprevistos, estados de habitación y datos históricos ambiguos. Mantener la escritura cerrada; coordinar futuros bloqueos por habitación y reserva.
- **Consumos**: falta acordar el mecanismo de idempotencia y tratamiento de correcciones antes de crear cargos que puedan duplicarse por reintentos.
- **Mantenimiento**: `fecha_fin` NULL es ambiguo en históricos; no convertirlo automáticamente en mantenimiento activo ni modificar la disponibilidad sin una regla aprobada.
- **Empleados/cargos y habitaciones**: altas, cambios de hotel o cargo, bajas, permisos y cambios manuales de estado necesitan reglas de preservación histórica y autorización. Solo consulta.
- **Pagos y precios en React**: las RPC están preparadas y probadas localmente, pero no hay formularios ni botones de escritura; se requiere prueba de integración en ensayo y un flujo de confirmación/reintento adecuado.

## Pruebas aisladas

En un equipo con Docker local y una imagen PostgreSQL 15 disponible:

```sh
docker run -d --name hotelmanager-operaciones-prueba --network none --label hotelmanager.prueba=operaciones-descartable -e POSTGRES_HOST_AUTH_METHOD=trust postgres:15
# Esperar a que PostgreSQL esté listo
python3 supabase/tests/operaciones_local.py hotelmanager-operaciones-prueba
docker rm -f hotelmanager-operaciones-prueba
```

El script rechaza contenedores sin la etiqueta, con red o cuya base no esté vacía. Usa datos sintéticos, crea identidades Auth simuladas y ejecuta las tres migraciones anteriores, la nueva migración y el SQL futuro solo dentro del contenedor. Comprueba que instalar las migraciones conserva las 106 filas y las cuentas de ensayo; verifica permisos, hoteles, validaciones, rollback y reintentos concurrentes. La prueba concurrente agrega un pago **solo en ese contenedor desechable**.
