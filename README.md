# El Viaje de la Vida — MSD × Fonseca

Presentación web de storytelling y escucha social sobre la campaña de concientización del cáncer de mama de MSD y la agencia Lotengo, alrededor del concierto de Fonseca en Bogotá del 24 de octubre de 2026.

React + Vite + Tailwind CSS + Motion para React. Sitio estático en GitHub Pages: sin backend ni servicios de pago.

## Experiencia pública

- **Presentación:** escenas breves, una por hallazgo.
  - 00 Portada.
  - 01 Contexto y recorrido de atención.
  - 02 La campaña.
  - 03 Antes del concierto, en dos escenas.
  - 04 Impacto del concierto.
  - 05 Benchmark.
  - 06 Conclusiones.
- **Explorar resultados** (`#/explorar`): análisis profundo con filtros por fecha, plataforma, sentimiento, temática, marca y relevancia.

## Datos

| Archivo | Contenido | Público en la web |
|---|---|---|
| Repositorio privado `msd-el-viaje-de-la-vida-datos` | Base maestra (una línea por mención única, seudonimizada, con su clasificación, histórico y revisiones) e informes internos. Sin textos, URLs ni autores. | No |
| `datos/maestra/referencia.json` | Agregados revisados del 21 sep al 20 oct de 2026, usados para validar. | Solo como agregados |
| `datos/CRITERIOS_CLASIFICACION.md` | Criterios de la clasificación semántica con Claude. | No |
| `src/data/resultados.json` | Resultados agregados que consume la web. | Sí |
| `entradas/` | Exportaciones originales y lotes de trabajo (en `.gitignore`). | Nunca |

## Actualización

Ver [GUIA_ACTUALIZACION.md](GUIA_ACTUALIZACION.md): adjuntar el Excel a Claude Code, que sigue la skill `.claude/skills/actualizar-sentione/`.

```bash
npm ci
npm run dev
npm test                          # procesamiento, privacidad y cifras
npm run build
npm run sentione -- estado        # importar | aplicar | publicar | verificar
```

Cada fusión en `main` se publica con `.github/workflows/deploy.yml`, que ejecuta las pruebas y el build. Los Pull Requests se validan con `.github/workflows/ci.yml`.

## Accesibilidad

Respeta `prefers-reduced-motion`. Las animaciones se sustituyen por el estado final. Los gráficos tienen etiquetas visibles, leyendas, detalle al tocar y alternativas textuales.
