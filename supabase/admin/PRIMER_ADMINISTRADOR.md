# Alta inicial del administrador — procedimiento para revisión

Este procedimiento es manual, de uso único y requiere un operador autorizado con acceso al Dashboard y al SQL Editor del proyecto. No es una migración, no habilita el registro público y no cambia las políticas ni el esquema. No ejecutar hasta contar con autorización y verificar el proyecto y la identidad. La cuenta técnica no concede por sí sola permisos de aplicación: faltan las políticas RLS y RPC descritas en `../README.md`.

## Datos y comprobaciones previas

- Confirmar nombre y referencia del proyecto en el Dashboard. Acceder mediante una cuenta personal autorizada, nunca mediante credenciales compartidas.
- Identificar un hotel y un cargo existentes y válidos. Si aún no existen, crearlos mediante un procedimiento administrativo separado con datos reales; esta herramienta no los inventa ni crea. Verificar los ID en el SQL Editor.
- Identificar a la persona y su dirección de correo real por un canal verificado. Elegir si se vincula un empleado existente o se crea un empleado nuevo. Para el existente se necesita su ID y se debe comprobar que pertenece al hotel y tiene el cargo correctos. Para uno nuevo se requieren ID del hotel y cargo, nombre, apellido, documento y fecha de ingreso reales. No usar registros históricos de autoría o identidad inciertas.
- Comprobar si existe ya una cuenta ADMINISTRADOR, incluso inactiva. La plantilla rechaza cualquier administrador existente; si existe, detenerse y revisar el caso, no cambiar el rol ni el estado para eludirlo.

## Identidad Auth y vinculación

1. En **Authentication > Users** del Dashboard del proyecto, un operador autorizado crea o invita al usuario mediante la función administrativa disponible. Mantener desactivado el registro público. Usar la dirección verificada; no escribir contraseñas o tokens en SQL, repositorio, React ni chat. Si se utiliza invitación, validar la entrega y que el destinatario establezca sus credenciales por el flujo oficial; la disponibilidad de correo y redirección depende de la configuración del proyecto. No es necesario esperar la aceptación para vincular el UUID, pero el acceso solo debe considerarse listo tras verificarla.
2. Si la identidad ya existe, verificarla cuidadosamente antes de reutilizarla. Registrar de forma segura si fue creada para este procedimiento; nunca sustituir ni borrar automáticamente una identidad existente. Copiar su UUID desde el Dashboard y contrastarlo con el correo verificado. No incluirlo en el repositorio.
3. Abrir `primer_administrador.sql` localmente y copiarlo al SQL Editor del proyecto correcto. Rellenar solo en el editor `v_auth_user_id` con un literal UUID; para un empleado existente, rellenar `v_empleado_id`. Para crear uno nuevo, dejar este último en NULL y rellenar las variables de hotel, cargo y datos reales. Usar literales SQL válidos (escapar apostrofes duplicándolos) y un literal `date` ISO, por ejemplo `date 'AAAA-MM-DD'` con la fecha real. Nunca guardar la consulta personalizada en archivos del repositorio. El SQL Editor puede conservar historial; tratarlo como información personal y aplicar las políticas de acceso y retención de la organización.
4. Revisar otra vez proyecto, UUID, hotel, cargo y datos, y ejecutar el bloque completo en una sola sesión. El bloqueo de `cuenta_empleado` serializa altas concurrentes y la comprobación impide crear un segundo administrador mediante esta plantilla. Las claves foráneas y unicidad validan las referencias. El alta de empleado nuevo y la vinculación se confirman juntas; si falla cualquiera, la transacción se revierte. Si el editor interrumpe antes de `COMMIT`, ejecutar `ROLLBACK` en la misma sesión si sigue abierta; cerrar la sesión también revierte la transacción sin confirmar. No continuar tras un error sin verificar el estado.
5. Verificar en el Dashboard y mediante una consulta administrativa que el UUID corresponde al usuario deseado, que existe exactamente una cuenta ADMINISTRADOR activa y que apunta al empleado, hotel y cargo correctos. Confirmar también si la invitación fue aceptada. No mostrar datos personales en capturas o canales compartidos.

Ejemplo de consulta de verificación, ejecutada solo por el operador autorizado:

```sql
select ce.auth_user_id, ce.rol_sistema, ce.activo, e.id_empleado,
       e.hotel_id_hotel, e.cargo_id_cargo
from public.cuenta_empleado ce
join public.empleado e on e.id_empleado = ce.empleado_id_empleado
where ce.rol_sistema = 'ADMINISTRADOR';
```

## Fallos y recuperación

Auth y PostgreSQL se administran en pasos distintos: no forman una única transacción distribuida. Si Auth falla, no ejecutar el SQL. Si el SQL falla, no se conserva el empleado creado por el bloque ni su vínculo, pero puede quedar una identidad Auth sin vincular; mientras no haya cuenta técnica activa no tiene rol de HotelManager. Revisar el estado antes de reintentar. Eliminar o deshabilitar esa identidad mediante el Dashboard solo si se confirma que fue creada exclusivamente para este intento y que no tiene otros usos; una identidad preexistente no debe eliminarse. Si no se puede determinar, detenerse para revisión administrativa.

Si el resultado es incierto (por ejemplo, se pierde la conexión durante COMMIT), **consultar el estado primero**: no volver a crear la identidad ni repetir a ciegas. Si la vinculación existe, verificar que corresponde a la persona correcta. Si hay un vínculo incorrecto o privilegios indebidos, restringir el acceso mediante una intervención administrativa autorizada y revisar antes de corregir; no volver a ejecutar el alta inicial ni borrar datos por suposición. Registrar el incidente fuera del repositorio según los procedimientos de la organización.

Esta plantilla no sustituye una política de seguridad: propietarios, superusuarios y roles BYPASSRLS pueden actuar por vías privilegiadas. Los roles ordinarios siguen sin acceso a las tablas mientras no se aprueben políticas y RPC. El Dashboard, el SQL Editor y la cuenta del operador deben estar protegidos y accesibles solo a administradores autorizados.
