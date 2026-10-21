import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { formatNumber } from '../lib/format.js';

/**
 * Número que cuenta hasta su valor al entrar en pantalla.
 * El valor final está siempre en el DOM para lectores de pantalla; el conteo es solo visual.
 */
export default function CountUp({ value, duration = 2.2, className = '', format = formatNumber }) {
  const ref = useRef(null);
  const last = useRef(0);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const final = format(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduce) return;
    const controls = animate(last.current, value, {
      duration: last.current ? 0.8 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
      onComplete: () => {
        last.current = value;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration, format]);

  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      {/* Con movimiento reducido se muestra directamente la cifra final. */}
      <span ref={ref} aria-hidden="true">
        {reduce ? final : format(last.current)}
      </span>
    </span>
  );
}
