import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { capitulos, navegacion } from '../content/navegacion.js';
import { useActiveSection } from '../lib/hooks.js';
import { useData } from '../state/DataContext.jsx';
import { ease } from '../lib/motion.js';

const IDS = capitulos.map((c) => c.id);

/** Barra discreta: índice de capítulos, cambio de modo y progreso de lectura. */
export default function SiteNav({ route }) {
  const presentacion = route === 'presentacion';
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(!presentacion);
  const active = useActiveSection(IDS, presentacion);
  const { esVistaPrevia } = useData();
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

  const actual = capitulos.find((c) => c.id === active);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-rosa/10 bg-ciruela/80 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-all duration-500 focus-within:translate-y-0 focus-within:opacity-100 ${
          visible || open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <nav aria-label="Principal" className="shell flex h-[3.75rem] items-center justify-between gap-4">
          <a href="#inicio" className="font-display text-lg italic text-marfil">
            {navegacion.marca}
          </a>
          {presentacion && actual && (
            <p className="hidden truncate text-sm text-bruma md:block" aria-live="polite">
              <span className="num mr-2 text-fucsia">{actual.numero}</span>
              {actual.nombre}
            </p>
          )}
          <div className="flex items-center gap-2">
            {esVistaPrevia && <span className="eyebrow hidden rounded-full bg-fucsia px-3 py-1 text-white sm:inline">Vista previa local</span>}
            <div className="hidden rounded-full border border-rosa/25 p-1 sm:flex">
              <a href="#inicio" aria-current={presentacion ? 'page' : undefined} className={`rounded-full px-3 py-1.5 text-sm ${presentacion ? 'bg-rosa text-ciruela' : 'text-marfil'}`}>
                {navegacion.modos.presentacion}
              </a>
              <a href="#/explorar" aria-current={route === 'explorar' ? 'page' : undefined} className={`rounded-full px-3 py-1.5 text-sm ${route === 'explorar' ? 'bg-rosa text-ciruela' : 'text-marfil'}`}>
                {navegacion.modos.explorar}
              </a>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="indice"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-rosa/40 px-4 text-sm text-marfil hover:border-rosa"
            >
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-3 bg-current" />
              </span>
              {navegacion.indice}
            </button>
          </div>
        </nav>
        {presentacion && <motion.div className="h-px origin-left bg-fucsia" style={{ scaleX: progress }} aria-hidden="true" />}
      </header>

      {/* En la portada, la barra está oculta: un acceso flotante y discreto al índice. */}
      <AnimatePresence>
        {presentacion && !visible && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir el índice de capítulos"
            className={`fixed right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex h-12 items-center gap-2 rounded-full border border-rosa/40 bg-ciruela/80 px-4 text-sm text-marfil backdrop-blur-md hover:border-rosa ${
              esVistaPrevia ? 'bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))]' : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]'
            }`}
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
              <ol className="mt-8 flex-1">
                {capitulos.map((c, i) => (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: ease.out, delay: 0.05 + i * 0.05 }}
                    className="border-t border-rosa/10"
                  >
                    <a
                      ref={i === 0 ? firstLink : undefined}
                      href={`#${c.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={presentacion && active === c.id ? 'location' : undefined}
                      className="group flex items-baseline gap-5 py-4 sm:py-5"
                    >
                      <span className="num w-8 text-sm text-fucsia">{c.numero}</span>
                      <span className={`font-display text-[length:var(--step-2)] leading-tight transition-colors group-hover:text-rosa ${presentacion && active === c.id ? 'italic text-rosa' : 'text-marfil'}`}>
                        {c.nombre}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ol>
              <div className="mt-10 grid gap-3 border-t border-rosa/20 pt-6 sm:grid-cols-3">
                {[
                  ['#inicio', navegacion.modos.presentacion, 'Narrativa animada a pantalla completa'],
                  ['#/explorar', navegacion.modos.explorar, 'Dashboards y filtros'],
                  ['#/importar', navegacion.modos.importar, 'Importar Excel de SentiOne'],
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
