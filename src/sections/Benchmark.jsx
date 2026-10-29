import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import Pending from '../components/charts/Pending.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { tieneBaseMaestra } from '../lib/data/resultados.js';
import { hechos } from '../lib/data/hechos.js';
import { todayBogota } from '../lib/data/dates.js';
import { formatNumber } from '../lib/format.js';
import { benchmark, lecturaPresencia, referenciasBenchmark, laboratoriosConReferencias } from '../content/benchmark.js';
import { entidad, LABORATORIOS } from '../config/marcas.js';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

export function References({ plegado = false }) {
  const R = benchmark.referencias;
  const [laboratorio, setLaboratorio] = useState('todas');
  const items = referenciasBenchmark(laboratorio);
  const laboratorios = laboratoriosConReferencias(LABORATORIOS);
  const Cont = plegado ? 'details' : 'div';
  return (
    <Cont className={`group ${plegado ? 'mt-8 border-t border-rosa/20 pt-4' : 'mt-12'}`}>
      {plegado ? (
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4">
          <span className="eyebrow text-rosa">
            {R.titulo} ({items.length})
          </span>
          <span className="text-sm text-rosa underline underline-offset-4 group-open:hidden">Ver publicaciones</span>
          <span className="hidden text-sm text-rosa underline underline-offset-4 group-open:inline">Ocultar</span>
        </summary>
      ) : (
        <p className="eyebrow text-rosa">{R.titulo}</p>
      )}
      <p className="mt-2 max-w-2xl text-xs text-bruma">{R.aviso}</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Consultar referencias por laboratorio">
        {[{ id: 'todas', nombre: 'Todas las iniciativas' }, ...laboratorios].map(l => (
          <button key={l.id} type="button" aria-pressed={laboratorio === l.id} onClick={() => setLaboratorio(l.id)}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm transition-colors ${laboratorio === l.id ? 'border-rosa bg-rosa/15 text-rosa' : 'border-rosa/20 text-marfil hover:border-rosa/60'}`}>
            {l.nombre}
          </button>
        ))}
      </div>
      {!items.length && <p className="mt-4 text-sm text-bruma">Sin referencias públicas verificadas disponibles para este laboratorio. No implica ausencia de publicaciones.</p>}
      <ul className="mt-4 grid gap-x-8 border-t border-rosa/10 sm:grid-cols-2">
        {items.map((r) => (
          <li key={r.id} className="border-b border-rosa/10 py-4">
            <p className="font-display text-[length:var(--step-1)] italic leading-tight text-marfil">
              {r.nombre}
              <span className="ml-2 font-sans text-xs not-italic text-bruma">{r.pais}</span>
            </p>
            <p className="mt-1 text-sm text-bruma">
              <span className="text-marfil">{r.marcas}. </span>
              {r.descripcion}{' '}
              <a href={r.fuente.url} target="_blank" rel="noopener noreferrer" className="text-rosa underline underline-offset-4">
                {r.fuente.nombre}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </p>
          </li>
        ))}
      </ul>
    </Cont>
  );
}

/** Capítulo 05: presencia de laboratorios, lectura estratégica y referencias públicas verificadas. */
export default function Benchmark() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const hay = tieneBaseMaestra(res) && h.marcas.disponible;
  const labs = h.marcas.laboratorios ?? [];
  const k = res.umbral;
  const { escena } = benchmark;
  const observacion = {
    presencia: lecturaPresencia(labs, k),
    temas: h.laboratorios.disponible ? h.laboratorios.texto : null,
  };

  return (
    <section id="benchmark" aria-labelledby="benchmark-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={benchmark.capitulo} titulo={benchmark.titulo} entradilla={benchmark.texto} tituloId="benchmark-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-6">
        <Scene index="05.1" kicker={escena.kicker} titulo={escena.titulo} cta={hay ? <ExploreLink tab="benchmark">Explorar el comparativo y sus límites</ExploreLink> : null}>
          {hay ? (
            <>
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <p className="eyebrow mb-3 text-bruma">{escena.presencia}</p>
                  {h.laboratorios.disponible && (
                    <p className="display num text-[length:var(--step-4)] leading-none text-rosa">
                      {h.laboratorios.cifra}
                      <span className="mt-2 block font-sans text-sm text-bruma">{h.laboratorios.unidad}</span>
                    </p>
                  )}
                </div>
                <ul className="flex flex-wrap content-start gap-2 lg:col-span-7" aria-label="Laboratorios identificados">
                  {labs.map((l, i) => (
                    <motion.li key={l.id} className="inline-flex items-center gap-2 rounded-full border border-rosa/20 px-3 py-1.5 text-sm" {...reveal(0.04 * i)}>
                      <span className="h-2 w-2 rounded-full" style={{ background: entidad(l.id).color }} aria-hidden="true" />
                      <span className={l.id === 'msd' ? 'text-fucsia' : 'text-marfil'}>{l.nombre}</span>
                      <span className="num text-xs text-bruma">{l.n == null ? `< ${k}` : formatNumber(l.n)}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {Object.entries(h.marcas.temas ?? {}).filter(([id]) => benchmark.sintesis[id]).map(([id, l]) => (
                <motion.div key={id} className="mt-6 max-w-3xl rounded-sm border border-rosa/15 p-5" {...reveal()}>
                  <p className="eyebrow flex flex-wrap items-center gap-x-3" style={{ color: entidad(id).color }}>
                    {entidad(id).nombre}
                    <span className="num normal-case tracking-normal text-bruma">
                      {formatNumber(l.n)} menciones · temática principal: {l.temaNombre.toLowerCase()} ({formatNumber(l.temaN)})
                    </span>
                  </p>
                  <p className="mt-3 font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{benchmark.sintesis[id]}</p>
                </motion.div>
              ))}

              <ol className="-mx-[var(--gutter)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {benchmark.conclusiones.map((c, i) => (
                  <motion.li key={c.id} className="w-[85%] shrink-0 snap-start rounded-sm border border-rosa/15 p-5 md:w-auto" {...reveal(0.08 * i)}>
                    <p className="eyebrow text-bruma">Qué observamos</p>
                    <p className="mt-1 text-sm text-marfil">{observacion[c.id] ?? c.observamos}</p>
                    <p className="eyebrow mt-4 text-bruma">Qué significa</p>
                    <p className="mt-1 text-sm text-bruma">{c.significa}</p>
                    <p className="eyebrow mt-4 text-rosa">Oportunidad para MSD</p>
                    <p className="mt-1 font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{c.oportunidad}</p>
                  </motion.li>
                ))}
              </ol>
              <p className="mt-4 max-w-3xl text-xs text-bruma/80">Lectura preliminar. {benchmark.limitacion}</p>
            </>
          ) : (
            <Pending estado="analisis" titulo={benchmark.pendiente} />
          )}
          <References />
        </Scene>
      </div>
    </section>
  );
}
