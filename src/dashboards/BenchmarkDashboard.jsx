import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import TimeChart from '../components/charts/TimeChart.jsx';
import Pending from '../components/charts/Pending.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { References } from '../sections/Benchmark.jsx';
import { useFilters, useResultados } from '../state/DataContext.jsx';
import { marcasView, shareOfVoice, tieneBaseMaestra } from '../lib/data/resultados.js';
import { rangeLabel } from '../lib/data/dates.js';
import { formatNumber, formatPct } from '../lib/format.js';
import { benchmark } from '../content/benchmark.js';
import { entidad } from '../config/marcas.js';
import { PLATAFORMAS, SENTIMIENTOS, TEMAS } from '../config/clasificacion.js';
import { PALETA } from '../config/paleta.js';

export default function BenchmarkDashboard() {
  const res = useResultados();
  const { filtros: f } = useFilters();
  const rango = rangeLabel(f.desde, f.hasta);
  const marcas = useMemo(() => marcasView(res, f, f.comparar), [res, f]);
  const sov = useMemo(() => shareOfVoice(res, f, f.comparar), [res, f]);
  const conDatos = marcas.filter((m) => m.n > 0);

  if (!tieneBaseMaestra(res))
    return (
      <div className="space-y-10">
        <Pending estado="analisis" titulo={benchmark.pendiente} detalle={benchmark.limitacion} />
        <References />
      </div>
    );

  const filasDe = (fn) => conDatos.map((m) => ({ id: m.id, nombre: m.info.nombre, segmentos: fn(m.v) }));
  const formatos = conDatos
    .flatMap((m) =>
      PLATAFORMAS.map((p) => {
        const rows = res.cubo.filter((r) => r.d >= f.desde && r.d <= f.hasta && r.p === p.id && r.itn && (r.mc ?? []).includes(m.id));
        const n = rows.reduce((a, r) => a + r.itn, 0);
        return n ? { id: `${m.id}-${p.id}`, nombre: `${m.info.nombre} · ${p.nombre}`, v: Math.round(rows.reduce((a, r) => a + r.it, 0) / n), color: m.info.color } : null;
      }),
    )
    .filter(Boolean)
    .sort((a, b) => b.v - a.v)
    .slice(0, 10);

  return (
    <div className="space-y-14">
      <FilterBar campos={['fechas', 'comparar', 'plataformas', 'sentimiento', 'temas', 'relevancia']} />
      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <ChartFrame className="lg:col-span-7" index="01" titulo="Menciones explícitas por laboratorio" subtitulo={`Misma base de escucha social · ${rango}`} notas={[!sov.ok && benchmark.limitacion]}>
          <BarList items={marcas.map((m) => ({ id: m.id, nombre: m.info.nombre, v: m.n, color: m.info.color }))} unidad="menciones" />
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="02" titulo="Share of Voice" subtitulo={sov.ok ? `${sov.dias} días comparables` : 'Solo con cobertura equivalente entre marcas'} pendiente={!sov.ok ? { estado: 'analisis', titulo: 'No se calcula: la consulta no captura a todas las marcas con el mismo criterio.' } : null}>
          {sov.ok && (
            <StackBars filas={[{ id: 'sov', nombre: 'Share of Voice', segmentos: sov.valores.map((x) => ({ id: x.id, nombre: `${entidad(x.id).nombre} ${formatPct(x.pct)}`, v: x.v, color: entidad(x.id).color })) }]} />
          )}
        </ChartFrame>

        {conDatos.length ? (
          <>
            <ChartFrame className="lg:col-span-12" index="03" titulo="Evolución diaria" subtitulo="Menciones explícitas por día" leyenda={conDatos.map((m) => ({ label: m.info.nombre, color: m.info.color, tipo: 'linea' }))}>
              <TimeChart tipo="lineas" series={conDatos.map((m) => ({ id: m.id, nombre: m.info.nombre, color: m.info.color, puntos: m.v.dias }))} unidad="menciones" descripcion={`Menciones explícitas por día de cada laboratorio, ${rango}.`} />
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="04" titulo="Plataformas" subtitulo="Proporción de menciones por fuente" leyenda={PLATAFORMAS.map((p, i) => ({ label: p.nombre, color: PALETA[i % PALETA.length] }))}>
              <StackBars filas={filasDe((v) => PLATAFORMAS.map((p, i) => ({ id: p.id, nombre: p.nombre, v: v.plataformas.find((x) => x.id === p.id)?.v ?? 0, color: PALETA[i % PALETA.length] })))} />
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="05" titulo="Sentimiento hacia la marca" subtitulo="Solo menciones clasificadas que se refieren a cada laboratorio" leyenda={SENTIMIENTOS.map((s) => ({ label: s.nombre, color: s.color }))}>
              <StackBars filas={filasDe((v) => SENTIMIENTOS.map((s) => ({ id: s.id, nombre: s.nombre, v: v.haciaMarca.find((x) => x.id === s.id)?.v ?? 0, color: s.color })))} />
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="06" titulo="Temáticas por marca" subtitulo="Temáticas de las menciones clasificadas" leyenda={TEMAS.map((t, i) => ({ label: t.nombre, color: PALETA[i % PALETA.length] }))}>
              <StackBars filas={filasDe((v) => TEMAS.map((t, i) => ({ id: t.id, nombre: t.nombre, v: v.temas.find((x) => x.id === t.id)?.v ?? 0, color: PALETA[i % PALETA.length] })))} />
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="07" titulo="Formatos que generan interacciones" subtitulo="Interacciones promedio por mención con métrica" pendiente={!formatos.length ? { estado: 'sin_datos', titulo: 'No hay interacciones registradas para estas marcas.' } : null}>
              <BarList items={formatos} unidad="interacciones promedio" mostrarPct={false} />
            </ChartFrame>
            <ChartFrame className="lg:col-span-12" index="08" titulo="Campañas y hashtags" subtitulo="Hashtags más usados en las menciones de cada laboratorio">
              <div className="grid gap-8 sm:grid-cols-3">
                {conDatos.map((m) => (
                  <div key={m.id}>
                    <p className="eyebrow mb-3" style={{ color: m.info.color }}>
                      {m.info.nombre}
                    </p>
                    {m.v.hashtags.length ? <BarList items={m.v.hashtags.slice(0, 5)} color={m.info.color} mostrarPct={false} unidad="usos" /> : <p className="text-sm text-bruma">Sin hashtags recurrentes.</p>}
                  </div>
                ))}
              </div>
            </ChartFrame>
          </>
        ) : (
          <div className="lg:col-span-12">
            <Pending estado="sin_datos" titulo={`No hay menciones explícitas de los laboratorios elegidos entre ${formatNumber(res.totales.unicos)} menciones de la base. Esto no implica ausencia de conversación pública de cada marca.`} />
          </div>
        )}

        <ChartFrame className="lg:col-span-12" index="09" titulo="Noticias y contenidos destacados" subtitulo="Evidencias públicas verificadas de los laboratorios comparados">
          <Highlights marcas={f.comparar} desde={f.desde} hasta={f.hasta} />
        </ChartFrame>
      </div>
      <References />
    </div>
  );
}
