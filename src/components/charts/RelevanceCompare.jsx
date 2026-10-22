import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import CountUp from '../CountUp.jsx';
import { formatNumber, formatPct, share } from '../../lib/format.js';
import { ease } from '../../lib/motion.js';

/**
 * Comparación animada: todo lo que capta la consulta frente a lo que habla realmente de
 * cáncer de mama. Las barras son proporcionales al universo captado; el porcentaje principal
 * se calcula sobre las menciones clasificadas por contenido, y ambos denominadores se muestran.
 */
export default function RelevanceCompare({ captadas, clasificadas, relevantes, rango }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const filas = [
    { id: 'captadas', etiqueta: 'Menciones captadas por la consulta', v: captadas, color: 'rgba(244,166,196,0.28)', tono: 'text-marfil' },
    { id: 'relevantes', etiqueta: 'Hablan realmente de cáncer de mama', v: relevantes, color: '#E2457F', tono: 'text-fucsia' },
  ];

  return (
    <div ref={ref} className="space-y-6">
      {filas.map((f, i) => (
        <div key={f.id}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-bruma">{f.etiqueta}</span>
            <CountUp value={f.v} className={`display num text-[length:var(--step-3)] leading-none ${f.tono}`} />
          </div>
          <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-rosa/[0.06]" aria-hidden="true">
            <motion.div
              className="h-full rounded-full"
              style={{ background: f.color }}
              initial={{ width: 0 }}
              animate={{ width: inView ? `${share(f.v, captadas)}%` : 0 }}
              transition={{ duration: reduce ? 0 : 1.4, ease: ease.reveal, delay: reduce ? 0 : 0.2 + i * 0.6 }}
            />
          </div>
        </div>
      ))}
      <p className="text-sm text-bruma">
        <span className="text-marfil">{formatPct(share(relevantes, clasificadas))}</span> de las {formatNumber(clasificadas)} menciones clasificadas por contenido
        {captadas > clasificadas ? ` (${formatNumber(captadas - clasificadas)} aún sin clasificar)` : ''} · {rango}.
      </p>
    </div>
  );
}
