// Capítulo 06 · Conclusiones.
//
// Cada hallazgo combina:
//  - `hecho`: clave de src/lib/data/hechos.js. La frase con cifras se calcula sola y siempre
//    está al día. Si el hecho no está disponible, el hallazgo no se muestra.
//  - `interpretacion`, `hipotesis` y `recomendacion`: texto editorial.
//  - `estado`: 'preliminar' (puede ajustarse en una actualización) o 'aprobada' (no se
//    reescribe sin revisión: si los datos la contradicen, se señala en el Pull Request).
// La presentación muestra los tres primeros hallazgos disponibles, en este orden.

export const conclusiones = {
  capitulo: 'Capítulo 06 · Conclusiones',
  titulo: { linea1: 'Lo que la conversación', linea2: 'nos está diciendo' },
  periodo: 'Antes del concierto · 1 al 23 de octubre de 2026',

  hallazgos: [
    {
      id: 'volumen',
      hecho: 'volumen',
      estado: 'preliminar',
      titulo: 'Octubre ya tiene una conversación propia',
      interpretacion: 'El promedio diario de octubre multiplica varias veces el de finales de septiembre, pero la mediana es mucho menor que el promedio: buena parte del volumen se concentra en pocos días.',
      hipotesis: 'La cercanía de Octubre Rosa puede explicar parte del aumento previo al concierto.',
      recomendacion: 'Evaluar el concierto frente al promedio y la mediana diaria previos, y no frente a totales de periodos distintos.',
    },
    {
      id: 'picos',
      hecho: 'picos',
      estado: 'preliminar',
      titulo: 'Dos días explican la mitad del periodo',
      interpretacion: 'La conversación responde a detonantes puntuales más que a un flujo constante.',
      hipotesis: 'Los picos del 3 al 5 de octubre podrían deberse a contenidos de alto alcance; el análisis por contenido identificará qué los impulsó.',
      recomendacion: 'Tener listos contenidos de concientización para acompañar los picos que genere el concierto, en lugar de distribuirlos de forma uniforme.',
    },
    {
      id: 'plataformas',
      hecho: 'plataformas',
      estado: 'preliminar',
      titulo: 'Video y Facebook concentran la conversación',
      interpretacion: 'Dos fuentes reúnen casi dos tercios de lo que se dice sobre cáncer de mama en el periodo.',
      hipotesis: 'La baja presencia de Instagram puede reflejar la cobertura de la consulta más que una menor conversación en esa red.',
      recomendacion: 'Priorizar piezas en video y en Facebook para amplificar el concierto, y medir su desempeño por separado.',
    },
  ],

  preguntas: [
    { pregunta: '¿Qué se está hablando y cuáles son las temáticas principales?', hecho: 'temas' },
    { pregunta: '¿Qué sentimientos predominan realmente?', hecho: 'sentimiento' },
    { pregunta: '¿Qué barreras aparecen en las conversaciones?', hecho: 'barreras' },
    { pregunta: '¿Qué contenidos y actores impulsan los picos?', hecho: 'picos', complemento: 'Los contenidos y actores detrás de cada pico se identificarán con el análisis por contenido.' },
    { pregunta: '¿MSD logró generar conversación identificable?', hecho: 'msd' },
    { pregunta: '¿La acción del concierto produjo un cambio observable?', hecho: 'impacto' },
    { pregunta: '¿Cómo aparece MSD frente a las otras marcas detectadas?', hecho: 'marcas' },
    {
      pregunta: '¿Qué oportunidades de comunicación y concientización surgen?',
      respuesta: 'Acompañar los picos con contenidos de concientización y priorizar video y Facebook. Las oportunidades por temática se definirán con el análisis por contenido.',
      estado: 'preliminar',
    },
  ],
};
