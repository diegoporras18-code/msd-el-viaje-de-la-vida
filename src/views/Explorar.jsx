import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ImpactDashboard from '../dashboards/ImpactDashboard.jsx';
import { ease } from '../lib/motion.js';

const TABS = [{id:'impacto',nombre:'Impacto de la campaña',Comp:ImpactDashboard}];

const tabDelHash = () => {
  const id = window.location.hash.split('/')[2];
  return TABS.some((t) => t.id === id) ? id : 'impacto';
};

/** Modo Explorar resultados: análisis profundo con los mismos componentes de la presentación. */
export default function Explorar() {
  const [tab, setTab] = useState(tabDelHash);
  useEffect(() => {
    const on = () => setTab(tabDelHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const actual = TABS.find((t) => t.id === tab) ?? TABS[0];


  return (
    <div className="shell mx-auto max-w-[1440px] pb-24 pt-28">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-rosa">El Viaje de la Vida</p>
          <h1 className="display mt-3 text-[length:var(--step-4)] text-marfil">
            Explorar <span className="italic text-rosa">resultados</span>
          </h1>
        </div>
        <p className="max-w-sm text-sm text-bruma">Resultados de la campaña desde el 24 de octubre de 2026.</p>
      </header>

      <div role="tablist" aria-label="Resultados" className="mt-10 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#/explorar/${t.id}`}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-5 text-sm transition-colors ${tab === t.id ? 'border-fucsia bg-fucsia text-white' : 'border-rosa/25 text-marfil hover:border-rosa'}`}
          >
            {t.nombre}
          </a>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={actual.id}
          role="tabpanel"
          id={`panel-${actual.id}`}
          aria-labelledby={`tab-${actual.id}`}
          className="mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: ease.out }}
        >
          <actual.Comp />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
