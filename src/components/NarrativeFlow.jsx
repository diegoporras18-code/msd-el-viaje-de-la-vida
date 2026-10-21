import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Trazos en onda: horizontal (escritorio) y vertical (móvil).
const H_PATH = (() => {
  let d = 'M 0 40';
  for (let x = 0; x <= 1200; x += 10) d += ` L ${x} ${(40 + Math.sin((x / 1200) * Math.PI * 10) * 10).toFixed(1)}`;
  return d;
})();
const V_PATH = (() => {
  let d = 'M 20 0';
  for (let y = 0; y <= 1200; y += 10) d += ` L ${(20 + Math.sin((y / 1200) * Math.PI * 10) * 8).toFixed(1)} ${y}`;
  return d;
})();

/**
 * Línea narrativa animada (Concierto → … → Acción). La onda se dibuja con el scroll
 * y cada etapa se enciende cuando la línea la alcanza.
 */
export default function NarrativeFlow({ pasos, etiqueta }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [alcance, setAlcance] = useState(reduce ? pasos.length : 0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 55%'] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(draw, 'change', (v) => !reduce && setAlcance(Math.floor(v * pasos.length + 0.35)));

  return (
    <div ref={ref} className="relative">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-20 w-full lg:block" aria-hidden="true">
        <path d={H_PATH} fill="none" stroke="#F4A6C4" strokeOpacity="0.12" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <motion.path d={H_PATH} fill="none" stroke="#E2457F" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ pathLength: reduce ? 1 : draw }} />
      </svg>
      <svg viewBox="0 0 40 1200" preserveAspectRatio="none" className="absolute bottom-0 left-0 top-0 h-full w-10 lg:hidden" aria-hidden="true">
        <path d={V_PATH} fill="none" stroke="#F4A6C4" strokeOpacity="0.12" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <motion.path d={V_PATH} fill="none" stroke="#E2457F" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ pathLength: reduce ? 1 : draw }} />
      </svg>

      <ol aria-label={etiqueta} className="relative grid gap-10 pl-14 lg:grid-cols-[repeat(var(--pasos),minmax(0,1fr))] lg:gap-6 lg:pl-0 lg:pt-24" style={{ '--pasos': pasos.length }}>
        {pasos.map((p, i) => {
          const on = i < alcance;
          return (
            <li key={p.id} className={`relative transition-opacity duration-700 motion-reduce:transition-none ${on ? 'opacity-100' : 'opacity-40'}`}>
              <span
                className={`absolute -left-[2.6rem] top-2 h-3.5 w-3.5 rounded-full border-2 transition-colors duration-500 lg:-top-[3.9rem] lg:left-0 ${on ? 'border-fucsia bg-fucsia' : 'border-rosa/50 bg-ciruela'}`}
                aria-hidden="true"
              />
              <span className="eyebrow num text-bruma">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 font-display text-[length:var(--step-2)] italic leading-none text-marfil">
                {p.nombre}
                {i < pasos.length - 1 && <span className="sr-only">, luego</span>}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-bruma">{p.texto}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
