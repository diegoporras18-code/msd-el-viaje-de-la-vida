#!/usr/bin/env node
// Actualización privada de la base maestra de SentiOne (solo para Claude Code / desarrollo).
//
//   npm run sentione -- estado
//   npm run sentione -- importar entradas/exportacion.xlsx [--desde AAAA-MM-DD --hasta AAAA-MM-DD] [--hoja N] [--columna campo=Encabezado] [--seco]
//   npm run sentione -- aplicar            # aplica entradas/lotes/lote-NNN.resultado.json
//   npm run sentione -- publicar           # genera src/data/resultados.json y el informe
//   npm run sentione -- verificar
//
// Nada de entradas/ (Excel, textos, lotes) se sube al repositorio: está en .gitignore.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import readExcelFile from 'read-excel-file/node';
import Papa from 'papaparse';
import { CAMPOS, detectHeaderRow, suggestMapping, validateMapping } from '../src/lib/data/columns.js';
import { processRows } from '../src/lib/data/process.js';
import { aplicarResultados, buildLotes, clasificado, emptyMaestra, mergeExport, pendientes, serializarMaestra, validarMaestra } from '../src/lib/data/maestra.js';
import { buildResultados, validarResultados } from '../src/lib/data/publicar.js';
import { hechos } from '../src/lib/data/hechos.js';
import { normalizeText } from '../src/lib/data/text.js';
import { CRITERIOS_VERSION } from '../src/config/clasificacion.js';

const RUTA = {
  maestra: new URL('../datos/maestra/base-maestra.json', import.meta.url),
  referencia: new URL('../datos/maestra/referencia.json', import.meta.url),
  resultados: new URL('../src/data/resultados.json', import.meta.url),
  informes: new URL('../datos/informes/', import.meta.url),
  lotes: new URL('../entradas/lotes/', import.meta.url),
};

const [cmd, ...args] = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const opts = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));
const leer = (url) => JSON.parse(readFileSync(url, 'utf8'));
const leerMaestra = () => (existsSync(RUTA.maestra) ? leer(RUTA.maestra) : emptyMaestra());
const hoy = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => new Intl.NumberFormat('es-CO').format(n);
const fallar = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

function guardarMaestra(m) {
  const errores = validarMaestra(m);
  if (errores.length) fallar(`La base maestra no es válida:\n  ${errores.join('\n  ')}`);
  writeFileSync(RUTA.maestra, serializarMaestra(m));
}

async function leerFilas(archivo) {
  if (archivo.toLowerCase().endsWith('.csv')) return Papa.parse(readFileSync(archivo, 'utf8').replace(/^﻿/, ''), { skipEmptyLines: 'greedy' }).data;
  if (/\.xls$/i.test(archivo)) fallar('El formato .xls no es compatible: exporta en .xlsx o .csv.');
  const hojas = (await readExcelFile(readFileSync(archivo))).filter((s) => s.data.length);
  const idx = opt('hoja') ? Number(opt('hoja')) - 1 : hojas.reduce((b, s, i) => (s.data.length > hojas[b].data.length ? i : b), 0);
  console.log(`Hoja «${hojas[idx].sheet}» (${hojas.length} en el archivo).`);
  return hojas[idx].data;
}

function contrastarReferencia(resumen, referencia) {
  if (!referencia) return [];
  const lineas = [];
  const dias = Object.keys(referencia.diario).filter((d) => resumen.brutasPorDia[d] != null);
  if (!dias.length) return lineas;
  const dif = dias.filter((d) => resumen.brutasPorDia[d] !== referencia.diario[d]);
  const brutas = dias.reduce((a, d) => a + resumen.brutasPorDia[d], 0);
  const ref = dias.reduce((a, d) => a + referencia.diario[d], 0);
  lineas.push(dif.length ? `⚠ Filas brutas por día difieren de la referencia en ${dif.length} de ${dias.length} días (${fmt(brutas)} frente a ${fmt(ref)}): ${dif.slice(0, 5).map((d) => `${d} ${resumen.brutasPorDia[d]}≠${referencia.diario[d]}`).join(', ')}` : `✓ Filas brutas por día coinciden con la referencia en ${dias.length} días (${fmt(brutas)}).`);
  const { desde, hasta, total } = referencia.exportacion;
  const enVentana = Object.entries(resumen.brutasPorDia).filter(([d]) => d >= desde && d <= hasta).reduce((a, [, n]) => a + n, 0);
  if (resumen.desde <= desde && resumen.hasta >= hasta) lineas.push(enVentana === total ? `✓ Total ${desde} → ${hasta}: ${fmt(total)} filas, igual que la referencia.` : `⚠ Total ${desde} → ${hasta}: ${fmt(enVentana)} filas; la referencia indica ${fmt(total)}.`);
  return lineas;
}

async function importar() {
  const archivo = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
  if (!archivo) fallar('Indica el archivo: npm run sentione -- importar entradas/archivo.xlsx');
  const rows = await leerFilas(archivo);
  const header = detectHeaderRow(rows);
  const mapping = suggestMapping(rows[header] ?? []);
  for (const o of opts('columna')) {
    const [campo, ...resto] = o.split('=');
    const col = rows[header].findIndex((h) => normalizeText(h) === normalizeText(resto.join('=')));
    if (col < 0) fallar(`No existe la columna «${resto.join('=')}».`);
    mapping[campo] = col;
  }
  console.log(`Encabezados en la fila ${header + 1}:`);
  for (const c of CAMPOS) console.log(`  ${c.nombre.padEnd(28)} ${mapping[c.id] != null ? `← «${rows[header][mapping[c.id]]}»` : '—'}`);
  const val = validateMapping(mapping);
  val.avisos.forEach((a) => console.log(`  ⚠ ${a}`));
  if (!val.ok) fallar(val.errores.join(' '));

  const out = processRows(rows, header, mapping);
  const s = out.resumen;
  const referencia = existsSync(RUTA.referencia) ? leer(RUTA.referencia) : null;
  const maestra = leerMaestra();
  const meta = { desde: opt('desde') ?? s.desde, hasta: opt('hasta') ?? s.hasta, filasBrutas: s.filasBrutas };
  const { maestra: nueva, informe } = mergeExport(maestra, out.registros, meta);

  console.log(`
Filas brutas ${fmt(s.filasBrutas)} · únicas en el archivo ${fmt(s.unicasArchivo)} · duplicadas ${fmt(s.duplicadosArchivo)} · fechas no reconocidas ${fmt(s.invalidas)}
Claves: ${Object.entries(s.claves).map(([k, n]) => `${k} ${fmt(n)}`).join(' · ')} · sin país ${fmt(s.sinPais)} (se conservan) · con hora ${fmt(s.conHora)}
Base maestra: ${fmt(informe.totalAntes)} → ${fmt(informe.totalDespues)} · nuevos ${fmt(informe.nuevos)} · ya existentes ${fmt(informe.existentes)} · métricas actualizadas ${fmt(informe.actualizados)} · textos editados ${fmt(informe.modificados)}
Cobertura: ${informe.cobertura.map((c) => `${c.desde} → ${c.hasta}`).join(', ')}`);
  out.errores.slice(0, 8).forEach((e) => console.log(`  fila ${e.fila}: ${e.motivo}`));
  contrastarReferencia(s, referencia).forEach((l) => console.log(l));

  if (args.includes('--seco')) return console.log('\nModo --seco: no se guardó nada.');
  guardarMaestra(nueva);

  const { lotes, grupos, registros, sinTexto } = buildLotes(nueva, out.registros, { reclasificarVersion: args.includes('--reclasificar') });
  mkdirSync(RUTA.lotes, { recursive: true });
  for (const f of readdirSync(RUTA.lotes)) if (/^lote-\d+\.json$/.test(f)) writeFileSync(new URL(f, RUTA.lotes), ''); // invalida lotes anteriores
  for (const l of lotes) writeFileSync(new URL(`${l.lote}.json`, RUTA.lotes), JSON.stringify(l, null, 1));
  console.log(`
✓ Base maestra guardada.
Pendientes de clasificación semántica: ${fmt(registros)} registros en ${fmt(grupos)} textos únicos → ${lotes.length} lotes en entradas/lotes/ (criterios ${CRITERIOS_VERSION}).${sinTexto ? `\n⚠ ${fmt(sinTexto)} pendientes no están en esta exportación: se clasificarán cuando vuelvan a aparecer.` : ''}
Siguiente paso: clasificar cada lote según datos/CRITERIOS_CLASIFICACION.md → lote-NNN.resultado.json, y luego «npm run sentione -- aplicar».`);
}

function aplicar() {
  if (!existsSync(RUTA.lotes)) fallar('No hay lotes en entradas/lotes/.');
  let maestra = leerMaestra();
  const total = { aplicados: 0, protegidos: 0, revisar: 0, errores: [], faltantes: [], emergentes: {} };
  for (const f of readdirSync(RUTA.lotes).filter((x) => /^lote-\d+\.json$/.test(x)).sort()) {
    const raw = readFileSync(new URL(f, RUTA.lotes), 'utf8');
    if (!raw) continue;
    const lote = JSON.parse(raw);
    const fr = new URL(f.replace('.json', '.resultado.json'), RUTA.lotes);
    if (!existsSync(fr)) {
      total.faltantes.push(...lote.items.map((it) => it.clave));
      continue;
    }
    const resultado = JSON.parse(readFileSync(fr, 'utf8'));
    if (resultado.lote !== lote.lote) fallar(`${fr.pathname}: el resultado no corresponde a ${lote.lote}.`);
    const r = aplicarResultados(maestra, lote, resultado.resultados ?? [], { fuente: resultado.fuente === 'manual' ? 'manual' : 'claude', fecha: hoy() });
    maestra = r.maestra;
    for (const k of ['aplicados', 'protegidos', 'revisar']) total[k] += r.informe[k];
    total.errores.push(...r.informe.errores.map((e) => `${lote.lote} · ${e}`));
    total.faltantes.push(...r.informe.faltantes);
    for (const x of resultado.resultados ?? []) if (x.emergente) total.emergentes[x.emergente] = (total.emergentes[x.emergente] ?? 0) + 1;
    writeFileSync(new URL(f.replace('.json', '.aplicado'), RUTA.lotes), hoy());
  }
  guardarMaestra(maestra);
  writeFileSync(new URL('emergentes.json', RUTA.lotes), JSON.stringify(total.emergentes, null, 1));
  console.log(`✓ Clasificaciones aplicadas a ${fmt(total.aplicados)} registros · marcados para revisión ${fmt(total.revisar)} · revisiones manuales protegidas ${fmt(total.protegidos)}`);
  if (total.errores.length) console.log(`⚠ ${total.errores.length} resultados rechazados (no se aplicaron):\n  ${total.errores.slice(0, 15).join('\n  ')}`);
  if (total.faltantes.length) console.log(`⚠ ${total.faltantes.length} textos sin resultado: siguen pendientes.`);
  if (Object.keys(total.emergentes).length) console.log(`Temáticas emergentes propuestas: ${Object.entries(total.emergentes).map(([k, n]) => `${k} (${n})`).join(', ')}`);
  estado();
}

function cifrasClave(res) {
  if (!res?.cubo) return {};
  const h = hechos(res, hoy());
  const out = { 'Menciones únicas en la base': res.totales?.unicos ?? 0, 'Clasificadas por contenido': res.totales?.clasificados ?? 0 };
  for (const [k, x] of Object.entries(h)) if (x.disponible && x.cifra) out[`${k}: ${x.unidad}`] = x.cifra;
  return out;
}

function publicar() {
  const maestra = leerMaestra();
  const referencia = existsSync(RUTA.referencia) ? leer(RUTA.referencia) : null;
  const res = buildResultados(maestra, referencia);
  const errores = validarResultados(res);
  if (errores.length) fallar(`Resultados no válidos:\n  ${errores.join('\n  ')}`);
  const previo = existsSync(RUTA.resultados) ? leer(RUTA.resultados) : null;
  const antes = cifrasClave(previo);
  const despues = cifrasClave(res);
  const cambios = [...new Set([...Object.keys(antes), ...Object.keys(despues)])].filter((k) => String(antes[k]) !== String(despues[k])).map((k) => `| ${k} | ${antes[k] ?? '—'} | ${despues[k] ?? '—'} |`);
  mkdirSync(new URL('.', RUTA.resultados), { recursive: true });
  writeFileSync(RUTA.resultados, `${JSON.stringify(res)}\n`);

  const ult = maestra.importaciones[maestra.importaciones.length - 1];
  const motivos = [];
  if (ult) motivos.push(`Última exportación: ${fmt(ult.filasBrutas)} filas brutas → ${fmt(ult.unicasArchivo)} únicas en el archivo → ${fmt(ult.nuevos)} nuevas en la base (${fmt(ult.existentes)} ya existían; ${fmt(ult.actualizados)} con métricas actualizadas).`);
  if (previo && !previo.cobertura?.length && res.cobertura.length)
    motivos.push('Las cifras de los días cubiertos pasan de la referencia preliminar (filas exportadas) a menciones únicas deduplicadas de la base maestra; por eso pueden ser menores que la referencia.');
  if (previo && res.totales.clasificados !== (previo.totales?.clasificados ?? 0)) motivos.push(`Clasificación semántica: ${fmt(res.totales.clasificados)} de ${fmt(res.totales.unicos)} menciones (${fmt(res.totales.revisar)} marcadas para revisión).`);
  const informe = `# Actualización de resultados · ${hoy()}

## Base maestra
- Menciones únicas: ${fmt(res.totales.unicos)} · clasificadas por contenido: ${fmt(res.totales.clasificados)} · pendientes: ${fmt(res.totales.pendientes)} · para revisión: ${fmt(res.totales.revisar)}
- Relevantes para cáncer de mama: ${fmt(res.totales.relevantes)} · coincidencias ajenas: ${fmt(res.totales.noRelevantes)}
- Cobertura: ${res.cobertura.map((c) => `${c.desde} → ${c.hasta}`).join(', ') || 'sin registros individuales (solo referencia preliminar)'}

## Por qué cambian las cifras
${motivos.map((m) => `- ${m}`).join('\n') || '- Sin cambios en la base.'}

## Cifras publicadas que cambian
${cambios.length ? `| Cifra | Antes | Ahora |\n|---|---|---|\n${cambios.join('\n')}` : 'Ninguna.'}
`;
  mkdirSync(RUTA.informes, { recursive: true });
  writeFileSync(new URL(`actualizacion-${hoy()}.md`, RUTA.informes), informe);
  console.log(informe);
  console.log('✓ src/data/resultados.json actualizado. Revisa src/content/conclusiones.js si los hechos cambiaron.');
}

function estado() {
  const m = leerMaestra();
  const n = m.registros.length;
  const cl = m.registros.filter(clasificado).length;
  const rv = m.registros.filter((r) => clasificado(r) && r.c.rv).length;
  console.log(`Base maestra: ${fmt(n)} menciones únicas · clasificadas ${fmt(cl)} · pendientes ${fmt(pendientes(m).length)} · para revisión ${fmt(rv)}`);
  console.log(`Cobertura: ${m.cobertura.map((c) => `${c.desde} → ${c.hasta}`).join(', ') || '—'} · importaciones: ${m.importaciones.length}`);
}

function verificar() {
  const e1 = validarMaestra(leerMaestra());
  const e2 = validarResultados(leer(RUTA.resultados));
  if (e1.length || e2.length) fallar([...e1, ...e2].join('\n  '));
  console.log('✓ Base maestra y resultados válidos.');
}

const COMANDOS = { importar, aplicar, publicar, estado, verificar };
if (!COMANDOS[cmd]) fallar(`Comando desconocido. Usa: ${Object.keys(COMANDOS).join(', ')}.`);
await COMANDOS[cmd]();
