---
name: data-visualization
description: Dashboards interactivos, gráficos estadísticos y storytelling con datos siguiendo buenas prácticas de visualización. Úsala al elegir el tipo de gráfico adecuado, construir dashboards o paneles de KPIs, diseñar gráficos en la web (Recharts, D3, Observable Plot, Chart.js, Vega-Lite, ECharts) o en Python (matplotlib, seaborn, plotly), y al narrar hallazgos con datos (charts, dashboards, data storytelling, statistical graphics).
---

# Data Visualization — gráficos, dashboards y storytelling con datos

Guía para convertir datos en visualizaciones claras, honestas y memorables. Independiente de la librería: los principios valen para cualquier herramienta. Prefiere librerías gratuitas y de código abierto.

## Flujo de trabajo

1. **Formula la pregunta.** ¿Qué debe entender o decidir quien mira? Escribe el mensaje principal en una frase ("Las hospitalizaciones bajaron un 30 % tras 2020").
2. **Conoce los datos.** Tipos de variables (categórica, ordinal, continua, temporal), rangos, valores atípicos, nulos, unidades y fuente. Valida totales antes de graficar.
3. **Elige la forma** según la relación que quieres mostrar (tabla abajo).
4. **Diseña:** jerarquía, color, anotaciones, títulos que dicen la conclusión.
5. **Verifica:** precisión de los números, legibilidad en móvil, accesibilidad, modo oscuro si aplica.

## Elegir el gráfico

| Relación | Recomendado | Evitar |
|---|---|---|
| Comparación entre categorías | Barras horizontales ordenadas, dot plot | Tartas con más de 3–4 porciones, 3D |
| Evolución temporal | Línea, área (una serie), barras para periodos discretos | Demasiadas líneas (>5) sin resaltar una |
| Parte de un todo | Barra apilada al 100 %, waffle, tarta solo con 2–3 partes | Donuts anidados |
| Distribución | Histograma, boxplot, violín, beeswarm, densidad | Media sola sin dispersión |
| Correlación | Dispersión (scatter), con línea de tendencia si procede | Doble eje Y que sugiere correlación falsa |
| Ranking / cambio entre dos momentos | Slope chart, dumbbell, bump chart | — |
| Geografía | Coropletas normalizadas (tasas, no totales), mapas de símbolos | Coropletas con valores absolutos |
| Flujo / proceso | Sankey, diagrama de flujo, timeline | — |
| Un dato clave | Número grande (KPI) con contexto y comparación | Gauges decorativos |

Si una tabla bien formateada comunica mejor, usa una tabla.

## Principios de diseño

- **Maximiza la relación dato/tinta:** elimina bordes, fondos, rejillas pesadas y efectos 3D. Rejillas suaves y solo las necesarias.
- **Ejes honestos:** las barras empiezan en cero. Las líneas pueden no empezar en cero si se indica claramente. No trunques para exagerar.
- **Ordena con intención:** por valor (de mayor a menor) salvo que exista un orden natural (tiempo, ordinal).
- **Etiquetado directo** en lugar de leyendas cuando sea posible; elimina la leyenda si hay una sola serie.
- **Títulos que concluyen:** "El gasto se duplicó en cinco años" en lugar de "Gasto por año". Subtítulo con unidades, periodo y alcance.
- **Anota** los eventos y valores clave directamente sobre el gráfico.
- **Fuente y notas** siempre al pie (origen, fecha de corte, metodología si hay transformaciones).
- **Formato numérico:** separadores de miles según el idioma (`Intl.NumberFormat`), decimales consistentes, unidades abreviadas (k, M) y cifras tabulares.

## Color

- **Categórico:** máximo 6–8 colores distinguibles; mejor resaltar 1–2 series en color de acento y dejar el resto en gris.
- **Secuencial:** un solo tono de claro a oscuro para magnitudes (p. ej. viridis, blues).
- **Divergente:** dos tonos con punto medio neutro solo cuando existe un centro significativo (cero, media, objetivo).
- Usa paletas aptas para daltonismo y no codifiques información solo con color: añade etiquetas, formas o patrones.
- Contraste suficiente de las marcas contra el fondo (≥ 3:1) y del texto (≥ 4.5:1). Revisa la paleta en modo claro y oscuro.
- Mantén el mismo color para la misma categoría en todos los gráficos del proyecto.

## Dashboards interactivos

- **Jerarquía en "F" o "Z":** KPIs principales arriba a la izquierda, tendencias en el centro, detalle abajo.
- **5–9 elementos por vista** como máximo; si hay más, divide en pestañas o páginas.
- **Tarjetas KPI:** valor, variación frente a un periodo de referencia (con signo y color semántico), sparkline opcional y periodo explícito.
- **Filtros** globales en una barra visible, con estado actual claro y opción de restablecer. Los filtros afectan a todos los gráficos de forma coherente.
- **Interacción:** tooltips con valores exactos, resaltado al pasar el cursor (y equivalente táctil), zoom/brush en series temporales largas, drill-down de lo general a lo particular.
- **Estados:** carga (skeletons), vacío ("no hay datos para este filtro"), error y datos parciales.
- **Responsive:** en móvil, apila en una columna, reduce marcas y etiquetas, convierte barras verticales en horizontales y simplifica tooltips.
- **Rendimiento:** agrega en el servidor o en un paso previo; con más de ~5 000 puntos considera canvas/WebGL en lugar de SVG, o muestreo.

## Storytelling con datos

1. **Contexto:** ¿por qué importa? Sitúa al lector.
2. **Tensión:** presenta el hallazgo o el cambio inesperado.
3. **Resolución:** qué significa y qué hacer con ello.

Técnicas:

- **Martini glass:** recorrido guiado con pocos pasos y, al final, exploración libre.
- **Revelado progresivo:** muestra primero el marco, luego los datos, luego el resaltado y la anotación.
- **Escala humana:** traduce cifras abstractas a comparaciones comprensibles ("1 de cada 4 personas").
- **Un mensaje por gráfico.** Si hay dos mensajes, haz dos gráficos.
- Para animación de transiciones y scrollytelling, combina con la skill `motion-graphics`; para el diseño de la página que los contiene, con `frontend-design`.

## Rigor estadístico

- Indica el tamaño de muestra y la incertidumbre (intervalos de confianza, barras de error, bandas) cuando los datos son muestrales o estimaciones.
- Normaliza cuando compares poblaciones de distinto tamaño (tasas por 100 000, porcentajes).
- Distingue correlación de causalidad en el texto que acompaña.
- Cuidado con la paradoja de Simpson, los promedios que ocultan distribuciones bimodales y los cambios de escala entre gráficos que se comparan.
- Nunca inventes ni "suavices" datos para que el gráfico quede mejor. Si los datos son ilustrativos o simulados, indícalo de forma visible.

## Accesibilidad

- Cada gráfico tiene un título y una descripción textual del hallazgo principal (`aria-label`, `<figcaption>` o `role="img"` con `aria-describedby`).
- Ofrece la tabla de datos subyacente o una descarga (CSV) como alternativa.
- Navegación por teclado en elementos interactivos y foco visible.
- Tamaño mínimo de texto en gráficos: 12 px.

## Lista de comprobación final

- [ ] El tipo de gráfico corresponde a la relación que se quiere mostrar.
- [ ] El título comunica la conclusión; unidades, periodo y fuente están visibles.
- [ ] Ejes honestos, orden intencional, sin 3D ni adornos innecesarios.
- [ ] Paleta accesible y coherente entre gráficos.
- [ ] Los números se han verificado contra la fuente.
- [ ] Funciona en móvil y con teclado; existe alternativa textual o tabular.
