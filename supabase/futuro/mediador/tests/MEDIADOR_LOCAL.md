# Pruebas del mediador en una base desechable

Las pruebas crean roles, usuarios Auth simulados y registros sintéticos. **Nunca ejecutarlas en Supabase remoto.** Necesitan PostgreSQL 15 y Docker local. Desde la raíz del repositorio, crear un contenedor sin red y con la etiqueta de prueba:

```sh
docker run -d --rm --name hotelmanager-mediador --network none --label hotelmanager.prueba=mediador-descartable -e POSTGRES_HOST_AUTH_METHOD=trust postgres:15
python supabase/futuro/mediador/tests/ejecutar_mediador_local.py hotelmanager-mediador
docker stop hotelmanager-mediador
```

El ejecutor exige etiqueta, red `none` y base vacía. Carga las migraciones existentes y datos sintéticos, verifica que la guardia del mediador cancela la migración y la retira **solo en una copia en memoria** para probar los casos funcionales. Compara las 106 filas y cuenta simulada antes y después de instalar el candidato y de las pruebas revertidas. Las pruebas concurrentes y de riesgos crean filas de prueba; descartar el contenedor después.

El diagnóstico final reproduce intencionalmente dos riesgos pendientes: inferencia por resultados y reutilización del token tras un rollback controlado por el llamador. Una ejecución exitosa del diagnóstico significa que esas limitaciones se han reproducido, **no** que el mediador esté listo para desplegar. No demuestra verificación presencial, seguridad del gateway ni protección completa frente a enumeración.
