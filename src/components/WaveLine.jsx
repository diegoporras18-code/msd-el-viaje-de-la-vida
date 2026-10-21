import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Onda senoidal larga (dos periodos de ancho) para desplazarla sin cortes.
const WAVE = (() => {
  let d = 'M 0 30';
  for (let x = 0; x <= 2400; x += 20) d += ` L ${x} ${(30 + Math.sin(x / 60) * 14 * Math.sin(x / 700)).toFixed(1)}`;
  return d;
})();

/**
 * Onda musical decorativa. Solo se mueve con el scroll del usuario (no hay bucle automático).
 */
export default function WaveLine({ className = '', color = '#E2457F' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '-30%']);

  return (
    <div ref={ref} className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <motion.svg viewBox="0 0 2400 60" preserveAspectRatio="none" className="h-full w-[200%]" style={{ x }}>
        <motion.path
          d={WAVE}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity="0.55"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 2.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>
    </div>
  );
}
