import Pending from '../components/charts/Pending.jsx';
import { evidencias } from '../content/evidencias.js';
import { longDate } from '../lib/data/dates.js';
import { nombrePlataforma } from '../config/clasificacion.js';

const TIPO = { medio: 'Medio', publicacion: 'Publicación', creador: 'Creador' };

/** Evidencias públicas verificadas (noticias, publicaciones, creadores). */
export default function Highlights({ desde, hasta, tipos, marcas, vacio }) {
  const items = evidencias
    .filter((e) => e.verificado)
    .filter((e) => (!desde || e.fecha >= desde) && (!hasta || e.fecha <= hasta) && (!tipos || tipos.includes(e.tipo)) && (!marcas || marcas.some((m) => (e.marcas ?? []).includes(m))))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (!items.length) return <Pending compacto estado={vacio?.estado ?? 'medicion'} titulo={vacio?.titulo ?? 'Aún no hay evidencias públicas verificadas para este periodo.'} />;

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
            <p className="font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{d.titulo}</p>
            <p className="mt-2 text-sm text-bruma">
              {d.fuente && <span className="text-marfil">{d.fuente}</span>}
              {d.url && (
                <>
                  {d.fuente && ' · '}
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
