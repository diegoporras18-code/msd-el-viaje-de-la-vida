import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createServer} from 'vite';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {conclusiones} from '../src/content/conclusiones.js';import {benchmark} from '../src/content/benchmark.js';

test('sentimiento omite patrones suprimidos sin afirmar ausencia de conversación',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try {const {default:Cards}=await server.ssrLoadModule('/src/components/ExampleCards.jsx');
  const tarjetas=[{patron:'apoyo',sentimiento:'Positivo',color:'pink',sintesis:'Apoyo y acompañamiento',revela:'Lectura',tema:'Apoyo'},{patron:'informacion',sentimiento:'Neutral',color:'gray',sintesis:'Información',revela:'Lectura',tema:'Educación'}];
  assert.equal(renderToStaticMarkup(createElement(Cards,{tarjetas,patrones:{apoyo:null,informacion:null},umbral:10})), '');
  const uno=renderToStaticMarkup(createElement(Cards,{tarjetas,patrones:{apoyo:20,informacion:null},umbral:10}));
  assert.match(uno,/Apoyo y acompañamiento/);assert.ok(!uno.includes('Neutral'));assert.ok(!uno.includes('Sin evidencia suficiente'));
 } finally {await server.close();}
});
test('el concierto muestra un video, sin controles vacíos ni duplicación de vocería',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try {
  const {default:Impacto}=await server.ssrLoadModule('/src/sections/Impacto.jsx');const html=renderToStaticMarkup(createElement(Impacto));
  assert.equal((html.match(/<video/g)??[]).length,1);assert.ok(!/Vocería del artista|Ver el registro|Contenido del concierto/.test(html));
  assert.ok(!/<button[^>]*aria-label="(?:El escenario|El mensaje)"/.test(html));assert.match(html,/Más de 30.000/);assert.match(html,/Bésame Radio/);
  const {default:Detalle}=await server.ssrLoadModule('/src/dashboards/ImpactDashboard.jsx');const detalle=renderToStaticMarkup(createElement(Detalle));
  assert.match(detalle,/data-valor="28" data-valor-tematico="20"/);assert.ok(!/se observaron 20|20 el 24|-4,8|sin un pico/.test(detalle));
 } finally {await server.close();}
 assert.ok(!conclusiones.preguntas.some(p=>p.hecho==='impacto'));
 assert.ok(!JSON.stringify([benchmark.escena,benchmark.conclusiones]).includes('innovación'));
 const leer=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 assert.ok(!leer('../src/sections/Benchmark.jsx').includes('presencia: lecturaPresencia'));
});
