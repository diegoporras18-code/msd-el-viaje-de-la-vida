import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import ConversationDashboard from '../dashboards/ConversationDashboard.jsx';
import { conversacion } from '../content/conversacion.js';
import { duration, ease } from '../lib/motion.js';

export default function Conversacion() {
  const { capitulo, titulo, entradilla, alcance } = conversacion;
  return (
    <section id="conversacion" aria-labelledby="conversacion-titulo" className="relative">
      <ChapterOpener capitulo={capitulo} titulo={titulo} entradilla={entradilla} tituloId="conversacion-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-28">
        <motion.aside
          className="mb-20 grid gap-8 lg:grid-cols-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: duration.enter, ease: ease.out }}
        >
          <h3 className="font-display text-[length:var(--step-2)] italic leading-tight text-marfil lg:col-span-4">{alcance.titulo}</h3>
          <ul className="grid gap-5 text-sm text-bruma sm:grid-cols-2 lg:col-span-8">
            {alcance.puntos.map((p) => (
              <li key={p} className="border-l border-rosa/25 pl-4">
                {p}
              </li>
            ))}
          </ul>
        </motion.aside>
        <ConversationDashboard />
      </div>
    </section>
  );
}
