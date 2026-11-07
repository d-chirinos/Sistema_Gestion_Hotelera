# Recorrido sugerido para HotelManager-Pruebas

Este recorrido usa exclusivamente el proyecto de ensayo. La ejecución de nuevas migraciones queda sujeta a revisión y autorización. Antes de presentar, comprobar URL pública del proyecto de ensayo, sesión y opciones Vite, y ensayar con una cuenta administradora de ese proyecto.

1. Iniciar sesión y mostrar el nombre del hotel asignado, el resumen real de habitaciones y el catálogo. Indicar que el administrador está limitado a su hotel.
2. Consultar habitaciones, tipos, tarifas y servicios; mostrar reservas y una cotización. Aclarar que cotizar no crea una reserva.
3. Consultar estadías, pagos, consumos, mantenimiento, empleados y cargos. El pago 13 de importe 10 y método SIMULADO fue confirmado por el operador en el entorno de ensayo; volver a verificarlo allí antes de mostrarlo.
4. Tras verificar las RPC y condiciones en ensayo, registrar un pago ya recibido y mostrarlo en el listado. Aclarar que no se procesa dinero y que, ante una respuesta perdida, se reintenta la operación pendiente en el mismo navegador.
5. Si existe una reserva y habitación que cumplan las condiciones, realizar check-in y luego check-out, verificando los estados. El check-out puede ser el mismo día y no altera el importe pactado.
6. Solo después de desplegar y verificar la migración 060 en ensayo, registrar un consumo sobre una estadía abierta inequívoca; comparar precio aplicado y subtotal. Iniciar y terminar mantenimiento de una habitación sin reservas incompatibles y liberarla mediante la acción separada.
7. Cerrar sesión.

No afirmar que el alta de clientes o la creación de reservas están disponibles: el mediador sigue bloqueado por enumeración y auditoría reversible. No afirmar que existen cobros bancarios, devoluciones, descuentos, anulaciones o administración completa de cuentas. Los formularios no son una garantía de permisos: las RPC deben estar desplegadas y verificadas. Ante estados históricos ambiguos, mostrar que el sistema rechaza la operación y requiere revisión.
