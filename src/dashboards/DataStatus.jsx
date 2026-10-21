import { useData } from '../state/DataContext.jsx';
import { UNIVERSOS } from '../config/universos.js';
import { baseCheck } from '../lib/data/aggregate.js';
import { rangeLabel } from '../lib/data/dates.js';
import { formatNumber } from '../lib/format.js';

/** Cobertura, importaciones y validaciones de cada universo de monitoreo. */
export default function DataStatus() {
  const { dataset, esVistaPrevia, setPreview } = useData();
  return (
    <div className="space-y-12">
      {esVistaPrevia && (
        <div className="flex flex-wrap items-center gap-4 border-l-2 border-fucsia pl-4 text-sm text-marfil">
          Vista previa local activa: solo este navegador la ve.
          <button type="button" onClick={() => setPreview(null)} className="min-h-[44px] text-rosa underline underline-offset-4">
            Volver a los datos publicados
          </button>
        </div>
      )}
      <ul className="divide-y divide-rosa/10 border-y border-rosa/10">
        {UNIVERSOS.map((info) => {
          const u = dataset.universos[info.id];
          const chk = baseCheck(u);
          return (
            <li key={info.id} className="grid gap-4 py-8 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <p className="font-display text-[length:var(--step-2)] italic text-marfil">
                  <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: info.color }} aria-hidden="true" />
                  {info.nombre}
                </p>
                <p className="mt-2 text-sm text-bruma">{info.descripcion}</p>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-3 lg:col-span-8">
                <div>
                  <dt className="eyebrow text-bruma">Registros importados</dt>
                  <dd className="display num mt-1 text-[length:var(--step-2)] text-marfil">{u?.registros.length ? formatNumber(u.registros.length) : '—'}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-bruma">Cobertura</dt>
                  <dd className="mt-1 text-marfil">{u?.cobertura.length ? u.cobertura.map((c) => rangeLabel(c.desde, c.hasta)).join(' · ') : 'Sin exportaciones importadas'}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-bruma">Línea base</dt>
                  <dd className="mt-1 text-marfil">{u?.base ? `${formatNumber(u.base.exportacion.total)} registros agregados (${rangeLabel(u.base.exportacion.desde, u.base.exportacion.hasta)})` : '—'}</dd>
                </div>
                {chk && (
                  <div className="sm:col-span-3">
                    <dt className="eyebrow text-bruma">Contraste con la línea base</dt>
                    <dd className={`mt-1 ${chk.coincide ? 'text-rosa' : 'text-fucsia'}`}>
                      {chk.coincide
                        ? `Coincide en los ${chk.dias} días comparables (${formatNumber(chk.totalImportado)} registros).`
                        : `Diferencias en ${chk.diferencias.length} de ${chk.dias} días: ${formatNumber(chk.totalImportado)} importados frente a ${formatNumber(chk.totalBase)} de la base.`}
                    </dd>
                  </div>
                )}
                {u?.importaciones.length > 0 && (
                  <div className="sm:col-span-3">
                    <dt className="eyebrow text-bruma">Importaciones</dt>
                    <dd>
                      <ul className="mt-1 space-y-1 text-bruma">
                        {u.importaciones.map((im) => (
                          <li key={im.fecha + im.archivo}>
                            {new Date(im.fecha).toLocaleDateString('es-CO')} · {im.archivo} · {rangeLabel(im.desde, im.hasta)} · {formatNumber(im.nuevos)} nuevos, {formatNumber(im.existentes)} ya existentes
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-bruma">
        Destacados revisados publicados: <span className="text-marfil">{formatNumber(dataset.destacados?.length ?? 0)}</span>. Para actualizar los datos, usa{' '}
        <a href="#/importar" className="text-rosa underline underline-offset-4">
          Actualizar datos
        </a>{' '}
        y sigue GUIA_ACTUALIZACION.md.
      </p>
    </div>
  );
}
