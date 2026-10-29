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
      ? `Primera lectura · datos hasta el ${corte.dia} de ${corte.anio}; conversación antes y después del concierto`
      : 'Antes del concierto',

  hallazgos: [
    {
      id: 'temas', hecho: 'picoTematico', estado: 'preliminar',
      pregunta: '¿Qué activa la conversación sobre cáncer de mama?',
      titulo: 'Los momentos de concientización movilizan',
      significa: 'El Día Mundial concentró el principal pico temático del periodo. Las fechas clave abren espacio para hablar de prevención, diagnóstico y acompañamiento.',
      oportunidad: 'Planificar información clara y útil alrededor de esos momentos, con orientación hacia consulta y atención oportuna.',
    },
    {
      id: 'impacto', hecho: 'campana', estado: 'preliminar',
      pregunta: '¿Qué conversación se identificó alrededor del concierto?',
      titulo: 'Una experiencia para conectar y amplificar',
      significa: 'El registro del concierto conecta a Fonseca y MSD con prevención y diagnóstico temprano. El escenario abre una oportunidad para prolongar el mensaje en la conversación digital.',
      oportunidad: 'Convertir el mensaje del artista en piezas breves, educativas y compartibles; activar a los aliados y medir su continuidad.',
    },
    {
      id: 'oportunidad', hecho: 'campana', estado: 'preliminar', sinCifra: true,
      pregunta: '¿Cómo ampliar la participación para MSD?',
      titulo: 'Conectar la experiencia con la conversación digital',
      observacion: 'La conversación identificada ofrece un punto de partida para sostener la participación más allá del evento.',
      significa: 'La continuidad digital permite conectar entretenimiento, información útil y concientización.',
      oportunidad: 'Coordinar artista y aliados, facilitar contenidos compartibles y educativos, sumar llamados a participar y amplificar después.',
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
    { pregunta: '¿Qué conversación se identificó alrededor de la iniciativa?', hecho: 'campana' },
  ],
};
