// Capítulo 06 · Conclusiones.
//
// Cada hallazgo combina:
//  - `hecho`: clave de src/lib/data/hechos.js. La frase con cifras se calcula sola y siempre
//    está al día. Si el hecho no está disponible, el hallazgo no se muestra.
//  - `interpretacion`, `hipotesis` y `recomendacion`: texto editorial.
//  - `estado`: 'preliminar' (puede ajustarse en una actualización) o 'aprobada' (no se
//    reescribe sin revisión: si los datos la contradicen, se señala en el Pull Request).
// La presentación muestra los tres primeros hallazgos disponibles, en este orden: son los tres
// mensajes ejecutivos.

export const conclusiones = {
  capitulo: 'Capítulo 06 · Conclusiones',
  titulo: { linea1: 'Lo que la conversación', linea2: 'nos está diciendo' },
  periodo: 'Antes del concierto · datos del 1 al 20 de octubre de 2026 (el periodo previo llega al 23)',

  // Tres mensajes ejecutivos, en este orden.
  hallazgos: [
    {
      id: 'relevancia',
      hecho: 'relevancia',
      estado: 'preliminar',
      titulo: 'El volumen total sobrestima la conversación sobre cáncer de mama',
      interpretacion:
        'La consulta recoge mucha conversación que solo roza el tema: comentarios políticos bajo publicaciones que mencionan la causa, portales que repiten titulares en sus menús y noticias sobre otros tipos de cáncer. Contar todo lo captado como conversación sobre la causa la sobredimensiona; la medida de conciencia es la conversación que realmente habla de cáncer de mama, y el universo captado es solo contexto.',
      hipotesis: 'Los comentarios capturados bajo publicaciones virales y los términos amplios de la consulta explicarían la mayor parte de las coincidencias ajenas al tema.',
      recomendacion: 'Reportar siempre las menciones sobre cáncer de mama junto con su denominador, y evaluar el concierto con la misma consulta y el mismo criterio de relevancia para que el punto de partida sea comparable.',
    },
    {
      id: 'picos',
      hecho: 'picos',
      estado: 'preliminar',
      titulo: 'Los mayores picos no reflejan necesariamente interés genuino en la causa',
      interpretacion:
        'Los picos del 3 al 5 de octubre corresponden a la reacción a la donación del salario presidencial anunciada el 3 de octubre en Montería, destinada en parte a mujeres con cáncer de mama: la gran mayoría son comentarios de apoyo o de crítica política que no hablan de la enfermedad. El 5 de octubre se suma una entrevista en video con un mastólogo sobre su propio diagnóstico. El 19 de octubre, Día Mundial contra el Cáncer de Mama, es un pico menor en volumen pero temático: campañas de autoexamen, cifras de cobertura de mamografía y testimonios.',
      hipotesis: 'Cuando una figura de alta exposición protagoniza el contenido y el mensaje de salud no es el centro, la conversación se desplaza hacia la figura y no hacia la causa.',
      recomendacion: 'Leer cada pico por su contenido antes de celebrarlo, y medir la proporción de menciones sobre cáncer de mama del día, no solo su volumen.',
    },
    {
      id: 'oportunidades',
      hecho: 'temas',
      estado: 'preliminar',
      titulo: 'Detección temprana, concientización y acceso: ahí está la oportunidad',
      interpretacion:
        'Cuando la conversación sí trata de cáncer de mama, el eje es llegar a tiempo: detección temprana, concientización y acceso al sistema de salud. Conviven mensajes de autoexamen con datos de cobertura de mamografía por debajo de la meta y con quejas por demoras en la atención.',
      hipotesis: 'La distancia entre el llamado a detectar a tiempo y las barreras para confirmar el diagnóstico puede restar credibilidad a las campañas que se quedan en lo simbólico.',
      recomendacion:
        'El propósito de la intervención de MSD y Lotengo en el concierto de Fonseca encaja con esa conversación: acompañar la emoción de la noche con un paso concreto, consultar al médico y hacerse la mamografía cuando esté indicada, con información sobre cómo acceder a ella. Si eso mueve la conversación se sabrá solo con la medición posterior al 24 de octubre.',
    },
  ],

  preguntas: [
    { pregunta: '¿Qué se está hablando y cuáles son las temáticas principales?', hecho: 'temas' },
    { pregunta: '¿Qué sentimientos predominan realmente?', hecho: 'sentimiento' },
    { pregunta: '¿Dónde se publica la conversación sobre cáncer de mama?', hecho: 'plataformas' },
    { pregunta: '¿Qué barreras aparecen en las conversaciones?', hecho: 'barreras' },
    { pregunta: '¿Cuánto de lo que se capta habla realmente de cáncer de mama?', hecho: 'relevancia' },
    {
      pregunta: '¿Qué contenidos y actores impulsan los picos?',
      hecho: 'picos',
      complemento:
        'Del 3 al 5 de octubre, la reacción a la donación del salario presidencial, sobre todo comentarios políticos; el 5 de octubre, además, una entrevista con un mastólogo. El 19 de octubre, el Día Mundial contra el Cáncer de Mama, con campañas de autoexamen, datos de cobertura de mamografía y testimonios.',
    },
    { pregunta: '¿MSD logró generar conversación identificable?', hecho: 'msd' },
    { pregunta: '¿La acción del concierto produjo un cambio observable?', hecho: 'impacto' },
    { pregunta: '¿Cómo aparece MSD frente a las otras marcas detectadas?', hecho: 'marcas' },
    { pregunta: '¿Qué tan confiable es la clasificación por contenido?', hecho: 'calidad' },
    {
      pregunta: '¿Qué oportunidades de comunicación y concientización surgen?',
      respuesta:
        'Detección temprana, concientización y acceso a la atención son las principales oportunidades de comunicación. Para la intervención en el concierto: conectar la emoción con un paso concreto de detección y acceso, anclar las piezas en el mensaje de salud y no solo en figuras de alta exposición, y medir la proporción de menciones que hablan de cáncer de mama, no solo el volumen.',
      estado: 'preliminar',
    },
  ],
};
