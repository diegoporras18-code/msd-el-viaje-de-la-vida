import { sentimientoConcierto } from '../content/sentimiento-concierto.js';

/** Tarjetas editoriales del evento, separadas de las métricas temáticas generales. */
export default function TarjetasSentimientoConcierto() {
  return <section data-sentimiento-concierto aria-labelledby="sentimiento-concierto-titulo" className="mt-7">
    <h4 id="sentimiento-concierto-titulo" className="eyebrow mb-4 text-rosa">{sentimientoConcierto.titulo}</h4>
    <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
      {sentimientoConcierto.tarjetas.map(t => <li key={t.id} data-tono-concierto={t.id} className="relative flex w-[82%] shrink-0 snap-start flex-col rounded-sm border border-rosa/15 bg-ciruela-800/60 p-5 md:w-auto">
        <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-sm" style={{background:t.color}} aria-hidden="true" />
        <p className="eyebrow" style={{color:t.color}}>{t.sentimiento}</p>
        <h5 className="mt-4 font-display text-xl italic leading-snug text-marfil">{t.titulo}</h5>
        <p className="mt-3 text-sm leading-relaxed text-bruma">{t.texto}</p>
        <p className="mt-auto pt-4 text-xs text-rosa">{t.enfoque}</p>
      </li>)}
    </ul>
    <p className="mt-3 max-w-3xl text-xs text-bruma/80">{sentimientoConcierto.nota}</p>
  </section>;
}
