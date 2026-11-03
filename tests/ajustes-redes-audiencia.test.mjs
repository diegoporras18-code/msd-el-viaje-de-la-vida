import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  resultadosCampana,
  consolidarBesame,
} from '../src/content/resultados-campana.js';
import { vocesAudiencia } from '../src/content/voces-audiencia.js';
test('el print actualizado suma acciones visibles y TikTok solo se suma con cifras verificadas', () => {
  const b = resultadosCampana.besame,
    i = b.instagram;
  assert.equal(
    i.meGusta + i.comentarios + i.republicaciones + i.compartidos + i.guardados,
    575,
  );
  assert.equal(consolidarBesame().interacciones, 608);
  assert.deepEqual(consolidarBesame().redesInteracciones, [
    'facebook',
    'instagram',
  ]);
  assert.equal(b.tiktok.interacciones, null);
  const ejemplo = structuredClone(b);
  ejemplo.tiktok = {
    visualizaciones: 1000,
    interacciones: 40,
    meGusta: 30,
    comentarios: 2,
    compartidos: 5,
    guardados: 3,
  };
  const r = consolidarBesame(ejemplo);
  assert.equal(r.visualizaciones, 10644);
  assert.equal(r.interacciones, 648);
  assert.equal(r.compartidos, 28);
  assert.equal(r.guardados, 18);
  assert.deepEqual(r.redesSinMetricas, []);
  assert.equal(r.personasUnicas, null);
  assert.match(b.audiencia.cobertura, /Facebook, Instagram y TikTok/);
});
test('se retiran los dos bloques pedidos, seguidores y numeración, y se muestran cinco comentarios anónimos', async () => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const { default: Impacto } = await server.ssrLoadModule(
      '/src/sections/Impacto.jsx',
    );
    const html = renderToStaticMarkup(createElement(Impacto));
    assert.ok(
      !/Ver los resultados de la campaña|Consultar publicaciones de la iniciativa|Seguidores y no seguidores|Capítulo 0/.test(
        html,
      ),
    );
    assert.match(html, /7700662006419950869/);
    assert.equal((html.match(/<blockquote/g) ?? []).length, 5);
    for (const t of vocesAudiencia.textos)
      assert.ok(html.includes('“' + t + '”'));
    assert.match(html, /autores anónimos/);
    for (const archivo of ['Realidad', 'Campana', 'Conclusiones']) {
      const { default: C } = await server.ssrLoadModule(
        '/src/sections/' + archivo + '.jsx',
      );
      const h = renderToStaticMarkup(createElement(C));
      assert.ok(!/Capítulo 0/.test(h));
    }
  } finally {
    await server.close();
  }
  const nav = readFileSync(
    new URL('../src/components/SiteNav.jsx', import.meta.url),
    'utf8',
  );
  assert.ok(!/actual.numero|c.numero/.test(nav));
  assert.equal(vocesAudiencia.textos.length, 5);
  assert.equal(new Set(vocesAudiencia.textos).size, 5);
});
