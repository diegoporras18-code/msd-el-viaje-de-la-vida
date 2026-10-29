import { motion } from 'motion/react';
import { formatNumber } from '../lib/format.js';
import { duration, ease } from '../lib/motion.js';

/**
 * Tarjetas de patrones de conversación por sentimiento (máximo tres): síntesis anónimas en
 * tercera persona, nunca testimonios ni citas. Cada una solo se muestra
 * si su patrón alcanza el umbral de privacidad; los patrones suprimidos se omiten.
 * En móvil se desplazan en horizontal para no alargar la escena.
 */
export default function ExampleCards({ tarjetas, patrones, umbral }) {
  const visibles = tarjetas.filter(t => patrones?.[t.patron] != null && patrones[t.patron] >= umbral).slice(0, 3);
  if (!visibles.length) return null;
  return (
    <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
      {visibles.map((t, i) => {
        const n = patrones?.[t.patron];
        return (
          <motion.li
            key={t.patron}
            className="relative flex w-[82%] shrink-0 snap-start flex-col rounded-sm border border-rosa/15 bg-ciruela-800/60 p-5 md:w-auto"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: duration.enter, ease: ease.out, delay: 0.08 * i }}
          >
            <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-sm" style={{ background: t.color }} aria-hidden="true" />
            <p className="eyebrow flex items-center justify-between gap-3" style={{ color: t.color }}>
              {t.sentimiento}
              {n != null && <span className="num normal-case tracking-normal text-bruma">{formatNumber(n)} menciones</span>}
            </p>
            <p className="mt-4 font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{t.sintesis}</p>
            <p className="mt-4 text-sm text-bruma">{t.revela}</p>
            <p className="mt-auto pt-4 text-xs text-rosa">{t.tema}</p>
          </motion.li>
        );
      })}
    </ul>
  );
}
