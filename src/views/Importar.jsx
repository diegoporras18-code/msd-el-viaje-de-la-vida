import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Chips from '../components/Chips.jsx';
import ReviewPanel from './ReviewPanel.jsx';
import { useData } from '../state/DataContext.jsx';
import { UNIVERSOS, universoPorId } from '../config/universos.js';
import { CAMPOS, detectHeaderRow, suggestMapping, validateMapping } from '../lib/data/columns.js';
import { processRows } from '../lib/data/process.js';
import { exportDataset, mergeImport, validateDataset } from '../lib/data/dataset.js';
import { baseCheck } from '../lib/data/aggregate.js';
import { downloadJson, readSpreadsheet } from '../lib/data/read.js';
import { longDate, rangeLabel } from '../lib/data/dates.js';
import { formatNumber } from '../lib/format.js';
import { ease } from '../lib/motion.js';

const input = 'min-h-[44px] w-full rounded-sm border border-rosa/30 bg-ciruela-800 px-3 text-marfil';
const btn = 'inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const btnMain = `${btn} bg-rosa text-ciruela hover:bg-marfil`;
const btnSec = `${btn} border border-rosa/40 text-marfil hover:border-rosa`;
const muestra = (v) => (v instanceof Date ? v.toISOString().slice(0, 16).replace('T', ' ') : String(v ?? '')).slice(0, 48);

export default function Importar() {
  const { dataset, published, preview, setPreview } = useData();
  const [trabajo, setTrabajo] = useState(dataset);
  const [universo, setUniverso] = useState('categoria');
  const [archivo, setArchivo] = useState(null);
  const [hojas, setHojas] = useState([]);
  const [hoja, setHoja] = useState(0);
  const [header, setHeader] = useState(0);
  const [mapping, setMapping] = useState({});
  const [ventana, setVentana] = useState({ desde: '', hasta: '' });
  const [resultado, setResultado] = useState(null);
  const [aplicado, setAplicado] = useState(null);
  const [locales, setLocales] = useState(new Map());
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const filas = hojas[hoja]?.data ?? [];
  const encabezados = filas[header] ?? [];
  const validacion = validateMapping(mapping);

  const preparar = (rows) => {
    const h = detectHeaderRow(rows);
    setHeader(h);
    setMapping(suggestMapping(rows[h] ?? []));
    setVentana({ desde: '', hasta: '' });
    setResultado(null);
    setAplicado(null);
  };

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCargando(true);
    try {
      const sh = await readSpreadsheet(file);
      if (!sh.length) throw new Error('El archivo no contiene hojas con datos.');
      const mejor = sh.reduce((b, s, i) => (s.data.length > sh[b].data.length ? i : b), 0);
      setArchivo(file.name);
      setHojas(sh);
      setHoja(mejor);
      preparar(sh[mejor].data);
    } catch (err) {
      setError(err.message);
      setHojas([]);
    } finally {
      setCargando(false);
    }
  }

  function procesar() {
    const out = processRows(filas, header, mapping);
    const meta = { desde: ventana.desde || out.resumen.desde, hasta: ventana.hasta || out.resumen.hasta, archivo };
    if (!ventana.desde) setVentana({ desde: out.resumen.desde ?? '', hasta: out.resumen.hasta ?? '' });
    const merge = mergeImport(trabajo, universo, out.registros, meta);
    setResultado({ ...out, merge, meta });
    setAplicado(null);
  }

  function recalcularVentana() {
    if (!resultado) return;
    const meta = { ...resultado.meta, desde: ventana.desde, hasta: ventana.hasta };
    setResultado({ ...resultado, meta, merge: mergeImport(trabajo, universo, resultado.registros, meta) });
  }

  function aplicar() {
    const next = resultado.merge.dataset;
    const m = new Map(locales);
    resultado.registros.forEach((r) => m.set(`${universo}:${r.h}`, r._local));
    setLocales(m);
    setTrabajo(next);
    setPreview(next);
    setAplicado({ universo, diff: resultado.merge.diff, check: baseCheck(next.universos[universo]) });
    setResultado(null);
  }

  async function cargarJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ds = JSON.parse(await file.text());
      const errs = validateDataset(ds);
      if (errs.length) throw new Error(`El JSON no es válido: ${errs.slice(0, 3).join(' ')}`);
      setTrabajo(ds);
      setPreview(ds);
      setError(null);
      setAplicado({ cargado: file.name });
    } catch (err) {
      setError(err.message);
    }
  }

  const exportado = useMemo(() => exportDataset(trabajo), [trabajo]);
  const erroresExport = useMemo(() => validateDataset(exportado), [exportado]);
  const cambios = trabajo !== published;

  return (
    <div className="shell mx-auto max-w-5xl pb-24 pt-28">
      <p className="eyebrow text-rosa">Actualizar datos</p>
      <h1 className="display mt-3 text-[length:var(--step-4)] text-marfil">
        Importar <span className="italic text-rosa">SentiOne</span>
      </h1>
      <p className="mt-6 max-w-2xl text-bruma">
        Carga una exportación XLSX o CSV de SentiOne. Todo se procesa en este navegador: el archivo no se sube a ningún servidor. El resultado es un archivo{' '}
        <code className="text-marfil">dataset.json</code> con agregados y registros anonimizados, que se publica con un commit en GitHub.
      </p>

      <ul className="mt-8 grid gap-3 text-sm text-bruma sm:grid-cols-3">
        <li className="border-l border-rosa/30 pl-3">Nunca se publican textos, URLs ni autores de los registros: solo agregados y contenidos revisados expresamente.</li>
        <li className="border-l border-rosa/30 pl-3">Los registros sin país se conservan: no hay filtros geográficos.</li>
        <li className="border-l border-rosa/30 pl-3">Los duplicados se detectan por ID o URL estable, también contra el histórico.</li>
      </ul>

      {error && (
        <p role="alert" className="mt-8 border-l-2 border-fucsia pl-4 text-marfil">
          {error}
        </p>
      )}

      <Paso n="1" titulo="Universo y archivo">
        <p className="mb-3 text-sm text-bruma">¿A qué consulta corresponde la exportación?</p>
        <Chips multiple={false} opciones={UNIVERSOS.map((u) => ({ id: u.id, nombre: u.nombre, color: u.color }))} valor={universo} onChange={(v) => { setUniverso(v); setResultado(null); }} etiqueta="Universo de monitoreo" />
        <p className="mt-2 text-xs text-bruma">{universoPorId(universo).descripcion}</p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm text-marfil">Archivo de SentiOne (.xlsx o .csv)</span>
          <input type="file" accept=".xlsx,.xlsm,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFile} className="block w-full text-sm text-bruma file:mr-4 file:min-h-[44px] file:rounded-full file:border-0 file:bg-rosa file:px-5 file:text-ciruela" />
        </label>
        {cargando && <p className="mt-3 text-sm text-rosa">Leyendo archivo…</p>}
        {hojas.length > 1 && (
          <label className="mt-4 block max-w-sm text-sm text-bruma">
            Hoja
            <select className={`${input} mt-1`} value={hoja} onChange={(e) => { setHoja(Number(e.target.value)); preparar(hojas[Number(e.target.value)].data); }}>
              {hojas.map((h, i) => (
                <option key={h.sheet} value={i}>
                  {h.sheet} ({formatNumber(h.data.length)} filas)
                </option>
              ))}
            </select>
          </label>
        )}
      </Paso>

      {filas.length > 0 && (
        <Paso n="2" titulo="Columnas detectadas">
          <p className="text-sm text-bruma">
            {archivo} · {formatNumber(filas.length - header - 1)} filas de datos. Revisa y corrige el mapeo si hace falta.
          </p>
          <label className="mt-4 flex max-w-xs items-center gap-3 text-sm text-bruma">
            Fila de encabezados
            <input type="number" min="1" max={Math.min(filas.length, 30)} value={header + 1} onChange={(e) => { const h = Math.max(0, Number(e.target.value) - 1); setHeader(h); setMapping(suggestMapping(filas[h] ?? [])); }} className={`${input} w-24`} />
          </label>
          <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {CAMPOS.map((c) => (
              <label key={c.id} className="block text-sm">
                <span className="text-marfil">
                  {c.nombre}
                  {c.requerido && <span className="text-fucsia"> *</span>}
                </span>
                <select
                  className={`${input} mt-1`}
                  value={mapping[c.id] ?? ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [c.id]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                >
                  <option value="">— Sin asignar —</option>
                  {encabezados.map((h, i) => (
                    <option key={i} value={i}>
                      {String(h ?? `Columna ${i + 1}`)}
                    </option>
                  ))}
                </select>
                {mapping[c.id] != null && <span className="mt-1 block truncate text-xs text-bruma">Ej.: {muestra(filas[header + 1]?.[mapping[c.id]]) || '(vacío)'}</span>}
              </label>
            ))}
          </div>
          <div className="mt-6 space-y-1 text-sm">
            {validacion.errores.map((e) => (
              <p key={e} className="text-fucsia">
                {e}
              </p>
            ))}
            {validacion.avisos.map((e) => (
              <p key={e} className="text-bruma">
                ⚠ {e}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={btnMain} disabled={!validacion.ok} onClick={procesar}>
              Procesar y ver cambios
            </button>
          </div>
        </Paso>
      )}

      {resultado && (
        <Paso n="3" titulo="Vista previa de los cambios">
          <Resumen r={resultado} />
          <fieldset className="mt-8 rounded-sm border border-rosa/20 p-4">
            <legend className="eyebrow px-2 text-rosa">Ventana de la exportación</legend>
            <p className="text-xs text-bruma">Los días de esta ventana se consideran cubiertos: un día sin registros cuenta como cero. Ajústala si la exportación empieza o termina a mitad de un día.</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-sm text-bruma">
                Desde
                <input type="date" className={`${input} mt-1`} value={ventana.desde} onChange={(e) => setVentana((v) => ({ ...v, desde: e.target.value }))} />
              </label>
              <label className="text-sm text-bruma">
                Hasta
                <input type="date" className={`${input} mt-1`} value={ventana.hasta} onChange={(e) => setVentana((v) => ({ ...v, hasta: e.target.value }))} />
              </label>
              <button type="button" className={btnSec} onClick={recalcularVentana} disabled={!ventana.desde || !ventana.hasta || ventana.desde > ventana.hasta}>
                Recalcular
              </button>
            </div>
          </fieldset>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={btnMain} onClick={aplicar} disabled={!resultado.registros.length}>
              Aplicar a la vista previa local
            </button>
            <button type="button" className={btnSec} onClick={() => setResultado(null)}>
              Cancelar
            </button>
          </div>
        </Paso>
      )}

      {aplicado && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: ease.out }} className="mt-10 border-l-2 border-rosa pl-4 text-sm text-marfil" role="status">
          {aplicado.cargado
            ? `JSON «${aplicado.cargado}» cargado como vista previa local.`
            : `Aplicado a ${universoPorId(aplicado.universo).nombre}: ${formatNumber(aplicado.diff.nuevos)} registros nuevos, ${formatNumber(aplicado.diff.existentes)} ya existentes. Total: ${formatNumber(aplicado.diff.totalDespues)}.`}
          {aplicado.check && (
            <span className="block text-bruma">
              Contraste con la línea base: {aplicado.check.coincide ? `coincide en ${aplicado.check.dias} días.` : `${aplicado.check.diferencias.length} días con diferencias (revisa la ventana o el archivo).`}
            </span>
          )}{' '}
          <a href="#/explorar" className="text-rosa underline underline-offset-4">
            Ver la vista previa en los dashboards
          </a>
        </motion.div>
      )}

      {locales.size > 0 && (
        <Paso n="4" titulo="Revisión manual (opcional)">
          <ReviewPanel trabajo={trabajo} locales={locales} onChange={(ds) => { setTrabajo(ds); setPreview(ds); }} />
        </Paso>
      )}

      <Paso n={locales.size > 0 ? '5' : '4'} titulo="Descargar y publicar">
        <p className="text-sm text-bruma">
          {cambios ? 'Hay cambios respecto a los datos publicados.' : 'Todavía no hay cambios respecto a los datos publicados.'} El archivo descargado contiene{' '}
          {UNIVERSOS.map((u) => `${u.corto}: ${formatNumber(exportado.universos[u.id]?.registros.length ?? 0)}`).join(' · ')} registros anonimizados y{' '}
          {formatNumber(exportado.destacados?.length ?? 0)} destacados revisados.
        </p>
        {erroresExport.length > 0 && <p className="mt-2 text-sm text-fucsia">No se puede descargar: {erroresExport[0]}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className={btnMain} disabled={!cambios || erroresExport.length > 0} onClick={() => downloadJson(exportado, 'dataset.json')}>
            Descargar dataset.json
          </button>
          <label className={`${btnSec} cursor-pointer`}>
            Cargar un dataset.json
            <input type="file" accept=".json,application/json" className="sr-only" onChange={cargarJson} />
          </label>
          {preview && (
            <button type="button" className={btnSec} onClick={() => { setPreview(null); setTrabajo(published); setLocales(new Map()); setAplicado(null); }}>
              Descartar vista previa
            </button>
          )}
        </div>
        <div className="mt-8 rounded-sm border border-rosa/20 p-5 text-sm text-bruma">
          <p className="eyebrow text-rosa">Para publicar</p>
          <p className="mt-2">
            Este sitio es estático: la vista previa solo existe en tu navegador. Para publicar, reemplaza <code className="text-marfil">src/data/dataset.json</code> en GitHub con el archivo descargado, mediante un Pull Request, o pídeselo a Claude Code. Al fusionarlo en <code className="text-marfil">main</code>, GitHub Pages se actualiza solo. Instrucciones paso a paso en GUIA_ACTUALIZACION.md.
          </p>
        </div>
      </Paso>
    </div>
  );
}

function Paso({ n, titulo, children }) {
  return (
    <section className="mt-14 border-t border-rosa/20 pt-8" aria-labelledby={`paso-${n}`}>
      <h2 id={`paso-${n}`} className="flex items-baseline gap-4">
        <span className="display num text-[length:var(--step-2)] text-fucsia">{n}</span>
        <span className="font-display text-[length:var(--step-2)] italic text-marfil">{titulo}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Resumen({ r }) {
  const s = r.resumen;
  const d = r.merge.diff;
  const items = [
    ['Filas leídas', s.filasLeidas],
    ['Registros válidos', s.validos],
    ['Fechas no reconocidas', s.invalidos],
    ['Duplicados en el archivo', s.duplicadosArchivo],
    ['Ya existentes (no se suman)', d.existentes],
    ['Nuevos', d.nuevos],
    ['Métricas actualizadas', d.metricasActualizadas],
    ['Sin país (se conservan)', s.sinPais],
    ['Con hora de publicación', s.conHora],
    ['Clave débil (sin ID ni URL)', s.clavesDebiles],
  ];
  return (
    <div>
      <p className="text-sm text-bruma">
        Fechas del archivo: {s.desde ? rangeLabel(s.desde, s.hasta) : '—'} · formato de fecha detectado: {s.ordenFechas === 'dmy' ? 'día/mes' : 'mes/día'}.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5">
        {items.map(([k, v]) => (
          <div key={k} className="border-l border-rosa/25 pl-3">
            <dt className="text-xs text-bruma">{k}</dt>
            <dd className="display num text-[length:var(--step-2)] text-marfil">{formatNumber(v)}</dd>
          </div>
        ))}
      </dl>
      {r.errores.length > 0 && (
        <details className="mt-6 text-sm text-bruma">
          <summary className="cursor-pointer text-marfil">Ver filas con fecha no reconocida ({formatNumber(r.errores.length)})</summary>
          <ul className="mt-2 space-y-1">
            {r.errores.slice(0, 20).map((e) => (
              <li key={e.fila}>
                Fila {e.fila}: {e.motivo}
              </li>
            ))}
          </ul>
        </details>
      )}
      {d.porDia.length > 0 && (
        <details className="mt-4 text-sm text-bruma" open={d.porDia.length <= 10}>
          <summary className="cursor-pointer text-marfil">Cambios por día ({formatNumber(d.porDia.length)} días)</summary>
          <table className="mt-3 w-full max-w-md text-left">
            <thead>
              <tr className="text-xs">
                <th className="py-1 font-normal">Día</th>
                <th className="py-1 font-normal">Antes</th>
                <th className="py-1 font-normal">Después</th>
              </tr>
            </thead>
            <tbody className="num">
              {d.porDia.slice(0, 62).map((x) => (
                <tr key={x.d} className="border-t border-rosa/10">
                  <td className="py-1">{longDate(x.d)}</td>
                  <td className="py-1">{formatNumber(x.antes)}</td>
                  <td className="py-1 text-marfil">{formatNumber(x.despues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
