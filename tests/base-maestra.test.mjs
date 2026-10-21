// Pruebas de la base maestra de SentiOne y de los resultados públicos: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import writeXlsxFile from 'write-excel-file/node';
import { readSheet } from 'read-excel-file/node';

import { detectHeaderRow, suggestMapping, validateMapping } from '../src/lib/data/columns.js';
import { normalizePlatform, normalizeSentiment, normalizeUrl, parseDateTime, parseNumber } from '../src/lib/data/normalize.js';
import { processRows } from '../src/lib/data/process.js';
import { aplicarResultados, buildLotes, clasificado, emptyMaestra, mergeExport, pendientes, serializarMaestra, validarMaestra } from '../src/lib/data/maestra.js';
import { buildResultados, validarResultados } from '../src/lib/data/publicar.js';
import { FILTROS_VACIOS, dailyTotals, growth, periodStats, shareOfVoice, view } from '../src/lib/data/resultados.js';
import { hechos } from '../src/lib/data/hechos.js';
import { ENTIDADES } from '../src/config/marcas.js';

const leer = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const referencia = leer('../datos/maestra/referencia.json');
const publicado = leer('../src/data/resultados.json');
const OCT = { ...FILTROS_VACIOS, desde: '2026-10-01', hasta: '2026-10-20' };

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
  assert.deepEqual(validarMaestra(leer('../datos/maestra/base-maestra.json')), []);
});

test('cifras publicadas: promedio, pico, crecimiento normalizado y días sin datos', () => {
  const s = periodStats(publicado, OCT);
  assert.equal(s.total, 2611);
  assert.equal(s.promedioDiario.toFixed(2), '130.55');
  assert.equal(s.mediana, 54);
  assert.equal(growth(publicado, { ...FILTROS_VACIOS, desde: '2026-10-01', hasta: '2026-10-23' }).pct.toFixed(2), '477.65');
  const dias = dailyTotals(publicado, { ...FILTROS_VACIOS, desde: '2026-10-19', hasta: '2026-10-22' });
  assert.deepEqual(dias.map((x) => x.v), [238, 54, null, null], 'un día sin cobertura es null, nunca cero');
  assert.ok(dailyTotals(publicado, { ...OCT, temas: ['prevencion'] }).every((x) => x.v === null), 'la referencia no se puede filtrar');
});

test('hechos medidos coinciden con la referencia validada', () => {
  const h = hechos(publicado, '2026-10-21');
  assert.equal(h.volumen.cifra, '130,55');
  assert.match(h.volumen.texto, /2\.611 registros/);
  assert.match(h.volumen.texto, /22,6/);
  assert.equal(h.picos.cifra, '50,1 %');
  assert.match(h.picos.texto, /4 de octubre \(875\)/);
  assert.equal(h.plataformas.cifra, '64,0 %');
  assert.equal(h.sentimiento.tipo, 'referencia');
  assert.equal(h.sentimiento.cifra, '57,1 %');
  assert.equal(h.temas.disponible, false, 'sin clasificación por contenido no hay temáticas');
  assert.equal(h.impacto.estado, 'evento');
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

test('resultados públicos: solo agregados, multietiqueta sin duplicar y filtros coherentes', () => {
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
  for (const x of ['instagram.com/p', 'autor', 'MSD y Fonseca', '"h":', '"th":']) assert.ok(!json.includes(x), `no publica ${x}`);
  assert.deepEqual(res.hashtags.map((x) => [x.tag, x.n]), [['#elviajedelavida', 2]], 'solo hashtags con 2 usos o más, agregados por día y plataforma');

  const f = { ...FILTROS_VACIOS, desde: '2026-10-24', hasta: '2026-10-25' };
  const v = view(res, f);
  assert.equal(v.registros, 3);
  assert.equal(v.clasificados, 2);
  assert.equal(v.temas.find((t) => t.id === 'campanas').v, 2);
  assert.equal(v.temas.reduce((a, t) => a + t.v, 0), 3, 'multietiqueta: suma de temáticas > menciones');
  assert.equal(view(res, { ...f, temas: ['prevencion'] }).registros, 1);
  assert.equal(view(res, { ...f, marcas: ['astrazeneca'] }).registros, 1, 'sin clasificar: mención explícita detectada en el texto');
  assert.equal(view(res, { ...f, relevancia: 'relevantes' }).registros, 2);
  assert.equal(shareOfVoice(res, f, ['msd', 'astrazeneca']).motivo, 'cobertura', 'sin cobertura equivalente no hay SoV');
});

test('Share of Voice solo con cobertura equivalente y periodo suficiente', () => {
  const dias = Array.from({ length: 8 }, (_, i) => `2026-10-${String(10 + i).padStart(2, '0')}`);
  const out = procesar(dias.flatMap((d, i) => [fila(`m${i}`, d, 'X', '', 'MSD informa'), fila(`a${i}`, d, 'X', '', i % 2 ? 'AstraZeneca' : 'otro')]));
  const { maestra } = mergeExport(emptyMaestra(), out.registros, { desde: dias[0], hasta: dias[7] });
  const res = buildResultados(maestra, null);
  const prev = ENTIDADES.map((e) => e.cobertura);
  ENTIDADES.forEach((e) => e.tipo === 'laboratorio' && (e.cobertura = 'equivalente'));
  try {
    const sov = shareOfVoice(res, { ...FILTROS_VACIOS, desde: dias[0], hasta: dias[7] }, ['msd', 'astrazeneca']);
    assert.equal(sov.ok, true);
    assert.deepEqual(sov.valores.map((x) => x.v), [8, 4]);
  } finally {
    ENTIDADES.forEach((e, i) => (e.cobertura = prev[i]));
  }
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
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  const cliente = walk('src').filter((f) => /\.(jsx?|css)$/.test(f) && !f.startsWith('src/lib/data/'));
  for (const f of cliente) {
    const s = readFileSync(f, 'utf8');
    assert.ok(!/maestra\.js|publicar\.js|process\.js|papaparse|read-excel-file|#\/importar|localStorage/.test(s), `${f} no debe incluir herramientas de administración`);
  }
});
