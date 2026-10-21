import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Chips from './Chips.jsx';
import { useFilters } from '../state/DataContext.jsx';
import { LABORATORIOS } from '../config/marcas.js';
import { PRESETS } from '../config/periodos.js';
import { SEGMENTOS } from '../lib/data/resultados.js';
import { rangeLabel } from '../lib/data/dates.js';

/**
 * Filtros del modo Explorar. Los resultados publicados son agregados por periodo, así que se
 * elige un periodo predefinido y qué conversación mirar; no hay cruces libres entre dimensiones.
 * campos: 'periodo' | 'segmento' | 'comparar'
 */
export default function FilterBar({ campos = ['periodo', 'segmento'] }) {
  const { filtros: f, update, reset } = useFilters();
  const [abierto, setAbierto] = useState(false);
  const preset = PRESETS.find((p) => p.desde === f.desde && p.hasta === f.hasta);
  const segmento = SEGMENTOS.find((s) => s.id === f.segmento);

  return (
    <div className="sticky top-[3.75rem] z-30 -mx-[var(--gutter)] border-y border-rosa/15 bg-ciruela/90 px-[var(--gutter)] backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-rosa/40 px-4 text-sm text-marfil hover:border-rosa"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Filtros
        </button>
        <p className="text-sm text-bruma">
          <span className="text-marfil">{preset?.nombre ?? rangeLabel(f.desde, f.hasta)}</span>
          {campos.includes('segmento') && segmento && <> · {segmento.nombre.toLowerCase()}</>}
        </p>
        <button type="button" onClick={reset} className="min-h-[44px] text-sm text-rosa underline underline-offset-4">
          Restablecer
        </button>
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
            <div className="max-h-[65svh] space-y-6 overflow-y-auto pb-6 pt-2">
              {campos.includes('periodo') && (
                <Campo titulo="Periodo">
                  <Chips
                    multiple={false}
                    opciones={PRESETS.map((p) => ({ ...p, nombre: `${p.nombre} · ${rangeLabel(p.desde, p.hasta)}` }))}
                    valor={preset?.id}
                    onChange={(id) => {
                      const p = PRESETS.find((x) => x.id === id);
                      update({ desde: p.desde, hasta: p.hasta });
                    }}
                    etiqueta="Periodos"
                  />
                </Campo>
              )}
              {campos.includes('segmento') && (
                <Campo titulo="Conversación">
                  <Chips multiple={false} opciones={SEGMENTOS} valor={f.segmento} onChange={(v) => update({ segmento: v })} etiqueta="Conversación" />
                  <p className="mt-3 max-w-2xl text-xs text-bruma">
                    «Sobre cáncer de mama» incluye solo las menciones que, leídas por contenido, hablan realmente del tema. «Todo lo captado» suma también las coincidencias ajenas y se muestra como contexto.
                  </p>
                </Campo>
              )}
              {campos.includes('comparar') && (
                <Campo titulo="Laboratorios comparados">
                  <Chips opciones={LABORATORIOS.map((m) => ({ id: m.id, nombre: m.nombre, color: m.color }))} valor={f.comparar} onChange={(v) => update({ comparar: v })} etiqueta="Laboratorios" />
                </Campo>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Campo({ titulo, children }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-rosa">{titulo}</legend>
      {children}
    </fieldset>
  );
}
