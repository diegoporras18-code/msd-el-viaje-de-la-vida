import { motion } from 'motion/react';
import LineReveal from '../components/LineReveal.jsx';
import StatFigure from '../components/StatFigure.jsx';
import BarrierRoute from '../components/BarrierRoute.jsx';
import { realidad } from '../content/realidad.js';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

// Ritmo editorial: alterna alineación y color de cada cifra.
const layout = [
  { tone: 'rosa', align: 'start' },
  { tone: 'fucsia', align: 'end' },
  { tone: 'marfil', align: 'start' },
];

export default function Realidad() {
  const { capitulo, titulo, entradilla, cuerpo, cifras, aviso, fuente, ruta } = realidad;

  return (
    <section id="realidad" aria-labelledby="realidad-titulo" className="relative scroll-mt-4">
      <div className="shell mx-auto max-w-[1440px] pt-24 sm:pt-32 lg:pt-44">
        <motion.div className="flex items-center gap-4" {...reveal()}>
          <span className="eyebrow text-rosa">{capitulo}</span>
          <span className="h-px flex-1 bg-rosa/25" aria-hidden="true" />
        </motion.div>

        <LineReveal
          id="realidad-titulo"
          className="display mt-8 text-[length:var(--step-4)] text-marfil sm:mt-12"
          lines={[
            { text: titulo.linea1 },
            { text: titulo.linea2, className: 'italic text-rosa' },
          ]}
        />

        <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          <motion.p
            className="font-display text-[length:var(--step-2)] leading-snug text-marfil lg:col-span-7 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[3.4em] first-letter:leading-[0.8] first-letter:text-fucsia"
            {...reveal(0.1)}
          >
            {entradilla}
          </motion.p>
          <div className="space-y-5 text-bruma lg:col-span-4 lg:col-start-9 lg:pt-2">
            {cuerpo.map((p, i) => (
              <motion.p key={i} className="max-w-[60ch]" {...reveal(0.2 + i * 0.1)}>
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="mt-20 overflow-hidden sm:mt-28" role="group" aria-label="Cifras estimadas del cáncer de mama en Colombia">
          {cifras.map((c, i) => (
            <StatFigure
              key={c.id}
              index={String(i + 1).padStart(2, '0')}
              value={c.valor}
              label={c.etiqueta}
              detail={c.detalle}
              {...layout[i % layout.length]}
            />
          ))}
        </div>

        <motion.aside
          className="grid gap-3 border-t border-rosa/25 pt-6 text-[length:var(--step--1)] text-bruma sm:grid-cols-[auto_1fr] sm:gap-x-4"
          {...reveal()}
        >
          <span className="display text-2xl leading-none text-fucsia" aria-hidden="true">
            *
          </span>
          <div className="max-w-3xl space-y-2">
            <p className="font-medium text-marfil">{aviso}</p>
            <p>
              <a
                href={fuente.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-rosa/50 underline-offset-4 transition-colors hover:text-marfil hover:decoration-rosa"
              >
                {fuente.texto}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </p>
          </div>
        </motion.aside>
      </div>

      <div className="mt-16 sm:mt-24">
        <BarrierRoute content={ruta} />
      </div>
    </section>
  );
}
