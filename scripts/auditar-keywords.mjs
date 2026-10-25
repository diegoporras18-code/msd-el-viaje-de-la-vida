// Diagnóstico local de la configuración aportada; NO filtra ni modifica la base.
// Uso: node scripts/auditar-keywords.mjs entradas/archivo.xlsx ../datos/informes/consulta.json ../datos/informes/diagnostico.json
import { readFileSync, writeFileSync } from 'node:fs';
import readExcelFile from 'read-excel-file/node';
import { coincideRegla } from '../src/lib/data/consulta.js';
const [archivo, consulta, salida] = process.argv.slice(2);
if (!archivo || !consulta || !salida) throw new Error('Indica Excel, configuración privada y salida privada o ignorada.');
const q = JSON.parse(readFileSync(consulta, 'utf8'));
const sheets = await readExcelFile(archivo);
const sheet = sheets.find(s => s.sheet === 'Mentions');
if (!sheet) throw new Error('Falta la hoja Mentions.');
const [headers, ...rows] = sheet.data;
const col = name => { const i = headers.indexOf(name); if (i < 0) throw new Error(`Falta ${name}`); return i; };
const cols = ['Title', 'Content of posts', 'Context', 'Author'].map(col);
const autor = col('Author');const keywords = col('Keywords');
const normal = s => String(s ?? '').normalize('NFC').toLocaleLowerCase('es');
const reglas = q.cualquiera.map((terminos, i) => ({ regla: i + 1, terminos, coincidencias: 0 }));
let compatibles = 0, excluidos = 0;
for (const row of rows) {
  const fields = cols.map(i => normal(row[i]));
  if (q.excluirAutor.some(x => normal(row[autor]).includes(normal(x)))) { excluidos++; continue; }
  const matches = reglas.filter(r => coincideRegla(fields, r.terminos));
  matches.forEach(r => r.coincidencias++);if (matches.length) compatibles++;
}
const out = { version: 1, fuenteConsulta: q.fuente, filas: rows.length, alternativasOR: reglas.length, coincidenciasLocales: compatibles, exclusionesLocales: excluidos, combinacionesCampoKeywords: new Set(rows.map(r => r[keywords])).size, reglas,
  limitacion: 'Diagnóstico por subcadenas NFC sin distinguir mayúsculas y con orden literal de palabras. AND exige cada término en alguno de contenido, título, contexto o autor; OR une grupos. No reproduce stemming, operadores internos ni historial del motor SentiOne. No demuestra que la misma consulta estuviera activa en todas las exportaciones. No usar para eliminar menciones históricas.' };
writeFileSync(salida, JSON.stringify(out, null, 1));
console.log(`Diagnóstico guardado: ${rows.length} filas y ${reglas.length} alternativas; sin modificar registros.`);
