import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import TimeChart, { tieneHuecos } from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import KpiRow from '../components/charts/KpiRow.jsx';
import Pending from '../components/charts/Pending.jsx';
import RelevanceCompare from '../components/charts/RelevanceCompare.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { useFilters, useResultados } from '../state/DataContext.jsx';
import { ESTADOS_RESTO, serieConAporteEditorial, dailyTotals, growth, notasPrivacidad, relevanciaDia, view } from '../lib/data/resultados.js';
import { daysBetween, longDate, rangeLabel, shortDate } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatPct } from '../lib/format.js';
import { EVENTO } from '../config/periodos.js';
import { anotacionesPicos, fuenteTexto } from '../sections/Antes.jsx';

const ANALISIS = 'El análisis por contenido (temáticas, emociones, intenciones y sentimiento hacia el sistema de salud) se incorporará en la próxima actualización de resultados.';
const SOLO_RELEVANTES = 'Se mide solo en las menciones que hablan de cáncer de mama. Elige «Sobre cáncer de mama» en los filtros.';

export default function ConversationDashboard() {
  const res = useResultados();
  const { filtros: f } = useFilters();
  const v = useMemo(() => view(res, f), [res, f]);
  const vt = useMemo(() => (v.segmento === 'todas' ? v : view(res, { ...f, segmento: 'todas' })), [res, f, v]);
  const g = useMemo(() => growth(res, f), [res, f]);
  const todasDias = useMemo(() => dailyTotals(res, { ...f, segmento: 'todas' }), [res, f]);
  const relDias = useMemo(() => dailyTotals(res, { ...f, segmento: 'relevantes' }), [res, f]);
  const rel = v.segmento === 'relevantes';
  const k = v.umbral;
  const rango = rangeLabel(f.desde, f.hasta);
  const fuente = fuenteTexto(res);
  const semantico = vt.clasificados > 0 && vt.relevancia.si > 0;
  const grupo = rel ? 'menciones sobre cáncer de mama' : 'menciones captadas';
  const bloques = (res.base?.bloques ?? [])
    .filter((b) => b.desde >= f.desde && b.hasta <= f.hasta && !res.cobertura.length && !rel)
    .map((b) => ({ ...b, promedio: b.total / daysBetween(b.desde, b.hasta), etiqueta: `${shortDate(b.desde)}–${shortDate(b.hasta)}: solo total` }));
  const distRango = v.desde && v.hasta ? rangeLabel(v.desde, v.hasta) : rango;

  const kpis = [
    { id: 'total', etiqueta: rel ? 'Sobre cáncer de mama' : 'Menciones captadas', valor: v.stats?.total ?? null, detalle: v.stats ? `${v.stats.diasConDatos} días con datos` : 'Sin datos en el rango', pendiente: 'Sin datos' },
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
  const resto = ESTADOS_RESTO.map((e) => ({ ...e, v: vt.relevancia[e.id] })).filter((e) => e.v);
  const restoAgrupado = ESTADOS_RESTO.some((e) => vt.relevancia[e.id] == null) && vt.relevancia.resto;

  return (
    <div className="space-y-14">
      <FilterBar />
      <KpiRow items={kpis} />
      <p className="max-w-3xl text-sm text-bruma">
        {rel
          ? `Vista principal: solo las menciones que, leídas por contenido, hablan de cáncer de mama. Son menciones, no personas alcanzadas.`
          : `Vista de contexto: todo lo que captó la consulta, incluidas coincidencias ajenas al tema. Son menciones, no personas alcanzadas.`}
        {res.totales.revisar ? ` ${formatNumber(res.totales.revisar)} de ${formatNumber(res.totales.clasificados)} clasificaciones de la base tienen confianza baja y quedan sujetas a revisión.` : ''}
      </p>

      <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
        {semantico && (
          <ChartFrame
            className="lg:col-span-12"
            index="01"
            titulo="Lo captado frente a la conversación real"
            subtitulo={`Metodología: qué parte de lo que capta la consulta habla de cáncer de mama · ${distRango}`}
            notas={[...v.notas, 'Las barras son proporcionales a lo captado; el porcentaje se calcula sobre las menciones ya clasificadas por contenido.']}
            fuente={fuente}
          >
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <RelevanceCompare captadas={vt.universo} clasificadas={vt.clasificados} relevantes={vt.relevancia.si} rango={distRango} />
              </div>
              <div className="lg:col-span-7">
                <p className="eyebrow mb-4 text-bruma">El resto de lo captado</p>
                <StackBars filas={[{ id: 'resto', nombre: 'Excluidas de la medición principal', segmentos: restoAgrupado ? [{ id: 'resto', nombre: 'Ruido, contextuales o sin clasificar', v: vt.relevancia.resto, color: '#5E4457' }] : resto }]} />
                <p className="text-sm text-bruma">Contextuales: el cáncer de mama aparece, pero el tema principal es otro (una figura política, un informe de gobierno, una reacción sin contenido propio). Ruido: no aporta información sobre la enfermedad; se concentra en la reacción política del 3 al 5 de octubre.</p>
              </div>
            </div>
          </ChartFrame>
        )}

        <ChartFrame
          className="lg:col-span-12"
          index="02"
          titulo="Evolución diaria"
          subtitulo={semantico ? (rel ? `Menciones sobre cáncer de mama por día · ${rango}` : `Menciones captadas y sobre cáncer de mama por día · ${rango}`) : `Menciones por día · ${rango}`}
          leyenda={[
            ...(semantico && rel
              ? [
                  { label: 'Sobre cáncer de mama', color: '#F4A6C4' },
                  { label: 'Día pico', color: '#E2457F' },
                ]
              : semantico
              ? [
                  { label: 'Todo lo captado', color: 'rgba(244,166,196,0.35)' },
                  { label: 'Sobre cáncer de mama', color: '#E2457F' },
                ]
              : [
                  { label: 'Menciones', color: '#F4A6C4' },
                  { label: 'Pico', color: '#E2457F' },
                ]),
            ...(tieneHuecos([{ puntos: todasDias }]) ? [{ label: 'Sin datos', tipo: 'vacio' }] : []),
            ...(bloques.length ? [{ label: 'Periodo con solo total', color: '#F4A6C4', tipo: 'punteada' }] : []),
          ]}
          fuente={fuente}
          pendiente={!vt.stats ? { estado: 'sin_datos', titulo: 'No hay menciones para este periodo.' } : null}
        >
          {semantico && rel ? (
            <TimeChart
              series={[{ id: 'rel', nombre: 'Sobre cáncer de mama', color: '#F4A6C4', puntos: relDias }]}
              apilados={serieConAporteEditorial(res, { ...f, segmento: 'relevantes' }).apilados}
              picos={v.picos.slice(0, 1)}
              etiquetasPico={false}
              anotaciones={anotacionesPicos(res)}
              marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]}
              unidad="menciones sobre cáncer de mama"
              descripcion={`Menciones sobre cáncer de mama por día, ${rango}; el 24 muestra 28 referencias del concierto.`}
            />
          ) : semantico ? (
            <TimeChart
              tipo="superpuestas"
              series={[
                { id: 'todas', nombre: 'Todo lo captado', color: 'rgba(244,166,196,0.35)', puntos: todasDias },
                { id: 'rel', nombre: 'Sobre cáncer de mama', color: '#E2457F', puntos: relDias },
              ]}
              anotaciones={anotacionesPicos(res, { ruido: true, relevantes: false })}
              marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]}
              unidad="menciones"
              descripcion={`Menciones captadas y sobre cáncer de mama por día, ${rango}.`}
            />
          ) : (
            <TimeChart series={[{ id: 'm', nombre: 'Menciones', color: '#F4A6C4', puntos: todasDias }]} picos={vt.picos} bloques={bloques} marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]} unidad="menciones" descripcion={`Menciones por día, ${rango}.`} />
          )}
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="03" titulo="Picos de conversación" subtitulo={`Días con 1,5 veces el promedio o más · ${grupo}`} pendiente={!v.picos.length ? { estado: 'sin_datos', titulo: 'No hay picos en este periodo.' } : null}>
          <ol className="space-y-3">
            {v.picos.map((p, i) => {
              const r = relevanciaDia(res, p.d);
              return (
                <li key={p.d} className="flex items-baseline gap-4 border-b border-rosa/10 pb-3">
                  <span className="eyebrow num w-6 text-fucsia">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1">
                    <span className="block font-display text-[length:var(--step-1)] italic text-marfil">{longDate(p.d)}</span>
                    {!rel && r && <span className="text-xs text-bruma">{formatPct(r.pct)} de {formatNumber(r.cl)} clasificadas habla de cáncer de mama</span>}
                  </span>
                  <span className="display num text-[length:var(--step-2)] text-rosa">{formatNumber(p.v)}</span>
                </li>
              );
            })}
          </ol>
        </ChartFrame>

        <ChartFrame className="lg:col-span-7" index="04" titulo="Plataformas" subtitulo={`% de ${formatNumber(v.registros)} ${grupo} · ${distRango}`} notas={[...notasPrivacidad(v.plataformas, k), !rel && 'En todo lo captado, video y Facebook concentran sobre todo comentarios ajenos al tema.']} fuente={fuente} pendiente={!v.plataformas.items.length ? { estado: 'sin_datos', titulo: 'Sin datos para este periodo.' } : null}>
          <BarList items={v.plataformas.items} total={v.registros} unidad={grupo} />
        </ChartFrame>

        {!semantico ? (
          <div className="lg:col-span-12">
            <Pending estado="analisis" titulo={ANALISIS} />
          </div>
        ) : !rel ? (
          <div className="lg:col-span-12">
            <Pending estado="muestra" titulo={SOLO_RELEVANTES} detalle="Sentimiento, temáticas, emociones, intenciones y hashtags no se publican para las coincidencias ajenas al tema." />
          </div>
        ) : (
          <>
            <ChartFrame
              className="lg:col-span-12"
              index="05"
              titulo="Tono hacia el tema"
              subtitulo={`Sentimiento por contenido · % de ${formatNumber(v.registros)} menciones sobre cáncer de mama · no mide favorabilidad hacia MSD`}
              leyenda={v.sentimiento.items.map((s) => ({ label: s.nombre, color: s.color }))}
              notas={notasPrivacidad(v.sentimiento, k)}
              fuente={fuente}
              pendiente={!v.sentimiento.items.length ? { estado: 'muestra', titulo: `Menos de ${k} menciones en el periodo.` } : null}
            >
              <StackBars filas={[{ id: 's', nombre: 'Menciones sobre cáncer de mama', segmentos: v.sentimiento.items }]} />
            </ChartFrame>
            <ChartFrame className="lg:col-span-7" index="06" titulo="Temáticas y narrativas" subtitulo={`Una mención puede tener varias · % de ${formatNumber(v.registros)} menciones sobre cáncer de mama`} notas={notasPrivacidad(v.temas, k)} fuente={fuente}>
              <BarList items={v.temas.items} total={v.registros} unidad="menciones" color="#E2457F" />
            </ChartFrame>
            <ChartFrame className="lg:col-span-5" index="07" titulo="Emociones" subtitulo={`Emoción dominante · % de ${formatNumber(v.registros)}`} notas={notasPrivacidad(v.emociones, k)} fuente={fuente}>
              <BarList items={v.emociones.items} total={v.registros} unidad="menciones" />
            </ChartFrame>
            <ChartFrame className="lg:col-span-7" index="08" titulo="Intención de acción" subtitulo={`Intenciones expresadas en el texto · una mención puede tener varias · % de ${formatNumber(v.registros)}`} notas={notasPrivacidad(v.intenciones, k)} fuente={fuente}>
              <BarList items={v.intenciones.items} total={v.registros} unidad="menciones" color="#F2C46D" />
            </ChartFrame>
            <ChartFrame
              className="lg:col-span-5"
              index="09"
              titulo="¿Hacia quién va el sentimiento?"
              subtitulo="Solo menciones que se refieren al sistema de salud o a MSD y la campaña"
              notas={[...notasPrivacidad(v.haciaSistema, k), v.haciaSistema.incompleta || v.haciaMarca.incompleta ? `Algún grupo no alcanza ${k} menciones y no se desglosa.` : null]}
              fuente={fuente}
              pendiente={!v.haciaSistema.items.length && !v.haciaMarca.items.length ? { estado: 'muestra', titulo: `Ninguna categoría alcanza ${k} menciones que se refieran a MSD, la campaña o el sistema de salud.` } : null}
            >
              <StackBars
                filas={[
                  { id: 'sistema', nombre: 'Hacia el sistema de salud', segmentos: v.haciaSistema.items },
                  { id: 'marca', nombre: 'Hacia MSD o la campaña', segmentos: v.haciaMarca.items },
                ].filter((x) => x.segmentos.length)}
              />
            </ChartFrame>
            <ChartFrame className="lg:col-span-6" index="10" titulo="Hashtags" subtitulo={`Usados en ${k} o más menciones sobre cáncer de mama`} notas={['Los hashtags poco frecuentes no se publican.']} pendiente={!v.hashtags.items.length ? { estado: 'muestra', titulo: `Ningún hashtag alcanza ${k} usos en este periodo.` } : null}>
              <BarList items={v.hashtags.items.slice(0, 10)} color="#E2457F" unidad="usos" mostrarPct={false} />
            </ChartFrame>
          </>
        )}

        <ChartFrame className="lg:col-span-6" index="11" titulo="Franja horaria" subtitulo={`Hora de Bogotá · % de ${formatNumber(v.registros)} ${grupo}`} notas={notasPrivacidad(v.franjas, k)} fuente={fuente} pendiente={!v.franjas.items.length ? { estado: 'muestra', titulo: `Menos de ${k} menciones en el periodo.` } : null}>
          <BarList items={v.franjas.items} total={v.registros} unidad={grupo} />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-6"
          index="12"
          titulo="Marcas y campañas mencionadas"
          subtitulo={`Presencia explícita en esta consulta · ${grupo}`}
          notas={[...notasPrivacidad(v.marcas, k), 'No es un Share of Voice: la consulta no captura a cada marca con el mismo criterio.']}
          fuente={fuente}
          pendiente={!v.marcas.items.length ? { estado: 'muestra', titulo: v.marcas.menores.length ? `Presentes con menos de ${k} menciones: ${v.marcas.menores.join(', ')}.` : 'No hay menciones explícitas de marcas en este periodo.' } : null}
        >
          <BarList items={v.marcas.items} total={v.registros} unidad="menciones" />
        </ChartFrame>

        {v.interacciones && (
          <ChartFrame className="lg:col-span-12" index="13" titulo="Interacciones" subtitulo={`Reacciones, comentarios y compartidos registrados en ${grupo}`} notas={['Las interacciones no equivalen a personas alcanzadas.']}>
            <p className="display num text-[length:var(--step-4)] text-marfil">{formatNumber(v.interacciones.total)}</p>
            <p className="text-sm text-bruma">en {formatNumber(v.interacciones.registros)} menciones con métrica disponible</p>
          </ChartFrame>
        )}

        <ChartFrame className="lg:col-span-12" index="14" titulo="Noticias y evidencias verificadas" subtitulo="Contenidos públicos revisados">
          <Highlights desde={f.desde} hasta={f.hasta} />
        </ChartFrame>
      </div>
    </div>
  );
}
