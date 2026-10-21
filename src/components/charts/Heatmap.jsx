import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { formatNumber } from '../../lib/format.js';
import { longDate, shortDate } from '../../lib/data/dates.js';

const HORAS = Array.from({ length: 24 }, (_, h) => h);
const color = (v, max) => (v ? `color-mix(in oklab, #E2457F ${Math.round(25 + 75 * (v / max))}%, #33182C)` : 'rgb(244 166 196 / 0.05)');

/**
 * Volumen por día y hora (hora de Bogotá). Tocar una celda muestra el detalle.
 * resaltar: { d, desde, hasta } — p. ej. la franja del concierto.
 */
export default function Heatmap({ filas, max, resaltar }) {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const top = filas.flatMap((f) => f.horas.map((v, h) => ({ d: f.d, h, v }))).sort((a, b) => b.v - a.v)[0];

  return (
    <div>
      {top && (
        <p className="sr-only">
          Franja con más registros: {longDate(top.d)} a las {top.h} horas, con {top.v} registros.
        </p>
      )}
      <p className="mb-3 min-h-[1.25rem] text-xs text-bruma" role="status">
        {sel
          ? `${longDate(sel.d)} · ${String(sel.h).padStart(2, '0')}:00–${String(sel.h).padStart(2, '0')}:59 · ${formatNumber(sel.v)} registros`
          : 'Toca una celda para ver el detalle.'}
      </p>
      <div ref={ref} className="grid grid-cols-[3.25rem_1fr] gap-x-2">
        <span />
        <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] text-[11px] text-bruma" aria-hidden="true">
          {HORAS.map((h) => (
            <span key={h} className="text-center">
              {h % 6 === 0 ? h : ''}
            </span>
          ))}
        </div>
        {filas.map((f, r) => (
          <div key={f.d} className="contents">
            <span className="num py-px text-right text-[12px] leading-[14px] text-bruma">{shortDate(f.d)}</span>
            <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px py-px">
              {f.horas.map((v, h) => {
                const hl = resaltar && resaltar.d === f.d && h >= resaltar.desde && h <= resaltar.hasta;
                return (
                  <motion.button
                    key={h}
                    type="button"
                    tabIndex={-1}
                    aria-label={`${longDate(f.d)}, ${h} horas: ${v} registros`}
                    onClick={() => setSel({ d: f.d, h, v })}
                    onMouseEnter={() => setSel({ d: f.d, h, v })}
                    className={`h-3.5 rounded-[2px] ${hl ? 'ring-1 ring-rosa' : ''}`}
                    style={{ background: color(v, max) }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: inView ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : Math.min(r * 0.03 + h * 0.008, 0.9) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 text-xs text-bruma">
        <span>0</span>
        <span className="h-2 w-32 rounded-full" style={{ background: 'linear-gradient(90deg, #4a2340, #E2457F)' }} aria-hidden="true" />
        <span className="num">{formatNumber(max)} registros por hora</span>
      </div>
    </div>
  );
}
