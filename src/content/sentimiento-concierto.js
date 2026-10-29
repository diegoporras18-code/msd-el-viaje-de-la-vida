// Lectura editorial cualitativa del contenido y de las reacciones sobre el evento.
// No es una distribución de sentimiento: no reclasifica publicaciones ni asigna
// porcentajes a las 28 referencias o a los asistentes. Evidencia en el repositorio privado.
export const sentimientoConcierto = {
  titulo: 'Lo que se compartió sobre el concierto',
  nota: 'Síntesis anónimas de publicaciones y reacciones sobre el evento, incluidas las posteriores. No son citas ni porcentajes sobre los asistentes.',
  tarjetas: [
    { id: 'positivo', sentimiento: 'Positivo', color: '#6FD3C1',
      titulo: 'Reconocimiento al artista y al mensaje',
      texto: 'Las reacciones expresan admiración por Fonseca y valoraciones favorables del concierto. Las publicaciones también destacan su llamado al cuidado.',
      enfoque: 'Valoración del artista y difusión del cuidado' },
    { id: 'neutral', sentimiento: 'Neutral · informativo', color: '#C9B3C0',
      titulo: 'El mensaje de prevención que se difundió',
      texto: 'Las piezas que recogen la intervención explican el mensaje de prevención y recuerdan la importancia del autoexamen y la detección temprana.',
      enfoque: 'Lectura del contenido informativo' },
    { id: 'negativo', sentimiento: 'Negativo · crítico', color: '#E8916B',
      titulo: 'Preguntas sobre la respuesta y la atención',
      texto: 'En las reacciones críticas se cuestiona la respuesta del público al llamado del artista y se reclama una atención en salud más oportuna.',
      enfoque: 'Participación y atención en salud' },
  ],
};
