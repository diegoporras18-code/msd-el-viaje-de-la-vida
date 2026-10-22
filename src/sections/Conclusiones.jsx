import { useMemo } from 'react';
import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { corteDatos, hechos } from '../lib/data/hechos.js';
import { todayBogota } from '../lib/data/dates.js';
import { conclusiones } from '../content/conclusiones.js';
import { realidad } from '../content/realidad.js';
import { duration, ease } from '../lib/motion.js';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: duration.enter, ease: ease.out, delay },
});

const ESTADO = { evento: 'Después del concierto', medicion: 'Pendiente de medición', analisis: 'Próxima actualización' };

function Etiqueta({ children, tono = 'text-bruma' }) {
  return <span className={`eyebrow block ${tono}`}>{children}</span>;
}

/** Capítulo 06: tres mensajes ejecutivos (cifra, respuesta, significado y oportunidad) y preguntas clave plegadas. */
export default function Conclusiones() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const hallazgos = conclusiones.hallazgos.filter((x) => h[x.hecho]?.disponible).slice(0, 3);

  return (
    <section id="conclusiones" aria-labelledby="conclusiones-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={conclusiones.capitulo} titulo={conclusiones.titulo} entradilla={conclusiones.periodo(corteDatos(res))} tituloId="conclusiones-titulo" />

      <div className="shell mx-auto max-w-[1440px] pb-14">
        <ol className="grid gap-4 lg:grid-cols-3">
          {hallazgos.map((x, i) => {
            const hecho = h[x.hecho];
            return (
              <motion.li key={x.id} className="flex flex-col rounded-sm border border-rosa/15 p-5 sm:p-6" {...reveal(0.08 * i)}>
                <p className="eyebrow num text-fucsia">0{i + 1}</p>
                <p className="mt-2 text-sm text-bruma">{x.pregunta}</p>
                <h3 className="mt-3 font-display text-[length:var(--step-2)] italic leading-tight text-marfil">{x.titulo}</h3>
                <p className="mt-4 flex items-baseline gap-3">
                  <span className="display num text-[length:var(--step-3)] leading-none text-rosa">{hecho.cifra}</span>
                  <span className="text-xs text-bruma">{hecho.unidad}</span>
                </p>
                <p className="mt-4 text-sm text-bruma">
                  <Etiqueta>Qué significa</Etiqueta>
                  {x.significa}
                </p>
                <p className="mt-4 border-l-2 border-fucsia pl-3 text-sm text-marfil">
                  <Etiqueta tono="text-rosa">Oportunidad</Etiqueta>
                  {x.oportunidad}
                </p>
                {x.estado === 'preliminar' && <span className="eyebrow mt-auto pt-5 text-rosa/80">Preliminar</span>}
              </motion.li>
            );
          })}
        </ol>

        <motion.details className="group mt-10 border-t border-rosa/20 pt-6" {...reveal()}>
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4">
            <span className="display text-[length:var(--step-2)] text-marfil">
              Preguntas <span className="italic text-rosa">clave</span>
            </span>
            <span className="text-sm text-rosa underline underline-offset-4 group-open:hidden">Ver respuestas con cifras</span>
            <span className="hidden text-sm text-rosa underline underline-offset-4 group-open:inline">Ocultar</span>
          </summary>
          <dl className="mt-4 divide-y divide-rosa/10">
            {conclusiones.preguntas.map((q) => {
              const hecho = q.hecho ? h[q.hecho] : null;
              const respuesta = hecho?.disponible ? hecho.texto : q.respuesta;
              const estado = hecho && !hecho.disponible ? ESTADO[hecho.estado] ?? ESTADO.analisis : hecho?.tipo === 'referencia' ? 'Referencia' : null;
              return (
                <div key={q.pregunta} className="grid gap-2 py-4 lg:grid-cols-12 lg:gap-8">
                  <dt className="font-display text-[length:var(--step-1)] italic leading-snug text-marfil lg:col-span-5">{q.pregunta}</dt>
                  <dd className="text-sm text-bruma lg:col-span-7">
                    {estado && <span className="eyebrow mr-2 inline-flex rounded-full border border-rosa/30 px-2.5 py-0.5 text-rosa">{estado}</span>}
                    {respuesta}
                  </dd>
                </div>
              );
            })}
          </dl>
        </motion.details>
      </div>

      <footer className="shell mx-auto max-w-[1440px] border-t border-rosa/15 py-10 text-xs leading-relaxed text-bruma">
        <p>El Viaje de la Vida · MSD × Lotengo · Concierto de Fonseca, Bogotá, 24 de octubre de 2026.</p>
        <p className="mt-2">Escucha social: SentiOne, sin filtro geográfico. {realidad.fuente.texto}</p>
      </footer>
    </section>
  );
}
