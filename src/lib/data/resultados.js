// Análisis sobre los resultados públicos agregados. Funciones puras: las usan la web y las pruebas.
// Reglas centrales:
//   · un día sin cobertura es «sin datos» (null), nunca cero;
//   · la serie diaria admite cualquier rango; las distribuciones solo existen por periodo base
//     completo y por grupo («relevantes» o el universo captado = relevantes + resto);
//   · lo que no alcanza el umbral de privacidad se muestra agrupado o como muestra insuficiente.
import { EMOCIONES, PLATAFORMAS, SENTIMIENTOS, TEMAS, INTENCIONES } from '../../config/clasificacion.js';
import { ENTIDADES, entidad } from '../../config/marcas.js';
import { addDays, dayRange, daysBetween, isCovered, rangeLabel } from './dates.js';

export const SEGMENTOS = [
  { id: 'relevantes', nombre: 'Sobre cáncer de mama' },
  { id: 'todas', nombre: 'Todo lo captado' },
];
export const FILTROS_VACIOS = { segmento: 'relevantes' };
export const MUESTRA_MINIMA = 30;
export const SOV_DIAS_MINIMOS = 7;
export const umbral = (res) => res?.umbral ?? 10;

export const FRANJAS = [
  { id: 'madrugada', nombre: 'Madrugada (0–5 h)' },
  { id: 'manana', nombre: 'Mañana (6–11 h)' },
  { id: 'tarde', nombre: 'Tarde (12–17 h)' },
  { id: 'noche', nombre: 'Noche (18–23 h)' },
  { id: 'sin_hora', nombre: 'Sin hora registrada' },
];
export const TIPOS = [
  { id: 'article', nombre: 'Artículos' },
  { id: 'tweet', nombre: 'Publicaciones en X' },
  { id: 'quote tweet', nombre: 'Citas en X' },
  { id: 'comment', nombre: 'Comentarios' },
  { id: 'post', nombre: 'Publicaciones' },
  { id: 'video', nombre: 'Videos' },
  { id: 'reels', nombre: 'Reels' },
  { id: 'sin_tipo', nombre: 'Sin tipo' },
];
export const ESTADOS_RESTO = [
  { id: 'no', nombre: 'Ruido: no aporta sobre cáncer de mama', color: '#5E4457' },
  { id: 'dudosa', nombre: 'Contextual o dudosa', color: '#8A6C80' },
  { id: 'pendiente', nombre: 'Aún sin clasificar', color: '#4A2A40' },
];

const soloRelevantes = (f) => (f.segmento ?? 'relevantes') === 'relevantes';

/** Serie diaria del grupo elegido: base maestra en días cubiertos; referencia preliminar en el resto (solo universo). */
export function dailyTotals(res, f) {
  const rel = soloRelevantes(f);
  const porDia = new Map((res.diario ?? []).map((x) => [x.d, x]));
  const base = res.base;
  return dayRange(f.desde, f.hasta).map((d) => {
    if (isCovered(res.cobertura, d)) {
      const x = porDia.get(d) ?? { n: 0, cl: 0, rel: 0 };
      return { d, v: rel ? x.rel : x.n, n: x.n, cl: x.cl, rel: x.rel, src: 'base-maestra' };
    }
    if (base?.diario?.[d] != null) return rel ? { d, v: null, src: 'referencia-filtrada' } : { d, v: base.diario[d], src: 'referencia' };
    if (base?.bloques?.some((b) => b.desde <= d && d <= b.hasta)) return { d, v: null, src: 'bloque' };
    return { d, v: null, src: null };
  });
}

function usableBlocks(res, f) {
  if (soloRelevantes(f)) return [];
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

/** Relevancia de un tramo de días: relevantes sobre clasificadas (serie diaria, sin cruces). */
export function relevanciaRango(res, desde, hasta = desde) {
  const xs = (res.diario ?? []).filter((y) => desde <= y.d && y.d <= hasta);
  const s = xs.reduce((a, x) => ({ rel: a.rel + x.rel, cl: a.cl + x.cl, n: a.n + x.n }), { rel: 0, cl: 0, n: 0 });
  return s.cl ? { ...s, pct: (s.rel / s.cl) * 100 } : null;
}
export const relevanciaDia = (res, d) => relevanciaRango(res, d, d);

// ── Distribuciones por periodo base ────────────────────────────────────────────────────────

/** Periodos base con datos que tocan el rango; las distribuciones siempre los incluyen completos. */
export function periodosDe(res, f) {
  const ps = (res.periodos ?? []).filter((p) => p.desde <= f.hasta && p.hasta >= f.desde);
  const dias = (res.diario ?? []).filter((x) => x.n && ps.some((p) => p.desde <= x.d && x.d <= p.hasta)).map((x) => x.d);
  const fuera = dias.filter((d) => d < f.desde || d > f.hasta);
  return { periodos: ps, completo: !fuera.length, desde: dias[0], hasta: dias[dias.length - 1] };
}

/** Suma distribuciones exclusivas: lo agrupado o suprimido en alguna parte queda en «otras». */
export function sumarExclusivas(partes) {
  const agrupadas = new Set();
  let otras = 0;
  let sinDesglose = 0;
  for (const { dist, n } of partes) {
    if (!n) continue;
    if (dist == null) sinDesglose += n;
    else for (const id of dist.otras?.ids ?? []) agrupadas.add(id);
  }
  const v = new Map();
  for (const { dist, n } of partes) {
    if (!n || dist == null) continue;
    otras += dist.otras?.n ?? 0;
    for (const [id, x] of Object.entries(dist.v)) {
      if (agrupadas.has(id)) otras += x;
      else v.set(id, (v.get(id) ?? 0) + x);
    }
  }
  return { v, otras: otras ? { n: otras, ids: [...agrupadas].sort() } : null, sinDesglose };
}

/** Suma distribuciones multietiqueta: si una etiqueta está bajo el umbral en alguna parte, no se cifra. */
export function sumarMultiples(partes) {
  const menores = new Set(partes.flatMap((p) => p.dist?.menores ?? []));
  const v = new Map();
  for (const { dist } of partes) for (const [id, x] of Object.entries(dist?.v ?? {})) if (!menores.has(id)) v.set(id, (v.get(id) ?? 0) + x);
  return { v, menores: [...menores].filter((id) => !v.has(id)).sort() };
}

/** Suma objetos de celdas { id: n | null }: un null en cualquier parte deja el total en null. */
export function sumarCeldas(partes) {
  const out = {};
  for (const parte of partes) for (const [id, n] of Object.entries(parte)) out[id] = out[id] === null || n == null ? null : (out[id] ?? 0) + n;
  return out;
}

const OTRAS_COLOR = '#5E4457';
/**
 * Lista ordenada para los gráficos. `excluir`: categorías que no se muestran (p. ej. «no aplica»);
 * si alguna quedó agrupada en «otras», el grupo no se puede interpretar y se omite.
 */
function lista(sum, catalogo, { excluir = [], nombreDe } = {}) {
  const nombre = (id) => catalogo.find((c) => c.id === id)?.nombre ?? nombreDe?.(id) ?? id;
  const items = [...sum.v.entries()]
    .filter(([id, v]) => v > 0 && !excluir.includes(id))
    .map(([id, v]) => ({ id, nombre: nombre(id), v, color: catalogo.find((c) => c.id === id)?.color }))
    .sort((a, b) => b.v - a.v);
  const grupoOtras = sum.otras && !sum.otras.ids.some((id) => excluir.includes(id));
  const otrasN = (grupoOtras ? sum.otras.n : 0) + (sum.sinDesglose && !excluir.length ? sum.sinDesglose : 0);
  if (otrasN)
    items.push({
      id: 'otras',
      nombre: sum.sinDesglose ? 'Otras o sin desglose' : 'Otras (agrupadas)',
      v: otrasN,
      color: OTRAS_COLOR,
      agrupa: grupoOtras ? sum.otras.ids.map(nombre) : [],
    });
  return { items, incompleta: Boolean((sum.otras && !grupoOtras) || (sum.sinDesglose && excluir.length)), menores: (sum.menores ?? []).map(nombre) };
}

const vacia = { items: [], incompleta: false, menores: [] };

/**
 * Vista para un rango y un grupo. Con «relevantes» alimenta todos los gráficos temáticos; con
 * «todas» solo publica el contexto del universo captado: volumen, relevancia, plataformas,
 * franjas horarias y marcas.
 */
export function view(res, f) {
  const rel = soloRelevantes(f);
  const dias = dailyTotals(res, f);
  const stats = periodStats(res, f);
  const { periodos, completo, desde, hasta } = periodosDe(res, f);
  const k = umbral(res);
  const notas = [];
  if (periodos.length && !completo) notas.push(`Las distribuciones se publican por periodo completo: incluyen del ${rangeLabel(desde, hasta)}.`);

  const partesDe = (dim, grupos) => periodos.flatMap((p) => grupos.map((g) => ({ dist: p[g][dim], n: p[g].n })));
  const grupos = rel ? ['relevantes'] : ['relevantes', 'resto'];
  const ex = (dim, cat, opts) => lista(sumarExclusivas(partesDe(dim, grupos)), cat, opts);
  const mu = (dim, cat, opts, gs = grupos) => lista({ ...sumarMultiples(partesDe(dim, gs)), otras: null, sinDesglose: 0 }, cat, opts);

  const relevantes = periodos.reduce((a, p) => a + p.relevantes.n, 0);
  const resto = periodos.reduce((a, p) => a + p.resto.n, 0);
  const clasificados = periodos.reduce((a, p) => a + p.clasificados, 0);
  const estado = sumarExclusivas(periodos.map((p) => ({ dist: p.resto.estado, n: p.resto.n })));
  const est = (id) => (estado.otras?.ids.includes(id) || estado.sinDesglose ? null : estado.v.get(id) ?? 0);
  const inter = periodos.flatMap((p) => grupos.map((g) => p[g].interacciones));
  const rev = periodos.map((p) => p.revisar);

  // Referencia preliminar (sin base maestra): plataformas del periodo completo de SentiOne.
  const ref = res.base?.distribuciones;
  let plataformas = ex('plataformas', PLATAFORMAS);
  if (!periodos.length && !rel && ref && ref.desde >= f.desde && ref.hasta <= f.hasta && !dayRange(ref.desde, ref.hasta).some((d) => isCovered(res.cobertura, d))) {
    plataformas = lista({ v: new Map(Object.entries(ref.plataformas)), otras: null, sinDesglose: 0 }, PLATAFORMAS);
    notas.push('Plataformas de la referencia preliminar de SentiOne (filas exportadas, sin deduplicar).');
  }

  return {
    segmento: rel ? 'relevantes' : 'todas',
    umbral: k,
    dias,
    stats,
    picos: peaks(dias),
    periodos: periodos.map((p) => p.id),
    desde,
    hasta,
    // Denominadores: el universo captado del periodo y el grupo mostrado.
    universo: relevantes + resto,
    registros: rel ? relevantes : relevantes + resto,
    clasificados,
    relevancia: { si: relevantes, dudosa: est('dudosa'), no: est('no'), pendiente: est('pendiente'), resto },
    revisar: rev.some((x) => x == null) ? null : rev.reduce((a, b) => a + b, 0),
    plataformas,
    franjas: ex('franjas', FRANJAS),
    tipos: rel ? ex('tipos', TIPOS) : vacia,
    sentimiento: rel ? ex('sentimiento', SENTIMIENTOS) : vacia,
    haciaSistema: rel ? ex('haciaSistema', SENTIMIENTOS, { excluir: ['no_aplica'] }) : vacia,
    haciaMarca: rel ? ex('haciaMarca', SENTIMIENTOS, { excluir: ['no_aplica'] }) : vacia,
    emociones: rel ? ex('emociones', EMOCIONES) : vacia,
    temas: rel ? mu('temas', TEMAS) : vacia,
    intenciones: rel ? mu('intenciones', INTENCIONES) : vacia,
    marcas: mu('marcas', ENTIDADES),
    hashtags: rel ? mu('hashtags', []) : vacia,
    // Celdas sumables entre periodos: si alguna parte está suprimida, el total no se cifra.
    patrones: rel ? sumarCeldas(periodos.map((p) => p.relevantes.patrones ?? {})) : {},
    // Temática principal por laboratorio: solo con un periodo base (sumar periodos no la conserva).
    laboratorios: rel && periodos.length === 1 ? (periodos[0].relevantes.laboratorios ?? {}) : {},
    temasConLaboratorio: !rel
      ? vacia
      : periodos.some((p) => p.relevantes.conLaboratorio !== 0 && p.relevantes.temasConLaboratorio == null)
        ? { ...vacia, incompleta: true }
        : mu('temasConLaboratorio', TEMAS),
    conLaboratorio: sumarCeldas(periodos.map((p) => ({ x: p.relevantes.conLaboratorio ?? 0 }))).x ?? null,
    interacciones: inter.length && inter.every(Boolean) ? { total: inter.reduce((a, x) => a + x.total, 0), registros: inter.reduce((a, x) => a + x.registros, 0) } : null,
    notas,
  };
}

/** Presencia de cada marca en la consulta: menciones sobre cáncer de mama y en el universo captado. */
export function marcasView(res, f, ids) {
  const { periodos } = periodosDe(res, f);
  const sumar = (gs) => sumarMultiples(periodos.flatMap((p) => gs.map((g) => ({ dist: p[g].marcas }))));
  const r = sumar(['relevantes']);
  const t = sumar(['relevantes', 'resto']);
  const valor = (s, id) => (s.menores.includes(id) ? null : s.v.get(id) ?? 0);
  return ids.map((id) => ({ id, info: entidad(id), relevantes: valor(r, id), todas: valor(t, id) }));
}

/**
 * Share of Voice: solo si la consulta captura a todas las marcas con criterio equivalente,
 * hay al menos SOV_DIAS_MINIMOS días de base maestra y cada marca supera el umbral de publicación.
 */
export function shareOfVoice(res, f, ids) {
  const sinCobertura = ids.filter((id) => entidad(id)?.cobertura !== 'equivalente');
  if (sinCobertura.length) return { ok: false, motivo: 'cobertura', sinCobertura };
  const dias = dayRange(f.desde, f.hasta).filter((d) => isCovered(res.cobertura, d));
  if (dias.length < SOV_DIAS_MINIMOS) return { ok: false, motivo: 'periodo' };
  const valores = marcasView(res, f, ids).map((x) => ({ id: x.id, v: x.todas }));
  if (valores.some((x) => x.v == null)) return { ok: false, motivo: 'muestra' };
  const total = valores.reduce((a, x) => a + x.v, 0);
  if (!total) return { ok: false, motivo: 'sin-menciones' };
  return { ok: true, dias: dias.length, total, valores: valores.map((x) => ({ ...x, pct: (x.v / total) * 100 })) };
}

export const tieneBaseMaestra = (res) => res.cobertura.length > 0 && res.totales.unicos > 0;
export const diasCubiertos = (res, desde, hasta) => dayRange(desde, hasta).filter((d) => isCovered(res.cobertura, d)).length;

/** Notas de privacidad para el pie de un gráfico: grupos, etiquetas sin cifra y muestras insuficientes. */
export function notasPrivacidad(l, k) {
  const out = [];
  if (l.items.some((x) => x.id === 'otras')) out.push(`«Otras» agrupa categorías con menos de ${k} menciones (y, si hace falta, la siguiente más pequeña) para que ninguna se pueda deducir.`);
  if (l.menores.length) out.push(`Con menos de ${k} menciones, sin cifra: ${l.menores.join(', ').toLowerCase()}.`);
  if (l.incompleta) out.push(`Parte de las menciones no se desglosa porque no alcanza el umbral de ${k}.`);
  return out;
}
