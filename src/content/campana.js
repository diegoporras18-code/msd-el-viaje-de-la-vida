// Capítulo 02 · La campaña. Redactado en futuro: el concierto está PROGRAMADO.
// Cuando ocurra, actualiza `estado` y los textos con lo verificado.

export const campana = {
  capitulo: 'Capítulo 02 · La campaña',
  titulo: { linea1: 'Cuando la música abre', linea2: 'una conversación que importa' },
  entradilla:
    'MSD y la agencia Lotengo preparan una intervención en el concierto de Fonseca en Bogotá para llevar un mensaje de prevención del cáncer de mama a un lugar donde la gente se emociona en comunidad.',
  estado: 'Programado · 24 de octubre de 2026 · Bogotá',
  aviso: 'Este capítulo describe lo planeado. Ninguna de estas acciones se presenta como realizada: los resultados se medirán después del evento.',

  componentes: [
    {
      id: 'intervencion',
      titulo: 'Intervención visual en el concierto',
      texto: 'Una puesta visual integrada a la noche de Fonseca, pensada para que el mensaje acompañe la música sin interrumpirla.',
    },
    {
      id: 'pantallas',
      titulo: 'Mensajes en las pantallas',
      texto: 'Mensajes de concientización sobre cáncer de mama previstos en las pantallas del escenario, en los momentos de mayor atención del público.',
    },
    {
      id: 'redes',
      titulo: 'Participación en redes sociales',
      texto: 'Una invitación al público a compartir la experiencia en sus redes, para que la conversación salga del recinto.',
    },
    {
      id: 'amplificacion',
      titulo: 'Amplificación con medios y creadores',
      texto: 'Medios de comunicación y creadores de contenido previstos para extender el mensaje a quienes no estén en el concierto.',
    },
    {
      id: 'objetivo',
      titulo: 'Objetivo',
      texto: 'Aumentar la conversación sobre cáncer de mama y promover el acceso a información preventiva.',
    },
  ],

  flujo: {
    titulo: 'El recorrido que la campaña busca provocar',
    etiqueta: 'Secuencia: concierto, emoción, participación, conversación, información, acción',
    pasos: [
      { id: 'concierto', nombre: 'Concierto', texto: 'La música reúne a miles de personas en un mismo lugar y en un mismo momento.' },
      { id: 'emocion', nombre: 'Emoción', texto: 'La experiencia compartida abre una disposición a escuchar.' },
      { id: 'participacion', nombre: 'Participación', texto: 'El público responde, graba y comparte desde su propio teléfono.' },
      { id: 'conversacion', nombre: 'Conversación', texto: 'Lo compartido se suma a la conversación digital sobre cáncer de mama.' },
      { id: 'informacion', nombre: 'Información', texto: 'La conversación conduce a información preventiva confiable.' },
      { id: 'accion', nombre: 'Acción', texto: 'El objetivo final: que más personas consulten, se informen y se hagan sus exámenes.' },
    ],
  },

  cita: 'La pregunta no es cuántas personas verán el mensaje, sino cuántas decidirán hablar de él y actuar.',
  medicion: {
    titulo: 'Cómo sabremos si funcionó',
    texto: 'La conversación previa ya está medida (capítulo 03). Después del 24 de octubre se cargarán nuevas exportaciones de SentiOne para comparar antes, durante y después, siempre con promedios diarios y sin atribuir causalidad solo por coincidencia temporal.',
  },
};
