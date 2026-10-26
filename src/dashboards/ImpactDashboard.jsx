import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import PeriodBars from '../components/charts/PeriodBars.jsx';
import TimeChart from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Pending from '../components/charts/Pending.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import UniversosConcierto from '../components/UniversosConcierto.jsx';
import CampanaDetalle from '../components/CampanaDetalle.jsx';
import { estadoComplementarias } from '../lib/data/campana-resultados.js';
import { useFilters, useResultados } from '../state/DataContext.jsx';
import { dailyTotals, diasCubiertos, notasPrivacidad, periodStats, view } from '../lib/data/resultados.js';
import { rangeLabel, todayBogota } from '../lib/data/dates.js';
import { formatNumber, formatOne } from '../lib/format.js';
import { corteDatos } from '../lib/data/hechos.js';
import { impacto } from '../content/impacto.js';
import { EVENTO, PERIODOS_IMPACTO } from '../config/periodos.js';
import { PALETA } from '../config/paleta.js';

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
        return { ...p, fp, st, v: st ? view(res, fp) : null };
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


  return (
    <div className="space-y-14">
      <UniversosConcierto />
      <CampanaDetalle />
      <p className="eyebrow text-rosa">{rel ? 'Detalle de la conversación temática · no son métricas de campaña' : 'Contexto de toda la captura · no son métricas de campaña'}</p>
      <FilterBar campos={['segmento']} />
      <p className="max-w-4xl text-sm text-bruma">{impacto.limites(corteDatos(res))} {impacto.muestra}</p>
      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <ChartFrame className="lg:col-span-12" index="01" titulo={rel ? 'La causa: antes, durante y después' : 'Contexto captado: antes, durante y después'} subtitulo={`Promedio de ${rel ? 'menciones sobre cáncer de mama' : 'menciones captadas'} por día en cada periodo`} notas={[impacto.causalidad]}>
          <PeriodBars
            periodos={periodos.map((p) => ({ id: p.id, nombre: p.nombre, rango: rangeLabel(p.desde, p.hasta), valor: p.st?.promedioDiario ?? null, detalle: p.st ? `Mediana ${formatOne(p.st.mediana)} · ${p.st.diasConDatos} de ${p.st.diasRango} días con datos` : null, pendiente: pend(p) }))}
            unidad="menciones por día"
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-7" index="02" titulo="Evolución diaria" subtitulo="17 al 31 de octubre" leyenda={[{ label: 'Menciones', color: '#F4A6C4' }, { label: 'Sin datos', tipo: 'vacio' }]}>
          <TimeChart series={[{ id: 'd', nombre: 'Menciones', color: '#F4A6C4', puntos: dailyTotals(res, { ...f, desde: '2026-10-17', hasta: '2026-10-31' }) }]} marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]} unidad="menciones" descripcion="Menciones por día del 17 al 31 de octubre de 2026." alto={240} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="03" titulo={rel ? 'La causa por franja horaria del 24' : 'Contexto captado por franja horaria del 24'} subtitulo="Conversación temática en horas interpretadas como Bogotá; no identifica participación en el evento" notas={noche ? notasPrivacidad(noche, k) : []} pendiente={!noche ? { estado: 'muestra', titulo: `Las franjas individuales no alcanzan el umbral publicable de ${k} menciones.` } : null}>
          {noche && <BarList items={noche.items.map((x) => (x.id === 'noche' ? { ...x, color: '#E2457F' } : x))} total={durante.v.registros} unidad="menciones" />}
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="05" titulo={rel ? 'Interacciones de la conversación temática' : 'Interacciones del contexto captado'} subtitulo="Suma registrada en la exportación por día; no mide alcance ni participación orgánica" notas={['La cobertura de métricas varía por plataforma y publicación. No es una comparación de eficacia de campaña.']}>
          <PeriodBars
            periodos={periodos.map((p) => ({ id: p.id, nombre: p.nombre, rango: rangeLabel(p.desde, p.hasta), valor: p.v?.interacciones ? p.v.interacciones.total / p.st.diasConDatos : null, detalle: p.v?.interacciones ? `${formatNumber(p.v.interacciones.total)} en total` : null, pendiente: p.st ? { estado: 'sin_datos' } : pend(p) }))}
            unidad="interacciones por día"
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="06" titulo="Cambios narrativos" subtitulo="Temáticas principales antes y después del concierto · menciones sobre cáncer de mama" pendiente={temasAD.length < 2 ? { estado: rel ? 'analisis' : 'muestra', titulo: rel ? 'La comparación de temáticas requiere menciones clasificadas antes y después del concierto.' : 'Las temáticas solo se miden en las menciones sobre cáncer de mama.' } : null}>
          <StackBars filas={temasAD.map((p) => ({ id: p.id, nombre: p.nombre, segmentos: temasTop.map((id, i) => ({ id, nombre: p.v.temas.items.find((t) => t.id === id)?.nombre ?? id, v: p.v.temas.items.find((t) => t.id === id)?.v ?? 0, color: PALETA[i % PALETA.length] })) }))} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="07" titulo="Publicaciones de la iniciativa" subtitulo="Solo referencias públicas verificadas" notas={[estadoComplementarias(res), impacto.indicadores]}>
          <Highlights desde="2026-10-24" hasta="2026-10-31" />
        </ChartFrame>
      </div>
    </div>
  );
}
