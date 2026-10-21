import { PLATAFORMAS, SENTIMIENTOS } from '../../config/clasificacion.js';
import { normalizeText } from './text.js';

const pad = (n) => String(n).padStart(2, '0');
const OFFSET_BOGOTA = -5; // America/Bogota: UTC−5, sin horario de verano.

const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const valid = (y, m, d) => y > 1990 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31;

function fromExcelSerial(n) {
  // Fecha serial de Excel (días desde 1899-12-30), interpretada como hora local de pared.
  const ms = Math.round((n - 25569) * 86400000);
  const dt = new Date(ms);
  return { d: ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()), t: n % 1 ? dt.getUTCHours() : null };
}

function parseHour(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v.getUTCHours();
  if (typeof v === 'number') return v < 1 ? Math.floor(v * 24 + 1e-9) : v < 24 ? Math.floor(v) : null;
  const m = String(v).match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm|a\.\s?m\.|p\.\s?m\.)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const ap = m[3]?.toLowerCase().replace(/[\s.]/g, '');
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return h >= 0 && h < 24 ? h : null;
}

/**
 * Detecta si las fechas con barras vienen como día/mes o mes/día a partir de una muestra.
 * Por defecto día/mes (convención en español).
 */
export function detectDateOrder(values) {
  let dmy = 0;
  let mdy = 0;
  for (const v of values) {
    const m = typeof v === 'string' && v.match(/^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
    if (!m) continue;
    if (Number(m[1]) > 12) dmy++;
    if (Number(m[2]) > 12) mdy++;
  }
  return mdy > dmy ? 'mdy' : 'dmy';
}

/**
 * Convierte el valor de fecha (y opcionalmente de hora) a { d: 'AAAA-MM-DD', t: hora | null }
 * en hora de Bogotá. Devuelve null si no se puede interpretar.
 */
export function parseDateTime(value, horaValue, order = 'dmy') {
  if (value == null || value === '') return null;
  let out = null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Las celdas de fecha de Excel no tienen zona: se leen como hora de pared.
    const hasTime = value.getUTCHours() || value.getUTCMinutes();
    out = {
      d: ymd(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()),
      t: hasTime ? value.getUTCHours() : null,
    };
  } else if (typeof value === 'number' && value > 20000 && value < 80000) {
    out = fromExcelSerial(value);
  } else {
    const s = String(value).trim();
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?\s*(Z|[+-]\d{2}:?\d{2})?/i);
    if (m) {
      let [, y, mo, d, h, mi, , tz] = m;
      if (tz && h != null) {
        const off = tz.toUpperCase() === 'Z' ? 0 : (tz[0] === '-' ? -1 : 1) * (Number(tz.slice(1, 3)) + Number(tz.slice(-2)) / 60);
        const utc = Date.UTC(+y, +mo - 1, +d, +h, +mi) - off * 3600000;
        const local = new Date(utc + OFFSET_BOGOTA * 3600000);
        out = { d: ymd(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate()), t: local.getUTCHours() };
      } else if (valid(+y, +mo, +d)) {
        out = { d: ymd(+y, +mo, +d), t: h != null ? Number(h) : null };
      }
    } else if ((m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:[,\sT]+(.+))?$/))) {
      let [, a, b, y, rest] = m;
      const [d, mo] = order === 'mdy' ? [b, a] : [a, b];
      y = y.length === 2 ? 2000 + Number(y) : Number(y);
      if (valid(y, +mo, +d)) out = { d: ymd(y, +mo, +d), t: rest ? parseHour(rest) : null };
    }
  }

  if (!out) return null;
  const h = parseHour(horaValue);
  if (h != null) out.t = h;
  return out;
}

export function parseNumber(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = String(v).trim().toLowerCase().replace(/\s/g, '');
  let mult = 1;
  if (/[km]$/.test(s)) {
    mult = s.endsWith('k') ? 1e3 : 1e6;
    s = s.slice(0, -1);
  }
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) s = s.replace(/[.,]/g, '');
  else s = s.replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * mult) : null;
}

const TRACKING = /^(utm_|fbclid$|gclid$|igshid$|igsh$|si$|ref$|ref_src$|s$|t$|mibextid$|__cft__|__tn__)/i;

/** URL estable para deduplicar: sin protocolo, www, fragmento, parámetros de rastreo ni barra final. */
export function normalizeUrl(u) {
  if (!u) return null;
  const raw = String(u).trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^(www|m|mobile)\./, '');
    const params = [...url.searchParams.entries()].filter(([k]) => !TRACKING.test(k)).sort(([a], [b]) => a.localeCompare(b));
    const query = params.length ? `?${params.map(([k, v]) => `${k}=${v}`).join('&')}` : '';
    const path = url.pathname.replace(/\/+$/, '');
    return `${host}${path}${query}`;
  } catch {
    return raw.toLowerCase();
  }
}

const tokens = (s) => normalizeText(s).split(/[^a-z0-9.]+/).filter(Boolean);

function matchPlatform(value) {
  const tk = tokens(value);
  if (!tk.length) return null;
  const ordered = [...PLATAFORMAS.filter((p) => p.id !== 'web'), PLATAFORMAS.find((p) => p.id === 'web')];
  for (const p of ordered) {
    for (const pat of p.patrones) {
      if (tk.some((t) => t === pat || (pat.length >= 4 && (t.startsWith(pat) || t.includes(`${pat}.`))))) return p.id;
    }
  }
  return null;
}

/** Plataforma canónica a partir de la fuente; si no se reconoce, se intenta con dominio o URL. */
export function normalizePlatform(fuente, dominio, url) {
  return matchPlatform(fuente) ?? matchPlatform(dominio) ?? matchPlatform(url && String(url).split('/')[2]) ?? (fuente ? 'otros' : 'otros');
}

export function normalizeSentiment(v) {
  const t = normalizeText(v);
  if (!t) return 'sin_clasificar';
  for (const s of SENTIMIENTOS) if (s.patrones.some((p) => t === p || t.startsWith(p))) return s.id;
  return 'sin_clasificar';
}
