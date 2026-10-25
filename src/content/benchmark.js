// Capítulo 05 · Benchmark competitivo. Las métricas salen de la misma base maestra.
// Las referencias públicas de campañas son contexto de investigación, no métricas.

export const benchmark = {
  capitulo: 'Capítulo 05 · Benchmark competitivo',
  titulo: { linea1: 'La conversación también', linea2: 'construye posicionamiento' },
  texto: 'Qué laboratorios aparecen en la conversación sobre cáncer de mama y de qué se habla cuando aparecen. Es presencia en esta consulta, no un Share of Voice.',
  escena: {
    kicker: 'Laboratorios en la conversación',
    titulo: { linea1: 'Los laboratorios aparecen poco', linea2: 'y casi siempre como innovación' },
    presencia: 'Presencia en las menciones sobre cáncer de mama',
  },
  // Síntesis por laboratorio: solo para los que alcanzan el umbral de 10 menciones relevantes.
  // Tercera persona; cada afirmación verificada en el informe privado.
  sintesis: {
    'daiichi-sankyo': 'Aparece como aliada, patrocinadora, vocera o fuente de datos en piezas informativas sobre el diagnóstico del cáncer de mama, no en conversaciones de pacientes.',
  },
  pendiente: 'Las menciones de laboratorios se identificarán con el análisis por contenido de la base de escucha social.',
  limitacion:
    'La consulta no fue diseñada para capturar a cada laboratorio con el mismo criterio. Las menciones detectadas no equivalen a la conversación pública total de cada marca y la ausencia de menciones no implica ausencia de conversación. Por eso no se calcula un Share of Voice.',
  // Lectura estratégica preliminar: qué observamos → qué significa → qué oportunidad representa para MSD.
  conclusiones: [
    {
      id: 'presencia',
      observamos: 'La presencia publicada depende del umbral de cada periodo.',
      significa: 'La cobertura es desigual. Estas cifras no establecen liderazgo ni posición de mercado.',
      oportunidad: 'Hay espacio para que MSD sea identificable por un aporte concreto, no por volumen.',
    },
    {
      id: 'temas',
      observamos: 'Cuando aparecen, los laboratorios se asocian sobre todo a diagnóstico temprano, innovación y acceso: estudios, alianzas y congresos.',
      significa: 'La industria habla desde la ciencia y la institución; casi no aparece en historias de pacientes ni en apoyo emocional, que es donde la conversación es más cercana.',
      oportunidad: 'Conectar la emoción del concierto con información útil y verificable sobre detección y acceso, sin protagonismo de marca.',
    },
    {
      id: 'faltante',
      observamos: 'La consulta capta a los laboratorios solo de forma incidental.',
      significa: 'Un benchmark representativo necesita términos equivalentes para cada marca y su vocería, en el mismo periodo.',
      oportunidad: 'Si se quiere comparar, diseñar esa consulta antes de la medición posterior al concierto.',
    },
  ],
  referencias: {
    titulo: 'Referencias públicas verificadas',
    aviso: 'Iniciativas documentadas en fuentes públicas e independientes de la escucha social. No son datos medidos en esta consulta.',
    items: [
      {
        id: 'innpacto-rosa',
        marcasIds: ["astrazeneca", "daiichi-sankyo"],
        nombre: 'Innpacto Rosa',
        pais: 'Colombia',
        marcas: 'AstraZeneca y Daiichi Sankyo, con la Pontificia Universidad Javeriana',
        descripcion: 'Reto de innovación abierta para mejorar la ruta de atención de pacientes con cáncer de mama.',
        estado: 'verificado',
        fuente: { nombre: 'El Tiempo', url: 'https://www.eltiempo.com/salud/abren-convocatoria-para-iniciativas-que-mejoren-la-ruta-de-atencion-de-pacientes-con-cancer-de-mama-en-bogota-3511812' },
      },
      {
        id: 'rutas-saludables',
        marcasIds: ["roche"],
        nombre: 'Rutas Saludables, Mujeres en Territorios',
        pais: 'Colombia',
        marcas: 'Roche',
        descripcion: 'Jornadas de tamizaje de cáncer de mama y de cuello uterino para mujeres de zonas apartadas, con actores públicos y privados.',
        estado: 'verificado',
        fuente: { nombre: 'Roche', url: 'https://www.roche.com/stories/cancer-care-colombia' },
      },
      {
        id: 'legado',
        marcasIds: ["bayer"],
        nombre: 'LEGADO 2026',
        pais: 'América Latina',
        marcas: 'Bayer Foundation, impulsado por Endeavor',
        descripcion: 'Programa de aceleración que seleccionó, entre otras, una startup colombiana de detección temprana de cáncer de mama sin radiación.',
        estado: 'verificado',
        fuente: { nombre: 'La Nota Económica', url: 'https://lanotaeconomica.com.co/?p=59960' },
      },
      {
        id: 'la-m-que-falta',
        marcasIds: ["daiichi-sankyo", "astrazeneca"],
        nombre: 'La M que Falta',
        pais: 'España',
        marcas: 'Asociación Española Cáncer de Mama Metastásico, con la Alianza Daiichi Sankyo | AstraZeneca',
        descripcion: 'Movimiento para visibilizar el cáncer de mama metastásico.',
        estado: 'verificado',
        fuente: { nombre: 'The Objective', url: 'https://theobjective.com/actualidad/2023-10-19/lamquefalta-cancer-mama-sol/' },
      },
    ],
  },
};

/** Lectura de umbrales actual, sin fijar cifras de una importación anterior. */
export function lecturaPresencia(labs, k) {
  const visibles = labs.filter(l => l.n != null && l.n >= k);
  const parte = visibles.length
    ? `${visibles.map(l => `${l.nombre} (${l.n})`).join(' y ')} ${visibles.length === 1 ? 'alcanza' : 'alcanzan'} el umbral de ${k}`
    : `Ningún laboratorio alcanza el umbral de ${k}`;
  return `${parte} en el periodo previo. Las cifras pequeñas siguen protegidas; no es una comparación de cuota de conversación.`;
}
