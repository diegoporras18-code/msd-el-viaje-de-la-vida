// Capítulo 04 · Primera lectura del evento; las cifras se derivan de los agregados.
export const impacto = {
  capitulo: 'Capítulo 04 · Impacto del concierto',
  titulo: { linea1: 'La noche pasó.', linea2: '¿Qué dejó en la conversación?' },
  pendiente: {
    titulo: 'Esperamos días completos para medir el concierto.',
    texto: 'Se comparan promedios diarios de menciones sobre cáncer de mama. Los días parciales se conservan fuera de la medición pública.',
    medira: ['Volumen frente al periodo previo', 'Contenido verificable de la campaña', 'Amplificación después del evento'],
  },
  causalidad: 'Coincidir con el concierto no demuestra causalidad. La escucha digital no mide asistencia, emoción presencial ni recordación de marca.',
  limites: (corte) => `Primera lectura, corte al ${corte?.dia ?? 'último día cubierto'}. Puede haber publicaciones aún no indexadas. Las horas se interpretan en Bogotá; la exportación no confirma su zona de origen.`,
  universos: [
    { titulo: 'La causa', texto: 'La comparación mide publicaciones sobre cáncer de mama, con independencia de MSD y del concierto.' },
    { titulo: 'La campaña', texto: 'En la captura del 24 no se identificaron menciones explícitas de MSD, Fonseca o El Viaje de la Vida vinculadas a la acción. No demuestra ausencia en redes.' },
    { titulo: 'La captura complementaria', texto: '14 enlaces aportados siguen pendientes de verificación por restricciones de acceso. No se suman ni se usan como evidencia.' },
  ],
  oportunidades: [
    { momento: 'Antes', titulo: 'Dar una invitación compartible', texto: 'Acordar con artista y aliados un hashtag oficial y un llamado concreto a informarse sobre detección temprana.' },
    { momento: 'Durante', titulo: 'Facilitar la participación', texto: 'Proponer momentos para compartir y un QR con información útil. Registrar clics con una medición consentida.' },
    { momento: 'Después', titulo: 'Sostener la conversación', texto: 'Distribuir momentos destacados verificados y contenidos educativos; medir la continuidad durante siete días completos.' },
  ],
  indicadores: 'Para próximas activaciones: publicaciones originales con el hashtag validado, autores únicos con protección de privacidad, proporción orgánica, contenidos de aliados, interacciones y reproducciones verificadas, amplificación posterior, clics o escaneos y conversación relevante sobre la causa. Son indicadores propuestos; no resultados medidos de este concierto.',
  muestra: 'La muestra del día no permite desglosar de forma publicable plataformas, horarios, temáticas ni sentimiento. Tampoco permite distinguir asistentes, organizadores, artista, medios y terceros con suficiente evidencia. Las interacciones no se comparan como alcance ni como impacto de la campaña.',
};
