import { useMemo } from 'react';
import { motion } from 'motion/react';
import ChapterOpener from '../components/ChapterOpener.jsx';
import { useResultados } from '../state/DataContext.jsx';
import { hechos } from '../lib/data/hechos.js';
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

/** Capítulo 06: tres hallazgos (hecho medido, interpretación, hipótesis, recomendación) y preguntas clave. */
export default function Conclusiones() {
  const res = useResultados();
  const h = useMemo(() => hechos(res, todayBogota()), [res]);
  const hallazgos = conclusiones.hallazgos.filter((x) => h[x.hecho]?.disponible).slice(0, 3);

  return (
    <section id="conclusiones" aria-labelledby="conclusiones-titulo" className="relative scroll-mt-16">
      <ChapterOpener compacto capitulo={conclusiones.capitulo} titulo={conclusiones.titulo} entradilla={conclusiones.periodo} tituloId="conclusiones-titulo" />

      <div className="shell mx-auto max-w-[1440px] pb-20">
        <ol>
          {hallazgos.map((x, i) => {
            const hecho = h[x.hecho];
            return (
              <motion.li key={x.id} className="grid gap-6 border-t border-rosa/15 py-12 lg:grid-cols-12 lg:gap-10" {...reveal(0.05 * i)}>
                <div className="lg:col-span-4">
                  <p className="display num text-[length:var(--step-4)] leading-none text-rosa">{hecho.cifra}</p>
                  <p className="mt-2 text-sm text-bruma">{hecho.unidad}</p>
                  {x.estado === 'preliminar' && (
                    <span className="eyebrow mt-4 inline-flex rounded-full border border-rosa/40 px-3 py-1 text-rosa">Preliminar</span>
                  )}
                </div>
                <div className="space-y-5 lg:col-span-8">
                  <h3 className="font-display text-[length:var(--step-2)] italic leading-tight text-marfil">{x.titulo}</h3>
                  <p className="text-marfil/90">
                    <Etiqueta tono="text-fucsia">{hecho.tipo === 'referencia' ? 'Dato de referencia' : 'Hecho medido'}</Etiqueta>
                    {hecho.texto}
                  </p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <p className="text-sm text-bruma">
                      <Etiqueta>Interpretación</Etiqueta>
                      {x.interpretacion}
                    </p>
                    {x.hipotesis && (
                      <p className="text-sm text-bruma">
                        <Etiqueta>Hipótesis por verificar</Etiqueta>
                        {x.hipotesis}
                      </p>
                    )}
                  </div>
                  <p className="border-l-2 border-fucsia pl-4 text-marfil">
                    <Etiqueta tono="text-rosa">Recomendación</Etiqueta>
                    {x.recomendacion}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <motion.div className="mt-16 border-t border-rosa/20 pt-10" {...reveal()}>
          <h3 className="display text-[length:var(--step-3)] text-marfil">
            Preguntas <span className="italic text-rosa">clave</span>
          </h3>
          <dl className="mt-8 divide-y divide-rosa/10">
            {conclusiones.preguntas.map((q) => {
              const hecho = q.hecho ? h[q.hecho] : null;
              const respuesta = hecho?.disponible ? [hecho.texto, q.complemento].filter(Boolean).join(' ') : q.respuesta;
              const estado = hecho && !hecho.disponible ? ESTADO[hecho.estado] ?? ESTADO.analisis : q.estado === 'preliminar' ? 'Preliminar' : hecho?.tipo === 'referencia' ? 'Referencia' : null;
              return (
                <div key={q.pregunta} className="grid gap-2 py-5 lg:grid-cols-12 lg:gap-8">
                  <dt className="font-display text-[length:var(--step-1)] italic leading-snug text-marfil lg:col-span-5">{q.pregunta}</dt>
                  <dd className="text-sm text-bruma lg:col-span-7">
                    {estado && <span className="eyebrow mr-2 inline-flex rounded-full border border-rosa/30 px-2.5 py-0.5 text-rosa">{estado}</span>}
                    {respuesta}
                  </dd>
                </div>
              );
            })}
          </dl>
        </motion.div>
      </div>

      <footer className="shell mx-auto max-w-[1440px] border-t border-rosa/15 py-12 text-xs leading-relaxed text-bruma">
        <p>El Viaje de la Vida · MSD × Lotengo · Concierto de Fonseca, Bogotá, 24 de octubre de 2026.</p>
        <p className="mt-2">Escucha social: SentiOne, sin filtro geográfico. {realidad.fuente.texto}</p>
      </footer>
    </section>
  );
}
