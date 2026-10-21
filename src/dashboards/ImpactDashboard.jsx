import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import PeriodBars from '../components/charts/PeriodBars.jsx';
import TimeChart from '../components/charts/TimeChart.jsx';
import HourBars from '../components/charts/HourBars.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import { useData, useFilters } from '../state/DataContext.jsx';
import { dailyTotals, entityMentions, periodStats, universeView } from '../lib/data/aggregate.js';
import { dayRange, longDate, rangeLabel, todayBogota } from '../lib/data/dates.js';
import { formatDecimal, formatNumber, formatOne } from '../lib/format.js';
import { impacto } from '../content/impacto.js';
import { EVENTO, PERIODOS_IMPACTO } from '../config/periodos.js';
import { universoPorId } from '../config/universos.js';

const M = impacto.modulos;
const median = (vals) => {
  if (!vals.length) return null;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export default function ImpactDashboard({ sticky = true }) {
  const { dataset } = useData();
  const { filtros: f } = useFilters();
  const u = dataset.universos[f.universo];
  const info = universoPorId(f.universo);
  const hoy = todayBogota();
  const fuente = `Fuente: SentiOne · ${info.nombre}.`;
  const estadoDe = (p) => (hoy < p.desde ? 'evento' : 'medicion');

  const periodos = useMemo(
    () =>
      PERIODOS_IMPACTO.map((p) => {
        const fp = { ...f, desde: p.desde, hasta: p.hasta };
        const stats = periodStats(u, fp);
        const vista = stats ? universeView(u, fp) : null;
        const diarios = dailyTotals(u, fp).filter((x) => x.v != null).map((x) => x.v);
        return { ...p, fp, stats, vista, mediana: median(diarios), dias: dayRange(p.desde, p.hasta).length };
      }),
    [u, f],
  );
  const [antes, durante, despues] = periodos;
  const rangoTxt = (p) => rangeLabel(p.desde, p.hasta);
  const pend = (p, titulo) => ({ estado: estadoDe(p), titulo: titulo ?? (estadoDe(p) === 'evento' ? 'Se calculará con la exportación posterior al concierto.' : 'Falta importar datos de este periodo.') });

  const detalle = (p) =>
    p.stats
      ? `${p.stats.diasConDatos} de ${p.dias} días con datos${p.mediana != null ? ` · mediana ${formatOne(p.mediana)}` : ''}${p.stats.diasConDatos < p.dias ? ' · cobertura parcial' : ''}`
      : null;

  const volumen = periodos.map((p) => ({ id: p.id, nombre: p.nombre, rango: rangoTxt(p), valor: p.stats?.promedioDiario ?? null, detalle: detalle(p), pendiente: pend(p) }));

  const interacciones = periodos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    rango: rangoTxt(p),
    valor: p.vista?.interacciones ? p.vista.interacciones.total / p.stats.diasConDatos : null,
    detalle: p.vista?.interacciones ? `${formatNumber(p.vista.interacciones.total)} en total · ${formatNumber(p.vista.interacciones.registros)} registros con métrica` : null,
    pendiente: p.stats && !p.vista?.interacciones ? { estado: 'importar', titulo: 'Los datos de este periodo no incluyen interacciones.' } : pend(p),
  }));

  const intencion = periodos.map((p) => {
    const regs = p.vista?.registros ?? 0;
    const val = regs ? ((p.vista.intencion.validado + p.vista.intencion.sugerido) / regs) * 1000 : null;
    return {
      id: p.id,
      nombre: p.nombre,
      rango: rangoTxt(p),
      valor: val,
      detalle: regs ? `${formatNumber(p.vista.intencion.validado)} validados · ${formatNumber(p.vista.intencion.sugerido)} sugeridos` : null,
      pendiente: p.stats && !regs ? { estado: 'importar', titulo: 'La línea base agregada no permite detectar intención.' } : pend(p),
    };
  });

  const menciones = ['msd', 'fonseca'].map((ent) => ({
    ent,
    nombre: ent === 'msd' ? 'MSD' : 'Fonseca',
    valores: periodos.map((p) => (p.vista?.registros ? entityMentions(u, p.fp, ent) / p.stats.diasConDatos : null)),
  }));

  const diariaF = { ...f, desde: '2026-10-17', hasta: '2026-10-31' };
  const diaria = dailyTotals(u, diariaF);
  const horaNoche = durante.vista?.horario?.filas.find((x) => x.d === EVENTO.fecha);

  const persistencia =
    antes.stats && despues.stats
      ? dailyTotals(u, despues.fp)
          .filter((x) => x.v != null)
          .map((x) => ({ d: x.d, ratio: x.v / antes.stats.promedioDiario, v: x.v }))
      : [];

  const asistentes = [...(durante.vista ? [durante] : []), ...(despues.vista ? [despues] : [])]
    .flatMap((p) => u.registros.filter((r) => r.d >= p.desde && r.d <= p.hasta && r.rv?.asistente))
    .length;
  const medios = [durante, despues].reduce((a, p) => a + (p.vista?.plataformas.find((x) => x.id === 'web')?.v ?? 0), 0);
  const hayPost = Boolean(durante.stats || despues.stats);

  return (
    <div className="space-y-16">
      <FilterBar sticky={sticky} campos={['universo', 'plataformas', 'sentimiento', 'narrativas']} />

      <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12">
        <ChartFrame className="lg:col-span-12" index="04.1" titulo={M.periodos.titulo} subtitulo={`${M.periodos.subtitulo} · ${info.nombre}`} notas={[impacto.normalizacion, impacto.causalidad]} fuente={fuente}>
          <PeriodBars periodos={volumen} />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-7"
          index="04.2"
          titulo={M.diaria.titulo}
          subtitulo={M.diaria.subtitulo}
          leyenda={[{ label: 'Registros por día', color: '#F4A6C4' }, { label: 'Sin datos (no es cero)', tipo: 'vacio' }, { label: 'Concierto', color: '#E2457F', tipo: 'linea' }]}
          notas={[!hayPost && 'Los días del 21 al 31 de octubre aparecen sin datos hasta importar las nuevas exportaciones.']}
          fuente={fuente}
          pendiente={diaria.every((x) => x.v == null) ? pend(durante) : null}
        >
          <TimeChart series={[{ id: 'd', nombre: info.nombre, color: '#F4A6C4', puntos: diaria }]} marcadores={[{ d: EVENTO.fecha, etiqueta: 'Concierto' }]} descripcion="Registros por día del 17 al 31 de octubre de 2026." alto={240} />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-5"
          index="04.3"
          titulo={M.horaria.titulo}
          subtitulo={M.horaria.subtitulo}
          leyenda={horaNoche ? [{ label: 'Registros por hora', color: '#F4A6C4' }, { label: `Franja del concierto (${EVENTO.horas.desde}:00–${EVENTO.horas.hasta}:59)`, color: '#E2457F' }] : []}
          fuente={fuente}
          pendiente={!horaNoche ? (durante.stats ? { estado: 'importar', titulo: 'Los registros del 24 de octubre no incluyen hora.' } : pend(durante)) : null}
        >
          {horaNoche && <HourBars horas={horaNoche.horas} resaltar={EVENTO.horas} descripcion="Registros por hora el 24 de octubre de 2026." />}
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="04.4" titulo={M.interacciones.titulo} subtitulo={M.interacciones.subtitulo} fuente={fuente}>
          <PeriodBars periodos={interacciones} unidad="interacciones por día" />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04.5" titulo={M.menciones.titulo} subtitulo={M.menciones.subtitulo} notas={['Mención explícita del nombre en el texto del registro.']} fuente={fuente}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-bruma">
                <th scope="col" className="pb-3 font-normal">
                  <span className="sr-only">Entidad</span>
                </th>
                {periodos.map((p) => (
                  <th key={p.id} scope="col" className="eyebrow pb-3 font-medium text-rosa">
                    {p.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menciones.map((m) => (
                <tr key={m.ent} className="border-t border-rosa/10">
                  <th scope="row" className="py-4 font-display text-[length:var(--step-1)] font-normal italic text-marfil">
                    {m.nombre}
                  </th>
                  {m.valores.map((val, i) => (
                    <td key={i} className="py-4">
                      {val != null ? (
                        <span className="display num text-[length:var(--step-2)] text-marfil">{formatDecimal(val)}</span>
                      ) : (
                        <span className="text-xs text-rosa">{estadoDe(periodos[i]) === 'evento' ? 'Después del evento' : 'Pendiente'}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04.6" titulo={M.espontaneo.titulo} subtitulo={M.espontaneo.subtitulo} fuente={fuente} pendiente={!asistentes ? { estado: hayPost ? 'revision' : 'evento', titulo: 'Se identificará en la revisión manual de publicaciones del 24 al 31 de octubre.' } : null}>
          <p className="display num text-[length:var(--step-4)] text-fucsia">{formatNumber(asistentes)}</p>
          <p className="text-sm text-bruma">publicaciones de asistentes validadas en la revisión</p>
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04.7" titulo={M.medios.titulo} subtitulo={M.medios.subtitulo} fuente={fuente}>
          {hayPost ? (
            <p className="mb-6 text-sm text-bruma">
              <span className="display num mr-2 text-[length:var(--step-3)] text-marfil">{formatNumber(medios)}</span>
              registros en sitios web del 24 al 31 de octubre
            </p>
          ) : null}
          <Highlights desde="2026-10-24" hasta="2026-10-31" tipos={['medio']} vacio={{ estado: hayPost ? 'revision' : 'evento', titulo: 'Las noticias verificadas aparecerán aquí.' }} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04.8" titulo={M.creadores.titulo} subtitulo={M.creadores.subtitulo} fuente={fuente}>
          <Highlights desde="2026-10-24" hasta="2026-10-31" tipos={['creador']} vacio={{ estado: hayPost ? 'revision' : 'evento', titulo: 'Los creadores verificados aparecerán aquí.' }} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04.9" titulo={M.persistencia.titulo} subtitulo={M.persistencia.subtitulo} fuente={fuente} pendiente={!persistencia.length ? pend(despues) : null}>
          <ul className="space-y-3">
            {persistencia.map((x) => (
              <li key={x.d} className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-3 text-sm">
                <span className="text-bruma">{longDate(x.d).replace(' de 2026', '')}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-rosa/10">
                  <span className="block h-full rounded-full bg-rosa" style={{ width: `${Math.min(100, (x.ratio / Math.max(...persistencia.map((p) => p.ratio))) * 100)}%` }} />
                </span>
                <span className="num text-right text-marfil">{formatOne(x.ratio)}×</span>
              </li>
            ))}
          </ul>
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="04.10" titulo={M.intencion.titulo} subtitulo={M.intencion.subtitulo} notas={['Incluye señales sugeridas por reglas (no validadas) y validadas en revisión.']} fuente={fuente}>
          <PeriodBars periodos={intencion} unidad="por cada 1.000 registros" />
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="04.11" titulo={M.evidencias.titulo} subtitulo={M.evidencias.subtitulo}>
          <Highlights desde="2026-10-24" hasta="2026-10-31" vacio={{ estado: hayPost ? 'revision' : 'evento', titulo: 'Las evidencias verificadas del concierto aparecerán aquí.', detalle: 'Agrega cada enlace verificado en src/content/evidencias.js o márcalo como destacado en el importador.' }} />
        </ChartFrame>
      </div>
    </div>
  );
}
