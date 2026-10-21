import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ConversationDashboard from '../dashboards/ConversationDashboard.jsx';
import ImpactDashboard from '../dashboards/ImpactDashboard.jsx';
import BenchmarkDashboard from '../dashboards/BenchmarkDashboard.jsx';
import DataStatus from '../dashboards/DataStatus.jsx';
import { useData } from '../state/DataContext.jsx';
import { ease } from '../lib/motion.js';

const TABS = [
  { id: 'conversacion', nombre: 'Conversación', Comp: ConversationDashboard },
  { id: 'impacto', nombre: 'Impacto del concierto', Comp: ImpactDashboard },
  { id: 'benchmark', nombre: 'Benchmark', Comp: BenchmarkDashboard },
  { id: 'datos', nombre: 'Estado de los datos', Comp: DataStatus },
];

const KEY = 'evdlv-tab';

/** Modo explorar: acceso directo a los dashboards con los mismos componentes de la presentación. */
export default function Explorar() {
  const [tab, setTab] = useState(() => {
    try {
      return localStorage.getItem(KEY) ?? 'conversacion';
    } catch {
      return 'conversacion';
    }
  });
  const { esVistaPrevia, dataset } = useData();
  useEffect(() => {
    try {
      localStorage.setItem(KEY, tab);
    } catch {
      /* sin almacenamiento */
    }
  }, [tab]);
  const actual = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="shell mx-auto max-w-[1440px] pb-24 pt-28">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-rosa">Modo explorar datos</p>
          <h1 className="display mt-3 text-[length:var(--step-4)] text-marfil">
            Explorar <span className="italic text-rosa">datos</span>
          </h1>
        </div>
        <p className="max-w-sm text-sm text-bruma">
          {esVistaPrevia ? 'Estás viendo una vista previa local, no publicada.' : 'Datos publicados en el repositorio.'}
          {dataset.generado && ` Generados el ${new Date(dataset.generado).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}.`}
        </p>
      </header>

      <div role="tablist" aria-label="Dashboards" className="mt-10 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`min-h-[44px] shrink-0 rounded-full border px-5 text-sm transition-colors ${tab === t.id ? 'border-fucsia bg-fucsia text-white' : 'border-rosa/25 text-marfil hover:border-rosa'}`}
          >
            {t.nombre}
          </button>
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
