import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Chips from './Chips.jsx';
import { useFilters } from '../state/DataContext.jsx';
import { PLATAFORMAS, TEMAS } from '../config/clasificacion.js';
import { ENTIDADES, LABORATORIOS } from '../config/marcas.js';
import { LIMITES, PRESETS } from '../config/periodos.js';
import { catalogoSentimiento } from '../lib/data/resultados.js';
import { rangeLabel } from '../lib/data/dates.js';

const TIPOS = [
  { id: 'revisado', nombre: 'Por contenido' },
  { id: 'original', nombre: 'SentiOne original' },
];
const RELEVANCIA = [
  { id: 'todas', nombre: 'Todas las menciones' },
  { id: 'relevantes', nombre: 'Solo cáncer de mama' },
];

/**
 * Filtros del modo Explorar. Afectan a todas las visualizaciones de la pestaña.
 * campos: 'fechas' | 'plataformas' | 'sentimiento' | 'temas' | 'marcas' | 'relevancia' | 'comparar'
 */
export default function FilterBar({ campos = ['fechas', 'plataformas', 'sentimiento', 'temas', 'marcas', 'relevancia'] }) {
  const { filtros: f, update, reset } = useFilters();
  const [abierto, setAbierto] = useState(false);
  const activos = f.plataformas.length + f.sentimientos.length + f.temas.length + f.marcas.length + (f.relevancia !== 'todas' ? 1 : 0);

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
          Filtros{activos ? ` (${activos})` : ''}
        </button>
        <p className="text-sm text-bruma">
          <span className="text-marfil">{rangeLabel(f.desde, f.hasta)}</span>
          {campos.includes('sentimiento') && f.tipoSentimiento === 'original' && <> · sentimiento de SentiOne</>}
        </p>
        {activos > 0 && (
          <button type="button" onClick={reset} className="min-h-[44px] text-sm text-rosa underline underline-offset-4">
            Restablecer
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
            <div className="max-h-[65svh] space-y-6 overflow-y-auto pb-6 pt-2">
              {campos.includes('fechas') && (
                <Campo titulo="Fechas">
                  <Chips
                    multiple={false}
                    opciones={PRESETS}
                    valor={PRESETS.find((p) => p.desde === f.desde && p.hasta === f.hasta)?.id}
                    onChange={(id) => {
                      const p = PRESETS.find((x) => x.id === id);
                      update({ desde: p.desde, hasta: p.hasta });
                    }}
                    etiqueta="Periodos"
                  />
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {[
                      ['Desde', 'desde', LIMITES.min, f.hasta],
                      ['Hasta', 'hasta', f.desde, LIMITES.max],
                    ].map(([t, k, min, max]) => (
                      <label key={k} className="flex items-center gap-2 text-bruma">
                        {t}
                        <input type="date" min={min} max={max} value={f[k]} onChange={(e) => e.target.value && update({ [k]: e.target.value })} className="min-h-[44px] rounded-sm border border-rosa/30 bg-ciruela-800 px-3 text-marfil" />
                      </label>
                    ))}
                  </div>
                </Campo>
              )}
              {campos.includes('comparar') && (
                <Campo titulo="Laboratorios comparados">
                  <Chips opciones={LABORATORIOS.map((m) => ({ id: m.id, nombre: m.nombre, color: m.color }))} valor={f.comparar} onChange={(v) => update({ comparar: v })} etiqueta="Laboratorios" />
                </Campo>
              )}
              {campos.includes('marcas') && (
                <Campo titulo="Menciona a">
                  <Chips opciones={ENTIDADES.map((m) => ({ id: m.id, nombre: m.nombre, color: m.color }))} valor={f.marcas} onChange={(v) => update({ marcas: v })} etiqueta="Marcas y campañas" />
                </Campo>
              )}
              {campos.includes('plataformas') && (
                <Campo titulo="Plataforma">
                  <Chips opciones={PLATAFORMAS} valor={f.plataformas} onChange={(v) => update({ plataformas: v })} etiqueta="Plataformas" />
                </Campo>
              )}
              {campos.includes('sentimiento') && (
                <Campo titulo="Sentimiento">
                  <Chips multiple={false} opciones={TIPOS} valor={f.tipoSentimiento} onChange={(v) => update({ tipoSentimiento: v, sentimientos: [] })} etiqueta="Tipo de clasificación" />
                  <div className="mt-3">
                    <Chips opciones={catalogoSentimiento(f.tipoSentimiento)} valor={f.sentimientos} onChange={(v) => update({ sentimientos: v })} etiqueta="Sentimientos" />
                  </div>
                </Campo>
              )}
              {campos.includes('temas') && (
                <Campo titulo="Temática">
                  <Chips opciones={TEMAS} valor={f.temas} onChange={(v) => update({ temas: v })} etiqueta="Temáticas" />
                </Campo>
              )}
              {campos.includes('relevancia') && (
                <Campo titulo="Relevancia">
                  <Chips multiple={false} opciones={RELEVANCIA} valor={f.relevancia} onChange={(v) => update({ relevancia: v })} etiqueta="Relevancia" />
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
