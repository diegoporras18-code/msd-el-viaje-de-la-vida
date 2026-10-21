// Contenido editable de la Sección 2 · Una realidad que no podemos ignorar.
//
// IMPORTANTE sobre las cifras: son ESTIMACIONES de GLOBOCAN 2024 (IARC/OMS)
// para Colombia, ambos sexos, tal como las publica el Global Cancer Observatory
// (ficha de Colombia, "Statistics at a glance, 2024").
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
    'Cifras estimadas, no conteos observados de 2026. Corresponden a las estimaciones de GLOBOCAN 2024 para Colombia (ambos sexos).',
  fuente: {
    texto: 'Fuente: GLOBOCAN 2024 · Global Cancer Observatory, Agencia Internacional de Investigación sobre el Cáncer (IARC/OMS).',
    url: 'https://gco.iarc.who.int/today/en/fact-sheets-populations/170/colombia',
  },

  // Recorrido ilustrativo: etapas de la atención y obstáculos que pueden aparecer en ellas.
  // Las etapas NO son barreras. Cada obstáculo indica después de qué etapa aparece
  // (`despuesDe`) y su `forma` en la animación: bucle | zigzag | desvio | retroceso | espera.
  ruta: {
    eyebrow: 'El recorrido',
    titulo: {
      linea1: 'Detectar a tiempo no debería ser',
      linea2: 'un camino lleno de obstáculos',
    },
    subtitulo:
      'Para muchas mujeres, las dificultades comienzan con la falta de información y continúan con las barreras para acceder a un diagnóstico y tratamiento oportunos.',
    matiz: 'Los obstáculos pueden aparecer en distintos momentos y no afectan a todas las mujeres de la misma manera.',
    leyenda: {
      oportuna: 'Ruta de atención oportuna',
      obstaculos: 'Recorrido con obstáculos',
      nota: 'Ilustración: los trazos no representan tiempos ni distancias reales.',
    },
    pista: 'Desliza para recorrer el camino.',
    descripcionGrafico:
      'Ilustración de dos recorridos. A la izquierda, la ruta de atención oportuna avanza en línea recta por cinco etapas: educación y concientización, prevención y detección temprana, acceso a servicios médicos, diagnóstico oportuno, y tratamiento y continuidad. A la derecha, el recorrido con obstáculos pasa por las mismas etapas, pero se desvía, retrocede o se detiene por información insuficiente, dificultades administrativas, distancias, costos y demoras.',
    etapas: [
      {
        id: 'educacion',
        nombre: 'Educación y concientización',
        texto: 'Conocer los riesgos, reconocer señales de alerta y comprender la importancia de los controles preventivos.',
      },
      {
        id: 'deteccion',
        nombre: 'Prevención y detección temprana',
        texto: 'Acceder al tamizaje recomendado según edad y riesgo, incluso antes de presentar síntomas.',
      },
      {
        id: 'acceso',
        nombre: 'Acceso a servicios médicos',
        texto: 'Conseguir valoraciones, citas y exámenes cuando se requieren.',
      },
      {
        id: 'diagnostico',
        nombre: 'Diagnóstico oportuno',
        texto: 'Recibir resultados, confirmación diagnóstica y orientación sin retrasos innecesarios.',
      },
      {
        id: 'tratamiento',
        nombre: 'Tratamiento y continuidad',
        texto: 'Iniciar y mantener la atención indicada oportunamente.',
      },
    ],
    obstaculos: [
      {
        id: 'informacion',
        nombre: 'Información insuficiente',
        corto: 'Información',
        despuesDe: 'educacion',
        forma: 'bucle',
        texto: 'Sin información clara sobre riesgos y señales de alerta, la primera consulta puede postergarse: el recorrido da vueltas antes de empezar.',
      },
      {
        id: 'administrativas',
        nombre: 'Dificultades administrativas',
        corto: 'Trámites',
        despuesDe: 'deteccion',
        forma: 'zigzag',
        texto: 'Órdenes, autorizaciones y asignación de citas pueden convertir cada paso en una sucesión de idas y vueltas.',
      },
      {
        id: 'distancias',
        nombre: 'Distancias',
        corto: 'Distancias',
        despuesDe: 'acceso',
        forma: 'desvio',
        texto: 'Vivir lejos de los servicios especializados obliga a traslados largos y a más tiempo fuera de casa o del trabajo.',
      },
      {
        id: 'costos',
        nombre: 'Costos',
        corto: 'Costos',
        despuesDe: 'acceso',
        forma: 'retroceso',
        texto: 'Transporte, alojamiento y días sin trabajar suman gastos que pueden obligar a aplazar una cita.',
      },
      {
        id: 'demoras',
        nombre: 'Demoras',
        corto: 'Demoras',
        despuesDe: 'diagnostico',
        forma: 'espera',
        texto: 'Las esperas entre resultados, confirmación diagnóstica e inicio del tratamiento pueden retrasar la atención.',
      },
    ],
    cierre: {
      linea1: 'La concientización es el primer paso.',
      linea2: 'La atención oportuna es el siguiente.',
      texto:
        'Las campañas de concientización pueden impulsar el conocimiento y la búsqueda de orientación médica. Sin embargo, transformar esa conciencia en atención efectiva también requiere superar barreras de acceso.',
    },
    // Transición hacia el capítulo 02: la línea del recorrido se convierte en onda musical.
    puente: {
      eyebrow: 'Del recorrido a la música',
      texto: 'MSD y Lotengo buscan contribuir al primer paso: llevar la concientización sobre el cáncer de mama a un lugar donde suena la música.',
    },
  },
};
