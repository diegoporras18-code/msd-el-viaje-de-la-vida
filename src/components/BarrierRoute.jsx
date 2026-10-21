import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ease } from '../lib/motion.js';

// Ruta sinuosa (viewBox 600×600): de abajo a la izquierda hacia arriba a la derecha.
const ROUTE =
  'M 40 560 C 120 560 150 480 100 430 C 50 380 110 320 190 350 C 270 380 300 470 370 430 C 440 390 350 300 290 260 C 230 220 290 140 370 170 C 450 200 470 290 525 235 C 575 185 505 115 545 60';
const DIRECT = 'M 40 560 L 545 60';
const START = { x: 40, y: 560 };
const END = { x: 545, y: 60 };
// Posición de cada barrera a lo largo de la ruta (fracción de su longitud).
const STOPS = [0.17, 0.4, 0.63, 0.85];

const pad = (n) => String(n).padStart(2, '0');

/**
 * Scrollytelling: una ruta que se dibuja con el scroll, activa cada barrera al alcanzarla
 * y al final se transforma en el camino directo. Con movimiento reducido se muestra completa y estática.
 */
export default function BarrierRoute({ content }) {
  const { titulo, entradilla, barreras, cierre, inicio, destino, descripcionGrafico } = content;
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const reduce = useReducedMotion();
  const [points, setPoints] = useState([]);
  const [active, setActive] = useState(-1);
  const [finished, setFinished] = useState(false);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setPoints(STOPS.map((f) => path.getPointAtLength(total * f)));
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const draw = useTransform(scrollYProgress, [0.04, 0.78], [0, 1]);
  const direct = useTransform(scrollYProgress, [0.82, 0.96], [0, 1]);
  const routeOpacity = useTransform(scrollYProgress, [0.82, 0.96], [1, 0.22]);

  useMotionValueEvent(draw, 'change', (v) => {
    setActive(STOPS.filter((f) => v >= f).length - 1);
  });
  useMotionValueEvent(scrollYProgress, 'change', (v) => setFinished(v >= 0.86));

  const isStatic = Boolean(reduce);
  const current = isStatic ? barreras.length - 1 : active;
  const done = isStatic || finished;

  const itemState = (i) => {
    if (isStatic) return 'opacity-100';
    if (done) return 'opacity-0 lg:opacity-50';
    if (i === current) return 'opacity-100 translate-y-0';
    if (i < current) return 'opacity-0 -translate-y-3 lg:opacity-50 lg:translate-y-0';
    return 'opacity-0 translate-y-3 lg:opacity-25 lg:translate-y-0';
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ruta-titulo"
      className={isStatic ? 'py-20' : 'h-[420vh]'}
    >
      <div className={isStatic ? '' : 'sticky top-0 h-[100svh] overflow-hidden'}>
        <div
          className="shell mx-auto grid h-full max-w-[1440px] gap-x-12 gap-y-5 py-8 [grid-template-areas:'head'_'map'_'list'] [grid-template-rows:auto_minmax(0,1fr)_auto] lg:items-center lg:py-16 lg:[grid-template-areas:'head_map'_'list_map'] lg:[grid-template-columns:5fr_7fr] lg:[grid-template-rows:auto_1fr]"
        >
          <header className="[grid-area:head] lg:self-end">
            <p className="eyebrow text-rosa">La ruta</p>
            <h3 id="ruta-titulo" className="display mt-3 text-[length:var(--step-3)] text-marfil">
              {titulo}
            </h3>
            <p className="mt-4 max-w-md text-[length:var(--step--1)] text-bruma sm:text-[length:var(--step-0)]">
              {entradilla}
            </p>
          </header>

          <div className={`min-h-0 [grid-area:list] lg:self-start ${isStatic ? '' : 'grid lg:block'}`}>
            <ol className={isStatic ? 'space-y-8' : 'grid [grid-area:1/1] lg:block lg:space-y-6'}>
              {barreras.map((b, i) => (
                <li
                  key={b.id}
                  aria-current={!isStatic && i === current ? 'step' : undefined}
                  className={`${isStatic ? '' : '[grid-area:1/1]'} flex gap-4 transition-all duration-700 ease-out motion-reduce:transition-none ${itemState(i)}`}
                >
                  <span className="display num pt-1 text-[length:var(--step-1)] text-fucsia" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div>
                    <h4 className="font-display text-[length:var(--step-2)] italic leading-tight text-marfil">{b.titulo}</h4>
                    <p className="mt-2 max-w-md text-[length:var(--step--1)] leading-relaxed text-bruma sm:text-[length:var(--step-0)]">
                      {b.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p
              className={`display text-[length:var(--step-2)] italic text-rosa transition-all duration-700 motion-reduce:transition-none lg:mt-10 ${
                isStatic ? 'mt-10' : '[grid-area:1/1] self-end lg:[grid-area:auto]'
              } ${done ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
            >
              {cierre}
            </p>
          </div>

          <div className="relative min-h-0 [grid-area:map] lg:h-full">
            <svg
              viewBox="0 0 600 600"
              className="mx-auto h-full max-h-[70svh] w-full overflow-visible"
              role="img"
              aria-label={descripcionGrafico}
            >
              <defs>
                <linearGradient id="ruta-grad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F4A6C4" />
                  <stop offset="100%" stopColor="#E2457F" />
                </linearGradient>
              </defs>

              {/* Guía tenue: la ruta completa, como un mapa aún no recorrido. */}
              <path d={ROUTE} fill="none" stroke="#F4A6C4" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />

              <motion.path
                ref={pathRef}
                d={ROUTE}
                fill="none"
                stroke="url(#ruta-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                style={isStatic ? { opacity: 0.3 } : { pathLength: draw, opacity: routeOpacity }}
              />

              <motion.path
                d={DIRECT}
                fill="none"
                stroke="#E2457F"
                strokeWidth="5"
                strokeLinecap="round"
                style={isStatic ? undefined : { pathLength: direct }}
              />

              <circle cx={START.x} cy={START.y} r="7" fill="#F4A6C4" />
              <circle cx={END.x} cy={END.y} r="9" fill={done ? '#E2457F' : 'none'} stroke="#E2457F" strokeWidth="2" />
              <text x={START.x} y={START.y + 38} className="fill-bruma font-sans text-[22px]">
                {inicio}
              </text>
              <text x={END.x} y={END.y - 26} textAnchor="end" className="fill-bruma font-sans text-[22px]">
                {destino}
              </text>

              {points.map((p, i) => {
                const reached = isStatic || i <= current;
                return (
                  <g key={i} transform={`translate(${p.x} ${p.y})`}>
                    {!isStatic && i === current && !done && (
                      <motion.circle
                        r="14"
                        fill="none"
                        stroke="#E2457F"
                        strokeWidth="2"
                        initial={{ scale: 1, opacity: 0.9 }}
                        animate={{ scale: 2.4, opacity: 0 }}
                        transition={{ duration: 1.6, ease: ease.out, repeat: Infinity }}
                      />
                    )}
                    <motion.circle
                      r="14"
                      stroke="#E2457F"
                      strokeWidth="2"
                      initial={false}
                      animate={{ scale: reached ? 1 : 0.55, fill: reached ? '#E2457F' : '#1A0B16' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    />
                    <text
                      x="26"
                      y="8"
                      className={`num font-sans text-[22px] font-semibold transition-opacity duration-500 ${reached ? 'fill-marfil opacity-100' : 'fill-bruma opacity-40'}`}
                    >
                      {pad(i + 1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
