import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {validarResultados} from '../src/lib/data/publicar.js';
import {dailyTotals,serieConAporteEditorial,periodStats} from '../src/lib/data/resultados.js';
import {corteDatos} from '../src/lib/data/hechos.js';
import {versionesDisponibles,resolverVersion} from '../src/lib/data/versiones.js';
import {RANGO_DEFECTO} from '../src/config/periodos.js';
const rutas=['../src/data/resultados.json','../src/data/resultados-amplio.json'].map(p=>new URL(p,import.meta.url));
const disponibles=rutas.every(existsSync);
const leer=()=>rutas.map(p=>JSON.parse(readFileSync(p,'utf8')));
const opciones={skip:!disponibles?'La actualización de ambas versiones aún no se ha generado':false};

test('actualización 28: ambos agregados reales cumplen esquema, privacidad y corte completo',opciones,()=>{
 for(const r of leer()) {
  assert.deepEqual(validarResultados(r),[]);
  assert.equal(corteDatos(r).hasta,'2026-10-27');
  const dias=dailyTotals(r,RANGO_DEFECTO);
  assert.equal(dias.length,31);assert.ok(dias.slice(27).every(d=>d.v===null));
  assert.ok(dias.slice(0,27).every(d=>d.v!==null));
  const recorrer=o=>{
   if(Array.isArray(o)) return o.forEach(recorrer);
   if(o && typeof o==='object') for(const [k,v] of Object.entries(o)) {
    assert.ok(!['texto','autor','usuario','_local','h','th','url','registrosIndividuales'].includes(k),`Campo privado: ${k}`);
    recorrer(v);
   }
  };
  recorrer(r);
 }
});

test('actualización 28: selector ofrece dos conjuntos reales y respeta el parámetro escucha',opciones,()=>{
 const [a,b]=leer();const versiones=versionesDisponibles(a,b);
 assert.deepEqual(versiones.map(x=>x.id),['enfocada','amplia']);
 for(const id of ['enfocada','amplia']) {
  const query=new URLSearchParams(`escucha=${id}`);
  assert.equal(resolverVersion(query.get('escucha'),versiones).resultados,id==='amplia'?b:a);
 }
 assert.notDeepEqual(a.diario,b.diario,'El panorama amplio debe proceder de su conjunto propio');
 const contexto=readFileSync(new URL('../src/state/DataContext.jsx',import.meta.url),'utf8');
 assert.match(contexto,/URLSearchParams\(window\.location\.search\)\.get\('escucha'\)/);
 assert.match(contexto,/searchParams\.set\('escucha',\s*elegida\.id\)/);
 assert.match(contexto,/resultados-amplio\.json/);
});

test('actualización 28: aporte visual del concierto conserva serie y KPI temáticos',opciones,()=>{
 for(const r of leer()) {
  const antes=structuredClone(r);const tematica=dailyTotals(r,RANGO_DEFECTO);
  const visual=serieConAporteEditorial(r,RANGO_DEFECTO);
  const evento=visual.apilados.find(p=>p.d==='2026-10-24');
  const baseEvento=r.campana.referenciasAportadas.sentione;
  const valorTematico=tematica.find(p=>p.d==='2026-10-24').v;
  if(valorTematico===baseEvento) {
   assert.ok(evento);assert.equal(evento.base,valorTematico);
   assert.equal(evento.v,14);assert.equal(evento.total,evento.base+14);
  } else assert.equal(evento,undefined,'Una base temática diferente no recibe el aporte de la cohorte');
  assert.equal(r.campana.referenciasAportadas.total,28);
  assert.deepEqual(visual.puntos,tematica);assert.deepEqual(r,antes);
  assert.equal(periodStats(r,RANGO_DEFECTO).total,tematica.reduce((n,d)=>n+(d.v??0),0));
 }
});
