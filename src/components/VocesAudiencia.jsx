import { vocesAudiencia } from '../content/voces-audiencia.js';
export default function VocesAudiencia() {
  return (
    <section
      data-voces-audiencia
      aria-labelledby="voces-audiencia-titulo"
      className="mt-8 border-t border-rosa/15 pt-5"
    >
      <h4 id="voces-audiencia-titulo" className="eyebrow text-rosa">
        La audiencia también hizo parte
      </h4>
      <ul className="-mx-[var(--gutter)] mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {vocesAudiencia.textos.map((texto, i) => (
          <li
            key={i}
            className="w-[82%] shrink-0 snap-start rounded-sm border border-rosa/15 p-5 md:w-auto"
          >
            <blockquote className="break-words font-display text-xl italic leading-relaxed text-marfil">
              <p>“{texto}”</p>
            </blockquote>
          </li>
        ))}
      </ul>
      <p className="mt-3 max-w-3xl text-xs text-bruma">
        Comentarios originales, con autores anónimos, seleccionados del reel de
        Bésame.{' '}
        <a
          className="inline-flex min-h-[44px] items-center text-rosa underline underline-offset-4"
          href={vocesAudiencia.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver la publicación de origen
        </a>
      </p>
    </section>
  );
}
