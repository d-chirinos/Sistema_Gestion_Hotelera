# Dashboard conectado

El panel combina la información del hotel y sus catálogos obtenida con `consultar_mi_hotel` con `listar_reservas_mi_hotel`, `consultar_operaciones_hotel` (pagos y mantenimiento) y `resumen_operativo_mi_hotel`. Estas funciones aplican la autorización en el servidor; la interfaz no selecciona otro hotel ni consulta tablas directamente. No se ha añadido ninguna migración.

Para ver reservas próximas, pagos, mantenimiento y los indicadores, compruebe primero que las RPC correspondientes están instaladas en el proyecto de ensayo y configure en su `.env.local` existente:

```text
VITE_RESERVAS_LECTURA=true
VITE_OPERACIONES_LECTURA=true
VITE_INDICADORES_HOTEL=true
```

Reinicie Vite después de cambiar las opciones. Si una opción está desactivada o una RPC falla, se indica el estado en vez de mostrar ceros como si fueran datos. Las opciones no conceden permisos: el servidor sigue verificando la cuenta y el hotel.

La fecha de hoy y las llegadas próximas utilizan la zona horaria del hotel. Los importes se presentan sin símbolo de moneda porque el modelo no define uno. Un mantenimiento sin fecha de fin puede ser histórico y no implica necesariamente que siga activo. Los indicadores adicionales históricos están en «Más indicadores operativos».

La prueba de navegador independiente usa respuestas simuladas, no se conecta a Supabase: `npx playwright test --config playwright.dashboard.config.js`.
