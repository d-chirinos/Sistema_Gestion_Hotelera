# HotelManager: guía del modelo para la exposición

## Alcance

El modelo físico tiene **13 tablas hoteleras y una tabla técnica** `cuenta_empleado`. Además usa `auth.users`, gestionada por Supabase Auth y externa al modelo hotelero. Las claves e identificadores de tabla se escriben en minúsculas en PostgreSQL. La base de demostración es sintética; no son identidades reales.

## Tablas y claves primarias

| Tabla | PK | Función |
|---|---|---|
| `hotel` | `id_hotel` | Establecimiento y zona horaria. |
| `cargo` | `id_cargo` | Catálogo laboral global y salario base. |
| `tipo_habitacion` | `id_tipo` | Catálogo global de tipos y capacidades. |
| `cliente` | `id_cliente` | Cliente global; puede reservar en distintos hoteles. |
| `empleado` | `id_empleado` | Persona empleada, adscrita a un hotel y a un cargo. |
| `habitacion` | `id_habitacion` | Número, tipo y estado de una habitación de un hotel. |
| `tarifa_habitacion` | `id_tarifa` | Precio vigente por hotel y tipo de habitación. |
| `servicio` | `id_servicio` | Servicio y precio vigente de un hotel. |
| `reserva` | `id_reserva` | Reserva de cliente y habitación con fechas, estado e importe pactado. |
| `estadia` | `id_estadia` | Entrada real y eventual salida de una reserva. |
| `mantenimiento` | `id_mantenimiento` | Intervención de un empleado sobre una habitación. |
| `pago` | `id_pago` | Pago asociado directamente a una reserva. |
| `consumo_servicio` | `id_consumo` | Servicio consumido durante una estadía y precio unitario aplicado. |
| `cuenta_empleado` | `auth_user_id` | Vinculación de una identidad Auth con un empleado y su rol de sistema. |

Las PK hoteleras son `BIGINT` generadas por defecto como identidad; se admiten IDs explícitos cuando una operación los necesita. La PK de cuenta es `UUID` de Auth. `cuenta_empleado.empleado_id_empleado` también es UNIQUE: como máximo una cuenta está vinculada a un empleado.

## 18 claves foráneas

Las 16 siguientes son hoteleras; cada flecha apunta a la PK de la tabla de destino:

1. `empleado.hotel_id_hotel → hotel`.
2. `empleado.cargo_id_cargo → cargo`.
3. `habitacion.hotel_id_hotel → hotel`.
4. `habitacion.tipo_habitacion_id_tipo → tipo_habitacion`.
5. `tarifa_habitacion.hotel_id_hotel → hotel`.
6. `tarifa_habitacion.tipo_habitacion_id_tipo → tipo_habitacion`.
7. `servicio.hotel_id_hotel → hotel`.
8. `reserva.cliente_id_cliente → cliente`.
9. `reserva.habitacion_id_habitacion → habitacion`.
10. `estadia.reserva_id_reserva → reserva`.
11. `estadia.empleado_id_empleado → empleado`.
12. `mantenimiento.habitacion_id_habitacion → habitacion`.
13. `mantenimiento.empleado_id_empleado → empleado`.
14. `pago.reserva_id_reserva → reserva`.
15. `consumo_servicio.estadia_id_estadia → estadia`.
16. `consumo_servicio.servicio_id_servicio → servicio`.

Las dos técnicas son `cuenta_empleado.empleado_id_empleado → empleado` y `cuenta_empleado.auth_user_id → auth.users`. Las FK hoteleras restringen el borrado de registros referenciados; eliminar un usuario Auth elimina su vinculación técnica, no los datos hoteleros. Una reserva tiene como máximo una estadía porque `estadia.reserva_id_reserva` es UNIQUE. Una habitación tiene muchas reservas y una reserva puede tener muchos pagos. **Pago no referencia estadía.**

## Integridad y reglas relevantes

- `NOT NULL` exige los datos obligatorios; las excepciones históricas permiten NULL en campos concretos sin inventar autoría, instantes o país/tipo documental.
- Los nombres únicos aprobados y los números de habitación utilizan `lower(btrim(...))`; no se eliminan tildes ni espacios internos. La unicidad de documento del cliente usa tipo, país y documento normalizados; cuando tipo o país son NULL, PostgreSQL permite duplicados y se requiere conciliación.
- Una tarifa es única por hotel y tipo. Un servicio y un número de habitación son únicos dentro de su hotel. Su alcance no es global.
- Los CHECK validan, entre otros, capacidad positiva, importes permitidos, fechas y estados enumerados. Los precios de tarifa son positivos; servicios y consumos pueden tener precio cero. Los montos de pago son positivos. `NUMERIC` también excluye `NaN` en los importes relevantes.
- Una reserva exige salida posterior a entrada. La restricción PostgreSQL `EXCLUDE USING GiST` impide que reservas CONFIRMADA o COMPLETADA de una habitación se solapen en rangos `[entrada, salida)`, incluso con concurrencia. Las reservas consecutivas son posibles; las canceladas no bloquean el rango.
- `consumo_servicio` conserva `precio_unitario_aplicado`. La vista `v_consumo_servicio_detalle` calcula cantidad × precio; no se almacena un subtotal redundante.
- `DATE` representa la fecha local; `TIMESTAMPTZ` el instante. Las RPC nuevas usan la zona IANA del hotel. En check-out, el instante debe ser posterior al check-in; se acepta el mismo día sin recalcular el importe pactado.

## Seguridad y transacciones

Las tablas tienen RLS y los roles de API no reciben permisos directos de escritura. Supabase Auth identifica la cuenta; las RPC verifican cuenta activa, rol ADMINISTRADOR y hotel a partir de `auth.uid()`. ADMINISTRADOR no es global. `SECURITY DEFINER` requiere revisar propietario y privilegios, usa `search_path` fijado y solo concede EXECUTE a `authenticated`; la función aún vuelve a verificar el rol.

- **Check-in/out:** bloquean habitación, reserva y estadía en ese orden y actualizan estados en una transacción. Una excepción o fallo revierte el conjunto. No inventan datos históricos ambiguos.
- **Pago:** referencia la reserva, clasifica adelanto u ordinario con el instante real y usa UUID de idempotencia. El mismo UUID y parámetros devuelven el mismo pago; no se cobra dinero mediante la aplicación.
- **Consumo:** bloquea las entidades del hotel, compara el precio mostrado con el vigente y conserva el precio aplicado. El subtotal es derivado.
- **Mantenimiento:** iniciar y terminar se controlan por RPC; terminar no libera automáticamente la habitación. La disponibilidad requiere una acción posterior y comprobaciones.
- **Precios:** la comparación con el precio anterior evita sobrescribir una actualización concurrente; las reservas y consumos previos no cambian.

Los reintentos protegidos dependen también de que el navegador conserve sus intenciones pendientes. La idempotencia no sustituye una auditoría independiente ni corrige por sí sola datos históricos.

## Límites para explicar honestamente

El prototipo anterior sigue bloqueado por enumeración y auditoría reversible. La migración 100 prepara un alta académica de cliente nuevo y primera reserva con rechazo genérico y sin reutilización automática; el éxito o rechazo aún puede revelar una coincidencia. La cotización y la lista de reservas son consultas; no crean reservas. La migración 090 prepara por separado reservas para clientes ya vinculados al hotel. No hay pagos bancarios, devoluciones ni administración completa de cuentas. Las funcionalidades nuevas requieren que su migración esté instalada y que el proyecto y la bandera de interfaz sean los correctos. Ver el recorrido y restricciones en `RECORRIDO_DEMOSTRACION.md` y las guías de operaciones.

La migración 080, pendiente de despliegue según el historial del proyecto, añade indicadores y un saldo informativo, así como alta y edición de empleados sin cuenta ni historial, y edición de habitaciones sin historial. Consulte `INDICADORES_GESTION.md` para alcance y precauciones.

La migración 090 agrega consultas de clientes ya vinculados al hotel y reservas para esos clientes; la migración 100 prepara el alta académica y primera visita sin reutilizar fichas existentes. Véanse `CLIENTES_RESERVAS_HOTEL.md` y `PRIMERA_RESERVA_ACADEMICA.md`.
