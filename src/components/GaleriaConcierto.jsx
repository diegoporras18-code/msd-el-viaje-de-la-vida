import { registroConcierto } from '../content/registro-concierto.js';

const raiz = `${import.meta.env.BASE_URL}media/concierto/`;

export default function GaleriaConcierto() {
  return <figure data-galeria="concierto" className="mt-6">
    <figcaption className="font-display text-2xl italic text-rosa">La campaña en el escenario</figcaption>
    <div className="mt-3 grid gap-4 md:grid-cols-12 md:items-center">
      <div className="overflow-hidden rounded-sm border border-rosa/15 bg-black md:col-span-8">
        <video controls playsInline preload="none" width="848" height="480" poster={`${raiz}escenario.webp`} className="block h-auto w-full object-contain" aria-label="Registro del concierto de Fonseca y el mensaje de El Viaje de la Vida" aria-describedby="registro-mensaje">
          <source src={`${raiz}mensaje-fonseca.mp4`} type="video/mp4" />Tu navegador no puede reproducir el video.
        </video>
      </div>
      <div className="md:col-span-4">
        <p data-asistencia className="font-display text-3xl text-marfil">{registroConcierto.asistentes.expresion}</p>
        <p className="mt-1 text-xs text-bruma">{registroConcierto.asistentes.fuente}</p>
        <p id="registro-mensaje" className="mt-3 text-sm text-bruma">{registroConcierto.alcance}</p>

      </div>
    </div>

  </figure>;
}
