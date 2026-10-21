import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Chips from './Chips.jsx';
import { useFilters } from '../state/DataContext.jsx';
import { NARRATIVAS, PLATAFORMAS, SENTIMIENTOS } from '../config/clasificacion.js';
import { MARCAS, UNIVERSOS } from '../config/universos.js';
import { LIMITES, PRESETS } from '../config/periodos.js';
import { rangeLabel } from '../lib/data/dates.js';

const TIPOS = [
  { id: 'original', nombre: 'Original SentiOne' },
  { id: 'revisado', nombre: 'Revisado' },
  { id: 'sugerido', nombre: 'Sugerido' },
];

/**
 * Filtros compartidos por presentación y modo explorar.
 * campos: 'universo' | 'fechas' | 'plataformas' | 'sentimiento' | 'narrativas' | 'marcas'
 */
export default function FilterBar({ campos = ['universo', 'fechas', 'plataformas', 'sentimiento', 'narrativas'], sticky = true }) {
  const { filtros: f, update, reset } = useFilters();
  const [abierto, setAbierto] = useState(false);
  const activos =
    f.plataformas.length + f.sentimientos.length + f.narrativas.length + (campos.includes('marcas') && f.marcas.length !== MARCAS.length ? 1 : 0);

  return (
    <div className={`${sticky ? 'sticky top-[3.75rem] z-30' : ''} -mx-[var(--gutter)] border-y border-rosa/15 bg-ciruela/90 px-[var(--gutter)] backdrop-blur-md`}>
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
          {campos.includes('universo') && <> · {UNIVERSOS.find((u) => u.id === f.universo)?.corto}</>}
          {f.tipoSentimiento !== 'original' && campos.includes('sentimiento') && <> · sentimiento {f.tipoSentimiento}</>}
        </p>
        {activos > 0 && (
          <button type="button" onClick={reset} className="min-h-[44px] text-sm text-rosa underline underline-offset-4">
            Restablecer
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="max-h-[65svh] space-y-6 overflow-y-auto pb-6 pt-2">
              {campos.includes('universo') && (
                <Campo titulo="Universo de monitoreo">
                  <Chips multiple={false} opciones={UNIVERSOS.map((u) => ({ id: u.id, nombre: u.corto, color: u.color }))} valor={f.universo} onChange={(v) => update({ universo: v })} etiqueta="Universo" />
                </Campo>
              )}
              {campos.includes('marcas') && (
                <Campo titulo="Laboratorios">
                  <Chips opciones={MARCAS.map((m) => ({ id: m.id, nombre: m.nombre, color: m.color }))} valor={f.marcas} onChange={(v) => update({ marcas: v })} etiqueta="Laboratorios" />
                </Campo>
              )}
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
                    <label className="flex items-center gap-2 text-bruma">
                      Desde
                      <input type="date" min={LIMITES.min} max={f.hasta} value={f.desde} onChange={(e) => e.target.value && update({ desde: e.target.value })} className="min-h-[44px] rounded-sm border border-rosa/30 bg-ciruela-800 px-3 text-marfil" />
                    </label>
                    <label className="flex items-center gap-2 text-bruma">
                      Hasta
                      <input type="date" min={f.desde} max={LIMITES.max} value={f.hasta} onChange={(e) => e.target.value && update({ hasta: e.target.value })} className="min-h-[44px] rounded-sm border border-rosa/30 bg-ciruela-800 px-3 text-marfil" />
                    </label>
                  </div>
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
                    <Chips opciones={SENTIMIENTOS} valor={f.sentimientos} onChange={(v) => update({ sentimientos: v })} etiqueta="Sentimientos" />
                  </div>
                </Campo>
              )}
              {campos.includes('narrativas') && (
                <Campo titulo="Narrativa">
                  <Chips opciones={NARRATIVAS} valor={f.narrativas} onChange={(v) => update({ narrativas: v })} etiqueta="Narrativas" />
                </Campo>
              )}
              <p className="text-xs text-bruma">Los filtros por plataforma, sentimiento o narrativa solo aplican a registros importados; la línea base agregada no se puede dividir.</p>
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
