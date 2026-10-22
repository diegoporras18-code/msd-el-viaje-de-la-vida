// Pruebas de la base maestra de SentiOne y de los resultados públicos: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import writeXlsxFile from 'write-excel-file/node';
import { readSheet } from 'read-excel-file/node';

import { detectHeaderRow, suggestMapping, validateMapping } from '../src/lib/data/columns.js';
import { normalizePlatform, normalizeSentiment, normalizeUrl, parseDateTime, parseNumber } from '../src/lib/data/normalize.js';
import { detectEntities, processRows } from '../src/lib/data/process.js';
import { aplicarRevision, aplicarResultados, buildLotes, clasificado, emptyMaestra, mergeExport, pendientes, serializarMaestra, validarMaestra } from '../src/lib/data/maestra.js';
import { UMBRAL, buildResultados, distribucionExclusiva, distribucionMultiple, validarResultados } from '../src/lib/data/publicar.js';
import { FILTROS_VACIOS, dailyTotals, growth, marcasView, periodStats, shareOfVoice, view } from '../src/lib/data/resultados.js';
import { hechos } from '../src/lib/data/hechos.js';
import { ENTIDADES } from '../src/config/marcas.js';

const leer = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const referencia = leer('../datos/maestra/referencia.json');
const publicado = leer('../src/data/resultados.json');
const TODAS = { ...FILTROS_VACIOS, segmento: 'todas' };
const OCT = { ...TODAS, desde: '2026-10-01', hasta: '2026-10-20' };

const HEADERS = ['ID', 'Date', 'Source', 'Url', 'Text', 'Author', 'Sentiment', 'Country', 'Interactions'];
const fila = (id, date, source, url, text, int = 1, country = 'Colombia') => [id, date, source, url, text, 'autor', '', country, int];
const procesar = (filas) => {
  const rows = [['SentiOne export'], [], HEADERS, ...filas];
  const h = detectHeaderRow(rows);
  return processRows(rows, h, suggestMapping(rows[h]));
};
const CLS = { rel: 'si', s: 'neutral', sm: 'no_aplica', ss: 'no_aplica', temas: ['prevencion'], e: 'esperanza', i: ['compartir_informacion'], marcas: [], conf: 0.9 };

test('referencia preliminar: 2.837 registros, 2.611 en octubre, distribuciones consistentes', () => {
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  assert.equal(referencia.exportacion.total, 2837);
  assert.equal(sum(referencia.diario), 2611);
  assert.equal(referencia.bloques[0].total, 226);
  assert.equal(sum(referencia.distribuciones.plataformas), 2611);
  assert.equal(sum(referencia.distribuciones.sentimiento), 2611);
  assert.deepEqual(validarResultados(publicado), []);
});

test('cifras publicadas: la exportación coincide con la referencia y la base deduplica', () => {
  // Filas brutas de SentiOne (referencia validada) frente a menciones únicas de la base maestra.
  assert.equal(publicado.actualizacion.filasBrutas, referencia.exportacion.total);
  assert.equal(publicado.actualizacion.unicasArchivo, 2785);
  assert.deepEqual(publicado.cobertura, [{ desde: '2026-09-21', hasta: '2026-10-20' }]);
  const s = periodStats(publicado, OCT);
  assert.equal(s.total, 2578);
  assert.ok(s.total <= 2611, 'las menciones únicas no superan las filas brutas de octubre');
  assert.equal(s.promedioDiario.toFixed(2), '128.90');
  assert.equal(s.mediana, 54);
  assert.equal(growth(publicado, { ...TODAS, desde: '2026-10-01', hasta: '2026-10-23' }).pct.toFixed(2), '522.71');
  const dias = dailyTotals(publicado, { ...TODAS, desde: '2026-10-19', hasta: '2026-10-22' });
  assert.deepEqual(dias.map((x) => x.v), [238, 54, null, null], 'un día sin cobertura es null, nunca cero');
  for (const d of Object.keys(referencia.diario)) assert.ok(dailyTotals(publicado, { ...TODAS, desde: d, hasta: d })[0].v <= referencia.diario[d], `${d}: únicas ≤ filas brutas`);
  // Menciones sobre cáncer de mama por día: 1 al 20 de octubre.
  // Universo depurado tras la auditoría semántica: solo menciones que hablan de cáncer de mama.
  assert.equal(periodStats(publicado, { ...OCT, segmento: 'relevantes' }).total, 614);
  assert.deepEqual(dailyTotals(publicado, { ...FILTROS_VACIOS, desde: '2026-10-19', hasta: '2026-10-21' }).map((x) => x.v), [167, 36, null], 'un día sin cobertura es null, nunca cero');
  assert.deepEqual(dailyTotals(publicado, { ...FILTROS_VACIOS, desde: '2026-10-03', hasta: '2026-10-05' }).map((x) => x.v), [6, 21, 30], 'los picos políticos del 3 al 5 de octubre no forman parte de la medición principal');
  assert.equal(publicado.totales.clasificados + publicado.totales.pendientes, publicado.totales.unicos);
});

test('hechos medidos: la medida principal son las menciones sobre cáncer de mama', () => {
  const h = hechos(publicado, '2026-10-21');
  // 03.1: volumen, promedio, máximo y variación solo con menciones relevantes.
  assert.equal(h.volumen.cifra, '614');
  assert.equal(h.volumen.stats.promedioDiario.toFixed(2), '30.70');
  assert.equal(h.volumen.stats.mediana, 22);
  assert.deepEqual([h.volumen.maximo.d, h.volumen.maximo.v], ['2026-10-19', 167]);
  assert.match(h.volumen.texto, /no personas alcanzadas/);
  assert.match(h.volumen.texto, /hasta el 23 de octubre/, 'el corte de datos (20 de octubre) se distingue del periodo previo');
  assert.equal(h.picos.cifra, '27,2 %');
  assert.deepEqual(h.picos.dias.map((x) => x.d), ['2026-10-19', '2026-10-07', '2026-10-08'], 'picos temáticos, no políticos');
  // El universo captado es contexto, con su desglose.
  assert.match(h.universo.texto, /2\.578 menciones.*614.*1\.686 de ruido, 244 contextuales o dudosas y 34 aún sin clasificar/);
  assert.equal(h.relevancia.cifra, '24,1 %');
  assert.equal(h.sentimiento.cifra, '56,7 %');
  assert.match(h.sentimiento.texto, /614 menciones que hablan de cáncer de mama/);
  assert.match(h.sentimiento.texto, /no una medida de favorabilidad hacia MSD/);
  assert.equal(h.temas.cifra, '61,4 %');
  assert.equal(h.preocupaciones.cifra, '11,7 %');
  assert.match(h.preocupaciones.texto, /56 de ellas hablan de barreras/);
  assert.deepEqual(h.ejemplos.patrones, { positivo_apoyo: 58, neutral_informativo: 151, negativo_barreras: 56 });
  assert.match(h.marcas.texto, /no son un Share of Voice/);
  assert.equal(h.msd.cifra, '< 10', 'las cifras bajo el umbral no se publican');
  assert.equal(h.laboratorios.cifra, '4,4 %');
  assert.equal(h.marcas.laboratorios.length, 10);
  assert.ok(h.marcas.laboratorios.every((l) => l.n == null), 'ningún laboratorio alcanza el umbral: no se cifra por marca');
  assert.match(h.calidad.texto, /sujetas a revisión/);
  assert.equal(h.impacto.estado, 'evento');
});

test('hechos: las coincidencias ajenas no entran en sentimiento ni temáticas', () => {
  const regs = Array.from({ length: 80 }, (_, i) => ({
    h: `r${i}`,
    k: 'id',
    d: `2026-10-${String((i % 9) + 1).padStart(2, '0')}`,
    p: 'web',
    so: 'neutral',
    c: { fuente: 'claude', version: 'v1', rel: i < 40 ? 'si' : 'no', s: i < 40 ? 'positivo' : 'negativo', sm: 'no_aplica', ss: 'no_aplica', tm: i < 40 ? ['diagnostico_temprano'] : [], e: 'esperanza', ia: ['ninguna'], mc: [], conf: 0.9, rv: false },
  }));
  const m = { ...emptyMaestra(), cobertura: [{ desde: '2026-10-01', hasta: '2026-10-20' }], importaciones: [], registros: regs };
  const h = hechos(buildResultados(m, null), '2026-10-21');
  assert.equal(h.relevancia.cifra, '50,0 %');
  assert.equal(h.sentimiento.cifra, '100,0 %');
  assert.equal(h.temas.cifra, '100,0 %');
});

test('detección de columnas y normalización', () => {
  assert.equal(detectHeaderRow([['Informe'], ['x'], HEADERS]), 2);
  const m = suggestMapping(HEADERS);
  assert.deepEqual([m.id, m.fecha, m.fuente, m.url, m.texto, m.sentimiento], [0, 1, 2, 3, 4, 6]);
  assert.equal(validateMapping(m).ok, true);
  assert.deepEqual(parseDateTime('04/10/2026 21:15'), { d: '2026-10-04', t: 21 });
  assert.deepEqual(parseDateTime('2026-10-24T02:30:00Z'), { d: '2026-10-23', t: 21 });
  assert.equal(normalizeUrl('https://www.facebook.com/p/1/?utm_source=x#a'), normalizeUrl('http://facebook.com/p/1'));
  assert.equal(normalizePlatform('Twitter'), 'x');
  assert.equal(normalizePlatform('Websites', 'eltiempo.com'), 'web'); // «Domain group» de SentiOne
  assert.equal(normalizePlatform('X (Twitter)'), 'x');
  assert.equal(normalizeSentiment(''), 'sin_clasificar');
  assert.equal(parseNumber('1.234'), 1234);
});

test('deduplicación: ID estable; sin ID, URL + texto (no colapsa comentarios distintos)', () => {
  const out = procesar([
    fila('A1', '2026-10-21 10:00', 'Facebook', 'https://facebook.com/p/1', 'Hazte el chequeo'),
    fila('A1', '2026-10-21 10:00', 'Facebook', 'https://facebook.com/p/1', 'Hazte el chequeo', 9),
    fila('', '2026-10-21 11:00', 'Facebook', 'https://facebook.com/p/2', 'Comentario uno'),
    fila('', '2026-10-21 11:05', 'Facebook', 'https://facebook.com/p/2?utm_source=x', 'Comentario dos'),
    fila('', '2026-10-21 11:06', 'Facebook', 'https://www.facebook.com/p/2', 'Comentario uno'),
    fila('', 'fecha rota', 'Video', '', 'x'),
  ]);
  assert.equal(out.resumen.filasBrutas, 6);
  assert.equal(out.resumen.unicasArchivo, 3);
  assert.equal(out.resumen.duplicadosArchivo, 2);
  assert.equal(out.resumen.invalidas, 1);
  assert.equal(out.resumen.brutasPorDia['2026-10-21'], 5);
  assert.equal(out.registros.find((r) => r.k === 'id').m.int, 9);
});

test('base maestra: una exportación solapada no suma dos veces y conserva clasificaciones', () => {
  const a = procesar([fila('1', '2026-10-21', 'X', '', 'uno'), fila('2', '2026-10-22', 'X', '', 'dos', 3)]);
  let { maestra } = mergeExport(emptyMaestra(), a.registros, { desde: '2026-10-21', hasta: '2026-10-22' });
  const lote = buildLotes(maestra, a.registros).lotes[0];
  const dos = lote.items.find((it) => it.texto === 'dos');
  maestra = aplicarResultados(maestra, lote, [{ clave: dos.clave, ...CLS }]).maestra;

  const b = procesar([fila('2', '2026-10-22', 'X', '', 'dos', 8), fila('3', '2026-10-23', 'TikTok', '', 'tres'), fila('1', '2026-10-21', 'X', '', 'uno editado')]);
  const r = mergeExport(maestra, b.registros, { desde: '2026-10-22', hasta: '2026-10-23' });
  assert.deepEqual([r.informe.nuevos, r.informe.existentes, r.informe.actualizados, r.informe.modificados], [1, 2, 1, 1]);
  assert.equal(r.maestra.registros.length, 3);
  assert.deepEqual(r.maestra.cobertura, [{ desde: '2026-10-21', hasta: '2026-10-23' }]);
  const reg2 = r.maestra.registros.find((x) => x.d === '2026-10-22');
  assert.equal(reg2.m.int, 8);
  assert.equal(clasificado(reg2), true, 'la clasificación previa se reutiliza');
  assert.equal(pendientes(r.maestra).length, 2, 'solo se reclasifican lo nuevo y lo editado');
  assert.deepEqual(validarMaestra(r.maestra), []);
  assert.ok(!serializarMaestra(r.maestra).includes('uno editado'), 'la base maestra no guarda textos');
});

test('lotes: textos idénticos se clasifican una vez; validación estricta de resultados', () => {
  const out = procesar([fila('1', '2026-10-24', 'X', '', 'Gracias Fonseca'), fila('2', '2026-10-24', 'X', '', 'Gracias Fonseca'), fila('3', '2026-10-24', 'X', '', 'otro')]);
  const { maestra } = mergeExport(emptyMaestra(), out.registros);
  const { lotes, grupos, registros } = buildLotes(maestra, out.registros);
  assert.deepEqual([grupos, registros], [2, 3]);
  const [g1, g2] = lotes[0].items;
  const r = aplicarResultados(maestra, lotes[0], [
    { clave: g1.clave, ...CLS, marcas: ['fonseca'], conf: 0.5 },
    { clave: g2.clave, ...CLS, s: 'furioso' },
  ]);
  assert.equal(r.informe.aplicados, 2);
  assert.equal(r.informe.revisar, 2, 'confianza baja → revisión');
  assert.equal(r.informe.errores.length, 1, 'valores fuera de la taxonomía se rechazan');
  assert.equal(r.maestra.registros.filter(clasificado).length, 2);
  const manual = aplicarResultados(r.maestra, lotes[0], [{ clave: g1.clave, ...CLS, s: 'positivo' }], { fuente: 'manual' }).maestra;
  const otra = aplicarResultados(manual, lotes[0], [{ clave: g1.clave, ...CLS, s: 'negativo' }]);
  assert.equal(otra.informe.protegidos, 2, 'una revisión manual nunca se sobrescribe');
});

test('resultados públicos: solo agregados, sin textos y sin grupos pequeños', () => {
  const out = procesar([
    fila('1', '2026-10-24 21:00', 'Instagram', 'https://instagram.com/p/1', 'MSD y Fonseca #ElViajeDeLaVida'),
    fila('2', '2026-10-24 22:00', 'Instagram', 'https://instagram.com/p/2', 'Concierto #ElViajeDeLaVida'),
    fila('3', '2026-10-25 09:00', 'Web', 'https://medio.com/n', 'Nota sobre AstraZeneca'),
  ]);
  let { maestra } = mergeExport(emptyMaestra(), out.registros, { desde: '2026-10-24', hasta: '2026-10-25' });
  const lote = buildLotes(maestra, out.registros).lotes[0];
  const clave = (txt) => lote.items.find((it) => it.texto.startsWith(txt)).clave;
  maestra = aplicarResultados(maestra, lote, [
    { clave: clave('MSD'), ...CLS, temas: ['campanas', 'prevencion'], marcas: ['msd', 'fonseca', 'el-viaje-de-la-vida'], sm: 'positivo' },
    { clave: clave('Concierto'), ...CLS, temas: ['campanas'], marcas: ['el-viaje-de-la-vida'] },
  ]).maestra;
  const res = buildResultados(maestra, referencia);
  assert.deepEqual(validarResultados(res), []);
  const json = JSON.stringify(res);
  for (const x of ['instagram.com/p', 'autor', 'MSD y Fonseca', '"h":', '"th":', 'elviajedelavida', '"cubo"']) assert.ok(!json.includes(x), `no publica ${x}`);

  // Serie diaria completa; distribuciones suprimidas porque ningún grupo llega al umbral.
  const f = { ...FILTROS_VACIOS, desde: '2026-10-24', hasta: '2026-10-25' };
  assert.equal(view(res, { ...f, segmento: 'todas' }).registros, 3);
  const v = view(res, f);
  assert.equal(v.registros, 2);
  assert.deepEqual(v.plataformas.items.map((x) => x.id), ['otras'], 'sin desglose: muestra insuficiente');
  assert.deepEqual(v.temas.items, []);
  assert.deepEqual(v.temas.menores, ['Campañas', 'Prevención'], 'las etiquetas pequeñas se nombran sin cifra');
  assert.equal(marcasView(res, f, ['msd'])[0].todas, null);
  assert.equal(shareOfVoice(res, f, ['msd', 'astrazeneca']).motivo, 'cobertura', 'sin cobertura equivalente no hay SoV');
});

test('granularidad: umbral, agrupación y supresión complementaria', () => {
  const m = (o) => new Map(Object.entries(o));
  assert.equal(distribucionExclusiva(m({ a: 3, b: 4 })), null, 'total bajo el umbral: muestra insuficiente');
  assert.deepEqual(distribucionExclusiva(m({ a: 50, b: 30, c: 5 })), { v: { a: 50 }, otras: { n: 35, ids: ['b', 'c'] } }, 'una sola categoría pequeña se agrupa con la siguiente');
  assert.deepEqual(distribucionExclusiva(m({ a: 50, b: 4, c: 3, d: 3 })), { v: { a: 50 }, otras: { n: 10, ids: ['b', 'c', 'd'] } });
  assert.deepEqual(distribucionExclusiva(m({ a: 50, b: 2, c: 3, d: 30 })), { v: { a: 50 }, otras: { n: 35, ids: ['b', 'c', 'd'] } }, 'el grupo debe alcanzar el umbral');
  assert.deepEqual(distribucionMultiple(m({ x: 12, y: 9 })), { v: { x: 12 }, menores: ['y'] });

  // Un registro raro (plataforma, hashtag y marca únicos) entre 40 registros comunes.
  const reg = (i, extra = {}) => ({
    h: `r${i}`, k: 'id', d: '2026-10-05', t: 10, p: 'web', so: 'neutral', tg: ['#cancerdemama'], m: { int: 1 },
    c: { fuente: 'claude', version: 'v1', rel: 'si', s: 'positivo', sm: 'no_aplica', ss: 'no_aplica', tm: ['prevencion'], e: 'esperanza', ia: ['ninguna'], mc: [], conf: 0.9, rv: false },
    ...extra,
  });
  const regs = Array.from({ length: 40 }, (_, i) => reg(i));
  regs.push(reg('raro', { p: 'foros', t: 3, tg: ['#nombrepropio'], c: { ...regs[0].c, s: 'negativo', e: 'miedo', mc: ['msd'] } }));
  const res = buildResultados({ ...emptyMaestra(), cobertura: [{ desde: '2026-10-05', hasta: '2026-10-05' }], importaciones: [], registros: regs }, null);
  assert.deepEqual(validarResultados(res), []);
  const json = JSON.stringify(res);
  assert.ok(!json.includes('#nombrepropio'), 'los hashtags poco frecuentes no se nombran');
  const g = res.periodos[0].relevantes;
  for (const dim of ['plataformas', 'sentimiento', 'emociones', 'franjas']) {
    assert.ok(!Object.values(g[dim].v).some((n) => n < UMBRAL), `${dim}: ninguna celda bajo el umbral`);
    assert.equal(Object.values(g[dim].v).reduce((a, b) => a + b, 0) + (g[dim].otras?.n ?? 0), g.n, `${dim}: el total menos lo publicado no revela una categoría`);
    assert.ok(!g[dim].otras || (g[dim].otras.n >= UMBRAL && g[dim].otras.ids.length >= 2), `${dim}: grupo «otras» seguro`);
  }
  assert.deepEqual(g.marcas, { v: {}, menores: ['msd'] });
});

test('granularidad del archivo publicado: sin cruces, sin celdas pequeñas, sin restas reveladoras', () => {
  const k = publicado.umbral;
  assert.equal(k, 10);
  assert.deepEqual(Object.keys(publicado).sort(), ['actualizacion', 'base', 'cobertura', 'diario', 'generado', 'periodos', 'totales', 'umbral', 'version']);
  assert.ok(!('cubo' in publicado) && !('hashtags' in publicado), 'no hay cubo detallado ni hashtags por día');
  for (const x of publicado.diario) assert.deepEqual(Object.keys(x), ['d', 'n', 'cl', 'rel'], 'la serie diaria no cruza otras dimensiones');
  for (const p of publicado.periodos) {
    assert.equal(p.relevantes.n + p.resto.n, p.n, 'relevantes y resto son una partición');
    assert.ok(p.revisar == null || p.revisar === 0 || p.revisar >= k);
    for (const g of [p.relevantes, p.resto])
      for (const [dim, x] of Object.entries(g)) {
        if (dim === 'n' || x == null) continue;
        if (dim === 'interacciones') {
          assert.ok(x.registros >= k);
          continue;
        }
        if (dim === 'conLaboratorio' || dim === 'patrones') {
          for (const n of typeof x === 'number' ? [x] : Object.values(x)) assert.ok(n == null || n === 0 || n >= k, `${p.id}/${dim}: ${n} < ${k}`);
          continue;
        }
        for (const n of Object.values(x.v)) assert.ok(n >= k, `${p.id}/${dim}: ${n} < ${k}`);
        // Cada tabla es de una sola dimensión: valores numéricos planos, nunca objetos anidados.
        assert.ok(Object.values(x.v).every((n) => typeof n === 'number'), `${p.id}/${dim}: tabla de una dimensión`);
        if ('otras' in x) {
          const resto = g.n - Object.values(x.v).reduce((a, b) => a + b, 0);
          assert.ok(resto === 0 || (resto === x.otras?.n && resto >= k && x.otras.ids.length >= 2), `${p.id}/${dim}: la diferencia con el total revela un grupo pequeño`);
        }
      }
    assert.deepEqual(p.relevantes.hashtags.menores, []);
    assert.ok(!('hashtags' in p.resto), 'los hashtags del resto (nombres propios, política) no se publican');
  }
  // Las sumas siguen cuadrando con los totales privados agregados.
  assert.equal(publicado.diario.reduce((a, x) => a + x.n, 0), 2785);
  assert.equal(publicado.diario.reduce((a, x) => a + x.rel, 0), 684);
  assert.ok(validarResultados({ ...publicado, cubo: [] }).some((e) => /no publicable/.test(e)), 'un cubo detallado se rechaza');
  const malo = structuredClone(publicado);
  malo.periodos[1].relevantes.plataformas.v.foros = 1;
  assert.ok(validarResultados(malo).length > 0, 'una celda pequeña se rechaza');
});

test('Share of Voice solo con cobertura equivalente, periodo suficiente y muestra publicable', () => {
  const dias = Array.from({ length: 8 }, (_, i) => `2026-10-${String(10 + i).padStart(2, '0')}`);
  const out = procesar(dias.flatMap((d, i) => [fila(`m${i}`, d, 'X', '', `MSD informa ${i}`), fila(`n${i}`, d, 'X', '', `MSD responde ${i}`), fila(`a${i}`, d, 'X', '', `AstraZeneca ${i}`), ...(i % 2 ? [fila(`b${i}`, d, 'X', '', `AstraZeneca dos ${i}`)] : [])]));
  const { maestra } = mergeExport(emptyMaestra(), out.registros, { desde: dias[0], hasta: dias[7] });
  const res = buildResultados(maestra, null);
  const prev = ENTIDADES.map((e) => e.cobertura);
  ENTIDADES.forEach((e) => e.tipo === 'laboratorio' && (e.cobertura = 'equivalente'));
  try {
    const f = { ...FILTROS_VACIOS, desde: dias[0], hasta: dias[7] };
    const sov = shareOfVoice(res, f, ['msd', 'astrazeneca']);
    assert.equal(sov.ok, true);
    assert.deepEqual(sov.valores.map((x) => x.v), [16, 12]);
    assert.equal(shareOfVoice(res, f, ['msd', 'daiichi-sankyo']).ok, true, 'cero es publicable');
    const corto = buildResultados({ ...maestra, registros: maestra.registros.filter((r) => !(r.ent ?? []).includes('astrazeneca') || r.d < '2026-10-14') }, null);
    assert.equal(shareOfVoice(corto, f, ['msd', 'astrazeneca']).motivo, 'muestra', 'bajo el umbral no hay SoV');
  } finally {
    ENTIDADES.forEach((e, i) => (e.cobertura = prev[i]));
  }
});

test('laboratorios: detección por nombre corporativo, sin falsos positivos ni medicamentos', () => {
  assert.deepEqual(detectEntities('Roche y la Secretaría de Salud firmaron una alianza de detección temprana'), ['roche']);
  assert.deepEqual(detectEntities('Genentech cofinancia un ensayo en cáncer de mama'), ['roche']);
  assert.deepEqual(detectEntities('La Roche-Posay lanza una crema solar'), [], 'la marca cosmética no es Roche');
  assert.deepEqual(detectEntities('Instalé MS-DOS y msdn'), [], '«msd» exige palabra completa');
  assert.deepEqual(detectEntities('Apoyo de MSD Colombia'), ['msd']);
  assert.deepEqual(detectEntities('Aprueban ribociclib, palbociclib y trastuzumab deruxtecán'), [], 'un medicamento no atribuye la publicación a un laboratorio');
  assert.deepEqual(detectEntities('Con el apoyo de Eli Lilly, Gilead y Menarini Stemline').sort(), ['gilead', 'lilly', 'menarini']);
  assert.deepEqual(detectEntities('Lilly cantó anoche en Bogotá'), [], '«Lilly» sola puede ser una persona');
  assert.deepEqual(detectEntities('Bayer Foundation selecciona una startup').sort(), ['bayer']);
});

test('revisión focalizada: trazable, manual, sin borrar registros', () => {
  const regs = [1, 2, 3].map((i) => ({ h: `r${i}`, k: 'id', d: '2026-10-05', p: 'facebook', so: 'neutral', c: { fuente: 'claude', version: 'v1', fecha: '2026-10-21', rel: 'si', s: 'positivo', sm: 'no_aplica', ss: 'no_aplica', tm: ['apoyo_emocional'], e: 'gratitud', ia: ['ninguna'], mc: [], conf: 0.8, rv: false } }));
  const m = { ...emptyMaestra(), registros: regs };
  const { maestra, informe } = aplicarRevision(m, [{ hs: ['r1'], codigo: 'comentario_sin_contenido', rel: 'dudosa' }, { hs: ['r2'], codigo: 'ruido_politico', rel: 'no' }, { hs: ['r3'], codigo: 'marca_verificada', mc: ['roche'] }], { fecha: '2026-10-22' });
  assert.deepEqual(informe, { aplicados: 3, errores: [] });
  assert.equal(maestra.registros.length, 3, 'nunca se borra un registro');
  const [a, b, c] = maestra.registros;
  assert.deepEqual([a.c.rel, a.c.fuente, a.c.aud, a.c.prev.rel, a.c.prev.fuente], ['dudosa', 'manual', 'comentario_sin_contenido', 'si', 'claude']);
  assert.equal(b.c.rel, 'no');
  assert.deepEqual([c.c.rel, c.c.mc, c.c.prev.mc], ['si', ['roche'], []]);
  assert.deepEqual(validarMaestra(maestra), []);
  assert.ok(!serializarMaestra(maestra).includes('texto'));
  assert.equal(aplicarRevision(m, [{ hs: ['r1'], codigo: 'otra cosa', rel: 'no' }]).informe.errores.length, 1, 'solo códigos conocidos, nunca texto libre');
  // Una clasificación automática posterior no sobrescribe la revisión manual.
  const lote = { items: [{ clave: 'x', hs: ['r1'] }] };
  assert.equal(aplicarResultados(maestra, lote, [{ clave: 'x', ...CLS }]).informe.protegidos, 1);
});

test('ejemplos de sentimiento: patrón con umbral y supresión complementaria', async () => {
  const reg = (i, s, tm, p = 'facebook') => ({ h: `r${i}`, k: 'id', d: '2026-10-05', t: 10, p, so: 'neutral', c: { fuente: 'claude', version: 'v1', rel: 'si', s, sm: 'no_aplica', ss: 'no_aplica', tm, e: 'esperanza', ia: ['ninguna'], mc: [], conf: 0.9, rv: false } });
  const base = (extraNeg) => [
    ...Array.from({ length: 12 }, (_, i) => reg(`a${i}`, 'negativo', ['barreras_atencion'])),
    ...Array.from({ length: extraNeg }, (_, i) => reg(`b${i}`, 'negativo', ['noticias'])),
    ...Array.from({ length: 30 }, (_, i) => reg(`c${i}`, 'positivo', ['apoyo_emocional'], i < 20 ? 'web' : 'x')),
  ];
  const pat = (regs) => buildResultados({ ...emptyMaestra(), cobertura: [{ desde: '2026-10-05', hasta: '2026-10-05' }], importaciones: [], registros: regs }, null).periodos[0].relevantes.patrones;
  assert.equal(pat(base(0)).negativo_barreras, 12);
  assert.equal(pat(base(3)).negativo_barreras, null, 'si el resto del sentimiento es menor que el umbral, el patrón se suprime');
  assert.equal(pat(base(10)).negativo_barreras, 12);
  assert.equal(pat(base(0)).positivo_apoyo, 10, 'el patrón positivo solo cuenta redes sociales');
  const { antes } = await import('../src/content/antes.js');
  const { PATRONES_SENTIMIENTO } = await import('../src/config/patrones.js');
  assert.ok(antes.ejemplos.tarjetas.length <= 3);
  for (const t of antes.ejemplos.tarjetas) {
    assert.ok(PATRONES_SENTIMIENTO.some((p) => p.id === t.patron), `patrón desconocido ${t.patron}`);
    assert.ok(!/https?:|www\.|@\w/.test(`${t.ejemplo} ${t.revela}`), 'los ejemplos no llevan URLs ni usuarios');
  }
  assert.match(antes.ejemplos.aviso, /paráfrasis/);
});

test('benchmark: referencias públicas con fuente y sin Share of Voice', async () => {
  const { benchmark } = await import('../src/content/benchmark.js');
  for (const r of benchmark.referencias.items) {
    assert.equal(r.estado, 'verificado');
    assert.match(r.fuente.url, /^https:\/\//);
  }
  assert.ok(!/lidera/i.test(JSON.stringify(benchmark.conclusiones).replace(/no se puede afirmar que uno lidere/, '')), 'no afirma liderazgos sin consulta equivalente');
  assert.match(benchmark.limitacion, /no se calcula un Share of Voice/);
});

test('XLSX real: lectura con read-excel-file', async () => {
  const buffer = await writeXlsxFile([
    HEADERS.map((value) => ({ value })),
    [{ value: 'X1' }, { value: new Date(Date.UTC(2026, 9, 24, 21, 30)), type: Date, format: 'yyyy-mm-dd hh:mm' }, { value: 'TikTok' }, { value: 'https://tiktok.com/@a/video/1' }, { value: '¡Qué noche! #CancerDeMama' }, { value: 'a' }, { value: 'Positive' }, { value: '' }, { value: 120 }],
  ]).toBuffer();
  const rows = await readSheet(buffer);
  const h = detectHeaderRow(rows);
  const r = processRows(rows, h, suggestMapping(rows[h])).registros[0];
  assert.deepEqual([r.d, r.t, r.p, r.so, r.m.int, r.tg[0]], ['2026-10-24', 21, 'tiktok', 'positivo', 120, '#cancerdemama']);
});

test('conclusiones: hechos existentes, tres hallazgos disponibles', async () => {
  const { conclusiones } = await import('../src/content/conclusiones.js');
  const h = hechos(publicado, '2026-10-21');
  for (const x of [...conclusiones.hallazgos, ...conclusiones.preguntas]) if (x.hecho) assert.ok(x.hecho in h, `hecho desconocido: ${x.hecho}`);
  assert.equal(conclusiones.hallazgos.filter((x) => h[x.hecho].disponible).length >= 3, true);
});

test('el sitio público no incluye administración ni datos originales', () => {
  const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
  assert.ok(!tracked.some((f) => /\.(xlsx|xlsm|xls|csv)$/i.test(f) || f.startsWith('entradas/')), 'no hay exportaciones originales en el repositorio');
  assert.ok(!tracked.some((f) => /base-maestra|(^|\/)informes\/|(^|\/)lotes\//.test(f)), 'la base maestra y los informes solo viven en el repositorio privado');
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  const cliente = walk('src').filter((f) => /\.(jsx?|css)$/.test(f) && !f.startsWith('src/lib/data/'));
  for (const f of cliente) {
    const s = readFileSync(f, 'utf8');
    assert.ok(!/maestra\.js|publicar\.js|process\.js|papaparse|read-excel-file|#\/importar|localStorage/.test(s), `${f} no debe incluir herramientas de administración`);
  }
});

test('flujo completo de la CLI con un repositorio privado simulado', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'evdlv-'));
  const remoto = join(tmp, 'remoto.git');
  const datos = join(tmp, 'datos');
  const resultados = join(tmp, 'resultados.json');
  const sh = (cmd, a, cwd) => execFileSync(cmd, a, { cwd, encoding: 'utf8', env: { ...process.env, SENTIONE_DATOS: datos, SENTIONE_RESULTADOS: resultados, SENTIONE_LOTES: join(tmp, 'lotes'), SENTIONE_PRUEBA: '1' } });
  const lotes = new URL(`file://${join(tmp, 'lotes')}/`);
  try {
    sh('git', ['init', '-q', '--bare', remoto]);
    sh('git', ['clone', '-q', remoto, datos]);
    sh('git', ['-C', datos, 'checkout', '-q', '-b', 'main']);
    sh('npm', ['run', '-s', 'sentione', '--', 'inicializar']);
    const xlsx = join(tmp, 'export.xlsx');
    writeFileSync(
      xlsx,
      await writeXlsxFile([
        HEADERS.map((value) => ({ value })),
        ...[1, 2, 3].map((i) => [{ value: `X${i}` }, { value: new Date(Date.UTC(2026, 9, 24, 20 + i)), type: Date, format: 'yyyy-mm-dd hh:mm' }, { value: 'Instagram' }, { value: `https://instagram.com/p/${i}` }, { value: i < 3 ? 'Gracias MSD y Fonseca #ElViajeDeLaVida' : 'Mi tía fue diagnosticada' }, { value: `persona${i}` }, { value: '' }, { value: '' }, { value: 5 }]),
      ]).toBuffer(),
    );
    sh('npm', ['run', '-s', 'sentione', '--', 'importar', xlsx]);
    const lote = JSON.parse(readFileSync(new URL('lote-001.json', lotes), 'utf8'));
    assert.equal(lote.items.length, 2, 'los textos idénticos se clasifican una vez');
    writeFileSync(new URL('lote-001.resultado.json', lotes), JSON.stringify({ lote: lote.lote, fuente: 'claude', resultados: lote.items.map((it) => ({ clave: it.clave, ...CLS, marcas: it.menciones })) }));
    sh('npm', ['run', '-s', 'sentione', '--', 'aplicar']);
    sh('npm', ['run', '-s', 'sentione', '--', 'publicar']);
    sh('npm', ['run', '-s', 'sentione', '--', 'guardar']);

    const res = JSON.parse(readFileSync(resultados, 'utf8'));
    assert.deepEqual(validarResultados(res), []);
    assert.deepEqual([res.totales.unicos, res.totales.clasificados], [3, 3]);
    const publico = readFileSync(resultados, 'utf8');
    for (const x of ['persona', 'instagram.com/p', 'Gracias MSD', 'diagnosticada']) assert.ok(!publico.includes(x), `los resultados públicos no contienen «${x}»`);

    const enRemoto = execFileSync('git', ['--git-dir', remoto, 'ls-tree', '-r', '--name-only', 'main'], { encoding: 'utf8' });
    assert.match(enRemoto, /maestra\/base-maestra\.json/);
    assert.match(enRemoto, /informes\/actualizacion-/);
    const maestraRemota = execFileSync('git', ['--git-dir', remoto, 'show', 'main:maestra/base-maestra.json'], { encoding: 'utf8' });
    assert.deepEqual(validarMaestra(JSON.parse(maestraRemota)), []);
    for (const x of ['persona', 'instagram.com/p', 'Gracias MSD', 'diagnosticada']) assert.ok(!maestraRemota.includes(x), `la base privada no guarda «${x}»`);
    assert.ok(!/\.xlsx|lote-/.test(enRemoto), 'ni el Excel ni los lotes llegan al repositorio privado');

    // Segunda exportación solapada: no duplica y no reclasifica.
    sh('npm', ['run', '-s', 'sentione', '--', 'importar', xlsx]);
    const sin = readFileSync(new URL('lote-001.json', lotes), 'utf8');
    assert.equal(sin, '', 'sin registros nuevos no hay lotes que clasificar');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('la CLI se niega a guardar la base maestra dentro del repositorio público', () => {
  let error = '';
  try {
    execFileSync('npm', ['run', '-s', 'sentione', '--', 'estado'], { encoding: 'utf8', stdio: 'pipe', env: { ...process.env, SENTIONE_DATOS: new URL('../datos', import.meta.url).pathname } });
  } catch (e) {
    error = String(e.stderr);
  }
  assert.match(error, /no puede estar dentro del repositorio público/);
});
