// Capítulo 03 · Antes del concierto. Dos escenas. Las cifras y frases de conclusión se
// calculan a partir de los resultados (src/lib/data/hechos.js); aquí van titulares, la lectura
// editorial de los picos y las síntesis de los patrones de conversación (verificadas en la base privada).
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
    { desde: '2026-10-18', hasta: '2026-10-20', titulo: 'Día Mundial y su eco', tono: 'tema' },
  ],
  // Contexto del universo captado (solo en Explorar): el ruido que se excluye de la medición.
  ruido: [{ desde: '2026-10-03', hasta: '2026-10-05', titulo: 'Ruido político', tono: 'ajeno' }],
  criterio:
    'Criterio: menciones que, leídas por contenido, hablan de cáncer de mama (diagnóstico, prevención, tratamiento, pacientes, barreras, investigación o iniciativas que abordan la causa). El ruido se concentra en la reacción política a una donación presidencial del 3 al 5 de octubre. Días sin datos aparecen vacíos, nunca como cero.',
  // Patrones de conversación: síntesis anónimas en tercera persona de lo que se repite en varias
  // menciones reales. No son testimonios ni citas. Cada afirmación concreta está verificada con al
  // menos 10 menciones en el informe privado; la tarjeta solo se muestra si su patrón alcanza el umbral.
  ejemplos: {
    titulo: 'Patrones de conversación identificados',
    aviso: 'Síntesis anónimas de patrones que se repiten en varias menciones reales; no son testimonios ni citas. El sentimiento es el tono hacia el tema, no hacia MSD.',
    tarjetas: [
      {
        patron: 'positivo_apoyo',
        sentimiento: 'Positivo',
        color: '#6FD3C1',
        tema: 'Historias de pacientes · apoyo emocional',
        sintesis: 'Sobrevivientes y familiares cuentan que superaron la enfermedad, y muchas publicaciones acompañan a quienes están en tratamiento con mensajes de que no están solas.',
        revela: 'La esperanza se apoya en historias de superación y redes de acompañamiento, a menudo junto a un llamado a detectar a tiempo.',
      },
      {
        patron: 'neutral_informativo',
        sentimiento: 'Neutral',
        color: '#C9B3C0',
        tema: 'Educación · diagnóstico temprano',
        sintesis: 'Piezas informativas explican las señales de alerta y la autoexploración, llaman a consultar ante cualquier cambio y citan cerca de 17.000 casos nuevos al año en Colombia.',
        revela: 'La mayor parte de lo neutral es información práctica para reconocer cambios y consultar a tiempo.',
      },
      {
        patron: 'negativo_barreras',
        sentimiento: 'Negativo',
        color: '#E8916B',
        tema: 'Acceso y barreras de atención',
        sintesis: 'Las publicaciones señalan que las campañas rosas no bastan: citan una cobertura de mamografía de 38,4 % en Colombia frente a una meta de 70 % y denuncian esperas largas entre la sospecha, el diagnóstico y el tratamiento.',
        revela: 'La frustración apunta al acceso a la atención, no a la causa.',
      },
    ],
  },
  // La fecha de corte se toma de resultados.cobertura (corteDatos en hechos.js).
  alcance: (corte) =>
    `${corte ? `Datos hasta el ${corte.dia}${corte.parcial ? `; el periodo previo al concierto se extiende hasta el ${corte.finPrevio}` : ''}. ` : ''}` +
    'Las menciones no equivalen a personas alcanzadas. Las clasificaciones con confianza baja quedan sujetas a revisión y las categorías con menos de 10 menciones se agrupan para proteger la privacidad.',
};
