// Capítulo 06 · Conclusiones. Edita aquí los textos: los componentes no contienen copy.
// estado: 'preliminar' (basado en datos existentes) | 'pendiente' | 'validada'

export const conclusiones = {
  capitulo: 'Capítulo 06 · Conclusiones',
  titulo: { linea1: 'Lo que la conversación', linea2: 'nos está diciendo' },
  entradilla: 'Hallazgos preliminares a partir de lo medido, y las preguntas que quedan abiertas hasta después del concierto.',

  preliminares: {
    titulo: 'Conclusiones preliminares',
    etiqueta: 'Preliminar · exportación de SentiOne del 21 de septiembre al 20 de octubre de 2026',
    items: [
      {
        id: 'volumen',
        cifra: '130,55',
        unidad: 'registros por día',
        titulo: 'La conversación de octubre ya tiene volumen propio',
        texto: 'Entre el 1 y el 20 de octubre la consulta capturó 2.611 registros: un promedio de 130,55 por día, frente a 22,6 por día del 21 al 30 de septiembre (226 registros). La mediana diaria de octubre es 54.',
      },
      {
        id: 'picos',
        cifra: '50,1 %',
        unidad: 'del periodo en dos días',
        titulo: 'Los picos explican buena parte del promedio',
        texto: 'El 4 de octubre (875 registros) y el 3 de octubre (432) concentran 1.307 registros, el 50,1 % del periodo. También destacan el 5 (246) y el 19 de octubre (238). Sus causas requieren revisar el contenido original.',
      },
      {
        id: 'plataformas',
        cifra: '64,0 %',
        unidad: 'en video y Facebook',
        titulo: 'Video y Facebook concentran la conversación',
        texto: 'Video (872) y Facebook (798) suman 1.670 registros. Les siguen los sitios web (605), X (169), TikTok (118), Instagram (30) y blogs (19).',
      },
      {
        id: 'sentimiento',
        cifra: '57,1 %',
        unidad: 'sin clasificar',
        titulo: 'El sentimiento todavía no es concluyente',
        texto: 'SentiOne dejó sin clasificar 1.491 registros. Del resto, 979 son neutrales (37,5 %), 105 negativos (4,0 %) y 36 positivos (1,4 %). Antes de sacar conclusiones de tono hace falta revisar los registros, sin tratar como negativo un mensaje educativo.',
      },
      {
        id: 'alcance',
        cifra: null,
        titulo: 'Categoría no es lo mismo que marca',
        texto: 'La consulta mide la conversación general sobre cáncer de mama, sin filtro geográfico. Cuánto de ella es atribuible a MSD se sabrá al identificar menciones explícitas en los registros importados.',
      },
    ],
  },

  postConcierto: {
    titulo: 'Después del concierto',
    estado: 'evento',
    preguntas: [
      '¿Cambió el volumen de conversación frente al promedio diario previo?',
      '¿Evolucionó el sentimiento revisado?',
      '¿Qué narrativas ganaron relevancia: prevención, testimonios, acceso?',
      '¿Hubo contenido espontáneo de asistentes y menciones de Fonseca y MSD?',
      '¿Qué medios y creadores amplificaron la acción?',
      '¿Cuántos días persistió el efecto?',
      '¿Aumentaron las señales de intención preventiva?',
    ],
  },

  benchmark: {
    titulo: 'Posicionamiento frente a competidores',
    estado: 'importar',
    texto: 'Requiere exportaciones de SentiOne de MSD, Daiichi Sankyo y AstraZeneca para un mismo periodo y con los mismos criterios.',
  },

  recomendaciones: {
    titulo: 'Aprendizajes y recomendaciones',
    etiqueta: 'Preliminar',
    items: [
      'Revisar los 1.491 registros sin clasificar antes de presentar conclusiones de sentimiento.',
      'Identificar el contenido de los picos del 3, 4, 5 y 19 de octubre para separar lo estacional (Octubre Rosa) de lo que pueda atribuirse a la campaña.',
      'Mantener la misma consulta de SentiOne durante y después del concierto para que las comparaciones sean válidas.',
      'Solicitar exportaciones de competidores con el mismo periodo y criterios para habilitar el Share of Voice.',
      'Registrar cada evidencia (noticia, publicación o creador) con su enlace al momento de verificarla.',
    ],
  },

  oportunidades: {
    titulo: 'Oportunidades para la prevención',
    estado: 'medicion',
    texto: 'Se identificarán a partir de las narrativas de prevención y de acceso, y de las señales de intención preventiva en los registros importados y revisados.',
  },
};
