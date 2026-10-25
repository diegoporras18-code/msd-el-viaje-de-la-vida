# Guía de actualización — El Viaje de la Vida

Toda la escucha social sale de **una sola base maestra** acumulativa de SentiOne, guardada en el repositorio **privado** `msd-el-viaje-de-la-vida-datos`. Este repositorio público solo recibe los resultados agregados que ve el cliente.

Para actualizar, adjunta la nueva exportación a Claude Code. Claude conecta el repositorio privado y recupera la base. Luego incorpora la exportación sin duplicar, clasifica por contenido las menciones nuevas y guarda la base actualizada en el repositorio privado. Por último, abre un Pull Request en el repositorio público solo con los agregados y los hallazgos. Al fusionarlo, la web se actualiza sola en uno o dos minutos.

**Adjuntar Excel → Base privada actualizada → Pull Request público con agregados → Fusionar.**

## Desde el iPhone

1. Exporta desde SentiOne en **.xlsx**, con todas las columnas disponibles (ID, fecha y hora, fuente, URL, texto, sentimiento, país, interacciones y tipo). Configura la zona horaria en *America/Bogota*. No hace falta filtrar por país ni quitar registros repetidos.
2. Abre la app de Claude, entra en **Claude Code** y elige el repositorio `msd-el-viaje-de-la-vida`.
3. Adjunta el Excel con el botón **+** y pega este mensaje:

   > Procesa el Excel adjunto de SentiOne, incorpóralo a la base maestra sin duplicar registros, clasifica con Claude las menciones nuevas por sentimiento, temática, emoción y marcas, actualiza las cifras, los gráficos y los hallazgos sustentados, ejecuta las pruebas y crea un Pull Request para publicar la actualización.

4. Si la app pregunta si permites conectar `msd-el-viaje-de-la-vida-datos` a la sesión, acepta. Es el repositorio privado de la base maestra.
5. Claude responde con un resumen:
   - Filas exportadas y menciones únicas.
   - Menciones nuevas y ya existentes.
   - Cifras que cambian y por qué.
   - Casos marcados para revisión.
6. Revisa el Pull Request. Cuando la comprobación **Validar Pull Request** esté en verde, pulsa **Merge** en la app de GitHub o pídeselo a Claude.
7. En uno o dos minutos, la web pública muestra la nueva versión: https://diegoporras18-code.github.io/msd-el-viaje-de-la-vida/

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
- **Privacidad.** La base maestra y los informes internos solo están en el repositorio privado. Antes de cada guardado se comprueba en GitHub que sigue siendo privado; si no lo es, no se guarda nada. Ningún repositorio contiene el Excel, los textos, las URLs de publicaciones privadas ni los autores. La web solo recibe resultados agregados y evidencias públicas aprobadas.
- **Cifras explicadas.** Cada actualización genera un informe interno en el repositorio privado con las cifras que cambian y el motivo. El Pull Request resume esas cifras.

## Primera actualización real

La web muestra hoy una **referencia preliminar**: 2.837 registros del 21 de septiembre al 20 de octubre de 2026, 2.611 de ellos en octubre. Para pasar a la base maestra clasificada, adjunta **el Excel original de esa exportación** con el prompt de arriba. Claude comprobará que las filas coinciden con la referencia antes de reemplazarla. Las cifras pasarán a contar menciones únicas, y pueden ser algo menores si había duplicados.

## Si algo falla

- **Claude no puede abrir el repositorio privado:** en https://github.com/apps/claude/installations/select_target, en tu cuenta → **Configure** → **Repository access**, añade `msd-el-viaje-de-la-vida-datos` y pulsa **Save**.

- **Validar Pull Request en rojo:** pídele a Claude Code que revise el error y lo corrija en el mismo Pull Request.
- **La web no cambia:** comprueba en GitHub → *Actions* que *Deploy to GitHub Pages* terminó y recarga la página.
- **Primera vez:** en GitHub, en *Settings → Pages → Source*, debe estar elegido **GitHub Actions**.

## Mantenimiento opcional del repositorio privado

Claude Code no puede cambiar la configuración del repositorio ni borrar ramas. No afecta al funcionamiento, porque el proceso siempre usa `main`. Si quieres dejarlo ordenado:
1. En GitHub, abre `msd-el-viaje-de-la-vida-datos` y ve a **Settings → General → Default branch**. Pulsa el icono de flechas, elige **main** y confirma con **Update**.
2. En **Branches**, borra la rama vacía `prueba-acceso` con el icono de papelera.


## Procesamiento con Codex y exportación de 45 columnas

La actualización del 25 de octubre de 2026 mantiene los criterios semánticos v1 y las
revisiones manuales. Codex registra `fuente: 'codex'`; las clasificaciones anteriores
conservan su procedencia. No debe etiquetarse una decisión automática como manual.
Las menciones sin texto permanecen pendientes. Al sustituir una clasificación cuyo
texto cambió, se conserva la clasificación anterior en `c.prev`.

Para el formato de 45 columnas, importa exclusivamente `Mentions` con los mapeos
explícitos que faltan en la detección automática:

```bash
npm run sentione -- importar entradas/ARCHIVO.xlsx --hoja 1 \
  --columna fecha=Created --columna 'fuente=Domain group' \
  --desde AAAA-MM-DD --hasta AAAA-MM-DD
```

El rango declara días completos de la exportación; no recorta ni elimina registros.
Comprueba los metadatos antes de elegirlo. `Created` sin zona se interpreta como hora
de pared de Bogotá, pero el archivo por sí solo no certifica la zona del proyecto.
La exportación del 25 a las 06:19 permite una primera lectura hasta el 24; no asegura
que todas las publicaciones de esos días ya estén indexadas. El 25 queda privado.
La base anterior de septiembre se conserva aunque el nuevo archivo comience en octubre.

El capítulo 04 compara solo menciones A, con el promedio y la mediana de los días
cubiertos del 1–23, y ofrece el promedio del 17–23 como contraste. La coincidencia
temporal no atribuye menciones al evento ni constituye una prueba estadística de efecto.
Los días sin cobertura siguen siendo `null`. Mantén separados causa, campaña y captura
complementaria; los desgloses pequeños conservan el umbral 10 y la supresión complementaria.

`ENLACES EXTERNOS` es una lista para verificación, no una hoja importable. Si no se
pueden confirmar contenido, fecha, emisor y URL canónica, registra únicamente su
estado pendiente en el informe privado y no los sumes. Antes de incorporar un externo
verificado se necesita un origen explícito y una deduplicación compatible con los IDs
SentiOne: la promoción verificada de `complementarias` descrita a continuación conserva el origen sin inventar IDs SentiOne.
No cambies el origen de los registros SentiOne ni publiques enlaces de particulares.

Antes de guardar: contrasta todas las huellas históricas, verifica que cada clasificación
manual sigue idéntica y que las evidencias de cada síntesis anterior aún alcanzan 10.
Guarda la base privada antes de abrir el PR público; no lo fusiones automáticamente.

## Auditoría independiente de campaña y enlaces pendientes

Ver [CRITERIOS_CAMPANA.md](datos/CRITERIOS_CAMPANA.md). La segunda dimensión amplía
la base a v2 y los agregados a v4; A/B/C y las métricas temáticas se conservan. Los
registros sin evaluación de campaña no son negativos. La configuración confirmada
por el usuario y el informe de cobertura se conservan únicamente en el repositorio
privado.

La cola `maestra/complementarias.json` del repositorio privado mantiene las candidatas
entre tareas con localizadores de plataforma sin cuentas ni parámetros de rastreo.
`enlacePendiente` permite recuperar el enlace aportado para una revisión local. No
son referencias editoriales ni se incluyen en métricas mientras sigan pendientes.

Alternativa segura cuando una red no abre:

1. Solicitar el permalink original y una captura o metadatos que permitan comprobar
   fecha/hora/zona, contexto, vínculo con la iniciativa y tipo de emisor. El usuario
   puede ocultar rostros, cuentas de particulares y detalles personales irrelevantes.
2. Conservar el material únicamente en `entradas/`, revisar su coherencia y no inferir
   texto ni contenido visual fuera de lo efectivamente visible. Un login o un hashtag
   aislado no bastan. Si la fecha o la relación siguen ambiguas, conservar pendiente.
3. Resolver la URL canónica con ID de publicación. Los short links y share aliases
   no bastan para deduplicar. El índice privado de identidades se genera desde las
   URLs originales de SentiOne y guarda solo hashes y referencias internas.
4. Comparar esa identidad entre fuentes antes de incorporar. Si ya existe, conservar
   una sola mención, A/B/C y métricas primarias, añadiendo la procedencia complementaria.
   Si hay varias coincidencias o identidades sin resolver de la plataforma, detener la
   incorporación hasta resolverlas. No fusionar comentarios con su publicación matriz.
5. Preparar un archivo local verificado y ejecutar primero en seco:

```bash
npm run sentione -- complementarias estado
npm run sentione -- complementarias entradas/externa-verificada.json --seco
npm run sentione -- complementarias entradas/externa-verificada.json
```

El archivo local identifica `id` de la cola, `estado: 'verificada'`, `urlCanonica`,
`verificacion` con método (`acceso_directo`, `metadatos_publicos` o `captura_aportada`)
y comprobaciones explícitas de contenido, fecha y vínculo, más un `registro`
seudonimizado con su decisión `cp` completa. No marcar comprobaciones sin realizarlas.
La URL y los materiales de verificación no se serializan en la base. Para nuevos
registros temáticos usar los criterios v1 sin inventar clasificaciones; una campaña
confirmada sin clasificación temática queda pendiente en esa dimensión.

La incorporación no amplía automáticamente días completos, no suma interacciones
entre capturas, no atribuye alcance y no transforma métricas incomparables. Regenera
los agregados y verifica las supresiones tras cada promoción. El estado público de
las complementarias se calcula de la cola y se oculta si permite deducir categorías
pequeñas. No edites un contador fijo en textos editoriales.


Cierre autorizado del 25 de octubre: las referencias con `validacion_usuario` confirman pertenencia editorial; fecha, identidad y métricas se verifican aparte. Aplicar [criterios de campaña v2](datos/CRITERIOS_CAMPANA.md). No asignar fechas ni clasificación A por pertenencia.
