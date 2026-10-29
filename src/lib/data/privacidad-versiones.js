// Protección conjunta: dos vistas de una misma base no deben revelar celdas pequeñas
// al restarlas. No modifica ni los originales, ni los totales, ni la serie diaria.
const K = 10;
const pequena = (a, b) => Math.abs(a - b) > 0 && Math.abs(a - b) < K;
const numero = x => typeof x === 'number' && Number.isFinite(x);
const claves = (a, b) => [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].sort();

function exclusiva(a, b) {
  if (!a || !b) return [null, null];
  const ocultas = new Set([...(a.otras?.ids ?? []), ...(b.otras?.ids ?? [])]);
  for (const id of claves(a.v, b.v)) {
    if (pequena(a.v[id] ?? 0, b.v[id] ?? 0)) ocultas.add(id);
  }
  const suma = (x, ids) => {
    const grupo = x.otras?.ids ?? [];
    // Una agrupación publicada no se desagrega para fabricar cifras nuevas.
    if (grupo.some(id => ids.has(id)) && !grupo.every(id => ids.has(id))) return null;
    return [...ids].reduce((n, id) => n + (x.v[id] ?? 0), 0)
      + (grupo.length && grupo.every(id => ids.has(id)) ? x.otras.n : 0);
  };
  const seguras = () => {
    const na = suma(a, ocultas), nb = suma(b, ocultas);
    return ocultas.size >= 2 && na >= K && nb >= K && !pequena(na, nb);
  };
  if (ocultas.size) {
    const candidatos = claves(a.v, b.v).filter(id => !ocultas.has(id))
      .sort((x, y) => ((a.v[x] ?? 0) + (b.v[x] ?? 0)) - ((a.v[y] ?? 0) + (b.v[y] ?? 0)) || x.localeCompare(y));
    while (!seguras() && candidatos.length) ocultas.add(candidatos.shift());
    if (!seguras()) return [null, null];
  }
  return [a, b].map(x => ({
    v: Object.fromEntries(Object.entries(x.v).filter(([id]) => !ocultas.has(id))),
    otras: ocultas.size ? { n: suma(x, ocultas), ids: [...ocultas].sort() } : null,
  }));
}

function multiple(a, b, { ocultarIds = false } = {}) {
  if (!a || !b) return [null, null];
  const ids = claves(a.v, b.v).filter(id => numero(a.v[id]) && numero(b.v[id]) && !pequena(a.v[id], b.v[id]));
  // Una celda suprimida no es una ausencia. Conservamos su estado en ambas
  // vistas; los hashtags se omiten por completo para no revelar identificantes.
  const menores = ocultarIds ? [] : [...new Set([...(a.menores ?? []), ...(b.menores ?? []),
    ...claves(a.v, b.v).filter(id => !ids.includes(id))])].sort();
  return [a, b].map(x => ({ v: Object.fromEntries(ids.map(id => [id, x.v[id]])), menores: [...menores] }));
}

function escalar(a, b) {
  return numero(a) && numero(b) && !pequena(a, b) ? [a, b] : [null, null];
}

function grupo(a, b) {
  if (!a || !b) return;
  for (const key of claves(a, b)) {
    if (key === 'n') continue;
    const x = a[key], y = b[key];
    if (key === 'interacciones') {
      // Con distintos participantes, la resta de sumas de interacción podría
      // revelar la actividad de una sola cuenta aunque ambas sumas sean grandes.
      if (!x || !y || x.registros !== y.registros || x.total !== y.total) a[key] = b[key] = null;
    } else if (key === 'patrones') {
      const pa = {}, pb = {};
      for (const id of claves(x, y)) {
        [pa[id], pb[id]] = a.n === b.n ? escalar(x?.[id], y?.[id]) : [null, null];
      }
      a[key] = pa; b[key] = pb;
    } else if (key === 'laboratorios') {
      const la = {}, lb = {};
      for (const id of claves(x, y)) {
        const u = x?.[id], v = y?.[id];
        if (!u || !v || pequena(u.n, v.n)) continue;
        const temaSeguro = u.tema != null && u.tema === v.tema && numero(u.temaN) && numero(v.temaN)
          && !pequena(u.temaN, v.temaN) && !pequena(u.n - u.temaN, v.n - v.temaN);
        la[id] = { ...u, tema: temaSeguro ? u.tema : null, temaN: temaSeguro ? u.temaN : null };
        lb[id] = { ...v, tema: temaSeguro ? v.tema : null, temaN: temaSeguro ? v.temaN : null };
      }
      a[key] = la; b[key] = lb;
    } else if (key === 'conLaboratorio') {
      [a[key], b[key]] = escalar(x, y);
      if (numero(x) && numero(y) && pequena(a.n - x, b.n - y)) a[key] = b[key] = null;
    } else if (x && 'otras' in Object(x) || y && 'otras' in Object(y)) {
      [a[key], b[key]] = exclusiva(x, y);
    } else if (x && 'menores' in Object(x) || y && 'menores' in Object(y)) {
      [a[key], b[key]] = multiple(x, y, { ocultarIds: key === 'hashtags' });
    } else if (x == null || y == null) {
      a[key] = b[key] = null;
    }
  }
  if (a.conLaboratorio == null || b.conLaboratorio == null) {
    if ('temasConLaboratorio' in a) a.temasConLaboratorio = null;
    if ('temasConLaboratorio' in b) b.temasConLaboratorio = null;
  }
}

function campana(a, b) {
  if (!a || !b) return;
  for (const key of ['evaluadas', 'sinEvaluar', 'confirmadas']) [a[key], b[key]] = escalar(a[key], b[key]);
  for (const key of ['estados', 'interseccion']) [a[key], b[key]] = exclusiva(a[key], b[key]);
  for (const key of ['complementarias', 'referenciasAportadas']) {
    if (a[key] && b[key]) {
      const ids = claves(a[key], b[key]);
      const ocultar = ids.some(id => !numero(a[key][id]) || !numero(b[key][id]) || pequena(a[key][id], b[key][id]));
      for (const id of ids) [a[key][id], b[key][id]] = ocultar ? [null, null] : escalar(a[key][id], b[key][id]);
    }
  }
  const porId = new Map((b.periodos ?? []).map(p => [p.id, p]));
  for (const p of a.periodos ?? []) {
    const q = porId.get(p.id);
    if (!q) { p.confirmadas = null; p.interseccion = null; p.detalle = null; continue; }
    [p.confirmadas, q.confirmadas] = escalar(p.confirmadas, q.confirmadas);
    [p.interseccion, q.interseccion] = exclusiva(p.interseccion, q.interseccion);
    if (!p.detalle || !q.detalle || p.confirmadas == null || q.confirmadas == null) p.detalle = q.detalle = null;
    else grupo(p.detalle, q.detalle);
  }
  const presentes = new Set((a.periodos ?? []).map(p => p.id));
  for (const q of b.periodos ?? []) if (!presentes.has(q.id)) { q.confirmadas = null; q.interseccion = null; q.detalle = null; }
}

/** Devuelve clones publicables; las vistas deben ser subconjuntos comparables de la misma base. */
export function protegerVersiones(enfocada, amplia) {
  const a = structuredClone(enfocada), b = structuredClone(amplia);
  const porId = new Map((b.periodos ?? []).map(p => [p.id, p]));
  for (const p of a.periodos ?? []) {
    const q = porId.get(p.id);
    if (q) {
      [p.revisar, q.revisar] = escalar(p.revisar, q.revisar);
      for (const key of ['relevantes', 'resto']) grupo(p[key], q[key]);
    } else for (const key of ['relevantes', 'resto']) if (p[key]) for (const dim of Object.keys(p[key])) if (dim !== 'n') p[key][dim] = null;
  }
  const presentes = new Set((a.periodos ?? []).map(p => p.id));
  for (const q of b.periodos ?? []) if (!presentes.has(q.id)) for (const key of ['relevantes', 'resto']) if (q[key]) for (const dim of Object.keys(q[key])) if (dim !== 'n') q[key][dim] = null;
  campana(a.campana, b.campana);
  return { enfocada: a, amplia: b };
}
