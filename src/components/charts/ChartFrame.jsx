import { motion } from 'motion/react';
import Pending from './Pending.jsx';
import Legend from './Legend.jsx';
import { duration, ease } from '../../lib/motion.js';

/**
 * Marco editorial de cada gráfico: índice, titular que concluye, subtítulo con unidades y
 * periodo, leyenda, notas de limitación y fuente. Si `pendiente` está definido, muestra el
 * estado pendiente en lugar del gráfico (nunca ceros).
 */
export default function ChartFrame({ index, titulo, subtitulo, leyenda, notas = [], fuente, pendiente, acciones, children, className = '' }) {
  return (
    <motion.figure
      className={`relative min-w-0 border-t border-rosa/20 pt-6 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: duration.enter, ease: ease.out }}
    >
      <figcaption className="mb-5">
        <div className="flex items-baseline gap-3">
          {index && <span className="eyebrow num text-fucsia">{index}</span>}
          <h4 className="font-display text-[length:var(--step-1)] leading-tight text-marfil sm:text-[length:var(--step-2)]">{titulo}</h4>
        </div>
        {subtitulo && <p className="mt-2 max-w-2xl text-sm text-bruma">{subtitulo}</p>}
        {acciones && <div className="mt-4">{acciones}</div>}
        {leyenda?.length > 0 && !pendiente && <Legend items={leyenda} className="mt-4" />}
      </figcaption>

      {pendiente ? <Pending {...pendiente} /> : children}

      {(notas.filter(Boolean).length > 0 || fuente) && (
        <div className="mt-4 space-y-1 text-xs leading-relaxed text-bruma/90">
          {notas.filter(Boolean).map((n, i) => (
            <p key={i}>
              <span className="text-fucsia" aria-hidden="true">
                *{' '}
              </span>
              {n}
            </p>
          ))}
          {fuente && <p className="text-bruma/70">{fuente}</p>}
        </div>
      )}
    </motion.figure>
  );
}
