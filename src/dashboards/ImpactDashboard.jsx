import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import PeriodBars from '../components/charts/PeriodBars.jsx';
import TimeChart from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Pending from '../components/charts/Pending.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { useFilters, useResultados } from '../state/DataContext.jsx';
import { dailyTotals, diasCubiertos, marcasView, notasPrivacidad, periodStats, view } from '../lib/data/resultados.js';
import { rangeLabel, todayBogota } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatOne } from '../lib/format.js';
import { corteDatos } from '../lib/data/hechos.js';
import { impacto } from '../content/impacto.js';
import { EVENTO, PERIODOS_IMPACTO } from '../config/periodos.js';
import { PALETA } from '../config/paleta.js';

const ATRIBUIBLE = [
  ['fonseca', 'Fonseca'],
  ['el-viaje-de-la-vida', 'El Viaje de la Vida'],
  ['msd', 'MSD'],
];

export default function ImpactDashboard() {
  const res = useResultados();
  const { filtros: f } = useFilters();
  const hoy = todayBogota();
  const hayPost = diasCubiertos(res, PERIODOS_IMPACTO[1].desde, PERIODOS_IMPACTO[2].hasta) > 0;

  const periodos = useMemo(
    () =>
      PERIODOS_IMPACTO.map((p) => {
        const fp = { ...f, desde: p.desde, hasta: p.hasta };
        const st = periodStats(res, fp);
        return { ...p, fp, st, v: st ? view(res, fp) : null, marcas: st ? marcasView(res, fp, ATRIBUIBLE.map(([id]) => id)) : null };
      }),
    [res, f],
  );
  const [antes, durante, despues] = periodos;
  const pend = (p) => ({ estado: hoy < p.desde ? 'evento' : 'medicion' });

  if (!hayPost)
    return (
      <div className="space-y-10">
        <Pending estado={hoy < EVENTO.fecha ? 'evento' : 'medicion'} titulo={impacto.pendiente.titulo} detalle={`${impacto.pendiente.texto} ${impacto.causalidad}`} />
        <ul className="grid gap-3 text-sm text-marfil sm:grid-cols-2">
          {impacto.pendiente.medira.map((m) => (
            <li key={m} className="border-l border-rosa/30 pl-3">
              {m}
            </li>
          ))}
        </ul>
      </div>
    );

  const noche = durante.v?.franjas.items.some((x) => x.id !== 'otras') ? durante.v.franjas : null;
  const rel = f.segmento === 'relevantes';
  const temasAD = rel ? [antes, despues].filter((p) => p.v?.temas.items.length) : [];
  const temasTop = [...new Set(temasAD.flatMap((p) => p.v.temas.items.slice(0, 6).map((t) => t.id)))];
  const k = res.umbral;
  const celda = (p, id) => {
    const m = p.marcas?.find((x) => x.id === id);
    if (!m) return '—';
    const n = rel ? m.relevantes : m.todas;
    return n == null ? `< ${k} en total` : formatDecimal(n / p.st.diasConDatos);
  };

  return (
    <div className="space-y-14">
      <FilterBar campos={['segmento']} />
      <p className="max-w-4xl text-sm text-bruma">{impacto.limites(corteDatos(res))} {impacto.muestra}</p>
      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <ChartFrame className="lg:col-span-12" index="01" titulo="Antes, durante y después" subtitulo={`Promedio de ${rel ? 'menciones sobre cáncer de mama' : 'menciones captadas'} por día en cada periodo`} notas={[impacto.causalidad]}>
          <PeriodBars
            periodos={periodos.map((p) => ({ id: p.id, nombre: p.nombre, rango: rangeLabel(p.desde, p.hasta), valor: p.st?.promedioDiario ?? null, detalle: p.st ? `Mediana ${formatOne(p.st.mediana)} · ${p.st.diasConDatos} de ${p.st.diasRango} días con datos` : null, pendiente: pend(p) }))}
            unidad="menciones por día"
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-7" index="02" titulo="Evolución diaria" subtitulo="17 al 31 de octubre" leyenda={[{ label: 'Menciones', color: '#F4A6C4' }, { label: 'Sin datos', tipo: 'vacio' }]}>
          <TimeChart series={[{ id: 'd', nombre: 'Menciones', color: '#F4A6C4', puntos: dailyTotals(res, { ...f, desde: '2026-10-17', hasta: '2026-10-31' }) }]} marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]} unidad="menciones" descripcion="Menciones por día del 17 al 31 de octubre de 2026." alto={240} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="03" titulo="La noche del concierto" subtitulo="Menciones del 24 de octubre por franja horaria (hora de Bogotá); la noche coincide con el concierto" notas={noche ? notasPrivacidad(noche, k) : []} pendiente={!noche ? { estado: 'muestra', titulo: `Las franjas individuales no alcanzan el umbral publicable de ${k} menciones.` } : null}>
          {noche && <BarList items={noche.items.map((x) => (x.id === 'noche' ? { ...x, color: '#E2457F' } : x))} total={durante.v.registros} unidad="menciones" />}
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04" titulo="Menciones explícitas, sin atribución causal" subtitulo="Nombrar una entidad no demuestra participación en la campaña" notas={[`Por debajo de ${k} menciones en un periodo solo se indica «< ${k}».`]}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-bruma">
                <th scope="col" className="pb-2 font-normal">
                  <span className="sr-only">Entidad</span>
                </th>
                {periodos.map((p) => (
                  <th key={p.id} scope="col" className="eyebrow pb-2 font-medium text-rosa">
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
                      {celda(p, id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="05" titulo="Interacciones registradas" subtitulo="Suma registrada en la exportación por día; no mide alcance ni participación orgánica" notas={['La cobertura de métricas varía por plataforma y publicación. No es una comparación de eficacia de campaña.']}>
          <PeriodBars
            periodos={periodos.map((p) => ({ id: p.id, nombre: p.nombre, rango: rangeLabel(p.desde, p.hasta), valor: p.v?.interacciones ? p.v.interacciones.total / p.st.diasConDatos : null, detalle: p.v?.interacciones ? `${formatNumber(p.v.interacciones.total)} en total` : null, pendiente: p.st ? { estado: 'sin_datos' } : pend(p) }))}
            unidad="interacciones por día"
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="06" titulo="Cambios narrativos" subtitulo="Temáticas principales antes y después del concierto · menciones sobre cáncer de mama" pendiente={temasAD.length < 2 ? { estado: rel ? 'analisis' : 'muestra', titulo: rel ? 'La comparación de temáticas requiere menciones clasificadas antes y después del concierto.' : 'Las temáticas solo se miden en las menciones sobre cáncer de mama.' } : null}>
          <StackBars filas={temasAD.map((p) => ({ id: p.id, nombre: p.nombre, segmentos: temasTop.map((id, i) => ({ id, nombre: p.v.temas.items.find((t) => t.id === id)?.nombre ?? id, v: p.v.temas.items.find((t) => t.id === id)?.v ?? 0, color: PALETA[i % PALETA.length] })) }))} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="07" titulo="Evidencias y captura complementaria" subtitulo="Solo referencias públicas verificadas" notas={[impacto.universos[2].texto, impacto.indicadores]}>
          <Highlights desde="2026-10-24" hasta="2026-10-31" />
        </ChartFrame>
      </div>
    </div>
  );
}
