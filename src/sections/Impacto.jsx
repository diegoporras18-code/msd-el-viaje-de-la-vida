import Scene, { ExploreLink } from '../components/Scene.jsx';
import GaleriaConcierto from '../components/GaleriaConcierto.jsx';
import UniversosConcierto from '../components/UniversosConcierto.jsx';
import { balanceConcierto } from '../content/balance-concierto.js';

/** Un indicador, una lectura ejecutiva y contenidos originales; detalle en Explorar. */
export default function Impacto() {
  return <section id="impacto" aria-labelledby="impacto-titulo" className="relative scroll-mt-16">
    <div className="shell mx-auto max-w-[1440px] pb-6 pt-12">
      <Scene tituloId="impacto-titulo" tituloAs="h2" index="04.1" kicker="24 DE OCTUBRE DE 2026 · CONCIERTO DE FONSECA" titulo={{ linea1: 'Una experiencia para conectar.', linea2: 'Una conversación por amplificar.' }} cta={<ExploreLink tab="impacto">Explorar la conversación</ExploreLink>}>
        <UniversosConcierto />
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-marfil">{balanceConcierto.resultado} {balanceConcierto.lectura}</p>
        <GaleriaConcierto />
        <div data-voces-medios className="mt-5 grid gap-4 border-t border-rosa/15 pt-4 sm:grid-cols-2">
          {balanceConcierto.voces.map(v => <div key={v.id}>
            <p className="eyebrow text-rosa">{v.rol}</p>
            <h4 className="mt-1 font-display text-xl italic text-marfil">{v.nombre}</h4>
            <p className="mt-1 text-sm text-bruma">{v.texto}</p>
            <div className="flex flex-wrap gap-x-4">{[v.fuente, v.otraFuente].filter(Boolean).map(f => <a key={f.url} className="inline-flex min-h-[44px] items-center text-xs text-rosa underline underline-offset-4" href={f.local ? `${import.meta.env.BASE_URL}${f.url}` : f.url} target="_blank" rel="noopener noreferrer">{f.nombre}</a>)}</div>
          </div>)}
        </div>
        <details className="mt-4 border-t border-rosa/15 pt-3">
          <summary className="min-h-[44px] cursor-pointer font-display text-xl italic text-rosa">El objetivo de campaña: balance y siguiente paso</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <p className="text-sm text-bruma"><span className="text-marfil">Creadores. </span>{balanceConcierto.creadores}</p>
            <p className="text-sm text-bruma"><span className="text-marfil">Prensa. </span>{balanceConcierto.prensa}</p>
            <p className="text-sm text-bruma"><span className="text-rosa">Oportunidad para MSD. </span>{balanceConcierto.recomendacion}</p>
          </div>
        </details>
        <p data-nota-medicion className="mt-5 max-w-3xl text-xs text-bruma/70">Nota de medición: las referencias consolidan registros de distinta cobertura; no equivalen a menciones temáticas únicas de SentiOne fechadas el 24 ni permiten atribuir un efecto causal al concierto.</p>
      </Scene>
    </div>
  </section>;
}
