import Pending from '../components/charts/Pending.jsx';
import { useData } from '../state/DataContext.jsx';
import { evidencias } from '../content/evidencias.js';
import { longDate } from '../lib/data/dates.js';
import { nombrePlataforma } from '../config/clasificacion.js';

const TIPO = { medio: 'Medio', publicacion: 'Publicación', creador: 'Creador' };

/**
 * Contenidos individuales revisados: destacados del importador + evidencias verificadas.
 * Nunca muestra registros sin revisión ni datos personales de particulares.
 */
export default function Highlights({ universo, universos, desde, hasta, tipos, vacio }) {
  const { dataset } = useData();
  const items = [
    ...(dataset.destacados ?? []).filter((d) => d.revisado),
    ...evidencias.filter((e) => e.verificado).map((e) => ({ ...e, universo: e.universo ?? 'categoria', extracto: e.titulo })),
  ]
    .filter((d) => (!universo || d.universo === universo || (d.marcas ?? []).includes(universo)) && (!universos || universos.some((x) => d.universo === x || (d.marcas ?? []).includes(x))) && (!desde || d.fecha >= desde) && (!hasta || d.fecha <= hasta) && (!tipos || tipos.includes(d.tipo)))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (!items.length)
    return (
      <Pending
        estado={vacio?.estado ?? 'revision'}
        titulo={vacio?.titulo ?? 'Aún no hay contenidos revisados para publicar en este rango.'}
        detalle={vacio?.detalle ?? 'Se agregan desde el importador (revisión manual) o en src/content/evidencias.js. Los autores particulares no se publican.'}
      />
    );

  return (
    <ul className="divide-y divide-rosa/10">
      {items.map((d) => (
        <li key={d.id} className="grid gap-2 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <p className="text-xs text-bruma">
            <span className="eyebrow block text-rosa">{TIPO[d.tipo] ?? 'Contenido'}</span>
            {longDate(d.fecha)}
            <span className="block">{nombrePlataforma(d.plataforma)}</span>
          </p>
          <div>
            <p className="font-display text-[length:var(--step-1)] italic leading-snug text-marfil">«{d.extracto}»</p>
            <p className="mt-2 text-sm text-bruma">
              {d.fuente || d.autorPublico ? <span className="text-marfil">{d.fuente ?? d.autorPublico}</span> : 'Cuenta particular (anonimizada)'}
              {d.url && (
                <>
                  {' · '}
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-rosa underline underline-offset-4">
                    Ver contenido<span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
