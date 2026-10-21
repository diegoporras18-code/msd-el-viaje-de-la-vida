import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Pending from '../components/charts/Pending.jsx';
import { conclusiones } from '../content/conclusiones.js';
import { realidad } from '../content/realidad.js';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

const Badge = ({ children }) => (
  <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-rosa/40 px-3 py-1.5 text-rosa">
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {children}
  </span>
);

export default function Conclusiones() {
  const { capitulo, titulo, entradilla, preliminares, postConcierto, benchmark, recomendaciones, oportunidades } = conclusiones;
  return (
    <section id="conclusiones" aria-labelledby="conclusiones-titulo" className="relative">
      <ChapterOpener capitulo={capitulo} titulo={titulo} entradilla={entradilla} tituloId="conclusiones-titulo" />

      <div className="shell mx-auto max-w-[1440px] pb-24">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="display text-[length:var(--step-3)] text-marfil">{preliminares.titulo}</h3>
          <Badge>{preliminares.etiqueta}</Badge>
        </div>

        <ol className="mt-12">
          {preliminares.items.map((c, i) => (
            <motion.li key={c.id} className="grid gap-4 border-t border-rosa/15 py-10 lg:grid-cols-12 lg:gap-8" {...reveal(0.04 * i)}>
              <div className="lg:col-span-4">
                {c.cifra ? (
                  <>
                    <p className="display num text-[length:var(--step-4)] leading-none text-rosa">{c.cifra}</p>
                    <p className="mt-2 text-sm text-bruma">{c.unidad}</p>
                  </>
                ) : (
                  <p className="display num text-[length:var(--step-4)] leading-none text-rosa/40" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                )}
              </div>
              <div className="lg:col-span-8">
                <h4 className="font-display text-[length:var(--step-2)] italic leading-tight text-marfil">{c.titulo}</h4>
                <p className="mt-3 max-w-2xl text-bruma">{c.texto}</p>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-24 grid gap-16 lg:grid-cols-2">
          <motion.div {...reveal()}>
            <h3 className="display text-[length:var(--step-3)] text-marfil">{postConcierto.titulo}</h3>
            <div className="mt-8">
              <Pending estado={postConcierto.estado} titulo="Estas conclusiones se escribirán con los datos del 24 al 31 de octubre." />
            </div>
            <ul className="mt-8 space-y-3 text-bruma">
              {postConcierto.preguntas.map((q) => (
                <li key={q} className="flex gap-3">
                  <span className="text-fucsia" aria-hidden="true">
                    —
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div className="space-y-16" {...reveal(0.1)}>
            <div>
              <h3 className="display text-[length:var(--step-3)] text-marfil">{benchmark.titulo}</h3>
              <div className="mt-8">
                <Pending estado={benchmark.estado} titulo={benchmark.texto} />
              </div>
            </div>
            <div>
              <h3 className="display text-[length:var(--step-3)] text-marfil">{oportunidades.titulo}</h3>
              <div className="mt-8">
                <Pending estado={oportunidades.estado} titulo={oportunidades.texto} />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="mt-28 border-t border-rosa/20 pt-10" {...reveal()}>
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="display text-[length:var(--step-3)] text-marfil">{recomendaciones.titulo}</h3>
            <Badge>{recomendaciones.etiqueta}</Badge>
          </div>
          <ol className="mt-10 grid gap-8 lg:grid-cols-2">
            {recomendaciones.items.map((r, i) => (
              <li key={r} className="flex gap-5">
                <span className="display num text-[length:var(--step-2)] text-fucsia">{String(i + 1).padStart(2, '0')}</span>
                <p className="pt-1 text-marfil/90">{r}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>

      <footer className="shell mx-auto max-w-[1440px] border-t border-rosa/15 py-12 text-xs leading-relaxed text-bruma">
        <p>El Viaje de la Vida · MSD × Lotengo · Concierto de Fonseca, Bogotá, 24 de octubre de 2026.</p>
        <p className="mt-2">Social listening: SentiOne, sin filtro geográfico. {realidad.fuente.texto}</p>
      </footer>
    </section>
  );
}
