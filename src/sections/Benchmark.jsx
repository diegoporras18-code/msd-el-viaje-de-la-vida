import { useMemo } from 'react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Pending from '../components/charts/Pending.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { FILTROS_VACIOS, shareOfVoice, tieneBaseMaestra, view } from '../lib/data/resultados.js';
import { hechos } from '../lib/data/hechos.js';
import { todayBogota } from '../lib/data/dates.js';
import { formatPct } from '../lib/format.js';
import { benchmark } from '../content/benchmark.js';
import { BENCHMARK, LABORATORIOS, entidad } from '../config/marcas.js';
import { PERIODO_PREVIO } from '../config/periodos.js';

export function References() {
  const R = benchmark.referencias;
  return (
    <div className="mt-16">
      <p className="eyebrow text-rosa">{R.titulo}</p>
      <p className="mt-2 max-w-2xl text-xs text-bruma">{R.aviso}</p>
      <ul className="mt-6 divide-y divide-rosa/10 border-y border-rosa/10">
        {R.items.map((r) => (
          <li key={r.id} className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-6">
            <p className="font-display text-[length:var(--step-1)] italic text-marfil sm:col-span-4">
              {r.nombre}
              <span className="mt-1 block font-sans text-xs not-italic text-bruma">{r.pais ?? 'País por verificar'}</span>
            </p>
            <p className="text-sm text-bruma sm:col-span-8">
              {r.marcas ? <span className="text-marfil">{r.marcas}. </span> : null}
              {r.descripcion}
              {r.fuente && (
                <>
                  {' '}
                  <a href={r.fuente.url} target="_blank" rel="noopener noreferrer" className="text-rosa underline underline-offset-4">
                    {r.fuente.nombre}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Capítulo 05: una escena comparativa desde la misma base maestra. */
export default function Benchmark() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const f = { ...FILTROS_VACIOS, ...PERIODO_PREVIO };
  const v = useMemo(() => view(res, f), [res]);
  const sov = useMemo(() => shareOfVoice(res, f, BENCHMARK), [res]);
  const labs = LABORATORIOS.map((l) => ({ id: l.id, nombre: l.nombre, v: v.marcas.find((m) => m.id === l.id)?.v ?? 0, color: l.color }));
  const hay = tieneBaseMaestra(res);

  return (
    <section id="benchmark" aria-labelledby="benchmark-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={benchmark.capitulo} titulo={benchmark.titulo} entradilla={benchmark.texto} tituloId="benchmark-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-12">
        <Scene index="05.1" kicker="Menciones explícitas" titulo={{ linea1: 'Quién aparece', linea2: 'en la conversación' }} conclusion={h.marcas.disponible ? h.marcas.texto : null} cta={hay ? <ExploreLink tab="benchmark">Explorar el comparativo</ExploreLink> : null}>
          {hay ? (
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <BarList items={labs} total={v.registros} unidad="menciones" />
              </div>
              <div className="lg:col-span-5">
                {sov.ok ? (
                  <>
                    <p className="eyebrow mb-4 text-bruma">Share of Voice</p>
                    <StackBars filas={[{ id: 'sov', nombre: `${sov.dias} días comparables`, segmentos: sov.valores.map((x) => ({ id: x.id, nombre: `${entidad(x.id).nombre} ${formatPct(x.pct)}`, v: x.v, color: entidad(x.id).color })) }]} />
                  </>
                ) : (
                  <p className="border-l-2 border-rosa/40 pl-4 text-sm text-bruma">{benchmark.limitacion}</p>
                )}
              </div>
            </div>
          ) : (
            <Pending estado="analisis" titulo={benchmark.pendiente} />
          )}
          <References />
        </Scene>
      </div>
    </section>
  );
}
