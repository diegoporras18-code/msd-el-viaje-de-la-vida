import { UNIVERSOS } from '../../config/universos.js';
import { mergeIntervals } from './dates.js';
import { SENTIMIENTOS, PLATAFORMAS } from '../../config/clasificacion.js';

export const DATASET_VERSION = 1;

export const emptyUniverse = () => ({ cobertura: [], importaciones: [], registros: [] });

export function emptyDataset() {
  return {
    version: DATASET_VERSION,
    generado: null,
    zonaHoraria: 'America/Bogota',
    universos: Object.fromEntries(UNIVERSOS.map((u) => [u.id, emptyUniverse()])),
    destacados: [],
  };
}

/** Garantiza que existan todos los universos configurados (p. ej. un laboratorio recién añadido). */
export function ensureUniverses(ds) {
  const faltan = UNIVERSOS.filter((u) => !ds.universos?.[u.id]);
  if (!faltan.length) return ds;
  return { ...ds, universos: { ...ds.universos, ...Object.fromEntries(faltan.map((u) => [u.id, emptyUniverse()])) } };
}

/** Quita todo lo que no debe publicarse (textos, URLs, autores, país por registro). */
export const stripLocal = ({ _local, ...rest }) => rest;

const sortRegs = (a, b) => a.d.localeCompare(b.d) || (a.t ?? -1) - (b.t ?? -1) || a.h.localeCompare(b.h);

const countByDay = (regs) => regs.reduce((acc, r) => ((acc[r.d] = (acc[r.d] ?? 0) + 1), acc), {});

/**
 * Incorpora registros procesados a un universo.
 * - Deduplica contra el histórico por hash de ID/URL: nunca vuelve a sumar un registro.
 * - Actualiza métricas de publicaciones ya existentes y conserva sus revisiones manuales.
 * - Amplía la cobertura de fechas con la ventana declarada de la exportación.
 */
export function mergeImport(dataset, universoId, procesados, meta = {}) {
  const prev = dataset.universos[universoId] ?? emptyUniverse();
  const byHash = new Map(prev.registros.map((r) => [r.h, r]));
  const antes = countByDay(prev.registros);
  let nuevos = 0;
  let existentes = 0;
  let metricasActualizadas = 0;

  for (const raw of procesados) {
    const r = stripLocal(raw);
    const old = byHash.get(r.h);
    if (old) {
      existentes++;
      if (JSON.stringify(old.m ?? null) !== JSON.stringify(r.m ?? null)) metricasActualizadas++;
      byHash.set(r.h, { ...r, ...(old.rv ? { rv: old.rv } : {}), d: old.d, t: old.t ?? r.t });
    } else {
      nuevos++;
      byHash.set(r.h, r);
    }
  }

  const registros = [...byHash.values()].sort(sortRegs);
  const fechas = procesados.map((r) => r.d).sort();
  const desde = meta.desde ?? fechas[0];
  const hasta = meta.hasta ?? fechas[fechas.length - 1];
  const cobertura = desde && hasta ? mergeIntervals([...prev.cobertura, { desde, hasta }]) : prev.cobertura;
  const importacion = {
    fecha: meta.fechaImportacion ?? new Date().toISOString(),
    archivo: meta.archivo ?? 'exportación',
    desde: desde ?? null,
    hasta: hasta ?? null,
    leidos: procesados.length,
    nuevos,
    existentes,
  };

  const despues = countByDay(registros);
  const dias = [...new Set([...Object.keys(antes), ...Object.keys(despues)])].sort();
  const porDia = dias
    .map((d) => ({ d, antes: antes[d] ?? 0, despues: despues[d] ?? 0 }))
    .filter((x) => x.antes !== x.despues);

  return {
    dataset: {
      ...dataset,
      universos: { ...dataset.universos, [universoId]: { ...prev, cobertura, importaciones: [...prev.importaciones, importacion], registros } },
    },
    diff: { nuevos, existentes, metricasActualizadas, porDia, cobertura, totalAntes: prev.registros.length, totalDespues: registros.length },
  };
}

/** Guarda una revisión manual (validada) sobre un registro. */
export function applyReview(dataset, universoId, h, rv) {
  const u = dataset.universos[universoId];
  const registros = u.registros.map((r) => (r.h === h ? { ...r, rv: { ...(r.rv ?? {}), ...rv, fecha: rv.fecha ?? new Date().toISOString().slice(0, 10) } } : r));
  return { ...dataset, universos: { ...dataset.universos, [universoId]: { ...u, registros } } };
}

export function upsertDestacado(dataset, item) {
  const rest = (dataset.destacados ?? []).filter((d) => d.id !== item.id);
  return { ...dataset, destacados: [...rest, { ...item, revisado: true }] };
}

export const removeDestacado = (dataset, id) => ({ ...dataset, destacados: (dataset.destacados ?? []).filter((d) => d.id !== id) });

export function exportDataset(dataset, now = new Date()) {
  const universos = Object.fromEntries(
    Object.entries(dataset.universos).map(([id, u]) => [id, { ...u, registros: u.registros.map(stripLocal) }]),
  );
  return { ...dataset, version: DATASET_VERSION, generado: now.toISOString(), universos };
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const PROHIBIDOS = ['_local', 'texto', 'autor', 'url', 'pais', 'usuario'];
const SENT = new Set(SENTIMIENTOS.map((s) => s.id));
const PLAT = new Set(PLATAFORMAS.map((p) => p.id));

/** Valida la estructura del JSON publicado y que no contenga datos personales. */
export function validateDataset(ds) {
  const errores = [];
  if (!ds || typeof ds !== 'object') return ['El archivo no es un objeto JSON.'];
  if (ds.version !== DATASET_VERSION) errores.push(`Versión de datos no compatible: ${ds.version}.`);
  if (!ds.universos || typeof ds.universos !== 'object') errores.push('Falta «universos».');
  for (const [id, u] of Object.entries(ds.universos ?? {})) {
    if (!Array.isArray(u.registros)) {
      errores.push(`Universo ${id}: «registros» debe ser una lista.`);
      continue;
    }
    const vistos = new Set();
    u.registros.forEach((r, i) => {
      if (!r.h || !DIA.test(r.d)) errores.push(`Universo ${id}, registro ${i}: falta hash o fecha válida.`);
      if (vistos.has(r.h)) errores.push(`Universo ${id}: registro duplicado ${r.h}.`);
      vistos.add(r.h);
      if (!PLAT.has(r.p)) errores.push(`Universo ${id}, registro ${i}: plataforma desconocida «${r.p}».`);
      if (!SENT.has(r.so)) errores.push(`Universo ${id}, registro ${i}: sentimiento original desconocido «${r.so}».`);
      for (const k of PROHIBIDOS) if (k in r) errores.push(`Universo ${id}, registro ${i}: contiene el campo no publicable «${k}».`);
    });
    for (const c of u.cobertura ?? []) if (!DIA.test(c.desde) || !DIA.test(c.hasta)) errores.push(`Universo ${id}: cobertura inválida.`);
  }
  (ds.destacados ?? []).forEach((d, i) => {
    if (d.revisado !== true) errores.push(`Destacado ${i}: debe estar revisado expresamente.`);
    if (d.url && !/^https:\/\//.test(d.url)) errores.push(`Destacado ${i}: la URL debe empezar por https://.`);
  });
  return errores.slice(0, 50);
}
