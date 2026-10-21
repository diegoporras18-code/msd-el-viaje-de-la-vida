import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { formatNumber, formatPct, share } from '../../lib/format.js';
import { ease } from '../../lib/motion.js';

/**
 * Barras apiladas al 100 % por fila (marcas × plataformas, sentimiento por marca…).
 * Tocar un segmento muestra su detalle debajo de la fila.
 */
export default function StackBars({ filas }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const [activo, setActivo] = useState(null);

  return (
    <div ref={ref} className="space-y-5">
      {filas.map((f) => {
        const total = f.segmentos.reduce((a, s) => a + s.v, 0);
        const sel = activo?.fila === f.id ? f.segmentos.find((s) => s.id === activo.seg) : null;
        return (
          <div key={f.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-marfil">{f.nombre}</span>
              <span className="num text-bruma">{total ? `${formatNumber(total)} registros` : 'Sin datos'}</span>
            </div>
            <div className="flex h-7 w-full overflow-hidden rounded-[3px] bg-rosa/[0.06]">
              {f.segmentos.map((s, i) => {
                const pct = share(s.v, total);
                if (!pct) return null;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    aria-label={`${f.nombre}, ${s.nombre}: ${formatNumber(s.v)} (${formatPct(pct)})`}
                    onClick={() => setActivo(sel?.id === s.id ? null : { fila: f.id, seg: s.id })}
                    onMouseEnter={() => setActivo({ fila: f.id, seg: s.id })}
                    onMouseLeave={() => setActivo(null)}
                    className="relative h-full min-w-[2px] overflow-hidden border-r border-ciruela/70 text-left last:border-r-0 focus-visible:outline-offset-[-2px]"
                    style={{ background: s.color }}
                    initial={{ width: 0 }}
                    animate={{ width: inView ? `${pct}%` : 0 }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: ease.out, delay: reduce ? 0 : i * 0.06 }}
                  >
                    {pct >= 12 && <span className="num absolute inset-0 flex items-center px-2 text-[12px] font-semibold text-ciruela">{formatPct(pct)}</span>}
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-1.5 min-h-[1.25rem] text-xs text-bruma" role="status">
              {sel ? `${sel.nombre}: ${formatNumber(sel.v)} registros · ${formatPct(share(sel.v, total))}` : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}
