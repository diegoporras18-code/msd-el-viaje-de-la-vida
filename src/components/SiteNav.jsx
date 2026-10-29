import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import SelectorEscucha from './SelectorEscucha.jsx';
import { capitulos, navegacion } from '../content/navegacion.js';
import { useActiveSection } from '../lib/hooks.js';
import { ease } from '../lib/motion.js';

const IDS = capitulos.map((c) => c.id);
const ir = (id) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

const Icono = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Barra discreta: modos, índice de capítulos, capítulo anterior/siguiente y progreso. */
export default function SiteNav({ route }) {
  const presentacion = route === 'presentacion';
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(!presentacion);
  const active = useActiveSection(IDS, presentacion);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const firstLink = useRef(null);

  useEffect(() => {
    if (!presentacion) return setVisible(true);
    const on = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [presentacion]);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const idx = Math.max(0, IDS.indexOf(active));
  const actual = capitulos[idx];
  const prev = capitulos[idx - 1];
  const next = capitulos[idx + 1];
  const boton = 'inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-full border border-rosa/40 px-3 text-sm text-marfil hover:border-rosa disabled:opacity-30';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-rosa/10 bg-ciruela/80 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-all duration-500 focus-within:translate-y-0 focus-within:opacity-100 ${
          visible || open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <nav aria-label="Principal" className="shell flex h-[3.75rem] items-center justify-between gap-3">
          <a href="#inicio" className="truncate font-display text-lg italic text-marfil">
            {navegacion.marca}
          </a>
          {presentacion && actual && (
            <p className="hidden truncate text-sm text-bruma lg:block" aria-live="polite">
              <span className="num mr-2 text-fucsia">{actual.numero}</span>
              {actual.nombre}
            </p>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden xl:block"><SelectorEscucha /></div>
            <div className="hidden rounded-full border border-rosa/25 p-1 md:flex">
              {[
                ['#inicio', navegacion.modos.presentacion, presentacion],
                ['#/explorar', navegacion.modos.explorar, !presentacion],
              ].map(([href, t, on]) => (
                <a key={href} href={href} aria-current={on ? 'page' : undefined} className={`rounded-full px-3 py-1.5 text-sm ${on ? 'bg-rosa text-ciruela' : 'text-marfil'}`}>
                  {t}
                </a>
              ))}
            </div>
            {presentacion && (
              <>
                <button type="button" className={boton} onClick={() => prev && ir(prev.id)} disabled={!prev} aria-label={navegacion.anterior}>
                  <Icono d="M10 3 5 8l5 5" />
                </button>
                <button type="button" className={boton} onClick={() => next && ir(next.id)} disabled={!next} aria-label={navegacion.siguiente}>
                  <Icono d="M6 3l5 5-5 5" />
                </button>
              </>
            )}
            <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="indice" className={boton}>
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-3 bg-current" />
              </span>
              <span className="hidden sm:inline">{navegacion.indice}</span>
              <span className="sr-only sm:hidden">{navegacion.indice}</span>
            </button>
          </div>
        </nav>
        {presentacion && <motion.div className="h-px origin-left bg-fucsia" style={{ scaleX: progress }} aria-hidden="true" />}
      </header>

      {/* En la portada la barra está oculta: acceso flotante y discreto al índice. */}
      <AnimatePresence>
        {presentacion && !visible && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir el índice de capítulos"
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex h-12 items-center gap-2 rounded-full border border-rosa/40 bg-ciruela/80 px-4 text-sm text-marfil backdrop-blur-md hover:border-rosa"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-3 bg-current" />
            </span>
            {navegacion.indice}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            id="indice"
            role="dialog"
            aria-modal="true"
            aria-label="Índice de capítulos"
            className="fixed inset-0 z-50 overflow-y-auto bg-ciruela-900/[0.97] backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="shell mx-auto flex min-h-full max-w-[1440px] flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="flex h-[3.75rem] items-center justify-between">
                <span className="eyebrow text-rosa">{navegacion.indice}</span>
                <button type="button" onClick={() => setOpen(false)} className="min-h-[44px] rounded-full border border-rosa/40 px-4 text-sm text-marfil">
                  {navegacion.cerrar}
                </button>
              </div>
              <SelectorEscucha />
              <ol className="mt-6 flex-1">
                {capitulos.map((c, i) => (
                  <motion.li key={c.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out, delay: 0.05 + i * 0.05 }} className="border-t border-rosa/10">
                    <a
                      ref={i === 0 ? firstLink : undefined}
                      href={`#${c.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={presentacion && active === c.id ? 'location' : undefined}
                      className="group flex items-baseline gap-5 py-4"
                    >
                      <span className="num w-8 text-sm text-fucsia">{c.numero}</span>
                      <span className={`font-display text-[length:var(--step-2)] leading-tight transition-colors group-hover:text-rosa ${presentacion && active === c.id ? 'italic text-rosa' : 'text-marfil'}`}>{c.nombre}</span>
                    </a>
                  </motion.li>
                ))}
              </ol>
              <div className="mt-8 grid gap-3 border-t border-rosa/20 pt-6 sm:grid-cols-2">
                {[
                  ['#inicio', navegacion.modos.presentacion, 'Narrativa animada, capítulo a capítulo'],
                  ['#/explorar', navegacion.modos.explorar, 'Gráficos interactivos y filtros'],
                ].map(([href, t, d]) => (
                  <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-sm border border-rosa/20 px-4 py-3 hover:border-rosa">
                    <span className="block text-marfil">{t}</span>
                    <span className="block text-xs text-bruma">{d}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
