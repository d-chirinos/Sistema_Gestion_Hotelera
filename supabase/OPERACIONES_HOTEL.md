# Consultas y operaciones por hotel

El operador confirmó siete migraciones en HotelManager-Pruebas. El estado de cualquier otro proyecto debe verificarse en su propio historial. Este documento no representa una comprobación remota realizada por la herramienta.

`consultar_operaciones_hotel(text)` permite al administrador activo consultar estadías, pagos, consumos, mantenimiento, empleados y cargos empleados en su hotel. Selecciona campos explícitos y no expone documentos, correo personal ni salarios. Las uniones limitan los pagos y consumos al hotel de la reserva y comprueban el hotel del servicio; los identificadores de consumos y mantenimientos se devuelven como texto desde la migración 060 para conservar la precisión de BIGINT. Un NULL histórico se muestra como no registrado: una fecha de fin NULL no prueba que el mantenimiento esté activo.

La interfaz consulta cada módulo al abrirlo. `VITE_OPERACIONES_LECTURA` está desactivada por defecto y debe activarse únicamente después de verificar la migración de lectura del proyecto. Las escrituras tienen opciones independientes y requieren sus RPC correspondientes. Para su alcance y limitaciones, véanse `ESCRITURAS_SEGURAS.md`, `CONSUMOS_MANTENIMIENTO.md` y `ALTAS_CATALOGO.md`.

La paginación es por rangos: si los registros cambian durante una consulta multipágina, la lista no constituye una instantánea transaccional.

## Pruebas locales

En un equipo con Docker local e imagen PostgreSQL 15 disponible:

```sh
docker run -d --name hotelmanager-operaciones-prueba --network none --label hotelmanager.prueba=operaciones-descartable -e POSTGRES_HOST_AUTH_METHOD=trust postgres:15
# Esperar a que PostgreSQL esté listo
python3 supabase/tests/operaciones_local.py hotelmanager-operaciones-prueba
docker rm -f hotelmanager-operaciones-prueba
```

El script rechaza contenedores sin la etiqueta, con red o cuya base no esté vacía. Crea identidades y datos sintéticos exclusivamente en esa base descartable; comprueba preservación de los registros al instalar, permisos, hoteles, validaciones, rollback y reintentos concurrentes. Algunas pruebas concurrentes agregan registros solo al contenedor descartable.
