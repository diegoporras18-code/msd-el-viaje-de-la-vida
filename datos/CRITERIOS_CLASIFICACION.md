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
| `rel` | **A** `si`: el contenido principal trata cáncer de mama (diagnóstico, prevención, tratamiento, pacientes, barreras, investigación o iniciativas que abordan la causa) · **B** `dudosa`: contextual o dudosa, vinculada indirectamente pero con otro tema principal · **C** `no`: ruido (política, otros asuntos, otros cánceres, menús de sitios web, spam). Ver la regla 11. |
| `s` | Sentimiento general: `positivo` · `negativo` · `neutral` · `mixto` · `indeterminado` |
| `sm` | Sentimiento hacia MSD o hacia El Viaje de la Vida: `positivo` · `negativo` · `neutral` · `mixto` · `no_aplica` (si no los menciona) |
| `ss` | Sentimiento hacia el sistema de salud (EPS, citas, hospitales): mismos valores; `no_aplica` si no lo menciona |
| `temas` | Uno o varios: `educacion`, `concientizacion`, `prevencion`, `mamografias`, `diagnostico_temprano`, `tratamiento`, `barreras_atencion`, `acceso_sistema_salud`, `innovacion_medica`, `historias_pacientes`, `apoyo_emocional`, `campanas`, `noticias`, `otros`. Si `rel` es `no`, deja la lista vacía. |
| `e` | `esperanza`, `miedo`, `tristeza`, `indignacion`, `solidaridad`, `gratitud`, `alegria`, `no_identificable` |
| `i` | Uno o varios: `buscar_informacion`, `consultar_medico`, `mamografia_indicada`, `compartir_informacion`, `apoyar_paciente`, `solicitar_atencion`, `ninguna` |
| `marcas` | Entidades mencionadas de forma explícita: `msd`, `daiichi-sankyo`, `astrazeneca`, `roche`, `novartis`, `pfizer`, `lilly`, `gilead`, `menarini`, `bayer`, `otro-laboratorio` (otros laboratorios nombrados), `fonseca`, `el-viaje-de-la-vida`, `lotengo` |
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
11. **Relevancia por lo que expresa la mención, no por su contexto.** Que la publicación original diga «cáncer de mama» no hace relevante a un comentario.
    - Comentarios que solo aplauden o critican a una figura política, aunque la publicación hable de una donación a pacientes: `no`.
    - Noticias sobre una figura política o un gobierno donde el cáncer de mama es una de varias causas beneficiarias: `dudosa`. Si la pieza describe sustancialmente la iniciativa de atención o apoyo (qué ofrece, a quién, cómo acceder), `si`.
    - Agradecimientos, emojis o saludos sin contenido propio bajo una publicación relevante: `dudosa`. Si expresan experiencia, necesidad, apoyo a pacientes o una pregunta sobre la enfermedad: `si`.
    - Artículos de otro tema con un pasaje sustantivo sobre cáncer de mama (un dato, un programa, una investigación): `dudosa`. Si el término solo aparece en menús, «noticias relacionadas», agendas o efemérides: `no`.
    - Otros cánceres, oraciones genéricas, condolencias sin referencia a la enfermedad: `no`.
12. **Laboratorios solo por nombre corporativo.** Nunca atribuyas una publicación a un laboratorio por mencionar un medicamento. Excluye homónimos (por ejemplo, la marca cosmética La Roche-Posay no es Roche). Si el laboratorio aparece solo como patrocinador de algo ajeno al cáncer de mama, no lo marques.

## Validación automática

`npm run sentione -- aplicar` rechaza los resultados con valores fuera de esta lista. También marca para revisión los casos con `conf` menor que 0,6, con `rel: dudosa` o con `s: indeterminado`. Un registro solo cuenta como «clasificado por contenido» cuando tiene un resultado válido de Claude o una revisión manual. Las revisiones manuales nunca se sobrescriben.

## Revisiones focalizadas

`npm run sentione -- revisar entradas/auditoria/revision.json` aplica una auditoría por huella de registro, con un código de motivo (`tema_central`, `contexto_politico`, `mencion_secundaria`, `comentario_sin_contenido`, `ruido_politico`, `ajeno`, `marca_verificada`). Conserva la clasificación anterior en `c.prev`, marca la fuente como `manual` y nunca borra registros. La evidencia parafraseada queda en el informe privado.
