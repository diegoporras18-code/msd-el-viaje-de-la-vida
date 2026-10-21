import { useMemo } from 'react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import Scene, { ExploreLink } from '../components/Scene.jsx';
import TimeChart, { tieneHuecos } from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import KpiRow from '../components/charts/KpiRow.jsx';
import Legend from '../components/charts/Legend.jsx';
import Pending from '../components/charts/Pending.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { FILTROS_VACIOS, MUESTRA_MINIMA, view } from '../lib/data/resultados.js';
import { hechos } from '../lib/data/hechos.js';
import { longDate, todayBogota } from '../lib/data/dates.js';
import { formatDecimal } from '../lib/format.js';
import { antes } from '../content/antes.js';
import { EVENTO, PERIODO_PREVIO, RANGO_DEFECTO } from '../config/periodos.js';

export const fuenteTexto = (res) =>
  res.cobertura.length
    ? 'Fuente: escucha social SentiOne, menciones únicas sin filtro geográfico.'
    : 'Fuente: escucha social SentiOne, referencia preliminar de la exportación del 21 de septiembre al 20 de octubre de 2026, sin filtro geográfico.';

/** Capítulo 03 · Antes del concierto: dos escenas (volumen y ritmo; dónde y cómo se conversa). */
export default function Antes() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const octubre = useMemo(() => view(res, { ...FILTROS_VACIOS, ...RANGO_DEFECTO }), [res]);
  const previo = useMemo(() => view(res, { ...FILTROS_VACIOS, ...PERIODO_PREVIO }), [res]);
  const original = useMemo(() => view(res, { ...FILTROS_VACIOS, ...PERIODO_PREVIO, tipoSentimiento: 'original' }), [res]);
  const { escenas } = antes;
  const clasificado = previo.clasificados >= MUESTRA_MINIMA;
  const sentimiento = clasificado ? previo.sentimiento.filter((s) => s.id !== 'pendiente') : original.sentimiento;

  return (
    <section id="antes" aria-labelledby="antes-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={antes.capitulo} titulo={antes.titulo} entradilla={antes.entradilla} tituloId="antes-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-12">
        <Scene index="03.1" kicker={escenas.volumen.kicker} titulo={escenas.volumen.titulo} lead={h.volumen.texto} conclusion={h.picos.disponible ? h.picos.texto : null}>
          {previo.stats && (
            <KpiRow
              items={[
                { id: 'total', etiqueta: 'Menciones', valor: previo.stats.total, detalle: `${previo.stats.diasConDatos} días con datos` },
                { id: 'promedio', etiqueta: 'Promedio diario', valor: previo.stats.promedioDiario, formato: formatDecimal, detalle: `Mediana: ${formatDecimal(previo.stats.mediana)}` },
                { id: 'pico', etiqueta: 'Día pico', valor: previo.picos[0]?.v ?? null, tono: 'text-fucsia', detalle: previo.picos[0] ? longDate(previo.picos[0].d) : null },
              ].slice(0, 3)}
            />
          )}
          <div className="mt-12">
            <Legend
              className="mb-4"
              items={[
                { label: 'Menciones por día', color: '#F4A6C4' },
                { label: 'Pico (1,5 veces el promedio o más)', color: '#E2457F' },
                ...(tieneHuecos([{ puntos: octubre.dias }]) ? [{ label: 'Aún sin datos', tipo: 'vacio' }] : []),
              ]}
            />
            <TimeChart
              series={[{ id: 'oct', nombre: 'Menciones', color: '#F4A6C4', puntos: octubre.dias }]}
              picos={octubre.picos}
              marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]}
              unidad="menciones"
              descripcion="Menciones por día en octubre de 2026."
            />
            <p className="mt-3 text-xs text-bruma/80">{fuenteTexto(res)}</p>
          </div>
        </Scene>

        <Scene index="03.2" kicker={escenas.tono.kicker} titulo={escenas.tono.titulo} lead={h.plataformas.disponible ? h.plataformas.texto : null} conclusion={h.temas.disponible ? h.temas.texto : h.sentimiento.disponible ? h.sentimiento.texto : null} cta={<ExploreLink tab="conversacion">Explorar la conversación en detalle</ExploreLink>}>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-5 text-bruma">Por plataforma</p>
              <BarList items={previo.plataformas.slice(0, 7)} unidad="menciones" />
            </div>
            <div className="lg:col-span-7">
              <p className="eyebrow mb-5 text-bruma">{clasificado ? 'Sentimiento por contenido' : 'Sentimiento según SentiOne (referencia)'}</p>
              <Legend className="mb-4" items={sentimiento.map((s) => ({ label: s.nombre, color: s.color }))} />
              <StackBars filas={[{ id: 'sent', nombre: clasificado ? 'Menciones clasificadas' : 'Clasificación automática de SentiOne', segmentos: sentimiento.map((s) => ({ id: s.id, nombre: s.nombre, v: s.v, color: s.color })) }]} />
              <div className="mt-8">
                {clasificado ? (
                  <>
                    <p className="eyebrow mb-5 text-bruma">Temáticas principales</p>
                    <BarList items={previo.temas.slice(0, 6)} total={previo.clasificados} unidad="menciones clasificadas" color="#E2457F" />
                  </>
                ) : (
                  <Pending compacto estado="analisis" titulo={escenas.tono.pendiente} />
                )}
              </div>
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-xs text-bruma/80">{antes.alcance}</p>
        </Scene>
      </div>
    </section>
  );
}
