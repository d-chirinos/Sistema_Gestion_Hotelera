# Altas administrativas del catálogo

`20261107070000_altas_administrativas.sql` depende de las siete migraciones anteriores. No modifica filas al instalarse. Concede EXECUTE a `authenticated`; cada RPC comprueba `auth.uid()`, cuenta activa ADMINISTRADOR y hotel. No concede acceso directo a tablas. Tras su despliegue las RPC son invocables por API aunque el formulario esté desactivado.

- `crear_servicio_hotel(nombre, precio)` crea un servicio de ese hotel; exige nombre no vacío y precio no negativo con hasta dos decimales.
- `crear_habitacion_hotel(numero, tipo, piso)` crea una habitación DISPONIBLE en ese hotel, únicamente con un tipo que ya tiene tarifa del hotel. Piso es opcional. No edita habitaciones existentes ni su historial.

Ambas serializan la clave natural normalizada por hotel. Una solicitud repetida con los mismos datos devuelve el registro existente; si nombre o número coincide pero sus datos difieren, rechaza y pide revisar el catálogo. No hay una clave de operación independiente: si cambia el catálogo tras una respuesta perdida, un reintento puede requerir revisión manual. Nunca cambiar los datos ni crear otra entrada sin comprobar el resultado anterior. Los nombres y números usan el mismo `lower(btrim(...))` del índice; no normalizan tildes ni espacios internos.

`VITE_ALTAS_CATALOGO=false` por defecto. Activarlo solo en un entorno donde la migración haya sido aplicada y verificada, reiniciando Vite. Los campos, confirmaciones y consultas son para un administrador del hotel; la interfaz no es una barrera de seguridad. Sigue sin existir alta de empleados, cargos, tipos globales ni cuentas Auth desde React.
