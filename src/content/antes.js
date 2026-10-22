// Capítulo 03 · Antes del concierto. Dos escenas. Las cifras y frases de conclusión se
// calculan a partir de los resultados (src/lib/data/hechos.js); aquí van titulares, la lectura
// editorial de los picos y las paráfrasis de los ejemplos (revisadas en la base privada).
// Si una actualización cambia el hallazgo, ajusta el titular para que siga siendo cierto.

export const antes = {
  capitulo: 'Capítulo 03 · Antes del concierto',
  titulo: { linea1: 'La conversación', linea2: 'antes de la música' },
  entradilla: 'Solo cuenta lo que habla de verdad de cáncer de mama: el ruido político y las coincidencias quedan fuera.',
  escenas: {
    volumen: {
      kicker: 'Volumen y comportamiento de la conversación',
      titulo: { linea1: 'El pulso de la conversación', linea2: 'lo marca el Día Mundial' },
      serie: 'Menciones sobre cáncer de mama por día',
    },
    tono: {
      kicker: '¿De qué está hablando la gente?',
      titulo: { linea1: 'Llegar a tiempo:', linea2: 'detección, conciencia y acceso' },
      pendiente: 'El análisis por contenido de temáticas, emociones e intenciones se incorporará en la próxima actualización de resultados.',
    },
  },
  // Lectura editorial de los picos de la conversación relevante (revisada por contenido en la base privada).
  picos: [
    { desde: '2026-10-07', hasta: '2026-10-08', titulo: 'Apoyos y prótesis', tono: 'tema' },
    { desde: '2026-10-19', hasta: '2026-10-19', titulo: 'Día Mundial', tono: 'tema' },
  ],
  // Contexto del universo captado (solo en Explorar): el ruido que se excluye de la medición.
  ruido: [{ desde: '2026-10-03', hasta: '2026-10-05', titulo: 'Ruido político', tono: 'ajeno' }],
  criterio:
    'Criterio: menciones que, leídas por contenido, hablan de cáncer de mama (diagnóstico, prevención, tratamiento, pacientes, barreras, investigación o iniciativas que abordan la causa). El ruido se concentra en la reacción política a una donación presidencial del 3 al 5 de octubre. Días sin datos aparecen vacíos, nunca como cero.',
  // Ejemplos representativos: paráfrasis anónimas de patrones respaldados por varias menciones
  // reales (evidencia solo en el informe privado). Se muestran si su patrón alcanza el umbral.
  ejemplos: {
    titulo: 'Así suena la conversación',
    aviso: 'Ejemplos representativos redactados como paráfrasis anónimas de varias menciones reales; no son citas. El sentimiento es el tono hacia el tema, no hacia MSD.',
    tarjetas: [
      {
        patron: 'positivo_apoyo',
        sentimiento: 'Positivo',
        color: '#6FD3C1',
        tema: 'Historias de pacientes · apoyo emocional',
        ejemplo: '«Lo superé porque lo detectaron a tiempo y mi equipo médico no me soltó. A las que hoy están en tratamiento: no están solas».',
        revela: 'La esperanza se apoya en testimonios de sobrevivientes y redes de acompañamiento, y va unida a la detección temprana.',
      },
      {
        patron: 'neutral_informativo',
        sentimiento: 'Neutral',
        color: '#C9B3C0',
        tema: 'Educación · diagnóstico temprano',
        ejemplo: '«Conocer cómo se ven y se sienten tus mamas ayuda a notar cambios; en Colombia se diagnostican cerca de 17.000 casos al año».',
        revela: 'Predomina la información práctica: señales de alerta, autoexploración y cifras que invitan a consultar.',
      },
      {
        patron: 'negativo_barreras',
        sentimiento: 'Negativo',
        color: '#E8916B',
        tema: 'Acceso y barreras de atención',
        ejemplo: '«Octubre se llena de lazos rosados, pero de poco sirve detectar a tiempo si la mamografía no llega o el tratamiento se suspende».',
        revela: 'La frustración apunta al sistema: cobertura de mamografía, demoras y falta de medicamentos, no a la causa.',
      },
    ],
  },
  alcance:
    'Datos hasta el 20 de octubre; el periodo previo al concierto se extiende hasta el 23. Las menciones no equivalen a personas alcanzadas. Las clasificaciones con confianza baja quedan sujetas a revisión y las categorías con menos de 10 menciones se agrupan para proteger la privacidad.',
};
