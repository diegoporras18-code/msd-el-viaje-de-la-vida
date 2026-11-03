// Resultados del panel de Bésame aportado por el cliente. No son métricas de
// la consulta temática de SentiOne ni un conteo de personas únicas.
export const resultadosCampana = {
  desde: '2026-10-24',
  publicacionBesame: '2026-10-25',
  asistencia: {
    minimoReportado: 30000,
    fuente: 'Registro audiovisual del concierto',
  },
  referencias: 28,
  besame: {
    capturas: [], // Archivos originales, cuando estén disponibles para publicarlos.
    facebook: {
      visualizaciones: 1144,
      visualizacionesAproximadas: false,
      espectadoresAproximados: 1000,
      interacciones: 33,
      reacciones: 18,
      clics: 7,
      compartidos: 1,
      guardados: 1,
      comentarios: 0,
    },
    // Print actualizado: 475 + 14 + 50 + 22 + 14 = 575 acciones visibles.
    instagram: {
      visualizaciones: 8500,
      visualizacionesAproximadas: true,
      interacciones: 575,
      fuenteInteracciones: 'suma_acciones_visibles_print_actualizado',
      meGusta: 475,
      republicaciones: 50,
      compartidos: 22,
      guardados: 14,
      comentarios: 14,
    },
    tiktok: {
      visualizaciones: null,
      interacciones: null,
      meGusta: null,
      comentarios: null,
      compartidos: null,
      guardados: null,
      estadoMetricas: 'por_verificar',
    },
    audiencia: {
      cobertura: 'Perfil general de Facebook, Instagram y TikTok',
      fuenteCobertura: 'aclaracion_usuario',
      genero: [
        { nombre: 'Mujeres', valor: 73 },
        { nombre: 'Hombres', valor: 26 },
        { nombre: 'Sin identificar', valor: 1 },
      ],
      edades: [
        { nombre: '35–44 años', valor: 27.3 },
        { nombre: '45–54 años', valor: 22.2 },
        { nombre: '55–64 años', valor: 20.6 },
        { nombre: 'Otras edades', valor: 29.9 },
      ],
      paises: [
        { nombre: 'Colombia', valor: 81.6 },
        { nombre: 'Estados Unidos', valor: 3.7 },
        { nombre: 'México', valor: 1.9 },
        { nombre: 'Otros países', valor: 12.8 },
      ],
      seguidores: [
        { nombre: 'Seguidores', valor: 76 },
        { nombre: 'No seguidores', valor: 24 },
      ],
    },
    enlaces: [
      {
        nombre: 'Video de Bésame en TikTok',
        url: 'https://www.tiktok.com/@besamecolombia/video/7700662006419950869',
      },
      {
        nombre: 'Reel de Bésame en Instagram',
        url: 'https://www.instagram.com/reel/De7QuG3sv-9/',
      },
      {
        nombre: 'Reel de Bésame en Facebook',
        url: 'https://www.facebook.com/reel/1488426926527256/',
      },
    ],
  },
};
export function consolidarBesame(datos = resultadosCampana.besame) {
  const redes = ['facebook', 'instagram', 'tiktok'].filter((id) => datos[id]);
  const conocidas = (campo) =>
    redes.filter((id) => Number.isFinite(datos[id][campo]));
  const suma = (campo) =>
    conocidas(campo).reduce((n, id) => n + datos[id][campo], 0);
  return {
    visualizaciones: suma('visualizaciones'),
    visualizacionesAproximadas: conocidas('visualizaciones').some(
      (id) => datos[id].visualizacionesAproximadas,
    ),
    redesVisualizaciones: conocidas('visualizaciones'),
    redesInteracciones: conocidas('interacciones'),
    redesSinMetricas: redes.filter(
      (id) =>
        !Number.isFinite(datos[id].visualizaciones) ||
        !Number.isFinite(datos[id].interacciones),
    ),
    interacciones: suma('interacciones'),
    compartidos: suma('compartidos'),
    guardados: suma('guardados'),
    comentarios: suma('comentarios'),
    reaccionesYMeGusta:
      (datos.facebook?.reacciones ?? 0) +
      (datos.instagram?.meGusta ?? 0) +
      (datos.tiktok?.meGusta ?? 0),
    personasUnicas: null,
    demografiaConsolidada: datos.audiencia,
  };
}
export const nombresRedesBesame = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};
export const textoRedesBesame = (ids) =>
  ids.map((id) => nombresRedesBesame[id]).join(' + ');
export const resumenBesame = consolidarBesame();
export const cifraVisualizaciones = `${resumenBesame.visualizacionesAproximadas ? '≈' : ''}${(resumenBesame.visualizaciones / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} mil`;
export const conclusionesCampana = [
  {
    id: 'escenario',
    cifra: 'Más de 30.000',
    unidad: 'asistentes reportados en el concierto',
    titulo: 'La causa tuvo una voz cercana',
    observamos:
      'Fonseca habló de cáncer de mama y de la importancia de revisarse a tiempo ante el público del concierto.',
    significa:
      'La música abrió un espacio de atención para un mensaje de cuidado y concientización.',
    recomendamos:
      'Acompañar cada intervención del artista con un llamado concreto: informarse, compartir el mensaje o consultar ante un cambio.',
  },
  {
    id: 'amplificacion',
    cifra: cifraVisualizaciones,
    unidad: `visualizaciones en ${textoRedesBesame(resumenBesame.redesVisualizaciones)}`,
    titulo: 'El mensaje continuó con Bésame',
    observamos: `Las cifras verificadas de ${textoRedesBesame(resumenBesame.redesInteracciones)} suman ${resumenBesame.interacciones} interacciones registradas. El perfil general de las tres redes muestra una audiencia mayoritariamente femenina y concentrada en Colombia.`,
    significa:
      'La amplificación conectó el mensaje con un entorno afín a la campaña y prolongó su exposición más allá del escenario.',
    recomendamos:
      'Coordinar nuevas piezas con Bésame, el artista y los aliados, adaptadas a las preguntas y hábitos de esa audiencia.',
  },
  {
    id: 'accion',
    cifra: '23',
    unidad: 'veces que se compartió el contenido',
    titulo: 'De la atención a la participación',
    observamos:
      'El contenido se compartió y guardó; las reacciones también abrieron preguntas sobre la atención en salud.',
    significa:
      'Hay una oportunidad para convertir el interés en conversaciones útiles y orientación accesible.',
    recomendamos:
      'Usar preguntas para comentar, invitaciones a compartir y un enlace o QR hacia información confiable. Medir comentarios, clics y consultas, además de visualizaciones.',
  },
];
