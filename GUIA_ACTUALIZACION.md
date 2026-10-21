# Guía de actualización — El Viaje de la Vida

Esta guía explica cómo mantener al día los datos y los textos de la presentación sin modificar componentes React.

- **Sitio público:** https://diegoporras18-code.github.io/msd-el-viaje-de-la-vida/
- **Importador:** https://diegoporras18-code.github.io/msd-el-viaje-de-la-vida/#/importar
- **Modo explorar datos:** https://diegoporras18-code.github.io/msd-el-viaje-de-la-vida/#/explorar

## Cómo funciona

| Qué | Dónde |
|---|---|
| Datos procesados (agregados y registros anonimizados) | `src/data/dataset.json` |
| Textos de cada capítulo | `src/content/*.js` |
| Evidencias verificadas (noticias, creadores, publicaciones) | `src/content/evidencias.js` |
| Laboratorios y universos de monitoreo | `src/config/universos.js` |
| Plataformas, narrativas, emociones, palabras clave y marcas | `src/config/clasificacion.js` |
| Fechas del concierto y de los periodos antes/durante/después | `src/config/periodos.js` |

GitHub Pages es un sitio estático: **ningún botón del sitio publica datos**. El importador procesa el Excel en el navegador, muestra una vista previa local (solo en ese navegador) y genera un `dataset.json`. La versión pública cambia únicamente cuando ese archivo se guarda en `main` mediante un Pull Request. Al fusionarlo, el workflow *Deploy to GitHub Pages* ejecuta las pruebas, construye el sitio y lo publica en 1–2 minutos.

### Reglas que aplica el procesamiento

- **Todos los registros cuentan**, tengan o no país. No hay filtros geográficos.
- **Deduplicación** por ID de SentiOne o, si no hay ID, por URL estable (sin `utm_`, `fbclid`, `www`, barra final…). Una exportación que repite días ya importados **no vuelve a sumar** esos registros: solo actualiza sus métricas (interacciones, alcance) y conserva las revisiones manuales.
- **Ventana de cobertura:** al importar se declara el periodo de la exportación. Dentro de ese periodo, un día sin registros vale cero; fuera de él, el día aparece como «sin datos», nunca como cero.
- **Sentimiento:** se conserva el original de SentiOne. Lo revisado a mano se marca como validado. Las reglas automáticas solo generan sugerencias y se muestran como «sugerido». Un mensaje educativo no se considera negativo por decir «cáncer», «diagnóstico» o «muerte».
- **Privacidad:** `dataset.json` nunca contiene textos, URLs, autores ni país por registro. Solo se publican hashes anónimos, fecha, hora, plataforma, sentimiento, clasificaciones, hashtags y términos de un vocabulario controlado. Los contenidos individuales solo se publican si se marcan como **destacados** con confirmación expresa.
- **Zona horaria:** las fechas se interpretan en hora de Bogotá. Configura SentiOne en *America/Bogota* antes de exportar. Si el archivo trae fechas con zona (`Z` o `+00:00`), se convierten automáticamente.
- **Formatos:** `.xlsx` y `.csv`. El formato antiguo `.xls` no es compatible: exporta de nuevo como `.xlsx`.

---

## 1. Cargar una nueva exportación de SentiOne

1. Exporta desde SentiOne en **XLSX**, con todas las columnas disponibles: ID, fecha, hora, fuente, URL, texto, sentimiento, país, interacciones, alcance y tipo. Anota la fecha de inicio y de fin de la consulta.
2. Abre el **importador** (`#/importar`) en Safari o en cualquier navegador.
3. **Paso 1:** elige el universo (categoría, MSD o un competidor) y selecciona el archivo. En iPhone se abre la app Archivos: el Excel puede estar en iCloud Drive, en Descargas o en un adjunto de correo guardado.
4. **Paso 2:** revisa el mapeo de columnas. Debajo de cada campo aparece un valor de ejemplo. Corrige con los menús lo que no coincida. Los campos con `*` son obligatorios: fecha y fuente.
5. Pulsa **Procesar y ver cambios**. Revisa el resumen: filas leídas, válidas, duplicados en el archivo, ya existentes (no se suman), nuevos, sin país (se conservan) y cambios por día.
6. Ajusta la **ventana de la exportación** si el archivo empieza o termina a mitad de un día, y pulsa **Recalcular**.
7. Pulsa **Aplicar a la vista previa local**. Comprueba el resultado en **Ver la vista previa en los dashboards**: aparece una franja «Vista previa local».
8. Puedes importar varios archivos seguidos (por ejemplo, categoría y competidores). Se acumulan en la misma vista previa.
9. *(Opcional)* **Revisión manual:** valida el sentimiento, las narrativas, la emoción, la intención preventiva, la relación con marcas y si es contenido espontáneo de un asistente. Marca como destacados solo los contenidos verificados.
10. Pulsa **Descargar dataset.json** y publícalo (ver la sección 7).

> Si se cierra la pestaña, la vista previa se conserva sin los textos: la revisión manual necesita volver a importar el Excel. Para continuar más tarde desde un JSON descargado, usa **Cargar un dataset.json**.

## 2. Actualizar datos de la categoría

Universo **Conversación de categoría**: es la consulta del proyecto SentiOne «MSD» con la conversación general sobre cáncer de mama.

- **Línea base actual:** agregados preliminares revisados del 21 de septiembre al 20 de octubre de 2026 (2.837 registros; 2.611 entre el 1 y el 20 de octubre). Se guardan en `universos.categoria.base` y se usan mientras no haya registros importados para esos días.
- **Reimportar el Excel original del 21 sep – 20 oct** sustituye la línea base por registros reales en esos días. Así se activan los filtros por plataforma, sentimiento y narrativa, las horas, los hashtags y la revisión. El importador contrasta automáticamente los totales diarios con la línea base y avisa si no coinciden.
- **Del 21 al 31 de octubre:** importa la exportación nueva con la ventana correcta. Si la exportación incluye días anteriores, no se duplican.

## 3. Actualizar MSD

Universo **MSD**: una exportación específica de menciones de MSD con los mismos criterios que la categoría. Se importa igual que en la sección 1, eligiendo *MSD*.

- La conversación de categoría también detecta las menciones explícitas de MSD (gráfico *Categoría, MSD y competencia*). El universo MSD hace falta para el benchmark y el Share of Voice.
- Para mejorar la detección (por ejemplo, nombres de programas), añade patrones a la entidad `msd` en `src/config/clasificacion.js`. Usa solo términos inequívocos.

## 4. Actualizar competidores

1. Exporta de SentiOne una consulta **independiente por laboratorio** (Daiichi Sankyo, AstraZeneca) con el **mismo periodo y criterios** que MSD.
2. Impórtala eligiendo el universo del laboratorio.
3. El **Share of Voice** aparece solo cuando todas las marcas elegidas tienen exportación y sus coberturas coinciden al menos 7 días. Ese mínimo se configura en `SOV.diasMinimos`, en `src/config/universos.js`. Cuenta menciones explícitas: una publicación que solo habla de la enfermedad no se atribuye a ninguna marca.

**Agregar otro laboratorio:**

1. En `src/config/universos.js`, añade a `UNIVERSOS` un objeto `{ id: 'novartis', nombre: 'Novartis', corto: 'Novartis', tipo: 'marca', color: '#6FD3C1', descripcion: '…' }`.
2. En `src/config/clasificacion.js`, añade a `ENTIDADES` el objeto `{ id: 'novartis', nombre: 'Novartis', marca: true, patrones: ['novartis'] }`. El `id` debe ser igual en los dos archivos.
3. En `src/data/dataset.json`, añade `"novartis": { "cobertura": [], "importaciones": [], "registros": [] }` dentro de `universos`. Si lo olvidas, el importador lo crea al importar.

Las referencias públicas de campañas (Innpacto Rosa, La M que Falta, In Seno al Futuro) están en `src/content/benchmark.js`, en `referencias`. Son información de investigación: **no** se convierten en métricas. Para marcar una como verificada, completa `pais`, `marcas` y `fuente`, y cambia `estado` a `'verificado'`.

## 5. Incorporar noticias verificadas

Edita `src/content/evidencias.js` y añade un objeto por evidencia:

```js
{
  id: 'medio-2026-10-25-ejemplo',
  tipo: 'medio',            // 'medio' | 'publicacion' | 'creador'
  fecha: '2026-10-25',
  titulo: 'Titular de la nota',
  fuente: 'Nombre del medio',
  plataforma: 'web',        // web, instagram, tiktok, x, facebook, video
  url: 'https://…',
  marcas: ['msd'],          // marcas mencionadas explícitamente
  verificado: true,         // obligatorio
}
```

Aparecen en *Evidencias*, *Medios que amplificaron la acción* y *Creadores* (capítulo 04), y en los destacados del benchmark según `marcas`. No publiques nombres de particulares: para cuentas personales deja `fuente` vacío y describe el contenido.

## 6. Actualizar conclusiones

Edita `src/content/conclusiones.js`:

- `preliminares.items`: hallazgos con `cifra`, `unidad`, `titulo` y `texto`. Si cambias una cifra de la línea base, la prueba *«las conclusiones preliminares coinciden con la línea base»* lo detecta: actualiza el texto o la prueba en `tests/procesamiento.test.mjs`.
- `postConcierto` y `benchmark`: hoy están pendientes. Cuando haya datos, sustituye el estado por hallazgos con la misma estructura que `preliminares`.
- `recomendaciones.items`: aprendizajes y recomendaciones.

Los demás textos editoriales están en `src/content/campana.js`, `conversacion.js`, `impacto.js` y `benchmark.js`. Después del concierto, actualiza en `campana.js` el `estado` y los textos que hoy están en futuro, **solo con hechos verificados**.

## 7. Publicar los cambios desde Claude Code en iPhone

### Opción A — Claude Code (recomendada)

1. Abre la app de Claude en el iPhone, entra en **Claude Code** y elige el repositorio `msd-el-viaje-de-la-vida`.
2. Adjunta el archivo con el botón **+**:
   - el **`dataset.json`** descargado del importador, o
   - directamente el **Excel de SentiOne**.
3. Escribe una instrucción como:
   - Con el JSON: *«Reemplaza src/data/dataset.json con el archivo adjunto, ejecuta npm test y npm run build, y abre un Pull Request.»*
   - Con el Excel: *«Guarda el Excel adjunto en entradas/ (no lo subas al repositorio) y ejecuta `npm run importar -- entradas/ARCHIVO.xlsx --universo categoria --desde 2026-10-21 --hasta 2026-10-31`. Luego ejecuta npm test y npm run build, y abre un Pull Request solo con src/data/dataset.json.»*
4. Revisa el Pull Request: el workflow **Validar Pull Request** ejecuta las pruebas y el build.
5. Fusiona el PR en la app de GitHub o desde Claude Code. **Deploy to GitHub Pages** publica la nueva versión automáticamente.

El script `npm run importar` aplica la misma lógica que el importador web. Con `--seco` muestra el resumen sin escribir nada. La carpeta `entradas/` y los archivos `.xlsx` y `.csv` están en `.gitignore`, así que el Excel original no se sube.

### Opción B — GitHub en Safari

1. Abre `github.com/diegoporras18-code/msd-el-viaje-de-la-vida/tree/main/src/data` en Safari. Si no ves las opciones de edición, usa **aA → Solicitar sitio web de escritorio**.
2. Pulsa **Add file → Upload files** y sube el `dataset.json` descargado. Conserva el nombre exacto.
3. Elige **Create a new branch for this commit and start a pull request** y confirma.
4. Espera a que **Validar Pull Request** esté en verde y pulsa **Merge pull request**.

Nunca hace falta ni se debe poner un token de GitHub en el sitio web.

### Si algo falla

- **Validar Pull Request en rojo:** abre el detalle. Las pruebas indican si el JSON tiene un campo no publicable, un registro duplicado o una cifra inconsistente. Pídele a Claude Code que lo revise.
- **La web pública no cambia:** comprueba en *Actions* que *Deploy to GitHub Pages* terminó y recarga la página. Safari puede tardar en refrescar la caché.
- **Primera vez:** en *Settings → Pages → Build and deployment → Source*, debe estar elegido **GitHub Actions**.
