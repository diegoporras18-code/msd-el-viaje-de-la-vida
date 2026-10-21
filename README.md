# El Viaje de la Vida — MSD × Fonseca

Presentación web de storytelling, social listening e inteligencia competitiva sobre la campaña de concientización del cáncer de mama de MSD y la agencia Lotengo, alrededor del concierto de Fonseca en Bogotá del 24 de octubre de 2026.

React + Vite + Tailwind CSS + Motion para React. Es un sitio estático, sin backend ni servicios de pago, publicado en GitHub Pages.

## Capítulos

| # | Capítulo | Estado |
|---|---|---|
| 00 | Portada | Listo |
| 01 | Una realidad que no podemos ignorar (GLOBOCAN 2024) | Listo |
| 02 | Cuando la música abre una conversación que importa | Listo (campaña programada) |
| 03 | Social listening: dashboard de conversación | Línea base preliminar; filtros completos al importar el Excel original |
| 04 | ¿Una noche logró transformar la conversación? | Pendiente de medición (24 al 31 de octubre) |
| 05 | La conversación también construye posicionamiento | Pendiente de exportaciones de competidores |
| 06 | Conclusiones e insights | Preliminares; post-concierto y benchmark pendientes |

## Modos

- **Presentación** (`/`): narrativa animada a pantalla completa, con índice de capítulos.
- **Explorar datos** (`#/explorar`): acceso directo a los dashboards y sus filtros, con los mismos componentes.
- **Actualizar datos** (`#/importar`): importador de exportaciones XLSX y CSV de SentiOne en el navegador, con mapeo de columnas, deduplicación, vista previa, revisión manual y descarga de `dataset.json`.

## Desarrollo

```bash
npm ci
npm run dev       # servidor local, accesible también desde la red local
npm test          # pruebas de procesamiento: duplicados, cifras agregadas, privacidad
npm run build     # genera dist/
npm run importar -- entradas/archivo.xlsx --universo categoria   # importación por línea de comandos
```

## Estructura

- `src/content/`: todos los textos editables, uno por capítulo, y `evidencias.js`.
- `src/data/dataset.json`: datos publicados (agregados y registros anonimizados).
- `src/config/`: universos y laboratorios, diccionarios de clasificación y periodos.
- `src/lib/data/`: procesamiento puro, probado en Node (`tests/`): columnas, normalización, deduplicación, fusión y agregados.
- `src/components/` y `src/components/charts/`: componentes visuales reutilizables.
- `src/dashboards/`: dashboards compartidos por la presentación y el modo explorar.
- `src/sections/`: capítulos de la presentación. `src/views/`: modo explorar e importador.

## Actualización y publicación

Ver **[GUIA_ACTUALIZACION.md](GUIA_ACTUALIZACION.md)**. Cada cambio fusionado en `main` se publica automáticamente con `.github/workflows/deploy.yml`, que ejecuta las pruebas y el build. Los Pull Requests se validan con `.github/workflows/ci.yml`.

## Datos y privacidad

- Capítulo 01: **estimaciones de GLOBOCAN 2024** (IARC/OMS) para Colombia, ambos sexos. No son conteos observados de 2026.
- Social listening: todos los registros de la consulta de SentiOne, sin filtro geográfico. El nombre del proyecto «MSD» no implica que cada registro mencione a MSD.
- `dataset.json` no contiene textos, URLs ni autores. Los contenidos individuales solo se publican si se revisan y destacan expresamente.

## Accesibilidad

Respeta `prefers-reduced-motion`: sin conteos, trazos ni desplazamientos. Los gráficos tienen etiquetas visibles, leyendas, detalle al tocar (iPhone), navegación con teclado en las series temporales y tablas alternativas para lectores de pantalla.
