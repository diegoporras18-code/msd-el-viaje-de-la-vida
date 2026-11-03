import Scene, { ExploreLink } from '../components/Scene.jsx';
import GaleriaConcierto from '../components/GaleriaConcierto.jsx';
import TarjetasSentimientoConcierto from '../components/TarjetasSentimientoConcierto.jsx';
import ResultadosBesame from '../components/ResultadosBesame.jsx';
import { resultadosCampana } from '../content/resultados-campana.js';
export default function Impacto() {
  return (
    <section
      id="impacto"
      aria-labelledby="impacto-titulo"
      className="relative scroll-mt-16"
    >
      <div className="shell mx-auto max-w-[1440px] pb-6 pt-12">
        <Scene
          tituloId="impacto-titulo"
          tituloAs="h2"
          index="03"
          kicker="Impacto de la campaña · Desde el 24 de octubre de 2026"
          titulo={{
            linea1: 'El cuidado tomó el escenario.',
            linea2: 'El mensaje siguió en digital.',
          }}
          cta={
            <ExploreLink tab="impacto">
              Ver los resultados de la campaña
            </ExploreLink>
          }
        >
          <p className="max-w-3xl text-base leading-relaxed text-marfil">
            El Viaje de la Vida llevó la conversación sobre cáncer de mama al
            concierto de Fonseca. Ante más de 30.000 asistentes reportados, el
            artista invitó a revisarse a tiempo. Bésame amplificó ese mensaje en
            Facebook e Instagram. El perfil de audiencia mostrado en el panel de
            Facebook presenta una mayoría de mujeres y una fuerte presencia en
            Colombia.
          </p>
          <GaleriaConcierto />
          <ResultadosBesame />
          <div
            data-referencias-combinadas
            className="mt-7 border-l-2 border-fucsia pl-4"
          >
            <p className="eyebrow text-rosa">
              Conversación identificada alrededor de la iniciativa
            </p>
            <p className="mt-2 font-display text-3xl text-marfil">
              <span className="num">{resultadosCampana.referencias}</span>{' '}
              referencias recopiladas
            </p>
            <p
              data-nota-medicion
              className="mt-2 max-w-3xl text-xs text-bruma/70"
            >
              Recopilación asociada al evento con distinta cobertura; no es un
              conteo certificado de publicaciones únicas fechadas el 24.
            </p>
          </div>
          <TarjetasSentimientoConcierto />
        </Scene>
      </div>
    </section>
  );
}
