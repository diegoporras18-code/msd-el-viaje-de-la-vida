import { EMOCIONES, NARRATIVAS, PALABRAS_CLAVE, PLATAFORMAS, RELACIONES, SENTIMIENTOS } from '../../config/clasificacion.js';
import { SOV } from '../../config/universos.js';
import { emotionOf, intentOf, narrativesOf, relationOf, sentimentOf } from './classify.js';
import { addDays, dayRange, daysBetween, isCovered } from './dates.js';

// Filtros por defecto: todo vacío significa «sin restricción».
export const FILTROS_VACIOS = { plataformas: [], sentimientos: [], narrativas: [], relaciones: [], tipoSentimiento: 'original' };

const hasRecordFilters = (f) => Boolean(f.plataformas?.length || f.sentimientos?.length || f.narrativas?.length || f.relaciones?.length);

export function passes(r, f) {
  if (f.plataformas?.length && !f.plataformas.includes(r.p)) return false;
  if (f.sentimientos?.length && !f.sentimientos.includes(sentimentOf(r, f.tipoSentimiento))) return false;
  if (f.narrativas?.length && !narrativesOf(r).ids.some((n) => f.narrativas.includes(n))) return false;
  if (f.relaciones?.length && !f.relaciones.includes(relationOf(r).id)) return false;
  return true;
}

const inRange = (d, f) => d >= f.desde && d <= f.hasta;

/**
 * Totales por día de un universo. Regla central: un día sin cobertura es `null`
 * (sin datos), nunca cero. Combina registros importados y la línea base agregada.
 */
export function dailyTotals(u, f) {
  const filtrado = hasRecordFilters(f);
  const porDia = {};
  for (const r of u.registros) if (inRange(r.d, f) && passes(r, f)) porDia[r.d] = (porDia[r.d] ?? 0) + 1;
  const base = u.base;
  return dayRange(f.desde, f.hasta).map((d) => {
    if (isCovered(u.cobertura, d)) return { d, v: porDia[d] ?? 0, src: 'registros' };
    if (base?.diario?.[d] != null) return filtrado ? { d, v: null, src: 'base-filtrada' } : { d, v: base.diario[d], src: 'base' };
    if (base?.bloques?.some((b) => b.desde <= d && d <= b.hasta)) return { d, v: null, src: 'bloque' };
    return { d, v: null, src: null };
  });
}

/** Bloques agregados (sin detalle diario) contenidos por completo en el rango y no cubiertos por registros. */
function usableBlocks(u, f) {
  if (hasRecordFilters(f)) return [];
  return (u.base?.bloques ?? []).filter(
    (b) => b.desde >= f.desde && b.hasta <= f.hasta && !dayRange(b.desde, b.hasta).some((d) => isCovered(u.cobertura, d)),
  );
}

/** Total, días con datos y promedio diario de un periodo (normaliza duraciones distintas). */
export function periodStats(u, f) {
  if (!u) return null;
  const dias = dailyTotals(u, f);
  const conDatos = dias.filter((x) => x.v != null);
  const bloques = usableBlocks(u, f);
  const diasBloque = bloques.reduce((a, b) => a + daysBetween(b.desde, b.hasta), 0);
  const diasConDatos = conDatos.length + diasBloque;
  if (!diasConDatos) return null;
  const total = conDatos.reduce((a, x) => a + x.v, 0) + bloques.reduce((a, b) => a + b.total, 0);
  const cubiertos = [...conDatos.map((x) => x.d), ...bloques.flatMap((b) => dayRange(b.desde, b.hasta))].sort();
  return {
    total,
    diasConDatos,
    diasRango: daysBetween(f.desde, f.hasta),
    promedioDiario: total / diasConDatos,
    desde: cubiertos[0],
    hasta: cubiertos[cubiertos.length - 1],
  };
}

/**
 * Crecimiento del promedio diario frente al periodo inmediatamente anterior de igual duración.
 * Solo se calcula si el periodo anterior tiene datos en al menos la mitad de sus días.
 */
export function growth(u, f) {
  const actual = periodStats(u, f);
  if (!actual) return { ok: false, motivo: 'Sin datos en el periodo elegido.' };
  const largo = daysBetween(actual.desde, actual.hasta);
  const prevF = { ...f, desde: addDays(actual.desde, -largo), hasta: addDays(actual.desde, -1) };
  const anterior = periodStats(u, prevF);
  if (!anterior || anterior.diasConDatos < largo / 2)
    return { ok: false, motivo: 'El periodo anterior comparable no tiene datos suficientes.', ventana: prevF };
  return {
    ok: true,
    actual,
    anterior,
    pct: ((actual.promedioDiario - anterior.promedioDiario) / anterior.promedioDiario) * 100,
    ventana: prevF,
  };
}

export function peaks(dias, factor = 1.5, max = 5) {
  const vals = dias.filter((x) => x.v != null);
  if (!vals.length) return [];
  const media = vals.reduce((a, x) => a + x.v, 0) / vals.length;
  return vals.filter((x) => x.v >= media * factor && x.v > 0).sort((a, b) => b.v - a.v).slice(0, max);
}

const tally = (items, keys) => {
  const m = new Map(keys.map((k) => [k, 0]));
  for (const k of items) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
};

/**
 * Vista completa de un universo con filtros: alimenta el dashboard de conversación.
 * Cada bloque indica su procedencia y las limitaciones (notas) para mostrarlas en pantalla.
 */
export function universeView(u, f) {
  const notas = [];
  if (!u) return null;
  const regs = u.registros.filter((r) => inRange(r.d, f) && passes(r, f));
  const dias = dailyTotals(u, f);
  const stats = periodStats(u, f);
  const filtrado = hasRecordFilters(f);

  // Línea base agregada: solo se suma a las distribuciones si su periodo cabe entero en el rango.
  const base = u.base?.distribuciones;
  let baseIncluida = false;
  if (base) {
    const diasBase = dayRange(base.desde, base.hasta);
    const solapa = diasBase.some((d) => inRange(d, f));
    const libre = !diasBase.some((d) => isCovered(u.cobertura, d));
    if (solapa && libre) {
      if (filtrado) notas.push('La línea base agregada no se puede filtrar por plataforma, sentimiento ni narrativa; para filtrarla importa el Excel original.');
      else if (base.desde >= f.desde && base.hasta <= f.hasta) baseIncluida = true;
      else notas.push(`Las distribuciones de la línea base solo existen para el ${base.etiqueta} completo; amplía el rango para incluirlas.`);
    }
  }

  const plat = tally(regs.map((r) => r.p), PLATAFORMAS.map((p) => p.id));
  const sent = tally(regs.map((r) => sentimentOf(r, f.tipoSentimiento)), []);
  if (baseIncluida) {
    for (const [k, v] of Object.entries(base.plataformas ?? {})) plat.set(k, (plat.get(k) ?? 0) + v);
    const total = Object.values(base.sentimiento ?? {}).reduce((a, b) => a + b, 0);
    if (f.tipoSentimiento === 'original') for (const [k, v] of Object.entries(base.sentimiento ?? {})) sent.set(k, (sent.get(k) ?? 0) + v);
    else sent.set(f.tipoSentimiento === 'revisado' ? 'pendiente_revision' : 'sin_sugerencia', (sent.get(f.tipoSentimiento === 'revisado' ? 'pendiente_revision' : 'sin_sugerencia') ?? 0) + total);
  }

  const multi = (getter, catalog) => {
    const rows = catalog.map((c) => ({ id: c.id, nombre: c.nombre, validado: 0, sugerido: 0 }));
    const idx = new Map(rows.map((r) => [r.id, r]));
    for (const r of regs) {
      const { ids, validado } = getter(r);
      for (const id of ids) {
        const row = idx.get(id);
        if (row) row[validado ? 'validado' : 'sugerido']++;
      }
    }
    return rows;
  };

  const narrativas = multi(narrativesOf, NARRATIVAS);
  const emociones = multi((r) => {
    const e = emotionOf(r);
    return { ids: e.id ? [e.id] : [], validado: e.validado };
  }, EMOCIONES);
  const relacion = multi((r) => {
    const x = relationOf(r);
    return { ids: [x.id], validado: x.validado };
  }, RELACIONES);
  const intencion = regs.reduce(
    (acc, r) => {
      const x = intentOf(r);
      if (x.v) acc[x.validado ? 'validado' : 'sugerido']++;
      return acc;
    },
    { validado: 0, sugerido: 0 },
  );

  const hashtags = [...tally(regs.flatMap((r) => r.tg ?? []), []).entries()]
    .map(([id, v]) => ({ id, nombre: id, v }))
    .sort((a, b) => b.v - a.v || a.id.localeCompare(b.id))
    .slice(0, 15);
  const kwMap = tally(regs.flatMap((r) => r.kw ?? []), []);
  const palabras = PALABRAS_CLAVE.map((k) => ({ id: k.id, nombre: k.nombre, v: kwMap.get(k.id) ?? 0 })).filter((k) => k.v > 0).sort((a, b) => b.v - a.v);

  // Volumen por día y hora (solo registros con hora).
  const conHora = regs.filter((r) => r.t != null);
  let horario = null;
  if (conHora.length) {
    const m = new Map();
    for (const r of conHora) {
      if (!m.has(r.d)) m.set(r.d, Array(24).fill(0));
      m.get(r.d)[r.t]++;
    }
    const filas = [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([d, horas]) => ({ d, horas }));
    horario = { filas, max: Math.max(...filas.flatMap((x) => x.horas)), sinHora: regs.length - conHora.length };
  }

  const conMetrica = regs.filter((r) => r.m?.int != null);
  const interacciones = conMetrica.length ? { total: conMetrica.reduce((a, r) => a + r.m.int, 0), registros: conMetrica.length } : null;

  const tipos = [...tally(regs.filter((r) => r.tp).map((r) => r.tp), []).entries()].map(([id, v]) => ({ id, nombre: id, v })).sort((a, b) => b.v - a.v);

  return {
    dias,
    stats,
    picos: peaks(dias),
    registros: regs.length,
    baseIncluida,
    plataformas: PLATAFORMAS.map((p) => ({ id: p.id, nombre: p.nombre, v: plat.get(p.id) ?? 0 })).filter((p) => p.v > 0).sort((a, b) => b.v - a.v),
    sentimiento: [...sent.entries()].map(([id, v]) => ({ id, v })).filter((x) => x.v > 0),
    narrativas,
    emociones,
    relacion,
    intencion,
    hashtags,
    palabras,
    horario,
    interacciones,
    tipos,
    notas,
  };
}

/** Conteo de registros que mencionan una entidad (MSD, Fonseca…) en el rango. */
export const entityMentions = (u, f, entidad) =>
  u ? u.registros.filter((r) => inRange(r.d, f) && passes(r, f) && (r.ent ?? []).includes(entidad)).length : 0;

/**
 * Share of Voice entre marcas. Solo se calcula si todas tienen exportación propia
 * y sus coberturas coinciden al menos `SOV.diasMinimos` días dentro del rango.
 * Se basa en menciones explícitas de cada laboratorio, no en publicaciones que solo hablan de la enfermedad.
 */
export function shareOfVoice(dataset, marcas, f) {
  if (marcas.length < 2) return { ok: false, motivo: 'Elige al menos dos laboratorios para comparar.' };
  const faltan = marcas.filter((id) => !dataset.universos[id]?.registros?.length);
  if (faltan.length) return { ok: false, motivo: 'Faltan exportaciones de SentiOne para comparar.', faltan };
  const dias = dayRange(f.desde, f.hasta).filter((d) => marcas.every((id) => isCovered(dataset.universos[id].cobertura, d)));
  if (dias.length < SOV.diasMinimos)
    return { ok: false, motivo: `Las exportaciones coinciden solo en ${dias.length} días del rango; se necesitan al menos ${SOV.diasMinimos}.` };
  const set = new Set(dias);
  const valores = marcas.map((id) => {
    const regs = dataset.universos[id].registros.filter((r) => set.has(r.d) && passes(r, f));
    return { id, menciones: regs.filter((r) => (r.ent ?? []).includes(id)).length, consulta: regs.length };
  });
  const total = valores.reduce((a, v) => a + v.menciones, 0);
  if (!total) return { ok: false, motivo: 'Ninguna marca tiene menciones explícitas en el periodo común.' };
  return {
    ok: true,
    desde: dias[0],
    hasta: dias[dias.length - 1],
    dias: dias.length,
    total,
    valores: valores.map((v) => ({ ...v, pct: (v.menciones / total) * 100 })),
  };
}

export const SENTIMIENTO_EXTRA = [
  { id: 'pendiente_revision', nombre: 'Pendiente de revisión', color: '#5E4457' },
  { id: 'sin_sugerencia', nombre: 'Sin sugerencia', color: '#5E4457' },
];
export const catalogoSentimiento = [...SENTIMIENTOS, ...SENTIMIENTO_EXTRA];

/**
 * Contrasta los registros importados con la línea base agregada ya revisada
 * (útil al reimportar la exportación original: las cifras deberían coincidir).
 */
export function baseCheck(u) {
  const base = u?.base;
  if (!base?.diario || !u.registros.length) return null;
  const porDia = {};
  for (const r of u.registros) porDia[r.d] = (porDia[r.d] ?? 0) + 1;
  const dias = Object.keys(base.diario).filter((d) => isCovered(u.cobertura, d));
  if (!dias.length) return null;
  const filas = dias.sort().map((d) => ({ d, base: base.diario[d], importado: porDia[d] ?? 0 }));
  const diferencias = filas.filter((x) => x.base !== x.importado);
  return { dias: filas.length, coincide: diferencias.length === 0, diferencias, totalBase: filas.reduce((a, x) => a + x.base, 0), totalImportado: filas.reduce((a, x) => a + x.importado, 0) };
}
