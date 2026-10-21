#!/usr/bin/env node
// Actualización de la escucha social de SentiOne (solo Claude Code / desarrollo; nunca en la web).
//
// La base maestra y los informes viven en el repositorio PRIVADO msd-el-viaje-de-la-vida-datos,
// clonado junto a este repositorio (../msd-el-viaje-de-la-vida-datos) o en SENTIONE_DATOS / --datos.
// Este repositorio público solo recibe src/data/resultados.json (agregados).
//
//   npm run sentione -- inicializar        # prepara un repositorio privado vacío (una sola vez)
//   npm run sentione -- estado
//   npm run sentione -- importar entradas/exportacion.xlsx [--desde AAAA-MM-DD --hasta AAAA-MM-DD] [--hoja N] [--columna campo=Encabezado] [--seco]
//   npm run sentione -- aplicar            # aplica entradas/lotes/lote-NNN.resultado.json
//   npm run sentione -- publicar           # genera src/data/resultados.json y el informe privado
//   npm run sentione -- guardar            # verifica que el repositorio es privado, hace commit y push
//   npm run sentione -- verificar
//
// Nada de entradas/ (Excel, textos, lotes) se guarda en ningún repositorio: está en .gitignore.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import readExcelFile from 'read-excel-file/node';
import Papa from 'papaparse';
import { CAMPOS, detectHeaderRow, suggestMapping, validateMapping } from '../src/lib/data/columns.js';
import { processRows } from '../src/lib/data/process.js';
import { aplicarResultados, buildLotes, clasificado, emptyMaestra, mergeExport, pendientes, serializarMaestra, validarMaestra } from '../src/lib/data/maestra.js';
import { buildResultados, validarResultados } from '../src/lib/data/publicar.js';
import { hechos } from '../src/lib/data/hechos.js';
import { normalizeText } from '../src/lib/data/text.js';
import { CRITERIOS_VERSION } from '../src/config/clasificacion.js';

const [cmd, ...args] = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const opts = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));

export const REPO_PRIVADO = 'diegoporras18-code/msd-el-viaje-de-la-vida-datos';
const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const DATOS = resolve(opt('datos') ?? process.env.SENTIONE_DATOS ?? resolve(RAIZ, '..', 'msd-el-viaje-de-la-vida-datos'));
const carpeta = (p) => pathToFileURL(`${p.replace(/\/+$/, '')}/`);
const RUTA = {
  maestra: new URL('maestra/base-maestra.json', carpeta(DATOS)),
  informes: new URL('informes/', carpeta(DATOS)),
  referencia: new URL('../datos/maestra/referencia.json', import.meta.url),
  resultados: process.env.SENTIONE_RESULTADOS ? pathToFileURL(resolve(process.env.SENTIONE_RESULTADOS)) : new URL('../src/data/resultados.json', import.meta.url),
  lotes: new URL('../entradas/lotes/', import.meta.url),
};

const leer = (url) => JSON.parse(readFileSync(url, 'utf8'));
const hoy = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => new Intl.NumberFormat('es-CO').format(n);
const fallar = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const git = (...a) => execFileSync('git', ['-C', DATOS, ...a], { encoding: 'utf8' }).trim();

/** La base maestra nunca puede vivir dentro del repositorio público. */
function comprobarUbicacion() {
  const rel = relative(RAIZ, DATOS);
  if (!rel || (!rel.startsWith('..') && !isAbsolute(rel))) fallar('La base maestra no puede estar dentro del repositorio público.');
  if (!existsSync(DATOS)) fallar(`No encuentro el repositorio privado en ${DATOS}. Conéctalo y clónalo junto a este repositorio (skill actualizar-sentione, paso 1).`);
  // La base maestra solo vive en la rama main: nunca se lee ni se guarda en otra rama.
  let rama = '';
  try {
    rama = git('rev-parse', '--abbrev-ref', 'HEAD');
  } catch {
    rama = git('symbolic-ref', '--short', 'HEAD');
  }
  if (rama !== 'main') fallar(`El repositorio de datos está en la rama «${rama}». Ejecuta: git -C ${DATOS} fetch origin main && git -C ${DATOS} checkout main`);
}

/**
 * Antes de escribir o publicar en el repositorio de datos, confirma en GitHub que es privado.
 * Solo las pruebas automáticas (SENTIONE_PRUEBA=1) pueden usar un repositorio local sin GitHub.
 */
function comprobarPrivado() {
  comprobarUbicacion();
  let remoto = '';
  try {
    remoto = git('remote', 'get-url', 'origin');
  } catch {
    fallar('El repositorio de datos no tiene remoto «origin».');
  }
  const m = remoto.match(/github\.com[/:]([^/]+\/[^/.]+?)(?:\.git)?$/);
  if (!m) {
    if (process.env.SENTIONE_PRUEBA === '1') return 'local (prueba)';
    fallar(`El remoto «${remoto}» no es un repositorio de GitHub verificable.`);
  }
  if (m[1].toLowerCase() !== REPO_PRIVADO) fallar(`El repositorio de datos debe ser ${REPO_PRIVADO}, no ${m[1]}.`);
  let privado;
  try {
    privado = execFileSync('gh', ['api', `repos/${m[1]}`, '--jq', '.private'], { encoding: 'utf8' }).trim();
  } catch {
    fallar(`No pude comprobar en GitHub la visibilidad de ${m[1]}: no se guarda nada.`);
  }
  if (privado !== 'true') fallar(`${m[1]} NO es privado en GitHub: no se guarda nada. Vuelve a hacerlo privado antes de continuar.`);
  return m[1];
}

const leerMaestra = () => {
  comprobarUbicacion();
  return existsSync(RUTA.maestra) ? leer(RUTA.maestra) : emptyMaestra();
};

function guardarMaestra(m) {
  mkdirSync(new URL('.', RUTA.maestra), { recursive: true });
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
  if (!res?.diario) return {};
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
  if (previo && previo.version !== res.version)
    motivos.push(`Los resultados públicos pasan al formato ${res.version}: solo serie diaria y distribuciones de una dimensión por periodo base, sin celdas menores que ${res.umbral} (agrupadas o como muestra insuficiente). El detalle sigue disponible únicamente en esta base privada.`);
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
  // Nunca sobrescribe un informe anterior del mismo día.
  let nombre = `actualizacion-${hoy()}.md`;
  for (let i = 2; existsSync(new URL(nombre, RUTA.informes)); i++) nombre = `actualizacion-${hoy()}-${i}.md`;
  writeFileSync(new URL(nombre, RUTA.informes), informe);
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
  const e2 = validarResultados(leer(RUTA.resultados));
  const e1 = existsSync(DATOS) ? validarMaestra(leerMaestra()) : [];
  if (e1.length || e2.length) fallar([...e1, ...e2].join('\n  '));
  console.log(`✓ Resultados públicos válidos${existsSync(DATOS) ? ' y base maestra privada válida' : ' (repositorio privado no conectado: base maestra no comprobada)'}.`);
}

function inicializar() {
  comprobarUbicacion();
  mkdirSync(new URL('maestra/', carpeta(DATOS)), { recursive: true });
  mkdirSync(RUTA.informes, { recursive: true });
  if (!existsSync(RUTA.maestra)) writeFileSync(RUTA.maestra, serializarMaestra(emptyMaestra()));
  if (!existsSync(new URL('informes/.gitkeep', carpeta(DATOS)))) writeFileSync(new URL('informes/.gitkeep', carpeta(DATOS)), '');
  writeFileSync(new URL('.gitignore', carpeta(DATOS)), '# Nunca guardar exportaciones originales ni textos de publicaciones.\nentradas/\n*.xlsx\n*.xlsm\n*.xls\n*.csv\nlotes/\n');
  writeFileSync(
    new URL('README.md', carpeta(DATOS)),
    `# El Viaje de la Vida · datos privados

**Repositorio privado. No cambiar nunca su visibilidad a pública.**

Contiene la base maestra acumulativa de escucha social de SentiOne (\`maestra/base-maestra.json\`): una línea por mención única, seudonimizada, con su clasificación semántica, el histórico de importaciones y las revisiones manuales, más los informes internos de cada actualización (\`informes/\`).

No contiene exportaciones originales, textos de publicaciones, URLs, autores ni país.

Lo gestiona Claude Code con la skill \`actualizar-sentione\` del repositorio público \`msd-el-viaje-de-la-vida\`, que solo recibe resultados agregados.
`,
  );
  console.log(`✓ Repositorio de datos preparado en ${DATOS}.`);
}

function guardar() {
  const repo = comprobarPrivado();
  const errores = validarMaestra(leerMaestra());
  if (errores.length) fallar(`La base maestra no es válida:\n  ${errores.join('\n  ')}`);
  const sueltos = git('ls-files', '--others', '--cached', '--exclude-standard').split('\n').filter((f) => /\.(xlsx|xlsm|xls|csv)$/i.test(f) || f.startsWith('entradas/') || f.startsWith('lotes/'));
  if (sueltos.length) fallar(`Hay archivos que no deben guardarse: ${sueltos.join(', ')}`);
  git('add', '-A', 'maestra', 'informes', 'README.md', '.gitignore');
  if (!git('status', '--porcelain')) return console.log('Sin cambios en el repositorio de datos.');
  const m = leerMaestra();
  const ult = m.importaciones[m.importaciones.length - 1];
  const msg = opt('mensaje') ?? `Actualización ${hoy()}: ${m.registros.length} menciones únicas${ult ? `, ${ult.nuevos} nuevas` : ''}, ${m.registros.filter(clasificado).length} clasificadas`;
  git('-c', 'user.name=Claude Code', '-c', 'user.email=noreply@anthropic.com', 'commit', '-q', '-m', msg);
  if (!args.includes('--sin-push')) git('push', '-q', 'origin', 'HEAD:main');
  console.log(`✓ Base maestra guardada en ${repo}: ${msg}`);
}

const COMANDOS = { inicializar, importar, aplicar, publicar, guardar, estado, verificar };
if (!COMANDOS[cmd]) fallar(`Comando desconocido. Usa: ${Object.keys(COMANDOS).join(', ')}.`);
await COMANDOS[cmd]();
