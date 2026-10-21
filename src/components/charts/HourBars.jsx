import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { formatNumber } from '../../lib/format.js';
import { ease } from '../../lib/motion.js';

/** 24 barras horarias (hora de Bogotá) con franja resaltada y detalle al tocar. */
export default function HourBars({ horas, resaltar, descripcion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(null);
  const max = Math.max(1, ...horas);

  return (
    <div ref={ref}>
      <p className="mb-3 min-h-[1.25rem] text-xs text-bruma" role="status">
        {sel != null ? `${String(sel).padStart(2, '0')}:00–${String(sel).padStart(2, '0')}:59 · ${formatNumber(horas[sel])} registros` : 'Toca una barra para ver el detalle.'}
      </p>
      <div className="flex h-44 items-end gap-[2px] border-b border-rosa/25" role="img" aria-label={descripcion}>
        {horas.map((v, h) => {
          const hl = resaltar && h >= resaltar.desde && h <= resaltar.hasta;
          return (
            <button
              key={h}
              type="button"
              tabIndex={-1}
              aria-label={`${h} horas: ${v} registros`}
              onClick={() => setSel(h)}
              onMouseEnter={() => setSel(h)}
              className="flex h-full flex-1 items-end"
            >
              <motion.span
                className="block w-full rounded-t-sm"
                style={{ background: hl ? '#E2457F' : '#F4A6C4', opacity: sel == null || sel === h ? 1 : 0.4 }}
                initial={{ height: 0 }}
                animate={{ height: inView ? `${(v / max) * 100}%` : 0 }}
                transition={{ duration: reduce ? 0 : 0.7, ease: ease.out, delay: reduce ? 0 : h * 0.02 }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex text-[12px] text-bruma" aria-hidden="true">
        {horas.map((_, h) => (
          <span key={h} className="flex-1 text-center">
            {h % 3 === 0 ? h : ''}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {horas.map((v, h) => (
          <li key={h}>
            {h} horas: {v} registros
          </li>
        ))}
      </ul>
    </div>
  );
}
