import { motion } from 'motion/react';
import LineReveal from '../components/LineReveal.jsx';
import NarrativeFlow from '../components/NarrativeFlow.jsx';
import { campana } from '../content/campana.js';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

/** Capítulo 02: una escena. La onda que llega del capítulo 01 se convierte en la secuencia de la campaña. */
export default function Campana() {
  const { capitulo, titulo, texto, estado, flujo, nota } = campana;
  return (
    <section id="campana" aria-labelledby="campana-titulo" className="relative scroll-mt-16">
      <div className="shell mx-auto max-w-[1440px] pb-20 pt-16 sm:pb-28 sm:pt-24">
        <motion.div className="flex items-center gap-4" {...reveal()}>
          <span className="eyebrow text-rosa">{capitulo}</span>
          <span className="h-px flex-1 bg-rosa/25" aria-hidden="true" />
        </motion.div>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <LineReveal
            id="campana-titulo"
            className="display text-[length:var(--step-4)] text-marfil lg:col-span-7"
            lines={[{ text: titulo.linea1 }, { text: titulo.linea2, className: 'italic text-rosa' }]}
          />
          <div className="lg:col-span-5">
            <motion.p className="font-display text-[length:var(--step-1)] leading-snug text-marfil/90" {...reveal(0.15)}>
              {texto}
            </motion.p>
            <motion.p className="mt-6 inline-flex items-center gap-3 rounded-full border border-fucsia/50 px-4 py-2 text-sm text-marfil" {...reveal(0.3)}>
              <span className="h-2 w-2 rounded-full bg-fucsia" aria-hidden="true" />
              {estado}
            </motion.p>
          </div>
        </div>
        <div className="mt-16 sm:mt-24">
          <NarrativeFlow pasos={flujo.pasos} etiqueta={flujo.etiqueta} />
        </div>
        <motion.p className="mt-14 max-w-2xl border-l-2 border-fucsia pl-5 text-sm text-bruma" {...reveal()}>
          {nota}
        </motion.p>
      </div>
    </section>
  );
}
