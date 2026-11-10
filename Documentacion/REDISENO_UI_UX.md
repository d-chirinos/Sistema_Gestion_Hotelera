# Dirección visual de HotelManager

La interfaz utiliza una navegación persistente, un encabezado compacto, superficies claras y un acento verde sobrio. Las métricas y tablas conservan los datos autorizados y los estados de carga existentes. El Dashboard reorganiza sus tarjetas y paneles según el ancho disponible; los listados, formularios, diálogos y el centro SQL comparten escalas, bordes, controles y estados de foco.

La hoja `src/HotelManagerDesign.css` reúne las variables y las reglas de presentación aplicadas sobre los componentes existentes. La selección de acceso y su animación se conservan. Los componentes siguen determinando las acciones disponibles según la configuración, el rol y las respuestas del servidor.

Referencias públicas consultadas para patrones generales, sin copiar marcas ni recursos:

- [Mews: Dashboard](https://help.mews.com/s/article/your-dashboard) y [Timeline](https://help.mews.com/s/article/timeline): visión operativa y acceso a reservas.
- [Cloudbeds: navegación de PMS](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/16464111837211-General-Information-Cloudbeds-PMS-Menus-and-Site-Map) y [Dashboard](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/16873372577435-Get-to-know-your-new-Dashboard): navegación y jerarquía de información.
- [Little Hotelier: gestión hotelera](https://www.littlehotelier.com/property-management-system/): organización de tareas de recepción y alojamiento.
- [shadcn/ui: tablas de datos](https://ui.shadcn.com/docs/components/base/data-table) y [dashboard](https://ui.shadcn.com/blocks/dashboard): tablas reutilizables y composición de paneles.

Las referencias se utilizaron como orientación de organización, no como especificación funcional. No se introdujo un calendario ni acciones que no existían en HotelManager.
