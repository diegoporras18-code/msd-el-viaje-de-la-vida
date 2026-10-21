import { EMOCIONES, ENTIDADES, INTENCION_PREVENTIVA, NARRATIVAS, PALABRAS_CLAVE, PISTAS_SENTIMIENTO } from '../../config/clasificacion.js';
import { compilePatterns, matches, normalizeText } from './text.js';

const RE = {
  narrativas: NARRATIVAS.map((n) => [n.id, compilePatterns(n.patrones)]),
  emociones: EMOCIONES.map((e) => [e.id, compilePatterns(e.patrones)]),
  entidades: ENTIDADES.map((e) => [e.id, compilePatterns(e.patrones)]),
  palabras: PALABRAS_CLAVE.map((k) => [k.id, compilePatterns(k.patrones)]),
  intencion: compilePatterns(INTENCION_PREVENTIVA),
  pos: compilePatterns(PISTAS_SENTIMIENTO.positivo),
  neg: compilePatterns(PISTAS_SENTIMIENTO.negativo),
};

const MARCAS = new Set(ENTIDADES.filter((e) => e.marca).map((e) => e.id));

/** Entidades mencionadas explícitamente en el texto (detección por palabra clave). */
export function detectEntities(text) {
  const t = normalizeText(text);
  return RE.entidades.filter(([, re]) => matches(re, t)).map(([id]) => id);
}

/** Términos del vocabulario controlado presentes en el texto. */
export function detectKeywords(text) {
  const t = normalizeText(text);
  return RE.palabras.filter(([, re]) => matches(re, t)).map(([id]) => id);
}

export function relationFromEntities(ent) {
  if (ent.includes('msd')) return 'msd';
  if (ent.some((e) => MARCAS.has(e))) return 'competencia';
  return 'categoria';
}

/**
 * Clasificación SUGERIDA por reglas. Nunca sustituye el sentimiento original
 * ni una revisión manual. Si hay pistas positivas y negativas a la vez, no sugiere nada.
 */
export function suggest(text) {
  const t = normalizeText(text);
  if (!t) return null;
  const pos = matches(RE.pos, t);
  const neg = matches(RE.neg, t);
  const s = pos && !neg ? 'positivo' : neg && !pos ? 'negativo' : null;
  const n = RE.narrativas.filter(([, re]) => matches(re, t)).map(([id]) => id);
  const e = RE.emociones.find(([, re]) => matches(re, t))?.[0] ?? null;
  const i = matches(RE.intencion, t);
  const out = {};
  if (s) out.s = s;
  if (n.length) out.n = n;
  if (e) out.e = e;
  if (i) out.i = true;
  return Object.keys(out).length ? out : null;
}

// Valor efectivo de cada dimensión: lo revisado manda; si no, lo sugerido (marcado como tal).
export const sentimentOf = (r, kind) => {
  if (kind === 'revisado') return r.rv?.s ?? 'pendiente_revision';
  if (kind === 'sugerido') return r.rv?.s ?? r.sg?.s ?? 'sin_sugerencia';
  return r.so;
};

export const narrativesOf = (r) => (r.rv?.n ? { ids: r.rv.n, validado: true } : { ids: r.sg?.n ?? [], validado: false });
export const emotionOf = (r) => (r.rv?.e !== undefined ? { id: r.rv.e, validado: true } : { id: r.sg?.e ?? null, validado: false });
export const intentOf = (r) => (r.rv?.i !== undefined ? { v: r.rv.i, validado: true } : { v: Boolean(r.sg?.i), validado: false });
export const relationOf = (r) => (r.rv?.r ? { id: r.rv.r, validado: true } : { id: relationFromEntities(r.ent ?? []), validado: false });
