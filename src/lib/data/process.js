import { detectDateOrder, normalizePlatform, normalizeSentiment, normalizeUrl, parseDateTime, parseNumber } from './normalize.js';
import { compilePatterns, extractHashtags, matches, normalizeText, sinExcluidos } from './text.js';
import { hashKey } from './hash.js';
import { ENTIDADES } from '../../config/marcas.js';

const cell = (row, col) => (col == null ? null : row[col] ?? null);
const str = (v) => (v == null ? '' : v instanceof Date ? v.toISOString() : String(v).trim());
const RE_ENT = ENTIDADES.map((e) => [e.id, compilePatterns(e.patrones), e.excluir ?? []]);

/** Menciones explícitas por coincidencia de texto (Claude las valida al clasificar). */
export function detectEntities(text) {
  const t = normalizeText(text);
  return RE_ENT.filter(([, re, excluir]) => matches(re, sinExcluidos(t, excluir))).map(([id]) => id);
}

/** Huella del texto: detecta ediciones y agrupa textos idénticos para clasificarlos una vez. */
export const textHash = (texto) => (texto ? hashKey(`t:${normalizeText(texto).slice(0, 2000)}`).slice(0, 16) : null);

function sumMetrics(...vals) {
  const nums = vals.filter((v) => v != null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}

/**
 * Clave estable de deduplicación:
 * 1. ID de SentiOne.
 * 2. Sin ID: URL + huella del texto (los comentarios distintos de una misma publicación
 *    comparten URL y no deben colapsarse).
 * 3. Sin ID ni texto: URL.
 * 4. Sin nada estable: clave débil (fecha, fuente, autor y texto).
 */
function stableKey({ id, url, th, fecha, p, autor, texto }) {
  if (id) return [`id:${id}`, 'id'];
  if (url && th) return [`url:${url}|${th}`, 'url+texto'];
  if (url) return [`url:${url}`, 'url'];
  return [`debil:${fecha.d}|${p}|${normalizeText(texto).slice(0, 200)}|${autor}`, 'debil'];
}

/**
 * Convierte las filas de una exportación en registros normalizados.
 * Lo publicable/privado queda separado: `_local` (texto, URL, autor, país) solo vive
 * durante el procesamiento y nunca se guarda en la base maestra ni en la web.
 */
export function processRows(rows, headerIndex, mapping) {
  const data = rows.slice(headerIndex + 1);
  const order = detectDateOrder(data.slice(0, 500).map((r) => cell(r, mapping.fecha)));
  const porClave = new Map();
  const errores = [];
  let duplicadosArchivo = 0;
  let vacias = 0;
  let sinPais = 0;
  const claves = {};
  const brutasPorDia = {};

  data.forEach((row, i) => {
    const fila = headerIndex + 2 + i;
    if (!row || row.every((v) => v == null || v === '')) {
      vacias++;
      return;
    }
    const fecha = parseDateTime(cell(row, mapping.fecha), cell(row, mapping.hora), order);
    if (!fecha) {
      errores.push({ fila, motivo: `Fecha no reconocida: «${str(cell(row, mapping.fecha)).slice(0, 40)}»` });
      return;
    }
    brutasPorDia[fecha.d] = (brutasPorDia[fecha.d] ?? 0) + 1;
    const id = str(cell(row, mapping.id));
    const urlRaw = str(cell(row, mapping.url));
    const url = normalizeUrl(urlRaw);
    const texto = [str(cell(row, mapping.titulo)), str(cell(row, mapping.texto))].filter(Boolean).join(' — ');
    const autor = str(cell(row, mapping.autor));
    const p = normalizePlatform(str(cell(row, mapping.fuente)), str(cell(row, mapping.dominio)), urlRaw);
    const th = textHash(texto);
    const [clave, k] = stableKey({ id, url, th, fecha, p, autor, texto });
    claves[k] = (claves[k] ?? 0) + 1;
    const h = hashKey(clave);

    const interacciones =
      parseNumber(cell(row, mapping.interacciones)) ??
      sumMetrics(parseNumber(cell(row, mapping.likes)), parseNumber(cell(row, mapping.comentarios)), parseNumber(cell(row, mapping.compartidos)));
    const alcance = parseNumber(cell(row, mapping.alcance));
    const pais = str(cell(row, mapping.pais));
    if (!pais) sinPais++; // se conserva: no hay filtros geográficos

    const tg = extractHashtags(texto);
    const ent = detectEntities(texto);
    const tp = mapping.tipo != null && str(cell(row, mapping.tipo)) ? normalizeText(cell(row, mapping.tipo)).slice(0, 40) : null;
    const reg = {
      h,
      k,
      d: fecha.d,
      t: fecha.t,
      p,
      so: normalizeSentiment(cell(row, mapping.sentimiento)),
      ...(interacciones != null || alcance != null ? { m: { ...(interacciones != null && { int: interacciones }), ...(alcance != null && { alc: alcance }) } } : {}),
      ...(tp ? { tp } : {}),
      ...(tg.length ? { tg } : {}),
      ...(ent.length ? { ent } : {}),
      ...(th ? { th } : {}),
      _local: { fila, texto, url: urlRaw, autor, pais },
    };

    if (porClave.has(h)) {
      duplicadosArchivo++;
      const prev = porClave.get(h);
      if ((reg.m?.int ?? -1) > (prev.m?.int ?? -1)) porClave.set(h, reg);
      return;
    }
    porClave.set(h, reg);
  });

  const registros = [...porClave.values()];
  const fechas = registros.map((r) => r.d).sort();
  return {
    registros,
    errores,
    resumen: {
      filasBrutas: data.length - vacias,
      unicasArchivo: registros.length,
      invalidas: errores.length,
      duplicadosArchivo,
      sinPais,
      claves,
      desde: fechas[0] ?? null,
      hasta: fechas[fechas.length - 1] ?? null,
      ordenFechas: order,
      conHora: registros.filter((r) => r.t != null).length,
      brutasPorDia,
      porDia: registros.reduce((a, r) => ((a[r.d] = (a[r.d] ?? 0) + 1), a), {}),
    },
  };
}
