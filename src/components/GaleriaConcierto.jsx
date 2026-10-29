import { useState } from 'react';
import { registroConcierto } from '../content/registro-concierto.js';

const publicaciones = [
  ['Instagram · publicación', 'https://www.instagram.com/p/De5rdIpx2W8/'],
  ['Instagram · reel', 'https://www.instagram.com/reel/De5ragcuCp0/'],
  ['LinkedIn', 'https://lnkd.in/p/ex7BJQpq'],
  ['Facebook · video', 'https://www.facebook.com/share/v/1G1xocGG15/'],
];
const piezas = [
  { id: 'video', nombre: 'Ver el video' },
  { id: 'escenario', nombre: 'El escenario', src: 'escenario.webp', alt: 'Fonseca en las pantallas del escenario durante su intervención.' },
  { id: 'fonseca', nombre: 'El mensaje', src: 'fonseca.webp', alt: 'Fonseca con el micrófono durante la intervención registrada en el concierto.' },
];
const raiz = `${import.meta.env.BASE_URL}media/concierto/`;

export default function GaleriaConcierto() {
  const [activa, setActiva] = useState('video');
  const pieza = piezas.find(p => p.id === activa);
  return <figure data-galeria="concierto" className="mt-6">
    <figcaption className="font-display text-2xl italic text-rosa">La campaña en el escenario</figcaption>
    <div className="mt-3 grid gap-4 md:grid-cols-12 md:items-center">
      <div className="overflow-hidden rounded-sm border border-rosa/15 bg-black md:col-span-8">
        {activa === 'video' ? <video key="video" controls playsInline preload="none" poster={`${raiz}escenario.webp`} className="aspect-video w-full object-contain md:h-[160px]" aria-label="Registro del concierto de Fonseca y el mensaje de El Viaje de la Vida" aria-describedby="registro-mensaje">
          <source src={`${raiz}mensaje-fonseca.mp4`} type="video/mp4" />Tu navegador no puede reproducir el video.
        </video> : <img src={`${raiz}${pieza.src}`} alt={pieza.alt} className="aspect-video w-full object-contain md:h-[160px]" loading="lazy" />}
      </div>
      <div className="md:col-span-4">
        <p data-asistencia className="font-display text-3xl text-marfil">{registroConcierto.asistentes.expresion}</p>
        <p className="mt-1 text-xs text-bruma">{registroConcierto.asistentes.fuente}</p>
        <p id="registro-mensaje" className="mt-3 text-sm text-bruma">{registroConcierto.alcance}</p>
        <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Contenido del concierto">{piezas.map(p => <button key={p.id} type="button" aria-pressed={activa === p.id} aria-label={p.nombre} onClick={() => setActiva(p.id)} className={`min-h-[44px] rounded-full border px-2 text-[11px] ${activa === p.id ? 'border-rosa bg-rosa/10 text-rosa' : 'border-rosa/25 text-bruma'}`}>{p.id === 'video' ? 'Video' : p.id === 'escenario' ? 'Escenario' : 'Mensaje'}</button>)}</div>
      </div>
    </div>
    <details className="mt-3 border-t border-rosa/15 pt-2">
      <summary className="min-h-[44px] cursor-pointer text-sm text-rosa">Consultar publicaciones de la iniciativa</summary>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{publicaciones.map(([nombre,url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-sm text-rosa underline underline-offset-4">Ver publicación original · {nombre}</a>)}</div>
    </details>
  </figure>;
}
