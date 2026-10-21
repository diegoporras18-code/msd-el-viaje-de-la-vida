const pad = (n) => String(n).padStart(2, '0');
const toDate = (s) => new Date(`${s}T00:00:00Z`);
const fmt = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export const addDays = (s, n) => {
  const d = toDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return fmt(d);
};

export function dayRange(desde, hasta) {
  if (!desde || !hasta || desde > hasta) return [];
  const out = [];
  for (let d = desde; d <= hasta; d = addDays(d, 1)) out.push(d);
  return out;
}

export const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000) + 1;

export const isCovered = (cobertura = [], d) => cobertura.some((c) => c.desde <= d && d <= c.hasta);

/** Une intervalos de días (inclusivos) solapados o contiguos. */
export function mergeIntervals(list) {
  const sorted = list.filter((c) => c?.desde && c?.hasta).map((c) => ({ desde: c.desde, hasta: c.hasta })).sort((a, b) => a.desde.localeCompare(b.desde));
  const out = [];
  for (const c of sorted) {
    const last = out[out.length - 1];
    if (last && c.desde <= addDays(last.hasta, 1)) {
      if (c.hasta > last.hasta) last.hasta = c.hasta;
    } else out.push({ ...c });
  }
  return out;
}

/** Fecha de hoy en Bogotá (AAAA-MM-DD). */
export const todayBogota = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const shortDate = (s) => {
  const [, m, d] = s.split('-');
  return `${Number(d)} ${MESES[Number(m) - 1]}`;
};
export const longDate = (s) => {
  const [y, m, d] = s.split('-');
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${Number(d)} de ${meses[Number(m) - 1]} de ${y}`;
};
export const rangeLabel = (a, b) => (a === b ? shortDate(a) : `${shortDate(a)} – ${shortDate(b)}`);
