// Capítulo 03 · Antes del concierto. Dos escenas. Las cifras y frases de conclusión se
// calculan a partir de los resultados (src/lib/data/hechos.js); aquí solo van titulares y
// la lectura editorial de los picos (revisada por contenido en la base privada).
// Si una actualización cambia el hallazgo, ajusta el titular para que siga siendo cierto.

export const antes = {
  capitulo: 'Capítulo 03 · Antes del concierto',
  titulo: { linea1: 'La conversación', linea2: 'antes de la música' },
  entradilla: 'Lo que ya se dice sobre cáncer de mama es el punto de partida para saber si una noche puede cambiarlo. Pero no todo lo que capta la escucha social habla de la causa.',
  escenas: {
    relevancia: {
      kicker: 'Volumen frente a conversación real',
      titulo: { linea1: 'Más conversación no siempre', linea2: 'significa más conciencia' },
      comparacion: 'Todo lo captado frente a lo que habla de cáncer de mama',
      serie: 'Menciones por día: captadas y sobre cáncer de mama',
    },
    tono: {
      kicker: 'Cuando sí se habla de la causa',
      titulo: { linea1: 'El eje es llegar a tiempo:', linea2: 'detección, conciencia y acceso' },
      pendiente: 'El análisis por contenido de temáticas, emociones e intenciones se incorporará en la próxima actualización de resultados.',
    },
  },
  // Lectura editorial de los picos (leída por contenido en la base privada; no se calcula aquí).
  picos: [
    { desde: '2026-10-03', hasta: '2026-10-05', titulo: 'Picos políticos', tono: 'ajeno' },
    { desde: '2026-10-19', hasta: '2026-10-19', titulo: 'Pico temático · Día Mundial', tono: 'tema' },
  ],
  alcance:
    'Incluye todas las menciones captadas por la consulta, con o sin país identificado. Los datos llegan hasta el 20 de octubre, aunque el periodo previo al concierto se extiende hasta el 23. Las menciones no equivalen a personas alcanzadas. Sentimiento, plataformas y temáticas se calculan solo con las menciones que, leídas por contenido, hablan realmente de cáncer de mama; el sentimiento es el tono hacia el tema, no la favorabilidad hacia MSD. Las clasificaciones con confianza baja quedan sujetas a revisión. Las categorías con menos de 10 menciones se agrupan para proteger la privacidad.',
};
