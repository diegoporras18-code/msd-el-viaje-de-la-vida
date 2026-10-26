// Enlaces públicos aportados expresamente para la galería editorial; sin contenido privado.
const publicaciones = [
  { plataforma: 'Instagram', formato: 'Publicación', url: 'https://www.instagram.com/p/De5rdIpx2W8/' },
  { plataforma: 'Instagram', formato: 'Reel', url: 'https://www.instagram.com/reel/De5ragcuCp0/' },
  { plataforma: 'LinkedIn', formato: 'Referencia compartida', url: 'https://lnkd.in/p/ex7BJQpq' },
  { plataforma: 'Facebook', formato: 'Video compartido', url: 'https://www.facebook.com/share/v/1G1xocGG15/' },
];
export default function GaleriaConcierto() {
  return <div data-galeria="concierto" className="mt-7">
    <h4 className="font-display text-2xl italic text-rosa">Publicaciones identificadas de la campaña</h4>
    <p className="mt-2 max-w-3xl text-sm text-bruma">Una selección de las referencias de El Viaje de la Vida. Las vistas previas y el contenido no pudieron comprobarse por restricciones de acceso de las plataformas; cada enlace abre la publicación original.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{publicaciones.map(p => <article key={p.url} className="flex flex-col border border-rosa/20 p-4">
      <p className="eyebrow text-fucsia">{p.plataforma}</p>
      <h5 className="mt-3 font-display text-xl text-marfil">{p.formato}</h5>
      <p className="mt-3 text-xs text-bruma">Vista previa no disponible. Fecha y descripción del contenido pendientes de comprobación.</p>
      <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-h-[44px] items-center pt-4 text-sm text-rosa underline underline-offset-4">Ver publicación original<span className="sr-only"> · {p.plataforma} · {p.formato}</span></a>
    </article>)}</div>
  </div>;
}
