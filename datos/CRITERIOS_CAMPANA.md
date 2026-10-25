# Relevancia independiente para campaña · versión 2

La clasificación A/B/C del cáncer de mama conserva sus criterios v1. La dimensión
`cp` responde a otra pregunta: si hay evidencia de relación con la iniciativa de MSD,
El Viaje de la Vida o el evento específico. Una publicación C puede estar confirmada
para campaña y una A puede no estar relacionada. Una keyword o una entidad por sí
sola nunca confirma campaña.

## Decisiones privadas y migración

La base maestra pasa de versión 1 a 2 mediante migración aditiva. Se aceptan bases
legadas v1 sin `cp`. No se cambian huellas, fechas, métricas, clasificaciones `c`,
revisiones manuales ni sus cadenas `prev`. Una decisión nueva lleva:

- `version: 2`, `registro` (la huella interna), `fuente`, `origen` y `fecha`.
- `estado`: `confirmada`, `posible` o `no_relacionada`.
- `evidencias`: códigos cerrados; nunca textos, cuentas ni enlaces.
- `vinculo`: asistente, organizador, aliado, artista, medio, tercero o indeterminado.
- `temas`: experiencia, convocatoria, concientización, amplificación, información del evento u otro.
- `confianza` y `revision` (pendiente, verificada o descartada).

No asignar un rol sin evidencia. La ausencia de `cp` significa **sin evaluar**, no
«no relacionada». Una confirmación exige evidencia directa, confianza mínima 0,8
y revisión verificada. Lo posible no se suma. Si el texto cambia, `cp` queda obsoleta
hasta nueva revisión; las decisiones temáticas manuales permanecen protegidas.

Una noticia genérica del concierto sin vínculo con la campaña o la causa queda fuera, aunque coincidan artista y fecha. La identificación del concierto por sí sola no confirma campaña. Los contenidos
multimedia no vistos y los comentarios sin contexto verificable no se reconstruyen.

Primero prepara las decisiones en `entradas/`, ejecuta una conciliación en seco y
comprueba la preservación completa de `c` y las huellas. Después aplica:

```bash
npm run sentione -- auditar-campana entradas/auditoria/campana-decisiones.json --seco
npm run sentione -- auditar-campana entradas/auditoria/campana-decisiones.json
```

La CLI verifica privacidad antes de escribir y rechaza cambios en A/B/C. No se
sobrescribe una decisión manual de campaña automáticamente. Las modificaciones
semánticas de una revisión temática manual requieren aprobación específica.

## Tres universos y publicación v4

1. Causa: menciones A, con la serie depurada anterior.
2. Campaña: publicaciones únicas con `cp` confirmada y vigente, cualquiera que sea A/B/C.
3. Intersección: confirmadas de campaña que además son A.

Los universos se solapan y no se suman. La proporción de mensaje de causa usa como
denominador campaña confirmada, nunca el volumen general de cáncer de mama.
Sin denominador confirmado o con una celda pequeña no se publica proporción.

El bloque `campana` de resultados v4 contiene únicamente agregados protegidos,
separados de la serie temática original. Rige el umbral 10 también en su serie diaria:
no se amplía la excepción histórica de la serie diaria A/B/C. La partición de campaña
con/sin causa se protege mediante supresión complementaria; no se publica «solo
causa», ni cruces por autores, ni registros, ni evidencia individual. Los días no
completamente evaluados del archivo se muestran sin cifra, nunca como cero.

Auditar todas las filas de un día no certifica exhaustividad de SentiOne. Se distingue
cobertura de captura de cobertura de revisión. Un pico de campaña solo se compara con
su propia serie y línea base, con cobertura suficiente. El comportamiento de la causa
no demuestra el comportamiento del concierto ni causalidad.

## Recuperación de la consulta

Distingue configuración aportada por el usuario, coincidencias del campo `Keywords`,
variantes observadas y propuestas futuras. La columna Keywords no contiene por sí
sola el booleano ni sus exclusiones. Conserva los grupos OR/AND y el orden literal de
las frases entre comillas de la configuración original, sin convertir una keyword en
relevancia ni usar esa reconstrucción para eliminar histórico. Confirma por separado
zona horaria, fecha efectiva, fuentes monitorizadas y cambios de configuración.

Para promover una complementaria, confirma además si es publicación original o comentario.
La promoción automática acepta publicaciones con ID canónico, no comentarios mediante
el enlace del hilo. Un comentario externo requiere un cotejo de su propio ID antes de
sumarlo; los comentarios SentiOne existentes se auditan sin fusionarlos con la publicación.


## Validación del responsable · cierre del 25 de octubre

La pertenencia editorial puede confirmarse con `fuente: validacion_usuario` y
`vinculo_validado_usuario`, sin afirmar verificación por la plataforma. Esta decisión
se protege frente a sobrescrituras automáticas. Las 14 referencias están validadas;
su número no equivale a publicaciones únicas fechadas ni a un total del día 24.
La cola conserva por separado validación editorial, identidad, fecha y métricas.
Solo una identidad canónica deduplicada y una fecha acreditada permiten incorporar
un registro a la serie. Sin fecha permanece validado editorialmente, fuera de las barras.
La fecha codificada de un ID X se documenta como derivada, en Bogotá, sin atribuirla
a una consulta de plataforma. Los posibles duplicados sin identidad en el mismo mes
bloquean una nueva incorporación; no se confunden comentarios con publicaciones.
La causa sin clasificar es desconocida, nunca ausencia de causa. No se inventan
interacciones ni clasificaciones A. Los externos sin clasificación temática alimentan
solo el universo de campaña, preservando el denominador histórico de SentiOne.
