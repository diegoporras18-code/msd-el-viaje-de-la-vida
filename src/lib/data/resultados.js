// Análisis sobre los resultados públicos agregados (cubo). Funciones puras: las usan
// la web y las pruebas. Regla central: un día sin cobertura es «sin datos» (null), nunca cero.
import { EMOCIONES, INTENCIONES, PLATAFORMAS, SENTIMIENTOS, SENTIMIENTOS_ORIGINALES, TEMAS } from '../../config/clasificacion.js';
import { ENTIDADES, entidad } from '../../config/marcas.js';
import { addDays, dayRange, daysBetween, isCovered } from './dates.js';

export const FILTROS_VACIOS = { plataformas: [], sentimientos: [], tipoSentimiento: 'revisado', temas: [], marcas: [], relevancia: 'todas' };
export const MUESTRA_MINIMA = 30;
export const SOV_DIAS_MINIMOS = 7;

export const PENDIENTE = { id: 'pendiente', nombre: 'Aún sin clasificar', color: '#4A2A40' };
export const catalogoSentimiento = (tipo) => (tipo === 'original' ? SENTIMIENTOS_ORIGINALES : [...SENTIMIENTOS, PENDIENTE]);

const hasRecordFilters = (f) => Boolean(f.plataformas?.length || f.sentimientos?.length || f.temas?.length || f.marcas?.length || (f.relevancia && f.relevancia !== 'todas'));
const inRange = (d, f) => d >= f.desde && d <= f.hasta;
export const sentOf = (r, tipo) => (tipo === 'original' ? r.so : r.cl ? r.s : 'pendiente');

export function passes(r, f) {
  if (f.plataformas?.length && !f.plataformas.includes(r.p)) return false;
  if (f.sentimientos?.length && !f.sentimientos.includes(sentOf(r, f.tipoSentimiento))) return false;
  if (f.temas?.length && !(r.tm ?? []).some((t) => f.temas.includes(t))) return false;
  if (f.marcas?.length && !(r.mc ?? []).some((m) => f.marcas.includes(m))) return false;
  if (f.relevancia === 'relevantes' && r.rel !== 'si') return false;
  return true;
}

const filas = (res, f) => res.cubo.filter((r) => inRange(r.d, f) && passes(r, f));
const sumN = (rows) => rows.reduce((a, r) => a + r.n, 0);

/** Totales diarios: cubo en días cubiertos; referencia preliminar en el resto (si no hay filtros). */
export function dailyTotals(res, f) {
  const filtrado = hasRecordFilters(f);
  const porDia = {};
  for (const r of filas(res, f)) porDia[r.d] = (porDia[r.d] ?? 0) + r.n;
  const base = res.base;
  return dayRange(f.desde, f.hasta).map((d) => {
    if (isCovered(res.cobertura, d)) return { d, v: porDia[d] ?? 0, src: 'base-maestra' };
    if (base?.diario?.[d] != null) return filtrado ? { d, v: null, src: 'referencia-filtrada' } : { d, v: base.diario[d], src: 'referencia' };
    if (base?.bloques?.some((b) => b.desde <= d && d <= b.hasta)) return { d, v: null, src: 'bloque' };
    return { d, v: null, src: null };
  });
}

function usableBlocks(res, f) {
  if (hasRecordFilters(f)) return [];
  return (res.base?.bloques ?? []).filter((b) => b.desde >= f.desde && b.hasta <= f.hasta && !dayRange(b.desde, b.hasta).some((d) => isCovered(res.cobertura, d)));
}

/** Total, días con datos, promedio y mediana diaria de un periodo (normaliza duraciones distintas). */
export function periodStats(res, f) {
  const dias = dailyTotals(res, f).filter((x) => x.v != null);
  const bloques = usableBlocks(res, f);
  const diasBloque = bloques.reduce((a, b) => a + daysBetween(b.desde, b.hasta), 0);
  const diasConDatos = dias.length + diasBloque;
  if (!diasConDatos) return null;
  const total = dias.reduce((a, x) => a + x.v, 0) + bloques.reduce((a, b) => a + b.total, 0);
  const orden = dias.map((x) => x.v).sort((a, b) => a - b);
  const m = Math.floor(orden.length / 2);
  const cubiertos = [...dias.map((x) => x.d), ...bloques.flatMap((b) => dayRange(b.desde, b.hasta))].sort();
  return {
    total,
    diasConDatos,
    diasRango: daysBetween(f.desde, f.hasta),
    promedioDiario: total / diasConDatos,
    mediana: orden.length ? (orden.length % 2 ? orden[m] : (orden[m - 1] + orden[m]) / 2) : null,
    desde: cubiertos[0],
    hasta: cubiertos[cubiertos.length - 1],
    fuente: dias.every((x) => x.src === 'base-maestra') && !bloques.length ? 'base-maestra' : dias.some((x) => x.src === 'base-maestra') ? 'mixta' : 'referencia',
  };
}

/** Crecimiento del promedio diario frente al periodo anterior de igual duración (≥ 50 % de días con datos). */
export function growth(res, f) {
  const actual = periodStats(res, f);
  if (!actual) return { ok: false };
  const largo = daysBetween(actual.desde, actual.hasta);
  const prevF = { ...f, desde: addDays(actual.desde, -largo), hasta: addDays(actual.desde, -1) };
  const anterior = periodStats(res, prevF);
  if (!anterior || anterior.diasConDatos < largo / 2) return { ok: false };
  return { ok: true, actual, anterior, pct: ((actual.promedioDiario - anterior.promedioDiario) / anterior.promedioDiario) * 100 };
}

export function peaks(dias, factor = 1.5, max = 5) {
  const vals = dias.filter((x) => x.v != null);
  if (!vals.length) return [];
  const media = vals.reduce((a, x) => a + x.v, 0) / vals.length;
  return vals.filter((x) => x.v >= media * factor && x.v > 0).sort((a, b) => b.v - a.v).slice(0, max);
}

const tally = (rows, getter) => {
  const m = new Map();
  for (const r of rows) for (const k of [].concat(getter(r) ?? [])) m.set(k, (m.get(k) ?? 0) + r.n);
  return m;
};
const fromCatalog = (map, catalog) => catalog.map((c) => ({ id: c.id, nombre: c.nombre, v: map.get(c.id) ?? 0, color: c.color })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);

/** Vista completa con filtros: alimenta el modo Explorar resultados. */
export function view(res, f) {
  const rows = filas(res, f);
  const dias = dailyTotals(res, f);
  const stats = periodStats(res, f);
  const filtrado = hasRecordFilters(f);
  const notas = [];

  // La referencia preliminar solo entra en las distribuciones si su periodo cabe entero en el rango.
  const base = res.base?.distribuciones;
  let baseIncluida = false;
  if (base) {
    const diasBase = dayRange(base.desde, base.hasta);
    const libre = !diasBase.some((d) => isCovered(res.cobertura, d));
    if (libre && diasBase.some((d) => inRange(d, f))) {
      if (filtrado) notas.push('La referencia preliminar de SentiOne no se puede filtrar por plataforma, sentimiento, temática o marca.');
      else if (base.desde >= f.desde && base.hasta <= f.hasta) baseIncluida = true;
      else notas.push(`La referencia preliminar solo tiene distribuciones del ${base.etiqueta} completo.`);
    }
  }
  const baseTotal = baseIncluida ? Object.values(base.plataformas).reduce((a, b) => a + b, 0) : 0;

  const plat = tally(rows, (r) => r.p);
  const sent = tally(rows, (r) => sentOf(r, f.tipoSentimiento));
  if (baseIncluida) {
    for (const [k, v] of Object.entries(base.plataformas)) plat.set(k, (plat.get(k) ?? 0) + v);
    if (f.tipoSentimiento === 'original') for (const [k, v] of Object.entries(base.sentimiento)) sent.set(k, (sent.get(k) ?? 0) + v);
    else sent.set('pendiente', (sent.get('pendiente') ?? 0) + baseTotal);
  }

  const cls = rows.filter((r) => r.cl);
  const clasificados = sumN(cls);
  const total = sumN(rows) + baseTotal;
  const marcasMap = tally(rows, (r) => r.mc);
  const tagRows = (res.hashtags ?? []).filter((x) => inRange(x.d, f) && (!f.plataformas?.length || f.plataformas.includes(x.p)));
  const tags = new Map();
  for (const x of tagRows) tags.set(x.tag, (tags.get(x.tag) ?? 0) + x.n);

  const conHora = rows.filter((r) => r.t != null);
  let horario = null;
  if (conHora.length) {
    const m = new Map();
    for (const r of conHora) {
      if (!m.has(r.d)) m.set(r.d, Array(24).fill(0));
      m.get(r.d)[r.t] += r.n;
    }
    const fl = [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([d, horas]) => ({ d, horas }));
    horario = { filas: fl, max: Math.max(...fl.flatMap((x) => x.horas)), sinHora: sumN(rows) - sumN(conHora) };
  }
  const conMetrica = rows.filter((r) => r.itn);

  return {
    dias,
    stats,
    picos: peaks(dias),
    total,
    registros: sumN(rows),
    clasificados,
    revisar: sumN(cls.filter((r) => r.rv)),
    baseIncluida,
    plataformas: fromCatalog(plat, PLATAFORMAS),
    sentimiento: fromCatalog(sent, catalogoSentimiento(f.tipoSentimiento)),
    temas: fromCatalog(tally(cls, (r) => r.tm), TEMAS),
    emociones: fromCatalog(tally(cls, (r) => r.e), EMOCIONES),
    intenciones: fromCatalog(tally(cls, (r) => r.ia), INTENCIONES),
    relevancia: Object.fromEntries(['si', 'dudosa', 'no'].map((k) => [k, sumN(cls.filter((r) => r.rel === k))])),
    haciaMarca: fromCatalog(tally(cls.filter((r) => r.sm && r.sm !== 'no_aplica'), (r) => r.sm), SENTIMIENTOS),
    haciaSistema: fromCatalog(tally(cls.filter((r) => r.ss && r.ss !== 'no_aplica'), (r) => r.ss), SENTIMIENTOS),
    marcas: ENTIDADES.map((e) => ({ id: e.id, nombre: e.nombre, v: marcasMap.get(e.id) ?? 0, color: e.color })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v),
    hashtags: [...tags.entries()].map(([id, v]) => ({ id, nombre: id, v })).sort((a, b) => b.v - a.v || a.id.localeCompare(b.id)).slice(0, 12),
    hashtagsFiltrables: !(f.sentimientos?.length || f.temas?.length || f.marcas?.length || f.relevancia !== 'todas'),
    horario,
    interacciones: conMetrica.length ? { total: conMetrica.reduce((a, r) => a + r.it, 0), registros: conMetrica.reduce((a, r) => a + r.itn, 0) } : null,
    tipos: [...tally(rows.filter((r) => r.tp), (r) => r.tp).entries()].map(([id, v]) => ({ id, nombre: id, v })).sort((a, b) => b.v - a.v),
    notas,
  };
}

/** Comparativo de marcas detectadas en la misma base maestra. */
export function marcasView(res, f, ids) {
  return ids.map((id) => {
    const fm = { ...f, marcas: [id] };
    const v = view(res, fm);
    return { id, info: entidad(id), n: v.registros, v };
  });
}

/**
 * Share of Voice: solo si la consulta captura a todas las marcas con criterio equivalente
 * y hay al menos SOV_DIAS_MINIMOS días de base maestra en el rango.
 */
export function shareOfVoice(res, f, ids) {
  const sinCobertura = ids.filter((id) => entidad(id)?.cobertura !== 'equivalente');
  if (sinCobertura.length) return { ok: false, motivo: 'cobertura', sinCobertura };
  const dias = dayRange(f.desde, f.hasta).filter((d) => isCovered(res.cobertura, d));
  if (dias.length < SOV_DIAS_MINIMOS) return { ok: false, motivo: 'periodo' };
  const valores = ids.map((id) => ({ id, v: sumN(filas(res, { ...f, marcas: [id] })) }));
  const total = valores.reduce((a, x) => a + x.v, 0);
  if (!total) return { ok: false, motivo: 'sin-menciones' };
  return { ok: true, dias: dias.length, total, valores: valores.map((x) => ({ ...x, pct: (x.v / total) * 100 })) };
}

export const tieneBaseMaestra = (res) => res.cobertura.length > 0 && res.totales.unicos > 0;
export const diasCubiertos = (res, desde, hasta) => dayRange(desde, hasta).filter((d) => isCovered(res.cobertura, d)).length;
