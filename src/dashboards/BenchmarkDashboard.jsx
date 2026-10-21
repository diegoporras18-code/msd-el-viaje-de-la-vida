import { useMemo } from 'react';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import BarList from '../components/charts/BarList.jsx';
import StackBars from '../components/charts/StackBars.jsx';
import TimeChart from '../components/charts/TimeChart.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Highlights from './Highlights.jsx';
import CountUp from '../components/CountUp.jsx';
import { useData, useFilters } from '../state/DataContext.jsx';
import { shareOfVoice, universeView, catalogoSentimiento } from '../lib/data/aggregate.js';
import { rangeLabel } from '../lib/data/dates.js';
import { formatNumber, formatPct } from '../lib/format.js';
import { benchmark } from '../content/benchmark.js';
import { PALETA, universoPorId } from '../config/universos.js';
import { NARRATIVAS, PLATAFORMAS } from '../config/clasificacion.js';

const M = benchmark.modulos;

export default function BenchmarkDashboard({ sticky = true }) {
  const { dataset } = useData();
  const { filtros: f } = useFilters();
  const rango = rangeLabel(f.desde, f.hasta);

  const marcas = useMemo(
    () =>
      f.marcas.map((id) => {
        const u = dataset.universos[id];
        const info = universoPorId(id);
        const conDatos = Boolean(u?.registros?.length);
        return { id, info, u, conDatos, v: conDatos ? universeView(u, f) : null };
      }),
    [dataset, f],
  );
  const conDatos = marcas.filter((m) => m.conDatos && m.v.registros > 0);
  const sinDatos = marcas.filter((m) => !m.conDatos).map((m) => m.info.nombre);
  const sov = useMemo(() => shareOfVoice(dataset, f.marcas, f), [dataset, f]);
  const fuente = 'Fuente: exportaciones de SentiOne independientes por laboratorio.';
  const faltan = sinDatos.length ? `Faltan exportaciones de: ${sinDatos.join(', ')}.` : null;
  const pendiente = (que) =>
    !conDatos.length
      ? { estado: 'importar', titulo: `${que} se calculará al importar las exportaciones de cada laboratorio.`, requiere: `exportación de SentiOne de ${marcas.map((m) => m.info.nombre).join(', ')}` }
      : null;
  const leyendaMarcas = conDatos.map((m) => ({ label: m.info.nombre, color: m.info.color }));

  const filasDe = (getSegs) => conDatos.map((m) => ({ id: m.id, nombre: m.info.nombre, segmentos: getSegs(m.v) }));

  const formatos = conDatos.flatMap((m) =>
    PLATAFORMAS.map((p) => {
      const regs = m.u.registros.filter((r) => r.d >= f.desde && r.d <= f.hasta && r.p === p.id && r.m?.int != null);
      return regs.length ? { id: `${m.id}-${p.id}`, nombre: `${m.info.nombre} · ${p.nombre}`, v: Math.round(regs.reduce((a, r) => a + r.m.int, 0) / regs.length), color: m.info.color, n: regs.length } : null;
    }).filter(Boolean),
  ).sort((a, b) => b.v - a.v).slice(0, 10);

  const tipos = new Set(conDatos.flatMap((m) => m.v.tipos.map((t) => t.id)));

  return (
    <div className="space-y-16">
      <FilterBar sticky={sticky} campos={['marcas', 'fechas', 'plataformas', 'sentimiento', 'narrativas']} />

      <ul className="grid gap-4 text-sm text-bruma lg:grid-cols-3">
        {benchmark.reglas.map((r) => (
          <li key={r} className="border-l border-fucsia/50 pl-4">
            {r}
          </li>
        ))}
      </ul>

      <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12">
        <ChartFrame
          className="lg:col-span-12"
          index="05.1"
          titulo={M.sov.titulo}
          subtitulo={`${M.sov.subtitulo}${sov.ok ? ` · ${rangeLabel(sov.desde, sov.hasta)} (${sov.dias} días)` : ''}`}
          leyenda={sov.ok ? sov.valores.map((x) => ({ label: universoPorId(x.id).nombre, color: universoPorId(x.id).color })) : []}
          fuente={fuente}
          pendiente={
            !sov.ok
              ? { estado: 'importar', titulo: sov.motivo, detalle: 'El Share of Voice no se estima con datos incompletos ni con periodos distintos.', requiere: sov.faltan ? `exportación de ${sov.faltan.map((id) => universoPorId(id).nombre).join(', ')}` : 'exportaciones del mismo periodo' }
              : null
          }
        >
          {sov.ok && (
            <>
              <dl className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {sov.valores.map((x) => (
                  <div key={x.id} className="border-l pl-4" style={{ borderColor: universoPorId(x.id).color }}>
                    <dt className="eyebrow text-bruma">{universoPorId(x.id).nombre}</dt>
                    <dd className="display num text-[length:var(--step-3)]" style={{ color: universoPorId(x.id).color }}>
                      <CountUp value={x.pct} format={(n) => formatPct(n)} />
                    </dd>
                    <dd className="text-xs text-bruma">{formatNumber(x.menciones)} menciones explícitas</dd>
                  </div>
                ))}
              </dl>
              <StackBars filas={[{ id: 'sov', nombre: 'Share of Voice', segmentos: sov.valores.map((x) => ({ id: x.id, nombre: universoPorId(x.id).nombre, v: x.menciones, color: universoPorId(x.id).color })) }]} />
            </>
          )}
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-5"
          index="05.2"
          titulo={M.volumen.titulo}
          subtitulo={`${M.volumen.subtitulo} · ${rango}`}
          leyenda={[{ label: 'Menciones explícitas', color: '#F4A6C4' }, { label: 'Resto de la consulta (solo enfermedad u otros)', color: '#F4A6C4', tipo: 'tenue' }]}
          notas={[faltan]}
          fuente={fuente}
          pendiente={pendiente('El volumen por marca')}
        >
          <BarList
            items={conDatos.map((m) => {
              const exp = m.u.registros.filter((r) => r.d >= f.desde && r.d <= f.hasta && (r.ent ?? []).includes(m.id)).length;
              return { id: m.id, nombre: m.info.nombre, v: exp, v2: Math.max(0, m.v.registros - exp), color: m.info.color };
            })}
            etiquetas={{ v: 'Menciones explícitas', v2: 'Resto de la consulta' }}
            mostrarPct={false}
          />
        </ChartFrame>

        <ChartFrame className="lg:col-span-7" index="05.3" titulo={M.evolucion.titulo} subtitulo={`${M.evolucion.subtitulo} · ${rango}`} leyenda={[...leyendaMarcas, { label: 'Sin datos', tipo: 'vacio' }]} notas={[faltan]} fuente={fuente} pendiente={pendiente('La evolución diaria')}>
          <TimeChart tipo="lineas" series={conDatos.map((m) => ({ id: m.id, nombre: m.info.nombre, color: m.info.color, puntos: m.v.dias }))} descripcion={`Registros por día de cada laboratorio entre ${rango}.`} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="05.4" titulo={M.plataformas.titulo} subtitulo={M.plataformas.subtitulo} leyenda={PLATAFORMAS.map((p, i) => ({ label: p.nombre, color: PALETA[i % PALETA.length] }))} fuente={fuente} pendiente={pendiente('La distribución por plataformas')}>
          <StackBars filas={filasDe((v) => PLATAFORMAS.map((p, i) => ({ id: p.id, nombre: p.nombre, v: v.plataformas.find((x) => x.id === p.id)?.v ?? 0, color: PALETA[i % PALETA.length] })))} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="05.5" titulo={M.sentimiento.titulo} subtitulo={M.sentimiento.subtitulo} leyenda={catalogoSentimiento.slice(0, 4).map((s) => ({ label: s.nombre, color: s.color }))} fuente={fuente} pendiente={pendiente('El sentimiento por marca')}>
          <StackBars filas={filasDe((v) => catalogoSentimiento.map((s) => ({ id: s.id, nombre: s.nombre, v: v.sentimiento.find((x) => x.id === s.id)?.v ?? 0, color: s.color })))} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="05.6" titulo={M.narrativas.titulo} subtitulo={M.narrativas.subtitulo} leyenda={NARRATIVAS.map((n, i) => ({ label: n.nombre, color: PALETA[i % PALETA.length] }))} notas={['Incluye narrativas sugeridas por reglas (no validadas).']} fuente={fuente} pendiente={pendiente('Las narrativas por marca')}>
          <StackBars filas={filasDe((v) => v.narrativas.map((n, i) => ({ id: n.id, nombre: n.nombre, v: n.validado + n.sugerido, color: PALETA[i % PALETA.length] })))} />
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-6"
          index="05.7"
          titulo={M.tipos.titulo}
          subtitulo={M.tipos.subtitulo}
          leyenda={[...tipos].map((t, i) => ({ label: t, color: PALETA[i % PALETA.length] }))}
          fuente={fuente}
          pendiente={pendiente('Los tipos de publicación') ?? (!tipos.size ? { estado: 'importar', titulo: 'Las exportaciones no incluyen una columna de tipo de publicación.' } : null)}
        >
          <StackBars filas={filasDe((v) => [...tipos].map((t, i) => ({ id: t, nombre: t, v: v.tipos.find((x) => x.id === t)?.v ?? 0, color: PALETA[i % PALETA.length] })))} />
        </ChartFrame>

        <ChartFrame className="lg:col-span-6" index="05.8" titulo={M.hashtags.titulo} subtitulo={M.hashtags.subtitulo} fuente={fuente} pendiente={pendiente('El análisis de campañas y hashtags')}>
          <div className="grid gap-8 sm:grid-cols-2">
            {conDatos.map((m) => (
              <div key={m.id}>
                <p className="eyebrow mb-3" style={{ color: m.info.color }}>
                  {m.info.nombre}
                </p>
                {m.v.hashtags.length ? (
                  <BarList items={m.v.hashtags.slice(0, 6)} color={m.info.color} total={m.v.registros} />
                ) : (
                  <p className="text-sm text-bruma">Sin hashtags en el periodo.</p>
                )}
              </div>
            ))}
          </div>
        </ChartFrame>

        <ChartFrame
          className="lg:col-span-6"
          index="05.9"
          titulo={M.formatos.titulo}
          subtitulo={M.formatos.subtitulo}
          leyenda={leyendaMarcas}
          notas={['Promedio de interacciones por publicación con métrica disponible.']}
          fuente={fuente}
          pendiente={pendiente('El análisis de formatos') ?? (!formatos.length ? { estado: 'importar', titulo: 'Las exportaciones no incluyen interacciones.' } : null)}
        >
          <BarList items={formatos} unidad="interacciones promedio" mostrarPct={false} />
          <p className="mt-3 text-xs text-bruma">Base: {formatos.map((x) => `${x.nombre} (${formatNumber(x.n)})`).join(' · ')}</p>
        </ChartFrame>

        <ChartFrame className="lg:col-span-12" index="05.10" titulo={M.destacados.titulo} subtitulo={M.destacados.subtitulo}>
          <Highlights universos={f.marcas} desde={f.desde} hasta={f.hasta} />
        </ChartFrame>
      </div>
    </div>
  );
}

export function References() {
  const R = benchmark.referencias;
  return (
    <section aria-labelledby="referencias-titulo" className="mt-24">
      <div className="flex items-center gap-4">
        <h4 id="referencias-titulo" className="eyebrow text-rosa">
          {R.titulo}
        </h4>
        <span className="h-px flex-1 bg-rosa/25" aria-hidden="true" />
      </div>
      <p className="mt-4 max-w-2xl text-sm text-bruma">{R.aviso}</p>
      <ol className="mt-10 divide-y divide-rosa/10">
        {R.items.map((r, i) => (
          <li key={r.id} className="grid gap-4 py-8 lg:grid-cols-12 lg:gap-8">
            <p className="display num text-[length:var(--step-3)] text-rosa/60 lg:col-span-1">{String(i + 1).padStart(2, '0')}</p>
            <div className="lg:col-span-4">
              <p className="font-display text-[length:var(--step-2)] italic leading-tight text-marfil">{r.nombre}</p>
              <span className={`eyebrow mt-3 inline-flex rounded-full border px-3 py-1 ${r.estado === 'verificado' ? 'border-rosa/40 text-rosa' : 'border-dashed border-bruma/50 text-bruma'}`}>
                {r.estado === 'verificado' ? 'Fuente verificada' : 'Por verificar'}
              </span>
            </div>
            <dl className="grid gap-3 text-sm lg:col-span-7">
              <div>
                <dt className="eyebrow text-bruma">País</dt>
                <dd className="text-marfil">{r.pais ?? 'Por verificar'}</dd>
              </div>
              <div>
                <dt className="eyebrow text-bruma">Marcas y aliados</dt>
                <dd className="text-marfil">{r.marcas ?? 'Por verificar'}</dd>
              </div>
              <div>
                <dt className="eyebrow text-bruma">Descripción</dt>
                <dd className="text-bruma">{r.descripcion}</dd>
              </div>
              {r.fuente && (
                <div>
                  <dt className="sr-only">Fuente</dt>
                  <dd>
                    <a href={r.fuente.url} target="_blank" rel="noopener noreferrer" className="text-rosa underline underline-offset-4">
                      Fuente: {r.fuente.nombre}
                      <span className="sr-only"> (se abre en una pestaña nueva)</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
