import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Pending from '../components/charts/Pending.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { References } from '../sections/Benchmark.jsx';
import { useFilters, useResultados } from '../state/DataContext.jsx';
import { marcasView, shareOfVoice, tieneBaseMaestra, view } from '../lib/data/resultados.js';
import { rangeLabel } from '../lib/data/dates.js';
import { formatNumber, formatPct } from '../lib/format.js';
import { benchmark } from '../content/benchmark.js';
import { entidad } from '../config/marcas.js';

/**
 * Presencia de cada laboratorio en la consulta. Con tan pocas menciones por marca, los
 * desgloses por plataforma, sentimiento o temática no alcanzan el umbral de publicación.
 */
export default function BenchmarkDashboard() {
  const res = useResultados();
  const { filtros: f } = useFilters();
  const marcas = useMemo(() => marcasView(res, f, f.comparar), [res, f]);
  const sov = useMemo(() => shareOfVoice(res, f, f.comparar), [res, f]);
  const vr = useMemo(() => view(res, { ...f, segmento: 'relevantes' }), [res, f]);
  const vt = useMemo(() => view(res, { ...f, segmento: 'todas' }), [res, f]);
  const k = res.umbral;
  const rango = vt.desde && vt.hasta ? rangeLabel(vt.desde, vt.hasta) : rangeLabel(f.desde, f.hasta);

  if (!tieneBaseMaestra(res))
    return (
      <div className="space-y-10">
        <Pending estado="analisis" titulo={benchmark.pendiente} detalle={benchmark.limitacion} />
        <References />
      </div>
    );

  const valor = (n) => (n == null ? `< ${k}` : formatNumber(n));

  return (
    <div className="space-y-14">
      <FilterBar campos={['periodo', 'comparar']} />
      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <ChartFrame
          className="lg:col-span-7"
          index="01"
          titulo="Presencia explícita de cada laboratorio"
          subtitulo={`Menciones que nombran a cada laboratorio en esta consulta · ${rango}`}
          notas={[benchmark.limitacion, `Por debajo de ${k} menciones solo se indica «< ${k}» para proteger la privacidad.`]}
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-bruma">
                <th scope="col" className="pb-2 font-normal">
                  <span className="sr-only">Laboratorio</span>
                </th>
                <th scope="col" className="eyebrow pb-2 font-medium text-rosa">
                  De {formatNumber(vr.registros)} sobre cáncer de mama
                </th>
                <th scope="col" className="eyebrow pb-2 font-medium text-rosa">
                  De {formatNumber(vt.registros)} captadas
                </th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((m) => (
                <tr key={m.id} className="border-t border-rosa/10">
                  <th scope="row" className="py-3 font-display text-[length:var(--step-1)] font-normal italic" style={{ color: m.info.color }}>
                    {m.info.nombre}
                  </th>
                  <td className="num py-3 text-marfil">{valor(m.relevantes)}</td>
                  <td className="num py-3 text-marfil">{valor(m.todas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-5"
          index="02"
          titulo="Share of Voice"
          subtitulo={sov.ok ? `${sov.dias} días comparables` : 'Solo con cobertura equivalente entre marcas'}
          pendiente={!sov.ok ? { estado: sov.motivo === 'muestra' ? 'muestra' : 'analisis', titulo: sov.motivo === 'muestra' ? `Alguna marca no alcanza ${k} menciones en el periodo.` : 'No se calcula: la consulta no captura a todas las marcas con el mismo criterio.' } : null}
        >
          {sov.ok && (
            <StackBars filas={[{ id: 'sov', nombre: 'Share of Voice', segmentos: sov.valores.map((x) => ({ id: x.id, nombre: `${entidad(x.id).nombre} ${formatPct(x.pct)}`, v: x.v, color: entidad(x.id).color })) }]} />
          )}
        </ChartFrame>

        <div className="lg:col-span-12">
          <Pending
            estado="muestra"
            titulo="Los desgloses por plataforma, sentimiento, temática y formato de cada laboratorio no se publican."
            detalle={`Cada laboratorio aparece en muy pocas menciones de esta consulta: cruzarlas con otras dimensiones dejaría grupos de menos de ${k} menciones que podrían identificar publicaciones concretas.`}
          />
        </div>

        <ChartFrame className="lg:col-span-12" index="03" titulo="Noticias y contenidos destacados" subtitulo="Evidencias públicas verificadas de los laboratorios comparados">
          <Highlights marcas={f.comparar} desde={f.desde} hasta={f.hasta} />
        </ChartFrame>
      </div>
      <References />
    </div>
  );
}
