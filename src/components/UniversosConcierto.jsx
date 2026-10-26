import { useResultados } from '../state/DataContext.jsx';
import { formatNumber } from '../lib/format.js';

/** Indicador ejecutivo consolidado; la procedencia permanece en los datos agregados. */
export default function UniversosConcierto() {
  const res = useResultados();
  const total = res.campana?.referenciasAportadas?.total;
  return <div data-referencias-combinadas className="border-l-2 border-fucsia py-2 pl-5">
    <p className="eyebrow text-rosa">Conversación identificada</p>
    <p className="display num mt-3 text-[length:var(--step-4)] leading-none text-rosa">{total == null ? 'Pendiente' : formatNumber(total)}</p>
    <h4 className="mt-3 max-w-2xl font-display text-2xl text-marfil">Referencias identificadas alrededor de El Viaje de la Vida.</h4>
  </div>;
}
