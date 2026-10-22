# El Viaje de la Vida — MSD × Fonseca

Micrositio de storytelling y escucha social sobre la campaña de concientización del cáncer de mama de MSD y la agencia Lotengo, alrededor del concierto de Fonseca en Bogotá del 24 de octubre de 2026. Está hecho con React, Vite, Tailwind y Motion para React. Es estático y se publica en GitHub Pages al fusionar en `main`.

## Público y alcance

- El sitio es **solo para el cliente** (MSD, Lotengo y quienes consulten los resultados). Solo muestra **Presentación** y **Explorar resultados**.
- **Nunca** agregues al sitio importadores, carga de archivos, descargas de JSON, configuración de columnas, validación de sentimientos, contraseñas en JavaScript ni referencias técnicas como GitHub, scripts, archivos o Pull Requests.
- La administración se hace solo con Claude Code y los scripts de `scripts/`.

## Datos

- **Dos repositorios:**
  - Este repositorio es **público**: presentación, código, skills, criterios, referencia agregada y resultados agregados.
  - La **base maestra** y los **informes de actualización** viven solo en el repositorio **privado** `diegoporras18-code/msd-el-viaje-de-la-vida-datos` (`maestra/base-maestra.json`, `informes/`). Se conecta a la sesión con `add_repo` (acceso `push`) y se clona junto a este, en `../msd-el-viaje-de-la-vida-datos`, siempre en la rama `main`.
  - La base maestra tiene una línea por mención única, seudonimizada y sin textos, URLs, autores ni país.
- **Nunca** copies la base maestra, los informes ni registros individuales a este repositorio. Nunca cambies la visibilidad del repositorio privado. `npm run sentione -- guardar` verifica que es privado antes de cada push.
- **Resultados públicos:** `src/data/resultados.json`. Solo proyecciones agregadas predefinidas: totales, serie diaria (menciones, clasificadas y relevantes) y, por periodo base sin solapes (`PERIODOS_BASE` en `src/config/periodos.js`), distribuciones de **una sola dimensión** para las menciones relevantes y para el resto. Ninguna celda fuera de la serie diaria baja de 10 (`UMBRAL`): las categorías pequeñas se agrupan con supresión complementaria o se publican como muestra insuficiente. Hashtags solo de menciones relevantes con 10 usos o más. **Nunca** publiques cubos detallados ni cruces de dimensiones: viven solo en la base privada. Se generan con `npm run sentione -- publicar`; las pruebas de granularidad deben pasar.
- **Referencia de validación:** `datos/maestra/referencia.json`, con los agregados revisados del 21 de septiembre al 20 de octubre de 2026 (2.837 registros; 2.611 en octubre).
- **Exportaciones originales:** solo en `entradas/`, que está en `.gitignore`. Nunca se suben.
- Sin filtros geográficos: se usan todos los registros. Que el proyecto de SentiOne se llame «MSD» no significa que cada registro mencione a MSD.
- Si la consulta no captura bien a una marca, es una limitación de cobertura, no una ausencia de conversación. El Share of Voice solo se calcula con `cobertura: 'equivalente'` en `src/config/marcas.js`.

## Actualizar con una nueva exportación de SentiOne

Usa la skill **`actualizar-sentione`** (`.claude/skills/actualizar-sentione/SKILL.md`). Los criterios de clasificación están en `datos/CRITERIOS_CLASIFICACION.md`. Clasifica con Claude solo las menciones nuevas o modificadas, y nunca inventes clasificaciones sin el texto original.

- **Relevancia A/B/C:** A `si` (el contenido principal trata cáncer de mama) es la única medida principal de la presentación; B `dudosa` (contextual) y C `no` (ruido) se conservan en la base y solo aparecen como contexto en «Explorar resultados». Evalúa lo que expresa cada mención, no el texto de la publicación original.
- **Revisiones focalizadas:** `npm run sentione -- revisar entradas/auditoria/revision.json` aplica cambios por huella con un código de motivo, conserva la clasificación anterior (`c.prev`) y nunca borra registros. La evidencia parafraseada va solo al informe privado (`informes/auditoria-*.md`).
- **Laboratorios:** se detectan por nombre corporativo (`src/config/marcas.js`, con `excluir` para homónimos), nunca por un medicamento. Por debajo de 10 menciones solo se publica «menos de 10»; los ejemplos por laboratorio se sustituyen por referencias públicas verificadas con fuente.
- **Patrones de conversación (tarjetas de sentimiento):** síntesis anónimas en tercera persona en `src/content/antes.js`, nunca citas ni testimonios en primera persona. El patrón (`src/config/patrones.js`) debe reunir al menos 10 menciones y, además, cada afirmación concreta de la síntesis debe estar respaldada por al menos 10 menciones verificadas en el informe privado.

## Contenido editorial

- Los textos están en `src/content/`.
- Las frases con cifras de los hallazgos se calculan en `src/lib/data/hechos.js`.
- Las interpretaciones de `src/content/conclusiones.js` con `estado: 'aprobada'` no se reescriben sin revisión.

## Comprobaciones

`npm test` (procesamiento, privacidad y cifras) y `npm run build` deben pasar antes de cualquier Pull Request.
