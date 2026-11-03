import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import {
  resultadosCampana,
  consolidarBesame,
  conclusionesCampana,
} from '../src/content/resultados-campana.js';
import { capitulos } from '../src/content/navegacion.js';
test('Bésame suma visualizaciones e interacciones sin duplicar fuentes ni inventar personas únicas', () => {
  const r = consolidarBesame();
  assert.equal(r.visualizaciones, 13862);
  assert.equal(r.visualizacionesAproximadas, true);
  assert.equal(r.interacciones, 794);
  assert.equal(r.compartidos, 25);
  assert.equal(r.guardados, 18);
  assert.equal(r.comentarios, 16);
  assert.equal(r.reaccionesYMeGusta, 672);
  assert.equal(r.personasUnicas, null);
  assert.equal(r.demografiaConsolidada, resultadosCampana.besame.audiencia);
  assert.deepEqual(r.redesSinMetricas, []);
  assert.equal(resultadosCampana.besame.tiktok.visualizaciones, 4218);
  assert.notEqual(
    r.interacciones,
    r.reaccionesYMeGusta + r.compartidos + r.guardados + r.comentarios,
    'Las categorías seleccionadas no se hacen pasar por un desglose completo del total',
  );
});
test('perfil del panel conserva género, edades, países y seguidores sin cruzarlos ni reponderarlos', () => {
  const a = resultadosCampana.besame.audiencia;
  for (const key of ['genero', 'edades', 'paises', 'seguidores'])
    assert.ok(
      Math.abs(a[key].reduce((n, x) => n + x.valor, 0) - 100) < 0.00001,
    );
  assert.equal(a.genero[0].valor, 73);
  assert.equal(a.paises[0].valor, 81.6);
  assert.ok(
    Math.abs(a.edades.slice(0, 3).reduce((n, x) => n + x.valor, 0) - 70.1) <
      0.00001,
  );
  assert.match(a.cobertura, /Facebook/);
});
test('la nueva lectura elimina comparación previa y competidores y conserva solo resultados de campaña', async () => {
  assert.deepEqual(
    capitulos.map((c) => c.id),
    ['inicio', 'realidad', 'campana', 'impacto', 'conclusiones'],
  );
  const src = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
  const app = src('../src/App.jsx');
  assert.ok(!/<Antes|<Benchmark/.test(app));
  assert.ok(
    !/ConversationDashboard|BenchmarkDashboard/.test(
      src('../src/views/Explorar.jsx'),
    ),
  );
  assert.ok(!src('../src/components/SiteNav.jsx').includes('SelectorEscucha'));
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    for (const archivo of ['Impacto', 'Conclusiones']) {
      const { default: C } = await server.ssrLoadModule(
        '/src/sections/' + archivo + '.jsx',
      );
      const html = renderToStaticMarkup(createElement(C));
      assert.ok(
        !/Día Mundial|19 de octubre|pico temático|promedio previo|Daiichi|AstraZeneca|pico del/.test(
          html,
        ),
      );
      assert.match(html, /794/);
      assert.match(html, /13,9 mil/);
      assert.ok(!/9.644 personas|9.600 personas/.test(html));
    }
  } finally {
    await server.close();
  }
  assert.equal(conclusionesCampana.length, 3);
  assert.ok(
    conclusionesCampana.every(
      (c) => c.observamos && c.significa && c.recomendamos,
    ),
  );
});
