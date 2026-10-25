import { useMemo } from 'react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import PeriodBars from '../components/charts/PeriodBars.jsx';
import Pending from '../components/charts/Pending.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { corteDatos, hechos } from '../lib/data/hechos.js';
import { resumenImpacto } from '../lib/data/impacto.js';
import { rangeLabel, todayBogota } from '../lib/data/dates.js';
import { formatDecimal } from '../lib/format.js';
import { impacto } from '../content/impacto.js';
import { PERIODOS_IMPACTO } from '../config/periodos.js';

/** Una escena compacta: observación, límites y oportunidades; el detalle vive en Explorar. */
export default function Impacto() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const r = useMemo(() => resumenImpacto(res), [res]);
  const stats = [r.antes, r.durante, r.despues];
  return (
    <section id="impacto" aria-labelledby="impacto-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={impacto.capitulo} titulo={impacto.titulo} tituloId="impacto-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-6">
        {r.disponible ? (
          <Scene index="04.1" kicker="Primera lectura · conversación observada" titulo={{ linea1: r.superaPromedio ? 'Un cambio para investigar' : 'Sin un pico observable', linea2: 'con una captura aún limitada' }} conclusion={h.impacto.texto} cta={<ExploreLink tab="impacto">Explorar el impacto y sus límites</ExploreLink>}>
            <PeriodBars compacto periodos={PERIODOS_IMPACTO.map((p, i) => ({
              ...p, rango: rangeLabel(p.desde, p.hasta), valor: stats[i]?.promedioDiario ?? null,
              detalle: stats[i] ? `${stats[i].diasConDatos} ${stats[i].diasConDatos === 1 ? 'día cubierto' : 'días cubiertos'} · mediana ${formatDecimal(stats[i].mediana)}` : null,
              pendiente: { estado: 'medicion', titulo: 'Aún sin días completos' },
            }))} unidad="menciones sobre cáncer de mama por día" />
            <p className="mt-5 max-w-3xl text-sm text-bruma">Como contraste, los siete días previos registraron {formatDecimal(r.reciente?.promedioDiario)} menciones diarias. La línea base de octubre incluye el Día Mundial; no es un contrafactual del concierto.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {impacto.universos.map((u) => <div key={u.titulo} className="border-l border-rosa/25 pl-4"><h4 className="eyebrow text-rosa">{u.titulo}</h4><p className="mt-2 text-sm text-bruma">{u.texto}</p></div>)}
            </div>
            <details className="mt-6 border-t border-rosa/15 pt-4">
              <summary className="min-h-[44px] cursor-pointer font-display text-xl italic text-rosa">Cómo amplificar futuras experiencias</summary>
              <p className="mt-2 text-sm text-bruma">Oportunidades de diseño, no acciones que se afirme que ocurrieron.</p>
              <div className="mt-4 grid gap-5 md:grid-cols-3">{impacto.oportunidades.map((o) => <div key={o.momento}><p className="eyebrow text-fucsia">{o.momento}</p><h4 className="mt-2 font-display text-xl italic text-marfil">{o.titulo}</h4><p className="mt-2 text-sm text-bruma">{o.texto}</p></div>)}</div>
              <p className="mt-4 text-sm text-bruma">{impacto.indicadores}</p>
            </details>
            <p className="mt-5 max-w-4xl text-xs text-bruma/80">{impacto.limites(corteDatos(res))} {impacto.causalidad}</p>
          </Scene>
        ) : <Pending estado="medicion" titulo={impacto.pendiente.titulo} detalle={impacto.pendiente.texto} />}
      </div>
    </section>
  );
}
