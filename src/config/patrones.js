// Patrones de conversación que sustentan las tarjetas de sentimiento del capítulo 03.2.
// Se cuentan en las menciones que hablan de cáncer de mama; una tarjeta solo se muestra si su
// patrón reúne al menos UMBRAL menciones en el periodo (y el resto de su sentimiento también
// alcanza el umbral o es cero, para que no se deduzca por diferencia). Las síntesis viven en
// src/content/antes.js y la evidencia de cada afirmación solo en el informe privado.
export const PATRONES_SENTIMIENTO = [
  { id: 'positivo_apoyo', s: 'positivo', temas: ['apoyo_emocional', 'historias_pacientes'], soloSocial: true },
  { id: 'neutral_informativo', s: 'neutral', temas: ['educacion', 'diagnostico_temprano'] },
  { id: 'negativo_barreras', s: 'negativo', temas: ['barreras_atencion', 'acceso_sistema_salud'] },
];

const NO_SOCIAL = new Set(['web', 'blogs']);
export const cumplePatron = (p, r) => r.c.s === p.s && r.c.tm.some((t) => p.temas.includes(t)) && !(p.soloSocial && NO_SOCIAL.has(r.p));
