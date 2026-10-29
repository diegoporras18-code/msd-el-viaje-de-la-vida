import {test} from 'node:test';import assert from 'node:assert/strict';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {createServer} from 'vite';
import {sentimientoConcierto} from '../src/content/sentimiento-concierto.js';
test('el concierto recupera sus tres tarjetas con contenido, sin depender de patrones generales suprimidos',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try {for(const ruta of ['/src/sections/Impacto.jsx','/src/dashboards/ImpactDashboard.jsx']) {
  const {default:C}=await server.ssrLoadModule(ruta);const html=renderToStaticMarkup(createElement(C));
  assert.equal((html.match(/data-sentimiento-concierto="true"/g)??[]).length,1);
  for(const id of ['positivo','neutral','negativo'])assert.equal((html.match(new RegExp(`data-tono-concierto="${id}"`,'g'))??[]).length,1);
  assert.ok(!html.includes('Sin evidencia suficiente en este periodo'));
  assert.match(html,/Neutral · informativo/);assert.match(html,/No son citas ni porcentajes sobre los asistentes/);
 }} finally {await server.close();}
});
test('las lecturas editoriales no inventan neutralidad medida, testimonios ni porcentajes',()=>{
 assert.equal(sentimientoConcierto.tarjetas.length,3);
 const neutra=sentimientoConcierto.tarjetas.find(t=>t.id==='neutral');assert.match(neutra.sentimiento,/informativo/);assert.match(neutra.enfoque,/contenido informativo/);
 for(const t of sentimientoConcierto.tarjetas){assert.ok(t.texto.length>50);assert.ok(!/%|[“”]/.test(t.texto));assert.ok(!('n' in t));}
});
