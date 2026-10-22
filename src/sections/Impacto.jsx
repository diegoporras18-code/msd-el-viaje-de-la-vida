import { useMemo } from 'react';
import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import PeriodBars from '../components/charts/PeriodBars.jsx';
import WaveLine from '../components/WaveLine.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { FILTROS_VACIOS, marcasView, periodStats } from '../lib/data/resultados.js';
import { hechos } from '../lib/data/hechos.js';
import { rangeLabel, todayBogota } from '../lib/data/dates.js';
import { formatDecimal, formatOne } from '../lib/format.js';
import { impacto } from '../content/impacto.js';
import { PERIODOS_IMPACTO } from '../config/periodos.js';
import { duration, ease } from '../lib/motion.js';

const ATRIBUIBLE = [
  ['fonseca', 'Fonseca'],
  ['el-viaje-de-la-vida', 'El Viaje de la Vida'],
  ['msd', 'MSD'],
];

/** Capítulo 04: una escena. Antes del evento, un único estado pendiente. */
export default function Impacto() {
  const res = useResultados();
  const hoy = todayBogota();
  const h = useMemo(() => hechos(res, hoy), [res, hoy]);
  const periodos = useMemo(
    () =>
      PERIODOS_IMPACTO.map((p) => {
        const f = { ...FILTROS_VACIOS, segmento: 'todas', desde: p.desde, hasta: p.hasta };
        const st = periodStats(res, f);
        return { ...p, st, marcas: st ? marcasView(res, f, ATRIBUIBLE.map(([id]) => id)) : null };
      }),
    [res],
  );

  return (
    <section id="impacto" aria-labelledby="impacto-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={impacto.capitulo} titulo={impacto.titulo} tituloId="impacto-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-12">
        {h.impacto.disponible ? (
          <Scene index="04.1" kicker="Antes, durante y después" titulo={{ linea1: 'Lo que cambió', linea2: 'alrededor de la noche' }} conclusion={h.impacto.texto} cta={<ExploreLink tab="impacto">Explorar el impacto en detalle</ExploreLink>}>
            <PeriodBars
              periodos={periodos.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                rango: rangeLabel(p.desde, p.hasta),
                valor: p.st?.promedioDiario ?? null,
                detalle: p.st ? `Mediana ${formatOne(p.st.mediana)} · ${p.st.diasConDatos} días con datos` : null,
                pendiente: { estado: hoy < p.desde ? 'evento' : 'medicion' },
              }))}
              unidad="menciones por día"
            />
            <table className="mt-14 w-full max-w-3xl text-left text-sm">
              <caption className="eyebrow mb-4 text-left text-rosa">Conversación atribuible a la acción · menciones por día</caption>
              <thead>
                <tr className="text-bruma">
                  <th scope="col" className="pb-2 font-normal">
                    <span className="sr-only">Entidad</span>
                  </th>
                  {periodos.map((p) => (
                    <th key={p.id} scope="col" className="pb-2 font-normal">
                      {p.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATRIBUIBLE.map(([id, nombre]) => (
                  <tr key={id} className="border-t border-rosa/10">
                    <th scope="row" className="py-3 font-display text-[length:var(--step-1)] font-normal italic text-marfil">
                      {nombre}
                    </th>
                    {periodos.map((p) => (
                      <td key={p.id} className="num py-3 text-marfil">
                        {!p.marcas ? '—' : p.marcas.find((m) => m.id === id).todas == null ? `< ${res.umbral} en total` : formatDecimal(p.marcas.find((m) => m.id === id).todas / p.st.diasConDatos)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Scene>
        ) : (
          <motion.div
            className="relative overflow-hidden border-y border-rosa/15 py-16 sm:py-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: duration.reveal, ease: ease.reveal }}
          >
            <WaveLine className="absolute inset-x-0 top-1/2 h-24 -translate-y-1/2 opacity-40" />
            <div className="relative grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-fucsia/50 px-3 py-1.5 text-fucsia">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {h.impacto.estado === 'evento' ? 'Disponible después del evento' : 'Pendiente de medición'}
                </span>
                <p className="display mt-6 text-[length:var(--step-3)] text-marfil">{impacto.pendiente.titulo}</p>
                <p className="mt-5 max-w-xl text-bruma">{impacto.pendiente.texto}</p>
              </div>
              <ol className="space-y-4 lg:col-span-5 lg:col-start-8">
                {impacto.pendiente.medira.map((m, i) => (
                  <motion.li
                    key={m}
                    className="flex gap-4 border-b border-rosa/10 pb-4"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: duration.enter, ease: ease.out, delay: 0.1 * i }}
                  >
                    <span className="num text-sm text-fucsia">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{m}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
            <p className="relative mt-12 max-w-2xl text-xs text-bruma/80">{impacto.causalidad}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
