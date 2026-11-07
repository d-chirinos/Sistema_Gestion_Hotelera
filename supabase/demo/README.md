# Datos académicos sintéticos de HotelManager

`datos_academicos_sinteticos.sql` es una carga manual de demostración, independiente de las migraciones y destinada a una **base de pruebas vacía**, con la migración estructural inicial ya aplicada. No se ejecuta automáticamente ni crea usuarios de Auth o cuentas de empleado. Sus nombres, documentos `DEMO-...`, direcciones y correos `example.invalid` son deliberadamente ficticios; no representan personas o lugares reales.

## Contenido y escenarios

| Tabla | Filas |
| --- | ---: |
| HOTEL | 2 |
| CARGO | 4 |
| TIPO_HABITACION | 4 |
| CLIENTE | 12 |
| EMPLEADO | 8 |
| HABITACION | 12 |
| TARIFA_HABITACION | 8 |
| SERVICIO | 8 |
| RESERVA | 18 |
| ESTADIA | 6 |
| MANTENIMIENTO | 4 |
| PAGO | 12 |
| CONSUMO_SERVICIO | 8 |

Hay un hotel en `America/Lima` y otro en `America/Mexico_City`, seis habitaciones y cuatro empleados por hotel, y una tarifa por cada combinación hotel/tipo. Cuatro reservas completadas tienen estadías cerradas; otras dos tienen estadías abiertas y sus habitaciones ocupadas. Hay diez reservas futuras confirmadas y dos futuras canceladas. Los cuatro mantenimientos comprenden dos finalizados con costo y dos en curso, estos últimos en habitaciones con estado MANTENIMIENTO y sin reservas futuras confirmadas. Cada una de las seis estadías tiene un adelanto anterior al check-in y un pago ordinario posterior; se incluyen servicios gratuitos, consumos y saldos pendientes. Los importes son cantidades didácticas y no definen una moneda del modelo.

Las fechas se calculan una sola vez respecto al instante de inicio de la transacción, en la zona local de cada hotel. Los instantes y fechas locales son coherentes; al generar, todos los check-in, check-out cerrados y pagos están en el pasado. El tiempo sigue avanzando: las estadías abiertas, mantenimiento en curso y reservas futuras son una instantánea de demostración y pueden quedar desactualizadas si la base se conserva durante muchos días. El total de alojamiento se calculó como noches por tarifa de ejemplo; los pagos y consumos no lo alteran.

## Protección y repetición

La carga bloquea las 13 tablas y `cuenta_empleado`, comprueba que estén vacías y cancela toda inserción si alguna contiene filas. También aborta en caso de error durante la transacción. No elimina ni modifica datos previos, no usa `ON CONFLICT` para ocultar conflictos y no permite repetir sobre una carga anterior. Para repetir de forma segura, preparar **otra base de pruebas vacía y aislada**, aplicar allí la migración inicial y ejecutar la carga una vez; no hay un comando de limpieza incluido. Una base con hotel, empleado o administrador existentes será rechazada, aunque pertenezcan al proyecto real. Revisar explícitamente cualquier estrategia de combinación antes de usarla en otro entorno.

Los ID son explícitos para facilitar las referencias y los ejercicios. Al terminar, el SQL avanza las secuencias al menos hasta el ID máximo; nunca reduce su valor. PostgreSQL no revierte `setval` al hacer rollback: si ocurre un error durante o después de ajustar secuencias, podrían quedar avanzadas aunque las filas se reviertan. Esto puede causar saltos de ID, no datos duplicados; verificar el estado antes de reintentar. El script utiliza los nombres de secuencia creados por la migración inicial sin modificar.

Las restricciones de seguridad del esquema siguen vigentes: RLS sin políticas y privilegios revocados a los roles ordinarios. La carga requiere una sesión administrativa autorizada; la ausencia de cuentas y políticas impide usarla directamente desde React. No usar secretos en el archivo ni asociar estas personas sintéticas a cuentas reales. La autorización para revisar estos archivos no equivale a autorización de carga remota.

## Validación aislada

Se probó en PostgreSQL 15 con los objetos de Supabase simulados y la migración estructural original. Se comprobaron conteos, referencias, intervalos, clasificación de pagos, fechas locales, correspondencia de hoteles, estados, precios, vista de subtotal y ausencia de usuarios o cuentas. Una segunda ejecución fue rechazada. Esto no prueba RPC, RLS ni transacciones de la aplicación futura, que aún no están implementadas, ni equivale a probar el proyecto remoto.

## Corrección de nombres en una carga anterior

La carga inicial usaba nombres literales como `Cliente Sintético 01`. La versión actual asigna nombres ficticios de aspecto natural; los documentos `DEMO`, los correos `example.invalid`, los ID y todas las demás columnas permanecen iguales. No se pretende representar personas reales. El empleado ID 1 pasa a llamarse Paola Mendoza Cárdenas y conserva el hotel 1 y el cargo 1; la plantilla de primer administrador sigue vinculando por ID, no por nombre.

Para una base que ya recibió la carga anterior se ha preparado `correccion_nombres_sinteticos.sql`, un script manual independiente, fuera de migraciones y semillas. Bloquea las dos tablas, verifica los 20 ID junto con los nombres anteriores y documentos `DEMO` y actualiza únicamente nombre y apellido en una transacción. Una discrepancia cancela toda la operación; no lo ejecute sobre una base ya corregida ni intente forzar una repetición. Antes de cualquier ejecución remota, verificar el proyecto, revisar y autorizar expresamente el script, respaldar según los procedimientos del proyecto y comparar el estado esperado. La autorización para preparar el archivo no autoriza su ejecución.
