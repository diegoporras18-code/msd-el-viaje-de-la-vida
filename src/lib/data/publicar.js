// Genera los resultados públicos (src/data/resultados.json) a partir de la base maestra.
// Solo agregados: un cubo de conteos por combinación de dimensiones, sin identificadores,
// textos, URLs ni autores. Los hashtags se publican solo si aparecen al menos 2 veces.
import { clasificado } from './maestra.js';

export const RESULTADOS_VERSION = 2;
const HASHTAG_MIN = 2;

export function buildResultados(maestra, referencia, { generado = new Date().toISOString() } = {}) {
  const cubo = new Map();
  const tags = new Map();
  const tagTotal = new Map();
  const totales = { unicos: 0, clasificados: 0, pendientes: 0, revisar: 0, relevantes: 0, noRelevantes: 0 };

  for (const r of maestra.registros) {
    const cl = clasificado(r);
    const c = cl ? r.c : null;
    // Marcas: validadas por Claude si está clasificado; si no, mención explícita detectada en el texto.
    const mc = (c ? c.mc : (r.ent ?? []).filter((e) => e !== 'otro-laboratorio')).slice().sort();
    const fila = {
      d: r.d,
      t: r.t ?? null,
      p: r.p,
      so: r.so,
      tp: r.tp ?? null,
      cl: cl ? 1 : 0,
      ...(c ? { s: c.s, sm: c.sm, ss: c.ss, rel: c.rel, e: c.e, tm: [...c.tm].sort(), ia: [...c.ia].sort(), rv: c.rv ? 1 : 0 } : {}),
      mc,
    };
    const key = JSON.stringify(fila);
    const agg = cubo.get(key) ?? { ...fila, n: 0, it: 0, itn: 0 };
    agg.n++;
    if (r.m?.int != null) {
      agg.it += r.m.int;
      agg.itn++;
    }
    cubo.set(key, agg);

    totales.unicos++;
    if (cl) {
      totales.clasificados++;
      if (c.rv) totales.revisar++;
      if (c.rel === 'si') totales.relevantes++;
      if (c.rel === 'no') totales.noRelevantes++;
    } else totales.pendientes++;

    for (const tg of r.tg ?? []) {
      const k = `${r.d}|${r.p}|${tg}`;
      tags.set(k, (tags.get(k) ?? 0) + 1);
      tagTotal.set(tg, (tagTotal.get(tg) ?? 0) + 1);
    }
  }

  const filas = [...cubo.values()]
    .map(({ it, itn, ...f }) => ({ ...f, ...(itn ? { it, itn } : {}) }))
    .sort((a, b) => a.d.localeCompare(b.d) || (a.t ?? -1) - (b.t ?? -1));
  const hashtags = [...tags.entries()]
    .filter(([k]) => tagTotal.get(k.split('|')[2]) >= HASHTAG_MIN)
    .map(([k, n]) => {
      const [d, p, tag] = k.split('|');
      return { d, p, tag, n };
    })
    .sort((a, b) => a.d.localeCompare(b.d) || a.tag.localeCompare(b.tag));

  const ultima = maestra.importaciones[maestra.importaciones.length - 1];
  return {
    version: RESULTADOS_VERSION,
    generado,
    cobertura: maestra.cobertura,
    totales,
    actualizacion: ultima
      ? { fecha: ultima.fecha.slice(0, 10), filasBrutas: ultima.filasBrutas, unicasArchivo: ultima.unicasArchivo, nuevos: ultima.nuevos, existentes: ultima.existentes }
      : null,
    base: referencia ?? null,
    cubo: filas,
    hashtags,
  };
}

const PROHIBIDOS = ['h', 'th', 'k', 'texto', 'url', 'autor', 'pais', 'usuario', '_local', 'motivo', 'archivo'];

/** Comprueba que los resultados públicos son agregados coherentes y sin datos privados. */
export function validarResultados(res) {
  const errores = [];
  if (res?.version !== RESULTADOS_VERSION) return ['Versión de resultados no compatible.'];
  const n = res.cubo.reduce((a, f) => a + f.n, 0);
  if (n !== res.totales.unicos) errores.push(`El cubo suma ${n} y el total único es ${res.totales.unicos}.`);
  if (res.totales.clasificados + res.totales.pendientes !== res.totales.unicos) errores.push('Clasificados + pendientes no coincide con el total.');
  const cl = res.cubo.filter((f) => f.cl).reduce((a, f) => a + f.n, 0);
  if (cl !== res.totales.clasificados) errores.push('El cubo no coincide con el total de clasificados.');
  for (const f of [...res.cubo, ...res.hashtags]) {
    for (const k of PROHIBIDOS) if (k in f) errores.push(`Campo no publicable «${k}».`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.d)) errores.push('Fecha inválida en los resultados.');
  }
  const b = res.base;
  if (b) {
    const sum = (o) => Object.values(o ?? {}).reduce((a, x) => a + x, 0);
    const diario = sum(b.diario);
    if (b.distribuciones && sum(b.distribuciones.plataformas) !== diario) errores.push('La referencia: plataformas no suman el total diario.');
    if (b.distribuciones && sum(b.distribuciones.sentimiento) !== diario) errores.push('La referencia: sentimientos no suman el total diario.');
    if (b.exportacion && diario + (b.bloques ?? []).reduce((a, x) => a + x.total, 0) !== b.exportacion.total) errores.push('La referencia no suma el total exportado.');
  }
  return [...new Set(errores)].slice(0, 30);
}
