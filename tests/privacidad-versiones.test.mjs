import test from 'node:test';
import assert from 'node:assert/strict';
import { protegerVersiones } from '../src/lib/data/privacidad-versiones.js';
import { validarResultados } from '../src/lib/data/publicar.js';
const ex = v => ({v, otras:null});
const mu = v => ({v, menores:[]});
function vista(n, dims={}) {
  return {version:3, umbral:10, totales:{unicos:n,clasificados:n,pendientes:0,relevantes:n,dudosas:0,noRelevantes:0},
    diario:[{d:'2026-10-24',n,cl:n,rel:n}],
    periodos:[{id:'evento',desde:'2026-10-24',hasta:'2026-10-24',n,clasificados:n,revisar:0,
      relevantes:{n,...dims},resto:{n:0}}]};
}
const grupo = x => x.periodos[0].relevantes;
test('agrupa simétricamente una diferencia pequeña y conserva totales y diario',()=>{
  const a=vista(100,{plataformas:ex({x:40,web:60})});
  const b=vista(125,{plataformas:ex({x:45,web:80})});
  const before=structuredClone(a);const r=protegerVersiones(a,b);
  assert.deepEqual(a,before);assert.deepEqual(r.enfocada.diario,a.diario);
  assert.deepEqual(grupo(r.enfocada).plataformas,{v:{},otras:{n:100,ids:['web','x']}});
  assert.deepEqual(grupo(r.amplia).plataformas.otras,{n:125,ids:['web','x']});
  assert.deepEqual(validarResultados(r.enfocada),[]);assert.deepEqual(validarResultados(r.amplia),[]);
});
test('suprime ambas exclusivas si incluso su agrupación revela una diferencia pequeña',()=>{
 const r=protegerVersiones(vista(100,{sentimiento:ex({positivo:40,neutral:60})}),vista(105,{sentimiento:ex({positivo:45,neutral:60})}));
 assert.equal(grupo(r.enfocada).sentimiento,null);assert.equal(grupo(r.amplia).sentimiento,null);
});
test('armoniza otras existentes sin intentar recuperar sus miembros individuales',()=>{
 const a=vista(100,{tipos:{v:{post:80},otras:{n:20,ids:['a','b']}}});
 const b=vista(130,{tipos:{v:{post:100,a:20,b:10},otras:null}});
 const r=protegerVersiones(a,b);
 assert.deepEqual(grupo(r.enfocada).tipos.otras,{n:20,ids:['a','b']});
 assert.deepEqual(grupo(r.amplia).tipos.otras,{n:30,ids:['a','b']});
 assert.deepEqual(validarResultados(r.enfocada),[]);assert.deepEqual(validarResultados(r.amplia),[]);
});
test('suprime etiquetas pequeñas y no comparables en ambas versiones',()=>{
 const r=protegerVersiones(vista(100,{temas:mu({prevencion:40,tratamiento:30})}),vista(130,{temas:mu({prevencion:44,tratamiento:50,nuevo:20})}));
 assert.deepEqual(grupo(r.enfocada).temas,{v:{tratamiento:30},menores:['nuevo','prevencion']});
 assert.deepEqual(grupo(r.amplia).temas,{v:{tratamiento:50},menores:['nuevo','prevencion']});
});
test('protege patrones, laboratorios, complementos y sumas de interacción',()=>{
 const a=vista(100,{patrones:{uno:20},conLaboratorio:30,laboratorios:{msd:{n:30,tema:'prevencion',temaN:20}},temasConLaboratorio:mu({prevencion:20}),interacciones:{total:500,registros:20}});
 const b=vista(130,{patrones:{uno:25},conLaboratorio:35,laboratorios:{msd:{n:35,tema:'prevencion',temaN:25}},temasConLaboratorio:mu({prevencion:25}),interacciones:{total:510,registros:21}});
 const r=protegerVersiones(a,b);
 for(const x of [r.enfocada,r.amplia]) {
  assert.deepEqual(grupo(x).patrones,{uno:null});assert.deepEqual(grupo(x).laboratorios,{});
  assert.equal(grupo(x).conLaboratorio,null);assert.equal(grupo(x).temasConLaboratorio,null);assert.equal(grupo(x).interacciones,null);
  assert.deepEqual(validarResultados(x),[]);
 }
});
test('suprime tema de laboratorio cuando cambia su identidad o su complemento es pequeño',()=>{
 const r=protegerVersiones(vista(100,{laboratorios:{msd:{n:30,tema:'prevencion',temaN:20}}}),vista(140,{laboratorios:{msd:{n:50,tema:'prevencion',temaN:35}}}));
 assert.deepEqual(grupo(r.enfocada).laboratorios.msd,{n:30,tema:null,temaN:null});
 assert.deepEqual(grupo(r.amplia).laboratorios.msd,{n:50,tema:null,temaN:null});
});
test('conserva distribuciones seguras y datos de interacción del mismo conjunto',()=>{
 const a=vista(100,{emociones:ex({esperanza:100}),interacciones:{total:1000,registros:20}});
 const b=vista(130,{emociones:ex({esperanza:130}),interacciones:{total:1000,registros:20}});
 const r=protegerVersiones(a,b);assert.deepEqual(grupo(r.enfocada),grupo(a));
});

test('una marca suprimida entre versiones sigue siendo desconocida y no cero',async()=>{
 const {marcasView,FILTROS_VACIOS,view}=await import('../src/lib/data/resultados.js');
 const f={...FILTROS_VACIOS,desde:'2026-10-24',hasta:'2026-10-24'};
 const a=vista(100,{marcas:{v:{msd:20},menores:['roche']},conLaboratorio:null,hashtags:mu({'#privado':20})});
 const b=vista(130,{marcas:mu({msd:25,roche:20}),conLaboratorio:30,hashtags:mu({'#privado':25})});
 const r=protegerVersiones(a,b);
 for(const x of [r.enfocada,r.amplia]) {
  assert.deepEqual(grupo(x).marcas.menores,['msd','roche']);
  assert.deepEqual(grupo(x).hashtags.menores,[]);
  const marcas=marcasView(x,f,['msd','roche']);
  assert.ok(marcas.every(m=>m.relevantes===null));
  assert.equal(view(x,f).conLaboratorio,null);
 }
});

test('una distribución multietiqueta completamente suprimida no produce ausencias falsas',async()=>{
 const {marcasView,FILTROS_VACIOS,sumarMultiples}=await import('../src/lib/data/resultados.js');
 const r=vista(100,{marcas:null});
 assert.equal(marcasView(r,{...FILTROS_VACIOS,desde:'2026-10-24',hasta:'2026-10-24'},['msd'])[0].relevantes,null);
 assert.equal(sumarMultiples([{dist:null,n:100},{dist:mu({msd:20}),n:20}]).incompleta,true);
 assert.equal(sumarMultiples([{dist:null,n:0},{dist:mu({msd:20}),n:20}]).v.get('msd'),20);
});
