# El Viaje de la Vida — MSD × Fonseca

Micrositio de storytelling y escucha social sobre la campaña de concientización del cáncer de mama de MSD y la agencia Lotengo, alrededor del concierto de Fonseca en Bogotá del 24 de octubre de 2026. Está hecho con React, Vite, Tailwind y Motion para React. Es estático y se publica en GitHub Pages al fusionar en `main`.

## Público y alcance

- El sitio es **solo para el cliente** (MSD, Lotengo y quienes consulten los resultados). Solo muestra **Presentación** y **Explorar resultados**.
- **Nunca** agregues al sitio importadores, carga de archivos, descargas de JSON, configuración de columnas, validación de sentimientos, contraseñas en JavaScript ni referencias técnicas como GitHub, scripts, archivos o Pull Requests.
- La administración se hace solo con Claude Code y los scripts de `scripts/`.

## Datos

- **Dos repositorios:**
  - Este repositorio es **público**: presentación, código, skills, criterios, referencia agregada y resultados agregados.
  - La **base maestra** y los **informes de actualización** viven solo en el repositorio **privado** `diegoporras18-code/msd-el-viaje-de-la-vida-datos` (`maestra/base-maestra.json`, `informes/`). Se clona junto a este, en `../msd-el-viaje-de-la-vida-datos`, conectándolo a la sesión con `add_repo` (acceso `push`).
  - La base maestra tiene una línea por mención única, seudonimizada y sin textos, URLs, autores ni país.
- **Nunca** copies la base maestra, los informes ni registros individuales a este repositorio. Nunca cambies la visibilidad del repositorio privado. `npm run sentione -- guardar` verifica que es privado antes de cada push.
- **Resultados públicos:** `src/data/resultados.json`. Solo agregados (cubo de conteos) y hashtags con al menos 2 usos. Se generan con `npm run sentione -- publicar`.
- **Referencia de validación:** `datos/maestra/referencia.json`, con los agregados revisados del 21 de septiembre al 20 de octubre de 2026 (2.837 registros; 2.611 en octubre).
- **Exportaciones originales:** solo en `entradas/`, que está en `.gitignore`. Nunca se suben.
- Sin filtros geográficos: se usan todos los registros. Que el proyecto de SentiOne se llame «MSD» no significa que cada registro mencione a MSD.
- Si la consulta no captura bien a una marca, es una limitación de cobertura, no una ausencia de conversación. El Share of Voice solo se calcula con `cobertura: 'equivalente'` en `src/config/marcas.js`.

## Actualizar con una nueva exportación de SentiOne

Usa la skill **`actualizar-sentione`** (`.claude/skills/actualizar-sentione/SKILL.md`). Los criterios de clasificación están en `datos/CRITERIOS_CLASIFICACION.md`. Clasifica con Claude solo las menciones nuevas o modificadas, y nunca inventes clasificaciones sin el texto original.

## Contenido editorial

- Los textos están en `src/content/`.
- Las frases con cifras de los hallazgos se calculan en `src/lib/data/hechos.js`.
- Las interpretaciones de `src/content/conclusiones.js` con `estado: 'aprobada'` no se reescriben sin revisión.

## Comprobaciones

`npm test` (procesamiento, privacidad y cifras) y `npm run build` deben pasar antes de cualquier Pull Request.
