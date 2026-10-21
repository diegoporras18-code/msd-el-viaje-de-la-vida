import { detectDateOrder, normalizePlatform, normalizeSentiment, normalizeUrl, parseDateTime, parseNumber } from './normalize.js';
import { detectEntities, detectKeywords, suggest } from './classify.js';
import { extractHashtags, normalizeText } from './text.js';
import { hashKey } from './hash.js';

const cell = (row, col) => (col == null ? null : row[col] ?? null);
const str = (v) => (v == null ? '' : v instanceof Date ? v.toISOString() : String(v).trim());

function sumMetrics(...vals) {
  const nums = vals.filter((v) => v != null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}

/**
 * Convierte las filas de una hoja en registros normalizados.
 * Lo publicable queda en el registro; lo personal o textual queda en `_local`
 * (solo vive en el navegador durante la sesión y nunca se exporta).
 */
export function processRows(rows, headerIndex, mapping) {
  const data = rows.slice(headerIndex + 1);
  const order = detectDateOrder(data.slice(0, 500).map((r) => cell(r, mapping.fecha)));
  const porClave = new Map();
  const errores = [];
  let duplicadosArchivo = 0;
  let vacias = 0;
  let clavesDebiles = 0;
  let sinPais = 0;

  data.forEach((row, i) => {
    const fila = headerIndex + 2 + i; // número de fila como en Excel
    if (!row || row.every((v) => v == null || v === '')) {
      vacias++;
      return;
    }
    const fecha = parseDateTime(cell(row, mapping.fecha), cell(row, mapping.hora), order);
    if (!fecha) {
      errores.push({ fila, motivo: `Fecha no reconocida: «${str(cell(row, mapping.fecha)).slice(0, 40)}»` });
      return;
    }

    const id = str(cell(row, mapping.id));
    const urlRaw = str(cell(row, mapping.url));
    const url = normalizeUrl(urlRaw);
    const texto = [str(cell(row, mapping.titulo)), str(cell(row, mapping.texto))].filter(Boolean).join(' — ');
    const fuente = str(cell(row, mapping.fuente));
    const p = normalizePlatform(fuente, str(cell(row, mapping.dominio)), urlRaw);

    let clave;
    let tipoClave;
    if (id) [clave, tipoClave] = [`id:${id}`, 'id'];
    else if (url) [clave, tipoClave] = [`url:${url}`, 'url'];
    else {
      [clave, tipoClave] = [`debil:${fecha.d}|${p}|${normalizeText(texto).slice(0, 200)}|${str(cell(row, mapping.autor))}`, 'debil'];
      clavesDebiles++;
    }
    const h = hashKey(clave);

    const interacciones = parseNumber(cell(row, mapping.interacciones)) ??
      sumMetrics(parseNumber(cell(row, mapping.likes)), parseNumber(cell(row, mapping.comentarios)), parseNumber(cell(row, mapping.compartidos)));
    const alcance = parseNumber(cell(row, mapping.alcance));
    const pais = str(cell(row, mapping.pais));
    if (!pais) sinPais++; // se conserva: no se filtra por geografía

    const reg = {
      h,
      k: tipoClave,
      d: fecha.d,
      t: fecha.t,
      p,
      so: normalizeSentiment(cell(row, mapping.sentimiento)),
      ...(interacciones != null || alcance != null ? { m: { ...(interacciones != null && { int: interacciones }), ...(alcance != null && { alc: alcance }) } } : {}),
      ...(mapping.tipo != null && str(cell(row, mapping.tipo)) ? { tp: normalizeText(cell(row, mapping.tipo)).slice(0, 40) } : {}),
      tg: extractHashtags(texto),
      ent: detectEntities(texto),
      kw: detectKeywords(texto),
      sg: suggest(texto),
      _local: { fila, texto, url: urlRaw, autor: str(cell(row, mapping.autor)), pais, fuente },
    };
    if (!reg.tg.length) delete reg.tg;
    if (!reg.ent.length) delete reg.ent;
    if (!reg.kw.length) delete reg.kw;
    if (!reg.sg) delete reg.sg;

    if (porClave.has(h)) {
      duplicadosArchivo++;
      const prev = porClave.get(h);
      // Conserva la versión con métricas más altas (la más reciente de la publicación).
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
      filasLeidas: data.length - vacias,
      validos: registros.length,
      invalidos: errores.length,
      duplicadosArchivo,
      clavesDebiles,
      sinPais,
      desde: fechas[0] ?? null,
      hasta: fechas[fechas.length - 1] ?? null,
      ordenFechas: order,
      conHora: registros.filter((r) => r.t != null).length,
    },
  };
}
