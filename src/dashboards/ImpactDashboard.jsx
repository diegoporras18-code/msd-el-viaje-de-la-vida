import VocesAudiencia from '../components/VocesAudiencia.jsx';
import ResultadosBesame from '../components/ResultadosBesame.jsx';
import TarjetasSentimientoConcierto from '../components/TarjetasSentimientoConcierto.jsx';
import { resultadosCampana } from '../content/resultados-campana.js';
export default function ImpactDashboard() {
  return (
    <div className="space-y-8">
      <p className="max-w-3xl text-marfil">
        La activación llevó el mensaje de cuidado al concierto de Fonseca y
        continuó con las publicaciones de Bésame. Estos resultados describen la
        campaña desde el 24 de octubre.
      </p>
      <ResultadosBesame />
      <div
        data-referencias-combinadas
        className="border-l-2 border-fucsia pl-4"
      >
        <p className="eyebrow text-rosa">
          Referencias reunidas para la lectura de la iniciativa
        </p>
        <p className="display num mt-2 text-rosa text-5xl">
          {resultadosCampana.referencias}
        </p>
        <p className="mt-2 text-xs text-bruma">
          Recopilación asociada al evento; no es un conteo certificado de
          publicaciones únicas fechadas el 24.
        </p>
      </div>
      <TarjetasSentimientoConcierto />
          <VocesAudiencia />
    </div>
  );
}
