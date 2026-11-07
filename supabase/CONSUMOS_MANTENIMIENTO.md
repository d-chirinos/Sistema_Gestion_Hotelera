# Consumos y mantenimiento: preparados para ensayo

La migración `20261107060000_consumos_mantenimiento.sql` depende de las seis migraciones anteriores. No carga ni modifica filas al instalarse. Crea RPC con `SECURITY DEFINER`, `search_path` fijo, verificación de `auth.uid()`, ADMINISTRADOR activo y hotel propio. Otorga EXECUTE a `authenticated`, no a `anon` ni PUBLIC; ninguna RPC permite escrituras directas de tablas. **Tras aplicar la migración, las RPC de escritura serán invocables por la API aunque la interfaz siga desactivada.**

## Consumo

`registrar_consumo_estadia` requiere una estadía abierta inequívoca, habitación ocupada, reserva confirmada y servicio del mismo hotel. Bloquea habitación, reserva y estadía en el orden empleado por check-in y pagos; también bloquea el servicio al capturar su precio. Si el precio mostrado por el formulario cambió, rechaza la operación. Conserva el precio unitario al registrar y calcula el subtotal; no cambia precios históricos. Ante una fecha o autor ambiguo, mantenimiento de fin desconocido u otra ocupación abierta, exige revisión.

## Mantenimiento

`iniciar_mantenimiento_hotel` registra una intervención y marca la habitación MANTENIMIENTO. Exige habitación disponible, sin estadía abierta ni mantenimientos con fin desconocido. Como no se especifica una duración, rechaza conservadoramente habitaciones con reservas confirmadas cuya salida sea futura: es una restricción operativa provisional para no afectar reservas, no una política definitiva de programación.

`finalizar_mantenimiento_hotel` pide el ID exacto, costo confirmado y declaración explícita del operador. Solo acepta identificadores en el rango utilizado para nuevas operaciones; no permite cerrar automáticamente los históricos de identificador bajo. El rango no demuestra por sí solo el origen si ya existieran históricos con IDs altos: el operador debe verificar la intervención antes de confirmar. Finalizar registra fecha y costo, pero **no** libera la habitación. `liberar_habitacion_mantenimiento` es una acción separada y exige que exista una intervención terminada con costo, que no haya mantenimientos con fin NULL ni estadías abiertas. Nunca interpreta un NULL histórico como prueba de actividad o cierre.

## Reintentos e identificadores

Para conservar las 13 tablas y no añadir columnas, consumo e inicio usan como clave el propio BIGINT de la fila, generado aleatoriamente en el intervalo `[2^61, 2^62)`. La RPC serializa solicitudes con la misma clave, devuelve el registro si los parámetros coinciden y rechaza diferencias. Una colisión con un ID existente se rechaza; el rango es finito y no reserva físicamente el espacio de identidad, por lo que no elimina por completo la posibilidad de colisión futura. Los identificadores grandes viajan como texto para evitar pérdida de precisión en JavaScript. Esta migración reemplaza la función de lectura existente conservando sus permisos y cambia a texto los IDs de consumos y mantenimientos; clientes externos que esperen números deben adaptarse.

Antes de enviar, React guarda en `localStorage` la clave y los parámetros por cuenta y operación; Web Locks evita envíos simultáneos desde pestañas del mismo navegador. Una respuesta perdida se reintenta con los mismos datos. Borrar los datos del navegador o usar otro dispositivo pierde esa protección local. Un rechazo definitivo también puede dejar la intención pendiente: no borrarla sin conciliación, pues no hay aún un procedimiento automático para descartar una solicitud de forma inequívoca. Una respuesta perdida al liberar habitación requiere consultar su estado antes de reintentar.

## Activación y demostración

`VITE_OPERACIONES_ESCRITURA=false` por defecto. Tras aplicar y probar la migración exclusivamente en el proyecto de ensayo, puede activarse junto con `VITE_OPERACIONES_LECTURA=true` y reiniciar Vite. Usar únicamente una estadía abierta y una habitación realmente disponibles en el hotel, verificadas en la interfaz. Crear un consumo, revisar precio y subtotal, iniciar un mantenimiento en una habitación sin reservas incompatibles, finalizarlo y, después, liberarla. No asumir que las filas históricas de fin NULL corresponden a trabajos activos.

Las pruebas de navegador son simuladas. Verificar en un proyecto de ensayo real, sin reutilizar como operaciones reales los ejemplos de las pruebas. Consultar `supabase/tests/operaciones_local.py` para ejecutar pruebas PostgreSQL en un contenedor desechable sin red.
