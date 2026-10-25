// Capítulo 04 · Primera lectura del evento; las cifras se derivan de los agregados.
export const impacto = {
  capitulo: 'Capítulo 04 · Impacto del concierto',
  titulo: { linea1: 'La experiencia y la causa,', linea2: 'dos conversaciones por distinguir' },
  pendiente: {
    titulo: 'Esperamos días completos para medir el concierto.',
    texto: 'Se comparan promedios diarios de menciones sobre cáncer de mama. Los días parciales se conservan fuera de la medición pública.',
    medira: ['Volumen frente al periodo previo', 'Contenido verificable de la campaña', 'Amplificación después del evento'],
  },
  causalidad: 'Coincidir con el concierto no demuestra causalidad. La escucha digital no mide asistencia, emoción presencial ni recordación de marca.',
  limites: (corte) => `Primera lectura, corte al ${corte?.dia ?? 'último día cubierto'}. Puede haber publicaciones aún no indexadas. Las horas se interpretan en Bogotá; la exportación no confirma su zona de origen.`,
  oportunidades: [
    { momento: 'Antes', titulo: 'Dar una invitación compartible', texto: 'Acordar con artista y aliados un hashtag oficial y un llamado concreto a informarse sobre detección temprana.' },
    { momento: 'Durante', titulo: 'Facilitar la participación', texto: 'Proponer momentos para compartir y un QR con información útil. Registrar clics con una medición consentida.' },
    { momento: 'Después', titulo: 'Sostener la conversación', texto: 'Distribuir momentos destacados verificados y contenidos educativos; medir la continuidad durante siete días completos.' },
  ],
  indicadores: 'Para próximas activaciones: publicaciones originales con el hashtag validado, autores únicos con protección de privacidad, proporción orgánica, contenidos de aliados, interacciones y reproducciones verificadas, amplificación posterior, clics o escaneos y conversación relevante sobre la causa. Son indicadores propuestos; no resultados medidos de este concierto.',
  muestra: 'La conversación confirmada de campaña se mide por separado de la causa. Los vínculos posibles y las publicaciones sin verificar no se suman. Los desgloses y la intersección solo se muestran cuando superan los mínimos de privacidad; no se infiere participación orgánica ni experiencia presencial.',
};
