import { useMemo } from 'react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import TimeChart, { tieneHuecos } from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import KpiRow from '../components/charts/KpiRow.jsx';
import Legend from '../components/charts/Legend.jsx';
import Pending from '../components/charts/Pending.jsx';
import ExampleCards from '../components/ExampleCards.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { FILTROS_VACIOS, MUESTRA_MINIMA, dailyTotals, serieConAporteEditorial, peaks, periodStats, relevanciaRango, view } from '../lib/data/resultados.js';
import { corteDatos, hechos } from '../lib/data/hechos.js';
import { longDate, todayBogota } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatPct } from '../lib/format.js';
import { antes } from '../content/antes.js';
import { EVENTO, RANGO_DEFECTO, PERIODO_PREVIO } from '../config/periodos.js';

export const fuenteTexto = (res, corte) =>
  res.cobertura.length
    ? `Fuente: escucha social SentiOne, menciones únicas sin filtro geográfico, datos hasta el ${longDate(corte ?? res.cobertura[res.cobertura.length - 1].hasta)}.`
    : 'Fuente: escucha social SentiOne, referencia preliminar de la exportación del 21 de septiembre al 20 de octubre de 2026, sin filtro geográfico.';

/** Anotaciones editoriales sobre la serie: picos temáticos y, opcionalmente, el ruido del universo. */
export const anotacionesPicos = (res, { ruido = false, relevantes = true } = {}) =>
  [...antes.picos, ...(ruido ? antes.ruido : [])]
    .map((p) => ({ ...p, r: relevanciaRango(res, p.desde, p.hasta) }))
    .filter((p) => p.r)
    .map((p) => ({ ...p, detalle: p.tono === 'ajeno' || !relevantes ? `${formatPct(p.r.pct)} sobre cáncer de mama` : `${formatNumber(p.r.rel)} menciones` }));

/** Capítulo 03 · Antes del concierto: comportamiento de la conversación real y de qué habla la gente. */
export default function Antes() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const relevantes = useMemo(() => view(res, { ...FILTROS_VACIOS, ...PERIODO_PREVIO }), [res]);
  const todas = useMemo(() => view(res, { ...FILTROS_VACIOS, ...PERIODO_PREVIO, segmento: 'todas' }), [res]);
  const octubre = useMemo(() => dailyTotals(res, { ...FILTROS_VACIOS, ...RANGO_DEFECTO }), [res]);
  const visual = useMemo(() => serieConAporteEditorial(res, { ...FILTROS_VACIOS, ...RANGO_DEFECTO }), [res]);
  const { escenas } = antes;
  const clasificado = todas.clasificados >= MUESTRA_MINIMA && relevantes.registros > 0;
  const cortePrevio = corteDatos({ ...res, cobertura: res.cobertura.filter(c => c.desde <= PERIODO_PREVIO.hasta).map(c => ({ ...c, hasta: c.hasta > PERIODO_PREVIO.hasta ? PERIODO_PREVIO.hasta : c.hasta })) });
  const fuente = fuenteTexto(res);
  const stats = periodStats(res, { ...FILTROS_VACIOS, ...RANGO_DEFECTO });
  const maximo = peaks(octubre)[0];
  const vol = { disponible: !!stats, stats, maximo, texto: stats ? `${formatNumber(stats.total)} menciones relevantes en ${stats.diasConDatos} días completos de octubre. Los días sin cobertura permanecen pendientes.` : null };
  const serie = clasificado ? octubre : dailyTotals(res, { ...RANGO_DEFECTO, segmento: 'todas' });

  return (
    <section id="antes" aria-labelledby="antes-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={antes.capitulo} titulo={antes.titulo} entradilla={antes.entradilla} tituloId="antes-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-6">
        <Scene index="03.1" kicker={escenas.volumen.kicker} titulo={escenas.volumen.titulo} lead={vol.disponible ? vol.texto : null} conclusion={maximo ? `El mayor volumen observado en octubre corresponde al ${longDate(maximo.d)}: ${formatNumber(maximo.v)} menciones relevantes.` : null}>
          {clasificado && vol.stats && (
            <KpiRow
              items={[
                { id: 'total', etiqueta: 'Sobre cáncer de mama', valor: vol.stats.total, detalle: `${vol.stats.diasConDatos} días con datos` },
                { id: 'promedio', etiqueta: 'Promedio diario', valor: vol.stats.promedioDiario, formato: formatDecimal, detalle: `Mediana ${formatDecimal(vol.stats.mediana)}` },
                { id: 'pico', etiqueta: 'Día pico', valor: vol.maximo?.v ?? null, tono: 'text-fucsia', detalle: vol.maximo ? longDate(vol.maximo.d) : null },
              ]}
            />
          )}
          <div className="mt-8">
            <Legend
              className="mb-3"
              items={[
                { label: 'Conversación identificada', color: '#F4A6C4' },
                { label: 'Día pico', color: '#E2457F' },
                ...(tieneHuecos([{ puntos: serie }]) ? [{ label: 'Aún sin datos', tipo: 'vacio' }] : []),
              ]}
            />
            <TimeChart
              series={[{ id: 'rel', nombre: clasificado ? 'Sobre cáncer de mama' : 'Menciones', color: '#F4A6C4', puntos: serie }]}
              apilados={clasificado ? visual.apilados : []}
              picos={peaks(serie).slice(0, 1)}
              marcadores={[{ d: EVENTO.fecha, etiqueta: '24 OCT · CONCIERTO DE FONSECA', destacado: true }]}
              etiquetasPico={!clasificado}
              anotaciones={clasificado ? anotacionesPicos(res) : []}
              unidad={clasificado ? 'menciones sobre cáncer de mama' : 'menciones'}
              alto={240}
              descripcion={`${escenas.volumen.serie} del 1 al 31 de octubre de 2026; días sin cobertura pendientes. ${visual.apilados.length ? 'El 24 destaca 28 referencias identificadas alrededor del concierto, un indicador del evento distinto del volumen temático diario.' : 'Las referencias del concierto se presentan en el capítulo 04.'}`}
            />
            <p className="mt-4 max-w-3xl text-xs leading-relaxed text-bruma/80">
              Serie temática de octubre. {visual.apilados.length ? 'El 24 destaca 28 referencias identificadas alrededor del concierto, un indicador del evento distinto del volumen temático diario. ' : 'Las referencias del concierto se presentan en el capítulo 04. '}Los KPIs resumen exclusivamente menciones sobre cáncer de mama. {fuente}
            </p>
          </div>
        </Scene>

        <Scene
          index="03.2"
          kicker={escenas.tono.kicker}
          titulo={escenas.tono.titulo}
          lead={h.temas.disponible ? h.temas.texto : null}
          conclusion={h.sentimiento.disponible ? h.sentimiento.texto : null}
          cta={<ExploreLink tab="conversacion">Explorar plataformas, emociones e intenciones</ExploreLink>}
        >
          {clasificado ? (
            <>
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="eyebrow mb-4 text-bruma">Temáticas · % de {formatNumber(relevantes.registros)} menciones</p>
                  <BarList items={relevantes.temas.items.slice(0, 5)} total={relevantes.registros} unidad="menciones sobre cáncer de mama" color="#E2457F" />
                </div>
                <div className="lg:col-span-5">
                  <p className="eyebrow mb-4 text-bruma">Tono hacia el tema</p>
                  <Legend className="mb-3" items={relevantes.sentimiento.items.map((s) => ({ label: s.nombre, color: s.color }))} />
                  <StackBars filas={[{ id: 'sent', nombre: `${formatNumber(relevantes.registros)} menciones sobre cáncer de mama`, segmentos: relevantes.sentimiento.items }]} />
                  {h.preocupaciones.disponible && <p className="text-sm text-bruma">{h.preocupaciones.texto}</p>}
                </div>
              </div>
              <div className="mt-10">
                <p className="eyebrow mb-4 text-rosa">{antes.ejemplos.titulo}</p>
                <ExampleCards tarjetas={antes.ejemplos.tarjetas} patrones={h.ejemplos.patrones} umbral={res.umbral} />
                <p className="mt-3 max-w-3xl text-xs text-bruma/80">{antes.ejemplos.aviso}</p>
              </div>
            </>
          ) : (
            <Pending compacto estado="analisis" titulo={escenas.tono.pendiente} />
          )}
          <p className="mt-6 max-w-3xl text-xs text-bruma/80">{antes.alcance(cortePrevio)}</p>
        </Scene>
      </div>
    </section>
  );
}
