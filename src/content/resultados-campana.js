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
    instagram: {
      visualizaciones: 8500,
      visualizacionesAproximadas: true,
      interacciones: 554,
      meGusta: 455,
      compartidos: 22,
      guardados: 14,
      comentarios: 14,
    },
    audiencia: {
      cobertura: 'Perfil reportado en el panel de Facebook',
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
  const { facebook: f, instagram: i } = datos;
  return {
    visualizaciones: f.visualizaciones + i.visualizaciones,
    visualizacionesAproximadas:
      f.visualizacionesAproximadas || i.visualizacionesAproximadas,
    interacciones: f.interacciones + i.interacciones,
    compartidos: f.compartidos + i.compartidos,
    guardados: f.guardados + i.guardados,
    comentarios: f.comentarios + i.comentarios,
    reaccionesYMeGusta: f.reacciones + i.meGusta,
    personasUnicas: null,
    demografiaConsolidada: null,
  };
}
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
    cifra: '≈9,6 mil',
    unidad: 'visualizaciones entre Facebook e Instagram',
    titulo: 'El mensaje continuó con Bésame',
    observamos:
      'La publicación en las dos redes sumó 587 interacciones reportadas. El panel de Facebook muestra una audiencia mayoritariamente femenina y concentrada en Colombia.',
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
