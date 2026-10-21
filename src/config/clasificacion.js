// Taxonomía de la clasificación semántica (la aplica Claude en cada actualización).
// Los criterios completos están en datos/CRITERIOS_CLASIFICACION.md. Si cambias
// categorías o criterios, sube CRITERIOS_VERSION: los registros con otra versión
// se pueden reclasificar de forma controlada.

export const CRITERIOS_VERSION = 'v1';

export const PLATAFORMAS = [
  { id: 'video', nombre: 'Video', patrones: ['video', 'youtube', 'vimeo', 'twitch'] },
  { id: 'facebook', nombre: 'Facebook', patrones: ['facebook', 'fb.com'] },
  { id: 'web', nombre: 'Sitios web', patrones: ['web', 'websites', 'website', 'news', 'noticia', 'sitio', 'portal', 'article', 'articulo', 'prensa', 'online'] },
  { id: 'x', nombre: 'X', patrones: ['x', 'twitter', 'x.com', 'tweet'] },
  { id: 'tiktok', nombre: 'TikTok', patrones: ['tiktok'] },
  { id: 'instagram', nombre: 'Instagram', patrones: ['instagram', 'ig'] },
  { id: 'blogs', nombre: 'Blogs', patrones: ['blog'] },
  { id: 'foros', nombre: 'Foros', patrones: ['forum', 'foro', 'reddit', 'review'] },
  { id: 'podcast', nombre: 'Podcast y radio', patrones: ['podcast', 'radio', 'audio'] },
  { id: 'otros', nombre: 'Otras fuentes', patrones: [] },
];

// Sentimiento original de SentiOne: se conserva como referencia, sin modificar.
export const SENTIMIENTOS_ORIGINALES = [
  { id: 'positivo', nombre: 'Positivo', color: '#6FD3C1', patrones: ['positive', 'positivo', 'pos'] },
  { id: 'neutral', nombre: 'Neutral', color: '#C9B3C0', patrones: ['neutral', 'neutro', 'neu'] },
  { id: 'negativo', nombre: 'Negativo', color: '#E8916B', patrones: ['negative', 'negativo', 'neg'] },
  { id: 'sin_clasificar', nombre: 'Sin clasificar', color: '#5E4457', patrones: [] },
];

// Sentimiento revisado por contenido.
export const SENTIMIENTOS = [
  { id: 'positivo', nombre: 'Positivo', color: '#6FD3C1' },
  { id: 'neutral', nombre: 'Neutral', color: '#C9B3C0' },
  { id: 'negativo', nombre: 'Negativo', color: '#E8916B' },
  { id: 'mixto', nombre: 'Mixto', color: '#F2C46D' },
  { id: 'indeterminado', nombre: 'Indeterminado', color: '#7A5C70' },
];

// Sentimiento hacia un objeto concreto (MSD o la campaña; el sistema de salud).
export const HACIA = ['positivo', 'neutral', 'negativo', 'mixto', 'no_aplica'];

export const RELEVANCIA = [
  { id: 'si', nombre: 'Habla de cáncer de mama' },
  { id: 'dudosa', nombre: 'Relación dudosa' },
  { id: 'no', nombre: 'Coincidencia ajena al tema' },
];

export const TEMAS = [
  { id: 'educacion', nombre: 'Educación' },
  { id: 'concientizacion', nombre: 'Concientización' },
  { id: 'prevencion', nombre: 'Prevención' },
  { id: 'mamografias', nombre: 'Mamografías' },
  { id: 'diagnostico_temprano', nombre: 'Diagnóstico temprano' },
  { id: 'tratamiento', nombre: 'Tratamiento' },
  { id: 'barreras_atencion', nombre: 'Barreras de atención' },
  { id: 'acceso_sistema_salud', nombre: 'Acceso al sistema de salud' },
  { id: 'innovacion_medica', nombre: 'Innovación médica' },
  { id: 'historias_pacientes', nombre: 'Historias de pacientes' },
  { id: 'apoyo_emocional', nombre: 'Apoyo emocional' },
  { id: 'campanas', nombre: 'Campañas' },
  { id: 'noticias', nombre: 'Noticias' },
  { id: 'otros', nombre: 'Otras temáticas' },
];

export const EMOCIONES = [
  { id: 'esperanza', nombre: 'Esperanza' },
  { id: 'miedo', nombre: 'Miedo' },
  { id: 'tristeza', nombre: 'Tristeza' },
  { id: 'indignacion', nombre: 'Indignación' },
  { id: 'solidaridad', nombre: 'Solidaridad' },
  { id: 'gratitud', nombre: 'Gratitud' },
  { id: 'alegria', nombre: 'Alegría' },
  { id: 'no_identificable', nombre: 'No identificable' },
];

export const INTENCIONES = [
  { id: 'buscar_informacion', nombre: 'Buscar información' },
  { id: 'consultar_medico', nombre: 'Consultar al médico' },
  { id: 'mamografia_indicada', nombre: 'Hacerse una mamografía cuando esté indicada' },
  { id: 'compartir_informacion', nombre: 'Compartir información' },
  { id: 'apoyar_paciente', nombre: 'Apoyar a una paciente' },
  { id: 'solicitar_atencion', nombre: 'Solicitar atención' },
  { id: 'ninguna', nombre: 'Ninguna intención explícita' },
];

// Por debajo de esta confianza, el registro queda marcado para revisión.
export const CONFIANZA_MINIMA = 0.6;

const nombre = (lista) => (id) => lista.find((x) => x.id === id)?.nombre ?? id;
export const nombrePlataforma = nombre(PLATAFORMAS);
export const nombreTema = nombre(TEMAS);
export const nombreEmocion = nombre(EMOCIONES);
export const nombreIntencion = nombre(INTENCIONES);
