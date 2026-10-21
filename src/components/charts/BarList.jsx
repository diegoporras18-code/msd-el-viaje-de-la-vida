import { useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { formatNumber, formatPct, share } from '../../lib/format.js';
import { ease } from '../../lib/motion.js';

/**
 * Barras horizontales con etiquetas visibles y detalle al tocar (tooltip accesible en iPhone).
 * items: [{ id, nombre, v, v2?, color? }] — v2 es un segundo segmento (p. ej. «sugerido»).
 */
export default function BarList({ items, total, etiquetas = { v: 'Registros', v2: 'Sugerido' }, color = '#F4A6C4', unidad = 'registros', mostrarPct = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const [activo, setActivo] = useState(null);
  const suma = total ?? items.reduce((a, it) => a + it.v + (it.v2 ?? 0), 0);
  const max = Math.max(1, ...items.map((it) => it.v + (it.v2 ?? 0)));

  return (
    <ul ref={ref} className="space-y-3.5">
      {items.map((it, i) => {
        const tot = it.v + (it.v2 ?? 0);
        const open = activo === it.id;
        const c = it.color ?? color;
        return (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => setActivo(open ? null : it.id)}
              onMouseEnter={() => setActivo(it.id)}
              onMouseLeave={() => setActivo(null)}
              aria-expanded={open}
              className="group block w-full text-left"
            >
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-marfil">{it.nombre}</span>
                <span className="num shrink-0 text-bruma">
                  <span className="text-marfil">{formatNumber(tot)}</span>
                  {mostrarPct && suma > 0 && <span className="ml-2">{formatPct(share(tot, suma))}</span>}
                </span>
              </span>
              <span className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-rosa/[0.07]" aria-hidden="true">
                <motion.span
                  className="h-full"
                  style={{ background: c }}
                  initial={{ width: 0 }}
                  animate={{ width: inView ? `${(it.v / max) * 100}%` : 0 }}
                  transition={{ duration: reduce ? 0 : 0.9, ease: ease.out, delay: reduce ? 0 : i * 0.05 }}
                />
                {it.v2 > 0 && (
                  <motion.span
                    className="h-full"
                    style={{ background: `repeating-linear-gradient(45deg, ${c}99 0 3px, ${c}40 3px 6px)` }}
                    initial={{ width: 0 }}
                    animate={{ width: inView ? `${(it.v2 / max) * 100}%` : 0 }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: ease.out, delay: reduce ? 0 : 0.2 + i * 0.05 }}
                  />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.p
                  role="tooltip"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-xs text-bruma"
                >
                  <span className="block pt-1.5">
                    {it.nombre}: {formatNumber(tot)} {unidad}
                    {suma > 0 && ` (${formatPct(share(tot, suma))} del total)`}
                    {it.v2 != null && ` · ${etiquetas.v}: ${formatNumber(it.v)} · ${etiquetas.v2}: ${formatNumber(it.v2)}`}
                    {it.agrupa?.length > 0 && ` · Agrupa: ${it.agrupa.join(', ')}`}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
