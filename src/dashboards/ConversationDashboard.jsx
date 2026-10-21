import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import TimeChart, { tieneHuecos } from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Heatmap from '../components/charts/Heatmap.jsx';
import KpiRow from '../components/charts/KpiRow.jsx';
import Pending from '../components/charts/Pending.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { useFilters, useResultados } from '../state/DataContext.jsx';
import { growth, tieneBaseMaestra, view } from '../lib/data/resultados.js';
import { daysBetween, longDate, rangeLabel, shortDate } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatPct } from '../lib/format.js';
import { EVENTO } from '../config/periodos.js';
import { fuenteTexto } from '../sections/Antes.jsx';

const ANALISIS = 'El análisis por contenido (temáticas, emociones, intenciones y sentimiento hacia marcas y sistema de salud) se incorporará en la próxima actualización de resultados.';
const DETALLE = 'El detalle por hora, hashtags, marcas e interacciones se incorporará en la próxima actualización de resultados.';

export default function ConversationDashboard() {
  const res = useResultados();
  const { filtros: f } = useFilters();
  const v = useMemo(() => view(res, f), [res, f]);
  const g = useMemo(() => growth(res, f), [res, f]);
  const rango = rangeLabel(f.desde, f.hasta);
  const fuente = fuenteTexto(res);
  const detalle = tieneBaseMaestra(res);
  const semantico = v.clasificados > 0;
  const bloques = (res.base?.bloques ?? [])
    .filter((b) => b.desde >= f.desde && b.hasta <= f.hasta && !res.cobertura.length)
    .map((b) => ({ ...b, promedio: b.total / daysBetween(b.desde, b.hasta), etiqueta: `${shortDate(b.desde)}–${shortDate(b.hasta)}: solo total` }));

  const kpis = [
    { id: 'total', etiqueta: 'Menciones', valor: v.stats?.total ?? null, detalle: v.stats ? `${v.stats.diasConDatos} días con datos` : 'Sin datos en el rango', pendiente: 'Sin datos' },
    { id: 'promedio', etiqueta: 'Promedio diario', valor: v.stats?.promedioDiario ?? null, formato: formatDecimal, detalle: v.stats?.mediana != null ? `Mediana ${formatDecimal(v.stats.mediana)}` : null, pendiente: 'Sin datos' },
    { id: 'pico', etiqueta: 'Día pico', valor: v.picos[0]?.v ?? null, tono: 'text-fucsia', detalle: v.picos[0] ? longDate(v.picos[0].d) : null, pendiente: 'Sin picos' },
    {
      id: 'crecimiento',
      etiqueta: 'Frente al periodo anterior',
      valor: g.ok ? g.pct : null,
      formato: (n) => formatPct(n, true),
      tono: 'text-rosa',
      pendiente: 'Sin periodo comparable',
      detalle: g.ok ? `Promedio diario ${rangeLabel(g.actual.desde, g.actual.hasta)} frente a ${rangeLabel(g.anterior.desde, g.anterior.hasta)}` : null,
    },
  ];
  const hacia = [
    { id: 'marca', nombre: 'Hacia MSD o la campaña', items: v.haciaMarca },
    { id: 'sistema', nombre: 'Hacia el sistema de salud', items: v.haciaSistema },
  ].filter((x) => x.items.length);

  return (
    <div className="space-y-14">
      <FilterBar />
      <KpiRow items={kpis} />
      {semantico && (
        <p className="text-sm text-bruma">
          {formatNumber(v.clasificados)} de {formatNumber(v.registros)} menciones del filtro están clasificadas por contenido
          {v.revisar ? ` (${formatNumber(v.revisar)} con clasificación de baja certeza)` : ''}.
        </p>
      )}

      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <ChartFrame
          className="lg:col-span-12"
          index="01"
          titulo="Evolución diaria"
          subtitulo={`Menciones por día · ${rango}`}
          leyenda={[
            { label: 'Menciones', color: '#F4A6C4' },
            { label: 'Pico', color: '#E2457F' },
            ...(tieneHuecos([{ puntos: v.dias }]) ? [{ label: 'Sin datos', tipo: 'vacio' }] : []),
            ...(bloques.length ? [{ label: 'Periodo con solo total', color: '#F4A6C4', tipo: 'punteada' }] : []),
          ]}
          notas={v.notas}
          fuente={fuente}
          pendiente={!v.stats ? { estado: 'sin_datos', titulo: 'No hay menciones para este rango y estos filtros.' } : null}
        >
          <TimeChart series={[{ id: 'm', nombre: 'Menciones', color: '#F4A6C4', puntos: v.dias }]} picos={v.picos} bloques={bloques} marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]} unidad="menciones" descripcion={`Menciones por día, ${rango}.`} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="02" titulo="Picos de conversación" subtitulo="Días con 1,5 veces el promedio o más" pendiente={!v.picos.length ? { estado: 'sin_datos', titulo: 'No hay picos en este rango.' } : null}>
          <ol className="space-y-3">
            {v.picos.map((p, i) => (
              <li key={p.d} className="flex items-baseline gap-4 border-b border-rosa/10 pb-3">
                <span className="eyebrow num w-6 text-fucsia">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-display text-[length:var(--step-1)] italic text-marfil">{longDate(p.d)}</span>
                <span className="display num text-[length:var(--step-2)] text-rosa">{formatNumber(p.v)}</span>
              </li>
            ))}
          </ol>
        </ChartFrame>

        <ChartFrame className="lg:col-span-7" index="03" titulo="Plataformas" subtitulo={`Menciones por tipo de fuente · ${rango}`} fuente={fuente} pendiente={!v.plataformas.length ? { estado: 'sin_datos', titulo: 'Sin datos para este filtro.' } : null}>
          <BarList items={v.plataformas} unidad="menciones" />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-12"
          index="04"
          titulo={f.tipoSentimiento === 'original' ? 'Sentimiento según SentiOne' : 'Sentimiento por contenido'}
          subtitulo={f.tipoSentimiento === 'original' ? 'Clasificación automática original, como referencia' : 'Positivo, negativo, neutral, mixto o indeterminado según el contenido de cada mención'}
          leyenda={v.sentimiento.map((s) => ({ label: s.nombre, color: s.color }))}
          fuente={fuente}
          pendiente={!v.sentimiento.length ? { estado: 'sin_datos', titulo: 'Sin datos para este filtro.' } : null}
        >
          <StackBars filas={[{ id: 's', nombre: 'Menciones', segmentos: v.sentimiento.map((s) => ({ id: s.id, nombre: s.nombre, v: s.v, color: s.color })) }]} />
        </ChartFrame>

        {semantico ? (
          <>
            <ChartFrame className="lg:col-span-7" index="05" titulo="Temáticas y narrativas" subtitulo="Una mención puede tener varias temáticas · % de las menciones clasificadas" fuente={fuente}>
              <BarList items={v.temas} total={v.clasificados} unidad="menciones" color="#E2457F" />
            </ChartFrame>
            <ChartFrame className="lg:col-span-5" index="06" titulo="Emociones" subtitulo="Emoción dominante de cada mención clasificada" fuente={fuente}>
              <BarList items={v.emociones} total={v.clasificados} unidad="menciones" />
            </ChartFrame>
            <ChartFrame className="lg:col-span-7" index="07" titulo="Intención de acción" subtitulo="Intenciones expresadas en el texto · una mención puede tener varias" fuente={fuente}>
              <BarList items={v.intenciones} total={v.clasificados} unidad="menciones" color="#F2C46D" />
            </ChartFrame>
            <ChartFrame className="lg:col-span-5" index="08" titulo="¿Hacia quién va el sentimiento?" subtitulo="Solo menciones que se refieren a cada objeto" fuente={fuente} pendiente={!hacia.length ? { estado: 'sin_datos', titulo: 'Ninguna mención del filtro se refiere a MSD, la campaña o el sistema de salud.' } : null}>
              <StackBars filas={hacia.map((x) => ({ id: x.id, nombre: x.nombre, segmentos: x.items.map((s) => ({ id: s.id, nombre: s.nombre, v: s.v, color: s.color })) }))} />
            </ChartFrame>
          </>
        ) : (
          <div className="lg:col-span-12">
            <Pending estado="analisis" titulo={ANALISIS} />
          </div>
        )}

        {detalle ? (
          <>
            <ChartFrame className="lg:col-span-12" index="09" titulo="Volumen por día y hora" subtitulo="Menciones por franja de una hora (hora de Bogotá)" notas={[v.horario?.sinHora ? `${formatNumber(v.horario.sinHora)} menciones sin hora no aparecen aquí.` : null]} pendiente={!v.horario ? { estado: 'sin_datos', titulo: 'No hay menciones con hora para este filtro.' } : null}>
              {v.horario && <Heatmap filas={v.horario.filas} max={v.horario.max} resaltar={{ d: EVENTO.fecha, ...EVENTO.horas }} />}
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="10" titulo="Marcas y campañas mencionadas" subtitulo="Menciones explícitas · una mención puede nombrar varias" fuente={fuente} pendiente={!v.marcas.length ? { estado: 'sin_datos', titulo: 'No hay menciones explícitas de marcas en este filtro.' } : null}>
              <BarList items={v.marcas} total={v.registros} unidad="menciones" />
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="11" titulo="Hashtags" subtitulo="Hashtags usados en al menos dos menciones" notas={[!v.hashtagsFiltrables && 'Los hashtags se filtran por fecha y plataforma.']} pendiente={!v.hashtags.length ? { estado: 'sin_datos', titulo: 'Sin hashtags recurrentes en este rango.' } : null}>
              <BarList items={v.hashtags} color="#E2457F" unidad="usos" mostrarPct={false} />
            </ChartFrame>
            {v.interacciones && (
              <ChartFrame className="lg:col-span-12" index="12" titulo="Interacciones" subtitulo="Reacciones, comentarios y compartidos registrados">
                <p className="display num text-[length:var(--step-4)] text-marfil">{formatNumber(v.interacciones.total)}</p>
                <p className="text-sm text-bruma">en {formatNumber(v.interacciones.registros)} menciones con métrica disponible</p>
              </ChartFrame>
            )}
          </>
        ) : (
          <div className="lg:col-span-12">
            <Pending estado="analisis" titulo={DETALLE} />
          </div>
        )}

        <ChartFrame className="lg:col-span-12" index="13" titulo="Noticias y evidencias verificadas" subtitulo="Contenidos públicos revisados">
          <Highlights desde={f.desde} hasta={f.hasta} />
        </ChartFrame>
      </div>
    </div>
  );
}
