// Capítulo 06 · Conclusiones.
//
// Cada hallazgo combina:
//  - `hecho`: clave de src/lib/data/hechos.js. La cifra se calcula sola y siempre está al día.
//    Si el hecho no está disponible, el hallazgo no se muestra.
//  - `pregunta`, `titulo`, `significa` y `oportunidad`: texto editorial breve, sin repetir las
//    explicaciones de los capítulos anteriores.
//  - `estado`: 'preliminar' (puede ajustarse en una actualización) o 'aprobada' (no se
//    reescribe sin revisión: si los datos la contradicen, se señala en el Pull Request).
// La presentación muestra los tres primeros hallazgos disponibles, en este orden: son los tres
// mensajes ejecutivos.

export const conclusiones = {
  capitulo: 'Capítulo 06 · Conclusiones',
  titulo: { linea1: 'Lo que la conversación', linea2: 'nos está diciendo' },
  // La fecha de corte se toma de resultados.cobertura (corteDatos en hechos.js).
  periodo: (corte) =>
    corte
      ? `Primera lectura · datos hasta el ${corte.dia} de ${corte.anio}; conversación previa y día del concierto`
      : 'Antes del concierto',

  hallazgos: [
    {
      id: 'temas', hecho: 'temas', estado: 'preliminar',
      pregunta: '¿Qué necesita la conversación antes del concierto?',
      titulo: 'Llegar a tiempo, con acompañamiento',
      significa: 'La detección temprana lidera el interés. La esperanza convive con barreras para acceder a la atención.',
      oportunidad: 'Ofrecer información clara sobre señales de alerta, consulta y rutas de atención; acompañar sin prometer resultados clínicos.',
    },
    {
      id: 'impacto', hecho: 'impacto', estado: 'preliminar',
      pregunta: '¿Qué ocurrió con la conversación sobre la causa?',
      titulo: 'La conversación temática y el evento se miden por separado',
      significa: 'El comportamiento temático se calcula de los datos. No equivale al volumen específico del evento.',
      oportunidad: 'Verificar las publicaciones complementarias y completar los días posteriores antes de atribuir resultados a la campaña.',
    },
    {
      id: 'oportunidad', hecho: 'laboratorios', estado: 'preliminar',
      pregunta: '¿Cómo convertir la iniciativa en participación medible?',
      titulo: 'Diseñar la amplificación desde el inicio',
      significa: 'La presencia de laboratorios es acotada en esta consulta y no mide su posición competitiva. Hay una oportunidad de comunicación útil y sostenida.',
      oportunidad: 'Coordinar artista y aliados antes, facilitar contenidos y un QR durante, y sostener la educación después. Medir publicaciones verificadas y acciones, sin asumir impacto.',
    },
  ],

  // Respuestas a las preguntas clave: se muestran plegadas para no alargar la presentación.
  preguntas: [
    { pregunta: '¿Cuánto de lo que se capta habla realmente de cáncer de mama?', hecho: 'relevancia' },
    { pregunta: '¿Cómo se comportó la conversación y cuáles fueron sus picos?', hecho: 'picos' },
    { pregunta: '¿Qué sentimientos predominan realmente?', hecho: 'sentimiento' },
    { pregunta: '¿Qué barreras aparecen en las conversaciones?', hecho: 'barreras' },
    { pregunta: '¿Dónde se publica la conversación sobre cáncer de mama?', hecho: 'plataformas' },
    { pregunta: '¿Qué presencia tenía MSD antes del concierto?', hecho: 'msd' },
    { pregunta: '¿Qué laboratorios aparecen?', hecho: 'marcas' },
    { pregunta: '¿Qué tan confiable es la clasificación por contenido?', hecho: 'calidad' },
    { pregunta: '¿Cambió la conversación temática el día del concierto?', hecho: 'impacto' },
    { pregunta: '¿Cuánta conversación confirmada se identificó sobre la campaña?', hecho: 'campana' },
  ],
};
