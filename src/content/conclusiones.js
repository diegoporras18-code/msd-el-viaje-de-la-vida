// Capítulo 06 · Conclusiones.
//
// Cada hallazgo combina:
//  - `hecho`: clave de src/lib/data/hechos.js. La cifra se calcula sola y siempre está al día.
//    Si el hecho no está disponible, el hallazgo no se muestra.
//  - `pregunta`, `titulo`, `significa` y `oportunidad`: texto editorial breve, sin repetir las
//    explicaciones de los capítulos anteriores.
//  - `estado`: 'preliminar' (puede ajustarse en una actualización) o 'aprobada' (no se
//    reescribe sin revisión: si los datos la contradicen, se señala en el Pull Request).
// La presentación muestra los tres primeros hallazgos disponibles, en este orden: son los tres
// mensajes ejecutivos.

export const conclusiones = {
  capitulo: 'Capítulo 06 · Conclusiones',
  titulo: { linea1: 'Lo que la conversación', linea2: 'nos está diciendo' },
  periodo: 'Antes del concierto · datos del 1 al 20 de octubre de 2026 (el periodo previo llega al 23)',

  hallazgos: [
    {
      id: 'temas',
      hecho: 'temas',
      estado: 'preliminar',
      pregunta: '¿De qué se habla realmente cuando se habla de cáncer de mama?',
      titulo: 'De llegar a tiempo',
      significa: 'La conversación real gira en torno a detectar a tiempo, crear conciencia y conseguir atención; el resto de lo captado es ruido.',
      oportunidad: 'Hablar de pasos concretos —consultar, hacerse la mamografía cuando esté indicada, saber cómo acceder— más que del símbolo.',
    },
    {
      id: 'preocupaciones',
      hecho: 'preocupaciones',
      estado: 'preliminar',
      pregunta: '¿Qué preocupaciones, emociones y barreras aparecen?',
      titulo: 'Esperanza y solidaridad, con una queja clara: el acceso',
      significa: 'El tono es mayoritariamente positivo; lo negativo apunta al sistema —cobertura de mamografía, demoras, medicamentos—, no a la causa.',
      oportunidad: 'Reconocer esas barreras en lugar de ignorarlas da credibilidad a un mensaje de concientización.',
    },
    {
      id: 'oportunidad',
      hecho: 'laboratorios',
      estado: 'preliminar',
      pregunta: '¿Qué oportunidad tiene MSD de conectar su iniciativa con esas necesidades?',
      titulo: 'Ser útil donde la industria no está',
      significa: 'Los laboratorios casi no aparecen y, cuando lo hacen, hablan de innovación; MSD apenas aparece.',
      oportunidad:
        'El propósito de MSD y Lotengo en el concierto de Fonseca encaja con la necesidad identificada: acompañar la emoción de la noche con información útil sobre detección y acceso. Si eso cambia la conversación solo se sabrá con datos posteriores al 24 de octubre.',
    },
  ],

  // Respuestas a las preguntas clave: se muestran plegadas para no alargar la presentación.
  preguntas: [
    { pregunta: '¿Cuánto de lo que se capta habla realmente de cáncer de mama?', hecho: 'relevancia' },
    { pregunta: '¿Cómo se comportó la conversación y cuáles fueron sus picos?', hecho: 'picos' },
    { pregunta: '¿Qué sentimientos predominan realmente?', hecho: 'sentimiento' },
    { pregunta: '¿Qué barreras aparecen en las conversaciones?', hecho: 'barreras' },
    { pregunta: '¿Dónde se publica la conversación sobre cáncer de mama?', hecho: 'plataformas' },
    { pregunta: '¿MSD logró generar conversación identificable?', hecho: 'msd' },
    { pregunta: '¿Qué laboratorios aparecen?', hecho: 'marcas' },
    { pregunta: '¿Qué tan confiable es la clasificación por contenido?', hecho: 'calidad' },
    { pregunta: '¿La acción del concierto produjo un cambio observable?', hecho: 'impacto' },
  ],
};
