import {
  resultadosCampana,
  consolidarBesame,
  cifraVisualizaciones,
  nombresRedesBesame,
  textoRedesBesame,
} from '../content/resultados-campana.js';
import { formatNumber } from '../lib/format.js';
const pct = (n) =>
  `${n.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
function Perfil({ titulo, items }) {
  return (
    <div className="rounded-sm border border-rosa/15 p-5">
      <h4 className="font-display text-xl italic text-marfil">{titulo}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((x, i) => (
          <li key={x.nombre}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="text-bruma">{x.nombre}</span>
              <span className="num text-rosa">{pct(x.valor)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-rosa/10">
              <div
                className={i === 0 ? 'h-full bg-fucsia' : 'h-full bg-rosa/70'}
                style={{ width: `${x.valor}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default function ResultadosBesame() {
  const b = resultadosCampana.besame,
    c = consolidarBesame();
  return (
    <section
      data-resultados-besame
      aria-labelledby="besame-titulo"
      className="mt-10 border-t border-rosa/20 pt-7"
    >
      <p className="eyebrow text-rosa">
        Bésame Radio · Facebook, Instagram y TikTok
      </p>
      <h3
        id="besame-titulo"
        className="mt-3 font-display text-[length:var(--step-2)] italic text-marfil"
      >
        Una audiencia afín. Un mensaje que siguió circulando.
      </h3>
      <p className="mt-3 max-w-3xl text-sm text-bruma">
        Bésame llevó el llamado de Fonseca a sus redes con un reel sobre
        prevención del cáncer de mama. El reel publicado en Facebook e Instagram
        el 25 de octubre amplió la exposición del mensaje después del concierto.
        Bésame también lo llevó a TikTok.
      </p>
      <p data-cobertura-numerica className="eyebrow mt-5 text-bruma">
        {c.redesSinMetricas.length
          ? 'Consolidado de cifras verificadas'
          : 'Consolidado · Facebook + Instagram + TikTok'}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border-l-2 border-fucsia py-2 pl-4">
          <p className="display num text-[length:var(--step-3)] text-rosa">
            {cifraVisualizaciones}
          </p>
          <p className="eyebrow mt-2 text-marfil">
            Visualizaciones en {textoRedesBesame(c.redesVisualizaciones)}
          </p>
          <p className="mt-2 text-xs text-bruma">
            {c.redesVisualizaciones
              .map(
                (id) =>
                  `${b[id].visualizacionesAproximadas ? 'aproximadamente ' : ''}${formatNumber(b[id].visualizaciones)} en ${nombresRedesBesame[id]}`,
              )
              .join(' + ')}
            .
          </p>
        </div>
        <div className="border-l-2 border-rosa py-2 pl-4">
          <p className="display num text-[length:var(--step-3)] text-rosa">
            {formatNumber(c.interacciones)}
          </p>
          <p className="eyebrow mt-2 text-marfil">{c.redesInteracciones.length === 3 ? 'Interacciones en las tres redes' : 'Interacciones registradas'}</p>
          <p className="mt-2 text-xs text-bruma">
            {c.redesInteracciones
              .map(
                (id) =>
                  `${formatNumber(b[id].interacciones)} ${b[id].fuenteInteracciones?.startsWith('suma_acciones_') ? 'acciones verificadas' : 'registradas'} de ${nombresRedesBesame[id]}`,
              )
              .join(' + ')}
            .
          </p>
        </div>
      </div>
      <div
        className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-bruma"
        data-acciones-besame
      >
        <span>
          <strong className="num text-marfil">{c.compartidos}</strong> veces
          compartido
        </span>
        <span>
          <strong className="num text-marfil">{c.guardados}</strong> guardados
        </span>
        <span>
          <strong className="num text-marfil">{c.comentarios}</strong>{' '}
          comentarios
        </span>
        <span>
          <strong className="num text-marfil">{c.reaccionesYMeGusta}</strong>{' '}
          reacciones y me gusta
        </span>
        <span>
          <strong className="num text-marfil">
            {b.instagram.republicaciones}
          </strong>{' '}
          republicaciones en Instagram
        </span>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-12">
        <figure className="lg:col-span-4">
          <a
            href={b.enlaces.find((e) => e.url.includes('instagram.com'))?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-sm border border-rosa/20"
          >
            <img
              src={`${import.meta.env.BASE_URL}media/concierto/fonseca.webp`}
              alt="Fonseca durante su intervención sobre el escenario, en el registro audiovisual del concierto."
              className="aspect-video w-full object-contain bg-black"
              loading="lazy"
            />
          </a>
          <figcaption className="mt-2 text-xs text-bruma">
            Fotograma del registro del concierto. Consulta el reel publicado por
            Bésame en sus redes.
          </figcaption>
          <div className="mt-2 flex flex-wrap gap-x-5">
            {b.enlaces.map((e) => (
              <a
                key={e.url}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center text-sm text-rosa underline underline-offset-4"
              >
                {e.nombre}
              </a>
            ))}
          </div>
        </figure>
        <div className="lg:col-span-8">
          <p className="eyebrow text-rosa">
            El perfil de la audiencia reportada
          </p>
          <p className="mt-2 text-sm text-bruma">
            <strong className="text-marfil">73 % mujeres</strong> ·{' '}
            <strong className="text-marfil">81,6 % Colombia</strong> ·{' '}
            <strong className="text-marfil">70,1 % entre 35 y 64 años</strong>.
          </p>
          <p className="mt-2 text-xs text-bruma/80">{b.audiencia.cobertura}.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Perfil titulo="Género" items={b.audiencia.genero} />
            <Perfil titulo="Edades" items={b.audiencia.edades} />
            <Perfil titulo="Países" items={b.audiencia.paises} />
          </div>
        </div>
      </div>
      {b.capturas.length > 0 && (
        <details className="mt-5 border-t border-rosa/15 pt-3">
          <summary className="min-h-[44px] cursor-pointer text-sm text-rosa">
            Ver los paneles originales
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b.capturas.map((c) => (
              <a
                key={c.src}
                href={`${import.meta.env.BASE_URL}${c.src}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${import.meta.env.BASE_URL}${c.src}`}
                  alt={c.alt}
                  className="h-auto w-full rounded-sm"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </details>
      )}
      <p className="mt-5 max-w-3xl text-xs leading-relaxed text-bruma/70">
        Fuente: capturas de Bésame facilitadas por el cliente. Las
        visualizaciones de Instagram están redondeadas; la suma es aproximada y
        no equivale a personas únicas. Las interacciones suman los totales
        reportados y las acciones visibles identificadas como tales.{' '}
        {c.redesSinMetricas.length > 0
          ? 'Las interacciones incluyen Facebook, Instagram y TikTok. Las visualizaciones de TikTok aún no fueron aportadas: el subtotal de visualizaciones corresponde a Facebook e Instagram.'
          : 'Las cifras verificadas de las tres redes están incorporadas al consolidado.'}
      </p>
    </section>
  );
}
