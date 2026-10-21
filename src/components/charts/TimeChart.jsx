import { useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useMeasure } from '../../lib/hooks.js';
import { formatNumber, formatOne } from '../../lib/format.js';
import { longDate, shortDate } from '../../lib/data/dates.js';
import { ease } from '../../lib/motion.js';

const niceMax = (v) => {
  const mag = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((f) => f * mag).find((x) => x >= v) ?? v;
};

const SRC = {
  bloque: 'Solo existe el total del periodo (sin detalle diario)',
  'base-filtrada': 'La línea base agregada no admite este filtro',
  null: 'Sin datos: día no cubierto por ninguna exportación',
};

/**
 * Serie temporal diaria. Días sin datos se dibujan como hueco rayado, nunca como cero.
 * series: [{ id, nombre, color, puntos: [{ d, v|null, src }] }]
 */
export default function TimeChart({ series, tipo = 'barras', alto = 260, picos = [], marcadores = [], bloques = [], unidad = 'registros', descripcion }) {
  const [wrapRef, w] = useMeasure();
  const inView = useInView(wrapRef, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(null);

  const fechas = series[0]?.puntos.map((p) => p.d) ?? [];
  const n = fechas.length;
  const W = Math.max(w, 280);
  const H = alto;
  const M = { l: 42, r: 10, t: 30, b: 28 };
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const valores = series
    .flatMap((s) => s.puntos.map((p) => p.v))
    .filter((v) => v != null)
    .concat(bloques.map((b) => b.promedio));
  const max = niceMax(Math.max(4, ...valores));
  const band = n ? iw / n : iw;
  const x = (i) => M.l + i * band;
  const cx = (i) => x(i) + band / 2;
  const y = (v) => M.t + ih - (v / max) * ih;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 54))));
  const picoSet = new Map(picos.map((p, k) => [p.d, k]));
  const maxPicos = W < 480 ? 3 : 5;
  const dur = reduce ? 0 : 0.7;
  const sig = series.map((s) => s.puntos.map((p) => p.v ?? '·').join(',')).join('|');

  const pick = (clientX, rect) => {
    const i = Math.floor(((clientX - rect.left) * (W / rect.width) - M.l) / band);
    setIdx(i >= 0 && i < n ? i : null);
  };

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={descripcion}
        tabIndex={0}
        className="block overflow-visible"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setIdx((i) => Math.min(n - 1, (i ?? -1) + 1));
          if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, (i ?? n) - 1));
          if (e.key === 'Escape') setIdx(null);
        }}
        onBlur={() => setIdx(null)}
      >
        <defs>
          <pattern id="hueco" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#C9B3C0" strokeOpacity="0.35" strokeWidth="2" />
          </pattern>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={M.l} x2={W - M.r} y1={y(max * f)} y2={y(max * f)} stroke="#F4A6C4" strokeOpacity={f ? 0.08 : 0.25} />
            {(f === 0 || f === 0.5 || f === 1) && (
              <text x={M.l - 8} y={y(max * f) + 4} textAnchor="end" className="num fill-bruma text-[12px]">
                {formatNumber(max * f)}
              </text>
            )}
          </g>
        ))}

        {fechas.map((d, i) =>
          i % every === 0 ? (
            <text key={d} x={cx(i)} y={H - 8} textAnchor="middle" className="fill-bruma text-[12px]">
              {shortDate(d)}
            </text>
          ) : null,
        )}

        {/* Huecos: días sin datos (nunca se dibujan como cero). */}
        {series[0]?.puntos.map((p, i) =>
          p.v == null && p.src !== 'bloque' ? (
            <rect key={p.d} x={x(i) + 1} y={M.t} width={Math.max(1, band - 2)} height={ih} fill="url(#hueco)" opacity="0.5" />
          ) : null,
        )}

        {bloques.map((b) => {
          const i0 = fechas.indexOf(b.desde);
          const i1 = fechas.indexOf(b.hasta);
          if (i0 < 0 || i1 < 0) return null;
          return (
            <g key={b.desde}>
              <rect x={x(i0)} y={M.t} width={x(i1 + 1) - x(i0)} height={ih} fill="#F4A6C4" opacity="0.04" />
              <line x1={x(i0)} x2={x(i1 + 1)} y1={y(b.promedio)} y2={y(b.promedio)} stroke="#F4A6C4" strokeWidth="2" strokeDasharray="2 4" />
              <text x={x(i0) + 4} y={y(b.promedio) - 8} className="fill-rosa text-[12px]">
                {b.etiqueta}
              </text>
            </g>
          );
        })}

        {tipo === 'barras' &&
          series[0]?.puntos.map((p, i) => {
            if (p.v == null) return null;
            const esPico = picoSet.has(p.d);
            const h = Math.max(p.v > 0 ? 1.5 : 0, (p.v / max) * ih);
            return (
              <motion.rect
                key={p.d}
                x={x(i) + Math.min(2, band * 0.15)}
                width={Math.max(1, band - Math.min(4, band * 0.3))}
                rx={Math.min(2, band / 4)}
                fill={esPico ? '#E2457F' : (series[0].color ?? '#F4A6C4')}
                opacity={idx == null || idx === i ? (p.src === 'base' ? 0.92 : 1) : 0.35}
                initial={{ height: 0, y: M.t + ih }}
                animate={inView ? { height: h, y: M.t + ih - h } : { height: 0, y: M.t + ih }}
                transition={{ duration: dur, ease: ease.out, delay: reduce ? 0 : Math.min(i * 0.018, 0.6) }}
              />
            );
          })}

        {tipo === 'lineas' &&
          series.map((s) => {
            let dPath = '';
            s.puntos.forEach((p, i) => {
              if (p.v == null) return;
              const prev = s.puntos[i - 1];
              dPath += `${!prev || prev.v == null ? 'M' : 'L'}${cx(i).toFixed(1)},${y(p.v).toFixed(1)}`;
            });
            return (
              <g key={s.id}>
                <motion.path
                  key={sig}
                  d={dPath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: inView ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 1.4, ease: ease.reveal }}
                />
                {n <= 45 && s.puntos.map((p, i) => (p.v == null ? null : <circle key={p.d} cx={cx(i)} cy={y(p.v)} r={idx === i ? 4.5 : 2.5} fill={s.color} />))}
              </g>
            );
          })}

        {picos.slice(0, maxPicos).map((p, k) => {
          const i = fechas.indexOf(p.d);
          if (i < 0) return null;
          const ty = Math.max(14, y(p.v) - 8);
          return (
            <motion.text
              key={p.d}
              x={cx(i)}
              y={ty}
              textAnchor={i > n - 3 ? 'end' : i < 2 ? 'start' : 'middle'}
              className="num fill-marfil text-[12px] font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: reduce ? 0 : 0.8 + k * 0.1 }}
            >
              {formatNumber(p.v)}
              {k === 0 ? ` · ${shortDate(p.d)}` : ''}
            </motion.text>
          );
        })}

        {marcadores.map((m) => {
          const i = fechas.indexOf(m.d);
          if (i < 0) return null;
          return (
            <g key={m.d}>
              <line x1={cx(i)} x2={cx(i)} y1={M.t - 6} y2={M.t + ih} stroke="#E2457F" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x={cx(i)} y={M.t - 12} textAnchor={i > n * 0.7 ? 'end' : 'middle'} className="fill-fucsia text-[12px] font-semibold">
                {m.etiqueta}
              </text>
            </g>
          );
        })}

        {idx != null && <line x1={cx(idx)} x2={cx(idx)} y1={M.t} y2={M.t + ih} stroke="#F7ECF1" strokeOpacity="0.4" />}

        <rect
          x={M.l}
          y={0}
          width={iw}
          height={H}
          fill="transparent"
          style={{ touchAction: 'pan-y' }}
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.ownerSVGElement.getBoundingClientRect())}
          onPointerDown={(e) => pick(e.clientX, e.currentTarget.ownerSVGElement.getBoundingClientRect())}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setIdx(null)}
        />
      </svg>

      {idx != null && fechas[idx] && (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-0 z-10 w-48 rounded-sm border border-rosa/30 bg-ciruela-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: Math.min(Math.max(0, (cx(idx) / W) * (w || W) - 96), Math.max(0, (w || W) - 192)) }}
        >
          <p className="font-semibold text-marfil">{longDate(fechas[idx])}</p>
          {series.map((s) => {
            const p = s.puntos[idx];
            return (
              <p key={s.id} className="mt-1 flex items-start gap-2 text-bruma">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                <span>
                  {series.length > 1 && `${s.nombre}: `}
                  {p.v != null ? (
                    <>
                      <span className="num text-marfil">{formatNumber(p.v)}</span> {unidad}
                      {p.src === 'base' && <span className="block text-bruma/80">Agregado preliminar</span>}
                    </>
                  ) : (
                    (SRC[p.src] ?? SRC.null)
                  )}
                </span>
              </p>
            );
          })}
          {bloques
            .filter((b) => fechas[idx] >= b.desde && fechas[idx] <= b.hasta)
            .map((b) => (
              <p key={b.desde} className="mt-1 text-rosa">
                Promedio del bloque: {formatOne(b.promedio)} por día
              </p>
            ))}
        </div>
      )}

      <div className="sr-only">
        <table>
          <caption>{descripcion}</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              {series.map((s) => (
                <th key={s.id} scope="col">
                  {s.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fechas.map((d, i) => (
              <tr key={d}>
                <th scope="row">{longDate(d)}</th>
                {series.map((s) => (
                  <td key={s.id}>{s.puntos[i].v ?? 'Sin datos'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const tieneHuecos = (series) => series.some((s) => s.puntos.some((p) => p.v == null && p.src !== 'bloque'));
