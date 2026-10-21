import { useMemo } from 'react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import TimeChart, { tieneHuecos } from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Legend from '../components/charts/Legend.jsx';
import Pending from '../components/charts/Pending.jsx';
import RelevanceCompare from '../components/charts/RelevanceCompare.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { FILTROS_VACIOS, MUESTRA_MINIMA, dailyTotals, relevanciaRango, view } from '../lib/data/resultados.js';
import { hechos, rangoTexto } from '../lib/data/hechos.js';
import { longDate, todayBogota } from '../lib/data/dates.js';
import { formatNumber, formatPct } from '../lib/format.js';
import { antes } from '../content/antes.js';
import { EVENTO, PERIODO_PREVIO, RANGO_DEFECTO } from '../config/periodos.js';

export const fuenteTexto = (res) =>
  res.cobertura.length
    ? `Fuente: escucha social SentiOne, menciones únicas sin filtro geográfico, datos hasta el ${longDate(res.cobertura[res.cobertura.length - 1].hasta)}.`
    : 'Fuente: escucha social SentiOne, referencia preliminar de la exportación del 21 de septiembre al 20 de octubre de 2026, sin filtro geográfico.';

/** Picos anotados con su proporción de menciones sobre cáncer de mama (serie diaria). */
export const anotacionesPicos = (res) =>
  antes.picos
    .map((p) => ({ ...p, r: relevanciaRango(res, p.desde, p.hasta) }))
    .filter((p) => p.r)
    .map((p) => ({ ...p, detalle: `${formatPct(p.r.pct)} sobre cáncer de mama` }));

/** Capítulo 03 · Antes del concierto: volumen frente a conversación real; y de qué se habla cuando sí es sobre la causa. */
export default function Antes() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const todas = useMemo(() => view(res, { ...FILTROS_VACIOS, ...PERIODO_PREVIO, segmento: 'todas' }), [res]);
  const relevantes = useMemo(() => view(res, { ...FILTROS_VACIOS, ...PERIODO_PREVIO }), [res]);
  const octubre = useMemo(
    () => ({
      todas: dailyTotals(res, { ...RANGO_DEFECTO, segmento: 'todas' }),
      relevantes: dailyTotals(res, { ...RANGO_DEFECTO, segmento: 'relevantes' }),
    }),
    [res],
  );
  const { escenas } = antes;
  const clasificado = todas.clasificados >= MUESTRA_MINIMA && relevantes.registros > 0;
  const rango = todas.stats ? rangoTexto(todas.stats.desde, todas.stats.hasta) : '';
  const fuente = fuenteTexto(res);

  return (
    <section id="antes" aria-labelledby="antes-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={antes.capitulo} titulo={antes.titulo} entradilla={antes.entradilla} tituloId="antes-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-12">
        <Scene
          index="03.1"
          kicker={escenas.relevancia.kicker}
          titulo={escenas.relevancia.titulo}
          lead={h.relevancia.disponible ? h.relevancia.texto : h.volumen.texto}
          conclusion={h.picos.disponible ? h.picos.texto : null}
        >
          {clasificado ? (
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="eyebrow mb-6 text-bruma">{escenas.relevancia.comparacion}</p>
                <RelevanceCompare captadas={todas.universo} clasificadas={todas.clasificados} relevantes={relevantes.registros} rango={rango} />
              </div>
              <div className="lg:col-span-7">
                <p className="eyebrow mb-4 text-bruma">{escenas.relevancia.serie}</p>
                <Legend
                  className="mb-4"
                  items={[
                    { label: 'Todo lo captado', color: 'rgba(244,166,196,0.35)' },
                    { label: 'Sobre cáncer de mama', color: '#E2457F' },
                    ...(tieneHuecos([{ puntos: octubre.todas }]) ? [{ label: 'Aún sin datos', tipo: 'vacio' }] : []),
                  ]}
                />
                <TimeChart
                  tipo="superpuestas"
                  series={[
                    { id: 'todas', nombre: 'Todo lo captado', color: 'rgba(244,166,196,0.35)', puntos: octubre.todas },
                    { id: 'rel', nombre: 'Sobre cáncer de mama', color: '#E2457F', puntos: octubre.relevantes },
                  ]}
                  anotaciones={anotacionesPicos(res)}
                  marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]}
                  unidad="menciones"
                  descripcion="Menciones por día en octubre de 2026: todo lo captado y lo que habla de cáncer de mama."
                />
              </div>
            </div>
          ) : (
            <TimeChart series={[{ id: 'oct', nombre: 'Menciones', color: '#F4A6C4', puntos: octubre.todas }]} picos={todas.picos} marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]} unidad="menciones" descripcion="Menciones por día en octubre de 2026." />
          )}
          <p className="mt-6 max-w-3xl text-xs text-bruma/80">
            {h.volumen.disponible && `${h.volumen.texto} `}
            {fuente}
          </p>
        </Scene>

        <Scene
          index="03.2"
          kicker={escenas.tono.kicker}
          titulo={escenas.tono.titulo}
          lead={h.temas.disponible ? h.temas.texto : null}
          conclusion={h.sentimiento.disponible ? h.sentimiento.texto : null}
          cta={<ExploreLink tab="conversacion">Explorar la conversación en detalle</ExploreLink>}
        >
          {clasificado ? (
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-5 text-bruma">Temáticas · % de {formatNumber(relevantes.registros)} menciones sobre cáncer de mama</p>
                <BarList items={relevantes.temas.items.slice(0, 6)} total={relevantes.registros} unidad="menciones sobre cáncer de mama" color="#E2457F" />
              </div>
              <div className="lg:col-span-5">
                <p className="eyebrow mb-5 text-bruma">Tono hacia el tema</p>
                <Legend className="mb-4" items={relevantes.sentimiento.items.map((s) => ({ label: s.nombre, color: s.color }))} />
                <StackBars filas={[{ id: 'sent', nombre: 'Menciones sobre cáncer de mama', segmentos: relevantes.sentimiento.items }]} />
                <p className="eyebrow mb-5 mt-10 text-bruma">Dónde se publican</p>
                <BarList items={relevantes.plataformas.items.slice(0, 5)} total={relevantes.registros} unidad="menciones sobre cáncer de mama" />
                {h.plataformas.disponible && <p className="mt-4 text-xs text-bruma">{h.plataformas.texto}</p>}
              </div>
            </div>
          ) : (
            <Pending compacto estado="analisis" titulo={escenas.tono.pendiente} />
          )}
          <p className="mt-8 max-w-3xl text-xs text-bruma/80">{antes.alcance}</p>
        </Scene>
      </div>
    </section>
  );
}
