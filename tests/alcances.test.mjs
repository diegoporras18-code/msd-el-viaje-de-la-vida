import {test} from 'node:test';import assert from 'node:assert/strict';
import {consultasPorAlcance,evaluarAlcances} from '../src/lib/data/alcance-consulta.js';
import {versionesDisponibles,resolverVersion} from '../src/lib/data/versiones.js';
const base={cualquiera:[['Colombia','#CancerDeMama'],['El viaje de la Vida','MSD']],excluirAutor:['@excluido']};
test('las dos versiones excluyen solo la regla genérica abierta, no otras coincidencias legítimas',()=>{
 const q=consultasPorAlcance(base);
 assert.deepEqual(evaluarAlcances({contenido:'#Cancerdemama'},q),{excluido:false,enfocada:false,amplia:true,metodo:'coincidencia_literal_local'});
 assert.equal(evaluarAlcances({contenido:'Colombia #Cancerdemama'},q).enfocada,true);
 assert.equal(evaluarAlcances({contenido:'#JuntasContraElCáncerdemama'},q).enfocada,true);
 assert.equal(evaluarAlcances({contenido:'#JuntasContraElCancerdemama'},q).enfocada,true);
 assert.equal(evaluarAlcances({contenido:'Fonseca',contexto:'MSD'},q).enfocada,true);
 assert.equal(evaluarAlcances({contenido:'#Cancerdemama',autor:'@excluido'},q).amplia,false);
 assert.equal(evaluarAlcances({contenido:'MSD Vida la de viaje El'},q).enfocada,false);
 assert.equal(q.amplia.cualquiera.filter(r=>r.length===1&&r[0].toLowerCase()==='#cancerdemama').length,1);
 assert.deepEqual(base.cualquiera,[['Colombia','#CancerDeMama'],['El viaje de la Vida','MSD']]);
});
test('el selector no ofrece una versión sin datos ni simula el panorama amplio',()=>{
 const a={totales:{relevantes:10}},b={totales:{relevantes:100}};
 assert.equal(versionesDisponibles(a).length,1);
 assert.equal(resolverVersion('amplia',versionesDisponibles(a)).resultados,a);
 const opciones=versionesDisponibles(a,b);assert.equal(opciones.length,2);
 assert.equal(resolverVersion('amplia',opciones).resultados,b);
});

test('la asistencia publicada se atribuye al video y no utiliza proyecciones como resultados',async()=>{
 const {registroConcierto}=await import('../src/content/registro-concierto.js');
 assert.equal(registroConcierto.asistentes.valor,30000);
 assert.match(registroConcierto.asistentes.fuente,/reportada.*registro audiovisual/);
 const {campana}=await import('../src/content/campana.js');
 assert.equal(campana.flujo.pasos.length,5);
 assert.ok(!/programado/i.test(campana.estado));
 assert.ok(!/500.000|800.000|38.000|alianza uber|guitarra rosa/i.test(JSON.stringify(campana)));
});

test('cada conjunto público disponible cumple el esquema y los umbrales de privacidad',async()=>{
 const {readdirSync,readFileSync}=await import('node:fs');
 const {validarResultados}=await import('../src/lib/data/publicar.js');
 const dir=new URL('../src/data/',import.meta.url);
 for(const nombre of readdirSync(dir).filter(n=>/^resultados(?:-amplio)?\.json$/.test(n))) {
  const r=JSON.parse(readFileSync(new URL(nombre,dir)));
  assert.deepEqual(validarResultados(r),[],nombre);
 }
});
