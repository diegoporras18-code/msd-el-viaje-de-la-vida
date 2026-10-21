import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ease } from '../lib/motion.js';

// Pseudoaleatorio determinista: la onda es igual en cada carga (sin saltos entre renders).
const rand = (i, seed) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function buildBars(count) {
  const center = (count - 1) / 2;
  const spread = count * 0.22;
  return Array.from({ length: count }, (_, i) => {
    const d = (i - center) / spread;
    // Crescendo central: envolvente gaussiana + textura irregular de audio.
    const envelope = 0.1 + 0.9 * Math.exp(-d * d);
    const texture = 0.72 + 0.28 * rand(i, 1);
    return {
      height: Math.min(1, envelope * texture),
      intensity: envelope,
      lo: 0.35 + 0.35 * rand(i, 2),
      dur: 1.6 + 1.8 * rand(i, 3),
      delay: -4 * rand(i, 4),
      enter: Math.abs(i - center) * 0.014,
    };
  });
}

/**
 * Onda musical de barras verticales con crescendo central y respiración continua.
 * Decorativa (aria-hidden); incluye un control para pausar el bucle (WCAG 2.2.2).
 */
export default function Waveform({ bars = 88, labels, className = '' }) {
  const data = useMemo(() => buildBars(bars), [bars]);
  const ref = useRef(null);
  const visible = useInView(ref, { margin: '0px' });
  const [paused, setPaused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        className="wave flex h-full w-full items-center justify-between gap-[2px] sm:gap-[3px]"
        data-paused={paused || !visible}
        aria-hidden="true"
      >
        {data.map((b, i) => (
          <motion.span
            key={i}
            className="flex h-full min-w-0 flex-1 items-center"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1.2, ease: ease.reveal, delay: 0.5 + b.enter }}
          >
            <span
              className="wave-bar block w-full rounded-full"
              style={{
                height: `${b.height * 100}%`,
                opacity: 0.3 + 0.7 * b.intensity,
                background: `linear-gradient(to bottom, var(--color-rosa), var(--color-fucsia) 50%, var(--color-rosa))`,
                '--lo': b.lo,
                '--dur': `${b.dur}s`,
                '--delay': `${b.delay}s`,
              }}
            />
          </motion.span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? labels.etiquetaReanudar : labels.etiquetaPausa}
        className="absolute -bottom-2 right-0 flex h-11 w-11 translate-y-full items-center justify-center rounded-full border border-rosa/30 text-rosa transition-colors hover:border-rosa hover:bg-rosa/10 motion-reduce:hidden"
      >
        {paused ? (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 1.5v11l9-5.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="2.5" y="1.5" width="3" height="11" rx="1" fill="currentColor" />
            <rect x="8.5" y="1.5" width="3" height="11" rx="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
