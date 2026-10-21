#!/usr/bin/env node
// Importa una exportación de SentiOne a src/data/dataset.json con la misma lógica del importador web.
//
//   npm run importar -- entradas/archivo.xlsx --universo categoria [--desde 2026-10-21 --hasta 2026-10-31] [--hoja 1] [--seco]
//
// Universos: categoria, msd, daiichi-sankyo, astrazeneca (ver src/config/universos.js).
// El archivo original nunca se copia al repositorio: guárdalo en entradas/ (ignorada por git).
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import readExcelFile from 'read-excel-file/node';
import Papa from 'papaparse';
import { CAMPOS, detectHeaderRow, suggestMapping, validateMapping } from '../src/lib/data/columns.js';
import { processRows } from '../src/lib/data/process.js';
import { exportDataset, mergeImport, validateDataset } from '../src/lib/data/dataset.js';
import { baseCheck } from '../src/lib/data/aggregate.js';
import { UNIVERSOS } from '../src/config/universos.js';

const DATASET = new URL('../src/data/dataset.json', import.meta.url);
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const archivo = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const universo = opt('universo');
const seco = args.includes('--seco');

if (!archivo || !universo || !UNIVERSOS.some((u) => u.id === universo)) {
  console.error(`Uso: npm run importar -- <archivo.xlsx|csv> --universo <${UNIVERSOS.map((u) => u.id).join('|')}> [--desde AAAA-MM-DD --hasta AAAA-MM-DD] [--hoja N] [--seco]`);
  process.exit(1);
}

let rows;
if (archivo.toLowerCase().endsWith('.csv')) {
  rows = Papa.parse(readFileSync(archivo, 'utf8').replace(/^﻿/, ''), { skipEmptyLines: 'greedy' }).data;
} else {
  const hojas = (await readExcelFile(readFileSync(archivo))).filter((s) => s.data.length);
  const idx = opt('hoja') ? Number(opt('hoja')) - 1 : hojas.reduce((b, s, i) => (s.data.length > hojas[b].data.length ? i : b), 0);
  rows = hojas[idx].data;
  console.log(`Hoja: ${hojas[idx].sheet} (${hojas.length} en el archivo)`);
}

const header = detectHeaderRow(rows);
const mapping = suggestMapping(rows[header]);
console.log(`Encabezados en la fila ${header + 1}. Mapeo detectado:`);
for (const c of CAMPOS) if (mapping[c.id] != null) console.log(`  ${c.nombre.padEnd(28)} ← «${rows[header][mapping[c.id]]}»`);
const val = validateMapping(mapping);
val.avisos.forEach((a) => console.log(`  ⚠ ${a}`));
if (!val.ok) {
  val.errores.forEach((e) => console.error(`  ✗ ${e}`));
  console.error('Corrige el mapeo con el importador web (#/importar) o renombra las columnas.');
  process.exit(1);
}

const out = processRows(rows, header, mapping);
const actual = JSON.parse(readFileSync(DATASET, 'utf8'));
const meta = { desde: opt('desde') ?? out.resumen.desde, hasta: opt('hasta') ?? out.resumen.hasta, archivo: basename(archivo) };
const { dataset, diff } = mergeImport(actual, universo, out.registros, meta);
const s = out.resumen;

console.log(`
Filas leídas ${s.filasLeidas} · válidas ${s.validos} · fechas no reconocidas ${s.invalidos} · duplicados en el archivo ${s.duplicadosArchivo}
Nuevos ${diff.nuevos} · ya existentes ${diff.existentes} · métricas actualizadas ${diff.metricasActualizadas} · sin país ${s.sinPais} (se conservan)
Ventana de cobertura: ${meta.desde} → ${meta.hasta} · total del universo: ${diff.totalAntes} → ${diff.totalDespues}`);
out.errores.slice(0, 10).forEach((e) => console.log(`  fila ${e.fila}: ${e.motivo}`));
const chk = baseCheck(dataset.universos[universo]);
if (chk) console.log(chk.coincide ? `Contraste con la línea base: coincide en ${chk.dias} días.` : `⚠ Contraste con la línea base: ${chk.diferencias.length} días con diferencias.`);

const final = exportDataset(dataset);
const errores = validateDataset(final);
if (errores.length) {
  errores.forEach((e) => console.error(`✗ ${e}`));
  process.exit(1);
}
if (seco) console.log('\nModo --seco: no se escribió ningún archivo.');
else {
  writeFileSync(DATASET, `${JSON.stringify(final, null, 1)}\n`);
  console.log('\n✓ src/data/dataset.json actualizado. Ejecuta npm test y npm run build antes de abrir el Pull Request.');
}
