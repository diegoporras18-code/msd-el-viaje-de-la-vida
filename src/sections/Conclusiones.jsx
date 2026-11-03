import ChapterOpener from '../components/ChapterOpener.jsx';
import { conclusionesCampana } from '../content/resultados-campana.js';
export default function Conclusiones() {
  return (
    <section
      id="conclusiones"
      aria-labelledby="conclusiones-titulo"
      className="relative scroll-mt-16"
    >
      <ChapterOpener
        compacto
        capitulo="Conclusiones y oportunidades"
        titulo={{
          linea1: 'La atención ya está.',
          linea2: 'El siguiente paso es participar.',
        }}
        entradilla="Resultados de la activación y su amplificación, desde el 24 de octubre de 2026."
        tituloId="conclusiones-titulo"
      />
      <div className="shell mx-auto max-w-[1440px] pb-14">
        <ol className="grid gap-4 lg:grid-cols-3">
          {conclusionesCampana.map((x) => (
            <li
              key={x.id}
              className="flex flex-col rounded-sm border border-rosa/15 p-5 sm:p-6"
            >
              <h3 className="mt-3 font-display text-[length:var(--step-2)] italic leading-tight text-marfil">
                {x.titulo}
              </h3>
              <p className="eyebrow mt-5 text-rosa">Qué observamos</p>
              <p className="display num mt-2 text-[length:var(--step-3)] leading-none text-rosa">
                {x.cifra}
              </p>
              <p className="mt-2 text-xs text-bruma">{x.unidad}</p>
              <p className="mt-3 text-sm text-marfil">{x.observamos}</p>
              <p className="eyebrow mt-5 text-bruma">Qué significa</p>
              <p className="mt-2 text-sm text-bruma">{x.significa}</p>
              <div className="mt-5 border-l-2 border-fucsia pl-3">
                <p className="eyebrow text-rosa">Qué recomendamos</p>
                <p className="mt-2 text-sm text-marfil">{x.recomendamos}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-sm border border-rosa/20 p-5">
          <p className="eyebrow text-rosa">
            Un call to action para abrir la conversación
          </p>
          <p className="mt-3 font-display text-2xl italic text-marfil">
            ¿Qué pregunta sobre detección temprana te gustaría resolver?
          </p>
          <p className="mt-3 max-w-3xl text-sm text-bruma">
            Invitar a comentar y compartir, responder con información revisada
            por expertos y facilitar un enlace o QR de orientación. Una acción
            clara ayuda a dar continuidad al mensaje del concierto.
          </p>
        </div>
      </div>
      <footer className="shell mx-auto max-w-[1440px] border-t border-rosa/15 py-8 text-xs leading-relaxed text-bruma">
        <p>
          El Viaje de la Vida · MSD × Lotengo · Fonseca · Bogotá, 24 de octubre
          de 2026.
        </p>
        <p className="mt-2">
          Fuentes: registro audiovisual, publicaciones originales y paneles de
          Bésame aportados por el cliente. La asistencia, las visualizaciones y
          las interacciones son medidas diferentes; no se suman como personas
          alcanzadas.
        </p>
      </footer>
    </section>
  );
}
