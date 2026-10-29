// Capítulo 05 · Benchmark competitivo. Las métricas salen de la misma base maestra.
// Las referencias públicas de campañas son contexto de investigación, no métricas.

export const benchmark = {
  capitulo: 'Capítulo 05 · Benchmark competitivo',
  titulo: { linea1: 'La conversación también', linea2: 'construye posicionamiento' },
  texto: 'Qué laboratorios aparecen en la conversación sobre cáncer de mama y de qué se habla cuando aparecen. Es presencia en esta consulta, no un Share of Voice.',
  escena: {
    kicker: 'Laboratorios en la conversación',
    titulo: { linea1: 'Cómo hablan los laboratorios', linea2: 'sobre cáncer de mama' },
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
      oportunidad: 'Dar continuidad al mensaje del concierto con información útil y contenidos fáciles de compartir.',
    },
    {
      id: 'temas',
      observamos: 'Las publicaciones muestran distintas formas de hablar de detección temprana, atención y acompañamiento.',
      significa: 'Los ejemplos permiten reconocer mensajes y formatos que pueden ser útiles para MSD.',
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
    aviso: 'Campañas e iniciativas documentadas para inspirar la comunicación de MSD. Estos ejemplos no representan volumen de menciones ni un ranking de laboratorios.',
    items: [
      {
        id: 'novartis-deteccion-2026', marcasIds: ['novartis'], nombre: 'Controles incluso sin síntomas',
        pais: 'Colombia', marcas: 'Novartis',
        descripcion: 'Educación sobre detección temprana y consulta oportuna. Contenido de marca publicado con apoyo declarado de Novartis; no se presenta como prensa independiente.',
        estado: 'verificado', fuente: { nombre: 'Semana · Hablan las marcas', url: 'https://www.semana.com/hablan-las-marcas/articulo/el-cancer-de-mama-puede-desarrollarse-sin-sintomas-visibles-la-importancia-de-la-deteccion-temprana/202600/' },
      },
      {
        id: 'pfizer-bienestar-2026', marcasIds: ['pfizer'], nombre: 'Salud sexual y bienestar integral',
        pais: 'España', marcas: 'Pfizer',
        descripcion: 'Corresponsables difunde una iniciativa documental de Pfizer para abrir la conversación sobre salud sexual en mujeres con cáncer de mama metastásico.',
        estado: 'verificado', fuente: { nombre: 'Publicación de Corresponsables', url: 'https://twitter.com/Corresponsables/status/2107757195496509862' },
      },
      {
        id: 'msd-matices-2026', marcasIds: ['msd'], nombre: 'Matices que importan',
        pais: 'España', marcas: 'MSD',
        descripcion: 'Activación de concientización en el Metro de Madrid que reconoce distintos diagnósticos y experiencias. Es otra campaña de MSD, distinta de El Viaje de la Vida.',
        estado: 'verificado', fuente: { nombre: 'Publicación de MSD España', url: 'https://twitter.com/MSDEspana/status/2109909516460421423' },
      },
      {
        id: 'innpacto-rosa',
        marcasIds: ["astrazeneca", "daiichi-sankyo"],
        nombre: 'Innpacto Rosa',
        pais: 'Colombia',
        marcas: 'AstraZeneca y Daiichi Sankyo, con la Pontificia Universidad Javeriana',
        descripcion: 'Convocatoria de proyectos para mejorar la atención de pacientes con cáncer de mama.',
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

/** El acceso editorial depende de fuentes verificadas, nunca del umbral estadístico. */
export function referenciasBenchmark(laboratorio = 'todas') {
  return benchmark.referencias.items.filter(r => r.estado === 'verificado'
    && (laboratorio === 'todas' || r.marcasIds?.includes(laboratorio)));
}

export function laboratoriosConReferencias(laboratorios) {
  const referencias = referenciasBenchmark();
  return laboratorios.filter(l => referencias.some(r => r.marcasIds?.includes(l.id)));
}

/** Lectura de umbrales actual, sin fijar cifras de una importación anterior. */
export function lecturaPresencia(labs, k) {
  const visibles = labs.filter(l => l.n != null && l.n >= k);
  const parte = visibles.length
    ? `${visibles.map(l => `${l.nombre} (${l.n})`).join(' y ')} ${visibles.length === 1 ? 'alcanza' : 'alcanzan'} el umbral de ${k}`
    : `Ningún laboratorio alcanza el umbral de ${k}`;
  return `${parte} en el periodo previo. Las cifras pequeñas siguen protegidas; no es una comparación de cuota de conversación.`;
}
