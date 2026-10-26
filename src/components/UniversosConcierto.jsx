import { useResultados } from '../state/DataContext.jsx';
import { resumenImpacto } from '../lib/data/impacto.js';
import { vistaCampana, estadoComplementarias } from '../lib/data/campana-resultados.js';
import { formatNumber, formatPct } from '../lib/format.js';

export default function UniversosConcierto() {
  const res = useResultados();
  const causa = resumenImpacto(res);
  const c = vistaCampana(res);
  const valor = n => n == null ? 'Medición pendiente' : formatNumber(n);
  const cards = [
    { id: 'causa', titulo: '1 · Cáncer de mama', cifra: causa.durante ? valor(causa.durante.total) : 'Pendiente', texto: 'Menciones temáticas del 24. Incluyen conversación ajena a MSD y al concierto.' },
    { id: 'campana', titulo: '2 · Campaña y concierto', cifra: res.campana?.complementarias?.editoriales ? valor(res.campana.complementarias.editoriales) : c.disponible ? valor(c.confirmadas) : 'Pendiente', texto: 'Publicaciones identificadas de la campaña. No equivalen a publicaciones únicas del 24: las fechas y la deduplicación se verifican por separado.' },

  ];
  return <div>
    <div className="grid gap-4 sm:grid-cols-2">{cards.map(x => <div key={x.id} data-universo={x.id} className="rounded-sm border border-rosa/20 p-4">
      <h4 className="eyebrow text-rosa">{x.titulo}</h4><p className="display num mt-3 text-[length:var(--step-2)] text-marfil">{x.cifra}</p><p className="mt-3 text-sm text-bruma">{x.texto}</p>
    </div>)}</div>
    <p className="mt-4 text-sm text-bruma">La cifra temática corresponde al 24; las referencias editoriales abarcan la campaña sin asignación temporal automática. No se suman. La cobertura disponible todavía no equivale a toda la actividad digital del evento.</p>
    <p className="mt-2 text-sm text-bruma">{c.pico === 'no_comparable' || !c.disponible ? 'No hay una línea base completa de la propia campaña para evaluar si tuvo un pico.' : c.pico === 'aumento_en_archivo' ? 'En el archivo auditado aumenta el volumen confirmado de campaña frente a su propia línea base; no demuestra un efecto causal.' : 'En el archivo auditado no aumenta el volumen confirmado de campaña frente a su propia línea base; la cobertura sigue siendo parcial.'}</p>
    <p className="mt-2 text-xs text-bruma/80">{estadoComplementarias(res)} Las referencias públicas de contexto se mantienen separadas de estas métricas.</p>
  </div>;
}
