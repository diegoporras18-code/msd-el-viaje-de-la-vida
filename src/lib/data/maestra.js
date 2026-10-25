// Base maestra acumulativa de SentiOne (privada del proceso de actualización).
// Guarda un registro seudonimizado por mención única: sin textos, URLs, autores ni país.
// Cada registro puede tener varias temáticas y mencionar varias marcas: nunca se duplica.
import { CONFIANZA_MINIMA, CRITERIOS_VERSION, EMOCIONES, HACIA, INTENCIONES, RELEVANCIA, SENTIMIENTOS, TEMAS } from '../../config/clasificacion.js';
import { IDS_ENTIDADES } from '../../config/marcas.js';
import { mergeIntervals } from './dates.js';

export const MAESTRA_VERSION = 1;

export const emptyMaestra = () => ({ version: MAESTRA_VERSION, actualizado: null, cobertura: [], importaciones: [], registros: [] });

const strip = ({ _local, ...rest }) => rest;
const sortRegs = (a, b) => a.d.localeCompare(b.d) || (a.t ?? -1) - (b.t ?? -1) || a.h.localeCompare(b.h);
const countByDay = (regs) => regs.reduce((acc, r) => ((acc[r.d] = (acc[r.d] ?? 0) + 1), acc), {});

/** Clasificación válida y vigente (Claude, Codex o revisión manual). Las reglas no cuentan. */
export const clasificado = (r) => Boolean(r.c && ['claude', 'codex', 'manual'].includes(r.c.fuente) && !r.c.obsoleta);

/**
 * Incorpora una exportación a la base maestra.
 * - Nunca vuelve a sumar un registro existente (misma clave estable).
 * - Actualiza métricas y datos de SentiOne de los existentes.
 * - Conserva las clasificaciones; si el texto cambió, la marca como obsoleta para reclasificar.
 */
export function mergeExport(maestra, procesados, meta = {}) {
  const byHash = new Map(maestra.registros.map((r) => [r.h, r]));
  const antes = countByDay(maestra.registros);
  let nuevos = 0;
  let existentes = 0;
  let actualizados = 0;
  let modificados = 0;

  for (const raw of procesados) {
    const r = strip(raw);
    const old = byHash.get(r.h);
    if (!old) {
      nuevos++;
      byHash.set(r.h, r);
      continue;
    }
    existentes++;
    const metricas = JSON.stringify(old.m ?? null) !== JSON.stringify(r.m ?? null);
    const editado = Boolean(old.th && r.th && old.th !== r.th);
    if (metricas) actualizados++;
    if (editado) modificados++;
    const c = old.c ? (editado && old.c.fuente !== 'manual' ? { ...old.c, obsoleta: true } : old.c) : undefined;
    byHash.set(r.h, { ...old, ...r, d: old.d, t: old.t ?? r.t, ...(c ? { c } : {}) });
  }

  const registros = [...byHash.values()].sort(sortRegs);
  const fechas = procesados.map((r) => r.d).sort();
  const desde = meta.desde ?? fechas[0];
  const hasta = meta.hasta ?? fechas[fechas.length - 1];
  const cobertura = desde && hasta ? mergeIntervals([...maestra.cobertura, { desde, hasta }]) : maestra.cobertura;
  const importacion = {
    fecha: meta.fecha ?? new Date().toISOString(),
    desde: desde ?? null,
    hasta: hasta ?? null,
    filasBrutas: meta.filasBrutas ?? procesados.length,
    unicasArchivo: procesados.length,
    nuevos,
    existentes,
    actualizados,
    modificados,
  };
  const despues = countByDay(registros);
  const porDia = [...new Set([...Object.keys(antes), ...Object.keys(despues)])]
    .sort()
    .map((d) => ({ d, antes: antes[d] ?? 0, despues: despues[d] ?? 0 }))
    .filter((x) => x.antes !== x.despues);

  return {
    maestra: { ...maestra, actualizado: importacion.fecha, cobertura, importaciones: [...maestra.importaciones, importacion], registros },
    informe: { ...importacion, totalAntes: maestra.registros.length, totalDespues: registros.length, porDia, cobertura },
  };
}

/** Registros que necesitan clasificación semántica (nuevos, editados o con criterios antiguos). */
export function pendientes(maestra, { reclasificarVersion = false } = {}) {
  return maestra.registros.filter(
    (r) => !clasificado(r) || (reclasificarVersion && r.c.fuente !== 'manual' && r.c.version !== CRITERIOS_VERSION),
  );
}

/**
 * Prepara lotes para que Claude clasifique. Los textos idénticos (reposts, réplicas)
 * se agrupan y se clasifican una sola vez. Solo se pueden clasificar los registros
 * cuyo texto está en la exportación actual.
 */
export function buildLotes(maestra, procesados, { tam = 60, reclasificarVersion = false } = {}) {
  const textos = new Map(procesados.map((r) => [r.h, r._local?.texto ?? '']));
  const grupos = new Map();
  let sinTexto = 0;
  for (const r of pendientes(maestra, { reclasificarVersion })) {
    if (!textos.has(r.h)) {
      sinTexto++;
      continue;
    }
    if (!textos.get(r.h).trim()) {
      sinTexto++;
      continue;
    }
    const clave = r.th ?? r.h;
    if (!grupos.has(clave)) {
      grupos.set(clave, { clave, hs: [], fecha: r.d, plataforma: r.p, sentimientoSentiOne: r.so, menciones: r.ent ?? [], hashtags: r.tg ?? [], texto: textos.get(r.h).slice(0, 1500) });
    }
    grupos.get(clave).hs.push(r.h);
  }
  const items = [...grupos.values()];
  const lotes = [];
  for (let i = 0; i < items.length; i += tam) lotes.push({ lote: `lote-${String(lotes.length + 1).padStart(3, '0')}`, criterios: CRITERIOS_VERSION, items: items.slice(i, i + tam) });
  return { lotes, grupos: items.length, registros: items.reduce((a, x) => a + x.hs.length, 0), sinTexto };
}

const SET = {
  rel: new Set(RELEVANCIA.map((x) => x.id)),
  s: new Set(SENTIMIENTOS.map((x) => x.id)),
  hacia: new Set(HACIA),
  tm: new Set(TEMAS.map((x) => x.id)),
  e: new Set(EMOCIONES.map((x) => x.id)),
  ia: new Set(INTENCIONES.map((x) => x.id)),
};

/** Valida un resultado de clasificación devuelto por Claude. Devuelve la lista de errores. */
export function validarResultado(x) {
  const err = [];
  if (!x || typeof x !== 'object') return ['no es un objeto'];
  if (!SET.rel.has(x.rel)) err.push(`relevancia inválida «${x.rel}»`);
  if (!SET.s.has(x.s)) err.push(`sentimiento inválido «${x.s}»`);
  if (!SET.hacia.has(x.sm)) err.push(`sentimiento hacia MSD/campaña inválido «${x.sm}»`);
  if (!SET.hacia.has(x.ss)) err.push(`sentimiento hacia el sistema de salud inválido «${x.ss}»`);
  if (!Array.isArray(x.temas) || x.temas.some((t) => !SET.tm.has(t))) err.push('temas inválidos');
  if (!SET.e.has(x.e)) err.push(`emoción inválida «${x.e}»`);
  if (!Array.isArray(x.i) || !x.i.length || x.i.some((t) => !SET.ia.has(t))) err.push('intenciones inválidas');
  if (!Array.isArray(x.marcas) || x.marcas.some((m) => !IDS_ENTIDADES.has(m))) err.push('marcas inválidas');
  if (typeof x.conf !== 'number' || x.conf < 0 || x.conf > 1) err.push('confianza fuera de 0–1');
  if (x.rel === 'si' && Array.isArray(x.temas) && !x.temas.length) err.push('un registro relevante necesita al menos una temática');
  return err;
}

/**
 * Aplica los resultados de un lote. Nunca sobrescribe una revisión manual salvo que la
 * fuente del lote sea 'manual'. Los textos y motivos no se guardan.
 */
export function aplicarResultados(maestra, lote, resultados, { fuente = 'claude', fecha = new Date().toISOString().slice(0, 10) } = {}) {
  const porClave = new Map(lote.items.map((it) => [it.clave, it]));
  const porH = new Map(maestra.registros.map((r, i) => [r.h, i]));
  const registros = [...maestra.registros];
  const errores = [];
  const vistos = new Set();
  let aplicados = 0;
  let protegidos = 0;
  let revisar = 0;

  for (const x of resultados) {
    const it = porClave.get(x?.clave);
    if (!it) {
      errores.push(`clave desconocida «${x?.clave}»`);
      continue;
    }
    const e = validarResultado(x);
    if (e.length) {
      errores.push(`${x.clave}: ${e.join('; ')}`);
      continue;
    }
    vistos.add(x.clave);
    const rv = Boolean(x.revisar) || x.conf < CONFIANZA_MINIMA || x.rel === 'dudosa' || x.s === 'indeterminado';
    if (rv) revisar += it.hs.length;
    const c = { fuente, version: CRITERIOS_VERSION, fecha, rel: x.rel, s: x.s, sm: x.sm, ss: x.ss, tm: [...new Set(x.temas)], e: x.e, ia: [...new Set(x.i)], mc: [...new Set(x.marcas)], conf: Math.round(x.conf * 100) / 100, rv };
    for (const h of it.hs) {
      const idx = porH.get(h);
      if (idx == null) continue;
      if (registros[idx].c?.fuente === 'manual' && fuente !== 'manual') {
        protegidos++;
        continue;
      }
      const anterior = registros[idx].c;
      registros[idx] = { ...registros[idx], c: anterior?.obsoleta ? { ...c, prev: anterior } : c };
      aplicados++;
    }
  }
  const faltantes = lote.items.filter((it) => !vistos.has(it.clave)).map((it) => it.clave);
  return { maestra: { ...maestra, registros }, informe: { aplicados, protegidos, revisar, errores, faltantes } };
}

// Códigos de las revisiones de relevancia (auditoría semántica). Nunca texto libre.
export const CODIGOS_REVISION = {
  tema_central: 'El contenido principal trata el cáncer de mama',
  contexto_politico: 'Figura política: el cáncer de mama aparece como causa beneficiaria, no como tema principal',
  mencion_secundaria: 'Otro tema principal con un pasaje sobre cáncer de mama',
  comentario_sin_contenido: 'Reacción sin contenido propio bajo una publicación sobre cáncer de mama',
  ruido_politico: 'Comentario político sin contenido sobre la enfermedad',
  ajeno: 'No trata cáncer de mama (otros cánceres, oraciones, condolencias genéricas)',
  marca_verificada: 'Laboratorio nombrado de forma explícita, verificado en el texto',
};

/**
 * Aplica una revisión manual focalizada. Nunca borra registros: conserva la clasificación
 * anterior en `c.prev` y el código de la revisión en `c.aud`, y marca la fuente como 'manual'
 * para que ninguna clasificación automática posterior la sobrescriba.
 * cambios: [{ hs: [h], rel?, codigo, s?, sm?, ss?, tm?, e?, ia?, mc?, conf? }]
 */
export function aplicarRevision(maestra, cambios, { fecha = new Date().toISOString().slice(0, 10) } = {}) {
  const porH = new Map(maestra.registros.map((r, i) => [r.h, i]));
  const registros = [...maestra.registros];
  const errores = [];
  let aplicados = 0;
  for (const x of cambios) {
    if (!CODIGOS_REVISION[x.codigo]) {
      errores.push(`código de revisión desconocido «${x.codigo}»`);
      continue;
    }
    for (const h of x.hs ?? []) {
      const idx = porH.get(h);
      if (idx == null) {
        errores.push(`registro desconocido ${h}`);
        continue;
      }
      const old = registros[idx].c;
      if (!old && !(x.s && x.tm)) {
        errores.push(`${h}: sin clasificación previa ni completa`);
        continue;
      }
      const { hs, codigo, ...campos } = x;
      const c = { ...(old ?? {}), ...campos, fuente: 'manual', fecha, rv: false, aud: codigo, prev: old ? { rel: old.rel, fuente: old.fuente, fecha: old.fecha, ...(campos.mc ? { mc: old.mc } : {}) } : null };
      if (old?.prev) c.prev = { ...c.prev, antes: old.prev };
      if (!c.version) c.version = CRITERIOS_VERSION;
      const e = validarResultado({ ...c, temas: c.tm, i: c.ia, marcas: c.mc });
      if (e.length) {
        errores.push(`${h}: ${e.join('; ')}`);
        continue;
      }
      registros[idx] = { ...registros[idx], c };
      aplicados++;
    }
  }
  return { maestra: { ...maestra, registros }, informe: { aplicados, errores } };
}

const PROHIBIDOS = ['_local', 'texto', 'autor', 'url', 'pais', 'usuario', 'motivo'];

/** Valida la base maestra: estructura, unicidad y ausencia de datos personales o textos. */
export function validarMaestra(m) {
  const errores = [];
  if (m?.version !== MAESTRA_VERSION) errores.push('Versión de base maestra no compatible.');
  const vistos = new Set();
  for (const [i, r] of (m?.registros ?? []).entries()) {
    if (!r.h || !/^\d{4}-\d{2}-\d{2}$/.test(r.d)) errores.push(`registro ${i}: falta hash o fecha`);
    if (vistos.has(r.h)) errores.push(`registro duplicado ${r.h}`);
    vistos.add(r.h);
    for (const k of PROHIBIDOS) if (k in r || (r.c && k in r.c)) errores.push(`registro ${i}: contiene el campo no permitido «${k}»`);
    if (r.c && r.c.fuente !== 'reglas') {
      const e = validarResultado({ ...r.c, temas: r.c.tm, i: r.c.ia, marcas: r.c.mc });
      if (e.length) errores.push(`registro ${i}: clasificación inválida (${e[0]})`);
    }
  }
  return errores.slice(0, 50);
}

/** Serializa con un registro por línea para que los cambios sean legibles en el historial. */
export function serializarMaestra(m) {
  const { registros, ...meta } = m;
  const cab = JSON.stringify(meta, null, 1).replace(/\n}$/, '');
  return `${cab},\n "registros": [\n${registros.map((r) => `  ${JSON.stringify(r)}`).join(',\n')}\n ]\n}\n`;
}
