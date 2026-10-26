import { useMemo } from 'react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import PeriodBars from '../components/charts/PeriodBars.jsx';
import Pending from '../components/charts/Pending.jsx';
import GaleriaConcierto from '../components/GaleriaConcierto.jsx';
import UniversosConcierto from '../components/UniversosConcierto.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { corteDatos, hechos } from '../lib/data/hechos.js';
import { resumenImpacto } from '../lib/data/impacto.js';
import { rangeLabel, todayBogota } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatPct } from '../lib/format.js';
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
        {(r.disponible || res.campana) ? (
          <Scene index="04.1" kicker="24 DE OCTUBRE DE 2026 · CONCIERTO DE FONSECA" titulo={{ linea1: 'Una experiencia para conectar.', linea2: 'Una conversación por amplificar.' }} cta={<ExploreLink tab="impacto">Explorar el impacto y sus límites</ExploreLink>}>
            <UniversosConcierto />
            <div data-comparacion-diaria className="mt-5 border-l-2 border-fucsia pl-4">
              <h4 className="eyebrow text-rosa">Frente al día anterior · menciones relevantes</h4>
              <p className="mt-2 font-display text-3xl text-marfil">{r.cambioDiaAnterior == null ? 'Comparación pendiente' : formatPct(r.cambioDiaAnterior, true)}</p>
              <p className="mt-2 text-sm text-bruma">{r.diaAnterior && r.durante ? `${formatNumber(r.diaAnterior.total)} el 23 de octubre → ${formatNumber(r.durante.total)} el 24.` : 'Faltan días completos.'} Es una comparación de volumen, no evidencia causal del concierto. El valor comprobado puede ampliarse al verificar y clasificar las capturas manuales.</p>
            </div>
            <p className="mt-5 max-w-3xl text-sm text-marfil">{h.impacto.significa} La oportunidad es conectar la emoción del encuentro con contenidos compartibles, concientización e interacciones medibles.</p>
            <GaleriaConcierto />
            <p className="mt-4 max-w-3xl text-xs text-bruma/80">Revisión focalizada de SentiOne · 22–24 de octubre: no se identificaron publicaciones adicionales del concierto en los registros revisados. Esto no equivale a ausencia de más actividad en las redes. La conexión de las referencias de campaña con mensajes de concientización sigue pendiente de comprobar en su contenido.</p>
            <details className="mt-6 border-t border-rosa/15 pt-4">
              <summary className="min-h-[44px] cursor-pointer font-display text-xl italic text-rosa">Ver el comportamiento de la causa antes y durante</summary>
              <p className="mb-4 mt-3 text-sm text-bruma">{h.impacto.texto}</p>
            <PeriodBars compacto periodos={PERIODOS_IMPACTO.map((p, i) => ({
              ...p, rango: rangeLabel(p.desde, p.hasta), valor: stats[i]?.promedioDiario ?? null,
              detalle: stats[i] ? `${stats[i].diasConDatos} ${stats[i].diasConDatos === 1 ? 'día cubierto' : 'días cubiertos'} · mediana ${formatDecimal(stats[i].mediana)}` : null,
              pendiente: { estado: 'medicion', titulo: 'Aún sin días completos' },
            }))} unidad="menciones sobre cáncer de mama por día" />
            <p className="mt-5 max-w-3xl text-sm text-bruma">Como contraste, los siete días previos registraron {formatDecimal(r.reciente?.promedioDiario)} menciones diarias. La línea base de octubre incluye el Día Mundial; no es un contrafactual del concierto.</p>
            </details>
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
