// Capítulo 05 · Benchmark competitivo. Las métricas salen de la misma base maestra.
// Las referencias públicas de campañas son contexto de investigación, no métricas.

export const benchmark = {
  capitulo: 'Capítulo 05 · Benchmark competitivo',
  titulo: { linea1: 'La conversación también', linea2: 'construye posicionamiento' },
  texto: 'Presencia explícita de cada laboratorio dentro de la misma consulta de escucha social. No es un Share of Voice.',
  pendiente: 'Las menciones de MSD, Daiichi Sankyo y AstraZeneca se identificarán con el análisis por contenido de la base de escucha social.',
  limitacion:
    'La consulta de escucha social no fue diseñada para capturar a cada laboratorio con el mismo criterio. Las menciones detectadas no equivalen a la conversación pública total de cada marca, y la ausencia de menciones no implica ausencia de conversación. Por eso no se calcula un Share of Voice.',
  referencias: {
    titulo: 'Referencias públicas de otras campañas',
    aviso: 'Iniciativas documentadas en fuentes públicas. No son datos medidos en la escucha social.',
    items: [
      {
        id: 'innpacto-rosa',
        nombre: 'Innpacto Rosa',
        pais: 'Colombia',
        marcas: 'AstraZeneca y Daiichi Sankyo, con la Pontificia Universidad Javeriana',
        descripcion: 'Reto de innovación abierta para mejorar la ruta de atención de pacientes con cáncer de mama.',
        estado: 'verificado',
        fuente: { nombre: 'El Tiempo', url: 'https://www.eltiempo.com/salud/abren-convocatoria-para-iniciativas-que-mejoren-la-ruta-de-atencion-de-pacientes-con-cancer-de-mama-en-bogota-3511812' },
      },
      {
        id: 'la-m-que-falta',
        nombre: 'La M que Falta',
        pais: 'España',
        marcas: 'Asociación Española Cáncer de Mama Metastásico, con la Alianza Daiichi Sankyo | AstraZeneca',
        descripcion: 'Movimiento para visibilizar el cáncer de mama metastásico.',
        estado: 'verificado',
        fuente: { nombre: 'The Objective', url: 'https://theobjective.com/actualidad/2023-10-19/lamquefalta-cancer-mama-sol/' },
      },
      {
        id: 'in-seno-al-futuro',
        nombre: 'In Seno al Futuro',
        pais: null,
        marcas: null,
        descripcion: 'País, marcas y alcance por verificar en fuentes públicas.',
        estado: 'por-verificar',
        fuente: null,
      },
    ],
  },
};
