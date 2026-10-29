import { useResultados } from '../state/DataContext.jsx';
import ChartFrame from '../components/charts/ChartFrame.jsx';
import TimeChart from '../components/charts/TimeChart.jsx';
import UniversosConcierto from '../components/UniversosConcierto.jsx';
import Highlights from './Highlights.jsx';
import { serieConAporteEditorial } from '../lib/data/resultados.js';
import { balanceConcierto } from '../content/balance-concierto.js';
import { EVENTO } from '../config/periodos.js';

/** Lectura del evento. Las métricas temáticas se conservan en la base de escucha. */
export default function ImpactDashboard() {
  const res = useResultados();
  const visual = serieConAporteEditorial(res, { desde: '2026-10-17', hasta: '2026-10-31', segmento: 'relevantes' });
  return <div className="space-y-10">
    <UniversosConcierto />
    <p className="max-w-3xl text-marfil">{balanceConcierto.resultado} {balanceConcierto.lectura}</p>
    <ChartFrame titulo="La conversación alrededor del concierto" subtitulo="17 al 31 de octubre" notas={['El 24 destaca las 28 referencias del evento. Los demás días muestran la serie temática; este indicador no se utiliza para calcular una variación diaria ni cambia los KPIs temáticos.']}>
      <TimeChart series={[{ id: 'evento', nombre: 'Conversación identificada', color: '#F4A6C4', puntos: visual.puntos }]} apilados={visual.apilados} marcadores={[{ d: EVENTO.fecha, etiqueta: '24 OCT · CONCIERTO DE FONSECA', destacado: true }]} unidad="menciones temáticas" descripcion="Conversación del 17 al 31 de octubre; el 24 presenta 28 referencias del concierto." alto={240} />
    </ChartFrame>
    <ChartFrame titulo="Publicaciones de la iniciativa" subtitulo="El mensaje de prevención en las redes de Bésame Radio">
      <Highlights desde="2026-10-24" hasta="2026-10-31" />
    </ChartFrame>
  </div>;
}
