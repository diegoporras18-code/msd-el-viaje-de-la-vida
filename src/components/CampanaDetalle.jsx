import { useResultados } from '../state/DataContext.jsx';
import ChartFrame from './charts/ChartFrame.jsx';
import BarList from './charts/BarList.jsx';
import TimeChart from './charts/TimeChart.jsx';
import { nombrePlataforma } from '../config/clasificacion.js';

const NOMBRES = { post: 'Publicaciones', tweet: 'Publicaciones en X', 'quote tweet': 'Citas en X', video: 'Videos', reels: 'Reels', article: 'Artículos', sin_tipo: 'Sin formato', asistente: 'Asistentes', organizador: 'Organizadores', aliado: 'Aliados', artista: 'Artista', medio: 'Medios', tercero: 'Terceros', indeterminado: 'Sin rol verificable', sentione: 'Solo SentiOne', complementaria: 'Recopilación de campaña', ambas_capturas: 'Ambas capturas · una publicación', experiencia: 'Experiencia', convocatoria: 'Convocatoria', concientizacion: 'Concientización', amplificacion: 'Amplificación', informacion_evento: 'Información del evento', otro: 'Otros temas' };
const items = (dim, plataforma = false) => !dim ? [] : [
  ...Object.entries(dim.v ?? {}).map(([id, v]) => ({ id, nombre: plataforma ? nombrePlataforma(id) : NOMBRES[id] ?? id, v })),
  ...(dim.otras ? [{ id: 'agrupadas', nombre: 'Categorías agrupadas por privacidad', v: dim.otras.n }] : []),
];
export default function CampanaDetalle() {
  const res = useResultados();
  const cp = res.campana;
  const p = cp?.periodos.find(p => p.id === 'durante');
  const dims = p?.detalle;
  const haySerie = cp?.diario.some(d => d.confirmadas > 0);
  return <div className="space-y-6">
    <p className="eyebrow text-rosa">Detalle de campaña confirmada · día del concierto</p>
    {!dims && <p className="max-w-3xl text-sm text-bruma">No hay grupos confirmados suficientes para publicar plataformas, formatos, roles, fuentes o temáticas del evento. Los indicios pendientes no forman parte de estos desgloses.</p>}
    {dims && <div className="grid gap-8 md:grid-cols-2">{[['plataformas','Plataformas'],['formatos','Formatos'],['vinculos','Vínculo con el evento'],['fuentes','Procedencia de captura'],['temas','Temáticas de campaña']].map(([id, nombre]) => <ChartFrame key={id} titulo={nombre} notas={['Solo publicaciones confirmadas. Categorías pequeñas agrupadas o suprimidas. Las fuentes se cuentan una vez: «ambas» no duplica publicaciones.']}>
      <BarList items={items(dims[id], id === 'plataformas')} total={p.confirmadas} unidad="publicaciones confirmadas" />
    </ChartFrame>)}</div>}
    {haySerie ? <ChartFrame titulo="Evolución de la campaña confirmada" notas={['Un día sin evaluación completa del archivo o con cifra protegida aparece vacío. La captura sigue siendo parcial y no prueba exhaustividad.']}>
      <TimeChart series={[{ id: 'campana', nombre: 'Campaña confirmada', color: '#E2457F', puntos: cp.diario.map(d => ({ d: d.d, v: d.confirmadas })) }]} unidad="publicaciones confirmadas" descripcion="Evolución de publicaciones confirmadas de campaña, separada de la conversación temática." alto={220} />
    </ChartFrame> : <p className="text-sm text-bruma">La serie de campaña no dispone de actividad confirmada suficiente para una comparación antes/durante/después. No se sustituye por la curva general de cáncer de mama.</p>}
  </div>;
}
