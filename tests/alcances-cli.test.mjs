import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { actualizarAlcances, coincideConsultaEnfocada, maestraPorAlcance } from '../src/lib/data/alcances.js';
import { processRows } from '../src/lib/data/process.js';
import { suggestMapping } from '../src/lib/data/columns.js';
import { emptyMaestra } from '../src/lib/data/maestra.js';
import { validarResultados } from '../src/lib/data/publicar.js';

const consultas = { enfocada: { cualquiera: [['Colombia', '#CancerDeMama'], ['El viaje de la Vida', 'MSD']], excluirAutor: ['@excluido'] } };
test('pertenencia incremental normaliza acentos, consulta los tres campos y conserva históricos', () => {
  assert.equal(coincideConsultaEnfocada({ texto: '#CáncerDeMama', contexto: 'Colombia' }, consultas.enfocada), true);
  assert.equal(coincideConsultaEnfocada({ texto: '#CancerDeMama', autor: 'Colombia' }, consultas.enfocada), true);
  assert.equal(coincideConsultaEnfocada({ texto: '#CancerDeMama Colombia', autor: '@excluido' }, consultas.enfocada), false);
  assert.equal(coincideConsultaEnfocada({ texto: 'MSD Vida la de viaje El' }, consultas.enfocada), false);
  const previa = { version: 1, consultas, registros: { historico: { enfocada: true, amplia: true, motivo: 'anterior' } } };
  const out = actualizarAlcances(previa, [
    { h: 'historico', _local: { texto: 'Texto nuevo sin coincidencia' } },
    { h: 'generico', _local: { texto: '#Cancerdemama' } },
    { h: 'focal', _local: { texto: '#CáncerDeMama', contexto: 'Colombia' } },
  ]);
  assert.equal(out.registros.historico.enfocada, true);
  assert.equal(out.registros.historico.motivo, 'anterior');
  assert.equal(out.registros.generico.enfocada, false);
  assert.equal(out.registros.generico.amplia, true);
  assert.equal(out.registros.focal.enfocada, true);
  assert.deepEqual(Object.keys(previa.registros), ['historico']);
  assert.ok(!JSON.stringify(out).includes('Texto nuevo'));
  assert.throws(() => maestraPorAlcance({ registros: [{ h: 'desconocido' }] }, out, 'enfocada'), /Falta pertenencia/);
});

test('el contexto exportado solo existe durante el procesamiento local', () => {
  const rows = [['ID', 'Date', 'Source', 'Content', 'Context', 'Author'], ['1', '2026-10-24', 'Facebook', '#CancerDeMama', 'Colombia', 'cuenta']];
  const r = processRows(rows, 0, suggestMapping(rows[0])).registros[0];
  assert.equal(r._local.contexto, 'Colombia');
  assert.equal(actualizarAlcances({ version: 1, consultas, registros: {} }, [r]).registros[r.h].enfocada, true);
});

test('publicar genera dos agregados protegidos solo si existe la pertenencia privada', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'alcances-cli-'));
  try {
    const datos = join(tmp, 'datos'), salida = join(tmp, 'publico', 'resultados.json');
    mkdirSync(join(datos, 'maestra'), { recursive: true });
    execFileSync('git', ['init', '-q', '-b', 'main', datos]);
    execFileSync('git', ['-C', datos, '-c', 'user.name=Prueba', '-c', 'user.email=prueba@example.test', 'commit', '-q', '--allow-empty', '-m', 'Prueba aislada']);
    const c = { fuente: 'codex', version: 1, rel: 'si', s: 'neutral', sm: 'no_aplica', ss: 'no_aplica', tm: ['educacion'], e: 'no_identificable', ia: ['ninguna'], mc: [], conf: .9, rv: false };
    const m = { ...emptyMaestra(), cobertura: [{ desde: '2026-10-24', hasta: '2026-10-24' }], registros: Array.from({ length: 30 }, (_, i) => ({ h: `h${i}`, k: 'id', d: '2026-10-24', p: 'x', so: 'neutral', c })) };
    writeFileSync(join(datos, 'maestra', 'base-maestra.json'), JSON.stringify(m));
    const cli = (args = ['publicar']) => execFileSync('node', ['scripts/sentione.mjs', ...args], { encoding: 'utf8', env: { ...process.env, SENTIONE_DATOS: datos, SENTIONE_RESULTADOS: salida, SENTIONE_RESULTADOS_AMPLIOS: join(tmp, 'publico', 'resultados-amplio.json'), SENTIONE_LOTES: join(tmp, 'lotes') } });
    cli();
    const amplio = join(tmp, 'publico', 'resultados-amplio.json');
    assert.equal(existsSync(amplio), false);
    assert.equal(JSON.parse(readFileSync(salida)).totales.unicos, 30);
    const alcances = { version: 1, consultas, registros: Object.fromEntries(m.registros.map((r, i) => [r.h, { enfocada: i < 15, amplia: true }])) };
    writeFileSync(join(datos, 'maestra', 'alcances.json'), JSON.stringify(alcances));
    cli();
    const a = JSON.parse(readFileSync(salida)), b = JSON.parse(readFileSync(amplio));
    assert.equal(a.totales.unicos, 15);
    assert.equal(b.totales.unicos, 30);
    assert.deepEqual(validarResultados(a), []);
    assert.deepEqual(validarResultados(b), []);
    assert.deepEqual(a.diario, [{ d: '2026-10-24', n: 15, cl: 15, rel: 15 }]);
    assert.equal(JSON.parse(readFileSync(join(datos, 'maestra', 'base-maestra.json'))).registros.length, 30);
    assert.ok(!readFileSync(salida, 'utf8').includes('registros'));
    // Las dos vistas tienen muestras grandes, pero su resta revelaría cinco casos.
    for (const [i, r] of m.registros.entries()) alcances.registros[r.h].enfocada = i < 25;
    writeFileSync(join(datos, 'maestra', 'alcances.json'), JSON.stringify(alcances));
    cli();
    const protegida = JSON.parse(readFileSync(salida));
    assert.equal(protegida.totales.unicos, 25);
    assert.equal(protegida.periodos[0].relevantes.sentimiento, null);
    assert.deepEqual(validarResultados(protegida), []);
    const csv = join(tmp, 'nuevo.csv');
    writeFileSync(csv, 'ID,Date,Source,Content,Context,Author\nimportado,2026-10-24,Facebook,#CáncerDeMama,Colombia,cuenta-de-prueba\n');
    cli(['importar', csv]);
    const actualizada = JSON.parse(readFileSync(join(datos, 'maestra', 'base-maestra.json')));
    const nuevo = actualizada.registros.find(r => !r.h.startsWith('h'));
    const membresia = JSON.parse(readFileSync(join(datos, 'maestra', 'alcances.json')));
    assert.equal(membresia.registros[nuevo.h].enfocada, true);
    assert.equal(membresia.registros[nuevo.h].amplia, true);
    assert.equal(membresia.registros.h0.enfocada, true);
    assert.ok(!JSON.stringify(actualizada).includes('cuenta-de-prueba'));
    assert.ok(!JSON.stringify(membresia).includes('cuenta-de-prueba'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
