---
name: frontend-design
description: Diseño web premium con estética editorial, sistemas tipográficos, layouts responsive y experiencias visuales creativas. Úsala al crear o rediseñar landing pages, presentaciones web, sitios editoriales, portfolios, componentes de UI o cualquier interfaz que deba verse distintiva y de alta calidad (premium web design, editorial layout, typography, responsive, UI polish).
---

# Frontend Design — diseño web premium y editorial

Guía para producir interfaces que se sientan diseñadas a propósito, no generadas por plantilla. Aplica a HTML/CSS puro, React, Vue, Svelte, Astro o cualquier stack con CSS moderno.

## Flujo de trabajo

1. **Entender el contexto antes de diseñar.** Identifica audiencia, objetivo de la página, tono (institucional, cálido, técnico, lúdico) y restricciones (marca existente, stack, accesibilidad, rendimiento). Si el proyecto ya tiene tokens, componentes o guía de marca, úsalos en lugar de inventar.
2. **Elegir una dirección estética explícita.** Escribe en una frase el concepto visual (p. ej. "revista impresa de los 60 con mucho aire y fotografía a sangre"). Todas las decisiones posteriores deben servir a ese concepto.
3. **Definir el sistema antes de las páginas:** tokens de color, escala tipográfica, espaciado, radios, sombras y rejilla.
4. **Maquetar mobile-first**, luego ampliar a tablet y escritorio.
5. **Pulir:** estados (hover, focus, active, disabled, vacío, carga, error), microdetalles y accesibilidad.
6. **Verificar** en varios anchos (360, 768, 1024, 1440 px) y en modo claro/oscuro si aplica.

## Dirección estética

- Evita la estética genérica: degradados morados por defecto, tarjetas idénticas con sombra suave, iconos decorativos sin propósito, todo centrado.
- Busca **un rasgo memorable** por diseño: una tipografía display con carácter, un uso audaz del espacio negativo, una rejilla asimétrica, un color de acento inesperado, fotografía a sangre.
- **Contraste de escala:** combina titulares muy grandes con texto de lectura contenido. La jerarquía se construye con tamaño, peso y espacio, no solo con color.
- **Restricción:** 1 familia display + 1 de texto (máximo 2–3 en total); 1 color de acento dominante sobre una base neutra.

## Tipografía

- Usa una escala modular (ratio 1.2–1.333 para interfaces, 1.414–1.618 para editorial). Defínela como tokens (`--step--1` … `--step-6`).
- Tamaños fluidos con `clamp()`: `font-size: clamp(2.5rem, 1.5rem + 5vw, 6rem);`
- Texto de lectura: 16–20 px, `line-height` 1.5–1.7, medida de 60–75 caracteres (`max-width: 65ch`).
- Titulares: `line-height` 1.0–1.15, `letter-spacing` ligeramente negativo en tamaños grandes, `text-wrap: balance`. Párrafos: `text-wrap: pretty`.
- Recursos editoriales: capitulares, sumarios/entradillas, citas destacadas (pull quotes), versalitas (`font-variant-caps`), cifras tabulares en datos (`font-variant-numeric: tabular-nums`).
- Carga de fuentes: `font-display: swap`, precarga solo la fuente crítica, subconjuntos (subset) cuando sea posible. Prefiere fuentes variables y de licencia libre (Google Fonts, Fontsource) salvo que el proyecto ya tenga licencias.

## Color

- Define tokens semánticos (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-border`), no valores sueltos en componentes.
- Construye paletas en `oklch()` para pasos perceptualmente uniformes.
- Contraste mínimo WCAG AA: 4.5:1 en texto normal, 3:1 en texto grande y elementos de UI.
- Modo oscuro: no inviertas sin más; reduce saturación, evita negro puro (#000) de fondo y blanco puro de texto en bloques largos.

## Layout y rejilla

- Rejilla de 12 columnas en escritorio, 4–6 en móvil; usa CSS Grid con áreas nombradas para layouts editoriales y `subgrid` para alinear contenido anidado.
- Patrones editoriales útiles: columna de lectura + margen para notas, imagen a sangre que rompe la rejilla, composiciones asimétricas 7/5 u 8/4, secciones a pantalla completa alternadas con bloques de texto.
- Espaciado con escala consistente (4/8 px base) y espaciado fluido entre secciones (`clamp()`).
- Usa `container queries` para componentes que cambian según su contenedor, no según la ventana.

## Responsive

- Mobile-first con `min-width`. Breakpoints guiados por el contenido, no por dispositivos.
- Unidades `dvh`/`svh` para secciones a pantalla completa en móvil (evita saltos por la barra del navegador).
- Imágenes: `srcset`/`sizes` o `<picture>`, formatos AVIF/WebP, `aspect-ratio` para evitar saltos de layout, `loading="lazy"` fuera del primer viewport.
- Objetivos táctiles de al menos 44×44 px. Nada debe depender solo de hover.
- Sin scroll horizontal accidental: comprueba a 320–360 px.

## Accesibilidad (no negociable)

- HTML semántico: `header`, `nav`, `main`, `article`, `section` con encabezado, jerarquía de `h1`–`h6` sin saltos.
- Foco visible y personalizado (`:focus-visible`), orden de tabulación lógico, enlace "saltar al contenido".
- `alt` descriptivo en imágenes con significado; `alt=""` en decorativas.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.
- No transmitas información solo con color.

## Rendimiento

- Objetivos Core Web Vitals: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- CSS crítico primero; evita librerías pesadas para efectos que CSS resuelve.
- Reserva espacio para medios y fuentes para evitar CLS.

## Experiencias visuales creativas

- Texturas sutiles (grano, ruido SVG), máscaras y `clip-path`, `mix-blend-mode`, tipografía como imagen, scroll horizontal en secciones concretas.
- Úsalas con intención: cada efecto debe reforzar la narrativa, no decorar. Para animación y scrollytelling, combina con la skill `motion-graphics`; para gráficos de datos, con `data-visualization`.

## Lista de comprobación final

- [ ] La dirección estética se reconoce en todas las secciones.
- [ ] Escala tipográfica y de espaciado consistentes, definidas como tokens.
- [ ] Funciona sin errores de 320 px a 1920 px.
- [ ] Contraste AA, foco visible, semántica correcta, `prefers-reduced-motion` respetado.
- [ ] Imágenes optimizadas y sin saltos de layout.
- [ ] Todos los estados interactivos están diseñados.
