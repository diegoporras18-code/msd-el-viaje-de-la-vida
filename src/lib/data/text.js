// Utilidades de texto puras (sin dependencias de navegador).

export const normalizeText = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Compila una lista de patrones en una expresión que exige inicio y fin de palabra
// (así «msd» no coincide dentro de otra palabra).
export function compilePatterns(patterns) {
  const list = patterns.map((p) => normalizeText(p)).filter(Boolean);
  if (!list.length) return null;
  return new RegExp(`(?:^|[^a-z0-9#@])(?:${list.map(escapeRe).join('|')})(?![a-z0-9])`);
}

export const matches = (re, normText) => Boolean(re && re.test(normText));

/** Quita del texto normalizado las expresiones excluidas (falsos positivos conocidos). */
export const sinExcluidos = (normText, excluir = []) => excluir.reduce((t, x) => t.split(normalizeText(x)).join(' '), normText);

// Hashtags en minúsculas y sin tildes; se publican solo como conteos agregados.
export function extractHashtags(text) {
  const out = new Set();
  const re = /#([\p{L}\p{N}_]{2,60})/gu;
  for (const m of String(text ?? '').matchAll(re)) out.add(`#${normalizeText(m[1])}`);
  return [...out];
}
