// Contenido editable de la Sección 2 · Una realidad que no podemos ignorar.
//
// IMPORTANTE sobre las cifras: son ESTIMACIONES de GLOBOCAN 2022 (IARC/OMS)
// para Colombia, tal como las publica el Global Cancer Observatory.
// No son conteos observados de 2026. Si se actualizan, cambia también `fuente`.

export const realidad = {
  capitulo: 'Capítulo 01',
  titulo: {
    linea1: 'Una realidad que',
    linea2: 'no podemos ignorar', // se muestra en cursiva
  },
  entradilla:
    'En Colombia, el cáncer de mama es el cáncer más frecuente entre las mujeres. Detrás de cada cifra hay una historia, una familia y un camino que empieza mucho antes del diagnóstico.',
  cuerpo: [
    'Hablar de cáncer de mama es hablar de tiempo. Cuando la información llega a tiempo, cuando una mamografía está al alcance y cuando la atención no se detiene, el camino puede ser otro.',
    'Estas son las dimensiones del reto, según las estimaciones internacionales más recientes para el país.',
  ],

  cifras: [
    {
      id: 'incidencia',
      valor: 17739,
      etiqueta: 'nuevos casos al año',
      detalle: 'Estimación anual de nuevos diagnósticos de cáncer de mama en Colombia.',
    },
    {
      id: 'mortalidad',
      valor: 4773,
      etiqueta: 'muertes al año',
      detalle: 'Estimación anual de muertes por cáncer de mama en Colombia.',
    },
    {
      id: 'prevalencia',
      valor: 53057,
      etiqueta: 'casos prevalentes a cinco años',
      detalle: 'Personas vivas diagnosticadas en los cinco años anteriores, según la estimación.',
    },
  ],

  aviso:
    'Cifras estimadas, no conteos observados de 2026. Corresponden a las estimaciones de GLOBOCAN 2022 para Colombia.',
  fuente: {
    texto: 'Fuente: GLOBOCAN 2022 · Global Cancer Observatory, Agencia Internacional de Investigación sobre el Cáncer (IARC/OMS).',
    url: 'https://gco.iarc.who.int/today/en/fact-sheets-populations/170/colombia',
  },

  ruta: {
    titulo: 'El camino tiene obstáculos',
    entradilla: 'Entre la primera señal y la atención oportuna aparecen barreras que alargan el viaje.',
    inicio: 'Primera señal',
    destino: 'Atención oportuna',
    descripcionGrafico:
      'Ilustración de una ruta sinuosa desde la primera señal hasta la atención oportuna, interrumpida por cuatro barreras. Al final, la ruta se transforma en una línea recta.',
    barreras: [
      {
        id: 'informacion',
        titulo: 'Falta de información',
        texto: 'No conocer los signos de alarma ni la importancia de la detección temprana retrasa el primer paso.',
      },
      {
        id: 'mamografias',
        titulo: 'Acceso a mamografías',
        texto: 'Conseguir una cita, una orden o un equipo disponible puede convertirse en la primera espera.',
      },
      {
        id: 'geografia',
        titulo: 'Barreras geográficas',
        texto: 'La distancia hasta los centros especializados suma horas de viaje, costos y días sin trabajar.',
      },
      {
        id: 'retrasos',
        titulo: 'Retrasos en la atención',
        texto: 'Entre resultados, autorizaciones y tratamiento, cada pausa es tiempo que el cuerpo no tiene.',
      },
    ],
    cierre: 'Cada barrera que se elimina acorta el viaje.',
  },
};
