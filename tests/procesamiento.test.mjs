// Pruebas básicas del procesamiento de exportaciones SentiOne: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import writeXlsxFile from 'write-excel-file/node';
import { readSheet } from 'read-excel-file/node';

import { detectHeaderRow, suggestMapping, validateMapping } from '../src/lib/data/columns.js';
import { normalizePlatform, normalizeSentiment, normalizeUrl, parseDateTime, parseNumber } from '../src/lib/data/normalize.js';
import { processRows } from '../src/lib/data/process.js';
import { applyReview, emptyDataset, exportDataset, mergeImport, validateDataset } from '../src/lib/data/dataset.js';
import { FILTROS_VACIOS, baseCheck, dailyTotals, growth, peaks, periodStats, shareOfVoice, universeView } from '../src/lib/data/aggregate.js';
import { suggest } from '../src/lib/data/classify.js';

const published = JSON.parse(readFileSync(new URL('../src/data/dataset.json', import.meta.url), 'utf8'));
const OCT = { ...FILTROS_VACIOS, desde: '2026-10-01', hasta: '2026-10-20' };

const HEADERS = ['ID', 'Date', 'Source', 'Url', 'Text', 'Author', 'Sentiment', 'Country', 'Interactions'];
const fila = (id, date, source, url, text, sent = '', country = 'Colombia', int = 1) => [id, date, source, url, text, 'autor', sent, country, int];

function importar(ds, filas, meta, universo = 'categoria') {
  const rows = [['SentiOne export', 'Proyecto MSD'], [], HEADERS, ...filas];
  const header = detectHeaderRow(rows);
  const mapping = suggestMapping(rows[header]);
  const out = processRows(rows, header, mapping);
  return { ...mergeImport(ds, universo, out.registros, meta), out };
}

test('línea base publicada: cifras agregadas revisadas', () => {
  const u = published.universos.categoria;
  const diario = Object.values(u.base.diario);
  assert.equal(diario.length, 20);
  assert.equal(diario.reduce((a, b) => a + b, 0), 2611);
  assert.equal(u.base.exportacion.total, 2837);
  assert.equal(u.base.bloques[0].total, 2837 - 2611);
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  assert.equal(sum(u.base.distribuciones.plataformas), 2611);
  assert.equal(sum(u.base.distribuciones.sentimiento), 2611);

  const s = periodStats(u, OCT);
  assert.equal(s.total, 2611);
  assert.equal(s.promedioDiario.toFixed(2), '130.55');
  const p = peaks(dailyTotals(u, OCT));
  assert.deepEqual(p[0], { d: '2026-10-04', v: 875, src: 'base' });
  assert.deepEqual(validateDataset(published), []);
});

test('crecimiento normalizado por promedio diario frente a 21–30 sep', () => {
  const g = growth(published.universos.categoria, { ...FILTROS_VACIOS, desde: '2026-10-01', hasta: '2026-10-31' });
  assert.equal(g.ok, true);
  assert.equal(g.anterior.total, 226);
  assert.equal(g.anterior.diasConDatos, 10);
  assert.equal(g.pct.toFixed(2), '477.65');
});

test('días sin cobertura son null, nunca cero', () => {
  const dias = dailyTotals(published.universos.categoria, { ...FILTROS_VACIOS, desde: '2026-10-19', hasta: '2026-10-24' });
  assert.deepEqual(dias.map((x) => x.v), [238, 54, null, null, null, null]);
  const filtrado = dailyTotals(published.universos.categoria, { ...OCT, plataformas: ['x'] });
  assert.ok(filtrado.every((x) => x.v === null), 'la base agregada no se puede filtrar: queda sin datos');
});

test('distribuciones de la base solo con el periodo completo', () => {
  const v = universeView(published.universos.categoria, OCT);
  assert.equal(v.plataformas.find((p) => p.id === 'video').v, 872);
  const parcial = universeView(published.universos.categoria, { ...OCT, hasta: '2026-10-10' });
  assert.equal(parcial.plataformas.length, 0);
  assert.ok(parcial.notas.length > 0);
});

test('detección de encabezado y mapeo de columnas', () => {
  const rows = [['Informe'], ['Fecha de exportación', '2026-10-21'], HEADERS];
  assert.equal(detectHeaderRow(rows), 2);
  const m = suggestMapping(HEADERS);
  assert.equal(m.id, 0);
  assert.equal(m.fecha, 1);
  assert.equal(m.fuente, 2);
  assert.equal(m.url, 3);
  assert.equal(m.texto, 4);
  assert.equal(m.sentimiento, 6);
  assert.equal(validateMapping(m).ok, true);
  assert.equal(validateMapping({}).ok, false);
});

test('normalización de fechas, URLs, plataformas, sentimiento y números', () => {
  assert.deepEqual(parseDateTime('04/10/2026 21:15'), { d: '2026-10-04', t: 21 });
  assert.deepEqual(parseDateTime('2026-10-24T02:30:00Z'), { d: '2026-10-23', t: 21 }); // UTC → Bogotá
  assert.deepEqual(parseDateTime(46299.75), { d: '2026-10-04', t: 18 }); // serial Excel
  assert.deepEqual(parseDateTime(new Date(Date.UTC(2026, 9, 24, 20, 5))), { d: '2026-10-24', t: 20 });
  assert.equal(parseDateTime('no es fecha'), null);
  assert.equal(normalizeUrl('https://www.facebook.com/post/1/?utm_source=x&fbclid=abc#top'), normalizeUrl('http://facebook.com/post/1'));
  assert.equal(normalizePlatform('Twitter'), 'x');
  assert.equal(normalizePlatform('News'), 'web');
  assert.equal(normalizePlatform('', 'www.tiktok.com'), 'tiktok');
  assert.equal(normalizeSentiment('Negative'), 'negativo');
  assert.equal(normalizeSentiment(''), 'sin_clasificar');
  assert.equal(parseNumber('1.234'), 1234);
  assert.equal(parseNumber('2,5K'), 2500);
});

test('duplicados dentro del archivo por ID y por URL estable', () => {
  const { out } = importar(emptyDataset(), [
    fila('A1', '2026-10-21 10:00', 'Facebook', 'https://facebook.com/p/1', 'Hazte la mamografía'),
    fila('A1', '2026-10-21 10:00', 'Facebook', 'https://facebook.com/p/1', 'Hazte la mamografía', '', 'Colombia', 9),
    fila('', '2026-10-21 11:00', 'Video', 'https://www.youtube.com/watch?v=abc&utm_source=t', 'Video'),
    fila('', '2026-10-21 11:00', 'Video', 'https://youtube.com/watch?v=abc', 'Video'),
    fila('', 'fecha rota', 'Video', '', 'x'),
  ], {});
  assert.equal(out.resumen.validos, 2);
  assert.equal(out.resumen.duplicadosArchivo, 2);
  assert.equal(out.resumen.invalidos, 1);
  assert.equal(out.registros.find((r) => r.k === 'id').m.int, 9, 'conserva la versión con más interacciones');
});

test('una exportación solapada no vuelve a sumar registros y conserva revisiones', () => {
  const r1 = importar(emptyDataset(), [
    fila('1', '2026-10-21 09:00', 'X', '', 'uno'),
    fila('2', '2026-10-22 09:00', 'X', '', 'dos', '', '', 3),
  ], { desde: '2026-10-21', hasta: '2026-10-22' });
  assert.equal(r1.diff.nuevos, 2);
  const h2 = r1.dataset.universos.categoria.registros.find((r) => r.d === '2026-10-22').h;
  const revisado = applyReview(r1.dataset, 'categoria', h2, { s: 'positivo' });

  const r2 = importar(revisado, [
    fila('2', '2026-10-22 09:00', 'X', '', 'dos', '', '', 8),
    fila('3', '2026-10-23 09:00', 'TikTok', '', 'tres'),
  ], { desde: '2026-10-22', hasta: '2026-10-23' });
  const u = r2.dataset.universos.categoria;
  assert.equal(r2.diff.nuevos, 1);
  assert.equal(r2.diff.existentes, 1);
  assert.equal(r2.diff.metricasActualizadas, 1);
  assert.equal(u.registros.length, 3);
  assert.deepEqual(u.cobertura, [{ desde: '2026-10-21', hasta: '2026-10-23' }]);
  const dos = u.registros.find((r) => r.h === h2);
  assert.equal(dos.m.int, 8);
  assert.equal(dos.rv.s, 'positivo');
  assert.equal(u.importaciones.length, 2);
});

test('el JSON exportado no contiene textos, URLs ni autores', () => {
  const { dataset } = importar(emptyDataset(), [fila('9', '2026-10-24 21:00', 'Instagram', 'https://instagram.com/p/9', 'Gracias Fonseca y MSD #ElViajeDeLaVida')], {});
  const json = JSON.stringify(exportDataset(dataset));
  assert.ok(!json.includes('instagram.com/p/9'));
  assert.ok(!json.includes('autor'));
  assert.ok(!json.includes('Gracias'));
  const r = exportDataset(dataset).universos.categoria.registros[0];
  assert.deepEqual(r.ent, ['msd', 'fonseca']);
  assert.deepEqual(r.tg, ['#elviajedelavida']);
  assert.deepEqual(validateDataset(exportDataset(dataset)), []);
});

test('registros sin país se conservan', () => {
  const { out } = importar(emptyDataset(), [fila('1', '2026-10-21', 'Web', '', 'a', '', ''), fila('2', '2026-10-21', 'Web', '', 'b', '', 'México')], {});
  assert.equal(out.resumen.validos, 2);
  assert.equal(out.resumen.sinPais, 1);
});

test('un mensaje educativo con «cáncer» o «muerte» no se sugiere negativo', () => {
  const s = suggest('El cáncer de mama es la primera causa de muerte por cáncer en mujeres: la detección temprana salva vidas. Hazte la mamografía.');
  assert.equal(s.s, undefined);
  assert.ok(s.n.includes('prevencion'));
  assert.equal(s.i, true);
  assert.equal(suggest('Me negaron la cita en la EPS, qué vergüenza').s, 'negativo');
});

test('Share of Voice solo con datos comparables y menciones explícitas', () => {
  let ds = emptyDataset();
  const f = { ...FILTROS_VACIOS, desde: '2026-10-01', hasta: '2026-10-31' };
  assert.equal(shareOfVoice(ds, ['msd', 'astrazeneca'], f).ok, false);
  const dias = Array.from({ length: 10 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
  ds = importar(ds, dias.map((d, i) => fila(`m${i}`, d, 'X', '', i % 2 ? 'MSD apoya la prevención' : 'cáncer de mama')), { desde: '2026-10-01', hasta: '2026-10-10' }, 'msd').dataset;
  ds = importar(ds, dias.slice(0, 5).map((d, i) => fila(`a${i}`, d, 'X', '', 'AstraZeneca')), { desde: '2026-10-01', hasta: '2026-10-05' }, 'astrazeneca').dataset;
  const corto = shareOfVoice(ds, ['msd', 'astrazeneca'], f);
  assert.equal(corto.ok, false, 'solo coinciden 5 días');
  ds = importar(ds, dias.slice(5).map((d, i) => fila(`b${i}`, d, 'X', '', 'AstraZeneca')), { desde: '2026-10-06', hasta: '2026-10-10' }, 'astrazeneca').dataset;
  const sov = shareOfVoice(ds, ['msd', 'astrazeneca'], f);
  assert.equal(sov.ok, true);
  assert.equal(sov.dias, 10);
  assert.deepEqual(sov.valores.map((v) => v.menciones), [5, 10], 'MSD: solo las 5 menciones explícitas');
});

test('XLSX real: escritura y lectura con read-excel-file', async () => {
  const data = [
    HEADERS.map((value) => ({ value })),
    [{ value: 'X1' }, { value: new Date(Date.UTC(2026, 9, 24, 21, 30)), type: Date, format: 'yyyy-mm-dd hh:mm' }, { value: 'TikTok' }, { value: 'https://tiktok.com/@a/video/1' }, { value: '¡Qué noche! #CancerDeMama' }, { value: 'a' }, { value: 'Positive' }, { value: '' }, { value: 120 }],
  ];
  const buffer = await writeXlsxFile(data).toBuffer();
  const rows = await readSheet(buffer);
  const header = detectHeaderRow(rows);
  const out = processRows(rows, header, suggestMapping(rows[header]));
  assert.equal(out.resumen.validos, 1);
  const r = out.registros[0];
  assert.deepEqual([r.d, r.t, r.p, r.so, r.m.int], ['2026-10-24', 21, 'tiktok', 'positivo', 120]);
  assert.deepEqual(r.tg, ['#cancerdemama']);
});

test('baseCheck compara una reimportación con la línea base', () => {
  const ds = structuredClone(published);
  const filas = Array.from({ length: 40 }, (_, i) => fila(`o${i}`, '2026-10-01', 'Video', '', 't'));
  const { dataset } = importar(ds, filas, { desde: '2026-10-01', hasta: '2026-10-01' });
  const chk = baseCheck(dataset.universos.categoria);
  assert.equal(chk.coincide, true);
  assert.equal(chk.totalImportado, 40);
});

test('las conclusiones preliminares coinciden con la línea base', async () => {
  const { conclusiones } = await import('../src/content/conclusiones.js');
  const { formatDecimal, formatOne, formatNumber } = await import('../src/lib/format.js');
  const b = published.universos.categoria.base;
  const total = 2611;
  const items = Object.fromEntries(conclusiones.preliminares.items.map((i) => [i.id, i]));
  const diario = Object.values(b.diario).sort((x, y) => x - y);
  const mediana = (diario[9] + diario[10]) / 2;
  const pct = (n) => `${formatOne((n / total) * 100)} %`;

  assert.equal(items.volumen.cifra, formatDecimal(total / 20));
  assert.ok(items.volumen.texto.includes(`mediana diaria de octubre es ${mediana}`));
  assert.ok(items.volumen.texto.includes(formatOne(b.bloques[0].total / 10)));
  assert.equal(items.picos.cifra, pct(b.diario['2026-10-04'] + b.diario['2026-10-03']));
  assert.equal(items.plataformas.cifra, pct(b.distribuciones.plataformas.video + b.distribuciones.plataformas.facebook));
  assert.equal(items.sentimiento.cifra, pct(b.distribuciones.sentimiento.sin_clasificar));
  for (const n of [979, 105, 36, 1491]) assert.ok(items.sentimiento.texto.includes(formatNumber(n)));
});
