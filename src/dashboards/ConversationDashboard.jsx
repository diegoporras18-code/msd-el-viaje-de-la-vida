import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import TimeChart, { tieneHuecos } from '../components/charts/TimeChart.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import Heatmap from '../components/charts/Heatmap.jsx';
import KpiRow from '../components/charts/KpiRow.jsx';
import Chips from '../components/Chips.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { useData, useFilters } from '../state/DataContext.jsx';
import { growth, universeView, catalogoSentimiento } from '../lib/data/aggregate.js';
import { longDate, rangeLabel, shortDate } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatPct } from '../lib/format.js';
import { conversacion } from '../content/conversacion.js';
import { universoPorId } from '../config/universos.js';
import { EVENTO } from '../config/periodos.js';

const M = conversacion.modulos;
const TIPOS = [
  { id: 'original', nombre: 'Original' },
  { id: 'revisado', nombre: 'Revisado' },
  { id: 'sugerido', nombre: 'Sugerido' },
];

const necesitaRegistros = (que) => ({
  estado: 'importar',
  titulo: `${que} se calculará al importar el Excel original de SentiOne.`,
  detalle: 'La línea base actual solo contiene agregados por día, fuente y sentimiento.',
  requiere: 'exportación con texto, fecha y fuente de cada publicación',
});

export default function ConversationDashboard({ sticky = true }) {
  const { dataset } = useData();
  const { filtros: f, update } = useFilters();
  const u = dataset.universos[f.universo];
  const info = universoPorId(f.universo);
  const v = useMemo(() => universeView(u, f), [u, f]);
  const g = useMemo(() => growth(u, f), [u, f]);
  const hayRegistros = v.registros > 0;
  const rango = rangeLabel(f.desde, f.hasta);
  const fuente = `Fuente: SentiOne · ${info.nombre}${u.base && !hayRegistros ? ' · agregados preliminares' : ''}.`;

  const bloques = (u.base?.bloques ?? [])
    .filter((b) => b.desde >= f.desde && b.hasta <= f.hasta && !hayRegistros)
    .map((b) => ({ ...b, promedio: b.total / ((new Date(b.hasta) - new Date(b.desde)) / 86400000 + 1), etiqueta: `${shortDate(b.desde)}–${shortDate(b.hasta)}: solo total (${formatNumber(b.total)})` }));

  const kpis = [
    { id: 'total', etiqueta: 'Registros', valor: v.stats?.total ?? null, detalle: v.stats ? `${v.stats.diasConDatos} días con datos en ${rango}` : `Sin datos en ${rango}` },
    { id: 'promedio', etiqueta: 'Promedio diario', valor: v.stats?.promedioDiario ?? null, formato: formatDecimal, detalle: 'Total dividido entre los días con datos' },
    { id: 'pico', etiqueta: 'Pico diario', valor: v.picos[0]?.v ?? null, tono: 'text-fucsia', detalle: v.picos[0] ? longDate(v.picos[0].d) : 'Sin picos en el rango' },
    {
      id: 'crecimiento',
      etiqueta: 'Frente al periodo anterior',
      valor: g.ok ? g.pct : null,
      formato: (n) => formatPct(n, true),
      tono: 'text-rosa',
      pendiente: 'Sin periodo comparable',
      detalle: g.ok
        ? `Promedio diario ${rangeLabel(g.actual.desde, g.actual.hasta)} (${formatDecimal(g.actual.promedioDiario)}) vs. ${rangeLabel(g.anterior.desde, g.anterior.hasta)} (${formatDecimal(g.anterior.promedioDiario)})`
        : g.motivo,
    },
  ];

  const sentCat = catalogoSentimiento;
  const sentItems = v.sentimiento
    .map((s) => ({ id: s.id, nombre: sentCat.find((c) => c.id === s.id)?.nombre ?? s.id, v: s.v, color: sentCat.find((c) => c.id === s.id)?.color }))
    .sort((a, b) => b.v - a.v);
  const narr = v.narrativas.filter((n) => n.validado + n.sugerido > 0).map((n) => ({ id: n.id, nombre: n.nombre, v: n.validado, v2: n.sugerido }));
  const temas = v.narrativas.filter((n) => conversacion.temasClave.includes(n.id));
  const leyendaVS = [
    { label: 'Validado en revisión', color: '#F4A6C4' },
    { label: 'Sugerido por reglas (no validado)', color: '#F4A6C4', tipo: 'tenue' },
  ];

  return (
    <div className="space-y-16">
      <FilterBar sticky={sticky} />

      <KpiRow items={kpis} />

      <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12">
        <ChartFrame
          className="lg:col-span-12"
          index="03.1"
          titulo={M.evolucion.titulo}
          subtitulo={`${M.evolucion.subtitulo} · ${rango}`}
          leyenda={[
            { label: 'Registros por día', color: '#F4A6C4' },
            { label: 'Pico (≥ 1,5 × promedio)', color: '#E2457F' },
            ...(tieneHuecos([{ puntos: v.dias }]) ? [{ label: 'Sin datos (no es cero)', tipo: 'vacio' }] : []),
            ...(bloques.length ? [{ label: 'Bloque con solo total', color: '#F4A6C4', tipo: 'punteada' }] : []),
          ]}
          notas={[
            u.base && !hayRegistros && 'Línea base: agregados preliminares revisados de la exportación del 21 sep al 20 oct de 2026.',
            ...v.notas,
          ]}
          fuente={fuente}
          pendiente={!v.stats ? { estado: f.hasta < '2026-10-21' ? 'medicion' : 'evento', titulo: 'No hay registros para este rango y estos filtros.' } : null}
        >
          <TimeChart
            series={[{ id: f.universo, nombre: info.nombre, color: '#F4A6C4', puntos: v.dias }]}
            picos={v.picos}
            bloques={bloques}
            marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]}
            descripcion={`Registros por día de ${info.nombre} entre ${rango}.`}
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="03.2" titulo={M.picos.titulo} subtitulo={M.picos.subtitulo} fuente={fuente} pendiente={!v.picos.length ? { estado: 'medicion', titulo: 'No hay picos en el rango elegido.' } : null}>
          <ol className="space-y-4">
            {v.picos.map((p, i) => (
              <li key={p.d} className="flex items-baseline gap-4 border-b border-rosa/10 pb-3">
                <span className="eyebrow num w-6 text-fucsia">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-display text-[length:var(--step-1)] italic text-marfil">{longDate(p.d)}</span>
                <span className="display num text-[length:var(--step-2)] text-rosa">{formatNumber(p.v)}</span>
              </li>
            ))}
          </ol>
        </ChartFrame>

        <ChartFrame className="lg:col-span-7" index="03.3" titulo={M.plataformas.titulo} subtitulo={`${M.plataformas.subtitulo} · ${rango}`} leyenda={[{ label: 'Registros', color: '#F4A6C4' }]} notas={v.baseIncluida ? ['Distribución de la línea base del 1 al 20 de octubre: suma 2.611 registros.'] : []} fuente={fuente} pendiente={!v.plataformas.length ? necesitaRegistros('La distribución para este rango') : null}>
          <BarList items={v.plataformas} />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-12"
          index="03.4"
          titulo={M.horario.titulo}
          subtitulo={M.horario.subtitulo}
          notas={[v.horario?.sinHora ? `${formatNumber(v.horario.sinHora)} registros sin hora no aparecen en este gráfico.` : null]}
          fuente={fuente}
          pendiente={!v.horario ? necesitaRegistros('El volumen por hora') : null}
        >
          {v.horario && <Heatmap filas={v.horario.filas} max={v.horario.max} resaltar={{ d: EVENTO.fecha, ...EVENTO.horas }} />}
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-6"
          index="03.5"
          titulo={M.sentimiento.titulo}
          subtitulo={M.sentimiento.subtitulo}
          acciones={<Chips multiple={false} opciones={TIPOS} valor={f.tipoSentimiento} onChange={(t) => update({ tipoSentimiento: t, sentimientos: [] })} etiqueta="Tipo de sentimiento" />}
          leyenda={sentItems.map((s) => ({ label: s.nombre, color: s.color }))}
          notas={[
            f.tipoSentimiento === 'original' && 'Clasificación original de SentiOne, sin modificar.',
            f.tipoSentimiento === 'revisado' && 'Solo cuenta como revisado lo validado manualmente; el resto queda pendiente.',
            f.tipoSentimiento === 'sugerido' && 'Sugerencias automáticas por reglas: no son una clasificación validada.',
          ]}
          fuente={fuente}
          pendiente={!sentItems.length ? necesitaRegistros('El sentimiento para este rango') : null}
        >
          <BarList items={sentItems} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="03.6" titulo={M.narrativas.titulo} subtitulo={M.narrativas.subtitulo} leyenda={leyendaVS} fuente={fuente} pendiente={!narr.length ? (hayRegistros ? { estado: 'revision', titulo: 'Ningún registro del rango coincide con las narrativas configuradas.' } : necesitaRegistros('La clasificación por narrativa')) : null}>
          <BarList items={narr} etiquetas={{ v: 'Validado', v2: 'Sugerido' }} total={v.registros} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="03.7" titulo={M.temas.titulo} subtitulo={M.temas.subtitulo} fuente={fuente} pendiente={!hayRegistros ? necesitaRegistros('El análisis de temas') : null}>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {temas.map((t) => (
              <div key={t.id} className="border-l border-rosa/25 pl-4">
                <dt className="font-display text-[length:var(--step-1)] italic text-marfil">{t.nombre}</dt>
                <dd className="display num mt-2 text-[length:var(--step-3)] text-rosa">{formatNumber(t.validado + t.sugerido)}</dd>
                <dd className="text-xs text-bruma">
                  {formatNumber(t.validado)} validados · {formatNumber(t.sugerido)} sugeridos · {formatPct(v.registros ? ((t.validado + t.sugerido) / v.registros) * 100 : 0)} de los registros
                </dd>
              </div>
            ))}
          </dl>
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="03.8" titulo={M.hashtags.titulo} subtitulo={M.hashtags.subtitulo} leyenda={[{ label: 'Registros con el hashtag', color: '#E2457F' }]} fuente={fuente} pendiente={!v.hashtags.length ? (hayRegistros ? { estado: 'medicion', titulo: 'Los registros del rango no contienen hashtags.' } : necesitaRegistros('El ranking de hashtags')) : null}>
          <BarList items={v.hashtags} color="#E2457F" total={v.registros} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="03.9" titulo={M.palabras.titulo} subtitulo={M.palabras.subtitulo} leyenda={[{ label: 'Registros con el término', color: '#F4A6C4' }]} fuente={fuente} pendiente={!v.palabras.length ? (hayRegistros ? { estado: 'medicion', titulo: 'Ningún término del vocabulario aparece en el rango.' } : necesitaRegistros('El conteo de palabras clave')) : null}>
          <BarList items={v.palabras} total={v.registros} />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-7"
          index="03.10"
          titulo={M.relacion.titulo}
          subtitulo={M.relacion.subtitulo}
          leyenda={[
            { label: 'Atribuible a MSD', color: '#E2457F' },
            { label: 'Menciona competidores', color: '#F2C46D' },
            { label: 'Categoría general', color: '#C9B3C0' },
          ]}
          notas={['Detección por mención explícita en el texto; se puede corregir en la revisión manual.']}
          fuente={fuente}
          pendiente={!hayRegistros ? necesitaRegistros('La relación con MSD y la competencia') : null}
        >
          <StackBars
            filas={[
              {
                id: 'rel',
                nombre: info.nombre,
                segmentos: v.relacion.map((r, i) => ({ id: r.id, nombre: r.nombre, v: r.validado + r.sugerido, color: ['#E2457F', '#F2C46D', '#C9B3C0'][i] })),
              },
            ]}
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-5" index="03.11" titulo={M.emociones.titulo} subtitulo={M.emociones.subtitulo} leyenda={leyendaVS} fuente={fuente} pendiente={!hayRegistros ? necesitaRegistros('El análisis de emoción e intención') : null}>
          <BarList
            items={[
              { id: 'intencion', nombre: 'Intención preventiva', v: v.intencion.validado, v2: v.intencion.sugerido, color: '#E2457F' },
              ...v.emociones.filter((e) => e.validado + e.sugerido > 0).map((e) => ({ id: e.id, nombre: e.nombre, v: e.validado, v2: e.sugerido })),
            ]}
            etiquetas={{ v: 'Validado', v2: 'Sugerido' }}
            total={v.registros}
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="03.12" titulo={M.destacados.titulo} subtitulo={M.destacados.subtitulo}>
          <Highlights universo={f.universo} desde={f.desde} hasta={f.hasta} />
        </ChartFrame>
      </div>
    </div>
  );
}
