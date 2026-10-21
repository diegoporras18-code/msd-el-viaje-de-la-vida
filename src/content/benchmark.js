// Capítulo 05 · Benchmark competitivo.
// Las métricas solo salen de exportaciones de SentiOne. Las referencias públicas
// de campañas se muestran aparte y NO se convierten en métricas.

export const benchmark = {
  capitulo: 'Capítulo 05 · Benchmark',
  titulo: { linea1: 'La conversación también', linea2: 'construye posicionamiento' },
  entradilla:
    'Cada laboratorio habla de cáncer de mama a su manera. Comparar quién está presente en la conversación, dónde y con qué narrativas ayuda a entender el lugar de MSD.',

  reglas: [
    'Cada laboratorio se mide con su propia exportación de SentiOne, con los mismos criterios de clasificación y deduplicación.',
    'El Share of Voice solo se calcula cuando todas las marcas elegidas tienen datos del mismo periodo.',
    'Se cuentan menciones explícitas de cada laboratorio: una publicación que solo habla de la enfermedad no se atribuye a ninguna marca.',
  ],

  modulos: {
    sov: { titulo: 'Share of Voice', subtitulo: 'Menciones explícitas de cada laboratorio en el periodo común' },
    volumen: { titulo: 'Volumen por marca', subtitulo: 'Menciones explícitas y resto de registros de cada consulta' },
    evolucion: { titulo: 'Evolución diaria', subtitulo: 'Registros por día de cada consulta' },
    plataformas: { titulo: 'Distribución por plataformas', subtitulo: 'Proporción de registros por tipo de fuente' },
    sentimiento: { titulo: 'Sentimiento por marca', subtitulo: 'Clasificación original de SentiOne' },
    narrativas: { titulo: 'Narrativas por marca', subtitulo: 'Narrativas validadas o sugeridas' },
    tipos: { titulo: 'Tipos de publicación', subtitulo: 'Según la columna de tipo de la exportación' },
    hashtags: { titulo: 'Campañas y hashtags', subtitulo: 'Hashtags más usados en cada consulta' },
    formatos: { titulo: 'Formatos que generan interacciones', subtitulo: 'Interacciones promedio por publicación, por plataforma' },
    destacados: { titulo: 'Noticias y contenidos destacados', subtitulo: 'Contenidos revisados de cada laboratorio' },
  },

  referencias: {
    titulo: 'Referencias públicas para investigación',
    aviso: 'Iniciativas documentadas en fuentes públicas. No son datos medidos en SentiOne ni se usan para calcular métricas.',
    items: [
      {
        id: 'innpacto-rosa',
        nombre: 'Innpacto Rosa',
        pais: 'Colombia',
        marcas: 'AstraZeneca y Daiichi Sankyo, con el Departamento de Innovación de la Pontificia Universidad Javeriana',
        descripcion: 'Reto de innovación abierta para identificar ideas que optimicen la ruta de atención de pacientes con cáncer de mama. Convocatoria con cierre el 15 de febrero de 2026.',
        estado: 'verificado',
        fuente: { nombre: 'El Tiempo', url: 'https://www.eltiempo.com/salud/abren-convocatoria-para-iniciativas-que-mejoren-la-ruta-de-atencion-de-pacientes-con-cancer-de-mama-en-bogota-3511812' },
      },
      {
        id: 'la-m-que-falta',
        nombre: 'La M que Falta (#laMquefalta)',
        pais: 'España',
        marcas: 'Asociación Española Cáncer de Mama Metastásico (AECMM), con la Alianza Daiichi Sankyo | AstraZeneca',
        descripcion: 'Movimiento para visibilizar el cáncer de mama metastásico. En octubre de 2023 vistió de rosa la estación de Metro de Sol, en Madrid.',
        estado: 'verificado',
        fuente: { nombre: 'The Objective', url: 'https://theobjective.com/actualidad/2023-10-19/lamquefalta-cancer-mama-sol/' },
      },
      {
        id: 'in-seno-al-futuro',
        nombre: 'In Seno al Futuro',
        pais: null,
        marcas: null,
        descripcion: 'No se encontraron fuentes públicas que confirmen el país, las marcas ni el alcance de esta iniciativa.',
        estado: 'por-verificar',
        fuente: null,
      },
    ],
  },
};
