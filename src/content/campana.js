// Capítulo 02 · La campaña. Redactado como acción PROGRAMADA: no afirmes resultados
// hasta que existan datos verificados después del 24 de octubre de 2026.

export const campana = {
  capitulo: 'Capítulo 02 · La campaña',
  titulo: { linea1: 'Cuando la música abre', linea2: 'una conversación que importa' },
  texto:
    'MSD y la agencia Lotengo buscan convertir el concierto de Fonseca en Bogotá en un espacio de concientización sobre el cáncer de mama: llevar un mensaje de prevención a un lugar donde miles de personas se emocionan juntas.',
  estado: 'Programado · 24 de octubre de 2026 · Bogotá',
  flujo: {
    etiqueta: 'Secuencia: música, emoción, conversación, concientización, acción',
    pasos: [
      { id: 'musica', nombre: 'Música', texto: 'El concierto de Fonseca reúne a miles de personas en un mismo momento.' },
      { id: 'emocion', nombre: 'Emoción', texto: 'Mensajes de concientización previstos en las pantallas acompañan la música.' },
      { id: 'conversacion', nombre: 'Conversación', texto: 'El público comparte la experiencia y los medios y creadores la amplifican.' },
      { id: 'concientizacion', nombre: 'Concientización', texto: 'La conversación acerca información preventiva confiable.' },
      { id: 'accion', nombre: 'Acción', texto: 'Informarse, consultar y hacerse los controles cuando estén indicados.' },
    ],
  },
  nota: 'La campaña busca contribuir a la concientización, el primer paso del recorrido. Sus resultados se medirán después del concierto.',
};
