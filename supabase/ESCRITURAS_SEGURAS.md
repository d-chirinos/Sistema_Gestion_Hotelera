# Escrituras administrativas

Para el alcance añadido de consumos y mantenimiento, consulta [CONSUMOS_MANTENIMIENTO.md](CONSUMOS_MANTENIMIENTO.md). El estado de las migraciones puede diferir entre proyectos: comprobar su historial antes de cualquier despliegue.

Las migraciones se probaron en PostgreSQL local. El operador confirmó que están aplicadas en HotelManager-Pruebas; el estado de cualquier otro proyecto debe comprobarse por separado. Aplicarlas concede inmediatamente EXECUTE a `authenticated`; las funciones comprueban además `auth.uid()`, cuenta activa, rol ADMINISTRADOR y hotel. Los indicadores de React no son una barrera de permisos. Ninguna migración concede escritura directa a tablas ni modifica las filas al instalarse.

## Orden y alcance

1. Requiere las migraciones `20261107000000` a `20261107030000` ya aplicadas.
2. `20261107040000_pagos_y_precios.sql`: registrar pagos recibidos y actualizar precios vigentes de tarifas y servicios. El archivo anterior en `futuro/` se conserva como referencia histórica y no incluye las últimas comprobaciones; **no lo ejecute adicionalmente**.
3. `20261107050000_estadias_seguras.sql`: entrada y salida ordinarias. Coordina con pagos mediante el orden de bloqueo habitación → reserva → estadía.

**`supabase db push` propone todas las migraciones pendientes según el historial del proyecto vinculado.** El indicador de interfaz es independiente de esos permisos. Antes de cualquier aplicación, confirmar el destino y revisar la vista previa; no asumir que `db push` selecciona una migración por su nombre.

## Pagos

Solo se registran pagos ya recibidos; no se transfiere dinero. Importe positivo con dos decimales como máximo, método no vacío, reserva propia y fecha local del servidor. El instante real determina ADELANTO u ORDINARIO. Reservas canceladas o check-in histórico ambiguo requieren conciliación y se rechazan. No se fijan descuentos, recargos ni límites de saldo. No hay edición, eliminación, devolución o reembolso.

Una UUID única identifica la intención. La RPC serializa la clave, devuelve el mismo pago ante una repetición idéntica y rechaza parámetros distintos. React guarda la intención en `localStorage`, por usuario, antes de llamar a la RPC; no guarda claves de acceso. Usa Web Locks para impedir intentos simultáneos en pestañas del mismo navegador. Si la respuesta se pierde conserva la intención y solo ofrece reintentar con los mismos datos. Si no puede guardar o bloquear no envía el pago. Esta garantía no se extiende a otros navegadores o dispositivos ni sobrevive a borrar datos del navegador; no borrar la intención sin conciliación. Un rechazo definitivo también deja la intención pendiente y requiere revisión administrativa: no hay aún un procedimiento automatizado para descartarla con seguridad. La fila de pago no es una auditoría independiente de intentos fallidos ni prueba que se haya procesado dinero.

## Estadías

Para check-in la reserva debe estar CONFIRMADA, ser del hotel propio, no tener estadía y encontrarse en su intervalo de fechas locales. La habitación debe estar DISPONIBLE y no tener otra estadía abierta, incluso histórica. Si tiene algún mantenimiento con fin NULL, se rechaza la operación para revisión: no se asume que ese mantenimiento siga activo ni se modifica el histórico. El servidor registra el empleado autenticado y el instante, y marca la habitación OCUPADA. Entradas antes o después del intervalo están bloqueadas para revisión, sin establecer una regla definitiva para excepciones.

El check-out ordinario requiere reserva CONFIRMADA, habitación OCUPADA, una única estadía abierta, ningún mantenimiento de esa habitación con fin NULL, autor del mismo hotel e instante de check-in coherente conocido. El servidor guarda el instante, completa la reserva y marca la habitación DISPONIBLE en una sola transacción. Se permite salida el mismo día si es posterior al instante de entrada; el importe acordado no cambia. Los históricos con autor o instante desconocidos se rechazan para no inventar información. Un administrador distinto del registrador puede realizar la salida, de acuerdo con la especificación; el modelo no registra autor de check-out. Si se pierde la respuesta, consultar estadía y habitación antes de reintentar.

## Precios

Las RPC solo actualizan registros del hotel propio. El formulario envía el precio anterior y el servidor compara bajo bloqueo; un precio cambiado desde la carga provoca rechazo y exige actualizar la pantalla. Los importes de reservas y consumos existentes permanecen intactos. No se modifica el nombre o la pertenencia de habitaciones ni se cambia la tarifa de una reserva histórica.

## Interfaz y límites

Las opciones `VITE_PAGOS_ESCRITURA`, `VITE_ESTADIAS_ESCRITURA` y `VITE_PRECIOS_ESCRITURA` están en `false` por defecto. Para probar formularios, configurar la opción correspondiente después de desplegar las RPC en ensayo y reconstruir o reiniciar Vite. También se necesita `VITE_OPERACIONES_LECTURA=true` para ver pagos y estadías. Las acciones piden confirmación, procesan errores y vuelven a consultar tras éxito; ante errores de red no presumen que la escritura haya fallado.

Clientes y reservas siguen bloqueados por enumeración y auditoría reversible; `futuro/mediador/` conserva la guardia. Consumos y mantenimiento están preparados en una migración posterior, con las precauciones descritas en CONSUMOS_MANTENIMIENTO.md. Edición de habitaciones, empleados, cargos y cuentas necesita reglas de historial y autorización; la provisión Auth debe usar una vía administrativa segura, no credenciales privilegiadas en React.

## Pruebas locales

`supabase/tests/operaciones_local.py` requiere un contenedor PostgreSQL desechable, sin red, vacío y con etiqueta `hotelmanager.prueba=operaciones-descartable`; crea solamente identidades y datos de prueba. Ejemplo de creación y eliminación en `OPERACIONES_HOTEL.md`. Verifica preservación de las 106 filas al instalar, permisos, hotel, transacciones, reintentos y operaciones concurrentes. Las pruebas de navegador usan respuestas simuladas; no sustituyen una prueba Supabase completa en ensayo.
