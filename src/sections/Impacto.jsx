import ChapterOpener from '../components/ChapterOpener.jsx';
import ImpactDashboard from '../dashboards/ImpactDashboard.jsx';
import { impacto } from '../content/impacto.js';
import { todayBogota } from '../lib/data/dates.js';
import { EVENTO } from '../config/periodos.js';

export default function Impacto() {
  const { capitulo, titulo, entradilla, estadoAntes, estadoDespues } = impacto;
  const antesDelEvento = todayBogota() < EVENTO.fecha;
  return (
    <section id="impacto" aria-labelledby="impacto-titulo" className="relative">
      <ChapterOpener capitulo={capitulo} titulo={titulo} entradilla={entradilla} estado={antesDelEvento ? estadoAntes : estadoDespues} tituloId="impacto-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-28">
        <ImpactDashboard />
      </div>
    </section>
  );
}
