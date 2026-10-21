// Capítulo 03 · Social listening. Textos editoriales del dashboard de conversación.

export const conversacion = {
  capitulo: 'Capítulo 03 · Social listening',
  titulo: { linea1: 'La conversación', linea2: 'antes de la música' },
  entradilla:
    'Antes del concierto ya existe una conversación sobre cáncer de mama. Medirla es el punto de partida para saber si una noche puede cambiarla.',

  alcance: {
    titulo: 'Qué mide y qué no mide este capítulo',
    puntos: [
      'Incluye todos los registros capturados por la consulta de SentiOne, tengan o no país identificado. No se aplican filtros geográficos: no se afirma que todas las publicaciones sean colombianas.',
      'El proyecto de SentiOne se llama «MSD», pero eso no significa que cada registro mencione al laboratorio. La conversación general sobre cáncer de mama se separa de la atribuible a MSD.',
      'Las cifras actuales son agregados preliminares revisados de la exportación del 21 de septiembre al 20 de octubre de 2026. Las publicaciones individuales, los autores y los hashtags se calcularán al importar el Excel original.',
      'El sentimiento original de SentiOne se conserva tal cual. Los registros sin clasificar se mantienen hasta su revisión; cualquier regla automática se muestra como «sugerida», nunca como validada.',
    ],
  },

  modulos: {
    evolucion: {
      titulo: 'Octubre se mueve a golpes de pico',
      subtitulo: 'Registros por día · todas las fuentes · hora de Bogotá',
    },
    horario: { titulo: 'Volumen por día y hora', subtitulo: 'Registros por franja de una hora (hora de Bogotá)' },
    picos: { titulo: 'Picos de conversación', subtitulo: 'Días con al menos 1,5 veces el promedio diario del periodo' },
    plataformas: { titulo: 'Dónde ocurre la conversación', subtitulo: 'Registros por tipo de fuente' },
    sentimiento: { titulo: 'Sentimiento', subtitulo: 'Clasificación original de SentiOne, revisada o sugerida por reglas' },
    narrativas: { titulo: 'Narrativas principales', subtitulo: 'Una publicación puede tener varias narrativas' },
    temas: { titulo: 'Prevención, testimonios, acceso y avances', subtitulo: 'Temas clave de la conversación' },
    hashtags: { titulo: 'Hashtags', subtitulo: 'Hashtags más usados en los textos importados' },
    palabras: { titulo: 'Palabras clave', subtitulo: 'Términos de un vocabulario controlado (src/config/clasificacion.js)' },
    relacion: { titulo: 'Categoría, MSD y competencia', subtitulo: 'Relación de cada registro con las marcas, por mención explícita' },
    emociones: { titulo: 'Emoción e intención preventiva', subtitulo: 'Señales de emoción y de intención de prevenir' },
    destacados: { titulo: 'Autores y publicaciones relevantes', subtitulo: 'Solo contenidos revisados expresamente para su publicación' },
  },

  temasClave: ['prevencion', 'testimonios', 'acceso', 'avances'],
};
