import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import CountUp from '../CountUp.jsx';
import Pending from './Pending.jsx';
import { formatOne, formatPct } from '../../lib/format.js';
import { ease } from '../../lib/motion.js';

/**
 * Comparación antes / durante / después normalizada (promedio diario u otra tasa).
 * periodos: [{ id, nombre, rango, valor|null, detalle, pendiente: { estado, titulo } }]
 */
export default function PeriodBars({ periodos, formato = formatOne, unidad = 'registros por día', referencia = 'antes' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const max = Math.max(1, ...periodos.map((p) => p.valor ?? 0));
  const base = periodos.find((p) => p.id === referencia)?.valor;

  return (
    <div ref={ref} className="grid gap-8 sm:grid-cols-3 sm:gap-6">
      {periodos.map((p, i) => {
        const cambio = p.valor != null && base && p.id !== referencia ? ((p.valor - base) / base) * 100 : null;
        return (
          <div key={p.id} className="flex flex-col">
            <p className="eyebrow text-rosa">{p.nombre}</p>
            <p className="mt-1 text-xs text-bruma">{p.rango}</p>
            {p.valor != null ? (
              <>
                <div className="mt-4 flex h-40 items-end border-b border-rosa/25" aria-hidden="true">
                  <motion.div
                    className="w-full max-w-[7rem] rounded-t-sm"
                    style={{ background: p.id === 'durante' ? '#E2457F' : '#F4A6C4', originY: 1 }}
                    initial={{ height: 0 }}
                    animate={{ height: inView ? `${(p.valor / max) * 100}%` : 0 }}
                    transition={{ duration: reduce ? 0 : 1, ease: ease.out, delay: reduce ? 0 : i * 0.15 }}
                  />
                </div>
                <p className="display num mt-3 text-[length:var(--step-3)] text-marfil">
                  <CountUp value={p.valor} format={formato} />
                </p>
                <p className="text-xs text-bruma">{unidad}</p>
                {cambio != null && <p className="num mt-2 text-sm text-fucsia">{formatPct(cambio, true)} frente a «{periodos.find((x) => x.id === referencia).nombre.toLowerCase()}»</p>}
                {p.detalle && <p className="mt-2 text-xs text-bruma">{p.detalle}</p>}
              </>
            ) : (
              <div className="mt-4">
                <Pending compacto {...p.pendiente} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
