import { motion } from 'motion/react';
import LineReveal from '../components/LineReveal.jsx';
import Waveform from '../components/Waveform.jsx';
import ScrollCue from '../components/ScrollCue.jsx';
import { portada } from '../content/portada.js';
import { duration, ease } from '../lib/motion.js';

const fadeIn = (delay) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

export default function Portada() {
  const { eyebrow, titulo, creditos, evento, continuar, onda } = portada;

  return (
    <header className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Halo de luz detrás de la onda: profundidad sin recargar. */}
      <div
        className="pointer-events-none absolute left-1/2 top-[62%] -z-10 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(226 69 127 / 0.35), transparent 60%)' }}
        aria-hidden="true"
      />

      <motion.div
        className="shell flex items-start justify-between gap-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-bruma"
        {...fadeIn(0.1)}
      >
        <p className="eyebrow text-marfil">
          {creditos.map((c, i) => (
            <span key={c}>
              {i > 0 && (
                <>
                  <span className="mx-2 text-fucsia" aria-hidden="true">
                    ×
                  </span>
                  <span className="sr-only">y </span>
                </>
              )}
              {c}
            </span>
          ))}
        </p>
        <p className="eyebrow text-right">
          {evento.etiqueta} · {evento.ciudad}
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          <time dateTime={evento.fechaISO}>{evento.fecha}</time>
        </p>
      </motion.div>

      <div className="shell flex flex-1 flex-col justify-center pb-6 pt-14 sm:pt-20">
        <motion.p className="eyebrow mb-6 max-w-[22ch] text-rosa sm:mb-8 sm:max-w-none" {...fadeIn(0.25)}>
          {eyebrow}
        </motion.p>

        <LineReveal
          as="h1"
          trigger="mount"
          delay={0.35}
          className="display uppercase text-marfil text-[clamp(3rem,13.5vw,13rem)] tracking-[-0.03em]"
          lines={[
            { text: titulo.linea1 },
            { text: titulo.linea2, className: 'italic text-rosa sm:pl-[0.9em] lg:pl-[1.6em]' },
          ]}
        />

        <Waveform
          bars={onda.barras}
          labels={onda}
          className="mt-10 h-[clamp(7rem,22svh,15rem)] sm:mt-14"
        />
      </div>

      <div className="shell pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <ScrollCue href="#realidad" label={continuar} delay={1.6} />
      </div>
    </header>
  );
}
