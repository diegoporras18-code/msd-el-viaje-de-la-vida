import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { benchmark, referenciasBenchmark, laboratoriosConReferencias } from '../src/content/benchmark.js';
import { LABORATORIOS } from '../src/config/marcas.js';

test('benchmark ofrece todos los laboratorios con referencias verificadas sin exigir volumen publicable', () => {
  const labs = laboratoriosConReferencias(LABORATORIOS);
  assert.deepEqual(labs.map(l => l.id).sort(), ['astrazeneca', 'bayer', 'daiichi-sankyo', 'msd', 'novartis', 'pfizer', 'roche']);
  assert.equal(referenciasBenchmark().length, 7);
  for (const lab of labs) {
    const refs = referenciasBenchmark(lab.id);
    assert.ok(refs.length > 0);
    for (const r of refs) {
      assert.equal(r.estado, 'verificado');
      assert.ok(r.marcasIds.includes(lab.id));
      assert.match(r.fuente.url, /^https:\/\//);
      assert.ok(r.fuente.nombre);
    }
  }
  assert.equal(referenciasBenchmark('lilly').length, 0, 'no fabrica referencias para completar marcas');
  assert.match(benchmark.referencias.aviso, /no representan volumen de menciones/);
});

test('las referencias son visibles en el capítulo sin depender de los umbrales de métricas', () => {
  const src = readFileSync(new URL('../src/sections/Benchmark.jsx', import.meta.url), 'utf8');
  assert.match(src, /<References \/>/);
  assert.ok(!src.includes('<References plegado'));
  assert.match(src, /laboratoriosConReferencias\(LABORATORIOS\)/);
  assert.match(src, /aria-pressed=\{laboratorio === l.id\}/);
  assert.match(src, /referenciasBenchmark\(laboratorio\)/);
  assert.ok(!src.includes('LABORATORIOS.filter((l) => l.id'));
});
