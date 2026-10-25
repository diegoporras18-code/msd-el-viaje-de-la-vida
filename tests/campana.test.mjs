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
const cp = (h, estado = 'confirmada') => ({ version: 1, registro: h, fuente: 'codex', origen: 'sentione', estado, evidencias: [estado === 'confirmada' ? 'evento_identificado' : 'evento_sin_vinculo_msd'], vinculo: 'indeterminado', temas: ['experiencia'], confianza: estado === 'confirmada' ? 0.9 : 0.5, revision: estado === 'confirmada' ? 'verificada' : 'pendiente', fecha: '2026-10-25' });
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
  const publicado = JSON.parse(readFileSync(new URL('../src/data/resultados.json', import.meta.url)));
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
