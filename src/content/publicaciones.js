// Publicaciones públicas verificadas por laboratorio (capítulo 05.1 y Explorar resultados › Benchmark).
//
// Es una selección curada, no un registro de menciones: no lleva huellas, sentimiento, métricas
// ni autores, y no se usa para ningún recuento. Las cifras por laboratorio siguen saliendo solo de
// resultados.json, con el umbral de privacidad.
//
// Cómo se agregan (nunca de forma automática):
//   1. `npm run sentione -- publicaciones entradas/exportacion.xlsx` deja candidatas en entradas/publicaciones/
//      (no se versiona): menciones relevantes que nombran a un laboratorio.
//   2. Se revisa cada candidata: el texto nombra explícitamente al laboratorio y trata cáncer de mama; el
//      emisor es el laboratorio, un medio o una institución (nunca una persona particular); la URL exacta
//      es de acceso público. Las réplicas de una misma nota se agrupan en una sola publicación.
//   3. Se describe en tercera persona, sin citas, y se agrega aquí con `verificacion`.
//   Las que no se pueden comprobar quedan pendientes en el informe privado, no en este archivo.
//
// Formato:
// {
//   id: 'medio-tema-aaaa-mm-dd',
//   laboratorios: ['astrazeneca'],                    // ids de src/config/marcas.js nombrados de forma explícita
//   emisor: 'laboratorio' | 'tercero',                 // laboratorio: comunicado, cuenta oficial o contenido de marca
//   formato: 'Noticia' | 'Reportaje' | 'Contenido de marca' | 'Comunicado' | 'Publicación oficial',
//   medio: 'Nombre del medio o de la institución',
//   pais: 'Colombia',
//   fecha: 'AAAA-MM-DD',                               // fecha de publicación
//   tema: 'diagnostico_temprano',                      // id de TEMAS (src/config/clasificacion.js)
//   descripcion: 'Síntesis breve en tercera persona, sin citas.',
//   url: 'https://…',
//   verificacion: { fecha: 'AAAA-MM-DD', metodo: 'indice-publico' | 'acceso-directo' },
// }

export const PUBLICACIONES = [
  {
    id: 'infobae-medicina-precision-2026-10-19',
    laboratorios: ['astrazeneca'],
    emisor: 'laboratorio',
    formato: 'Contenido de marca',
    medio: 'Infobae',
    pais: 'Argentina',
    fecha: '2026-10-19',
    tema: 'tratamiento',
    descripcion: 'La dirección médica de AstraZeneca Cono Sur explica cómo la medicina de precisión cambia el abordaje del cáncer de mama metastásico.',
    url: 'https://www.infobae.com/inhouse/2026/10/19/cancer-de-mama-metastasico-los-avances-cientificos-abren-oportunidades-para-vivir-mas-y-mejor/',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
  {
    id: 'eleconomista-biomarcadores-2026-10-08',
    laboratorios: ['daiichi-sankyo', 'astrazeneca'],
    emisor: 'tercero',
    formato: 'Noticia',
    medio: 'elEconomista',
    pais: 'España',
    fecha: '2026-10-08',
    tema: 'educacion',
    descripcion: 'Encuesta de la Asociación Española Cáncer de Mama Metastásico, con la colaboración de la Alianza Daiichi Sankyo–AstraZeneca, sobre el poco conocimiento de los biomarcadores entre las pacientes.',
    url: 'https://www.eleconomista.es/salud-bienestar/enfermedades/noticias/14019606/10/26/oncologos-y-pacientes-con-cancer-de-mama-metastasico-coinciden-solo-el-15-de-pacientes-de-cancer-de-mama-metastasico-afirma-saber-bien-que-son-los-biomarcadores.html',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
  {
    id: 'eltiempo-novartis-deteccion-2026-10-16',
    laboratorios: ['novartis'],
    emisor: 'laboratorio',
    formato: 'Contenido de marca',
    medio: 'El Tiempo',
    pais: 'Colombia',
    fecha: '2026-10-16',
    tema: 'diagnostico_temprano',
    descripcion: 'Contenido con respaldo de Novartis Colombia sobre la importancia de hacerse los controles de detección aunque no haya síntomas.',
    url: 'https://www.eltiempo.com/mas-contenido/el-cancer-de-mama-no-siempre-aparece-con-senales-por-que-el-diagnostico-temprano-sigue-siendo-clave-3594022',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
  {
    id: 'eltiempo-demoras-diagnostico-2026-10-20',
    laboratorios: ['daiichi-sankyo', 'astrazeneca'],
    emisor: 'tercero',
    formato: 'Reportaje',
    medio: 'El Tiempo',
    pais: 'Colombia',
    fecha: '2026-10-20',
    tema: 'barreras_atencion',
    descripcion: 'Reportaje sobre las demoras entre los síntomas y el tratamiento en Colombia, con datos citados por Daiichi Sankyo y dos herramientas del reto Innpacto Rosa, que apoyan AstraZeneca y Daiichi Sankyo.',
    url: 'https://www.eltiempo.com/salud/cancer-de-mama-en-colombia-nuevas-tecnologias-buscan-reducir-demoras-en-el-diagnostico-y-mejorar-la-atencion-de-pacientes-3594853',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
  {
    id: 'pharmatech-conjugados-solti-2026-10-14',
    laboratorios: ['menarini', 'pfizer', 'gilead', 'lilly', 'daiichi-sankyo', 'astrazeneca', 'novartis', 'msd'],
    emisor: 'tercero',
    formato: 'Noticia',
    medio: 'Pharmatech',
    pais: 'España',
    fecha: '2026-10-14',
    tema: 'tratamiento',
    descripcion: 'Crónica de una jornada científica del grupo SOLTI sobre fármacos conjugados en cáncer de mama, en la que los laboratorios figuran como aliados o colaboradores del encuentro.',
    url: 'https://www.pharmatech.es/noticias/20261014/-farmacos-conjugados-avanzan-hacia-estadios-precoces-redefinen-tratamiento-cancer-mama-en-castilla-leon',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
  {
    id: 'clevel-legado-2026-10-07',
    laboratorios: ['bayer'],
    emisor: 'tercero',
    formato: 'Noticia',
    medio: 'Revista C-Level',
    pais: 'Colombia',
    fecha: '2026-10-07',
    tema: 'diagnostico_temprano',
    descripcion: 'Dos startups colombianas entran en LEGADO 2026, programa de Bayer Foundation impulsado por Endeavor; una de ellas amplía la detección temprana del cáncer de mama sin radiación.',
    url: 'https://revistaclevel.com/arkangel-ai-y-bexa-latam-entran-legado-2026-entre-625-postulaciones',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
  {
    id: 'expansion-mastografias-ia-2026-10-08',
    laboratorios: ['roche'],
    emisor: 'tercero',
    formato: 'Reportaje',
    medio: 'Expansión Política',
    pais: 'México',
    fecha: '2026-10-08',
    tema: 'mamografias',
    descripcion: 'Reportaje sobre las mastografías asistidas por inteligencia artificial en Quintana Roo, fruto de una alianza entre la Secretaría de Salud del estado y Roche.',
    url: 'https://politica.expansion.mx/mexico/2026/10/08/quintana-roo-inteligencia-artificial-acceso-salud',
    verificacion: { fecha: '2026-10-22', metodo: 'indice-publico' },
  },
];
