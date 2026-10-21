---
name: actualizar-sentione
description: Procesa una nueva exportación de SentiOne (Excel o CSV adjunto) para El Viaje de la Vida. La incorpora a la base maestra sin duplicar, clasifica con Claude por contenido las menciones nuevas o modificadas, regenera los resultados públicos y los hallazgos sustentados, valida las cifras y abre un Pull Request. Úsala cuando el usuario adjunte o mencione una exportación de SentiOne o pida actualizar los resultados.
---

# Actualizar la escucha social desde SentiOne

Procedimiento completo y reproducible. El usuario no tiene que repetir las reglas: están aquí, en `CLAUDE.md` y en `datos/CRITERIOS_CLASIFICACION.md`.

## Reglas que no se negocian

- **Una sola base maestra** (`datos/maestra/base-maestra.json`). Cada mención aparece una sola vez, aunque tenga varias temáticas o marcas.
- **Sin filtros geográficos.** Se usan todos los registros, con o sin país.
- **Privacidad.** Nunca subas al repositorio el Excel, los textos, las URLs de publicaciones privadas, los autores ni los lotes (`entradas/` está en `.gitignore`). No copies textos de publicaciones en commits, en Pull Requests ni en el chat.
- **Sin clasificaciones inventadas.** Solo cuenta como «clasificado por contenido» lo que clasificaste leyendo el texto. Sin el Excel original no hay textos: no clasifiques nada y pide el archivo.
- **Cifras.** No cambies cifras publicadas sin explicar la diferencia. El informe de `publicar` lo hace; resúmelo en el Pull Request.
- **Cobertura de marcas.** Si la consulta no captura bien a un competidor, es una limitación de cobertura, no una ausencia de conversación. No cambies `cobertura` a `'equivalente'` en `src/config/marcas.js` sin que el usuario confirme el diseño de la consulta.

## Pasos

1. **Preparar.** Parte de la última versión de `main` en tu rama de trabajo. Ejecuta `npm ci` si no están instaladas las dependencias. Copia el archivo adjunto a `entradas/`, por ejemplo `entradas/sentione-2026-10-31.xlsx`.

2. **Importar.**
   ```bash
   npm run sentione -- importar entradas/ARCHIVO.xlsx
   ```
   - Revisa el mapeo de columnas que imprime. Si una columna está mal asignada, repite el comando con `--columna campo=Encabezado`.
   - Si la exportación empieza o termina a mitad de un día, indica la ventana real con `--desde AAAA-MM-DD --hasta AAAA-MM-DD`.
   - La primera importación de la exportación del 21 de septiembre al 20 de octubre debe coincidir con la referencia: 2.837 filas en total y 2.611 en octubre. Si no coincide, explícalo antes de seguir.
   - Diferencia siempre las filas brutas de SentiOne de las menciones únicas tras deduplicar.

3. **Clasificar con Claude.** Por cada `entradas/lotes/lote-NNN.json`:
   - Lee los `items`.
   - Clasifica cada uno siguiendo `datos/CRITERIOS_CLASIFICACION.md`.
   - Escribe `entradas/lotes/lote-NNN.resultado.json` con un resultado por `clave`.

   Los lotes solo contienen menciones nuevas, editadas o pendientes, y los textos idénticos ya vienen agrupados: no reclasifiques lo que ya está clasificado. Marca `revisar: true` y baja `conf` en los casos ambiguos.

4. **Aplicar.**
   ```bash
   npm run sentione -- aplicar
   ```
   Si rechaza resultados, corrige los valores en el archivo de resultado y vuelve a ejecutar. Repite hasta que no queden textos sin resultado, salvo los que no tengan texto en esta exportación.

5. **Publicar los resultados.**
   ```bash
   npm run sentione -- publicar
   ```
   Genera `src/data/resultados.json`, que solo contiene agregados, y `datos/informes/actualizacion-AAAA-MM-DD.md`.

6. **Actualizar los hallazgos.**
   - Las frases con cifras se calculan solas (`src/lib/data/hechos.js`).
   - Revisa `src/content/conclusiones.js`:
     - Ajusta los hallazgos con `estado: 'preliminar'` si los datos cambiaron.
     - No reescribas los `'aprobada'`. Si los datos los contradicen, señálalo en el Pull Request.
     - Añade hallazgos nuevos solo si se basan en un hecho medido, con su interpretación, una hipótesis claramente marcada y una recomendación concreta.
   - Si un titular de `src/content/antes.js` deja de ser cierto, ajústalo.
   - No atribuyas a la campaña cambios anteriores al 24 de octubre ni afirmes causalidad por coincidencia temporal.
   - Si aparecen temáticas emergentes (`entradas/lotes/emergentes.json`), propónlas en el Pull Request. No modifiques la taxonomía sin aprobación.

7. **Evidencias.** Solo agrega a `src/content/evidencias.js` noticias, publicaciones o creadores con URL pública verificada. No agregues cuentas de particulares.

8. **Verificar.**
   ```bash
   npm test && npm run build && npm run sentione -- verificar
   git status --short
   ```
   Confirma que no aparecen `entradas/` ni archivos `.xlsx` o `.csv`.

9. **Pull Request.**
   - Haz commit de `datos/maestra/base-maestra.json`, `src/data/resultados.json`, `datos/informes/…` y los cambios de contenido.
   - Abre un Pull Request contra `main` con:
     - El resumen del informe: filas brutas, únicas, nuevas, existentes y actualizadas.
     - La cobertura de la clasificación y los casos para revisión.
     - Las cifras que cambian y por qué.
     - Las limitaciones.
   - No lo fusiones: la publicación ocurre cuando el usuario lo fusiona en `main`.

## Revisión manual de casos dudosos

Si el usuario revisa o corrige casos, escribe sus decisiones en un resultado con `"fuente": "manual"` (mismo formato que los de Claude) y ejecuta `aplicar`. Las revisiones manuales quedan protegidas: ninguna clasificación automática posterior las sobrescribe. Para mostrarle los casos marcados, necesitas el Excel de esa exportación, porque los textos no se guardan en el repositorio.
