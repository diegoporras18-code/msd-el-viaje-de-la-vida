// Lectura de archivos en el navegador. Las bibliotecas se cargan solo al usar el importador.

/** Devuelve [{ sheet, data: filas[] }] para XLSX o CSV. */
export async function readSpreadsheet(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xls') && !name.endsWith('.xlsx'))
    throw new Error('El formato .xls (Excel 97-2003) no es compatible. Exporta desde SentiOne en .xlsx o .csv.');

  if (name.endsWith('.csv') || file.type === 'text/csv') {
    const { default: Papa } = await import('papaparse');
    const text = (await file.text()).replace(/^﻿/, '');
    const res = Papa.parse(text, { skipEmptyLines: 'greedy' });
    if (!res.data.length) throw new Error('El CSV está vacío o no se pudo leer.');
    return [{ sheet: 'CSV', data: res.data }];
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xlsm')) {
    const { default: readExcelFile } = await import('read-excel-file/browser');
    const sheets = await readExcelFile(file);
    return sheets.filter((s) => s.data?.length);
  }

  throw new Error('Formato no reconocido. Usa un archivo .xlsx o .csv exportado de SentiOne.');
}

/** Descarga un objeto como archivo JSON (en iPhone se abre la hoja para guardar en Archivos). */
export function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
