# Criterios de clasificación semántica · versión v1

Claude aplica estos criterios a cada mención nueva o modificada de la base maestra durante una actualización en Claude Code. La versión debe coincidir con `CRITERIOS_VERSION` en `src/config/clasificacion.js`. Si cambias un criterio, sube la versión.

## Entrada y salida

Cada lote `entradas/lotes/lote-NNN.json` contiene `items` con: `clave`, `fecha`, `plataforma`, `sentimientoSentiOne` (solo referencia), `menciones` (detectadas por texto), `hashtags` y `texto`.

Escribe `entradas/lotes/lote-NNN.resultado.json` con un resultado por `clave`, sin omitir ninguno:

```json
{
  "lote": "lote-001",
  "fuente": "claude",
  "resultados": [
    {
      "clave": "…",
      "rel": "si",
      "s": "neutral",
      "sm": "no_aplica",
      "ss": "negativo",
      "temas": ["barreras_atencion", "acceso_sistema_salud"],
      "e": "indignacion",
      "i": ["solicitar_atencion"],
      "marcas": [],
      "conf": 0.85,
      "revisar": false,
      "emergente": null
    }
  ]
}
```

No copies texto de las publicaciones en el resultado. `emergente` es una etiqueta breve y genérica, como `"vacunación VPH"`, solo cuando aparece una temática nueva que no encaja en la lista. Nunca uses un nombre de persona.

## Campos

| Campo | Valores |
|---|---|
| `rel` | `si` (habla realmente de cáncer de mama) · `dudosa` · `no` (coincidencia ajena: otro «cáncer», horóscopo, uso figurado, spam) |
| `s` | Sentimiento general: `positivo` · `negativo` · `neutral` · `mixto` · `indeterminado` |
| `sm` | Sentimiento hacia MSD o hacia El Viaje de la Vida: `positivo` · `negativo` · `neutral` · `mixto` · `no_aplica` (si no los menciona) |
| `ss` | Sentimiento hacia el sistema de salud (EPS, citas, hospitales): mismos valores; `no_aplica` si no lo menciona |
| `temas` | Uno o varios: `educacion`, `concientizacion`, `prevencion`, `mamografias`, `diagnostico_temprano`, `tratamiento`, `barreras_atencion`, `acceso_sistema_salud`, `innovacion_medica`, `historias_pacientes`, `apoyo_emocional`, `campanas`, `noticias`, `otros`. Si `rel` es `no`, deja la lista vacía. |
| `e` | `esperanza`, `miedo`, `tristeza`, `indignacion`, `solidaridad`, `gratitud`, `alegria`, `no_identificable` |
| `i` | Uno o varios: `buscar_informacion`, `consultar_medico`, `mamografia_indicada`, `compartir_informacion`, `apoyar_paciente`, `solicitar_atencion`, `ninguna` |
| `marcas` | Entidades mencionadas de forma explícita: `msd`, `daiichi-sankyo`, `astrazeneca`, `otro-laboratorio`, `fonseca`, `el-viaje-de-la-vida`, `lotengo` |
| `conf` | Confianza entre 0 y 1 en la clasificación completa |
| `revisar` | `true` si el caso es ambiguo y conviene una revisión humana |

## Reglas de interpretación

1. **Contenido educativo no es negativo.** Un mensaje que informa sobre riesgos, síntomas o mortalidad («el cáncer de mama es la primera causa de muerte…») es `neutral` o `positivo` según su tono, nunca `negativo` solo por mencionar cáncer, muerte o enfermedad.
2. **Separa los objetos del sentimiento.** Una queja contra la EPS es `ss: negativo`; no afecta a `sm`. Un mensaje de esperanza no implica aprobación de MSD: `sm` solo se marca si MSD o la campaña aparecen de forma explícita.
3. **Testimonios con emociones mixtas.** El dolor por el diagnóstico junto con la gratitud por el tratamiento es `s: mixto`. En `e`, elige la emoción dominante.
4. **Marcas solo explícitas.** Una mención va en `marcas` solo si nombra a la entidad. `menciones` es una pista automática y puede contener falsos positivos: «MSD» puede ser otra cosa, «Merck» no es MSD en Colombia y «Fonseca» puede ser otra persona. Confírmalo con el contexto.
5. **Varias temáticas.** Marca todas las que apliquen. No elijas una sola si la publicación trata varias.
6. **Intención explícita.** Marca una intención solo si el texto la expresa o la pide, por ejemplo: «voy a pedir cita», «compartan», «hazte la mamografía si te corresponde». Si no hay ninguna, usa `["ninguna"]`.
7. **Mamografía según indicación.** `mamografia_indicada` representa hacerse el examen cuando corresponde por edad, riesgo o indicación médica. No lo interpretes como una recomendación universal.
8. **Sin certeza inventada.** Si el texto es breve, irónico, en otro idioma o depende de una imagen o video que no ves, baja `conf` y marca `revisar: true`. Usa `s: indeterminado` cuando no se pueda saber.
9. **El sentimiento de SentiOne es solo referencia.** No lo copies: clasifica por el contenido.
10. **Sin datos personales.** No incluyas nombres, usuarios, teléfonos ni fragmentos del texto en el resultado.

## Validación automática

`npm run sentione -- aplicar` rechaza los resultados con valores fuera de esta lista. También marca para revisión los casos con `conf` menor que 0,6, con `rel: dudosa` o con `s: indeterminado`. Un registro solo cuenta como «clasificado por contenido» cuando tiene un resultado válido de Claude o una revisión manual. Las revisiones manuales nunca se sobrescriben.
