import Scene, { ExploreLink } from '../components/Scene.jsx';
import GaleriaConcierto from '../components/GaleriaConcierto.jsx';
import UniversosConcierto from '../components/UniversosConcierto.jsx';
import { impacto } from '../content/impacto.js';

/** Un indicador, una lectura ejecutiva y contenidos originales; detalle en Explorar. */
export default function Impacto() {
  return <section id="impacto" aria-labelledby="impacto-titulo" className="relative scroll-mt-16">
    <div className="shell mx-auto max-w-[1440px] pb-6 pt-12">
      <Scene tituloId="impacto-titulo" tituloAs="h2" index="04.1" kicker="24 DE OCTUBRE DE 2026 · CONCIERTO DE FONSECA" titulo={{ linea1: 'Una experiencia para conectar.', linea2: 'Una conversación por amplificar.' }} cta={<ExploreLink tab="impacto">Explorar la conversación</ExploreLink>}>
        <UniversosConcierto />
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-marfil">La iniciativa reúne actividad digital identificada alrededor del concierto de Fonseca. Para MSD, la oportunidad es dar continuidad a ese momento: conectar la experiencia con contenidos compartibles, participación y concientización sobre cáncer de mama.</p>
        <GaleriaConcierto />
        <details className="mt-6 border-t border-rosa/15 pt-4">
          <summary className="min-h-[44px] cursor-pointer font-display text-xl italic text-rosa">Cómo amplificar próximas experiencias</summary>
          <div className="mt-4 grid gap-5 md:grid-cols-3">{impacto.oportunidades.map(o => <div key={o.momento}>
            <p className="eyebrow text-fucsia">{o.momento}</p><h4 className="mt-2 font-display text-xl italic text-marfil">{o.titulo}</h4><p className="mt-2 text-sm text-bruma">{o.texto}</p>
          </div>)}</div>
        </details>
        <p data-nota-medicion className="mt-5 max-w-3xl text-xs text-bruma/70">Nota de medición: las referencias consolidan registros de distinta cobertura; no equivalen a menciones temáticas únicas de SentiOne fechadas el 24 ni permiten atribuir un efecto causal al concierto.</p>
      </Scene>
    </div>
  </section>;
}
