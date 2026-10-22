// Genera los resultados públicos (src/data/resultados.json) a partir de la base maestra.
// Solo proyecciones agregadas predefinidas, nunca registros ni cruces detallados:
//   · totales generales y serie diaria (menciones, clasificadas y relevantes por día);
//   · por periodo base (sin solapes) y por grupo complementario —«relevantes» (hablan de
//     cáncer de mama) y «resto»—, distribuciones de UNA sola dimensión.
// Ninguna celda publicada fuera de la serie diaria es menor que UMBRAL: las categorías pequeñas
// se agrupan en «otras» (con supresión complementaria para que no se deduzcan por diferencia)
// y, si el grupo no alcanza el umbral, la distribución se publica como muestra insuficiente.
// Los cubos detallados y los registros individuales solo existen en el repositorio privado.
import { clasificado } from './maestra.js';
import { isCovered } from './dates.js';
import { PERIODOS_BASE } from '../../config/periodos.js';
import { PATRONES_SENTIMIENTO, cumplePatron } from '../../config/patrones.js';
import { LABORATORIOS } from '../../config/marcas.js';

const IDS_LAB = new Set(LABORATORIOS.map((l) => l.id));

export const RESULTADOS_VERSION = 3;
export const UMBRAL = 10;

// Franjas horarias (hora de Bogotá). La noche coincide con la franja del concierto.
export const FRANJAS = [
  { id: 'madrugada', nombre: 'Madrugada (0–5 h)', desde: 0, hasta: 5 },
  { id: 'manana', nombre: 'Mañana (6–11 h)', desde: 6, hasta: 11 },
  { id: 'tarde', nombre: 'Tarde (12–17 h)', desde: 12, hasta: 17 },
  { id: 'noche', nombre: 'Noche (18–23 h)', desde: 18, hasta: 23 },
  { id: 'sin_hora', nombre: 'Sin hora', desde: null, hasta: null },
];
const franja = (t) => (t == null ? 'sin_hora' : FRANJAS.find((f) => f.desde != null && t >= f.desde && t <= f.hasta).id);

// Dimensiones publicadas por grupo. «exclusiva»: cada mención cuenta una vez (suma = n);
// «multiple»: una mención puede tener varias etiquetas (no se puede restar).
const DIMENSIONES = {
  relevantes: {
    plataformas: ['exclusiva', (r) => r.p],
    franjas: ['exclusiva', (r) => franja(r.t)],
    tipos: ['exclusiva', (r) => r.tp ?? 'sin_tipo'],
    sentimiento: ['exclusiva', (r) => r.c.s],
    haciaSistema: ['exclusiva', (r) => r.c.ss ?? 'no_aplica'],
    haciaMarca: ['exclusiva', (r) => r.c.sm ?? 'no_aplica'],
    emociones: ['exclusiva', (r) => r.c.e],
    temas: ['multiple', (r) => r.c.tm],
    intenciones: ['multiple', (r) => r.c.ia],
    marcas: ['multiple', (r) => r.c.mc],
    hashtags: ['multiple', (r) => r.tg ?? []],
  },
  // El resto (coincidencias ajenas, relación dudosa y pendientes) solo se publica como contexto.
  resto: {
    estado: ['exclusiva', (r) => (clasificado(r) ? (r.c.rel === 'dudosa' ? 'dudosa' : 'no') : 'pendiente')],
    plataformas: ['exclusiva', (r) => r.p],
    franjas: ['exclusiva', (r) => franja(r.t)],
    marcas: ['multiple', (r) => (clasificado(r) ? r.c.mc : (r.ent ?? []).filter((e) => e !== 'otro-laboratorio'))],
  },
};

const contar = (rows, get) => {
  const m = new Map();
  for (const r of rows) for (const k of [].concat(get(r) ?? [])) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
};

/**
 * Distribución exclusiva con umbral: { v: {id: n≥K}, otras: { n≥K, ids: [≥2] } | null } o null
 * si el total no alcanza el umbral. Si una sola categoría queda bajo el umbral, se agrupa con la
 * siguiente más pequeña (supresión complementaria): así el total menos lo publicado nunca
 * revela una categoría individual pequeña.
 */
export function distribucionExclusiva(mapa, k = UMBRAL) {
  const total = [...mapa.values()].reduce((a, b) => a + b, 0);
  if (total < k) return total ? null : { v: {}, otras: null };
  const orden = [...mapa.entries()].filter(([, n]) => n > 0).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  const grupo = orden.filter(([, n]) => n < k);
  const resto = orden.filter(([, n]) => n >= k);
  while (grupo.length && (grupo.length < 2 || grupo.reduce((a, [, n]) => a + n, 0) < k) && resto.length) grupo.push(resto.shift());
  if (grupo.length === 1 || (grupo.length && grupo.reduce((a, [, n]) => a + n, 0) < k)) return null;
  return {
    v: Object.fromEntries(resto.sort((a, b) => b[1] - a[1]).map(([id, n]) => [id, n])),
    otras: grupo.length ? { n: grupo.reduce((a, [, n]) => a + n, 0), ids: grupo.map(([id]) => id).sort() } : null,
  };
}

/** Distribución multietiqueta: solo etiquetas con n ≥ K; las demás se listan sin cifra. */
export function distribucionMultiple(mapa, k = UMBRAL) {
  const orden = [...mapa.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return { v: Object.fromEntries(orden.filter(([, n]) => n >= k)), menores: orden.filter(([, n]) => n < k).map(([id]) => id).sort() };
}

const celda = (n, k = UMBRAL) => (n === 0 || n >= k ? n : null);

function grupo(rows, dims) {
  const out = { n: rows.length };
  for (const [nombre, [tipo, get]] of Object.entries(dims)) {
    const m = contar(rows, get);
    out[nombre] = tipo === 'exclusiva' ? distribucionExclusiva(m) : distribucionMultiple(m);
  }
  // Los hashtags poco frecuentes no se nombran: pueden ser nombres propios o etiquetas de una sola cuenta.
  if (out.hashtags) out.hashtags.menores = [];
  if (dims === DIMENSIONES.relevantes) {
    // Patrones de ejemplos: una celda por patrón, con supresión complementaria frente a su sentimiento.
    out.patrones = Object.fromEntries(
      PATRONES_SENTIMIENTO.map((p) => {
        const n = rows.filter((r) => cumplePatron(p, r)).length;
        const resto = rows.filter((r) => r.c.s === p.s).length - n;
        return [p.id, n >= UMBRAL && (resto === 0 || resto >= UMBRAL) ? n : null];
      }),
    );
    // Menciones que nombran al menos a un laboratorio (presencia agregada, nunca por marca pequeña).
    const conLab = rows.filter((r) => r.c.mc.some((m) => IDS_LAB.has(m)));
    out.conLaboratorio = celda(conLab.length);
    // Laboratorios que alcanzan el umbral: menciones y temática principal (sin «noticias»), solo si
    // la temática alcanza el umbral y el resto de sus menciones es cero o también lo alcanza.
    out.laboratorios = Object.fromEntries(
      LABORATORIOS.filter((l) => l.id !== 'otro-laboratorio')
        .map((l) => {
          const rs = rows.filter((r) => r.c.mc.includes(l.id));
          if (rs.length < UMBRAL) return null;
          const [tema, n] = [...contar(rs, (r) => r.c.tm).entries()].filter(([t]) => t !== 'noticias').sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? [];
          const ok = n >= UMBRAL && (rs.length - n === 0 || rs.length - n >= UMBRAL);
          return [l.id, { n: rs.length, tema: ok ? tema : null, temaN: ok ? n : null }];
        })
        .filter(Boolean),
    );
    // Temáticas de esas menciones en conjunto (nunca por laboratorio): solo etiquetas con n ≥ K.
    out.temasConLaboratorio = conLab.length >= UMBRAL ? distribucionMultiple(contar(conLab, (r) => r.c.tm)) : null;
  }
  const conMetrica = rows.filter((r) => r.m?.int != null);
  out.interacciones = conMetrica.length >= UMBRAL ? { total: conMetrica.reduce((a, r) => a + r.m.int, 0), registros: conMetrica.length } : null;
  return out;
}

export function buildResultados(maestra, referencia, { generado = new Date().toISOString() } = {}) {
  const totales = { unicos: 0, clasificados: 0, pendientes: 0, revisar: 0, relevantes: 0, dudosas: 0, noRelevantes: 0 };
  const porDia = new Map();
  const porPeriodo = new Map(PERIODOS_BASE.map((p) => [p.id, []]));

  // Solo se publican días cubiertos por completo: los registros de un día parcial (una exportación
  // que termina a mitad de día) se conservan en la base y se publican cuando la cobertura lo incluya.
  let fueraDeCobertura = 0;
  for (const r of maestra.registros) {
    if (!isCovered(maestra.cobertura, r.d)) {
      fueraDeCobertura++;
      continue;
    }
    const cl = clasificado(r);
    const rel = cl && r.c.rel === 'si';
    totales.unicos++;
    if (cl) {
      totales.clasificados++;
      if (r.c.rv) totales.revisar++;
      if (rel) totales.relevantes++;
      if (r.c.rel === 'dudosa') totales.dudosas++;
      if (r.c.rel === 'no') totales.noRelevantes++;
    } else totales.pendientes++;
    const dia = porDia.get(r.d) ?? { d: r.d, n: 0, cl: 0, rel: 0 };
    dia.n++;
    if (cl) dia.cl++;
    if (rel) dia.rel++;
    porDia.set(r.d, dia);
    const p = PERIODOS_BASE.find((x) => x.desde <= r.d && r.d <= x.hasta);
    if (!p) throw new Error(`La fecha ${r.d} no pertenece a ningún periodo base (src/config/periodos.js).`);
    porPeriodo.get(p.id).push(r);
  }

  const periodos = PERIODOS_BASE.filter((p) => porPeriodo.get(p.id).length).map((p) => {
    const rows = porPeriodo.get(p.id);
    const rel = rows.filter((r) => clasificado(r) && r.c.rel === 'si');
    const resto = rows.filter((r) => !(clasificado(r) && r.c.rel === 'si'));
    return {
      id: p.id,
      desde: p.desde,
      hasta: p.hasta,
      n: rows.length,
      clasificados: rows.filter(clasificado).length,
      // Menciones relevantes con confianza baja, marcadas para revisión (null: menos que el umbral).
      revisar: celda(rel.filter((r) => r.c.rv).length),
      relevantes: grupo(rel, DIMENSIONES.relevantes),
      resto: grupo(resto, DIMENSIONES.resto),
    };
  });

  const ultima = maestra.importaciones[maestra.importaciones.length - 1];
  return {
    version: RESULTADOS_VERSION,
    generado,
    umbral: UMBRAL,
    cobertura: maestra.cobertura,
    totales: { ...totales, fueraDeCobertura },
    actualizacion: ultima
      ? { fecha: ultima.fecha.slice(0, 10), filasBrutas: ultima.filasBrutas, unicasArchivo: ultima.unicasArchivo, nuevos: ultima.nuevos, existentes: ultima.existentes }
      : null,
    base: referencia ?? null,
    diario: [...porDia.values()].sort((a, b) => a.d.localeCompare(b.d)),
    periodos,
  };
}

const PROHIBIDOS = ['h', 'th', 'k', 'texto', 'url', 'autor', 'pais', 'usuario', '_local', 'motivo', 'archivo', 'cubo', 'hashtags_detalle'];
const CLAVES = ['version', 'generado', 'umbral', 'cobertura', 'totales', 'actualizacion', 'base', 'diario', 'periodos'];

/** Recorre las distribuciones de un grupo y devuelve los problemas de granularidad. */
export function revisarGranularidad(res) {
  const k = res.umbral;
  const err = [];
  for (const p of res.periodos ?? []) {
    if (p.revisar != null && p.revisar !== 0 && p.revisar < k) err.push(`${p.id}: revisión por debajo del umbral.`);
    for (const g of ['relevantes', 'resto']) {
      const gr = p[g];
      for (const [dim, x] of Object.entries(gr)) {
        if (dim === 'n' || x == null) continue;
        if (dim === 'laboratorios') {
          for (const [id, l] of Object.entries(x)) {
            if (l.n < k || (l.temaN != null && (l.temaN < k || (l.n - l.temaN !== 0 && l.n - l.temaN < k)))) err.push(`${p.id}/${g}/laboratorios/${id}: celda menor que ${k}.`);
          }
          continue;
        }
        if (dim === 'conLaboratorio' || dim === 'patrones') {
          for (const n of typeof x === 'number' ? [x] : Object.values(x)) if (n != null && n !== 0 && n < k) err.push(`${p.id}/${g}/${dim}: celda menor que ${k}.`);
          continue;
        }
        if (dim === 'interacciones') {
          if (x.registros < k) err.push(`${p.id}/${g}: interacciones con menos de ${k} registros.`);
          continue;
        }
        const vals = Object.values(x.v ?? {});
        if (vals.some((n) => n < k)) err.push(`${p.id}/${g}/${dim}: celda menor que ${k}.`);
        if ('otras' in x) {
          const suma = vals.reduce((a, b) => a + b, 0) + (x.otras?.n ?? 0);
          if (suma !== gr.n) err.push(`${p.id}/${g}/${dim}: la distribución no suma el total del grupo.`);
          if (x.otras && (x.otras.n < k || x.otras.ids.length < 2)) err.push(`${p.id}/${g}/${dim}: el grupo «otras» revela una categoría pequeña.`);
        } else if (!Array.isArray(x.menores)) err.push(`${p.id}/${g}/${dim}: formato desconocido.`);
        else if (x.menores.some((id) => id in x.v)) err.push(`${p.id}/${g}/${dim}: etiqueta publicada y suprimida a la vez.`);
      }
    }
  }
  return err;
}

/** Comprueba que los resultados públicos son agregados coherentes, sin datos privados ni cruces finos. */
export function validarResultados(res) {
  const errores = [];
  if (res?.version !== RESULTADOS_VERSION) return ['Versión de resultados no compatible.'];
  for (const c of Object.keys(res)) if (!CLAVES.includes(c)) errores.push(`Sección no publicable «${c}».`);
  const t = res.totales;
  const sum = (xs, f) => xs.reduce((a, x) => a + f(x), 0);
  if (sum(res.diario, (x) => x.n) !== t.unicos) errores.push('La serie diaria no suma el total único.');
  if (sum(res.diario, (x) => x.cl) !== t.clasificados) errores.push('La serie diaria no suma las clasificadas.');
  if (sum(res.diario, (x) => x.rel) !== t.relevantes) errores.push('La serie diaria no suma las relevantes.');
  if (t.clasificados + t.pendientes !== t.unicos) errores.push('Clasificados + pendientes no coincide con el total.');
  if (t.relevantes + t.dudosas + t.noRelevantes !== t.clasificados) errores.push('La relevancia no suma las clasificadas.');
  for (const x of res.diario) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x.d)) errores.push('Fecha inválida en los resultados.');
    if (Object.keys(x).some((c) => !['d', 'n', 'cl', 'rel'].includes(c))) errores.push('La serie diaria solo admite fecha, menciones, clasificadas y relevantes.');
  }
  for (const p of res.periodos) {
    const dias = res.diario.filter((x) => p.desde <= x.d && x.d <= p.hasta);
    if (sum(dias, (x) => x.n) !== p.n || sum(dias, (x) => x.rel) !== p.relevantes.n || p.relevantes.n + p.resto.n !== p.n) errores.push(`${p.id}: el periodo no cuadra con la serie diaria.`);
  }
  const visitar = (o) => {
    if (Array.isArray(o)) return o.forEach(visitar);
    if (o && typeof o === 'object') for (const [c, v] of Object.entries(o)) {
      if (PROHIBIDOS.includes(c)) errores.push(`Campo no publicable «${c}».`);
      visitar(v);
    }
  };
  visitar({ diario: res.diario, periodos: res.periodos });
  errores.push(...revisarGranularidad(res));
  const b = res.base;
  if (b) {
    const s = (o) => Object.values(o ?? {}).reduce((a, x) => a + x, 0);
    const diario = s(b.diario);
    if (b.distribuciones && s(b.distribuciones.plataformas) !== diario) errores.push('La referencia: plataformas no suman el total diario.');
    if (b.distribuciones && s(b.distribuciones.sentimiento) !== diario) errores.push('La referencia: sentimientos no suman el total diario.');
    if (b.exportacion && diario + (b.bloques ?? []).reduce((a, x) => a + x.total, 0) !== b.exportacion.total) errores.push('La referencia no suma el total exportado.');
  }
  return [...new Set(errores)].slice(0, 30);
}
