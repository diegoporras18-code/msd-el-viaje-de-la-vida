import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aplicarAuditoriaCampana, migrarMaestra, validarCampana } from '../src/lib/data/campana.js';
import { emptyMaestra, validarMaestra, mergeExport } from '../src/lib/data/maestra.js';
import { buildResultados, validarResultados } from '../src/lib/data/publicar.js';
import { identidadPublicacion, indexarPublicaciones, incorporarComplementaria, enlacePendiente } from '../src/lib/data/complementarias.js';
import { vistaCampana, estadoComplementarias } from '../src/lib/data/campana-resultados.js';
import { hechos } from '../src/lib/data/hechos.js';
import { lecturaPresencia } from '../src/content/benchmark.js';

const c = rel => ({ fuente: 'manual', version: 'v1', fecha: '2026-10-21', rel, s: 'neutral', sm: 'no_aplica', ss: 'no_aplica', tm: rel === 'si' ? ['educacion'] : [], e: 'no_identificable', ia: ['ninguna'], mc: [], conf: 0.9, rv: false, aud: 'tema_central' });
const cp = (h, estado = 'confirmada') => ({ version: 2, registro: h, fuente: 'codex', origen: 'sentione', estado, evidencias: [estado === 'confirmada' ? 'texto_identifica_iniciativa' : 'contenido_insuficiente'], vinculo: 'indeterminado', temas: ['experiencia'], confianza: estado === 'confirmada' ? 0.9 : 0.5, revision: estado === 'confirmada' ? 'verificada' : 'pendiente', fecha: '2026-10-25' });
const reg = (h, rel = 'no') => ({ h, k: 'id', d: '2026-10-24', t: 20, p: 'x', so: 'neutral', tp: 'tweet', c: c(rel) });
const maestra = registros => ({ ...emptyMaestra(), cobertura: [{ desde: '2026-10-01', hasta: '2026-10-24' }], registros });

 test('migración v1→v2 es aditiva, conserva A/B/C y es repetible', () => {
  const legacy = { ...maestra([reg('h1')]), version: 1 };
  const old = structuredClone(legacy);
  const ds = [{ h: 'h1', cp: cp('h1') }];
  const result = aplicarAuditoriaCampana(legacy, ds, { fecha: '2026-10-25' });
  assert.deepEqual(legacy, old);
  assert.equal(result.version, 2);
  assert.deepEqual(result.registros[0].c, old.registros[0].c);
  assert.equal(result.registros[0].cp.estado, 'confirmada');
  assert.deepEqual(aplicarAuditoriaCampana(result, ds, { fecha: '2026-10-25' }), result);
  assert.deepEqual(validarMaestra(legacy), []);
  assert.deepEqual(validarMaestra(result), []);
  assert.throws(() => migrarMaestra({ version: 99 }), /no compatible/);
  assert.throws(() => aplicarAuditoriaCampana(legacy, [...ds, ...ds]), /repetido/);
  assert.throws(() => aplicarAuditoriaCampana(legacy, [{ h: 'desconocido', cp: cp('desconocido') }]), /desconocido/);
});

test('una publicación C puede contar para campaña; los posibles no se suman', () => {
  const regs = Array.from({ length: 12 }, (_, i) => ({ ...reg(`c${i}`), cp: cp(`c${i}`) }));
  regs.push({ ...reg('posible', 'si'), cp: cp('posible', 'posible') });
  const res = buildResultados(maestra(regs), null);
  assert.equal(res.totales.relevantes, 1);
  assert.equal(res.campana.confirmadas, 12);
  assert.equal(res.campana.interseccion.v.sin_causa, 12);
  assert.equal(vistaCampana(res).porcentajeCausa, 0);
  assert.deepEqual(validarResultados(res), []);
});

test('intersección protegida: no revela una celda pequeña por resta ni genera una proporción', () => {
  const regs = Array.from({ length: 23 }, (_, i) => ({ ...reg(`r${i}`, i < 3 ? 'si' : 'no'), cp: cp(`r${i}`) }));
  const res = buildResultados(maestra(regs), null);
  assert.equal(res.campana.confirmadas, 23);
  assert.deepEqual(res.campana.interseccion.v, {});
  assert.equal(res.campana.interseccion.otras.n, 23);
  assert.equal(vistaCampana(res).ambos, null);
  assert.equal(vistaCampana(res).porcentajeCausa, null);
  assert.deepEqual(validarResultados(res), []);
  const bad = structuredClone(res);bad.campana.interseccion.v.ambos = 3;
  assert.ok(validarResultados(bad).length > 0);
  bad.campana.diario[0].texto = 'dato individual';
  assert.ok(validarResultados(bad).some(x => /no publicable/.test(x)));
});

test('la proporción campaña-causa usa la campaña como denominador, nunca el universo temático', () => {
  const regs = Array.from({ length: 45 }, (_, i) => ({ ...reg(`r${i}`, i < 20 ? 'si' : 'no'), cp: cp(`r${i}`) }));
  regs.push(...Array.from({ length: 10 }, (_, i) => reg(`solo${i}`, 'si')));
  const res = buildResultados(maestra(regs), null);
  assert.equal(res.totales.relevantes, 30);
  assert.equal(res.campana.confirmadas, 45);
  assert.equal(vistaCampana(res).ambos, 20);
  assert.equal(vistaCampana(res).porcentajeCausa, 20/45*100);
  assert.equal(vistaCampana(res).pico, 'no_comparable');
  assert.deepEqual(validarResultados(res), []);
});

test('no se confirman keywords, multimedia o vínculos sin evidencia; decisiones manuales protegidas', () => {
  assert.ok(validarCampana({ ...cp('h'), evidencias: ['evento_sin_vinculo_msd'] }, 'h').length);
  assert.ok(validarCampana({ ...cp('h'), texto: 'contenido no permitido' }, 'h').length);
  const m = maestra([{ ...reg('h'), cp: { ...cp('h'), fuente: 'manual' } }]);
  assert.throws(() => aplicarAuditoriaCampana(m, [{ h: 'h', cp: cp('h', 'posible') }]), /manual.*protegida/);
});

test('un texto editado invalida campaña sin tocar la revisión temática manual', () => {
  const original = { ...reg('h'), th: 'anterior', cp: cp('h') };
  const m = maestra([original]);
  const edited = mergeExport(m, [{ ...reg('h'), th: 'nuevo' }]).maestra;
  assert.deepEqual(edited.registros[0].c, original.c);
  assert.equal(edited.registros[0].cp.obsoleta, true);
  assert.equal(buildResultados(edited, null).campana.confirmadas, 0);
});

test('aliases canónicos se deduplican; los short links y comentarios no se confunden con el post', () => {
  assert.equal(identidadPublicacion('https://twitter.com/cuenta/status/123?s=46'), identidadPublicacion('https://x.com/i/status/123'));
  assert.equal(identidadPublicacion('https://www.instagram.com/p/Abc123/?utm_source=x'), identidadPublicacion('https://instagram.com/reel/Abc123/'));
  assert.equal(identidadPublicacion('https://linkedin.com/feed/update/urn:li:activity:123/'), identidadPublicacion('https://linkedin.com/feed/update/urn%3Ali%3Aactivity%3A123/'));
  assert.equal(identidadPublicacion('https://facebook.com/watch/?v=123'), identidadPublicacion('https://facebook.com/cuenta/videos/123'));
  assert.equal(identidadPublicacion('https://lnkd.in/p/ejemplo'), null);
  assert.equal(identidadPublicacion('https://facebook.com/share/v/ABC/'), null);
  assert.equal(identidadPublicacion('https://facebook.com/cuenta/posts/123?comment_id=456'), null);
  assert.throws(() => identidadPublicacion('http://x.com/i/status/123'), /HTTPS/);
  const index = indexarPublicaciones([{ ...reg('post'), _local: { url: 'https://x.com/i/status/123' } }, { ...reg('comentario'), tp: 'comment', _local: { url: 'https://x.com/i/status/123' } }]);
  assert.deepEqual(index.publicaciones[identidadPublicacion('https://x.com/i/status/123')], ['post']);
});

const entrada = () => ({ estado: 'verificada', urlCanonica: 'https://x.com/i/status/123', verificacion: { metodo: 'captura_aportada', contenidoRevisado: true, fechaConfirmada: true, vinculoConfirmado: true }, registro: { ...reg('externo'), cp: cp('externo') } });

test('SentiOne y complementaria verificadas conservan una sola publicación y dos procedencias', () => {
  const r = { ...reg('original'), m: { int: 10 } };
  const m = maestra([r]);const index = indexarPublicaciones([{ ...r, _local: { url: 'https://twitter.com/cuenta/status/123' } }]);
  const out = incorporarComplementaria(m, index, entrada());
  assert.equal(out.nuevo, false);
  assert.equal(out.maestra.registros.length, 1);
  assert.equal(out.h, 'original');
  assert.deepEqual(out.maestra.registros[0].c, r.c);
  assert.deepEqual(out.maestra.registros[0].m, r.m);
  assert.deepEqual(out.maestra.registros[0].capturas, ['sentione', 'complementaria']);
  assert.equal(out.maestra.registros[0].cp.estado, 'confirmada');
  assert.deepEqual(validarMaestra(out.maestra), []);
  assert.deepEqual(incorporarComplementaria(out.maestra, out.indice, entrada()).maestra, out.maestra);
});

test('externa nueva conserva origen y privacidad, sin incorporar pendientes ni identidades ambiguas', () => {
  const input = entrada();input.registro._local = { texto: 'no persistir', autor: 'no persistir' };
  const first = incorporarComplementaria(maestra([]), { version: 1, publicaciones: {} }, input);
  assert.equal(first.maestra.registros[0].cp.origen, 'complementaria');
  assert.ok(!JSON.stringify(first.maestra).includes('no persistir'));
  assert.deepEqual(incorporarComplementaria(first.maestra, first.indice, input).maestra, first.maestra);
  assert.throws(() => incorporarComplementaria(maestra([]), first.indice, { ...input, estado: 'pendiente' }), /verificación/);
  assert.throws(() => incorporarComplementaria(maestra([]), first.indice, { ...input, registro: { ...input.registro, tp: 'comment' } }), /comentario externo/);
  const ambiguous = { version: 1, publicaciones: { [identidadPublicacion(input.urlCanonica)]: ['h1', 'h2'] } };
  assert.throws(() => incorporarComplementaria(maestra([]), ambiguous, input), /ambigua/);
  assert.throws(() => incorporarComplementaria(maestra([]), { version: 1, publicaciones: {}, sinResolver: { antigua: 'x' } }, input), /sin identidad canónica/);
  assert.deepEqual(validarMaestra(first.maestra), []);
});

test('estado externo se actualiza desde la cola y protege categorías pequeñas', () => {
  const items = Array.from({ length: 14 }, () => ({ estado: 'pendiente' }));
  const a = buildResultados(maestra([]), null, { complementarias: { items } });
  assert.match(estadoComplementarias(a), /0 verificadas y 14 pendientes/);
  items.forEach(x => x.estado = 'incorporada');
  const b = buildResultados(maestra([]), null, { complementarias: { items } });
  assert.match(estadoComplementarias(b), /14 verificadas y 0 pendientes/);
  items[0].estado = 'pendiente';
  const c = buildResultados(maestra([]), null, { complementarias: { items } });
  assert.equal(c.campana.complementarias.verificadas, null);
  assert.equal(c.campana.complementarias.pendientes, null);
  assert.match(estadoComplementarias(c), /desglose se protege/);
  assert.equal(enlacePendiente({ tipo: 'x_status', codigo: '123' }), 'https://x.com/i/status/123');
});

test('la lectura de picos y umbrales cambia con los datos', () => {
  const publicado = JSON.parse(readFileSync(new URL('./fixtures/resultados-24oct.json', import.meta.url)));
  assert.match(hechos(publicado, '2026-10-25').impacto.titulo, /sin un pico/);
  const distinto = structuredClone(publicado);distinto.diario.find(x => x.d === '2026-10-24').rel = 300;
  assert.match(hechos(distinto, '2026-10-25').impacto.titulo, /aumento/);
  assert.match(lecturaPresencia([{ nombre: 'AstraZeneca', n: 10 }, { nombre: 'Daiichi Sankyo', n: 13 }], 10), /AstraZeneca \(10\).*Daiichi Sankyo \(13\).*alcanzan/);
  assert.match(lecturaPresencia([{ nombre: 'AstraZeneca', n: null }], 10), /Ningún laboratorio alcanza/);
});


test('diagnóstico literal de keywords conserva orden, OR/AND y no inventa coincidencias', async () => {
  const { coincideRegla } = await import('../src/lib/data/consulta.js');
  assert.equal(coincideRegla(['MSD Fonseca'], ['Fonseca MSD']), false);
  assert.equal(coincideRegla(['FONSECA MSD'], ['Fonseca MSD']), true);
  assert.equal(coincideRegla(['Colombia', '#MSD'], ['Colombia', '#MSD']), true);
  assert.equal(coincideRegla(['Colombia'], ['Colombia', '#MSD']), false);
  assert.equal(coincideRegla(['#ElViajeDeLaVida'], ['El viaje de la Vida', 'MSD']), false);
  assert.throws(() => coincideRegla(['dato'], []), /inválida/);
});

test('validación editorial conserva pertenencia sin inventar fecha, causa o métricas', async () => {
  const { fechaDesdeIdX } = await import('../src/lib/data/fecha-x.js');
  const f = fechaDesdeIdX('2114180578564067426');
  assert.equal(f.fecha, '2026-10-24');assert.equal(f.verificadaEnPlataforma, false);
  const input = entrada();delete input.registro.c;
  input.validacionEditorial={fuente:'validacion_usuario',estado:'confirmada'};
  input.verificacion={metodo:'validacion_usuario',fechaConfirmada:true,fuenteFecha:f.fuente};
  input.urlCanonica='https://x.com/i/status/2114180578564067426';
  input.registro.cp={...cp('externo'),fuente:'validacion_usuario',evidencias:['vinculo_validado_usuario']};
  const out=incorporarComplementaria(maestra([]),{publicaciones:{}},input);
  assert.equal(out.maestra.registros[0].c,undefined);assert.equal(out.maestra.registros[0].m,undefined);
  const res=buildResultados(out.maestra,null,{complementarias:{items:Array.from({length:14},()=>({estado:'pendiente',validacionEditorial:input.validacionEditorial}))}});
  assert.equal(res.totales.unicos,0);assert.equal(res.campana.complementarias.editoriales,14);
  assert.equal(res.campana.confirmadas,null);assert.match(estadoComplementarias(res),/conversación identificada/);
  assert.deepEqual(validarResultados(res),[]);
  const unresolved={publicaciones:{},sinResolver:{historica:'x'}};
  const old={...reg('historica'),d:'2026-09-24'};
  assert.equal(incorporarComplementaria(maestra([old]),unresolved,input).nuevo,true);
  assert.throws(()=>incorporarComplementaria(maestra([{...old,d:'2026-10-23'}]),unresolved,input),/sin identidad/);
  input.registro.d='2026-10-23';assert.throws(()=>incorporarComplementaria(maestra([]),{publicaciones:{}},input),/Fecha no coincide/);
});

test('noticias genéricas del concierto quedan fuera; causa desconocida no equivale a ausencia',()=>{
  assert.ok(validarCampana({...cp('h','posible'),evidencias:['evento_sin_vinculo_msd']},'h').length);
  const regs=Array.from({length:12},(_,i)=>{const r={...reg(`u${i}`),cp:cp(`u${i}`)};delete r.c;return r;});
  const res=buildResultados(maestra(regs),null);
  assert.equal(res.campana.interseccion.v.causa_pendiente,12);
  assert.equal(vistaCampana(res).porcentajeCausa,null);
});

test('octubre completo conserva datos del 23 y 24, días pendientes y KPIs sobre días cubiertos', async()=>{
  const {dailyTotals,periodStats}=await import('../src/lib/data/resultados.js');
  const {RANGO_DEFECTO,PERIODO_PREVIO}=await import('../src/config/periodos.js');
  const r=JSON.parse(readFileSync(new URL('./fixtures/resultados-24oct.json',import.meta.url)));
  const ds=dailyTotals(r,RANGO_DEFECTO),s=periodStats(r,RANGO_DEFECTO);
  assert.equal(ds.length,31);assert.equal(ds[22].v,14);assert.equal(ds[23].v,14);
  assert.ok(ds.slice(24).every(d=>d.v===null));assert.equal(s.total,758);
  assert.equal(s.diasConDatos,24);assert.equal(s.promedioDiario,758/24);
  assert.equal(periodStats(r,PERIODO_PREVIO).total,744);
  const future=structuredClone(r);future.cobertura[0].hasta='2026-10-25';future.diario.push({d:'2026-10-25',n:12,cl:12,rel:12});
  assert.equal(dailyTotals(future,RANGO_DEFECTO)[24].v,12);
  assert.equal(periodStats(future,RANGO_DEFECTO).total,770);
});

test('la conciliación distingue capturas fechadas, duplicados, causa desconocida y pendientes',async()=>{
  const {conciliarConcierto}=await import('../src/lib/data/conciliar-concierto.js');
  const r=reg('s'),manual={...reg('m'),k:'externo',capturas:['complementaria']};delete manual.c;
  const q={items:[{id:'nueva',registro:'m',validacionEditorial:{estado:'confirmada'}},{id:'dup',registro:'s',validacionEditorial:{estado:'confirmada'}},{id:'pendiente',validacionEditorial:{estado:'confirmada'}}]};
  const m=maestra([r,manual,{...reg('prev','si'),d:'2026-10-23'}]);
  const a=conciliarConcierto(m,q);assert.equal(a.totalUnicoCombinado24,2);assert.equal(a.totalRelevanteCombinado24,0);
  assert.equal(a.duplicadasSentiOne.confirmadas,1);assert.equal(a.duplicadasSentiOne.sinResolver,1);
  assert.equal(a.pendientesClasificacion24,1);assert.equal(a.manualesSinFecha,1);assert.equal(a.conciliacionCompleta,false);
});

test('una captura manual puede sumar A una vez tras revisar contenido, sin sobrescribir decisiones',()=>{
  const input=entrada();delete input.registro.c;
  const first=incorporarComplementaria(maestra([]),{publicaciones:{}},input);
  const upgraded=entrada();upgraded.registro.c=c('si');
  const next=incorporarComplementaria(first.maestra,first.indice,upgraded);
  assert.equal(next.maestra.registros.length,1);assert.equal(next.maestra.registros[0].h,first.h);
  assert.equal(buildResultados(next.maestra,null).diario[0].rel,1);
  assert.deepEqual(incorporarComplementaria(next.maestra,next.indice,upgraded).maestra,next.maestra);
  const bad=entrada();bad.registro.c=c('si');bad.verificacion.contenidoRevisado=false;
  assert.throws(()=>incorporarComplementaria(first.maestra,first.indice,bad),/contenido revisado/);
  upgraded.registro.c=c('no');assert.throws(()=>incorporarComplementaria(next.maestra,next.indice,upgraded),/temática existente protegida/);
});

test('comparación diaria y promedio previo son independientes; el escenario 28 solo sigue a los datos',async()=>{
  const {resumenImpacto}=await import('../src/lib/data/impacto.js');
  const res=JSON.parse(readFileSync(new URL('./fixtures/resultados-24oct.json',import.meta.url)));
  assert.equal(resumenImpacto(res).cambioDiaAnterior,0);
  const scenario=structuredClone(res);scenario.diario.find(x=>x.d==='2026-10-24').rel=28;
  const r=resumenImpacto(scenario);assert.equal(r.cambioDiaAnterior,100);assert.ok(r.cambio<0);
  const missing=structuredClone(res);missing.cobertura=[{desde:'2026-10-24',hasta:'2026-10-24'}];
  assert.equal(resumenImpacto(missing).cambioDiaAnterior,null);
});

test('referencias aportadas conservan atribución a SentiOne al incorporar capturas manuales A',()=>{
  const sentione=Array.from({length:14},(_,i)=>reg(`s${i}`,'si'));
  const manuales=Array.from({length:14},(_,i)=>({...reg(`m${i}`,'si'),k:'externo',capturas:['complementaria']}));
  const cola={items:manuales.map(r=>({registro:r.h,estado:'incorporada',validacionEditorial:{fuente:'validacion_usuario',estado:'confirmada'}}))};
  const resultado=buildResultados(maestra([...sentione,...manuales]),null,{complementarias:cola});
  assert.equal(resultado.diario[0].rel,28);
  assert.deepEqual(resultado.campana.referenciasAportadas,{sentione:14,manuales:14,total:28});
  assert.deepEqual(validarResultados(resultado),[]);
});

test('el indicador consolidado conserva su composición interna 14 + 14 sin alterar la serie ni KPIs',async()=>{
  const {serieConAporteEditorial,dailyTotals,periodStats}=await import('../src/lib/data/resultados.js');
  const {RANGO_DEFECTO}=await import('../src/config/periodos.js');
  const r=JSON.parse(readFileSync(new URL('./fixtures/resultados-24oct.json',import.meta.url)));
  const antes=JSON.stringify(r),tematica=dailyTotals(r,RANGO_DEFECTO);
  const visual=serieConAporteEditorial(r,RANGO_DEFECTO);
  assert.deepEqual(visual.puntos,tematica);
  assert.equal(visual.puntos[22].v,14);assert.equal(visual.puntos[23].v,14);
  assert.equal(visual.apilados.length,1);
  const segmento=visual.apilados[0];assert.equal(segmento.d,'2026-10-24');
  assert.equal(segmento.base,14);assert.equal(segmento.v,14);assert.equal(segmento.total,28);
  assert.equal(segmento.color,'#F4A6C4');assert.match(segmento.descripcion,/fechas individuales.*pendientes/);
  assert.ok(visual.puntos.slice(24).every(p=>p.v===null));
  assert.equal(periodStats(r,RANGO_DEFECTO).total,758);assert.equal(JSON.stringify(r),antes);
  assert.deepEqual(serieConAporteEditorial(r,{...RANGO_DEFECTO,segmento:'todas'}).apilados,[]);
});

test('la gráfica principal renderiza una única barra 28, etiqueta completa e indicador ejecutivo unificado',async()=>{
  const {createServer}=await import('vite');
  const {createElement}=await import('react');
  const {renderToStaticMarkup}=await import('react-dom/server');
  const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'});
  let datosSitio, respaldo;
  try {
    // La regresión visual usa el corte congelado; la actualización tiene pruebas propias.
    datosSitio=(await server.ssrLoadModule('/src/data/resultados.json')).default;
    respaldo=structuredClone(datosSitio);
    for(const key of Object.keys(datosSitio)) delete datosSitio[key];
    Object.assign(datosSitio,JSON.parse(readFileSync(new URL('./fixtures/resultados-24oct.json',import.meta.url))));
    const {default:Antes}=await server.ssrLoadModule('/src/sections/Antes.jsx');
    const html=renderToStaticMarkup(createElement(Antes));
    assert.equal((html.match(/<rect[^>]*data-fecha="2026-10-24"/g)??[]).length,1);
    assert.match(html,/<rect[^>]*data-fecha="2026-10-24"[^>]*data-valor="28"[^>]*data-valor-tematico="14"/);
    assert.ok(!html.includes('data-segmento="editorial"'));
    assert.match(html,/data-indicador-evento="2026-10-24" data-total="28"/);
    assert.match(html,/<text[^>]*data-etiqueta-total="2026-10-24"[^>]*>28<\/text>/);
    assert.match(html,/<rect[^>]*data-fecha="2026-10-23"[^>]*data-valor="14"/);
    assert.match(html,/data-marcador-concierto/);
    assert.match(html,/24 OCT · CONCIERTO DE FONSECA/);
    const {default:Impacto}=await server.ssrLoadModule('/src/sections/Impacto.jsx');
    const cap=renderToStaticMarkup(createElement(Impacto));
    assert.equal((cap.match(/data-referencias-combinadas/g)??[]).length,1);
    assert.equal((cap.match(/data-nota-medicion/g)??[]).length,1);
    assert.ok(!cap.includes('data-universo'));
    assert.ok(!/captura complementaria|validadas editorialmente|pendientes de cotejo|Protegido|dos fuentes independientes/i.test(cap));
  } finally {
    if(datosSitio && respaldo) {for(const key of Object.keys(datosSitio)) delete datosSitio[key];Object.assign(datosSitio,respaldo);}
    await server.close();
  }
});

test('la cohorte aprobada del concierto no crece al ampliar la consulta temática',async()=>{
  const {serieConAporteEditorial}=await import('../src/lib/data/resultados.js');
  const {RANGO_DEFECTO}=await import('../src/config/periodos.js');
  const indicadorEvento={sentione:14,manuales:14,total:28};
  const cola={indicadorEvento,items:Array.from({length:14},()=>({estado:'pendiente',validacionEditorial:{fuente:'validacion_usuario',estado:'confirmada'}}))};
  const construir=n=>buildResultados(maestra(Array.from({length:n},(_,i)=>reg(`evento${i}`,'si'))),null,{complementarias:cola});
  const enfocada=construir(14),amplia=construir(120);
  for(const r of [enfocada,amplia]) {
    assert.deepEqual(r.campana.referenciasAportadas,indicadorEvento);
    assert.deepEqual(validarResultados(r),[]);
  }
  assert.equal(serieConAporteEditorial(enfocada,RANGO_DEFECTO).apilados[0].total,28);
  assert.deepEqual(serieConAporteEditorial(amplia,RANGO_DEFECTO).apilados,[]);
  assert.equal(serieConAporteEditorial(amplia,RANGO_DEFECTO).puntos.find(p=>p.d==='2026-10-24').v,120);
  assert.equal(amplia.totales.relevantes,120);
  assert.deepEqual(indicadorEvento,{sentione:14,manuales:14,total:28});
  assert.throws(()=>buildResultados(maestra([]),null,{complementarias:{indicadorEvento:{sentione:14,manuales:14,total:99}}}),/cohorte/);
});
