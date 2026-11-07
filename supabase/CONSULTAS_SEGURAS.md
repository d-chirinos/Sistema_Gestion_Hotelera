# Consultas seguras de alcance inicial

Esta migración añade dos funciones de lectura; no cambia tablas, políticas ni filas. Depende de que sigan vigentes las restricciones de la migración inicial: RLS activado sin políticas de acceso y privilegios directos revocados para `PUBLIC`, `anon` y `authenticated`. No elimina políticas ni concesiones agregadas posteriormente, y no habilita escrituras ni registro público.

## Contrato y permisos

- `mi_cuenta_hotelmanager()` devuelve como máximo `empleado_id`, `hotel_id` y `rol_sistema` para el UUID de `auth.uid()` con vinculación activa. Sin vínculo activo devuelve cero filas. No acepta una identidad ni hotel como parámetro.
- `consultar_mi_hotel(p_recurso text)` requiere una vinculación activa con rol `ADMINISTRADOR` y obtiene el hotel del empleado vinculado. No existe administrador global ni parámetro para elegir hotel. Una identidad sin cuenta activa o con otro rol recibe `42501`.
- Solo admite `hotel`, `habitacion`, `tipo_habitacion`, `tarifa_habitacion` y `servicio`. Los tipos son los usados por habitaciones o tarifas del hotel. Se enumeran las columnas expresamente: información y contacto del hotel, habitaciones, descripciones y capacidad de tipos, tarifas y servicios. Los recursos de clientes, empleados, cargos, reservas, estadías, mantenimiento, pagos, consumos y cuentas se rechazan con `22023`, incluso para administradores. No se exponen documentos personales, salarios ni detalles de pagos. Información adicional y permisos para otros roles requieren diseño posterior.
- Ambas funciones son `SECURITY DEFINER`, fijan `search_path` a `pg_catalog`, usan esquemas explícitos, no ejecutan SQL dinámico y consultan `auth.uid()` directamente. La migración retira `EXECUTE` a `PUBLIC`, `anon` y `authenticated`, y lo concede solo a `authenticated`. Ejecutan lecturas con los privilegios de su propietario: debe aplicarla un rol con acceso apropiado a las tablas y RLS, y protegerse la propiedad de las funciones y la creación en los esquemas. No concede permisos sobre tablas ni escritura. Propietarios, superusuarios, `BYPASSRLS`, roles heredados y otras funciones privilegiadas requieren revisión independiente.
- Supabase debe validar el JWT antes de establecer la identidad usada por `auth.uid()`. Los tests locales simulan esa identidad y no prueban el gateway ni la validación real de JWT. La desactivación o cambio de rol se consulta en cada sentencia, sujeto a la instantánea de la transacción en curso.

Las respuestas no están paginadas; antes de usarlas con más volumen se necesitan paginación y revisión de límites e índices. La reasignación de empleados, habitaciones o tarifas puede cambiar la interpretación de la pertenencia por hotel: las escrituras permanecen cerradas y deberán diseñarse procedimientos históricos antes de habilitarlas.

## Pruebas aisladas

`tests/consultas_seguras.sql` es solo para una base local desechable con las dos migraciones, los datos sintéticos, roles `anon` y `authenticated`, y un `auth.uid()` simulado que lee `request.jwt.claim.sub`. Inserta identidades ficticias y vinculaciones dentro de una transacción que revierte. **No ejecutar el archivo de pruebas en Supabase remoto.** Comprueba sujetos anónimos, sin JWT, sin vínculo, inactivos, recepción, mantenimiento y administradores de ambos hoteles; los cinco recursos permitidos; rechazo de los recursos sensibles y de escrituras; desactivación y ausencia de privilegios directos.

## Antes de desplegar

1. Verificar en el proyecto objetivo que no existan funciones homónimas, concesiones o políticas adicionales que alteren los supuestos, y revisar propietario, RLS, permisos heredados, secuencias y esquemas. Validar el alcance de las columnas y que las credenciales privilegiadas sigan fuera del navegador.
2. Revisar migraciones pendientes, versión de PostgreSQL, destino y respaldo. Probar primero con Auth, JWT y API reales en un entorno de pruebas autorizado. La prueba local no sustituye esa validación; no correr sus fixtures en un proyecto con usuarios reales.
3. Obtener autorización explícita antes de aplicar en remoto. Después verificar la identidad del administrador, la separación de hoteles y el rechazo de recursos y escrituras, así como la conservación de los 106 registros y la cuenta existente. React permanece fuera de esta etapa.
