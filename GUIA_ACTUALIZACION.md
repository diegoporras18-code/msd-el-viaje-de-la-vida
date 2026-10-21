# Guía de actualización — El Viaje de la Vida

Toda la escucha social sale de **una sola base maestra** acumulativa de SentiOne. Para actualizarla, adjunta la nueva exportación a Claude Code: Claude la incorpora sin duplicar, clasifica por contenido las menciones nuevas, actualiza las cifras y los hallazgos, y abre un Pull Request. Al fusionarlo, la web pública se actualiza sola en uno o dos minutos.

**Adjuntar Excel → Analizar → Actualizar resultados → Pull Request → Fusionar.**

## Desde el iPhone

1. Exporta desde SentiOne en **.xlsx**, con todas las columnas disponibles (ID, fecha y hora, fuente, URL, texto, sentimiento, país, interacciones y tipo). Configura la zona horaria en *America/Bogota*. No hace falta filtrar por país ni quitar registros repetidos.
2. Abre la app de Claude, entra en **Claude Code** y elige el repositorio `msd-el-viaje-de-la-vida`.
3. Adjunta el Excel con el botón **+** y pega este mensaje:

   > Procesa el Excel adjunto de SentiOne, incorpóralo a la base maestra sin duplicar registros, clasifica con Claude las menciones nuevas por sentimiento, temática, emoción y marcas, actualiza las cifras, los gráficos y los hallazgos sustentados, ejecuta las pruebas y crea un Pull Request para publicar la actualización.

4. Claude responde con un resumen:
   - Filas exportadas y menciones únicas.
   - Menciones nuevas y ya existentes.
   - Cifras que cambian y por qué.
   - Casos marcados para revisión.
5. Revisa el Pull Request. Cuando la comprobación **Validar Pull Request** esté en verde, pulsa **Merge** en la app de GitHub o pídeselo a Claude.
6. En uno o dos minutos, la web pública muestra la nueva versión: https://diegoporras18-code.github.io/msd-el-viaje-de-la-vida/

Si solo quieres revisar el resultado antes de crear el Pull Request, añade al mensaje: *«Muéstrame el resumen antes de crear el Pull Request.»*

## Otras actualizaciones

| Quiero… | Pídeselo a Claude Code así |
|---|---|
| Agregar una noticia o un creador verificado | «Agrega a las evidencias esta nota verificada: [enlace]». Se guarda en `src/content/evidencias.js`, solo con URLs públicas. |
| Aprobar o ajustar una conclusión | «Marca como aprobada la conclusión sobre [tema]» o «Cambia la recomendación de [tema] por…». Está en `src/content/conclusiones.js`. |
| Agregar otro laboratorio al análisis | «Agrega [laboratorio] a las marcas detectadas». Se edita en `src/config/marcas.js` y se reclasifica solo lo necesario. |
| Habilitar el Share of Voice | Confirma que la consulta de SentiOne incluye a las marcas con el mismo criterio: «La consulta captura MSD, Daiichi Sankyo y AstraZeneca por igual; habilita el Share of Voice». |
| Revisar casos dudosos | «Muéstrame los casos marcados para revisión de la última actualización». Hace falta adjuntar de nuevo el Excel, porque los textos no se guardan. |

## Qué garantiza el proceso

- **Sin duplicados.** Se deduplica por el ID de SentiOne. Sin ID, se usa la URL junto con el texto, para no fusionar comentarios distintos de una misma publicación. Las exportaciones que repiten días anteriores no vuelven a sumar registros: solo actualizan sus métricas.
- **Histórico acumulado.** Las menciones ya clasificadas conservan su clasificación. Solo se clasifican las nuevas o las editadas.
- **Clasificación por contenido.** Incluye sentimiento (general, hacia MSD o la campaña y hacia el sistema de salud), temáticas múltiples, emoción, intención de acción, marcas y relevancia, cada una con un nivel de confianza. El sentimiento original de SentiOne se conserva como referencia. Los criterios están en `datos/CRITERIOS_CLASIFICACION.md`.
- **Sin filtros geográficos.** Se usan todos los registros, con o sin país.
- **Privacidad.** El repositorio nunca contiene el Excel, los textos, las URLs de publicaciones privadas ni los autores. La web solo recibe resultados agregados y evidencias públicas aprobadas.
- **Cifras explicadas.** Cada actualización genera un informe en `datos/informes/` con las cifras que cambian y el motivo.

## Primera actualización real

La web muestra hoy una **referencia preliminar**: 2.837 registros del 21 de septiembre al 20 de octubre de 2026, 2.611 de ellos en octubre. Para pasar a la base maestra clasificada, adjunta **el Excel original de esa exportación** con el prompt de arriba. Claude comprobará que las filas coinciden con la referencia antes de reemplazarla. Las cifras pasarán a contar menciones únicas, y pueden ser algo menores si había duplicados.

## Si algo falla

- **Validar Pull Request en rojo:** pídele a Claude Code que revise el error y lo corrija en el mismo Pull Request.
- **La web no cambia:** comprueba en GitHub → *Actions* que *Deploy to GitHub Pages* terminó y recarga la página.
- **Primera vez:** en GitHub, en *Settings → Pages → Source*, debe estar elegido **GitHub Actions**.
