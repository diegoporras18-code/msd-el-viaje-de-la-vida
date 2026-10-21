// Diccionarios editables para normalizar y SUGERIR clasificaciones.
// Todo lo que sale de estas reglas se marca como «sugerido»: nunca como validado.
// Los patrones se comparan sin tildes y en minúsculas, al inicio de palabra
// (p. ej. 'mamograf' encuentra «mamografía» y «mamografías»).

export const PLATAFORMAS = [
  { id: 'video', nombre: 'Video', patrones: ['video', 'youtube', 'vimeo', 'twitch'] },
  { id: 'facebook', nombre: 'Facebook', patrones: ['facebook', 'fb.com'] },
  { id: 'web', nombre: 'Sitios web', patrones: ['web', 'news', 'noticia', 'sitio', 'portal', 'article', 'articulo', 'prensa', 'online'] },
  { id: 'x', nombre: 'X', patrones: ['x', 'twitter', 'x.com', 'tweet'] },
  { id: 'tiktok', nombre: 'TikTok', patrones: ['tiktok'] },
  { id: 'instagram', nombre: 'Instagram', patrones: ['instagram', 'ig'] },
  { id: 'blogs', nombre: 'Blogs', patrones: ['blog'] },
  { id: 'foros', nombre: 'Foros', patrones: ['forum', 'foro', 'reddit', 'review'] },
  { id: 'podcast', nombre: 'Podcast y radio', patrones: ['podcast', 'radio', 'audio'] },
  { id: 'otros', nombre: 'Otras fuentes', patrones: [] },
];

export const SENTIMIENTOS = [
  { id: 'positivo', nombre: 'Positivo', color: '#6FD3C1', patrones: ['positive', 'positivo', 'pos'] },
  { id: 'neutral', nombre: 'Neutral', color: '#C9B3C0', patrones: ['neutral', 'neutro', 'neu'] },
  { id: 'negativo', nombre: 'Negativo', color: '#E8916B', patrones: ['negative', 'negativo', 'neg'] },
  { id: 'sin_clasificar', nombre: 'Sin clasificar', color: '#5E4457', patrones: [] },
];

// Narrativas (una publicación puede tener varias).
export const NARRATIVAS = [
  {
    id: 'prevencion',
    nombre: 'Prevención y detección temprana',
    patrones: ['autoexamen', 'autoexplora', 'mamograf', 'deteccion temprana', 'detectar a tiempo', 'chequeo', 'prevenir', 'prevencion', 'tamizaje', 'ecografia mamaria', 'tocate'],
  },
  {
    id: 'testimonios',
    nombre: 'Testimonios',
    patrones: ['mi historia', 'sobrevivi', 'me diagnosticaron', 'mi diagnostico', 'mi mama tuvo', 'mi madre', 'mi lucha', 'mi tratamiento', 'supere el cancer', 'mi quimio'],
  },
  {
    id: 'acceso',
    nombre: 'Dificultades de acceso',
    patrones: ['eps', 'autorizacion', 'demora', 'tutela', 'no me han', 'sin cita', 'barrera', 'acceso a', 'negaron', 'falta de medicamento', 'lista de espera'],
  },
  {
    id: 'avances',
    nombre: 'Avances médicos',
    patrones: ['ensayo clinico', 'investigacion', 'nuevo tratamiento', 'terapia dirigida', 'inmunoterapia', 'aprobacion', 'fda', 'invima', 'avance', 'estudio clinico'],
  },
  {
    id: 'concientizacion',
    nombre: 'Concientización y Octubre Rosa',
    patrones: ['octubre rosa', 'lazo rosa', 'mes rosa', 'concientiza', 'dia mundial', 'dia internacional'],
  },
  {
    id: 'evento',
    nombre: 'Concierto y campaña',
    patrones: ['fonseca', 'concierto', 'el viaje de la vida', 'viajedelavida'],
  },
];

export const EMOCIONES = [
  { id: 'esperanza', nombre: 'Esperanza', patrones: ['esperanza', 'fuerza', 'animo', 'si se puede', 'fe en dios'] },
  { id: 'gratitud', nombre: 'Gratitud', patrones: ['gracias', 'agradec', 'bendicion'] },
  { id: 'orgullo', nombre: 'Orgullo', patrones: ['orgull', 'valiente', 'guerrera', 'admiracion'] },
  { id: 'miedo', nombre: 'Miedo', patrones: ['miedo', 'temor', 'susto', 'angustia', 'ansiedad'] },
  { id: 'tristeza', nombre: 'Tristeza', patrones: ['triste', 'dolor', 'fallecio', 'partio', 'luto', 'extrano'] },
  { id: 'indignacion', nombre: 'Indignación', patrones: ['indign', 'injusticia', 'verguenza', 'abandono', 'inaceptable'] },
];

// Señales de intención preventiva (llamados o decisiones de acción).
export const INTENCION_PREVENTIVA = [
  'me voy a hacer', 'me hare', 'agende', 'agendar', 'pedi cita', 'pedir cita', 'sacar cita', 'hazte', 'tocate', 'revisa tus senos',
  'autoexamen', 'mamograf', 'consulta a tu medico', 've al medico', 'chequeate',
];

// Pistas de sentimiento SUGERIDO. Las palabras de la enfermedad (cáncer, diagnóstico,
// muerte, tumor…) NO cuentan: un mensaje educativo no es negativo por mencionarlas.
export const PISTAS_SENTIMIENTO = {
  positivo: ['gracias', 'felicit', 'orgull', 'esperanza', 'sobrevivi', 'excelente', 'maravillos', 'hermosa iniciativa', 'bonita iniciativa', 'apoyo total'],
  negativo: ['negaron', 'no me atienden', 'demora', 'verguenza', 'indignante', 'abandono', 'pesimo', 'mal servicio', 'no hay citas', 'queja', 'inaceptable'],
};

// Entidades detectadas por palabra clave (marcas, artista, agencia).
// `marca` enlaza con el universo del mismo id en src/config/universos.js.
export const ENTIDADES = [
  { id: 'msd', nombre: 'MSD', marca: true, patrones: ['msd', 'merck sharp', '#msd'] },
  { id: 'daiichi-sankyo', nombre: 'Daiichi Sankyo', marca: true, patrones: ['daiichi'] },
  { id: 'astrazeneca', nombre: 'AstraZeneca', marca: true, patrones: ['astrazeneca', 'astra zeneca'] },
  { id: 'fonseca', nombre: 'Fonseca', marca: false, patrones: ['fonseca'] },
  { id: 'lotengo', nombre: 'Lotengo', marca: false, patrones: ['lotengo'] },
];

// Vocabulario controlado de palabras clave: solo se publican conteos de estos términos,
// nunca palabras libres extraídas de los textos.
export const PALABRAS_CLAVE = [
  { id: 'mamografia', nombre: 'mamografía', patrones: ['mamograf'] },
  { id: 'autoexamen', nombre: 'autoexamen', patrones: ['autoexamen', 'autoexplora', 'tocate'] },
  { id: 'deteccion', nombre: 'detección temprana', patrones: ['deteccion temprana', 'detectar a tiempo', 'diagnostico temprano'] },
  { id: 'prevencion', nombre: 'prevención', patrones: ['prevencion', 'prevenir'] },
  { id: 'diagnostico', nombre: 'diagnóstico', patrones: ['diagnostic'] },
  { id: 'tratamiento', nombre: 'tratamiento', patrones: ['tratamiento', 'quimio', 'radioterapia', 'cirugia'] },
  { id: 'metastasis', nombre: 'metástasis', patrones: ['metasta'] },
  { id: 'eps', nombre: 'EPS', patrones: ['eps'] },
  { id: 'sobreviviente', nombre: 'sobreviviente', patrones: ['sobrevivi'] },
  { id: 'octubre-rosa', nombre: 'Octubre Rosa', patrones: ['octubre rosa'] },
  { id: 'fonseca', nombre: 'Fonseca', patrones: ['fonseca'] },
  { id: 'concierto', nombre: 'concierto', patrones: ['concierto'] },
];

export const RELACIONES = [
  { id: 'msd', nombre: 'Atribuible a MSD' },
  { id: 'competencia', nombre: 'Menciona competidores' },
  { id: 'categoria', nombre: 'Categoría general' },
];

export const nombrePlataforma = (id) => PLATAFORMAS.find((p) => p.id === id)?.nombre ?? id;
export const nombreNarrativa = (id) => NARRATIVAS.find((n) => n.id === id)?.nombre ?? id;
export const nombreEmocion = (id) => EMOCIONES.find((n) => n.id === id)?.nombre ?? id;
export const nombreSentimiento = (id) => SENTIMIENTOS.find((s) => s.id === id)?.nombre ?? id;
