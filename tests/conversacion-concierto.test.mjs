import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createServer} from 'vite';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {balanceConcierto} from '../src/content/balance-concierto.js';import {evidencias} from '../src/content/evidencias.js';
import {periodStats,serieConAporteEditorial} from '../src/lib/data/resultados.js';import {RANGO_DEFECTO} from '../src/config/periodos.js';
test('las dos versiones actuales dibujan 28 en una barra sin reemplazar los datos temáticos',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});let objeto,respaldo;
 try {
  const {default:Antes}=await server.ssrLoadModule('/src/sections/Antes.jsx');
  objeto=(await server.ssrLoadModule('/src/data/resultados.json')).default;respaldo=structuredClone(objeto);
  for(const archivo of ['resultados.json','resultados-amplio.json']) {
   const r=JSON.parse(readFileSync(new URL('../src/data/'+archivo,import.meta.url)));
   const antes=structuredClone(r),kpi=periodStats(r,RANGO_DEFECTO).total;
   const punto=r.diario.find(d=>d.d==='2026-10-24');
   const visual=serieConAporteEditorial(r,RANGO_DEFECTO);
   assert.equal(visual.apilados[0].total,28);assert.equal(visual.apilados[0].base+visual.apilados[0].v,28);
   for(const key of Object.keys(objeto))delete objeto[key];Object.assign(objeto,structuredClone(r));
   const html=renderToStaticMarkup(createElement(Antes));
   assert.equal((html.match(/<rect[^>]*data-fecha="2026-10-24"/g)??[]).length,1);
   assert.match(html,new RegExp(`<rect[^>]*data-fecha="2026-10-24"[^>]*data-valor="28"[^>]*data-valor-tematico="${punto.rel}"`));
   assert.match(html,/<text[^>]*data-etiqueta-total="2026-10-24"[^>]*>28<\/text>/);
   assert.match(html,/24 OCT · CONCIERTO DE FONSECA/);
   assert.equal(periodStats(r,RANGO_DEFECTO).total,kpi);assert.deepEqual(r,antes);
  }
 } finally {if(objeto&&respaldo){for(const k of Object.keys(objeto))delete objeto[k];Object.assign(objeto,respaldo);}await server.close();}
});
test('balance distingue vocería del escenario, difusión de un medio y titulares previstos',()=>{
 assert.match(balanceConcierto.resultado,/parcialmente/);
 assert.deepEqual(balanceConcierto.voces.map(v=>v.nombre),['Fonseca','Bésame Radio']);
 assert.match(balanceConcierto.voces[0].texto,/No equivale a una publicación/);
 assert.match(balanceConcierto.voces[1].texto,/25 de octubre.*misma marca/);
 assert.match(balanceConcierto.prensa,/no acreditan noticias publicadas/);
 assert.match(balanceConcierto.creadores,/forma anónima.*sin atribuir/);
 assert.equal(evidencias.length,2);assert.ok(evidencias.every(e=>e.tipo==='publicacion'&&e.fecha==='2026-10-25'));
 assert.ok(!/El Tiempo|El Espectador/.test(JSON.stringify(evidencias)));
});
