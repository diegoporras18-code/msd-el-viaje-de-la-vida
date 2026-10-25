import { useResultados } from '../state/DataContext.jsx';
import { resumenImpacto } from '../lib/data/impacto.js';
import { vistaCampana, estadoComplementarias } from '../lib/data/campana-resultados.js';
import { formatNumber, formatPct } from '../lib/format.js';

export default function UniversosConcierto() {
  const res = useResultados();
  const causa = resumenImpacto(res);
  const c = vistaCampana(res);
  const valor = n => n == null ? 'Protegido' : formatNumber(n);
  const cards = [
    { id: 'causa', titulo: '1 · Cáncer de mama', cifra: causa.durante ? valor(causa.durante.total) : 'Pendiente', texto: 'Menciones temáticas del 24. Incluyen conversación ajena a MSD y al concierto.' },
    { id: 'campana', titulo: '2 · Campaña y concierto', cifra: c.disponible ? valor(c.confirmadas) : 'Pendiente', texto: 'Publicaciones confirmadas del evento en la captura auditada del 24, aunque no mencionen la enfermedad.' },
    { id: 'ambos', titulo: '3 · Campaña y causa', cifra: c.disponible ? valor(c.ambos) : 'Pendiente', texto: c.porcentajeCausa == null ? 'No hay una proporción publicable del mensaje de la causa dentro de la campaña.' : `${formatPct(c.porcentajeCausa)} de las publicaciones confirmadas del evento también hablan explícitamente de la causa.` },
  ];
  return <div>
    <div className="grid gap-4 sm:grid-cols-3">{cards.map(x => <div key={x.id} data-universo={x.id} className="rounded-sm border border-rosa/20 p-4">
      <h4 className="eyebrow text-rosa">{x.titulo}</h4><p className="display num mt-3 text-[length:var(--step-2)] text-marfil">{x.cifra}</p><p className="mt-3 text-sm text-bruma">{x.texto}</p>
    </div>)}</div>
    <p className="mt-4 text-sm text-bruma">Son conjuntos que se solapan: no se suman. La captura y la auditoría de campaña son parciales. Cero confirmaciones en lo auditado no demuestra ausencia de conversación del evento.</p>
    <p className="mt-2 text-sm text-bruma">{c.pico === 'no_comparable' || !c.disponible ? 'No hay una línea base completa de la propia campaña para evaluar si tuvo un pico.' : c.pico === 'aumento_en_archivo' ? 'En el archivo auditado aumenta el volumen confirmado de campaña frente a su propia línea base; no demuestra un efecto causal.' : 'En el archivo auditado no aumenta el volumen confirmado de campaña frente a su propia línea base; la cobertura sigue siendo parcial.'}</p>
    <p className="mt-2 text-xs text-bruma/80">{estadoComplementarias(res)} Las referencias públicas de contexto se mantienen separadas de estas métricas.</p>
  </div>;
}
