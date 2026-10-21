# El Viaje de la Vida — MSD × Fonseca

Presentación web interactiva de la campaña de concientización sobre cáncer de mama de MSD y Lotengo para el concierto del 24 de octubre de 2026 en Bogotá.

React + Vite + Tailwind CSS + Motion para React. Sitio estático, sin backend.

## Desarrollo

```bash
npm install
npm run dev      # servidor local (también accesible desde la red local)
npm run build    # genera dist/
npm run preview  # sirve el build
```

## Estructura

- `src/content/` — **todo el texto y las cifras editables** (`portada.js`, `realidad.js`).
- `src/sections/` — secciones de la presentación (Portada, Una realidad que no podemos ignorar).
- `src/components/` — componentes reutilizables: `LineReveal`, `Waveform`, `ScrollCue`, `CountUp`, `StatFigure`, `BarrierRoute`.
- `src/lib/motion.js` — curvas y duraciones compartidas.

## Datos

Las cifras de la sección 2 son **estimaciones de GLOBOCAN 2022** (Global Cancer Observatory, IARC/OMS) para Colombia, no conteos observados de 2026. La fuente se muestra en la página.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy.yml` publica `dist/` en cada push a `main`. Hay que activarlo una vez: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Accesibilidad

Respeta `prefers-reduced-motion` (la ruta de barreras se muestra completa y estática, las cifras aparecen sin conteo y la onda se detiene). La onda tiene un botón para pausarla.
