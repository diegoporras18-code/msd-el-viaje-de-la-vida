import { motion } from 'motion/react';
import LineReveal from './LineReveal.jsx';
import { duration, ease } from '../lib/motion.js';

/**
 * Escena ejecutiva: un hallazgo (titular) + una visualización + una conclusión breve.
 */
export default function Scene({ index, kicker, titulo, lead, conclusion, children, cta }) {
  return (
    <article className="border-t border-rosa/15 py-16 sm:py-24">
      <p className="eyebrow flex items-center gap-3 text-rosa">
        {index && <span className="num text-fucsia">{index}</span>}
        {kicker}
      </p>
      <LineReveal
        as="h3"
        className="display mt-5 max-w-[20ch] text-[length:var(--step-3)] text-marfil"
        lines={[{ text: titulo.linea1 }, ...(titulo.linea2 ? [{ text: titulo.linea2, className: 'italic text-rosa' }] : [])]}
      />
      {lead && (
        <motion.p
          className="mt-6 max-w-2xl text-bruma sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: duration.enter, ease: ease.out, delay: 0.15 }}
        >
          {lead}
        </motion.p>
      )}
      <div className="mt-10 sm:mt-14">{children}</div>
      {conclusion && (
        <motion.p
          className="mt-10 max-w-3xl border-l-2 border-fucsia pl-5 font-display text-[length:var(--step-1)] italic leading-snug text-marfil sm:mt-14 sm:text-[length:var(--step-2)]"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: duration.reveal, ease: ease.reveal }}
        >
          {conclusion}
        </motion.p>
      )}
      {cta && <div className="mt-8">{cta}</div>}
    </article>
  );
}

export function ExploreLink({ tab, children = 'Explorar resultados' }) {
  return (
    <a href={`#/explorar${tab ? `/${tab}` : ''}`} className="group inline-flex min-h-[44px] items-center gap-3 text-sm text-rosa">
      <span className="h-px w-8 bg-rosa transition-all group-hover:w-12" aria-hidden="true" />
      {children}
    </a>
  );
}
