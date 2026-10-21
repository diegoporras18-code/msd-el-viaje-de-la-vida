import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { formatNumber } from '../lib/format.js';

/**
 * Número que cuenta hasta su valor al entrar en pantalla.
 * El valor final está siempre en el DOM para lectores de pantalla; el conteo es solo visual.
 */
export default function CountUp({ value, duration = 2.2, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const final = formatNumber(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = formatNumber(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      {/* Con movimiento reducido se muestra directamente la cifra final. */}
      <span ref={ref} aria-hidden="true">
        {reduce ? final : formatNumber(0)}
      </span>
    </span>
  );
}
