import { motion } from 'motion/react';
import LineReveal from './LineReveal.jsx';
import WaveLine from './WaveLine.jsx';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

/** Apertura de capítulo a pantalla completa, con la misma gramática que «Una realidad…». */
export default function ChapterOpener({ capitulo, titulo, entradilla, estado, tituloId, compacto = false }) {
  return (
    <header className={`relative flex flex-col justify-center ${compacto ? 'pb-2 pt-16 sm:pt-20' : 'min-h-[100svh] py-24'}`}>
      <div className="shell mx-auto w-full max-w-[1440px]">
        <motion.div className="flex items-center gap-4" {...reveal()}>
          <span className="eyebrow text-rosa">{capitulo}</span>
          <span className="h-px flex-1 bg-rosa/25" aria-hidden="true" />
        </motion.div>
        <LineReveal
          id={tituloId}
          className={`display max-w-[18ch] text-[length:var(--step-4)] text-marfil ${compacto ? 'mt-5 sm:mt-8' : 'mt-8 sm:mt-12'}`}
          lines={[{ text: titulo.linea1 }, ...(titulo.linea2 ? [{ text: titulo.linea2, className: 'italic text-rosa' }] : [])]}
        />
        {entradilla && (
          <motion.p className={`max-w-2xl font-display leading-snug text-marfil/90 ${compacto ? 'mt-5 text-[length:var(--step-1)]' : 'mt-10 text-[length:var(--step-2)]'}`} {...reveal(0.2)}>
            {entradilla}
          </motion.p>
        )}
        {estado && (
          <motion.p className="mt-8 inline-flex items-center gap-3 rounded-full border border-fucsia/50 px-4 py-2 text-sm text-marfil" {...reveal(0.35)}>
            <span className="h-2 w-2 rounded-full bg-fucsia" aria-hidden="true" />
            {estado}
          </motion.p>
        )}
      </div>
      {!compacto && <WaveLine className="absolute inset-x-0 bottom-10 h-16" />}
    </header>
  );
}
