import CountUp from '../CountUp.jsx';
import { formatNumber } from '../../lib/format.js';

/**
 * Fila editorial de indicadores (sin tarjetas): número grande, etiqueta y contexto.
 * Un indicador sin valor muestra su estado pendiente, nunca un cero.
 */
export default function KpiRow({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
      {items.map((k) => (
        <div key={k.id} className="border-l border-rosa/25 pl-4">
          <dt className="eyebrow text-bruma">{k.etiqueta}</dt>
          <dd className="mt-2">
            {k.valor != null ? (
              <span className={`display num block whitespace-nowrap text-[length:var(--step-3)] ${k.tono ?? 'text-marfil'}`}>
                <CountUp value={k.valor} format={k.formato ?? formatNumber} />
              </span>
            ) : (
              <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-rosa/40 px-3 py-1 text-xs text-rosa">
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                {k.pendiente ?? 'Pendiente de medición'}
              </span>
            )}
            {k.detalle && <span className="mt-2 block text-xs leading-relaxed text-bruma">{k.detalle}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
