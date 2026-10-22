import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import LineReveal from './LineReveal.jsx';
import { duration, ease } from '../lib/motion.js';

// Geometría ilustrativa en un lienzo de 100 × 100 que se estira al contenedor.
// Carril izquierdo: ruta oportuna. Carril derecho: recorrido con obstáculos.
const T = 9;
const O = 73;
const START = 2;
const END = 98;
const Y0 = 9;
const Y1 = 91;
const H = 3.4; // media altura de cada desviación

// Cada obstáculo cambia la trayectoria de una forma que se lee sin explicación previa.
const FORMAS = {
  // Vueltas antes de avanzar: falta de información.
  bucle: (c) => `L ${O} ${c - H} C ${O + 17} ${c - H} ${O + 17} ${c + H * 0.6} ${O} ${c + H * 0.1} C ${O - 15} ${c - H * 0.4} ${O - 13} ${c + H} ${O} ${c + H}`,
  // Idas y vueltas: trámites.
  zigzag: (c) => `L ${O} ${c - H} L ${O + 11} ${c - H * 0.6} L ${O - 11} ${c - H * 0.2} L ${O + 11} ${c + H * 0.2} L ${O - 11} ${c + H * 0.6} L ${O} ${c + H}`,
  // Un rodeo largo: distancias.
  desvio: (c) => `L ${O} ${c - H} C ${O + 30} ${c - H} ${O + 30} ${c + H} ${O} ${c + H}`,
  // Avanza y retrocede: costos que obligan a aplazar.
  retroceso: (c) => `L ${O} ${c - H} L ${O} ${c + H * 0.3} C ${O} ${c + H} ${O + 14} ${c + H} ${O + 14} ${c} C ${O + 14} ${c - H} ${O + 3} ${c - H} ${O + 3} ${c - H * 0.2} C ${O + 3} ${c + H * 0.5} ${O} ${c + H * 0.6} ${O} ${c + H}`,
  // Se detiene en espirales: demoras.
  espera: (c) => {
    let d = `L ${O} ${c - H}`;
    for (let k = 0; k < 3; k++) {
      const y = c - H + k * ((2 * H) / 3);
      d += ` C ${O + 8} ${y} ${O + 8} ${y + 2} ${O} ${y + 2} C ${O - 8} ${y + 2} ${O - 8} ${y + 0.4} ${O} ${y + (2 * H) / 3}`;
    }
    return `${d} L ${O} ${c + H}`;
  },
};

function buildSequence(etapas, obstaculos) {
  const seq = [];
  etapas.forEach((e, i) => {
    seq.push({ ...e, tipo: 'etapa', n: i + 1 });
    obstaculos.filter((o) => o.despuesDe === e.id).forEach((o) => seq.push({ ...o, tipo: 'obstaculo' }));
  });
  const step = (Y1 - Y0) / (seq.length - 1);
  return seq.map((it, i) => ({ ...it, y: Y0 + i * step }));
}

function buildPaths(seq) {
  const oportuna = `M ${T} ${START} L ${T} ${END}`;
  let obst = `M ${T} ${START} C ${T} ${START + 5} ${O} ${START + 1} ${O} ${Y0 - 4}`;
  for (const it of seq) obst += it.tipo === 'obstaculo' ? ` ${FORMAS[it.forma](it.y)}` : ` L ${O} ${it.y}`;
  return { oportuna, obstaculos: `${obst} L ${O} ${END}` };
}

// Tabla para dibujar ambos trazos al mismo ritmo vertical, aunque uno sea más largo y retroceda.
function sample(path, n = 700) {
  const total = path.getTotalLength();
  const pts = [];
  let maxY = -Infinity;
  for (let i = 0; i <= n; i++) {
    const p = path.getPointAtLength((total * i) / n);
    maxY = Math.max(maxY, p.y);
    pts.push({ x: p.x, y: p.y, maxY, f: i / n });
  }
  return pts;
}

function at(lut, y) {
  if (!lut) return null;
  let lo = 0;
  let hi = lut.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lut[mid].maxY >= y) hi = mid;
    else lo = mid + 1;
  }
  return lut[lo];
}

/**
 * Scrollytelling del capítulo 01: etapas de la atención (ruta oportuna) frente al recorrido
 * con obstáculos. Ilustrativo: no representa tiempos ni distancias reales.
 * Con movimiento reducido se muestra completo y estático.
 */
export default function BarrierRoute({ content }) {
  const { eyebrow, titulo, subtitulo, matiz, leyenda, pista, descripcionGrafico, etapas, obstaculos, cierre, puente } = content;
  const seq = useMemo(() => buildSequence(etapas, obstaculos), [etapas, obstaculos]);
  const paths = useMemo(() => buildPaths(seq), [seq]);
  const reduce = useReducedMotion();
  const isStatic = Boolean(reduce);

  const sceneRef = useRef(null);
  const refT = useRef(null);
  const refO = useRef(null);
  const lut = useRef({ t: null, o: null });
  const [listo, setListo] = useState(false);
  const [active, setActive] = useState(-1);

  useLayoutEffect(() => {
    if (!refT.current || !refO.current) return;
    lut.current = { t: sample(refT.current), o: sample(refO.current) };
    setListo(true);
  }, [paths]);

  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ['start start', 'end end'] });
  const cursor = useTransform(scrollYProgress, [0.03, 0.9], [START, END]);
  const lenT = useTransform(cursor, (y) => at(lut.current.t, y)?.f ?? 0);
  const lenO = useTransform(cursor, (y) => at(lut.current.o, y)?.f ?? 0);
  const dotTx = useTransform(cursor, (y) => `${at(lut.current.t, y)?.x ?? T}%`);
  const dotTy = useTransform(cursor, (y) => `${at(lut.current.t, y)?.y ?? START}%`);
  const dotOx = useTransform(cursor, (y) => `${at(lut.current.o, y)?.x ?? T}%`);
  const dotOy = useTransform(cursor, (y) => `${at(lut.current.o, y)?.y ?? START}%`);

  useMotionValueEvent(cursor, 'change', (y) => {
    let i = -1;
    seq.forEach((it, k) => {
      if (it.y <= y + 0.6) i = k;
    });
    setActive(i);
  });

  const current = isStatic ? seq.length - 1 : active;
  const item = seq[current];
  const totalEtapas = etapas.length;

  return (
    <div className="relative">
      {/* Introducción: problema en una frase */}
      <header className="shell mx-auto max-w-[1440px] pb-8 pt-4 sm:pb-12">
        <p className="eyebrow text-rosa">{eyebrow}</p>
        <LineReveal
          as="h3"
          id="ruta-titulo"
          className="display mt-6 max-w-[16ch] text-[length:var(--step-4)] text-marfil"
          lines={[{ text: titulo.linea1 }, { text: titulo.linea2, className: 'italic text-rosa' }]}
        />
        <motion.p
          className="mt-8 max-w-2xl font-display text-[length:var(--step-2)] leading-snug text-marfil/90"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: duration.enter, ease: ease.out, delay: 0.15 }}
        >
          {subtitulo}
        </motion.p>
        <p className="mt-5 max-w-xl text-sm text-bruma">{matiz}</p>
      </header>

      {/* Escena: dos recorridos que avanzan con el scroll */}
      <section ref={sceneRef} aria-labelledby="ruta-titulo" style={isStatic ? undefined : { height: `${seq.length * 34 + 30}vh` }}>
        <div className={isStatic ? 'py-8' : 'sticky top-0 h-[100svh] overflow-hidden'}>
          <div className="shell mx-auto grid h-full max-w-[1440px] grid-rows-[auto_minmax(0,1fr)_auto] gap-y-4 pb-5 pt-[4.5rem] lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:pb-10 lg:pt-24">
            <Legend leyenda={leyenda} className="lg:col-span-5 lg:col-start-1 lg:row-start-1" />

            {/* Lienzo */}
            <div
              className={`relative min-h-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 ${isStatic ? 'h-[min(1100px,140svh)] min-h-[640px]' : ''}`}
              role="img"
              aria-label={descripcionGrafico}
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <path d={paths.oportuna} fill="none" stroke="#F4A6C4" strokeOpacity="0.14" strokeWidth="2" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
                <path d={paths.obstaculos} fill="none" stroke="#E2457F" strokeOpacity="0.1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <motion.path
                  ref={refT}
                  d={paths.oportuna}
                  fill="none"
                  stroke="#F4A6C4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={isStatic || !listo ? { pathLength: isStatic ? 1 : 0 } : { pathLength: lenT }}
                />
                <motion.path
                  ref={refO}
                  d={paths.obstaculos}
                  fill="none"
                  stroke="#E2457F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={isStatic || !listo ? { pathLength: isStatic ? 1 : 0 } : { pathLength: lenO }}
                />
              </svg>

              {/* Punto de partida compartido */}
              <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marfil" style={{ left: `${T}%`, top: `${START}%` }} aria-hidden="true" />

              {seq.map((it, i) => {
                const reached = i <= current;
                const isActive = i === current && !isStatic;
                if (it.tipo === 'etapa')
                  return (
                    <div key={it.id} aria-hidden="true">
                      <span
                        className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500 ${reached ? 'border-rosa bg-rosa' : 'border-rosa/40 bg-ciruela'}`}
                        style={{ left: `${T}%`, top: `${it.y}%` }}
                      />
                      <span
                        className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500 ${reached ? 'border-fucsia bg-ciruela' : 'border-fucsia/20 bg-ciruela'}`}
                        style={{ left: `${O}%`, top: `${it.y}%` }}
                      />
                      <p
                        className={`absolute -translate-y-1/2 font-display text-[15px] italic leading-[1.1] transition-all duration-700 motion-reduce:transition-none sm:text-lg lg:text-2xl ${
                          reached ? 'opacity-100' : 'translate-x-2 opacity-0'
                        } ${isActive ? 'text-marfil' : 'text-marfil/70'}`}
                        style={{ left: `calc(${T}% + 16px)`, top: `${it.y}%`, width: `calc(${O - 15 - T}% - 16px)` }}
                      >
                        {it.nombre}
                      </p>
                    </div>
                  );
                return (
                  <p
                    key={it.id}
                    aria-hidden="true"
                    className={`eyebrow absolute hidden -translate-y-1/2 whitespace-nowrap text-right transition-all duration-700 motion-reduce:transition-none sm:block ${
                      reached ? 'opacity-100' : '-translate-x-2 opacity-0'
                    } ${isActive ? 'text-fucsia' : 'text-fucsia/70'}`}
                    style={{ right: `${100 - (O - 15)}%`, top: `${it.y}%` }}
                  >
                    {it.corto}
                  </p>
                );
              })}

              {!isStatic && listo && (
                <>
                  <motion.span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosa shadow-[0_0_18px_4px_rgba(244,166,196,0.45)]" style={{ left: dotTx, top: dotTy }} aria-hidden="true" />
                  <motion.span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fucsia shadow-[0_0_18px_4px_rgba(226,69,127,0.5)]" style={{ left: dotOx, top: dotOy }} aria-hidden="true" />
                </>
              )}
            </div>

            {/* Explicación del paso actual */}
            {!isStatic && (
              <div className="relative h-[9.5rem] sm:h-[8.5rem] lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:h-auto lg:self-center" aria-hidden="true">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={item?.id ?? 'pista'}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: ease.out }}
                    className={`border-l-2 pl-4 lg:pl-6 ${item?.tipo === 'obstaculo' ? 'border-fucsia' : 'border-rosa'}`}
                  >
                    {item ? <Caption item={item} total={totalEtapas} /> : <p className="font-display text-[length:var(--step-1)] italic text-bruma">{pista}</p>}
                  </motion.div>
                </AnimatePresence>
                <StageProgress etapas={seq.filter((s) => s.tipo === 'etapa')} current={item} />
              </div>
            )}
          </div>
        </div>

        {/* Texto completo del recorrido: siempre disponible para lectores de pantalla; visible sin animación. */}
        <ol className={isStatic ? 'shell mx-auto mt-4 max-w-3xl space-y-6' : 'sr-only'}>
          {seq.map((it) => (
            <li key={it.id} className={`border-l-2 pl-4 ${it.tipo === 'obstaculo' ? 'border-fucsia' : 'border-rosa'}`}>
              <Caption item={it} total={totalEtapas} />
            </li>
          ))}
        </ol>
      </section>

      <Epilogue cierre={cierre} puente={puente} />
    </div>
  );
}

function Legend({ leyenda, className = '' }) {
  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-marfil sm:text-sm">
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded-full bg-rosa" aria-hidden="true" />
          {leyenda.oportuna}
        </li>
        <li className="flex items-center gap-2">
          <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
            <path d="M1 5 C 5 -1, 8 11, 12 5 S 19 -1, 25 5" fill="none" stroke="#E2457F" strokeWidth="2" />
          </svg>
          {leyenda.obstaculos}
        </li>
      </ul>
      <p className="mt-1.5 text-[12px] text-bruma">{leyenda.nota}</p>
    </div>
  );
}

function Caption({ item, total }) {
  const obst = item.tipo === 'obstaculo';
  return (
    <>
      <p className={`eyebrow ${obst ? 'text-fucsia' : 'text-rosa'}`}>{obst ? 'Obstáculo posible' : `Etapa ${item.n} de ${total}`}</p>
      <p className="mt-1.5 font-display text-[length:var(--step-1)] italic leading-tight text-marfil lg:text-[length:var(--step-2)]">{item.nombre}</p>
      <p className="mt-1.5 max-w-md text-sm leading-snug text-bruma lg:mt-3 lg:text-base">{item.texto}</p>
    </>
  );
}

/** Progreso de las cinco etapas (solo escritorio, donde hay espacio). */
function StageProgress({ etapas, current }) {
  const idx = current ? etapas.findIndex((e) => e.y > current.y + 0.01) : 0;
  const done = idx === -1 ? etapas.length : idx;
  return (
    <ol className="mt-12 hidden space-y-2 lg:block">
      {etapas.map((e, i) => (
        <li key={e.id} className={`flex items-center gap-3 text-sm transition-colors duration-500 ${i < done ? 'text-marfil' : 'text-bruma/50'}`}>
          <span className={`h-px transition-all duration-500 ${i < done ? 'w-8 bg-rosa' : 'w-4 bg-bruma/30'}`} aria-hidden="true" />
          {e.nombre}
        </li>
      ))}
    </ol>
  );
}

/** Cierre y transición: la línea del recorrido se convierte en la onda musical del capítulo 02. */
function Epilogue({ cierre, puente }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const wave = (dir) => {
    let d = 'M 50 0 L 50 42';
    for (let i = 0; i <= 50; i++) {
      const x = 50 + dir * i;
      const amp = (i / 50) * 9 + 1;
      d += ` L ${x} ${(55 + Math.sin(i / 3.2) * amp).toFixed(2)}`;
    }
    return d;
  };

  return (
    <div className="relative">
      <div className="shell mx-auto max-w-[1440px] pb-6 pt-14 text-center">
        <LineReveal
          as="p"
          className="display mx-auto max-w-[22ch] text-[length:var(--step-3)] text-marfil"
          lines={[{ text: cierre.linea1 }, { text: cierre.linea2, className: 'italic text-rosa' }]}
        />
        <motion.p
          className="mx-auto mt-8 max-w-2xl text-bruma"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: duration.enter, ease: ease.out, delay: 0.4 }}
        >
          {cierre.texto}
        </motion.p>
      </div>

      <div ref={ref} className="relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="block h-[26svh] min-h-[180px] w-full" aria-hidden="true">
          <defs>
            <linearGradient id="puente-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F4A6C4" />
              <stop offset="100%" stopColor="#E2457F" />
            </linearGradient>
          </defs>
          {[1, -1].map((dir) => (
            <motion.path
              key={dir}
              d={wave(dir)}
              fill="none"
              stroke="url(#puente-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: reduce ? 1 : draw }}
            />
          ))}
        </svg>
        <motion.div
          className="shell mx-auto max-w-xl pb-6 pt-4 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: ease.out }}
        >
          <p className="eyebrow text-fucsia">{puente.eyebrow}</p>
          <p className="mt-3 font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{puente.texto}</p>
        </motion.div>
      </div>
    </div>
  );
}
