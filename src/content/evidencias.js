// Evidencias verificadas del impacto (noticias, publicaciones, contenidos de creadores).
// Agrega solo enlaces revisados. No incluyas datos personales de particulares:
// para cuentas personales usa `autor: null` y describe el contenido.
//
// Formato de cada evidencia:
// {
//   id: 'medio-ejemplo-2026-10-25',        // único
//   tipo: 'medio' | 'publicacion' | 'creador',
//   fecha: '2026-10-25',
//   titulo: 'Titular o descripción breve',
//   fuente: 'Nombre del medio o de la cuenta pública',
//   plataforma: 'web' | 'instagram' | 'tiktok' | 'x' | 'facebook' | 'video',
//   url: 'https://…',
//   marcas: ['msd'],                        // marcas mencionadas de forma explícita
//   verificado: true,                       // obligatorio: solo se muestran las verificadas
// }

// Dos publicaciones de una marca de medio. Descripciones editoriales, no titulares
// de prensa atribuidos. Contenido y fecha cotejados en la exportación aportada.
export const evidencias = [
  { id: 'besame-instagram-2026-10-25', tipo: 'publicacion', fecha: '2026-10-25',
    titulo: 'El mensaje de prevención de Fonseca y El Viaje de la Vida', fuente: 'Bésame Radio 97.4', plataforma: 'instagram',
    url: 'https://www.instagram.com/reel/De7QuG3sv-9/', marcas: ['el-viaje-de-la-vida', 'fonseca'], verificado: true },
  { id: 'besame-facebook-2026-10-25', tipo: 'publicacion', fecha: '2026-10-25',
    titulo: 'Difusión del mensaje de prevención del concierto', fuente: 'Bésame Radio Colombia', plataforma: 'facebook',
    url: 'https://www.facebook.com/reel/1488426926527256/', marcas: ['el-viaje-de-la-vida', 'fonseca'], verificado: true },
];
