import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import NarrativeFlow from '../components/NarrativeFlow.jsx';
import { campana } from '../content/campana.js';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

export default function Campana() {
  const { capitulo, titulo, entradilla, estado, aviso, componentes, flujo, cita, medicion } = campana;
  return (
    <section id="campana" aria-labelledby="campana-titulo" className="relative">
      <ChapterOpener capitulo={capitulo} titulo={titulo} entradilla={entradilla} estado={estado} tituloId="campana-titulo" />

      <div className="shell mx-auto max-w-[1440px] pb-24">
        <motion.p className="max-w-2xl border-l-2 border-fucsia pl-5 text-sm text-bruma" {...reveal()}>
          {aviso}
        </motion.p>

        <ol className="mt-20 divide-y divide-rosa/10 border-y border-rosa/10">
          {componentes.map((c, i) => (
            <motion.li key={c.id} className="grid gap-4 py-10 lg:grid-cols-12 lg:items-baseline lg:gap-8" {...reveal(0.05 * i)}>
              <span className="display num text-[length:var(--step-2)] text-fucsia lg:col-span-1">{String(i + 1).padStart(2, '0')}</span>
              <h3 className={`font-display text-[length:var(--step-3)] italic leading-[1.02] lg:col-span-6 ${c.id === 'objetivo' ? 'text-rosa' : 'text-marfil'}`}>{c.titulo}</h3>
              <p className="max-w-md text-bruma lg:col-span-5">{c.texto}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-32">
          <motion.h3 className="display max-w-3xl text-[length:var(--step-3)] text-marfil" {...reveal()}>
            {flujo.titulo}
          </motion.h3>
          <div className="mt-16">
            <NarrativeFlow pasos={flujo.pasos} etiqueta={flujo.etiqueta} />
          </div>
        </div>

        <motion.blockquote className="mx-auto mt-36 max-w-4xl text-center" {...reveal()}>
          <p className="display text-[length:var(--step-3)] italic leading-tight text-rosa">«{cita}»</p>
        </motion.blockquote>

        <motion.div className="mt-28 grid gap-6 border-t border-rosa/20 pt-8 lg:grid-cols-12" {...reveal()}>
          <h3 className="eyebrow text-rosa lg:col-span-4">{medicion.titulo}</h3>
          <p className="max-w-2xl text-bruma lg:col-span-8">{medicion.texto}</p>
        </motion.div>
      </div>
    </section>
  );
}
